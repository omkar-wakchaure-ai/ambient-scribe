import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ConsultationProvider } from './context/ConsultationStateContext';
import './index.css'; // Ensure Tailwind is imported here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConsultationProvider>
          <App />
        </ConsultationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);