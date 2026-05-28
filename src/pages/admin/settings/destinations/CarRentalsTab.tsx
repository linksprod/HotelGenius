
import React from 'react';
import CarRentalForm from './components/CarRentalForm';
import CarRentalsList from './components/CarRentalsList';
import { useCarRentals } from './hooks/useCarRentals';

const CarRentalsTab = () => {
  const {
    carRentals,
    isLoading,
    formData,
    isEditing,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setFormData
  } = useCarRentals();

  return (
    <div className="space-y-6">
      <CarRentalForm
        formData={formData}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onChange={setFormData}
        onCancel={resetForm}
      />
      
      <CarRentalsList
        carRentals={carRentals || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CarRentalsTab;
