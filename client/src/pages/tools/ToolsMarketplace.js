import React from 'react';
import { Link } from 'react-router-dom';

const farmingTools = [
  {
    id: 1,
    name: "Soil Moisture Sensor",
    description: "Real-time soil moisture monitoring device that helps optimize irrigation scheduling and prevent water waste. Connects to smartphone apps for remote monitoring.",
    benefits: ["Reduces water usage by up to 30%", "Prevents over/under watering", "Improves crop yield and quality"],
    image: "https://assets.newatlas.com/dims4/default/b771fae/2147483647/strip/true/crop/1024x683+0+0/resize/1200x800!/quality/90/?url=http%3A%2F%2Fnewatlas-brightspot.s3.amazonaws.com%2Fd5%2F63%2F9d2efaaa49ef9afbc003716a24b1%2F63e484911ce0955620122692-1.jpeg",
    price: "$45.99",
    amazonLink: "https://www.amazon.com/soil-moisture-sensors/b?ie=UTF8&node=14244461"
  },
  {
    id: 2,
    name: "Drone Field Mapper",
    description: "Agricultural drone that captures high-resolution field imagery, helping farmers identify pest problems, nutrient deficiencies, and irrigation issues before they become visible to the naked eye.",
    benefits: ["Early pest/disease detection", "Creates detailed field maps", "Reduces field scouting time by 75%"],
    image: "https://www.shutterstock.com/image-photo/agricultural-drones-crops-concept-technology-600nw-2385015165.jpg",
    price: "$899.99",
    amazonLink: "https://www.amazon.com/s?k=agricultural+drones"
  },
  {
    id: 3,
    name: "Smart Weather Station",
    description: "Local weather monitoring system that provides real-time data on temperature, humidity, wind speed, and rainfall, enabling more informed farming decisions.",
    benefits: ["Localized weather forecasting", "Frost alerts", "Optimal planting timing"],
    image: "https://www.niubol.com/static/upload/image/20240901/1725175871999858.jpg",
    price: "$159.95",
    amazonLink: "https://www.amazon.com/s?k=weather+station+for+agriculture"
  },
  {
    id: 4,
    name: "GPS Field Guidance System",
    description: "Precision farming system that uses GPS technology to guide tractors and implements with centimeter-level accuracy, reducing overlap and gaps in field operations.",
    benefits: ["Reduces seed/fertilizer waste", "Minimizes operator fatigue", "Works in low visibility conditions"],
    image: "https://www.fieldbee.com/wp-content/uploads/2020/09/CR7-header-1920x500-1.jpg",
    price: "$2,499.99",
    amazonLink: "https://www.amazon.com/s?k=gps+guidance+system+agriculture"
  },
  {
    id: 5,
    name: "Solar Water Pump System",
    description: "Renewable energy-powered irrigation solution that eliminates fuel costs and enables irrigation in remote locations without electricity access.",
    benefits: ["Zero energy costs", "Low maintenance", "Environmentally friendly"],
    image: "https://uslpv.com/wp-content/uploads/2023/10/agriculture-solar-water-pump.png",
    price: "$349.99",
    amazonLink: "https://www.amazon.com/s?k=solar+water+pump+agriculture"
  },
  {
    id: 6,
    name: "Automatic Seed Dispenser",
    description: "Precision planting tool that ensures consistent seed spacing and depth for optimal germination and crop development.",
    benefits: ["Uniform plant spacing", "Reduces seed waste", "Increases germination success"],
    image: "https://nevonprojects.com/wp-content/uploads/2017/11/seed-sowing-robot-project2.jpg",
    price: "$124.95",
    amazonLink: "https://www.amazon.com/s?k=precision+seed+dispenser"
  },
  {
    id: 7,
    name: "Smart Livestock Tracker",
    description: "IoT device that monitors animal location, health metrics, and behavior patterns to improve livestock management and early disease detection.",
    benefits: ["Real-time health monitoring", "Location tracking", "Behavior pattern analysis"],
    image: "https://psiborg.in/wp-content/uploads/2024/02/cattle-monitoring.webp",
    price: "$89.99 per unit",
    amazonLink: "https://www.amazon.com/s?k=livestock+tracking+device"
  },
  {
    id: 8,
    name: "Automatic Greenhouse Controller",
    description: "Smart system that monitors and controls greenhouse environmental conditions including temperature, humidity, ventilation, and irrigation.",
    benefits: ["Maintains optimal growing conditions", "Remote smartphone control", "Energy efficient"],
    image: "https://d17ocfn2f5o4rl.cloudfront.net/wp-content/uploads/2020/12/Automated-Greenhouse-System-with-Profound-Analytics.jpg",
    price: "$279.99",
    amazonLink: "https://www.amazon.com/s?k=greenhouse+controller+system"
  },
  {
    id: 9,
    name: "Portable Soil Analyzer",
    description: "Handheld device that provides instant analysis of soil nutrients, pH levels, and organic matter content, helping optimize fertilizer application.",
    benefits: ["Instant soil analysis", "Reduces fertilizer waste", "Improves nutrient management"],
    image: "https://www.renkeer.com/wp-content/uploads/2021/06/soil-recorder.jpg",
    price: "$199.95",
    amazonLink: "https://www.amazon.com/s?k=portable+soil+analyzer"
  },
  {
    id: 10,
    name: "Hydroponic Growing System",
    description: "Soilless growing system that uses nutrient-rich water solutions to grow plants with higher yields in less space than traditional farming.",
    benefits: ["Uses 90% less water", "Faster growth cycles", "No weeding required"],
    image: "https://lh4.googleusercontent.com/proxy/8TrCSN0SU8Inh_XX8WWgSXoGMcOvmuAW8DW3piA1GR3XdYAqDPdQZvTG1UVYN9F100a7uIN4y3pogaDiel8m6ZBQj4DBkwEUETa9iZlz",
    price: "$349.99",
    amazonLink: "https://www.amazon.com/s?k=hydroponic+growing+system"
  }
];

const ToolsMarketplace = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-green-700">Modern Farming Tools Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farmingTools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src={tool.image} 
                alt={tool.name}
                className="object-cover w-full h-48"
              />
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">{tool.name}</h2>
              <p className="text-gray-600 mb-4">{tool.description}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Key Benefits:</h3>
                <ul className="space-y-1">
                  {tool.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-green-600">{tool.price}</span>
                <Link 
                  to={`/tools/${tool.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolsMarketplace; 