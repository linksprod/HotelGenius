
import React from 'react';
import ActivityForm from './components/ActivityForm';
import ActivitiesList from './components/ActivitiesList';
import { useActivities } from './hooks/useActivities';

const ActivitiesTab = () => {
  const {
    activities,
    isLoading,
    formData,
    isEditing,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setFormData
  } = useActivities();

  return (
    <div className="space-y-6">
      <ActivityForm
        formData={formData}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={resetForm}
      />
      
      <ActivitiesList
        activities={activities || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ActivitiesTab;
