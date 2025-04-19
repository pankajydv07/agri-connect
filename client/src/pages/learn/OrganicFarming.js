// src/pages/learn/OrganicFarming.js
import React from 'react';

const OrganicFarming = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Organic Farming Practices</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Benefits of Organic Farming</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Improves soil health and fertility</li>
          <li>Reduces chemical runoff and water pollution</li>
          <li>Promotes biodiversity</li>
          <li>Produces chemical-free crops</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Key Practices</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium mb-2">Crop Rotation</h3>
            <p className="text-gray-600">Rotate legumes with cereals to naturally replenish soil nitrogen</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium mb-2">Natural Pest Control</h3>
            <p className="text-gray-600">Use neem oil, garlic-chili sprays, and beneficial insects</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganicFarming;
