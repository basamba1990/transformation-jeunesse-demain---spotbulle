// frontend/src/pages/PodsCreatePage.tsx
import React from 'react';
import PodForm from '../components/PodForm';

const PodsCreatePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Créer un nouveau Pod</h1>
      <PodForm mode="create" />
    </div>
  );
};

export default PodsCreatePage;
