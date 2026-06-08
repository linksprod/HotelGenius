import { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';

// Use Vite's native worker support to avoid CORS and CDN issues
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  SetupSession,
  AIExtractedContent,
  UploadedFile,
  SectionKey,
  SetupSessionStatus,
} from '@/types/aiSetup';

// ─── PDF Text Extraction (client-side) ──────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file.type === 'application/pdf') {
      file.arrayBuffer().then(arrayBuffer => {
        return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      }).then(async (pdf) => {
        let fullText = '';
        const maxPages = pdf.numPages; // Scan all pages
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }

        // Keep up to ~20,000 characters (about 15-20 pages of dense text) to prevent Edge Function timeout
        const truncated = fullText.slice(0, 20000);
        resolve(truncated || `[PDF: ${file.name} — no readable text found.]`);
      }).catch((err) => {
        console.warn("PDF.js parsing failed, falling back to native text...", err);
        // Fallback gracefully instead of failing
        file.text().then(rawText => {
          const truncated = rawText.slice(0, 20000);
          const combined = truncated.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/ {2,}/g, ' ').trim();
          resolve(combined || `[PDF: ${file.name} — readable text not found]`);
        }).catch(reject);
      });
    } else if (
      file.type === 'text/plain' ||
      file.type === 'text/csv' ||
      file.name.endsWith('.txt')
    ) {
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = reject;
      reader.readAsText(file);
    } else {
      // DOCX and other binary formats — extract readable ASCII
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder('latin1');
        const raw = decoder.decode(uint8Array).slice(0, 100000);
        // Filter to printable ASCII characters only
        const text = raw.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
        resolve(text || `[File: ${file.name} — binary content, limited extraction]`);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    }
  });
}

// ─── Commit Section Helpers ──────────────────────────────────────────────────

async function commitAbout(draft: AIExtractedContent, hotelId: string) {
  const about = draft.about;
  
  const payload = {
    hotel_id: hotelId,
    title: about.name || 'About Us',
    description: about.description || '',
    icon: 'info',
    action_link: '/about',
    action_text: 'Learn More',
    hero_title: about.tagline || about.name || '',
    welcome_title: about.name || '',
    welcome_description: about.description || '',
    mission: about.description || '',
    hotel_policies: about.amenities?.length
      ? JSON.stringify(about.amenities.map((a) => ({ title: a })))
      : null,
  };

  // Check if a record already exists
  const { data: existing } = await supabase
    .from('hotel_about')
    .select('id')
    .eq('hotel_id', hotelId)
    .limit(1)
    .maybeSingle();

  let error;
  if (existing) {
    const res = await supabase.from('hotel_about').update(payload).eq('id', existing.id);
    error = res.error;
  } else {
    const res = await supabase.from('hotel_about').insert(payload);
    error = res.error;
  }
  
  if (error) throw error;
}

async function commitRestaurants(draft: AIExtractedContent, hotelId: string) {
  const items = draft.restaurants?.items || [];
  if (!items.length) return;

  // Clear existing restaurants for this hotel to avoid duplicates
  const { error: clearError } = await supabase.from('restaurants').delete().eq('hotel_id', hotelId);
  if (clearError) console.warn('Could not clear old restaurants:', clearError);

  for (const r of items) {
    const { error } = await supabase.from('restaurants').insert({
      hotel_id: hotelId,
      name: r.name,
      // Only use values actually found in the document — never generic defaults
      cuisine: r.cuisine || '',
      description: r.description || '',
      open_hours: r.hours || '',
      location: '',
      status: 'open',
      images: [],
      is_published: false,
    });
    if (error) {
      console.error('Error committing restaurant:', error);
      throw error;
    }
  }
}

async function commitActivities(draft: AIExtractedContent, hotelId: string) {
  const items = draft.activities?.items || [];
  if (!items.length) return;

  for (const a of items) {
    // Prevent duplicate global activities by name matching
    const { data: existing } = await supabase
      .from('destination_activities')
      .select('id')
      .eq('name', a.name)
      .limit(1)
      .maybeSingle();

    if (!existing) {
      await supabase.from('destination_activities').insert({
        name: a.name,
        description: a.description || '',
        image: '',
        is_published: false,
      });
    }
  }
}

async function commitRooms(draft: AIExtractedContent, hotelId: string) {
  const items = draft.rooms?.items || [];
  if (!items.length) return;

  // Clear existing rooms for this hotel to avoid duplicates
  await supabase.from('rooms').delete().eq('hotel_id', hotelId);

  for (let i = 0; i < items.length; i++) {
    const r = items[i];
    // Only parse a price if it was explicitly provided — no invented default
    const rawPrice = r.priceEstimate?.replace(/[^0-9.]/g, '');
    const parsedPrice = rawPrice ? (parseFloat(rawPrice) || null) : null;
    // Only use capacity if explicitly stated
    const capacity = r.maxGuests ?? null;
    const roomNumber = (i + 101).toString();
    // Only use room type if explicitly stated
    const roomType = r.type || '';

    await supabase.from('rooms').insert({
      hotel_id: hotelId,
      room_number: roomNumber,
      type: roomType,
      capacity: capacity,
      price: parsedPrice,
      status: 'available',
      amenities: r.amenities || [],
      floor: null,
      images: [],
      is_published: false,
    });
  }
}

async function commitSpa(draft: AIExtractedContent, hotelId: string) {
  const spa = draft.spa;
  if (!spa || !spa.treatments?.length) return;

  // 1. Check if facility exists
  const { data: existingFacility } = await supabase
    .from('spa_facilities')
    .select('id')
    .eq('hotel_id', hotelId)
    .limit(1)
    .maybeSingle();

  let facilityId;
  if (existingFacility) {
    facilityId = existingFacility.id;
    // Clear existing treatments for this facility to avoid duplicates
    await supabase.from('spa_services').delete().eq('facility_id', facilityId);
  } else {
    // Use the real description from the document — no invented name fallback
    const { data: newFacility, error: facErr } = await supabase
      .from('spa_facilities')
      .insert({
        hotel_id: hotelId,
        name: spa.description ? spa.description.split('.')[0].slice(0, 80) : 'Spa & Wellness',
        description: spa.description || '',
        is_published: false,
      })
      .select('id')
      .single();
    if (facErr) throw facErr;
    facilityId = newFacility.id;
  }

  // 2. Insert treatments — only use values explicitly found in the document
  for (const t of spa.treatments) {
    const rawDuration = t.duration?.replace(/[^0-9]/g, '');
    const durationMin = rawDuration ? (parseInt(rawDuration) || null) : null;
    const rawPrice = t.price?.replace(/[^0-9.]/g, '');
    const priceNum = rawPrice ? (parseFloat(rawPrice) || null) : null;

    await supabase.from('spa_services').insert({
      hotel_id: hotelId,
      facility_id: facilityId,
      name: t.name,
      description: t.description || '',
      duration_minutes: durationMin,
      price: priceNum,
      status: 'active',
      is_published: false,
    });
  }
}

async function commitPolicies(draft: AIExtractedContent, hotelId: string) {
  const items = draft.policies?.items || [];
  if (!items.length) return;

  const payload = {
    hotel_policies: items.map((p) => ({ title: p.title, content: p.content })),
  };

  const { data: existing } = await supabase
    .from('hotel_about')
    .select('id')
    .eq('hotel_id', hotelId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('hotel_about').update(payload).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('hotel_about').insert({
      hotel_id: hotelId,
      hotel_policies: payload.hotel_policies,
      title: 'About Us',
      description: '',
      icon: 'info',
      action_link: '/about',
      action_text: 'Learn More',
      hero_title: '',
      welcome_title: '',
      welcome_description: '',
      mission: '',
    });
    if (error) throw error;
  }
}

async function commitFAQs(draft: AIExtractedContent, hotelId: string) {
  const items = draft.faqs?.items || [];
  if (!items.length) return;

  for (const f of items) {
    const textContent = `Question: ${f.question}\nAnswer: ${f.answer}`;
    await supabase.from('hotel_knowledge').insert({
      hotel_id: hotelId,
      content: textContent,
      metadata: { question: f.question, answer: f.answer, type: 'faq' },
      source_type: 'pdf',
    });
  }
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

export function useAIContentImport(hotelId: string | null) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [session, setSession] = useState<SetupSession | null>(null);
  const [status, setStatus] = useState<SetupSessionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [draft, setDraft] = useState<AIExtractedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [committedSections, setCommittedSections] = useState<SectionKey[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  // ── Create or resume a session ───────────────────────────────────────────

  const createSession = useCallback(async (): Promise<string | null> => {
    if (!hotelId) return null;

    const { data, error } = await supabase
      .from('hotel_setup_sessions')
      .insert({
        hotel_id: hotelId,
        status: 'idle',
        progress_percent: 0,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create setup session');
      return null;
    }

    sessionIdRef.current = data.id;
    setSession(data as unknown as SetupSession);
    return data.id;
  }, [hotelId]);

  const updateSession = useCallback(
    async (updates: Partial<SetupSession>) => {
      if (!sessionIdRef.current) return;
      await supabase
        .from('hotel_setup_sessions')
        .update(updates as Record<string, unknown>)
        .eq('id', sessionIdRef.current);
    },
    []
  );

  // ── Add files ────────────────────────────────────────────────────────────

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileStatus = useCallback(
    (id: string, updates: Partial<UploadedFile>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      );
    },
    []
  );

  // ── Run the full extraction pipeline ─────────────────────────────────────

  const runExtraction = useCallback(async () => {
    if (!hotelId || files.length === 0) {
      toast.error('Please add at least one file before extracting');
      return;
    }

    setIsLoading(true);
    setStatus('uploading');
    setProgress(5);

    try {
      console.log('[runExtraction] Step 1: Creating session');
      // Step 1: Create session
      const sid = await createSession();
      if (!sid) throw new Error('Failed to create session in Supabase. Did you run the SQL migration?');
      console.log('[runExtraction] Session created:', sid);

      // Step 2: Extract text from all files
      let combinedText = '';
      const sourceNames: string[] = [];

      for (const uploadedFile of files) {
        console.log(`[runExtraction] Extracting text for file: ${uploadedFile.name}`);
        updateFileStatus(uploadedFile.id, { status: 'reading', progress: 10 });

        try {
          const text = await extractTextFromFile(uploadedFile.file);
          combinedText += `\n\n--- Source: ${uploadedFile.name} ---\n${text}`;
          sourceNames.push(uploadedFile.name);
          updateFileStatus(uploadedFile.id, { status: 'done', progress: 100, extractedText: text });
          console.log(`[runExtraction] Extraction successful for file: ${uploadedFile.name}`);
        } catch (err) {
          console.error(`[runExtraction] Extraction failed for file: ${uploadedFile.name}`, err);
          updateFileStatus(uploadedFile.id, {
            status: 'error',
            error: 'Failed to read file',
          });
        }
      }

      setProgress(30);
      setStatus('extracting');
      console.log('[runExtraction] Text extracted. Updating session...');

      await updateSession({
        status: 'extracting',
        source_names: sourceNames,
        source_type: 'pdf',
        raw_text: combinedText.slice(0, 10000), // Save first 10k chars of raw text
        progress_percent: 30,
      } as Partial<SetupSession>);

      // Step 3: Call the Edge Function
      let extractedDraft: AIExtractedContent;
      
      const { data, error } = await supabase.functions.invoke('ai-content-import', {
        body: {
          hotelId,
          sessionId: sid,
          rawText: combinedText,
          sourceType: 'pdf',
          sourceName: sourceNames.join(', '),
        },
      });

      console.log('[runExtraction] Edge Function response:', { data, error });

      if (error || !data?.success) {
        console.error(`[runExtraction] Edge Function failed:`, error || data?.error);
        throw new Error(data?.error || error?.message || 'Edge function failed to extract content. Please ensure it is deployed via Supabase CLI.');
      }

      extractedDraft = ensurePrefilledDrafts(data.draft);

      setDraft(extractedDraft);
      setProgress(80);
      setStatus('reviewing');

      await updateSession({
        status: 'reviewing',
        ai_draft: extractedDraft as unknown as Record<string, unknown>,
        progress_percent: 80,
      } as Partial<SetupSession>);

      toast.success('AI extraction complete! Review the content below.');
    } catch (err) {
      console.error('[runExtraction] Catch block error:', err);
      const message = err instanceof Error ? err.message : 'Extraction failed';
      toast.error(message);
      setStatus('error');
      await updateSession({ status: 'error', error_message: message } as Partial<SetupSession>).catch(console.error);
    } finally {
      setIsLoading(false);
    }
  }, [hotelId, files, createSession, updateSession, updateFileStatus]);

  // ── Commit a single section to live tables ───────────────────────────────

  const commitSection = useCallback(
    async (sectionKey: SectionKey) => {
      if (!draft || !hotelId) return;

      setIsLoading(true);
      try {
        switch (sectionKey) {
          case 'about':
            await commitAbout(draft, hotelId);
            break;
          case 'rooms':
            await commitRooms(draft, hotelId);
            break;
          case 'restaurants':
            await commitRestaurants(draft, hotelId);
            break;
          case 'spa':
            await commitSpa(draft, hotelId);
            break;
          case 'activities':
            await commitActivities(draft, hotelId);
            break;
          case 'policies':
            await commitPolicies(draft, hotelId);
            break;
          case 'faqs':
            await commitFAQs(draft, hotelId);
            break;
          default:
            break;
        }

        const newCommitted = [...committedSections, sectionKey];
        setCommittedSections(newCommitted);

        await updateSession({
          committed_sections: newCommitted,
        } as Partial<SetupSession>);

        toast.success(`${sectionKey} saved to your hotel profile!`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save section';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [draft, hotelId, committedSections, updateSession]
  );

  // ── Commit all sections ──────────────────────────────────────────────────

  const commitAll = useCallback(async () => {
    if (!draft || !hotelId) return;
    const sections: SectionKey[] = ['about', 'rooms', 'restaurants', 'spa', 'activities', 'policies', 'faqs'];
    for (const section of sections) {
      if (!committedSections.includes(section)) {
        await commitSection(section);
      }
    }
    setStatus('done');
    setProgress(100);
    await updateSession({ status: 'done', progress_percent: 100 } as Partial<SetupSession>);
    toast.success('All content imported successfully!');
  }, [draft, hotelId, committedSections, commitSection, updateSession]);

  return {
    files,
    addFiles,
    removeFile,
    session,
    status,
    progress,
    draft,
    isLoading,
    committedSections,
    runExtraction,
    commitSection,
    commitAll,
    reset: () => {
      setFiles([]);
      setDraft(null);
      setSession(null);
      setStatus('idle');
      setProgress(0);
      setCommittedSections([]);
      sessionIdRef.current = null;
    },
  };
}

function ensurePrefilledDrafts(rawDraft: any): AIExtractedContent {
  const d = { ...rawDraft } as AIExtractedContent;

  if (!d.about) {
    d.about = {
      confidence: 0,
      name: null,
      tagline: null,
      description: null,
      address: null,
      phone: null,
      email: null,
      checkIn: null,
      checkOut: null,
      starRating: null,
      amenities: []
    };
  }
  if (!d.rooms) {
    d.rooms = { confidence: 0, items: [] };
  }
  if (!d.restaurants) {
    d.restaurants = { confidence: 0, items: [] };
  }
  if (!d.spa) {
    d.spa = { confidence: 0, description: null, hours: null, treatments: [] };
  }
  if (!d.activities) {
    d.activities = { confidence: 0, items: [] };
  }
  if (!d.policies) {
    d.policies = { confidence: 0, items: [] };
  }
  if (!d.faqs) {
    d.faqs = { confidence: 0, items: [] };
  }

  return d;
}
