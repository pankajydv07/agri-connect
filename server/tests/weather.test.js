/**
 * Weather endpoint tests.
 *
 * Open-Meteo is mocked: a test suite must not depend on a third-party service
 * being reachable, and CI should not make live outbound calls.
 */

jest.mock('axios');

const request = require('supertest');
const axios = require('axios');
const app = require('../app');
const { createFarmer, bearer } = require('./helpers');
const { _internal } = require('../controllers/weather');

const geocodeResponse = {
  data: {
    results: [
      {
        name: 'Hyderabad',
        admin1: 'Telangana',
        country: 'India',
        latitude: 17.385,
        longitude: 78.4867,
        timezone: 'Asia/Kolkata',
      },
    ],
  },
};

const forecastResponse = {
  data: {
    current: {
      temperature_2m: 31.4,
      relative_humidity_2m: 62,
      weather_code: 2,
      wind_speed_10m: 12.3,
    },
    daily: {
      time: ['2026-07-30', '2026-07-31', '2026-08-01'],
      weather_code: [2, 63, 95],
      temperature_2m_max: [33.1, 30.2, 29.8],
      temperature_2m_min: [24.0, 23.5, 23.1],
      precipitation_sum: [0, 12.4, 30.1],
      precipitation_probability_max: [10, 80, 95],
      wind_speed_10m_max: [14.2, 18.9, 25.4],
    },
  },
};

/** Routes the mock by URL so one helper covers both upstream calls. */
const mockOpenMeteo = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('geocoding-api')) return Promise.resolve(geocodeResponse);
    return Promise.resolve(forecastResponse);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  // The controller caches aggressively; a stale entry would mask the mock.
  _internal.cache.clear();
});

describe('GET /api/weather', () => {
  it('returns current conditions and a daily forecast', async () => {
    mockOpenMeteo();
    const { token } = await createFarmer();

    const res = await request(app)
      .get('/api/weather?location=Hyderabad&days=3')
      .set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data.location.name).toBe('Hyderabad');
    expect(res.body.data.location.region).toBe('Telangana');
    expect(res.body.data.current.temperature).toBe(31.4);
    expect(res.body.data.daily).toHaveLength(3);
  });

  it('translates WMO codes into words and farming advice', async () => {
    mockOpenMeteo();
    const { token } = await createFarmer();

    const res = await request(app).get('/api/weather?location=Hyderabad').set(bearer(token));

    // 2 = partly cloudy, 63 = moderate rain, 95 = thunderstorm
    expect(res.body.data.daily[0].label).toBe('Partly cloudy');
    expect(res.body.data.daily[1].label).toBe('Moderate rain');
    expect(res.body.data.daily[2].label).toBe('Thunderstorm');
    expect(res.body.data.daily[2].farmNote).toBeTruthy();
  });

  /**
   * The assistant speaks this string aloud, so it must be prose containing the
   * real figures — not a serialised object and not invented numbers.
   */
  it('builds a speakable summary containing real figures', async () => {
    mockOpenMeteo();
    const { token } = await createFarmer();

    const res = await request(app).get('/api/weather?location=Hyderabad').set(bearer(token));
    const { summary } = res.body.data;

    expect(typeof summary).toBe('string');
    expect(summary).toContain('Hyderabad');
    expect(summary).toContain('31');
    expect(summary).not.toContain('{');
  });

  it('caches the forecast rather than refetching', async () => {
    mockOpenMeteo();
    const { token } = await createFarmer();

    await request(app).get('/api/weather?location=Hyderabad&days=3').set(bearer(token));
    const callsAfterFirst = axios.get.mock.calls.length;

    await request(app).get('/api/weather?location=Hyderabad&days=3').set(bearer(token));

    expect(axios.get.mock.calls.length).toBe(callsAfterFirst);
  });

  it('returns 404 with actionable guidance for an unknown place', async () => {
    axios.get.mockResolvedValue({ data: { results: [] } });
    const { token } = await createFarmer();

    const res = await request(app)
      .get('/api/weather?location=Nowhereville')
      .set(bearer(token));

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/state or district/i);
  });

  it('maps an upstream failure to 502, not 500', async () => {
    axios.get.mockRejectedValue(new Error('network down'));
    const { token } = await createFarmer();

    const res = await request(app).get('/api/weather?location=Hyderabad').set(bearer(token));

    expect(res.status).toBe(502);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/weather?location=Hyderabad');
    expect(res.status).toBe(401);
  });

  it('rejects a missing location', async () => {
    const { token } = await createFarmer();
    const res = await request(app).get('/api/weather').set(bearer(token));
    expect(res.status).toBe(400);
  });

  it('rejects a days value outside 1-7', async () => {
    const { token } = await createFarmer();
    const res = await request(app)
      .get('/api/weather?location=Hyderabad&days=30')
      .set(bearer(token));
    expect(res.status).toBe(400);
  });
});
