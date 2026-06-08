import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const deepSeekApiKey = Deno.env.get("DEEPSEEK_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EXTRACTION_PROMPT = `You are an expert hotel content analyst. Extract structured hotel information from the provided text and return a valid JSON object.

Return ONLY a raw JSON object (no markdown, no code blocks) with this exact structure:

{
  "about": {
    "confidence": 0.95,
    "name": "string or null",
    "tagline": "string or null",
    "description": "string or null",
    "address": "string or null",
    "phone": "string or null",
    "email": "string or null",
    "checkIn": "string or null (e.g. 14:00)",
    "checkOut": "string or null (e.g. 12:00)",
    "starRating": "number or null",
    "amenities": ["array of strings"]
  },
  "rooms": {
    "confidence": 0.85,
    "items": [
      {
        "name": "string",
        "type": "string or null",
        "description": "string or null",
        "amenities": ["array of strings"],
        "maxGuests": "number or null",
        "priceEstimate": "string or null (e.g. From $250/night)"
      }
    ]
  },
  "restaurants": {
    "confidence": 0.80,
    "items": [
      {
        "name": "string",
        "cuisine": "string or null",
        "description": "string or null",
        "hours": "string or null",
        "priceRange": "string or null (e.g. $$$)",
        "dressCode": "string or null"
      }
    ]
  },
  "spa": {
    "confidence": 0.75,
    "description": "string or null",
    "hours": "string or null",
    "treatments": [
      {
        "name": "string",
        "description": "string or null",
        "duration": "string or null",
        "price": "string or null"
      }
    ]
  },
  "activities": {
    "confidence": 0.70,
    "items": [
      {
        "name": "string",
        "description": "string or null",
        "duration": "string or null",
        "price": "string or null"
      }
    ]
  },
  "policies": {
    "confidence": 0.90,
    "items": [
      {
        "title": "string",
        "content": "string"
      }
    ]
  },
  "faqs": {
    "confidence": 0.85,
    "items": [
      {
        "question": "string",
        "answer": "string"
      }
    ]
  }
}

STRICT RULES — violation of any rule is unacceptable:
1. confidence is a float from 0.0 to 1.0 — how much real data you found for that section.
2. If a section has no relevant data, set confidence to 0 and return empty arrays/null values.
3. Extract ALL rooms, restaurants, treatments, and activities you find — only those explicitly mentioned.
4. Preserve exact pricing, hours, descriptions WORD-FOR-WORD from the source text.
5. NEVER invent, guess, or fabricate ANY value. If a field is not explicitly stated in the text, set it to null — not a placeholder, not a generic value, not a typical example.
6. NEVER use generic placeholders such as: "International", "Main Building", "07:00 AM - 11:00 PM", "From $150/night", "Deluxe", "Luxury Spa & Wellness", or similar invented defaults.
7. Only include items (rooms, restaurants, treatments) that are explicitly named in the text. Do not infer or assume items exist.
8. If you are unsure about a value, set it to null. A null is always correct; an invented value is always wrong.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      hotelId,
      sessionId,
      rawText,
      sourceType = "pdf",
      sourceName = "document",
    } = await req.json();

    if (!hotelId || !rawText) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: hotelId, rawText" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[ai-content-import] Starting extraction for hotel: ${hotelId}`);

    // Update session status to extracting
    if (sessionId) {
      await supabase
        .from("hotel_setup_sessions")
        .update({ status: "extracting", progress_percent: 20 })
        .eq("id", sessionId);
    }

    // Truncate text to fit within GPT-4o context (roughly 100k chars)
    const truncatedText = rawText.slice(0, 80000);

    // Call DeepSeek API with streaming to prevent Supabase proxy timeouts!
    const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deepSeekApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          {
            role: "user",
            content: `Extract hotel information from this text:\n\n${truncatedText}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`DeepSeek API failed: ${errText}`);
    }

    const aiData = await aiResponse.json();
    
    if (aiData.error) {
      throw new Error(`DeepSeek error: ${aiData.error.message}`);
    }

    const rawContent = aiData.choices[0]?.message?.content;
    if (!rawContent) throw new Error("No content returned from DeepSeek");

    let draft: Record<string, unknown>;
    try {
      const cleanContent = rawContent.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      draft = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("[ai-content-import] Parse error:", parseError, "Raw content:", rawContent);
      throw new Error("Failed to parse DeepSeek JSON response. The model may have returned invalid format.");
    }

    // Update session with AI draft
    if (sessionId) {
      await supabase
        .from("hotel_setup_sessions")
        .update({
          status: "reviewing",
          ai_draft: draft,
          progress_percent: 80,
        })
        .eq("id", sessionId);
    }

    // Also store content in hotel_knowledge for the AI Concierge
    try {
      const knowledgeChunks = chunkText(rawText, 1000, 200);
      for (const chunk of knowledgeChunks.slice(0, 20)) {
        await supabase.from("hotel_knowledge").insert({
          hotel_id: hotelId,
          content: chunk,
          source_type: sourceType,
          source_name: sourceName,
          metadata: { imported_via: "ai-setup" },
        });
      }
    } catch (knowledgeError) {
      console.warn("[ai-content-import] Failed to save knowledge chunks:", knowledgeError);
    }

    console.log(`[ai-content-import] Extraction complete for hotel: ${hotelId}`);

    return new Response(
      JSON.stringify({
        success: true,
        draft,
        tokensUsed: aiData.usage?.total_tokens ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ai-content-import] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Extraction failed",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start += size - overlap;
  }
  return chunks;
}
