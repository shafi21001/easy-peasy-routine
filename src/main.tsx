import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/tailwind.css'

console.log('Main.tsx loaded');

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
  
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error rendering React app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Loading Error</h1>
      <p>There was an error loading the application:</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${error}</pre>
    </div>
  `;
}