import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import OpenAI from 'openai';

// OpenAI API configuration constants
const OPENAI_API_KEY = "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"; // Replace with your actual API key
const OPENAI_BASE_URL = "https://models.github.ai/inference"; // Replace if using a custom API endpoint
const OPENAI_MODEL = "openai/gpt-4.1";

// Enhanced styled components
const Card = ({ children, className }) => 
  <div className={`card ${className}`}>{children}</div>;

const CardContent = ({ children, className }) => 
  <div className={className}>{children}</div>;

const Input = (props) => 
  <input className="w-full" {...props} />;

const Button = ({ children, ...props }) => (
  <button {...props}>
    {children}
  </button>
);

const CarbonFootprintCalculator = () => {
  const [fertilizer, setFertilizer] = useState('urea');
  const [transportDistance, setTransportDistance] = useState(0);
  const [transportMode, setTransportMode] = useState('truck');
  const [method, setMethod] = useState('conventional');
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingAISuggestions, setIsLoadingAISuggestions] = useState(false);

  const emissionFactors = {
    fertilizer: { urea: 1.5, npk: 2.0, organic: 0.5 },
    transport: { truck: 0.2, train: 0.1, electric: 0.05 },
    method: { conventional: 1.0, modern: 0.6, organic: 0.3 }
  };

  // Get personalized AI suggestions using OpenAI's GPT-4.1
  const getAISuggestions = async (total, breakdown) => {
    if (!OPENAI_API_KEY) return;
    
    setIsLoadingAISuggestions(true);
    
    try {
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        baseURL: OPENAI_BASE_URL || undefined,
        dangerouslyAllowBrowser: true // Only use in a secure environment
      });
      
      const userContext = {
        total_emissions: parseFloat(total),
        category: getEmissionCategory(total).label,
        fertilizer_type: fertilizer,
        transport_mode: transportMode,
        transport_distance: transportDistance,
        farming_method: method,
        breakdown: {
          fertilizer: breakdown[0].emission,
          transport: breakdown[1].emission,
          method_factor: breakdown[2].emission
        }
      };
      
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an agricultural sustainability expert. Provide personalized, actionable suggestions to reduce carbon footprint in farming operations. Be specific, practical and focus on the highest impact areas first."
          },
          {
            role: "user",
            content: `Based on my carbon footprint analysis, please provide 5 specific recommendations to reduce my farm's emissions. Here's my data: ${JSON.stringify(userContext)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      if (response.choices && response.choices[0].message.content) {
        // Parse the response and extract suggestions
        const aiText = response.choices[0].message.content;
        
        // Extract suggestions - looking for numbered items or bullet points
        const suggestionRegex = /(?:\d+\.|\|\-)\s([^\n]+)/g;
        const matches = Array.from(aiText.matchAll(suggestionRegex), m => m[1].trim());
        
        if (matches.length > 0) {
          setSuggestions(matches);
        } else {
          // If regex fails, split by newlines as fallback
          const lines = aiText.split('\n').filter(line => 
            line.trim().length > 10 && !line.toLowerCase().includes('recommendation')
          );
          setSuggestions(lines);
        }
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      // Fall back to default suggestions
      generateSuggestions(total);
    } finally {
      setIsLoadingAISuggestions(false);
    }
  };

  const generateSuggestions = (total) => {
    // Only use default suggestions if not using AI
    if (OPENAI_API_KEY) return;
    
    let tips = [];

    if (total < 1.5) {
      tips = [
        "Great job! You're already farming sustainably 💚",
        "Keep using natural fertilizers like compost and vermicompost.",
        "Consider sharing your practices with neighboring farmers!"
      ];
    } else if (total >= 1.5 && total <= 3.5) {
      tips = [
        "Switch partially to organic manure instead of full NPK/Urea use.",
        "Use drip irrigation to reduce water and fuel usage.",
        "Replace diesel pumps with solar-powered ones.",
        "Try crop rotation to maintain soil fertility and reduce emissions."
      ];
    } else {
      tips = [
        "Reduce urea/NPK usage and adopt bio-fertilizers like Rhizobium.",
        "Plant trees around your farm — they absorb CO₂ 🌳",
        "Avoid stubble burning — compost waste instead.",
        "Join or start a local composting group to offset carbon."
      ];
    }
    
    setSuggestions(tips);
  };

  const calculateEmission = () => {
    setIsCalculating(true);
    
    // Simulate processing time for a nicer UX
    setTimeout(() => {
      const fertEmission = emissionFactors.fertilizer[fertilizer];
      const transEmission = transportDistance * emissionFactors.transport[transportMode];
      const methodFactor = emissionFactors.method[method];

      const total = (fertEmission + transEmission) * methodFactor;

      const breakdown = [
        { name: 'Fertilizer', emission: fertEmission, fill: '#34d399' },
        { name: 'Transport', emission: transEmission, fill: '#60a5fa' },
        { name: 'Farming Method', emission: methodFactor, fill: '#a78bfa' }
      ];

      setResult({
        total: total.toFixed(2),
        breakdown: breakdown
      });
      
      // Generate suggestions based on total emissions
      if (OPENAI_API_KEY) {
        getAISuggestions(total.toFixed(2), breakdown);
      } else {
        generateSuggestions(total);
      }
      setIsCalculating(false);
    }, 800);
  };

  const getEmissionCategory = (total) => {
    const num = parseFloat(total);
    if (num < 1.5) return { label: 'Low Impact', color: '#10b981' };
    if (num <= 3.5) return { label: 'Moderate Impact', color: '#f59e0b' };
    return { label: 'High Impact', color: '#ef4444' };
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Carbon Footprint Calculator</h1>
      <Card>
        <CardContent>
          <div className="grid">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center">
                <span className="mr-2">📊</span> Input Your Farming Data
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Fill in the fields below to estimate your carbon footprint.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Type</label>
                <select 
                  value={fertilizer} 
                  onChange={(e) => setFertilizer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="urea">Urea</option>
                  <option value="npk">NPK</option>
                  <option value="organic">Organic</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Different fertilizers have varying carbon impacts.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farming Method</label>
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="conventional">Conventional</option>
                  <option value="modern">Modern</option>
                  <option value="organic">Organic</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Your farming approach affects overall emissions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transport Mode</label>
                <select 
                  value={transportMode} 
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="truck">Truck</option>
                  <option value="train">Train</option>
                  <option value="electric">Electric Vehicle</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How you transport impacts your carbon footprint.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transport Distance (km)</label>
                <Input 
                  type="number" 
                  value={transportDistance} 
                  onChange={(e) => setTransportDistance(Number(e.target.value))} 
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Longer distances mean higher emissions.
                </p>
              </div>
            </div>

            <Button 
              onClick={calculateEmission} 
              disabled={isCalculating}
              className="mt-4 mx-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Carbon Footprint'}
            </Button>

            {result && (
              <div className="mt-6 animate-fade-in">
                {/* Result Summary */}
                <div className="flex items-center justify-center mb-6">
                  <div 
                    className="text-center p-5 rounded-full w-40 h-40 flex flex-col items-center justify-center"
                    style={{ 
                      backgroundColor: `${getEmissionCategory(result.total).color}15`,
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      borderColor: getEmissionCategory(result.total).color,
                      boxShadow: `0 0 20px ${getEmissionCategory(result.total).color}30`
                    }}
                  >
                    <span className="block text-3xl font-bold" style={{ color: getEmissionCategory(result.total).color }}>
                      {result.total}
                    </span>
                    <span className="block text-sm font-medium">kg CO₂e</span>
                    <span className="text-xs mt-1" style={{ color: getEmissionCategory(result.total).color }}>
                      {getEmissionCategory(result.total).label}
                    </span>
                  </div>
                </div>

                {/* Chart */}
                <h3 className="text-lg font-semibold text-green-700 mb-3">Emissions Breakdown</h3>
                <div className="bg-white p-2 rounded-lg shadow-inner">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={result.breakdown} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          border: 'none'
                        }}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="emission" name="Emission (kg CO₂e)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Suggestions */}
                {isLoadingAISuggestions ? (
                  <div className="mt-6 bg-blue-50 p-5 rounded-lg text-center">
                    <div className="animate-pulse flex flex-col items-center justify-center">
                      <div className="text-blue-700 mb-3">Generating AI-powered suggestions...</div>
                      <div className="h-2 bg-blue-200 rounded w-1/2 mb-2"></div>
                      <div className="h-2 bg-blue-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-blue-200 rounded w-2/3 mb-2"></div>
                    </div>
                  </div>
                ) : suggestions.length > 0 && (
                  <div className="mt-6 bg-green-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                      <span className="mr-2">💡</span> 
                      {OPENAI_API_KEY ? 'AI-Powered Recommendations' : 'Recommendations'}
                    </h3>
                    <ul className="space-y-2">
                      {suggestions.map((tip, index) => (
                        <li key={index} className="flex items-start transition-transform hover:translate-x-1">
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarbonFootprintCalculator; 