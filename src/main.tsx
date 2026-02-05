import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// ============================================================================
// PREVENT ZOOM ON iOS SAFARI
// Safari ignores user-scalable=no since iOS 10 for accessibility reasons
// ============================================================================

// Prevent pinch zoom (gesturestart is Safari-specific)
document.addEventListener(
  'gesturestart',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  'gesturechange',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  'gestureend',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

// Prevent pinch zoom via touchmove with multiple fingers
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  },
  { passive: false }
);

// ============================================================================

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
