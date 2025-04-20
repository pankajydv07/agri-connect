import React, { useState } from 'react';
import { FaUpload, FaSpinner } from 'react-icons/fa';

const PestDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate analysis with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock analysis based on the image
      const mockAnalysis = `
# Plant Health Analysis

## Pest Detection
- **Colorado Potato Beetle** (Leptinotarsa decemlineata) identified
- Adult beetles present with characteristic yellow-orange body and black stripes
- No signs of False Potato Beetle (Leptinotarsa juncta) detected
- Distinct black stripes on wing covers confirm identification

## Visual Assessment
- Adult beetles visible on plant leaves
- Characteristic feeding damage (holes in leaves)
- Yellow-orange eggs may be present on underside of leaves
- Larvae (reddish with black spots) might be present

## Treatment Recommendations
1. **Immediate Actions**:
   - Hand-pick adult beetles and larvae
   - Remove and destroy egg masses
   - Apply neem oil or spinosad-based organic insecticide
   - Use floating row covers to prevent further infestation

2. **Chemical Control** (if infestation is severe):
   - Apply pyrethrin-based insecticide
   - Consider using Bacillus thuringiensis (Bt) for larvae
   - Rotate chemical treatments to prevent resistance
   - Follow all safety guidelines and pre-harvest intervals

## Preventive Measures
- Rotate crops annually (avoid planting potatoes in same area)
- Remove nightshade family weeds
- Use early-maturing potato varieties
- Plant trap crops away from main crop
- Monitor plants regularly during growing season

## Life Cycle Information
- Adults overwinter in soil
- Eggs laid in clusters on underside of leaves
- Larvae feed for 2-3 weeks before pupating
- Multiple generations possible per season

## Next Steps
- Monitor plants daily for new beetles
- Check for egg masses every 2-3 days
- Document beetle population changes
- Consider introducing natural predators
- Maintain treatment schedule for 4-6 weeks

## Expected Recovery Time
- Initial control: 1-2 weeks
- Full recovery: 3-4 weeks
- Continuous monitoring required throughout growing season
`;

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Error analyzing image: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Pest Detection</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Plant Image</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 rounded-lg shadow-md"
                />
              </div>
            )}

            <button
              onClick={analyzeImage}
              disabled={!selectedImage || isLoading}
              className={`mt-4 px-6 py-2 rounded-md text-white font-medium flex items-center space-x-2
                ${!selectedImage || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze Image</span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {analysis && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h3>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="prose max-w-none">
                {analysis.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PestDetection; 