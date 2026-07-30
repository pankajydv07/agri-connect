import React, { useState } from 'react';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import DemoBanner from '../../components/ui/DemoBanner';

// TODO: replace mock analysis with a real call to POST /api/pest-detection
// The endpoint should accept multipart/form-data with an "image" field and
// return JSON with at least { pest, confidence, treatment, prevention }.

const SAMPLE_ANALYSIS = {
  sections: [
    {
      heading: '[SAMPLE DATA] Pest Identification',
      content:
        'This output is FIXED placeholder text — the same result is shown for every image regardless of what is uploaded. No real image analysis has been performed. Example pest named here is "Colorado Potato Beetle" solely for illustration.'
    },
    {
      heading: '[SAMPLE DATA] Visual Assessment',
      content:
        'Placeholder description of leaf damage. These observations were NOT derived from the image you uploaded.'
    },
    {
      heading: '[SAMPLE DATA] Treatment Recommendations',
      content:
        'The treatment steps below are generic examples only. Do NOT apply any treatment based on this output — act only on advice from a qualified agronomist or a real AI analysis of your actual crop.'
    },
    {
      heading: '[SAMPLE DATA] Preventive Measures',
      content:
        'Generic crop-rotation and monitoring advice included here as placeholders. Not specific to any detected condition.'
    },
    {
      heading: '[SAMPLE DATA] Next Steps',
      content:
        'This section is placeholder text. Contact your local Krishi Vigyan Kendra (KVK) or agricultural extension office for genuine guidance.'
    }
  ]
};

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
      // TODO: replace this mock with a real API call:
      //   const formData = new FormData();
      //   formData.append('image', selectedImage);
      //   const { data } = await api.post('/api/pest-detection', formData);
      //   setAnalysis(data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysis(SAMPLE_ANALYSIS);
    } catch (err) {
      setError('Could not reach the analysis service: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Pest Detection</h1>

      {/* Non-dismissible product-honesty banner — must stay visible while any
          analysis result is on screen. Do not add a close button here; wire
          the feature to a real model endpoint instead. */}
      <DemoBanner
        tone="critical"
        tag="Unreleased demo — not real detection"
        title="This feature does not analyse your image"
        points={[
          'Every upload returns the same fixed sample output regardless of what is in your photo.',
          'The pest name, damage description and treatment steps shown below are placeholder data only.',
          'Do NOT make any crop-management decisions based on this output.',
          'Contact your local Krishi Vigyan Kendra (KVK) or a qualified agronomist for real advice.',
          'A real AI pest-detection model will replace this demo before the feature goes live.'
        ]}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Plant Image</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-md">
              <label htmlFor="pest-image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Select Image (PNG, JPG or JPEG)
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="pest-image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                  </div>
                  <input
                    id="pest-image-upload"
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
                  alt={`Preview of uploaded image: ${selectedImage?.name || 'plant photo'}`}
                  className="max-h-64 rounded-lg shadow-md"
                />
              </div>
            )}

            <button
              type="button"
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
                  <FaSpinner className="animate-spin" aria-hidden="true" />
                  <span>Loading sample result…</span>
                </>
              ) : (
                <span>Run Sample Analysis</span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {analysis && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Sample Analysis Output
              <span className="ml-2 text-sm font-normal text-red-700">(fixed placeholder — not your image)</span>
            </h3>
            <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4 space-y-4">
              {analysis.sections.map((section) => (
                <section key={section.heading}>
                  <h4 className="font-semibold text-gray-800 mb-1">{section.heading}</h4>
                  <p className="text-sm text-gray-700">{section.content}</p>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PestDetection;
