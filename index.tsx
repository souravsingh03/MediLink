import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error("Target container 'root' not found in document.");
      return;
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Critical error during application mount:", error);
    // Provide a minimal visual cue for debugging in production
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; font-family: sans-serif; margin: 20px;">
          <h2 style="margin-top: 0;">Application failed to start</h2>
          <p>Please check the browser console for details. This usually happens due to missing environment variables or network issues.</p>
        </div>
      `;
    }
  }
};

renderApp();