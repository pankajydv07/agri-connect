/**
 * Weather forecasts.
 *
 * The assistant declared a `getWeatherForecast` tool but nothing implemented it,
 * so weather voice queries returned invented data. This is the real backend.
 *
 * Provider is Open-Meteo: free, no API key, no attribution requirement, and
 * CORS-friendly. Deliberately chosen over OpenWeatherMap so this feature adds
 * zero new secrets to a project that just had four credentials leaked.
 */

const axios = require('axios');
const { describeCode } = require('../utils/weatherCodes');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const GEOCODE_TTL_MS = 24 * 60 * 60 * 1000; // place coordinates never really move
const FORECAST_TTL_MS = 30 * 60 * 1000; // forecasts update a few times an hour
const MAX_CACHE_ENTRIES = 500;

/**
 * Small in-process TTL cache. Weather is the most cacheable thing in the app —
 * every farmer in a district shares a forecast — and this keeps us well inside
 * a free tier without adding Redis. Note it is per-instance: with several
 * replicas each keeps its own copy, which is acceptable for a read-only,
 * short-lived value.
 */
const cache = new Map();

const getCached = (key) => {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.value;
};

const setCached = (key, value, ttl) => {
  // Bound the map so a flood of distinct locations can't grow it without limit.
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { value, expiresAt: Date.now() + ttl });
};

/** Resolves a place name to coordinates. */
const geocode = async (location) => {
  const key = `geo:${location.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return cached;

  let response;
  try {
    response = await axios.get(GEOCODE_URL, {
      params: { name: location, count: 1, language: 'en', format: 'json' },
      timeout: 10000,
    });
  } catch (error) {
    logger.error({ err: error, location }, 'Geocoding request failed');
    throw new AppError('Could not look up that location — please try again', 502);
  }

  const match = response.data?.results?.[0];
  if (!match) {
    throw new AppError(
      `Could not find a place called "${location}". Try adding the state or district.`,
      404
    );
  }

  const place = {
    name: match.name,
    region: match.admin1 || null,
    country: match.country || null,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone || 'auto',
  };

  setCached(key, place, GEOCODE_TTL_MS);
  return place;
};

/** Fetches current conditions plus a daily forecast. */
const fetchForecast = async (place, days) => {
  const key = `fc:${place.latitude},${place.longitude}:${days}`;
  const cached = getCached(key);
  if (cached) return cached;

  let response;
  try {
    response = await axios.get(FORECAST_URL, {
      params: {
        latitude: place.latitude,
        longitude: place.longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        daily:
          'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
        timezone: 'auto',
        forecast_days: days,
      },
      timeout: 10000,
    });
  } catch (error) {
    logger.error({ err: error, place: place.name }, 'Forecast request failed');
    throw new AppError('Could not fetch the forecast — please try again', 502);
  }

  const { current, daily } = response.data || {};

  if (!daily?.time) {
    throw new AppError('The weather service returned an unexpected response', 502);
  }

  const currentCode = describeCode(current?.weather_code);

  const result = {
    current: {
      temperature: current?.temperature_2m ?? null,
      humidity: current?.relative_humidity_2m ?? null,
      windSpeed: current?.wind_speed_10m ?? null,
      code: current?.weather_code ?? null,
      label: currentCode.label,
      icon: currentCode.icon,
      farmNote: currentCode.farmNote,
    },
    daily: daily.time.map((date, i) => {
      const code = describeCode(daily.weather_code?.[i]);
      return {
        date,
        minTemp: daily.temperature_2m_min?.[i] ?? null,
        maxTemp: daily.temperature_2m_max?.[i] ?? null,
        precipitation: daily.precipitation_sum?.[i] ?? null,
        precipitationChance: daily.precipitation_probability_max?.[i] ?? null,
        maxWind: daily.wind_speed_10m_max?.[i] ?? null,
        code: daily.weather_code?.[i] ?? null,
        label: code.label,
        icon: code.icon,
        farmNote: code.farmNote,
      };
    }),
  };

  setCached(key, result, FORECAST_TTL_MS);
  return result;
};

/**
 * Builds one speakable sentence per day.
 *
 * This exists because the voice assistant pipes the response straight into
 * text-to-speech, and reading out a JSON structure is useless. Keeping the
 * phrasing server-side also means the assistant can't invent numbers — it has a
 * ready-made factual string to relay.
 */
const buildSpokenSummary = (place, forecast) => {
  const where = [place.name, place.region].filter(Boolean).join(', ');
  const lines = [];

  if (forecast.current.temperature !== null) {
    lines.push(
      `Right now in ${where} it is ${Math.round(forecast.current.temperature)} degrees Celsius with ${forecast.current.label.toLowerCase()}.`
    );
  }

  forecast.daily.slice(0, 5).forEach((day, index) => {
    const when = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `On ${day.date}`;
    const rain =
      day.precipitationChance !== null && day.precipitationChance >= 30
        ? ` There is a ${day.precipitationChance} percent chance of rain.`
        : '';
    lines.push(
      `${when}: ${day.label.toLowerCase()}, between ${Math.round(day.minTemp)} and ${Math.round(day.maxTemp)} degrees.${rain}`
    );
  });

  // Surface the single most actionable advisory rather than every day's note.
  const advisory = forecast.daily.slice(0, 3).find((day) => day.farmNote)?.farmNote;
  if (advisory) lines.push(advisory);

  return lines.join(' ');
};

// @desc    Get a weather forecast for a location
// @route   GET /api/weather?location=Hyderabad&days=3
// @access  Private
exports.getForecast = asyncHandler(async (req, res) => {
  const { location, days } = req.query;

  const place = await geocode(location);
  const forecast = await fetchForecast(place, days);

  res.status(200).json({
    success: true,
    data: {
      location: place,
      current: forecast.current,
      daily: forecast.daily,
      summary: buildSpokenSummary(place, forecast),
      source: 'Open-Meteo',
    },
  });
});

// Exported for tests.
exports._internal = { geocode, fetchForecast, buildSpokenSummary, cache };
