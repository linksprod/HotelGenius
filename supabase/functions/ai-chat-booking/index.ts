import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!deepSeekApiKey) {
  console.error('CRITICAL: DEEPSEEK_API_KEY is not set in environment variables');
}
if (!openAIApiKey) {
  console.error('CRITICAL: OPENAI_API_KEY is not set (required for RAG embeddings)');
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

    const { message, userId, userName, roomNumber, conversationId, hotelId, language } = await req.json();

    console.log('[AI] Request received:', { userId, userName, hotelId, messageLength: message?.length, language });

    if (!message || !userId || !userName) {
      return new Response(JSON.stringify({ error: 'Missing required fields (message, userId, userName)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await sendChatMessage(message, userId, userName, roomNumber, hotelId, conversationId, language);

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

// ─── Guest Digital Twin: structured preference snapshot injected into AI ───
interface GuestTwin {
  guest_id?: string;
  name?: string;
  language?: string;
  nationality?: string;
  room_preference?: string;
  dietary?: string;
  previous_stays?: number;
  loyalty_tier?: string;
  avg_upsell?: string[];
  last_interaction?: string;
  special_requests?: string;
  communication?: string;
}

async function fetchGuestTwin(guestId: string, hotelId: string): Promise<GuestTwin> {
  try {
    const url = `${supabaseUrl}/functions/v1/get-guest-twin?guest_id=${guestId}&hotel_id=${hotelId}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return (data.snapshot || {}) as GuestTwin;
  } catch (e) {
    console.warn('[AI] Could not fetch guest twin:', e);
    return {};
  }
}

function formatTwinForPrompt(twin: GuestTwin): string {
  if (!twin || Object.keys(twin).length === 0) {
    return 'No guest profile data available yet — treat this as a first-time guest.';
  }
  const lines = [];
  if (twin.name)            lines.push(`Name: ${twin.name}`);
  if (twin.language)        lines.push(`Preferred language: ${twin.language}`);
  if (twin.nationality)     lines.push(`Nationality: ${twin.nationality}`);
  if (twin.loyalty_tier)    lines.push(`Loyalty tier: ${twin.loyalty_tier} (${twin.previous_stays ?? 0} previous stays)`);
  if (twin.room_preference) lines.push(`Room preference: ${twin.room_preference}`);
  if (twin.dietary)         lines.push(`Dietary requirements: ${twin.dietary}`);
  if (twin.avg_upsell?.length) lines.push(`Usually books: ${twin.avg_upsell.join(', ')}`);
  if (twin.special_requests) lines.push(`Special requests history: ${twin.special_requests}`);
  if (twin.communication)   lines.push(`Communication style: ${twin.communication}`);
  if (twin.last_interaction) lines.push(`Last interaction: ${twin.last_interaction}`);
  return lines.join('\n');
}

function detectMessageLanguage(message: string, fallbackLanguage?: string): 'fr' | 'en' {
  const text = message.toLowerCase();
  
  // French markers
  const frenchMarkers = [
    'je ', 'veux', 'voudrais', 'besoin', 's\'il', 'plait', 'plaît', 'merci', 'bonjour', 
    'chambre', 'serviette', 'papier', 'manger', 'de ', 'la ', 'le ', 'les ', 'une ', 
    'un ', 'est ', 'pourquoi', 'pas', 'passe', 'avec', 'dans', 'pour', 'qui', 'que', 
    'est-ce', 'ouvert', 'reservation', 'reserver', 'réserver', 'déjeuner', 'diner', 
    'petit', 'piscine', 'spa', 'massage', 'boutique', 'lieux', 'serviettes'
  ];
  
  // English markers
  const englishMarkers = [
    'i ', 'want', 'would like', 'need', 'please', 'thanks', 'thank you', 'hello', 
    'hi ', 'room', 'towel', 'towels', 'towl', 'paper', 'eat', 'the ', 'a ', 'an ', 'is ', 'why', 'not', 
    'went', 'through', 'with', 'in ', 'for', 'who', 'that', 'what', 'open', 'booking', 
    'book', 'lunch', 'dinner', 'breakfast', 'pool', 'spa', 'massage', 'shop', 'near'
  ];
  
  let frenchScore = 0;
  let englishScore = 0;
  
  for (const marker of frenchMarkers) {
    if (text.includes(marker)) frenchScore++;
  }
  
  for (const marker of englishMarkers) {
    if (text.includes(marker)) englishScore++;
  }
  
  if (frenchScore > englishScore) return 'fr';
  if (englishScore > frenchScore) return 'en';
  
  // If scores are equal or zero, fallback to the client language or guest preference
  const fallback = (fallbackLanguage || 'en').toLowerCase();
  return fallback.startsWith('fr') ? 'fr' : 'en';
}

async function sendChatMessage(message: string, userId: string, userName: string, roomNumber: string, hotelId: string, conversationId?: string, language?: string) {
  // Determine the effective hotel ID (fallback to demo hotel if missing)
  const effectiveHotelId = hotelId || '00000000-0000-0000-0000-000000000000';
  
  console.log(`[AI] Processing request for hotel: ${effectiveHotelId}, language: ${language}`);

  // ── Phase 4: Fetch Guest Digital Twin ──────────────────────────────────────
  const guestTwin = await fetchGuestTwin(userId, effectiveHotelId);
  const guestTwinContext = formatTwinForPrompt(guestTwin);
  console.log('[AI] Guest twin loaded:', guestTwin.loyalty_tier ?? 'no tier');

  // Detect language based on the message content, fallback to client language
  const detectedLang = detectMessageLanguage(message, language || guestTwin.language || 'en');
  console.log(`[AI] Detected language for response: ${detectedLang} (client was: ${language})`);

  // 1. Get Hotel Knowledge (RAG) - Only if OpenAI key is available
  let knowledgeContext = '';
  if (openAIApiKey) {
    try {
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
      
      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Perform similarity search on hotel_knowledge
        const { data: knowledgeDocs } = await supabase.rpc('match_hotel_knowledge', {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 5,
          p_hotel_id: effectiveHotelId
        });
        
        knowledgeContext = knowledgeDocs?.map((doc: any) => doc.content).join('\n\n') || '';
      } else {
        const errorBody = await embeddingResponse.json();
        console.error('[AI] OpenAI Embedding Error:', embeddingResponse.status, JSON.stringify(errorBody));
      }
    } catch (e) {
      console.error('[AI] RAG Error:', e);
    }
  }

  // 2. Get real-time hotel data for AI context
  const [restaurants, spaServices, events, hotelInfo, hotelRecord] = await Promise.all([
    supabase.from('restaurants').select('id, name, description, cuisine, location').eq('status', 'open').eq('hotel_id', effectiveHotelId).limit(8),
    supabase.from('spa_services').select('id, name, description, duration, price').eq('status', 'available').eq('hotel_id', effectiveHotelId).limit(8),
    supabase.from('events').select('id, title, description, date, location').gte('date', new Date().toISOString().split('T')[0]).eq('hotel_id', effectiveHotelId).limit(8),
    supabase.from('hotel_about').select('title, description, location, contact_email, contact_phone').eq('status', 'active').eq('hotel_id', effectiveHotelId).limit(1),
    supabase.from('hotels').select('name').eq('id', effectiveHotelId).single()
  ]);

  const hotelData = hotelInfo.data && hotelInfo.data.length > 0 ? hotelInfo.data[0] : null;
  const hotelName = hotelRecord.data?.name || hotelData?.title || 'Our Hotel';
  const truncate = (str: string, max = 200) => str?.length > max ? str.substring(0, max) + '...' : str;

  const restaurantsList = (restaurants.data || []).map(r => ({ ...r, description: truncate(r.description) }));
  const spaList = (spaServices.data || []).map(s => ({ ...s, description: truncate(s.description) }));
  const eventsList = (events.data || []).map(e => ({ ...e, description: truncate(e.description) }));

  const systemPrompt = `CORE_VERSION: 3.2.0 (Digital Twin Integrated).
You are a highly personalised hotel concierge AI assistant for ${hotelName}.
You answer ANY questions from the guest, from hotel policies to booking requests.

══ GUEST DIGITAL TWIN (read before every response) ══
${guestTwinContext}
IMPORTANT: Use this profile to proactively personalise your responses. Never ask the guest for information already in their profile. If they are a returning guest, acknowledge it warmly. Recommend based on their history.
════════════════════════════════════════════════════

EXCLUSIVE HOTEL KNOWLEDGE (RAG):
${knowledgeContext || 'No specific deep knowledge available for this hotel yet.'}

AVAILABLE SERVICES:
Available restaurants: ${JSON.stringify(restaurantsList)}
Available spa services: ${JSON.stringify(spaList)}
Upcoming events: ${JSON.stringify(eventsList)}
Hotel information: ${JSON.stringify(hotelData)}

IMPORTANT BOOKING RULES:
- As soon as a guest expresses intent to book a specific restaurant, spa service, or event, you MUST IMMEDIATELY call 'trigger_booking_form' for that entity. 
- NEVER ask the guest if they want to see the form; JUST TRIGGER IT as the first action. 
- The form is the FASTEST way for guests to book. Use it immediately to collect missing information (date, time, etc.) visually.
- After triggering the form, your response should invite the guest to fill it out and offer help with any specific questions.
- If the guest wants to browse or book spa services/treatments in general, or asks what spa services are available, you MUST call 'show_spa_list'.
- Use today's date as reference: ${new Date().toISOString().split('T')[0]}

CRITICAL CONCIERGE RULES:
1. For ANY housekeeping, maintenance, IT, or security request, YOU MUST CALL 'show_service_categories'.
2. NEVER explain how to request something in text. NEVER list options in text. 
3. If guest says "I need X", and X is a room service/assistance item, TRIGGER THE TOOL IMMEDIATELY as your first and only action.
4. FEW-SHOT EXAMPLE: Guest: "I need towels" -> Action: show_service_categories(category="Housekeeping") -> Content: "I've opened the housekeeping menu for you."
5. ALWAYS favor visual tools over text descriptions.

Be friendly, professional, and proactive. Use the "exclusive hotel knowledge" to answer specific questions about hotel history, policies, or unique services.

CRITICAL: The guest's active language/locale is "${detectedLang}". You MUST respond and converse in this language. If the language is "fr" (or starts with "fr"), you MUST reply in French. If the language is "en", you MUST reply in English. Always match the guest's language/locale.`;

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
        description: "Create a service request for the guest (e.g., housekeeping, maintenance, IT, security).",
        parameters: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "The type of service request (e.g., 'Housekeeping', 'Maintenance', 'IT', 'Security')."
            },
            description: {
              type: "string",
              description: "A detailed description of the service needed."
            }
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
        name: "show_event_list",
        description: "Display a visual list of all upcoming events to the guest."
      }
    },
    {
      type: "function",
      function: {
        name: "show_spa_list",
        description: "Display a visual list of all available spa services/treatments to the guest."
      }
    },
    {
      type: "function",
      function: {
        name: "show_service_categories",
        description: "CRITICAL: Displays visual cards for service categories (Maintenance, Housekeeping, IT, Security). Use this whenever a guest needs room assistance, cleaning, repairs, or 'room services' related to their stay experience.",
        parameters: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Optional: The name of the category to show directly (e.g., 'Housekeeping', 'Maintenance', 'IT', 'Security'). Skip to this if the guest mentioned it."
            }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "trigger_booking_form",
        description: "CRITICAL: Call this IMMEDIATELY as your first action whenever the guest mentions a specific restaurant, spa, or event they want to book. This is the fastest way for them to book.",
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
      temperature: 0.1, // Lower temperature for more consistent tool usage
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  let aiResponse = data.choices[0].message.content;

  if (data.choices[0].message.tool_calls) {
    const toolCall = data.choices[0].message.tool_calls[0];
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    console.log('[AI] Function call:', functionName, functionArgs);

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
      case 'show_restaurant_list':
        bookingResult = { 
          success: true, 
          message: detectedLang === 'fr'
            ? "J'ai ouvert la liste des restaurants pour vous."
            : "I've opened the restaurant list for you."
        };
        break;
      case 'show_event_list':
        bookingResult = { 
          success: true, 
          message: detectedLang === 'fr'
            ? "J'ai ouvert la liste des événements pour vous."
            : "I've opened the event list for you."
        };
        break;
      case 'show_spa_list':
        bookingResult = { 
          success: true, 
          message: detectedLang === 'fr'
            ? "J'ai ouvert la liste des services de spa pour vous."
            : "I've opened the spa services list for you."
        };
        break;
      case 'show_service_categories':
        bookingResult = { 
          success: true, 
          message: detectedLang === 'fr'
            ? `J'ai ouvert le menu des services pour vous${functionArgs.category ? ` pour la catégorie ${functionArgs.category}.` : '.'}`
            : `I've opened the service menu for you${functionArgs.category ? ` for ${functionArgs.category}.` : '.'}`
        };
        break;
      case 'trigger_booking_form':
        const typeFr = functionArgs.type === 'restaurant' ? 'restaurant' : functionArgs.type === 'spa' ? 'spa' : 'événement';
        bookingResult = { 
          success: true, 
          message: detectedLang === 'fr'
            ? `J'ai ouvert le formulaire de réservation pour le/la ${typeFr}. Veuillez remplir les détails.`
            : `I've opened the booking form for the ${functionArgs.type}. Please fill in the details.`
        };
        break;
      default:
        bookingResult = { success: false, message: 'Unknown function' };
    }

    // For visual tools, we return immediately to prevent the follow-up text from overriding cards
    if (['show_service_categories', 'trigger_booking_form', 'show_restaurant_list', 'show_event_list', 'show_spa_list'].includes(functionName)) {
      if (conversationId) {
        let actionType = 'booking_form';
        let metadataObj: any = {};
        
        if (functionName === 'show_service_categories') {
          actionType = 'service_request_flow';
          metadataObj = {
            action_type: 'service_request_flow',
            category: functionArgs.category || null
          };
        } else if (functionName === 'show_restaurant_list') {
          actionType = 'restaurant_list';
          metadataObj = {
            action_type: 'restaurant_list'
          };
        } else if (functionName === 'show_event_list') {
          actionType = 'event_list';
          metadataObj = {
            action_type: 'event_list'
          };
        } else if (functionName === 'show_spa_list') {
          actionType = 'spa_list';
          metadataObj = {
            action_type: 'spa_list'
          };
        } else if (functionName === 'trigger_booking_form') {
          actionType = 'booking_form';
          metadataObj = {
            action_type: 'booking_form',
            entity_type: functionArgs.type,
            entity_id: functionArgs.entity_id
          };
        }

        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'ai',
            sender_name: 'AI Assistant',
            content: bookingResult.message || 'I\'ve opened that for you.',
            message_type: 'action',
            metadata: metadataObj,
            hotel_id: hotelId
          });
      }
      return { response: bookingResult.message || 'I\'ve opened that for you.' };
    }

    // Generate follow-up response based on booking result for other tools (like actual bookings)
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