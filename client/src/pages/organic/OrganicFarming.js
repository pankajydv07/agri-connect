import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const OrganicFarming = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Organic Farming: Sustainable & Healthy Agriculture</h1>
            <p className="text-xl mb-8">Join the movement for sustainable agriculture and healthy food production</p>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-green-700 mb-6">
                <span className="mr-2">🌱</span> What is Organic Farming?
              </h2>
              <p className="text-gray-700 mb-4">
                Organic farming is a method of crop and livestock production that involves much more than choosing not to use pesticides, fertilizers, genetically modified organisms, antibiotics, and growth hormones.
              </p>
              <p className="text-gray-700 mb-4">
                It's a holistic system designed to optimize the productivity and fitness of diverse communities within the agro-ecosystem, including soil organisms, plants, livestock, and people.
              </p>
              <p className="text-gray-700">
                The principal goal of organic production is to develop enterprises that are sustainable and harmonious with the environment.
              </p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                alt="Organic farm with crops" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                alt="Farmer with organic produce" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-green-700 mb-6">
                <span className="mr-2">🌾</span> Benefits for Farmers and Consumers
              </h2>
              <h3 className="text-xl font-semibold mb-3">For Farmers:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Higher premium prices for produce</li>
                <li>Improved soil health and fertility</li>
                <li>Lower input costs (no expensive chemicals)</li>
                <li>Reduced exposure to harmful pesticides</li>
                <li>Enhanced biodiversity on farms</li>
              </ul>
              <h3 className="text-xl font-semibold mb-3">For Consumers:</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Higher nutritional value in food</li>
                <li>No chemical residues in food</li>
                <li>Better taste and flavor in produce</li>
                <li>Supporting sustainable farming practices</li>
                <li>Contributing to environmental conservation</li>
              </ul>
            </div>
          </div>

          {/* Differences Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
              <span className="mr-2">🧪</span> Organic vs. Conventional Farming
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">Aspect</th>
                    <th className="py-3 px-4 text-left">Organic Farming</th>
                    <th className="py-3 px-4 text-left">Conventional Farming</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">Fertilizers</td>
                    <td className="py-3 px-4">Organic compost, manure, green manure</td>
                    <td className="py-3 px-4">Synthetic chemical fertilizers</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-3 px-4 font-medium">Pest Control</td>
                    <td className="py-3 px-4">Natural predators, traps, biological controls</td>
                    <td className="py-3 px-4">Chemical pesticides, herbicides</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">Weed Management</td>
                    <td className="py-3 px-4">Crop rotation, mulching, hand weeding</td>
                    <td className="py-3 px-4">Chemical herbicides</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-3 px-4 font-medium">Soil Management</td>
                    <td className="py-3 px-4">Building soil health naturally</td>
                    <td className="py-3 px-4">Focus on plant nutrition via additives</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">Biodiversity</td>
                    <td className="py-3 px-4">High - encourages ecosystem diversity</td>
                    <td className="py-3 px-4">Low - often monoculture</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 font-medium">Environmental Impact</td>
                    <td className="py-3 px-4">Lower negative impact</td>
                    <td className="py-3 px-4">Higher negative impact</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Certifications Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-green-700 mb-6">
                <span className="mr-2">🛡</span> Certifications & Standards
              </h2>
              <p className="text-gray-700 mb-4">
                India has established robust certification systems to ensure that organic products meet specific standards and build consumer trust.
              </p>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">NPOP (National Programme for Organic Production)</h3>
                <p className="text-gray-700 mb-3">
                  The flagship certification program run by APEDA (Agricultural and Processed Food Products Export Development Authority) under the Ministry of Commerce and Industry.
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Recognized by European Union and Switzerland</li>
                  <li>Focuses on export quality standards</li>
                  <li>Comprehensive third-party certification</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">PGS-India (Participatory Guarantee System)</h3>
                <p className="text-gray-700 mb-3">
                  A quality assurance initiative that is locally relevant, emphasizing the participation of stakeholders, including producers and consumers.
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Managed by Ministry of Agriculture</li>
                  <li>More accessible for small and marginal farmers</li>
                  <li>Focuses on local markets and direct sales</li>
                </ul>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1774&q=80" 
                alt="Organic certification process" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>

          {/* Gallery Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
              <span className="mr-2">📷</span> Organic Farming Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                alt="Organic farm field" 
                className="rounded-lg shadow-md h-64 w-full object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1620857493029-823fe6e61edb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                alt="Farmer with organic vegetables" 
                className="rounded-lg shadow-md h-64 w-full object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1592982573555-c441f3d97476?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=874&q=80" 
                alt="Organic produce display" 
                className="rounded-lg shadow-md h-64 w-full object-cover"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-green-50 rounded-xl p-8 text-center shadow-md">
            <h2 className="text-3xl font-bold text-green-700 mb-4">Want to List Organic Products?</h2>
            <p className="text-lg text-gray-700 mb-6">Join our marketplace and connect with consumers looking for organic produce.</p>
            <Link 
              to="/farmer/products/add" 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-300 inline-block"
            >
              List Your Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganicFarming;