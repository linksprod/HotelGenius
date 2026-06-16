
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MissionSectionProps {
  mission: string;
  handleTextChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isEditing?: boolean;
  onSave?: (mission: string) => void;
}

const MissionSection = ({
  mission,
  handleTextChange,
  isEditing = false,
  onSave
}: MissionSectionProps) => {
  const [editableMission, setEditableMission] = React.useState(mission);
  const { t } = useTranslation();

  // Only used in editing mode if handleTextChange is not provided
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditableMission(e.target.value);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editableMission);
    }
  };

  if (isEditing) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Mission Statement</h2>
        
        <div>
          <Label htmlFor="mission">Mission</Label>
          <Textarea 
            id="mission" 
            name="mission" 
            value={editableMission} 
            onChange={handleTextChange || handleLocalChange}
            rows={5}
            className="mb-2"
          />
          <p className="text-sm text-gray-500">
            A concise statement that defines the purpose and values of the hotel.
          </p>
          
          {onSave && !handleTextChange && (
            <Button type="button" onClick={handleSave} className="mt-4">
              Save Changes
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">{t('about.mission', 'Our Mission')}</h2>
      <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700">
        "{mission}"
      </blockquote>
    </Card>
  );
};

export default MissionSection;
