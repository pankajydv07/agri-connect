import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ModernTechnology = () => {
  const [selectedCropVideo, setSelectedCropVideo] = useState(null);

  // Crop videos moved to SDG Knowledge Hub main page

  const handleCropVideoSelect = (video) => {
    setSelectedCropVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseVideo = () => {
    setSelectedCropVideo(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-700 border-b-2 pb-2 border-green-500">Modern Farming Technologies</h1>
      
      <div className="mb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Precision Agriculture</h2>
            <p className="mb-4 text-gray-700">Precision agriculture uses technology to optimize field-level management for improved crop productivity and reduced environmental impact.</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                Soil sensors for smart irrigation
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                GPS-guided equipment
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                Drone-based field monitoring
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Sustainable Tools</h2>
            <p className="mb-4 text-gray-700">Modern sustainable farming tools reduce environmental impact while maintaining or improving crop yields and farm profitability.</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                Solar-powered irrigation systems
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                Bio-digesters for waste management
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                Mobile apps for crop monitoring
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <h2 className="text-xl font-semibold mb-6 text-green-600">Explore Modern Farming Tools</h2>
        <p className="mb-6 text-gray-700">
          Discover our comprehensive catalog of modern farming tools to enhance your agricultural productivity and sustainability. From soil sensors to drones, find everything you need.
        </p>
        <div className="text-center">
          <Link 
            to="/tools-marketplace" 
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors duration-300 inline-flex items-center"
          >
            Visit Tools Marketplace
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Smart Farming Technology Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-green-50 p-5 rounded-lg">
            <div className="text-green-600 text-3xl mb-3">📊</div>
            <h3 className="font-medium text-lg mb-2 text-green-700">Data-Driven Decisions</h3>
            <p className="text-gray-600">Make informed farming decisions based on real-time data and analytics.</p>
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg">
            <div className="text-green-600 text-3xl mb-3">💧</div>
            <h3 className="font-medium text-lg mb-2 text-green-700">Resource Optimization</h3>
            <p className="text-gray-600">Reduce water, fertilizer, and pesticide usage with precise applications.</p>
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg">
            <div className="text-green-600 text-3xl mb-3">🌱</div>
            <h3 className="font-medium text-lg mb-2 text-green-700">Increased Yields</h3>
            <p className="text-gray-600">Boost productivity through optimized growing conditions and monitoring.</p>
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg">
            <div className="text-green-600 text-3xl mb-3">🔄</div>
            <h3 className="font-medium text-lg mb-2 text-green-700">Sustainable Practices</h3>
            <p className="text-gray-600">Implement environmentally friendly farming methods with modern technology.</p>
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg">
            <div className="text-green-600 text-3xl mb-3">💰</div>
            <h3 className="font-medium text-lg mb-2 text-green-700">Cost Reduction</h3>
            <p className="text-gray-600">Lower operational costs through automation and efficient resource use.</p>
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg">
            <div className="text-green-600 text-3xl mb-3">📱</div>
            <h3 className="font-medium text-lg mb-2 text-green-700">Remote Management</h3>
            <p className="text-gray-600">Monitor and manage farm operations from anywhere using mobile technology.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTechnology;