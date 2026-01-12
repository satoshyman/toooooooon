
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Import App using the correct casing to match the file name App.tsx and resolve casing conflict
import App from './App.tsx';

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
    rootElement.innerHTML = `<div style="color:white; padding:20px; text-align:center;">خطأ في تشغيل التطبيق: ${error.message}</div>`;
  }
}
