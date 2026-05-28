
import React from 'react';
import PublicTransportForm from './components/PublicTransportForm';
import PublicTransportsList from './components/PublicTransportsList';
import { usePublicTransports } from './hooks/usePublicTransports';

const PublicTransportsTab = () => {
  const {
    transports,
    isLoading,
    formData,
    isEditing,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setFormData
  } = usePublicTransports();

  return (
    <div className="space-y-6">
      <PublicTransportForm
        formData={formData}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={resetForm}
      />
      
      <PublicTransportsList
        transports={transports || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PublicTransportsTab;
