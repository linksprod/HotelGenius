
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { requestService } from '@/features/rooms/controllers/roomService';
import { useToast } from '@/hooks/use-toast';
import { Room } from '@/hooks/useRoom';
import { useRequestCategories } from '@/hooks/useRequestCategories';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import SearchDialog from './SearchDialog';
import ConfirmRequestDialog from './ConfirmRequestDialog';
import { filterItemsBySearch, getActualGuestName } from './commandSearchUtils';

interface CommandSearchProps {
  room: Room | null;
  onRequestSuccess: () => void;
}

type ItemToRequest = {
  id: string;
  name: string;
  category: string;
  description?: string;
};

const CommandSearch = ({ room, onRequestSuccess }: CommandSearchProps) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemToRequest | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { categories, allItems, isLoading } = useRequestCategories();
  const { userData } = useAuth();

  // Listen to search query parameter to prefill search
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      const decodedQuery = decodeURIComponent(query);
      setSearchTerm(decodedQuery);
      setOpen(true);
      
      // Remove query parameter so it doesn't reopen if the user navigates back
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('search');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    return allItems.reduce((acc, item) => {
      if (!item.is_active) return acc;
      const categoryId = item.category_id;
      if (!acc[categoryId]) acc[categoryId] = [];
      acc[categoryId].push(item);
      return acc;
    }, {} as Record<string, typeof allItems>);
  }, [allItems]);

  // Find security category
  const securityCategory = categories.find(
    (cat) =>
      cat.name?.toLowerCase().includes('secur') ||
      cat.name?.toLowerCase().includes('sécurité') ||
      cat.name?.toLowerCase().includes('security')
  );

  const handleSelect = (item: { id: string; name: string; category_id: string; description?: string }, category: { id: string }) => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      category: category.id,
      description: item.description,
    });
    setConfirmDialogOpen(true);
  };

  const handleConfirmRequest = async (note?: string) => {
    if (!selectedItem) return;
    setIsSubmitting(true);

    try {
      const roomInfo = room || { id: '' };
      let roomId = roomInfo.id;
      let roomNumber = room?.room_number || userData?.room_number || localStorage.getItem('user_room_number') || '406';

      if (!roomId) {
        roomId = roomNumber;
      }
      if (roomNumber && !localStorage.getItem('user_room_number')) {
        localStorage.setItem('user_room_number', roomNumber);
      }
      if (!roomId && roomNumber) {
        roomId = roomNumber;
      }

      let description = `${selectedItem.name}`;
      if (selectedItem.description) {
        description += ` - ${selectedItem.description}`;
      }
      if (note && note.trim()) {
        description += ` (Note: ${note.trim()})`;
      }

      await requestService(
        roomId,
        'service',
        description,
        selectedItem.id,
        selectedItem.category
      );
      toast({
        title: t('myRoom.request.requestSent', 'Request Sent'),
        description: t('myRoom.request.requestSentDesc', 'Your request for "{{name}}" was sent successfully.', { name: selectedItem.name }),
      });
      onRequestSuccess();
      setOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: t('myRoom.request.requestError', 'Error'),
        description: t('myRoom.request.requestErrorDesc', 'Could not send the request. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">{t('myRoom.request.openSearch', 'Open service search')}</span>
      </div>
      <SearchDialog
        open={open}
        setOpen={setOpen}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
        categories={categories}
        allItems={allItems}
        itemsByCategory={itemsByCategory}
        securityCategory={securityCategory}
        onSelect={handleSelect}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
      />
      <ConfirmRequestDialog
        open={confirmDialogOpen}
        isSubmitting={isSubmitting}
        item={selectedItem}
        onCancel={() => { setConfirmDialogOpen(false); setSelectedItem(null); }}
        onConfirm={handleConfirmRequest}
      />
    </>
  );
};

export default CommandSearch;
