import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotelId, content, sourceName, sourceType, metadata = {} } = await req.json();

    if (!hotelId || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields (hotelId, content)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing knowledge for hotel: ${hotelId}, source: ${sourceName}`);

    // 1. Chunking the content (simple character-based chunking for now)
    const chunks = chunkText(content, 1000, 200);
    
    // 2. Process each chunk
    const results = [];
    for (const chunk of chunks) {
      // Get embedding from OpenAI
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: chunk,
        }),
      });

      const embeddingData = await embeddingResponse.json();
      if (embeddingData.error) throw new Error(embeddingData.error.message);
      
      const embedding = embeddingData.data[0].embedding;

      // Store in hotel_knowledge
      const { data, error } = await supabase
        .from('hotel_knowledge')
        .insert({
          hotel_id: hotelId,
          content: chunk,
          embedding: embedding,
          source_name: sourceName,
          source_type: sourceType,
          metadata: { ...metadata, chunk_count: chunks.length }
        })
        .select('id')
        .single();

      if (error) throw error;
      results.push(data.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully processed ${chunks.length} chunks`,
      chunkIds: results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing knowledge:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process knowledge',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start += (size - overlap);
  }

  return chunks;
}
