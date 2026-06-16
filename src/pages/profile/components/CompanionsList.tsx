
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, X } from "lucide-react";
import { CompanionData } from '@/features/users/types/userTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { syncCompanions, deleteCompanion } from '@/features/users/services/companionService';

interface CompanionsListProps {
  companions: CompanionData[];
  onAddCompanion?: (companion: CompanionData) => void;
}

const relationOptions = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

const CompanionsList = ({ companions, onAddCompanion }: CompanionsListProps) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompanion, setNewCompanion] = useState<Partial<CompanionData>>({
    first_name: '',
    last_name: '',
    relation: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAddCompanion = async () => {
    if (!newCompanion.first_name || !newCompanion.last_name || !newCompanion.relation) {
      toast({
        variant: "destructive",
        title: t('profilePage.companions.toasts.missingInfoTitle'),
        description: t('profilePage.companions.toasts.missingInfoDesc')
      });
      return;
    }

    const companionData: CompanionData = {
      first_name: newCompanion.first_name,
      last_name: newCompanion.last_name,
      relation: newCompanion.relation,
      firstName: newCompanion.first_name, // For backward compatibility
      lastName: newCompanion.last_name // For backward compatibility
    };

    if (onAddCompanion) {
      onAddCompanion(companionData);
      setIsDialogOpen(false);
      resetForm();
      return;
    }

    // If no callback provided, try to add directly to database
    if (user?.id) {
      try {
        // Add to the local list first for optimistic UI update
        const updatedCompanions = [...companions, companionData];
        await syncCompanions(user.id, updatedCompanions);

        toast({
          title: t('profilePage.companions.toasts.successAddTitle'),
          description: t('profilePage.companions.toasts.successAddDesc')
        });

        setIsDialogOpen(false);
        resetForm();

        // Force reload the page to refresh the companions list
        window.location.reload();
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'accompagnateur:", error);
        toast({
          variant: "destructive",
          title: t('profilePage.companions.toasts.errorAddTitle'),
          description: t('profilePage.companions.toasts.errorAddDesc')
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: t('profilePage.companions.toasts.authErrorTitle'),
        description: t('profilePage.companions.toasts.authErrorDesc')
      });
    }
  };

  const handleDeleteCompanion = async (companionId?: string) => {
    if (!companionId) {
      toast({
        variant: "destructive",
        title: t('profilePage.companions.toasts.errorDeleteTitle'),
        description: t('profilePage.companions.toasts.errorDeleteDesc')
      });
      return;
    }

    try {
      const success = await deleteCompanion(companionId);

      if (success) {
        toast({
          title: t('profilePage.companions.toasts.successDeleteTitle'),
          description: t('profilePage.companions.toasts.successDeleteDesc')
        });

        // Force reload the page to refresh the companions list
        window.location.reload();
      } else {
        throw new Error("Failed to delete companion");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'accompagnateur:", error);
      toast({
        variant: "destructive",
        title: t('profilePage.companions.toasts.errorDeleteActionTitle'),
        description: t('profilePage.companions.toasts.errorDeleteActionDesc')
      });
    }
  };

  const resetForm = () => {
    setNewCompanion({
      first_name: '',
      last_name: '',
      relation: ''
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t('profilePage.companions.title')}</h2>
          </div>
        </div>
        {companions.length > 0 ? (
          <div className="divide-y">
            {companions.map((companion, index) => (
              <div key={companion.id || index} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{companion.first_name || companion.firstName} {companion.last_name || companion.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('profilePage.companions.relations.' + companion.relation.toLowerCase(), companion.relation)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCompanion(companion.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            {t('profilePage.companions.noCompanions')}
          </div>
        )}
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('profilePage.companions.addCompanion')}
          </Button>
        </div>
      </CardContent>

      {isDialogOpen && <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setIsDialogOpen(false)} />}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('profilePage.companions.addCompanionTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('profilePage.companions.firstName')}</label>
                <Input
                  value={newCompanion.first_name || ''}
                  onChange={(e) => setNewCompanion({ ...newCompanion, first_name: e.target.value })}
                  placeholder={t('profilePage.companions.firstName')}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('profilePage.companions.lastName')}</label>
                <Input
                  value={newCompanion.last_name || ''}
                  onChange={(e) => setNewCompanion({ ...newCompanion, last_name: e.target.value })}
                  placeholder={t('profilePage.companions.lastName')}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('profilePage.companions.relation')}</label>
              <Select
                value={newCompanion.relation || ''}
                onValueChange={(value) => setNewCompanion({ ...newCompanion, relation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('profilePage.companions.selectRelation')} />
                </SelectTrigger>
                <SelectContent>
                  {relationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {t('profilePage.companions.relations.' + option.value, option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('profilePage.companions.cancel')}</Button>
            <Button onClick={handleAddCompanion}>{t('profilePage.companions.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CompanionsList;
