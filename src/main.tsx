import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/tailwind.css'

console.log('Main.tsx loaded at:', new Date().toISOString());
console.log('Base URL:', document.baseURI);
console.log('Current location:', window.location.href);

// Add a loading indicator
document.body.innerHTML = `
  <div id="root"></div>
  <div id="loading" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: Arial, sans-serif; text-align: center;">
    <div style="font-size: 24px; margin-bottom: 10px;">🔄</div>
    <div>Loading Easy Peasy Routine...</div>
  </div>
`;

try {
  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  // Remove loading indicator
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.remove();
  
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error rendering React app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h1 style="color: #e74c3c;">⚠️ Loading Error</h1>
      <p>There was an error loading the Easy Peasy Routine application:</p>
      <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #e74c3c; overflow-x: auto;">${error}</pre>
      <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 4px; border-left: 4px solid #3498db;">
        <strong>Troubleshooting:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Check browser console for additional errors</li>
          <li>Verify all assets are loading correctly</li>
          <li>Try refreshing the page</li>
        </ul>
      </div>
    </div>
  `;
}