import React, { useState } from 'react';
import './EcoFriendlyFarming.css'; // You'll need to create this CSS file

const EcoFriendlyFarming = () => {
  const [activeTab, setActiveTab] = useState('carbon');

  return (
    <div className="eco-farming-container max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 text-green-800 relative inline-block">
          <span className="relative z-10">Eco-Friendly Farming Methods</span>
          <span className="absolute -bottom-2 left-0 w-full h-3 bg-green-200 opacity-50 z-0"></span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover sustainable techniques that reduce environmental impact while improving crop yields and soil health.
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['carbon', 'fertilizers', 'videos', 'resources'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-green-600 text-white shadow-md' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {tab === 'carbon' && 'Carbon Footprint'}
            {tab === 'fertilizers' && 'Natural Fertilizers'}
            {tab === 'videos' && 'Educational Videos'}
            {tab === 'resources' && 'Resources'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-green-100">
        {/* Carbon Footprint Section */}
        {activeTab === 'carbon' && (
          <div className="p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-green-700 border-b border-green-200 pb-2">
              Reducing Carbon Footprint
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-green-500">
                <h3 className="font-semibold mb-3 text-green-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cover Cropping
                </h3>
                <p className="text-gray-700">
                  Plant clover or rye between seasons to sequester carbon and improve soil structure. Cover crops prevent erosion and add valuable nutrients back to the soil.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-green-500">
                <h3 className="font-semibold mb-3 text-green-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Reduced Tillage
                </h3>
                <p className="text-gray-700">
                  Maintain soil structure and reduce CO₂ release by minimizing soil disturbance. This practice preserves beneficial soil microorganisms and prevents carbon loss.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Natural Fertilizers Section */}
        {activeTab === 'fertilizers' && (
          <div className="p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-green-700 border-b border-green-200 pb-2">
              Natural Fertilizers
            </h2>
            <div className="overflow-hidden rounded-lg shadow">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-100">
                    <th className="p-3 text-left font-bold text-green-800">Type</th>
                    <th className="p-3 text-left font-bold text-green-800">Benefits</th>
                    <th className="p-3 text-left font-bold text-green-800">Application</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-green-50 transition-colors duration-200">
                    <td className="p-3 font-medium">Vermicompost</td>
                    <td className="p-3">Rich in nutrients, improves soil structure</td>
                    <td className="p-3">Mix into top 2-3 inches of soil</td>
                  </tr>
                  <tr className="border-b hover:bg-green-50 transition-colors duration-200">
                    <td className="p-3 font-medium">Green Manure</td>
                    <td className="p-3">Adds nitrogen, prevents erosion</td>
                    <td className="p-3">Till into soil before flowering</td>
                  </tr>
                  <tr className="hover:bg-green-50 transition-colors duration-200">
                    <td className="p-3 font-medium">Compost Tea</td>
                    <td className="p-3">Boosts beneficial microorganisms, enhances plant immunity</td>
                    <td className="p-3">Spray directly on foliage or soil</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Educational Videos Section */}
        {activeTab === 'videos' && (
          <div className="p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-green-700 border-b border-green-200 pb-2">
              Educational Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Video 1 - FIXED YouTube Link */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="p-4 bg-green-50">
                  <h3 className="font-semibold text-green-800">Cover Crop Techniques</h3>
                </div>
                <div className="aspect-w-16 aspect-h-9 relative">
                  <iframe 
                    className="w-full h-56"
                    src="https://www.youtube.com/embed/NM6uC_7CrM4" 
                    title="Cover Crop Techniques"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">Learn about implementing effective cover crop techniques for sustainable farming.</p>
                  <a 
                    href="https://www.youtube.com/watch?v=NM6uC_7CrM4" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Watch on YouTube
                  </a>
                </div>
              </div>
              
              {/* Video 2 - FIXED YouTube Link */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="p-4 bg-green-50">
                  <h3 className="font-semibold text-green-800">Natural Fertilizer Making</h3>
                </div>
                <div className="aspect-w-16 aspect-h-9 relative">
                  <iframe 
                    className="w-full h-56"
                    src="https://www.youtube.com/embed/bHJqmbXaWM8" 
                    title="Making Natural Fertilizers"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">Step-by-step guide to making your own natural fertilizers at home.</p>
                  <a 
                    href="https://www.youtube.com/watch?v=bHJqmbXaWM8" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Section */}
        {activeTab === 'resources' && (
          <div className="p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-green-700 border-b border-green-200 pb-2">
              Eco-Friendly Farming Resources
            </h2>
            <div className="bg-green-50 p-6 rounded-lg">
              <ul className="space-y-4">
                {[
                  { title: 'Guide to Water Conservation Techniques', icon: 'droplet' },
                  { title: 'Natural Pest Management Handbook', icon: 'shield' },
                  { title: 'Renewable Energy for Small Farms', icon: 'sun' },
                  { title: 'Biodiversity Enhancement Strategies', icon: 'leaf' }
                ].map((resource, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-green-200 p-2 rounded-full mr-3 text-green-700 flex-shrink-0">
                      {resource.icon === 'droplet' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14a7 7 0 01-7 7m0 0a7 7 0 01-7-7m14 0a7 7 0 00-7-7m-7 7a7 7 0 017-7" />
                        </svg>
                      )}
                      {resource.icon === 'shield' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                      {resource.icon === 'sun' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                      {resource.icon === 'leaf' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <a href="#" className="text-green-700 hover:text-green-900 hover:underline font-medium">
                        {resource.title}
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        {index === 0 && 'Learn effective methods to reduce water usage while maintaining crop health.'}
                        {index === 1 && 'Comprehensive guide to managing pests without harmful chemicals.'}
                        {index === 2 && 'Discover affordable renewable energy solutions for agricultural operations.'}
                        {index === 3 && 'Strategies to enhance biodiversity on your farm for better ecosystem services.'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Featured Section */}
      <div className="mt-12 bg-green-50 rounded-xl p-6 shadow-inner">
        <h2 className="text-xl font-bold mb-4 text-green-800">Featured: Latest Eco-Farming Trends</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-green-700 mb-2">Permaculture Design</h3>
            <p className="text-sm text-gray-600">Creating agricultural systems that mimic patterns found in nature.</p>
          </div>
          <div className="flex-1 bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-green-700 mb-2">Agroforestry</h3>
            <p className="text-sm text-gray-600">Integrating trees and shrubs into crop and animal farming systems.</p>
          </div>
          <div className="flex-1 bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-green-700 mb-2">Regenerative Agriculture</h3>
            <p className="text-sm text-gray-600">Farming practices that reverse climate change by rebuilding soil organic matter.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoFriendlyFarming;
