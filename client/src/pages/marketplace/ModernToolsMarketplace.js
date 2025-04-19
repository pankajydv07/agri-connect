import React, { useState } from 'react';

const ModernToolsMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  // Tool categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'sensors', name: 'Sensors & Monitoring' },
    { id: 'irrigation', name: 'Irrigation Systems' },
    { id: 'drones', name: 'Drones & Field Mapping' },
    { id: 'precision', name: 'Precision Equipment' },
    { id: 'solar', name: 'Solar Equipment' }
  ];

  // Price ranges
  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: 'under100', name: 'Under ₹10,000' },
    { id: '10000-50000', name: '₹10,000 - ₹50,000' },
    { id: '50000-100000', name: '₹50,000 - ₹1,00,000' },
    { id: 'above100000', name: 'Above ₹1,00,000' }
  ];

  // Tools data
  const tools = [
    {
      id: 1,
      name: "Soil Moisture Sensor",
      description: "Real-time soil moisture monitoring device that helps optimize irrigation scheduling and prevent water waste. Connects to smartphone apps for remote monitoring.",
      price: 3999,
      category: "sensors",
      image: "https://m.media-amazon.com/images/I/71jE+WbPVKL._AC_UF1000,1000_QL80_.jpg",
      rating: 4.5,
      reviews: 128,
      seller: "AgriTech Solutions"
    },
    {
      id: 2,
      name: "Drone Field Mapper Pro",
      description: "Agricultural drone that captures high-resolution field imagery, helping farmers identify pest problems, nutrient deficiencies, and irrigation issues before they become visible to the naked eye.",
      price: 75999,
      category: "drones",
      image: "https://m.media-amazon.com/images/I/61V3tFCrKUL._AC_UF1000,1000_QL80_.jpg",
      rating: 4.8,
      reviews: 56,
      seller: "DroneAgri Systems"
    },
    {
      id: 3,
      name: "Smart Weather Station",
      description: "Local weather monitoring system that provides real-time data on temperature, humidity, wind speed, and rainfall, enabling more informed farming decisions.",
      price: 12995,
      category: "sensors",
      image: "https://m.media-amazon.com/images/I/71ozbkgGbRL._AC_UF1000,1000_QL80_.jpg",
      rating: 4.6,
      reviews: 92,
      seller: "WeatherTech Farming"
    },
    {
      id: 4,
      name: "GPS Field Guidance System",
      description: "Precision farming system that uses GPS technology to guide tractors and implements with centimeter-level accuracy, reducing overlap and gaps in field operations.",
      price: 199999,
      category: "precision",
      image: "https://m.media-amazon.com/images/I/71LKj8RLbML._AC_UF1000,1000_QL80_.jpg",
      rating: 4.9,
      reviews: 45,
      seller: "PrecisionFarm Tech"
    },
    {
      id: 5,
      name: "Solar Water Pump System",
      description: "Renewable energy-powered irrigation solution that eliminates fuel costs and enables irrigation in remote locations without electricity access.",
      price: 28999,
      category: "solar",
      image: "https://m.media-amazon.com/images/I/71tiQRV0gQL._AC_UF1000,1000_QL80_.jpg",
      rating: 4.4,
      reviews: 103,
      seller: "SolarGrow India"
    },
    {
      id: 6,
      name: "Automatic Seed Dispenser",
      description: "Precision planting tool that ensures consistent seed spacing and depth for optimal germination and crop development.",
      price: 8495,
      category: "precision",
      image: "https://m.media-amazon.com/images/I/61xzB8eVMGL._AC_UF1000,1000_QL80_.jpg",
      rating: 4.3,
      reviews: 76,
      seller: "FarmEquip Pro"
    },
    {
      id: 7,
      name: "Smart Livestock Tracker",
      description: "IoT device that monitors animal location, health metrics, and behavior patterns to improve livestock management and early disease detection.",
      price: 5999,
      category: "sensors",
      image: "https://m.media-amazon.com/images/I/61tOxCLtHoL._AC_UF1000,1000_QL80_.jpg",
      rating: 4.2,
      reviews: 64,
      seller: "LivestockTech Solutions"
    },
    {
      id: 8,
      name: "Automatic Greenhouse Controller",
      description: "Smart system that monitors and controls greenhouse environmental conditions including temperature, humidity, ventilation, and irrigation.",
      price: 23999,
      category: "precision",
      image: "https://m.media-amazon.com/images/I/71gbWvVWrKL._AC_UF1000,1000_QL80_.jpg",
      rating: 4.7,
      reviews: 38,
      seller: "GreenTech Solutions"
    },
    {
      id: 9,
      name: "Portable Soil Analyzer",
      description: "Handheld device that provides instant analysis of soil nutrients, pH levels, and organic matter content, helping optimize fertilizer application.",
      price: 15995,
      category: "sensors",
      image: "https://m.media-amazon.com/images/I/71zUI3yOHzL._AC_UF1000,1000_QL80_.jpg",
      rating: 4.5,
      reviews: 87,
      seller: "SoilTech Innovations"
    },
    {
      id: 10,
      name: "Drip Irrigation Kit - 1 Acre",
      description: "Complete water-efficient irrigation system for 1 acre of farmland, including pipes, drippers, filters, and connectors.",
      price: 18999,
      category: "irrigation",
      image: "https://m.media-amazon.com/images/I/71hMkt4HxKL._SL1500_.jpg",
      rating: 4.6,
      reviews: 124,
      seller: "AquaFarm Systems"
    },
    {
      id: 11,
      name: "Solar Insect Killer Lamp",
      description: "Chemical-free pest control device powered by solar energy, attracting and eliminating harmful insects in crop fields.",
      price: 2499,
      category: "solar",
      image: "https://m.media-amazon.com/images/I/61S+5FytpuL._SL1500_.jpg",
      rating: 4.0,
      reviews: 152,
      seller: "EcoFarm Solutions"
    },
    {
      id: 12,
      name: "Micro Sprinkler System Kit",
      description: "Water-saving irrigation system ideal for vegetable gardens and smaller farms with uniform water distribution.",
      price: 7999,
      category: "irrigation",
      image: "https://m.media-amazon.com/images/I/71K1E7CeTnL._SL1500_.jpg",
      rating: 4.4,
      reviews: 93,
      seller: "MicroIrrigation Tech"
    }
  ];

  // Filter tools based on search, category, and price range
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange === 'under100') {
      matchesPrice = tool.price < 10000;
    } else if (priceRange === '10000-50000') {
      matchesPrice = tool.price >= 10000 && tool.price <= 50000;
    } else if (priceRange === '50000-100000') {
      matchesPrice = tool.price > 50000 && tool.price <= 100000;
    } else if (priceRange === 'above100000') {
      matchesPrice = tool.price > 100000;
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-xl shadow-lg p-8 mb-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Modern Farming Tools Marketplace</h1>
          <p className="text-lg mb-6">Discover cutting-edge tools and technology to enhance your farm's productivity and sustainability</p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for farming tools and equipment..."
              className="w-full py-3 px-5 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-2 top-2 bg-green-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Filter Tools</h2>
            
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-700">Categories</h3>
              {categories.map(category => (
                <div key={category.id} className="mb-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      className="h-4 w-4 text-green-600"
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                    />
                    <span className="ml-2 text-gray-700">{category.name}</span>
                  </label>
                </div>
              ))}
            </div>
            
            {/* Price Range Filter */}
            <div>
              <h3 className="text-md font-medium mb-3 text-gray-700">Price Range</h3>
              {priceRanges.map(range => (
                <div key={range.id} className="mb-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      className="h-4 w-4 text-green-600"
                      checked={priceRange === range.id}
                      onChange={() => setPriceRange(range.id)}
                    />
                    <span className="ml-2 text-gray-700">{range.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="md:col-span-3">
          {filteredTools.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No tools found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <div key={tool.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={tool.image} 
                      alt={tool.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{tool.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(tool.rating) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{tool.rating} ({tool.reviews} reviews)</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-green-700">{formatPrice(tool.price)}</span>
                      <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm transition-colors duration-300">
                        View Details
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Sold by: {tool.seller}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernToolsMarketplace;