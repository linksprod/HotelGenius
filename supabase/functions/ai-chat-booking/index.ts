import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, userName, roomNumber, conversationId, hotelId } = await req.json();
    
    console.log('AI Chat Request:', { message, userId, userName, roomNumber, conversationId, hotelId });

    if (!message || !userId || !hotelId) {
      return new Response(JSON.stringify({ error: 'Missing required fields (message, userId, hotelId)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await sendChatMessage(message, userId, userName, roomNumber, hotelId, conversationId);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Sorry, I encountered an error. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendChatMessage(message: string, userId: string, userName: string, roomNumber: string, hotelId: string, conversationId?: string) {
  // 1. Get Hotel Knowledge (RAG)
  // First, generate embedding for the search query
  const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: message,
    }),
  });
  
  const embeddingData = await embeddingResponse.json();
  const embedding = embeddingData.data[0].embedding;

  // Perform similarity search on hotel_knowledge
  const { data: knowledgeDocs } = await supabase.rpc('match_hotel_knowledge', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 5,
    p_hotel_id: hotelId
  });

  // 2. Get real-time hotel data for AI context (filtered by hotelId)
  const [restaurants, spaServices, events, hotelInfo] = await Promise.all([
    supabase.from('restaurants').select('*').eq('hotel_id', hotelId).eq('status', 'open'),
    supabase.from('spa_services').select('*, spa_facilities(*)').eq('hotel_id', hotelId).eq('status', 'available'),
    supabase.from('events').select('*').eq('hotel_id', hotelId).gte('date', new Date().toISOString().split('T')[0]),
    supabase.from('hotel_about').select('*').eq('hotel_id', hotelId).eq('status', 'active').single()
  ]);

  const knowledgeContext = knowledgeDocs?.map((doc: any) => doc.content).join('\n\n') || '';

  const systemPrompt = `You are a helpful hotel concierge AI assistant for ${hotelInfo.data?.title || 'this hotel'}. 
You have access to the following exclusive hotel knowledge:
${knowledgeContext}

You can also help guests with:
- Information about hotel facilities, restaurants, spa services, and events
- Making reservations for restaurants, spa services, and events
- General hotel information and policies

Current guest: ${userName} in room ${roomNumber}
Hotel ID: ${hotelId}

Available restaurants: ${JSON.stringify(restaurants.data)}
Available spa services: ${JSON.stringify(spaServices.data)}
Upcoming events: ${JSON.stringify(events.data)}

IMPORTANT BOOKING RULES:
- Only offer services actually available in the lists above.
- NEVER call a booking function unless you have ALL required information.
- Use today's date as reference: ${new Date().toISOString().split('T')[0]}
- When booking, use the IDs provided in the data above.

Be friendly, professional, and proactive. Use the provided "Exclusive hotel knowledge" to answer specific questions about hotel history, policies, or unique services not listed in the structured data.`;

  const tools = [
    {
      type: "function",
      name: "book_restaurant",
      description: "Book a table at a restaurant",
      parameters: {
        type: "object",
        properties: {
          restaurant_id: { type: "string" },
          date: { type: "string", format: "date" },
          time: { type: "string" },
          guests: { type: "number" },
          special_requests: { type: "string" }
        },
        required: ["restaurant_id", "date", "time", "guests"]
      }
    },
    {
      type: "function",
      name: "book_spa_service",
      description: "Book a spa service",
      parameters: {
        type: "object",
        properties: {
          service_id: { type: "string" },
          date: { type: "string", format: "date" },
          time: { type: "string" },
          special_requests: { type: "string" }
        },
        required: ["service_id", "date", "time"]
      }
    },
    {
      type: "function",
      name: "book_event",
      description: "Register for an event",
      parameters: {
        type: "object",
        properties: {
          event_id: { type: "string" },
          date: { type: "string", format: "date" },
          guests: { type: "number" },
          special_requests: { type: "string" }
        },
        required: ["event_id", "date", "guests"]
      }
    },
    {
      type: "function",
      name: "create_service_request",
      description: "Create a general service request",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string" },
          description: { type: "string" }
        },
        required: ["type", "description"]
      }
    }
  ];

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1000
    }),
  });

  const data = await openaiResponse.json();
  let aiResponse = data.choices[0].message.content;

  if (data.choices[0].message.tool_calls) {
    const toolCall = data.choices[0].message.tool_calls[0];
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);
    
    let bookingResult;
    switch (functionName) {
      case 'book_restaurant':
        bookingResult = await bookRestaurant(functionArgs, userId, userName, roomNumber, hotelId);
        break;
      case 'book_spa_service':
        bookingResult = await bookSpaService(functionArgs, userId, userName, roomNumber, hotelId);
        break;
      case 'book_event':
        bookingResult = await bookEvent(functionArgs, userId, userName, roomNumber, hotelId);
        break;
      case 'create_service_request':
        bookingResult = await createServiceRequest(functionArgs, userId, userName, roomNumber, hotelId);
        break;
      default:
        bookingResult = { success: false, message: 'Unknown function' };
    }

    const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
          { role: 'assistant', content: data.choices[0].message.content, tool_calls: data.choices[0].message.tool_calls },
          { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(bookingResult) }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const followUpData = await followUpResponse.json();
    aiResponse = followUpData.choices[0].message.content;
  }

  if (conversationId) {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_type: 'ai',
      sender_name: 'AI Assistant',
      content: aiResponse,
      message_type: 'text',
      hotel_id: hotelId
    });
  }

  return { response: aiResponse };
}

async function bookRestaurant(args: any, userId: string, userName: string, roomNumber: string, hotelId: string) {
  try {
    const { data, error } = await supabase.from('table_reservations').insert({
      restaurant_id: args.restaurant_id,
      user_id: userId,
      date: args.date,
      time: args.time,
      guests: args.guests,
      guest_name: userName,
      room_number: roomNumber,
      special_requests: args.special_requests || null,
      status: 'confirmed',
      hotel_id: hotelId
    }).select().single();
    if (error) throw error;
    return { success: true, message: `Reservation confirmed for ${args.date} at ${args.time}`, reservation_id: data.id };
  } catch (error) {
    return { success: false, message: `Failed to book: ${error.message}` };
  }
}

async function bookSpaService(args: any, userId: string, userName: string, roomNumber: string, hotelId: string) {
  try {
    const { data, error } = await supabase.from('spa_bookings').insert({
      service_id: args.service_id,
      user_id: userId,
      date: args.date,
      time: args.time,
      guest_name: userName,
      guest_email: '', 
      room_number: roomNumber,
      special_requests: args.special_requests || null,
      status: 'confirmed',
      hotel_id: hotelId
    }).select().single();
    if (error) throw error;
    return { success: true, message: `Spa booking confirmed for ${args.date} at ${args.time}`, booking_id: data.id };
  } catch (error) {
    return { success: false, message: `Failed to book: ${error.message}` };
  }
}

async function bookEvent(args: any, userId: string, userName: string, roomNumber: string, hotelId: string) {
  try {
    const { data, error } = await supabase.from('event_reservations').insert({
      event_id: args.event_id,
      user_id: userId,
      date: args.date,
      guests: args.guests,
      guest_name: userName,
      room_number: roomNumber,
      special_requests: args.special_requests || null,
      status: 'confirmed',
      hotel_id: hotelId
    }).select().single();
    if (error) throw error;
    return { success: true, message: `Event registration confirmed for ${args.date}`, reservation_id: data.id };
  } catch (error) {
    return { success: false, message: `Failed to book: ${error.message}` };
  }
}

async function createServiceRequest(args: any, userId: string, userName: string, roomNumber: string, hotelId: string) {
  try {
    const { data, error } = await supabase.from('service_requests').insert({
      guest_id: userId,
      room_id: roomNumber,
      type: args.type,
      description: args.description,
      guest_name: userName,
      room_number: roomNumber,
      status: 'pending',
      hotel_id: hotelId
    }).select().single();
    if (error) throw error;
    return { success: true, message: `Service request created`, request_id: data.id };
  } catch (error) {
    return { success: false, message: `Failed to create request: ${error.message}` };
  }
}