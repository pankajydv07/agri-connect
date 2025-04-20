import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ToolDetails = () => {
  const { toolId } = useParams();

  // Tool data with additional details for the details page
  const tools = [
    {
      id: 1,
      name: "Soil Moisture Sensor",
      description: "Real-time soil moisture monitoring device that helps optimize irrigation scheduling and prevent water waste. Connects to smartphone apps for remote monitoring.",
      longDescription: `The Soil Moisture Sensor is an advanced IoT device designed specifically for agricultural applications. It provides accurate, real-time measurements of soil moisture content at various depths, helping farmers make informed decisions about irrigation timing and volume.

This smart sensor uses capacitive sensing technology to measure volumetric water content in soil with high precision. The data is transmitted wirelessly to your smartphone or tablet, where you can view historical trends, set custom alerts, and integrate with automated irrigation systems.`,
      benefits: ["Reduces water usage by up to 30%", "Prevents over/under watering", "Improves crop yield and quality", "Real-time monitoring via smartphone", "Long battery life", "Easy installation"],
      price: 4599,
      category: "sensors",
      image: "https://assets.newatlas.com/dims4/default/b771fae/2147483647/strip/true/crop/1024x683+0+0/resize/1200x800!/quality/90/?url=http%3A%2F%2Fnewatlas-brightspot.s3.amazonaws.com%2Fd5%2F63%2F9d2efaaa49ef9afbc003716a24b1%2F63e484911ce0955620122692-1.jpeg",
      rating: 4.5,
      reviews: 128,
      seller: "AgriTech Solutions",
      amazonLink: "https://www.amazon.com/soil-moisture-sensors/b?ie=UTF8&node=14244461",
      howToUse: [
        "Choose an appropriate location in your field that represents the general soil conditions",
        "Clear any debris and create a pilot hole if the soil is very compact",
        "Insert the sensor probe carefully into the soil at root level (usually 4-6 inches deep)",
        "Install the solar-powered transmitter unit nearby, ensuring good sunlight exposure",
        "Download and install the companion mobile app from your device's app store",
        "Follow the in-app setup wizard to connect your sensor to your account",
        "Set up custom alerts for low moisture conditions",
        "Monitor readings daily and adjust irrigation schedules accordingly"
      ],
      videoUrl: "https://www.youtube.com/embed/LoüXpÜqK8M",
      specifications: {
        range: "0-100% volumetric water content",
        accuracy: "±3%",
        batteryLife: "6 months with standard AA batteries",
        connectivity: "Bluetooth 4.0 / WiFi",
        waterproof: "IP67 rated",
        measurementDepth: "Up to 60cm",
        readingFrequency: "Every 5 minutes",
        dataStorage: "30 days of readings",
        warranty: "2 years limited warranty"
      },
      maintenanceTips: [
        "Clean the sensor probes monthly to ensure accurate readings",
        "Replace batteries when indicated by the app",
        "Calibrate the sensor every 6 months",
        "Check and tighten any loose connections",
        "Keep the solar panel clean for optimal charging"
      ]
    }
    // ... other tools with similar detailed data structure
  ];

  const tool = tools.find(t => t.id === parseInt(toolId));

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tool not found</h2>
          <p className="mt-2 text-gray-600">The tool you're looking for doesn't exist or has been removed.</p>
          <Link to="/tools-marketplace" className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="mb-8">
        <Link 
          to="/tools-marketplace" 
          className="text-green-600 hover:text-green-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </Link>
      </nav>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="bg-green-50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.floor(tool.rating) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{tool.rating} ({tool.reviews} reviews)</span>
              </div>
              <div className="prose max-w-none">
                <p className="text-lg text-gray-600">{tool.longDescription || tool.description}</p>
              </div>
              <div className="text-3xl font-bold text-green-600">{formatPrice(tool.price)}</div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Sold by: {tool.seller}</p>
                <a 
                  href={tool.amazonLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
                >
                  Buy on Amazon
                </a>
              </div>
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src={tool.image} 
                alt={tool.name} 
                className="object-contain w-full h-full rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Benefits & Features */}
        <div className="p-8 border-b">
          <h2 className="text-2xl font-semibold mb-4">Benefits & Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How to Use */}
        <div className="p-8 border-b">
          <h2 className="text-2xl font-semibold mb-4">How to Use {tool.name}</h2>
          <ol className="space-y-4">
            {tool.howToUse.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mr-3 font-semibold text-sm">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Product Video */}
        <div className="p-8 border-b">
          <h2 className="text-2xl font-semibold mb-4">Product Demo</h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={tool.videoUrl}
              title={`${tool.name} Demo`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-96 rounded-lg"
            ></iframe>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="p-8 border-b">
          <h2 className="text-2xl font-semibold mb-4">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(tool.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-gray-600">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Tips */}
        {tool.maintenanceTips && (
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Maintenance Tips</h2>
            <ul className="space-y-3">
              {tool.maintenanceTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolDetails; 