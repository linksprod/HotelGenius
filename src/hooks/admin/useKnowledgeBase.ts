import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export interface KnowledgeDoc {
  id: string;
  content: string;
  source_name: string | null;
  source_type: string | null;
  created_at: string;
  metadata: any;
}

export const useKnowledgeBase = () => {
  const { hotelId } = useCurrentHotelId();
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const fetchDocs = async () => {
    if (!hotelId) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('hotel_knowledge')
        .select('id, content, source_name, source_type, created_at, metadata')
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group by source_name to show unique documents instead of every chunk
      const uniqueDocs = data?.reduce((acc: KnowledgeDoc[], current) => {
        const x = acc.find(item => item.source_name === current.source_name);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);

      setDocs(uniqueDocs || []);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadKnowledge = async (file: File) => {
    if (!hotelId || !file) return;

    try {
      setIsProcessing(true);
      const content = await file.text(); // For now, assume text-readable files

      const { data, error } = await supabase.functions.invoke('process-knowledge', {
        body: {
          hotelId,
          content,
          sourceName: file.name,
          sourceType: file.type,
          metadata: { size: file.size, lastModified: file.lastModified }
        }
      });

      if (error) throw error;

      toast({
        title: "Knowledge Synchronized",
        description: `Successfully processed ${file.name}.`,
      });

      fetchDocs();
    } catch (error) {
      console.error('Error uploading knowledge:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteKnowledge = async (sourceName: string) => {
    if (!hotelId) return;
    try {
      const { error } = await supabase
        .from('hotel_knowledge')
        .delete()
        .eq('hotel_id', hotelId)
        .eq('source_name', sourceName);

      if (error) throw error;

      toast({
        title: "Knowledge Removed",
        description: `Removed "${sourceName}" from AI memory.`,
      });

      fetchDocs();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [hotelId]);

  return {
    docs,
    isLoading,
    isProcessing,
    uploadKnowledge,
    deleteKnowledge,
    refresh: fetchDocs
  };
};
