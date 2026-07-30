import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import DemoBanner from '../../components/ui/DemoBanner';
import { SpinnerBlock } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/EmptyState';
import api from '../../utils/api';

// ─── helpers ─────────────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'te', label: 'Telugu' }
];

const HEALTH_LABELS = {
  healthy: { text: 'Healthy', classes: 'bg-green-100 text-green-800 border border-green-200' },
  minor_issues: { text: 'Minor issues', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  significant_issues: { text: 'Significant issues', classes: 'bg-orange-100 text-orange-800 border border-orange-200' },
  severe: { text: 'Severe', classes: 'bg-red-100 text-red-800 border border-red-200' },
  unknown: { text: 'Unknown', classes: 'bg-gray-100 text-gray-700 border border-gray-200' }
};

const CONFIDENCE_BADGES = {
  high: { text: 'High confidence', classes: 'bg-green-100 text-green-800 border border-green-200' },
  medium: { text: 'Medium confidence', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  low: { text: 'Low confidence', classes: 'bg-gray-100 text-gray-600 border border-gray-200' }
};

const SEVERITY_BADGES = {
  low: { text: 'Low severity', classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
  moderate: { text: 'Moderate severity', classes: 'bg-orange-50 text-orange-700 border border-orange-200' },
  high: { text: 'High severity', classes: 'bg-red-100 text-red-700 border border-red-200' }
};

const TYPE_LABELS = {
  pest: 'Pest',
  disease: 'Disease',
  nutrient_deficiency: 'Nutrient deficiency',
  water_stress: 'Water stress',
  other: 'Other'
};

function Badge({ text, classes }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {text}
    </span>
  );
}

function SectionHeading({ children }) {
  return (
    <h3 className="text-base font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
      {children}
    </h3>
  );
}

function BulletList({ items }) {
  if (!items || items.length === 0) return <p className="text-sm text-gray-500 italic">None noted.</p>;
  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700">{item}</li>
      ))}
    </ul>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

const PestDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cropHint, setCropHint] = useState('');
  const [language, setLanguage] = useState('en');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // error can be { type: 'soft'|'hard', message }
  // soft = 422 user guidance, hard = crash/service error
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
      setError({ type: 'soft', message: 'Please select an image first.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('image', selectedImage);
    if (cropHint.trim()) formData.append('cropHint', cropHint.trim());
    if (language) formData.append('language', language);

    try {
      const response = await api.post('/api/pest-detection', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { data } = response.data;
      setAnalysis(data);
    } catch (err) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;

      if (status === 422) {
        // Not a plant photo, or unusable image quality — soft guidance
        setError({
          type: 'soft',
          message: responseData?.message || 'The image could not be analysed. Please upload a clear photo of a plant.'
        });
      } else if (status === 503) {
        setError({
          type: 'hard',
          message: 'The pest detection service is not configured on this server. Please contact support.'
        });
      } else if (status === 429) {
        setError({
          type: 'soft',
          message: 'Too many requests. Please wait a moment and try again.'
        });
      } else if (status === 413) {
        setError({
          type: 'soft',
          message: 'The image file is too large. Please resize it and try again (maximum ~10 MB).'
        });
      } else if (!err.response) {
        // Network failure — offer retry
        setError({
          type: 'network',
          message: 'Could not reach the analysis service. Check your connection and try again.'
        });
      } else {
        setError({
          type: 'hard',
          message: responseData?.message || 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    analyzeImage();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Pest Detection</h1>

      {/* Accuracy caveat — replaces the old "this is fake data" banner.
          The feature is real, but a general-purpose vision model is not a
          plant pathologist. Keeps the same visual prominence. */}
      <DemoBanner
        tone="warning"
        tag="AI-assisted — verify before acting"
        title="Confirm findings with an agricultural expert before applying any treatment"
        points={[
          'This tool uses a general-purpose AI vision model, not a trained plant pathology system. It can be confidently wrong.',
          'A misdiagnosis and the wrong pesticide can damage your crop further or harm the environment.',
          'Always consult your local agricultural extension officer or Krishi Vigyan Kendra (KVK) before applying chemical treatments.',
          'Chemical dosages and application schedules must come from a qualified agronomist, not this tool.',
          'Results in Hindi or Telugu may be less accurate than English — cross-check with a local expert.'
        ]}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* ── Upload panel ── */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Plant Image</h2>
          <div className="flex flex-col items-center space-y-4 w-full">

            {/* File input */}
            <div className="w-full max-w-md">
              <label
                htmlFor="pest-image-upload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Image (PNG, JPG or JPEG)
              </label>
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

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt={`Preview of uploaded file: ${selectedImage?.name || 'plant photo'}`}
                  className="max-h-64 rounded-lg shadow-md"
                />
                <p className="mt-1 text-xs text-gray-500 text-center">{selectedImage?.name}</p>
              </div>
            )}

            {/* Crop hint */}
            <div className="w-full max-w-md">
              <label
                htmlFor="pest-crop-hint"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                What crop is this? <span className="font-normal text-gray-500">(optional, improves accuracy)</span>
              </label>
              <input
                id="pest-crop-hint"
                type="text"
                value={cropHint}
                onChange={(e) => setCropHint(e.target.value)}
                placeholder="e.g. Tomato, Rice, Cotton, Wheat"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            {/* Language selector */}
            <div className="w-full max-w-md">
              <label
                htmlFor="pest-language"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Response language
              </label>
              <select
                id="pest-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={analyzeImage}
              disabled={!selectedImage || isLoading}
              className={`mt-4 px-6 py-2 rounded-md text-white font-medium flex items-center space-x-2 ${
                !selectedImage || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <span>Analysing…</span>
              ) : (
                <span>Analyse Image</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Loading state ── */}
        {isLoading && (
          <SpinnerBlock
            label="Sending to the AI model — this usually takes 10–30 seconds. Please wait."
            size="lg"
            tone="green"
            className="my-6"
          />
        )}

        {/* ── Error states ── */}
        {error && !isLoading && (
          <div className="mt-4">
            {error.type === 'network' ? (
              <ErrorState
                title="Could not reach the analysis service"
                description={error.message}
                onRetry={handleRetry}
                retryLabel="Try again"
              />
            ) : (
              <div role="alert" className={`p-4 rounded-md text-sm font-medium ${
                error.type === 'hard'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {error.message}
              </div>
            )}
          </div>
        )}

        {/* ── Analysis result ── */}
        {analysis && !isLoading && (
          <div className="mt-6 space-y-6">

            {/* Overview row */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {analysis.cropIdentified && (
                <span className="text-sm font-medium text-gray-700">
                  Crop identified: <strong>{analysis.cropIdentified}</strong>
                </span>
              )}
              {analysis.overallHealth && (
                <Badge
                  text={(HEALTH_LABELS[analysis.overallHealth] || HEALTH_LABELS.unknown).text}
                  classes={(HEALTH_LABELS[analysis.overallHealth] || HEALTH_LABELS.unknown).classes}
                />
              )}
              {analysis.imageQuality && (
                <span className="text-xs text-gray-500">
                  Image quality: {analysis.imageQuality}
                </span>
              )}
              {analysis.model && (
                <span className="text-xs text-gray-400 ml-auto">
                  Model: {analysis.model}
                </span>
              )}
            </div>

            {/* Summary */}
            {analysis.summary && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <SectionHeading>Summary</SectionHeading>
                <p className="text-sm text-gray-700">{analysis.summary}</p>
              </div>
            )}

            {/* Expert review callout */}
            {analysis.needsExpertReview && (
              <div role="alert" className="flex items-start gap-3 p-4 bg-orange-50 border-2 border-orange-400 rounded-lg">
                <svg aria-hidden="true" className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-orange-900">Expert review recommended</p>
                  <p className="text-sm text-orange-800 mt-1">
                    The AI flagged this case as complex or uncertain. Please contact your local Krishi Vigyan Kendra (KVK) or a certified agronomist before taking action.
                  </p>
                </div>
              </div>
            )}

            {/* Findings */}
            {analysis.findings && analysis.findings.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <SectionHeading>Findings</SectionHeading>
                <div className="space-y-4">
                  {analysis.findings.map((finding, i) => {
                    const confBadge = CONFIDENCE_BADGES[finding.confidence] || CONFIDENCE_BADGES.low;
                    const sevBadge = SEVERITY_BADGES[finding.severity] || SEVERITY_BADGES.low;
                    const isLowConf = finding.confidence === 'low';
                    return (
                      <div
                        key={i}
                        className={`rounded-lg border p-4 ${isLowConf ? 'opacity-70 bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <span className={`font-semibold text-gray-900 ${isLowConf ? 'text-gray-500' : ''}`}>
                            {finding.name}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">
                            {TYPE_LABELS[finding.type] || finding.type}
                          </span>
                          <Badge text={confBadge.text} classes={confBadge.classes} />
                          {finding.confidencePercent != null && (
                            <span className="text-xs text-gray-500">({finding.confidencePercent}%)</span>
                          )}
                          <Badge text={sevBadge.text} classes={sevBadge.classes} />
                        </div>
                        {isLowConf && (
                          <p className="text-xs text-gray-500 italic mb-2">
                            Low confidence — this finding is speculative. Do not act on it without expert confirmation.
                          </p>
                        )}
                        {finding.evidence && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Evidence: </span>{finding.evidence}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Differentials — "could also be" */}
            {analysis.differentials && analysis.differentials.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <SectionHeading>Could also be</SectionHeading>
                <p className="text-xs text-amber-700 mb-3">
                  Crop problems look alike. These alternatives have not been ruled out — a single confident answer is the most common failure mode in remote diagnosis.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.differentials.map((item, i) => (
                    <li key={i} className="text-sm text-amber-900">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment sections — ordered: immediate → organic → chemical → preventive */}
            {analysis.immediateActions && analysis.immediateActions.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <SectionHeading>Immediate Actions</SectionHeading>
                <BulletList items={analysis.immediateActions} />
              </div>
            )}

            {analysis.organicTreatment && analysis.organicTreatment.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <SectionHeading>Organic / Biological Treatment</SectionHeading>
                <BulletList items={analysis.organicTreatment} />
              </div>
            )}

            {analysis.chemicalTreatment && analysis.chemicalTreatment.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <SectionHeading>Chemical Treatment</SectionHeading>
                <p className="text-xs text-red-700 font-medium mb-2">
                  Chemical treatments are listed last intentionally. Dosages, mixing ratios, and application schedules MUST be confirmed with a local agronomist or extension officer. Never apply based on this list alone.
                </p>
                <BulletList items={analysis.chemicalTreatment} />
              </div>
            )}

            {analysis.preventiveMeasures && analysis.preventiveMeasures.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <SectionHeading>Preventive Measures</SectionHeading>
                <BulletList items={analysis.preventiveMeasures} />
              </div>
            )}

            {/* Server-supplied disclaimer — rendered verbatim */}
            {analysis.disclaimer && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                <p className="text-xs text-gray-600">{analysis.disclaimer}</p>
              </div>
            )}

            {/* Limitations */}
            {analysis.limitations && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <SectionHeading>Model limitations</SectionHeading>
                <p className="text-sm text-gray-600">{analysis.limitations}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PestDetection;
