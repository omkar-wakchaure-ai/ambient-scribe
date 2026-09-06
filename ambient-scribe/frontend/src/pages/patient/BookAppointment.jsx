import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import AppointmentCalendar from '../../components/patient/AppointmentCalendar';
import DocumentUploader from '../../components/patient/DocumentUploader';
import PreVisitAudioRecorder from '../../components/patient/PreVisitAudioRecorder';

export default function BookAppointment() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen bg-[#FAFAFA] overflow-hidden flex flex-col items-center">
      
      {/* ========================================= */}
      {/* AMBIENT GLOWING BACKGROUND                */}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#EEF2FF] to-[#E0F2FE]/50 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-[#4F46E5]/10 to-transparent rounded-full blur-[100px]"></div>
      </div>

      {/* ========================================= */}
      {/* FOREGROUND CONTENT (NO SCROLL LAYOUT)     */}
      {/* ========================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col h-full">
        
        {/* Header Section - Fixed Height */}
        <div className="flex-none mb-6">
          <button onClick={() => navigate('/patient/dashboard')} className="flex items-center text-sm font-semibold text-[#64748B] hover:text-[#4F46E5] transition-colors mb-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white shadow-sm w-max">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">Book New Appointment</h1>
          <p className="text-sm font-medium text-[#64748B] mt-1">Select a date, upload records, and provide details for your doctor.</p>
        </div>

        {/* Main Grid Area - Flexes to fill remaining screen height */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-6">
          
          {/* Left Column (Calendar + Voice Note) */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            <div className="flex-none">
              <AppointmentCalendar />
            </div>
            <div className="flex-1 min-h-0">
              <PreVisitAudioRecorder />
            </div>
          </div>

          {/* Right Column (Document Uploader + Confirm Button) */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            <div className="flex-1 min-h-0">
              <DocumentUploader />
            </div>
            <div className="flex-none flex justify-end">
              <button 
                onClick={() => navigate('/patient/dashboard')}
                className="flex items-center justify-center w-full lg:w-auto px-10 py-4 bg-[#4F46E5] text-white font-semibold text-sm rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                Confirm Appointment <CheckCircle2 className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
      `}} />
    </div>
  );
}