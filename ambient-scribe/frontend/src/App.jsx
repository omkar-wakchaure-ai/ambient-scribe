import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientProfile from './pages/doctor/PatientProfile';
import LiveConsultation from './pages/doctor/LiveConsultation';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#172033]">
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/patient/:id" element={<PatientProfile />} />
        <Route path="/doctor/consultation" element={<LiveConsultation />} />
        
        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/book" element={<BookAppointment />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}