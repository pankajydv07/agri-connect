import React, { useState } from 'react';
import axios from 'axios';
import './CropRecommendation.css';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    soil: '',
    season: '',
    location: '',
    previousCrops: '',
    irrigationAvailable: 'yes',
    landSize: '',
    soilPh: '',
    farmingExperience: 'beginner'
  });
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation('');

    try {
      const response = await axios.post('/api/crop/recommend', formData);
      if (response.data && response.data.recommendation) {
        setRecommendation(response.data.recommendation);
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response) {
        // Server responded with an error
        setError(err.response.data.error || 'Failed to get crop recommendation. Please try again.');
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="crop-recommendation-container">
          <h2 className="text-3xl font-bold mb-6">Crop Recommendation</h2>
          <form onSubmit={handleSubmit} className="crop-form">
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-group">
                <label htmlFor="soil">Soil Type:</label>
                <input
                  type="text"
                  id="soil"
                  name="soil"
                  value={formData.soil}
                  onChange={handleChange}
                  required
                  placeholder="e.g., loamy, sandy, clay"
                  className="w-full"
                />
              </div>

              <div className="form-group">
                <label htmlFor="season">Season:</label>
                <select
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  required
                  className="w-full"
                >
                  <option value="">Select Season</option>
                  <option value="summer">Summer</option>
                  <option value="winter">Winter</option>
                  <option value="monsoon">Monsoon</option>
                  <option value="spring">Spring</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Maharashtra, Karnataka"
                  className="w-full"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-group">
                <label htmlFor="previousCrops">Previous Crops (last 2 seasons):</label>
                <textarea
                  id="previousCrops"
                  name="previousCrops"
                  value={formData.previousCrops}
                  onChange={handleChange}
                  placeholder="e.g., Rice (last season), Wheat (before that)"
                  className="w-full"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label htmlFor="landSize">Land Size (in acres):</label>
                <input
                  type="number"
                  id="landSize"
                  name="landSize"
                  value={formData.landSize}
                  onChange={handleChange}
                  placeholder="e.g., 2.5"
                  className="w-full"
                  step="0.1"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="soilPh">Soil pH (if known):</label>
                <input
                  type="number"
                  id="soilPh"
                  name="soilPh"
                  value={formData.soilPh}
                  onChange={handleChange}
                  placeholder="e.g., 6.5"
                  className="w-full"
                  step="0.1"
                  min="0"
                  max="14"
                />
              </div>

              <div className="form-group">
                <label htmlFor="irrigationAvailable">Irrigation Availability:</label>
                <select
                  id="irrigationAvailable"
                  name="irrigationAvailable"
                  value={formData.irrigationAvailable}
                  onChange={handleChange}
                  className="w-full"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="farmingExperience">Farming Experience:</label>
                <select
                  id="farmingExperience"
                  name="farmingExperience"
                  value={formData.farmingExperience}
                  onChange={handleChange}
                  className="w-full"
                >
                  <option value="beginner">Beginner (0-2 years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="experienced">Experienced (5+ years)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Getting Recommendation...' : 'Get Recommendation'}
            </button>
          </form>

          {error && (
            <div className="error-message mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {recommendation && (
            <div className="recommendation-result mt-6 p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Recommendation:</h3>
              <p className="text-gray-700 leading-relaxed">{recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation; 