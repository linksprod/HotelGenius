import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!deepSeekApiKey) {
  console.error('CRITICAL: DEEPSEEK_API_KEY is not set in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!deepSeekApiKey) {
      throw new Error('DeepSeek API key is missing. Please set the DEEPSEEK_API_KEY secret in your Supabase dashboard.');
    }

    const { message, userId, userName, roomNumber, conversationId, hotelId } = await req.json();

    console.log('[AI] Request received:', { userId, userName, hotelId, messageLength: message?.length });

    if (!message || !userId || !userName) {
      return new Response(JSON.stringify({ error: 'Missing required fields (message, userId, userName)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await sendChatMessage(message, userId, userName, roomNumber, conversationId, hotelId);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[AI] Fatal Error:', error.message);
    // Return 200 even on handled errors so the frontend can read the JSON body easily
    // without the Supabase client masking it as a generic "non-2xx" error.
    return new Response(JSON.stringify({
      error: 'The AI Concierge encountered a problem.',
      details: error.message,
      suggestion: error.message.includes('API key') ? 'Please ensure your OpenAI API key is configured in the Supabase Edge Function secrets.' : 'Please try again in a moment.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendChatMessage(message: string, userId: string, userName: string, roomNumber: string, conversationId?: string, hotelId?: string) {
  // Determine the effective hotel ID (fallback to demo hotel if missing)
  const effectiveHotelId = hotelId || '00000000-0000-0000-0000-000000000000';

  console.log(`[AI] Processing request for hotel: ${effectiveHotelId} (provided: ${hotelId})`);

  // Get hotel data for AI context - LIMITING FIELDS AND RECORDS TO PREVENT CONTEXT OVERFLOW
  const [restaurants, spaServices, events, hotelInfo] = await Promise.all([
    supabase.from('restaurants').select('id, name, description, cuisine, location').eq('status', 'open').eq('hotel_id', effectiveHotelId).limit(8),
    supabase.from('spa_services').select('id, name, description, duration, price').eq('status', 'available').eq('hotel_id', effectiveHotelId).limit(8),
    supabase.from('events').select('id, title, description, date, location').gte('date', new Date().toISOString().split('T')[0]).eq('hotel_id', effectiveHotelId).limit(8),
    supabase.from('hotel_about').select('title, description, location, contact_email, contact_phone').eq('status', 'active').eq('hotel_id', effectiveHotelId).limit(1)
  ]);

  const hotelData = hotelInfo.data && hotelInfo.data.length > 0 ? hotelInfo.data[0] : null;

  const truncate = (str: string, max = 200) => str?.length > max ? str.substring(0, max) + '...' : str;

  const restaurantsList = (restaurants.data || []).map(r => ({ ...r, description: truncate(r.description) }));
  const spaList = (spaServices.data || []).map(s => ({ ...s, description: truncate(s.description) }));
  const eventsList = (events.data || []).map(e => ({ ...e, description: truncate(e.description) }));

  const systemPrompt = `You are a helpful hotel concierge AI assistant for ${hotelData?.title || 'Hotel Genius'}.
You are a multi-purpose assistant. You should answer ANY questions from the guest, whether they are related to:
- Using the app and its features
- Booking restaurants, spa services, and events (you have tools for these)
- General hotel information, policies, and amenities
- Local recommendations and general concierge assistance
- ANY other requests or questions the guest may have.

If you don't have a specific tool for a request, answer to the best of your knowledge based on the hotel information provided.

Current guest: ${userName} in room ${roomNumber}

Available restaurants: ${JSON.stringify(restaurantsList)}
Available spa services: ${JSON.stringify(spaList)}
Upcoming events: ${JSON.stringify(eventsList)}
Hotel information: ${JSON.stringify(hotelData)}

IMPORTANT BOOKING RULES:
- NEVER call a booking function unless you have ALL required information (date, time, guests)
- If a guest wants to book something but hasn't provided details (date, time, guests), PROACTIVELY call 'trigger_booking_form' for that entity while asking for the missing info. This allows them to use the visual form immediately.
- Use 'show_restaurant_list' whenever someone asks about dining options generally.
- Use today's date as reference: ${new Date().toISOString().split('T')[0]}

Always be friendly, professional, and helpful. If a request is completely outside your capabilities, invite the guest to speak with a human staff member, but always try to help yourself first.`;

  const tools = [
    {
      type: "function",
      function: {
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
      }
    },
    {
      type: "function",
      function: {
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
      }
    },
    {
      type: "function",
      function: {
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
      }
    },
    {
      type: "function",
      function: {
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
    },
    {
      type: "function",
      function: {
        name: "show_restaurant_list",
        description: "Display a visual list of all available restaurants to the guest."
      }
    },
    {
      type: "function",
      function: {
        name: "trigger_booking_form",
        description: "Display a concrete reservation/booking form directly in the chat for the guest to fill out.",
        parameters: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["restaurant", "spa", "event"],
              description: "The type of form to display."
            },
            entity_id: {
              type: "string",
              description: "The ID of the specific restaurant, spa service, or event to book."
            }
          },
          required: ["type", "entity_id"]
        }
      }
    }
  ];

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${deepSeekApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
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

  // Guard against non-OK responses from OpenAI (bad key, quota exceeded, etc.)
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error('[AI] DeepSeek API error:', response.status, JSON.stringify(errorBody));
    const reason = (errorBody as any)?.error?.message || `HTTP ${response.status}`;
    throw new Error(`DeepSeek API error: ${reason}`);
  }

  const data = await response.json();
  console.log('[AI] OpenAI Response:', JSON.stringify(data).slice(0, 500));

  if (!data.choices || data.choices.length === 0) {
    console.error('[AI] No choices in DeepSeek response:', JSON.stringify(data));
    throw new Error('DeepSeek returned an empty response. Please check your API key and quota.');
  }

  let aiResponse = data.choices[0].message.content;

  if (data.choices[0].message.tool_calls) {
    // Handle function calls
    const toolCall = data.choices[0].message.tool_calls[0];
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    console.log('[AI] Function call:', functionName, functionArgs);

    let bookingResult;

    switch (functionName) {
      case 'book_restaurant':
        bookingResult = await bookRestaurant(functionArgs, userId, userName, roomNumber);
        break;
      case 'book_spa_service':
        bookingResult = await bookSpaService(functionArgs, userId, userName, roomNumber);
        break;
      case 'book_event':
        bookingResult = await bookEvent(functionArgs, userId, userName, roomNumber);
        break;
      case 'create_service_request':
        bookingResult = await createServiceRequest(functionArgs, userId, userName, roomNumber);
        break;
      case 'show_restaurant_list':
        // Insert an action message to show the list
        if (conversationId) {
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_type: 'ai',
            sender_name: 'AI Assistant',
            content: "Here are our dining options:",
            message_type: 'action',
            metadata: { action_type: 'restaurant_list' }
          });
        }
        bookingResult = { success: true, message: "Restaurant list displayed to the guest." };
        break;
      case 'trigger_booking_form':
        // Insert an action message to trigger the form
        if (conversationId) {
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_type: 'ai',
            sender_name: 'AI Assistant',
            content: `I've opened the booking form for you.`,
            message_type: 'action',
            metadata: {
              action_type: 'booking_form',
              entity_type: functionArgs.type,
              entity_id: functionArgs.entity_id
            }
          });
        }
        bookingResult = { success: true, message: `Booking form for ${functionArgs.type} displayed to the guest.` };
        break;
      default:
        bookingResult = { success: false, message: 'Unknown function' };
    }

    // Generate follow-up response based on booking result
    const followUpResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepSeekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
          { role: 'assistant', content: data.choices[0].message.content ?? null, tool_calls: data.choices[0].message.tool_calls },
          { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(bookingResult) }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!followUpResponse.ok) {
      const errBody = await followUpResponse.json().catch(() => ({}));
      console.error('[AI] DeepSeek follow-up error:', followUpResponse.status, JSON.stringify(errBody));
      throw new Error(`DeepSeek follow-up error: ${(errBody as any)?.error?.message || followUpResponse.status}`);
    }

    const followUpData = await followUpResponse.json();
    aiResponse = followUpData.choices?.[0]?.message?.content ?? 'Your request has been processed.';
  }

  // Insert AI response to the new messages table (only if conversationId is provided)
  if (conversationId) {
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'ai',
        sender_name: 'AI Assistant',
        content: aiResponse,
        message_type: 'text'
      });
  }

  return { response: aiResponse };
}

async function bookRestaurant(args: any, userId: string, userName: string, roomNumber: string) {
  try {
    // Validate required parameters
    if (!args.restaurant_id || !args.date || !args.time || !args.guests) {
      throw new Error(`Missing required booking information. Need: restaurant_id, date, time, guests. Got: ${JSON.stringify(args)}`);
    }

    const { data, error } = await supabase
      .from('table_reservations')
      .insert({
        restaurant_id: args.restaurant_id,
        user_id: userId,
        date: args.date,
        time: args.time,
        guests: args.guests,
        guest_name: userName,
        room_number: roomNumber,
        special_requests: args.special_requests || null,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Restaurant reservation confirmed for ${args.date} at ${args.time} for ${args.guests} guests`,
      reservation_id: data.id,
      details: {
        date: args.date,
        time: args.time,
        guests: args.guests
      }
    };
  } catch (error) {
    console.error('Error booking restaurant:', error);
    return {
      success: false,
      message: `Failed to book restaurant: ${error.message}`
    };
  }
}

async function bookSpaService(args: any, userId: string, userName: string, roomNumber: string) {
  try {
    // Validate required parameters
    if (!args.service_id || !args.date || !args.time) {
      throw new Error(`Missing required booking information. Need: service_id, date, time. Got: ${JSON.stringify(args)}`);
    }

    const { data, error } = await supabase
      .from('spa_bookings')
      .insert({
        service_id: args.service_id,
        user_id: userId,
        date: args.date,
        time: args.time,
        guest_name: userName,
        guest_email: '', // We'll need to get this from user profile
        room_number: roomNumber,
        special_requests: args.special_requests || null,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Spa service booking confirmed for ${args.date} at ${args.time}`,
      booking_id: data.id,
      details: {
        date: args.date,
        time: args.time
      }
    };
  } catch (error) {
    console.error('Error booking spa service:', error);
    return {
      success: false,
      message: `Failed to book spa service: ${error.message}`
    };
  }
}

async function bookEvent(args: any, userId: string, userName: string, roomNumber: string) {
  try {
    // Validate required parameters  
    if (!args.event_id || !args.date || !args.guests) {
      throw new Error(`Missing required booking information. Need: event_id, date, guests. Got: ${JSON.stringify(args)}`);
    }

    const { data, error } = await supabase
      .from('event_reservations')
      .insert({
        event_id: args.event_id,
        user_id: userId,
        date: args.date,
        guests: args.guests,
        guest_name: userName,
        room_number: roomNumber,
        special_requests: args.special_requests || null,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Event registration confirmed for ${args.date} for ${args.guests} guests`,
      reservation_id: data.id,
      details: {
        date: args.date,
        guests: args.guests
      }
    };
  } catch (error) {
    console.error('Error booking event:', error);
    return {
      success: false,
      message: `Failed to register for event: ${error.message}`
    };
  }
}

async function createServiceRequest(args: any, userId: string, userName: string, roomNumber: string) {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        guest_id: userId,
        room_id: roomNumber,
        type: args.type,
        description: args.description,
        guest_name: userName,
        room_number: roomNumber,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Service request created`,
      request_id: data.id,
      details: {
        type: args.type,
        description: args.description
      }
    };
  } catch (error) {
    console.error('Error creating service request:', error);
    return {
      success: false,
      message: `Failed to create service request: ${error.message}`
    };
  }
}