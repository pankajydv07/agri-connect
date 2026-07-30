/**
 * WMO weather interpretation codes.
 *
 * Open-Meteo returns numeric WMO codes; farmers need words. Each entry also
 * carries a short farming note, because "light rain" and "heavy rain" mean very
 * different things for spraying, harvesting and irrigation decisions.
 */

const WEATHER_CODES = {
  0: { label: 'Clear sky', icon: '☀️', farmNote: 'Good conditions for harvesting and drying.' },
  1: { label: 'Mainly clear', icon: '🌤️', farmNote: 'Good conditions for field work.' },
  2: { label: 'Partly cloudy', icon: '⛅', farmNote: 'Suitable for most field work.' },
  3: { label: 'Overcast', icon: '☁️', farmNote: 'Slower drying; delay harvest if moisture matters.' },
  45: { label: 'Fog', icon: '🌫️', farmNote: 'High humidity — watch for fungal disease.' },
  48: { label: 'Depositing rime fog', icon: '🌫️', farmNote: 'High humidity — watch for fungal disease.' },
  51: { label: 'Light drizzle', icon: '🌦️', farmNote: 'Avoid spraying — it will wash off.' },
  53: { label: 'Moderate drizzle', icon: '🌦️', farmNote: 'Avoid spraying.' },
  55: { label: 'Dense drizzle', icon: '🌧️', farmNote: 'Avoid spraying and harvesting.' },
  56: { label: 'Light freezing drizzle', icon: '🌧️', farmNote: 'Frost risk to sensitive crops.' },
  57: { label: 'Dense freezing drizzle', icon: '🌧️', farmNote: 'Frost risk to sensitive crops.' },
  61: { label: 'Light rain', icon: '🌦️', farmNote: 'Irrigation may not be needed today.' },
  63: { label: 'Moderate rain', icon: '🌧️', farmNote: 'Skip irrigation; check drainage.' },
  65: { label: 'Heavy rain', icon: '🌧️', farmNote: 'Check drainage and secure harvested produce.' },
  66: { label: 'Light freezing rain', icon: '🌧️', farmNote: 'Frost risk — protect seedlings.' },
  67: { label: 'Heavy freezing rain', icon: '🌧️', farmNote: 'Frost risk — protect seedlings.' },
  71: { label: 'Light snow', icon: '🌨️', farmNote: 'Protect crops from frost.' },
  73: { label: 'Moderate snow', icon: '🌨️', farmNote: 'Protect crops from frost.' },
  75: { label: 'Heavy snow', icon: '❄️', farmNote: 'Protect crops from frost.' },
  77: { label: 'Snow grains', icon: '🌨️', farmNote: 'Protect crops from frost.' },
  80: { label: 'Light rain showers', icon: '🌦️', farmNote: 'Intermittent rain — plan spraying carefully.' },
  81: { label: 'Moderate rain showers', icon: '🌧️', farmNote: 'Intermittent rain — postpone spraying.' },
  82: { label: 'Violent rain showers', icon: '⛈️', farmNote: 'Heavy downpour risk — secure produce.' },
  85: { label: 'Light snow showers', icon: '🌨️', farmNote: 'Protect crops from frost.' },
  86: { label: 'Heavy snow showers', icon: '❄️', farmNote: 'Protect crops from frost.' },
  95: { label: 'Thunderstorm', icon: '⛈️', farmNote: 'Stay out of open fields; secure equipment.' },
  96: { label: 'Thunderstorm with light hail', icon: '⛈️', farmNote: 'Hail can damage standing crops.' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️', farmNote: 'Hail can destroy standing crops.' },
};

const describeCode = (code) =>
  WEATHER_CODES[code] || { label: 'Unknown', icon: '❓', farmNote: '' };

module.exports = { WEATHER_CODES, describeCode };
