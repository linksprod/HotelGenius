
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { InfoItem } from '@/lib/types';
import InfoItemSection from './InfoItemSection';

interface DirectorySectionProps {
  directoryTitle?: string;
  title?: string; // Added for backward compatibility
  importantNumbers: InfoItem[];
  hotelPolicies: InfoItem[];
  facilities: InfoItem[];
  additionalInfo: InfoItem[];
  handleTextChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  addInfoItem?: (type: string) => void;
  removeInfoItem?: (type: string, index: number) => void;
  handleInfoItemChange?: (type: string, index: number, field: string, value: string) => void;
  isEditing?: boolean;
  onSaveImportantNumbers?: (items: InfoItem[]) => void;
  onSaveFacilities?: (items: InfoItem[]) => void;
  onSaveHotelPolicies?: (items: InfoItem[]) => void;
  onSaveAdditionalInfo?: (items: InfoItem[]) => void;
}

const DirectorySection = ({
  directoryTitle,
  title, // This is for backward compatibility
  importantNumbers,
  hotelPolicies,
  facilities,
  additionalInfo,
  handleTextChange,
  addInfoItem,
  removeInfoItem,
  handleInfoItemChange,
  isEditing = false,
  onSaveImportantNumbers,
  onSaveFacilities,
  onSaveHotelPolicies,
  onSaveAdditionalInfo
}: DirectorySectionProps) => {
  const { t } = useTranslation();
  const sectionTitle = directoryTitle || title || 'Hotel Directory & Information';
  const [editableTitle, setEditableTitle] = useState(sectionTitle);

  // Local handler for standalone edit mode
  const handleLocalTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(e.target.value);
  };

  if (isEditing) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Directory & Information</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="directory_title">Section Title</Label>
            <Input 
              id="directory_title" 
              name="directory_title" 
              value={editableTitle} 
              onChange={handleTextChange || handleLocalTitleChange}
            />
          </div>

          <div className="space-y-4">
            <InfoItemSection
              title="Important Numbers"
              items={importantNumbers}
              type="important_numbers"
              addInfoItem={addInfoItem}
              removeInfoItem={removeInfoItem}
              handleInfoItemChange={handleInfoItemChange}
              isEditing={true}
              onSave={onSaveImportantNumbers}
            />

            <InfoItemSection
              title="Hotel Policies"
              items={hotelPolicies}
              type="hotel_policies"
              addInfoItem={addInfoItem}
              removeInfoItem={removeInfoItem}
              handleInfoItemChange={handleInfoItemChange}
              isEditing={true}
              onSave={onSaveHotelPolicies}
            />

            <InfoItemSection
              title="Facilities & Amenities"
              items={facilities}
              type="facilities"
              addInfoItem={addInfoItem}
              removeInfoItem={removeInfoItem}
              handleInfoItemChange={handleInfoItemChange}
              isEditing={true}
              onSave={onSaveFacilities}
            />

            <InfoItemSection
              title="Additional Information"
              items={additionalInfo}
              type="additional_info"
              addInfoItem={addInfoItem}
              removeInfoItem={removeInfoItem}
              handleInfoItemChange={handleInfoItemChange}
              isEditing={true}
              onSave={onSaveAdditionalInfo}
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">{sectionTitle}</h2>
      
      <div className="space-y-6">
        {importantNumbers.length > 0 && (
          <InfoItemSection
            title={t('about.directory.section.Important Numbers', 'Important Numbers')}
            items={importantNumbers.map(item => ({
              label: item.label ? t(`about.directory.label.${item.label}`, item.label) : '',
              value: item.value ? t(`about.directory.value.${item.value}`, item.value) : ''
            }))}
          />
        )}
        
        {facilities.length > 0 && (
          <InfoItemSection
            title={t('about.directory.section.Facilities & Amenities', 'Facilities & Amenities')}
            items={facilities.map(item => ({
              label: item.label ? t(`about.directory.label.${item.label}`, item.label) : '',
              value: item.value ? t(`about.directory.value.${item.value}`, item.value) : ''
            }))}
          />
        )}
        
        {hotelPolicies.length > 0 && (
          <InfoItemSection
            title={t('about.directory.section.Hotel Policies', 'Hotel Policies')}
            items={hotelPolicies.map(item => ({
              label: item.label ? t(`about.directory.label.${item.label}`, item.label) : '',
              value: item.value ? t(`about.directory.value.${item.value}`, item.value) : ''
            }))}
          />
        )}
        
        {additionalInfo.length > 0 && (
          <InfoItemSection
            title={t('about.directory.section.Additional Information', 'Additional Information')}
            items={additionalInfo.map(item => ({
              label: item.label ? t(`about.directory.label.${item.label}`, item.label) : '',
              value: item.value ? t(`about.directory.value.${item.value}`, item.value) : ''
            }))}
          />
        )}
      </div>
    </Card>
  );
};

export default DirectorySection;
