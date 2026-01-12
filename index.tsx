
import React from 'react';
import ReactDOM from 'react-dom/client';
// استخدام app.tsx كمرجع أساسي موحد
// Fixed casing mismatch: Changed from './App.tsx' to './app.tsx' to match the file provided in the program.
import App from './app.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Critical Mounting Error:", error);
    rootElement.innerHTML = `<div style="color:white; padding:20px; text-align:center; font-family:sans-serif;">
      <h2>خطأ في تشغيل التطبيق</h2>
      <p>${error instanceof Error ? error.message : String(error)}</p>
    </div>`;
  }
}
