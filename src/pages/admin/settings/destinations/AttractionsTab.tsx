
import React from 'react';
import AttractionForm from './components/AttractionForm';
import AttractionsList from './components/AttractionsList';
import { useAttractions } from './hooks/useAttractions';

const AttractionsTab = () => {
  const {
    attractions,
    isLoading,
    formData,
    isEditing,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setFormData
  } = useAttractions();

  return (
    <div className="space-y-6">
      <AttractionForm
        formData={formData}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={resetForm}
      />
      
      <AttractionsList
        attractions={attractions || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AttractionsTab;
