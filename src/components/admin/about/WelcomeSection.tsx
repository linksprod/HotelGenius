
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface WelcomeSectionProps {
  welcomeTitle: string;
  welcomeDescription: string;
  welcomeDescriptionExtended: string;
  handleTextChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isEditing?: boolean;
  onSave?: (data: { welcome_title: string; welcome_description: string; welcome_description_extended: string }) => void;
}

const WelcomeSection = ({
  welcomeTitle,
  welcomeDescription,
  welcomeDescriptionExtended,
  handleTextChange,
  isEditing = false,
  onSave
}: WelcomeSectionProps) => {
  const [editableTitle, setEditableTitle] = React.useState(welcomeTitle);
  const [editableDesc, setEditableDesc] = React.useState(welcomeDescription);
  const [editableExtDesc, setEditableExtDesc] = React.useState(welcomeDescriptionExtended);

  // Only used in editing mode if handleTextChange is not provided
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'welcome_title') setEditableTitle(value);
    if (name === 'welcome_description') setEditableDesc(value);
    if (name === 'welcome_description_extended') setEditableExtDesc(value);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        welcome_title: editableTitle,
        welcome_description: editableDesc,
        welcome_description_extended: editableExtDesc
      });
    }
  };

  if (isEditing) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome Section</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="welcome_title">Section Title</Label>
            <Input 
              id="welcome_title" 
              name="welcome_title" 
              value={editableTitle} 
              onChange={handleTextChange || handleLocalChange}
            />
          </div>

          <div>
            <Label htmlFor="welcome_description">Main Description</Label>
            <Textarea 
              id="welcome_description" 
              name="welcome_description" 
              value={editableDesc} 
              onChange={handleTextChange || handleLocalChange}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="welcome_description_extended">Extended Description</Label>
            <Textarea 
              id="welcome_description_extended" 
              name="welcome_description_extended" 
              value={editableExtDesc} 
              onChange={handleTextChange || handleLocalChange}
              rows={3}
            />
          </div>
          
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
      <h2 className="text-2xl font-bold mb-4">{welcomeTitle}</h2>
      <p className="text-lg mb-4">{welcomeDescription}</p>
      {welcomeDescriptionExtended && (
        <p className="text-muted-foreground">{welcomeDescriptionExtended}</p>
      )}
    </Card>
  );
};

export default WelcomeSection;
