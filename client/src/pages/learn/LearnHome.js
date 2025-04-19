import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LearnHome = () => {
  const [selectedCropVideo, setSelectedCropVideo] = useState(null);

  // Crop videos data moved from ModernTechnology page
  const cropVideos = [
    {
      id: 1,
      crop: "Rice",
      title: "Modern Rice Cultivation Methods",
      description: "Learn about SRI (System of Rice Intensification) method that increases yield while using less water and inputs.",
      videoId: "CYqDVJp0Ezo",
      tips: [
        "Plant seedlings at 8-12 days old",
        "Single seedling per hill with wider spacing",
        "Maintain alternating wet and dry soil conditions",
        "Use organic fertilizers when possible"
      ]
    },
    {
      id: 2,
      crop: "Wheat",
      title: "Precision Wheat Farming Techniques",
      description: "Modern approaches to wheat cultivation focusing on precision agriculture and optimal use of resources.",
      videoId: "HKKVsGLBc0Y",
      tips: [
        "Use GPS-guided equipment for precision seeding",
        "Implement crop rotation with legumes",
        "Monitor soil moisture with sensors",
        "Consider no-till or reduced tillage methods"
      ]
    },
    {
      id: 3,
      crop: "Cotton",
      title: "Sustainable Cotton Production",
      description: "Environmentally friendly methods for growing cotton with reduced chemicals and water usage.",
      videoId: "P1U8dYi8tXo",
      tips: [
        "Implement IPM (Integrated Pest Management)",
        "Use drip irrigation for water efficiency",
        "Consider organic or BCI (Better Cotton Initiative) standards",
        "Monitor with field sensors for precise interventions"
      ]
    },
    {
      id: 4,
      crop: "Vegetables",
      title: "Hydroponic Vegetable Growing",
      description: "Soilless cultivation methods for growing vegetables with higher yields in less space.",
      videoId: "Fb2VGgKXYP0",
      tips: [
        "Monitor nutrient solution pH and EC daily",
        "Maintain proper water temperature (65-75°F)",
        "Ensure good oxygen levels in solution",
        "Implement pest prevention strategies"
      ]
    },
    {
      id: 5,
      crop: "Pulses",
      title: "Modern Pulse Crop Management",
      description: "Advanced techniques for growing pulse crops with improved nitrogen fixation and disease resistance.",
      videoId: "KIqAGUQU9Hc",
      tips: [
        "Inoculate seeds with appropriate rhizobia",
        "Implement proper crop rotation",
        "Apply micronutrients based on soil tests",
        "Use mulching for weed control"
      ]
    }
  ];

  const handleCropVideoSelect = (video) => {
    setSelectedCropVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseVideo = () => {
    setSelectedCropVideo(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {selectedCropVideo ? (
        // Crop video details section
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-green-500 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-green-700">{selectedCropVideo.title}</h2>
            <button 
              onClick={handleCloseVideo}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors duration-200"
            >
              Back to Hub
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  className="w-full h-64 md:h-72 rounded-lg shadow-md" 
                  src={`https://www.youtube.com/embed/${selectedCropVideo.videoId}`}
                  title={selectedCropVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-2 text-green-600">About {selectedCropVideo.crop} Cultivation</h3>
                <p className="text-gray-700">{selectedCropVideo.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-600">Key Growing Tips</h3>
                <ul className="space-y-2">
                  {selectedCropVideo.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4 text-green-700">SDG Knowledge Hub</h1>
          <p className="mb-8 text-gray-700">Resources to help farmers align with Sustainable Development Goals and implement sustainable practices</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/sdg-knowledge/organic-farming" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-2 text-green-600">Organic Farming</h2>
                <p className="text-gray-600 mb-4">Learn natural cultivation methods without chemicals</p>
                <div className="mt-auto">
                  <span className="text-green-600 font-medium">Learn more →</span>
                </div>
              </div>
            </Link>
            
            <Link to="/sdg-knowledge/eco-friendly" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-2 text-green-600">Carbon Footprint</h2>
                <p className="text-gray-600 mb-4">Eco-friendly methods to reduce environmental impact</p>
                <div className="mt-auto">
                  <span className="text-green-600 font-medium">Learn more →</span>
                </div>
              </div>
            </Link>
            
            <Link to="/sdg-knowledge/modern-technology" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-2 text-green-600">Modern Technology</h2>
                <p className="text-gray-600 mb-4">Discover tech tools for efficient farming</p>
                <div className="mt-auto">
                  <span className="text-green-600 font-medium">Learn more →</span>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-12 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-green-700">SDG Goals in Agriculture</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <h3 className="font-semibold text-xl mb-4 text-green-600">SDG 2: Zero Hunger</h3>
                <p className="text-gray-700 mb-3">
                  End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Increase agricultural productivity sustainably</li>
                  <li>Implement resilient farming practices</li>
                  <li>Maintain genetic diversity of seeds and plants</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <h3 className="font-semibold text-xl mb-4 text-green-600">SDG 13: Climate Action</h3>
                <p className="text-gray-700 mb-3">
                  Take urgent action to combat climate change and its impacts on agriculture.
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Reduce greenhouse gas emissions from farming</li>
                  <li>Adopt climate-resilient crops and practices</li>
                  <li>Implement water-saving irrigation techniques</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Crop Growing Videos Section - Moved from ModernTechnology page */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-green-700 border-b-2 pb-2 border-green-500">Crop Growing Videos</h2>
            <p className="mb-6 text-gray-700">Watch educational videos on sustainable cultivation methods for different crops</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {cropVideos.map(video => (
                <div 
                  key={video.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleCropVideoSelect(video)}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="bg-green-600 bg-opacity-90 rounded-full p-3 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <img 
                      src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} 
                      alt={video.title} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium mb-2">
                      {video.crop}
                    </span>
                    <h3 className="font-semibold text-green-700 text-lg mb-2">{video.title}</h3>
                    <p className="text-gray-600 line-clamp-2 text-sm">
                      {video.description}
                    </p>
                    <div className="mt-3 text-right">
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200">
                        Watch Video →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LearnHome;
