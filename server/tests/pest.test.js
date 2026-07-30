/**
 * Pest detection tests.
 *
 * The Groq vision call is mocked — the suite must not spend money or depend on
 * a provider being up. The value here is testing the *normalisation and safety
 * logic*, which is what stops a malformed or overconfident model response from
 * reaching a farmer.
 */

jest.mock('../utils/groq', () => {
  const actual = jest.requireActual('../utils/groq');
  return { ...actual, chatCompletion: jest.fn() };
});

const request = require('supertest');
const app = require('../app');
const { chatCompletion } = require('../utils/groq');
const { _internal } = require('../controllers/pest');
const { createFarmer, bearer } = require('./helpers');

/** Minimal valid JPEG header — enough to pass the mimetype filter. */
const fakeImage = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

const mockModelJson = (payload) => {
  chatCompletion.mockResolvedValue({
    choices: [{ message: { content: JSON.stringify(payload) }, finish_reason: 'stop' }],
  });
};

const healthyResponse = {
  isPlantImage: true,
  imageQuality: 'good',
  cropIdentified: 'Tomato',
  overallHealth: 'minor_issues',
  summary: 'Early signs of leaf spot on lower foliage.',
  findings: [
    {
      name: 'Early blight',
      type: 'disease',
      confidence: 'high',
      confidencePercent: 85,
      severity: 'low',
      evidence: 'Concentric brown lesions on lower leaves.',
    },
  ],
  differentials: ['Septoria leaf spot', 'Bacterial spot'],
  immediateActions: ['Remove affected lower leaves'],
  organicTreatment: ['Neem oil spray'],
  chemicalTreatment: ['Copper-based fungicide'],
  preventiveMeasures: ['Improve air circulation'],
  limitations: 'Assessment based on a single image.',
};

const attach = (token, extra = {}) => {
  const req = request(app)
    .post('/api/pest-detection')
    .set(bearer(token))
    .attach('image', fakeImage, { filename: 'leaf.jpg', contentType: 'image/jpeg' });

  Object.entries(extra).forEach(([key, value]) => req.field(key, value));
  return req;
};

beforeEach(() => jest.clearAllMocks());

describe('POST /api/pest-detection', () => {
  it('returns a structured analysis', async () => {
    mockModelJson(healthyResponse);
    const { token } = await createFarmer();

    const res = await attach(token);

    expect(res.status).toBe(200);
    expect(res.body.data.cropIdentified).toBe('Tomato');
    expect(res.body.data.findings).toHaveLength(1);
    expect(res.body.data.findings[0].name).toBe('Early blight');
    expect(res.body.data.differentials).toContain('Septoria leaf spot');
  });

  /** The referral text is not optional — it must ship with every result. */
  it('always includes the expert referral disclaimer', async () => {
    mockModelJson(healthyResponse);
    const { token } = await createFarmer();

    const res = await attach(token);

    expect(res.body.data.disclaimer).toBe(_internal.EXPERT_REFERRAL);
    expect(res.body.data.disclaimer).toMatch(/extension officer/i);
  });

  it('refuses to diagnose a photo that is not a plant', async () => {
    mockModelJson({ ...healthyResponse, isPlantImage: false, findings: [] });
    const { token } = await createFarmer();

    const res = await attach(token);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/plant/i);
  });

  it('refuses to diagnose an unusable image', async () => {
    mockModelJson({ ...healthyResponse, imageQuality: 'unusable' });
    const { token } = await createFarmer();

    const res = await attach(token);

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/blurry|dark/i);
  });

  describe('needsExpertReview is server-enforced', () => {
    it('escalates when any finding is low confidence', async () => {
      mockModelJson({
        ...healthyResponse,
        findings: [{ ...healthyResponse.findings[0], confidence: 'low' }],
      });
      const { token } = await createFarmer();

      const res = await attach(token);
      expect(res.body.data.needsExpertReview).toBe(true);
    });

    it('escalates when severity is high', async () => {
      mockModelJson({
        ...healthyResponse,
        findings: [{ ...healthyResponse.findings[0], severity: 'high' }],
      });
      const { token } = await createFarmer();

      const res = await attach(token);
      expect(res.body.data.needsExpertReview).toBe(true);
    });

    it('escalates when the image quality is merely fair', async () => {
      mockModelJson({ ...healthyResponse, imageQuality: 'fair' });
      const { token } = await createFarmer();

      const res = await attach(token);
      expect(res.body.data.needsExpertReview).toBe(true);
    });

    it('escalates when the model reports no findings at all', async () => {
      mockModelJson({ ...healthyResponse, findings: [] });
      const { token } = await createFarmer();

      const res = await attach(token);
      expect(res.body.data.needsExpertReview).toBe(true);
    });

    /**
     * The model cannot switch this off: even a clean, unanimous, high-confidence
     * reading is advisory only, and the flag is computed here, never read from
     * the model's own output.
     */
    it('ignores a needsExpertReview value supplied by the model', async () => {
      mockModelJson({ ...healthyResponse, needsExpertReview: false, imageQuality: 'fair' });
      const { token } = await createFarmer();

      const res = await attach(token);
      expect(res.body.data.needsExpertReview).toBe(true);
    });
  });

  describe('normalisation of malformed model output', () => {
    it('coerces out-of-range confidence percentages', async () => {
      mockModelJson({
        ...healthyResponse,
        findings: [{ ...healthyResponse.findings[0], confidencePercent: 900 }],
      });
      const { token } = await createFarmer();

      const res = await attach(token);
      expect(res.body.data.findings[0].confidencePercent).toBe(100);
    });

    it('falls back to safe defaults for unknown enum values', async () => {
      mockModelJson({
        ...healthyResponse,
        findings: [
          { ...healthyResponse.findings[0], confidence: 'absolutely certain', severity: 'apocalyptic', type: 'vibes' },
        ],
      });
      const { token } = await createFarmer();

      const res = await attach(token);

      // Unknown confidence degrades to 'low', not 'high'.
      expect(res.body.data.findings[0].confidence).toBe('low');
      expect(res.body.data.findings[0].severity).toBe('moderate');
      expect(res.body.data.findings[0].type).toBe('other');
    });

    it('tolerates a non-array where a list was expected', async () => {
      mockModelJson({ ...healthyResponse, differentials: 'just one thing', organicTreatment: null });
      const { token } = await createFarmer();

      const res = await attach(token);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.differentials)).toBe(true);
      expect(Array.isArray(res.body.data.organicTreatment)).toBe(true);
    });

    it('returns 502 when the model emits invalid JSON', async () => {
      chatCompletion.mockResolvedValue({
        choices: [{ message: { content: 'Sure! Here is your analysis: ...' } }],
      });
      const { token } = await createFarmer();

      const res = await attach(token);
      expect(res.status).toBe(502);
    });
  });

  describe('request validation', () => {
    it('requires an image', async () => {
      const { token } = await createFarmer();
      const res = await request(app).post('/api/pest-detection').set(bearer(token));
      expect(res.status).toBe(400);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/pest-detection')
        .attach('image', fakeImage, { filename: 'leaf.jpg', contentType: 'image/jpeg' });
      expect(res.status).toBe(401);
    });

    it('rejects a non-image upload', async () => {
      const { token } = await createFarmer();
      const res = await request(app)
        .post('/api/pest-detection')
        .set(bearer(token))
        .attach('image', Buffer.from('not an image'), {
          filename: 'notes.txt',
          contentType: 'text/plain',
        });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('accepts an optional crop hint', async () => {
      mockModelJson(healthyResponse);
      const { token } = await createFarmer();

      const res = await attach(token, { cropHint: 'tomato' });

      expect(res.status).toBe(200);
      // The hint should reach the model prompt.
      const sentMessages = chatCompletion.mock.calls[0][0].messages;
      expect(JSON.stringify(sentMessages)).toMatch(/tomato/i);
    });

    it('rejects an unsupported language', async () => {
      const { token } = await createFarmer();
      const res = await attach(token, { language: 'fr' });
      expect(res.status).toBe(400);
    });
  });
});
