import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// The API base URL is configured once, in src/utils/api.js, from
// REACT_APP_API_URL. Do not set axios global defaults here.

// Get the root element
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
