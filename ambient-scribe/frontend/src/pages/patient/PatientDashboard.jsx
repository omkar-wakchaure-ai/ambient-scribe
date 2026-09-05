import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import the auth context

// Ensure your image path is correct
import glassHeartImg from '../../assets/glass-heart.png';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get the logout function
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the dropdown

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] overflow-hidden flex items-center">
      
      {/* ========================================= */}
      {/* 3D BACKGROUND ANIMATION LAYER (RIGHT SIDE)*/}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#E0F2FE]/70 to-[#EEF2FF]/70 rounded-full blur-[100px]"></div>
        
        <div className="absolute top-1/2 right-[-5%] lg:right-[2%] -translate-y-1/2 w-[600px] h-[600px] lg:w-[750px] lg:h-[750px] flex items-center justify-center opacity-70">
          <div className="absolute inset-[15%] border-[3px] border-[#4F46E5] rounded-full opacity-0 animate-pulse-wave" style={{ animationDelay: '0s' }}></div>
          <div className="absolute inset-[15%] border-[3px] border-[#3B82F6] rounded-full opacity-0 animate-pulse-wave" style={{ animationDelay: '0.75s' }}></div>
          <div className="absolute inset-[15%] border-[2px] border-[#E0F2FE] rounded-full opacity-0 animate-pulse-wave" style={{ animationDelay: '1.5s' }}></div>

          <div className="relative w-full h-full animate-heartbeat flex items-center justify-center">
            <img 
              src={glassHeartImg} 
              alt="Medical AI Heart" 
              className="w-3/4 h-3/4 object-contain filter drop-shadow-[0_0_50px_rgba(79,70,229,0.4)]"
              style={{
                WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
                maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)'
              }}
            />
            <div className="absolute inset-0 bg-[#4F46E5] mix-blend-color opacity-20 rounded-full" 
                 style={{ WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)' }}>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* FOREGROUND CONTENT (LEFT SIDE)            */}
      {/* ========================================= */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12">
        
        <div className="w-full lg:w-7/12 space-y-12">
          
          {/* HEADER with Interactive Glassy Avatar */}
          <header className="flex items-center space-x-5 relative">
            
            {/* Avatar Profile Wrapper */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative overflow-hidden w-16 h-16 bg-white/70 backdrop-blur-md text-[#3B82F6] font-extrabold text-2xl rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(59,130,246,0.15)] ring-2 ring-white hover:ring-[#E0F2FE] hover:shadow-[0_12px_25px_rgba(59,130,246,0.25)] transition-all duration-300 z-20 cursor-pointer"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-5 bg-gradient-to-b from-white to-transparent opacity-90 rounded-full blur-[1px]"></div>
                <span className="relative z-10">AP</span>
              </button>

              {/* Glassy Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                  
                  <div className="absolute top-[110%] left-0 w-48 bg-white/95 backdrop-blur-xl border border-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">Hello, Aarav</h1>
              <p className="text-[#64748B] text-base font-medium mt-1">How are you feeling today?</p>
            </div>
          </header>

          {/* CARDS CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="group relative overflow-hidden bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-white hover:shadow-[0_15px_50px_rgba(79,70,229,0.12)] transition-all duration-300 flex flex-col justify-between h-full min-h-[320px]">
              <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none"></div>

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-[#EEF2FF] to-[#E0F2FE] rounded-2xl flex items-center justify-center mb-6 border border-white shadow-sm">
                  <CalendarPlus className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <h3 className="text-xl font-bold text-[#172033] tracking-tight">Need to see a doctor?</h3>
                <p className="text-[#64748B] text-sm mt-3 mb-8 leading-relaxed">
                  Schedule your next visit and pre-record your symptoms to save time.
                </p>
              </div>
              
              <button 
                onClick={() => navigate('/patient/book')}
                className="relative z-10 w-full py-4 bg-[#4F46E5] text-white font-semibold text-sm rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Book Appointment
              </button>
            </div>

            <div className="group relative overflow-hidden bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-white hover:shadow-[0_15px_50px_rgba(59,130,246,0.12)] transition-all duration-300 flex flex-col justify-between h-full min-h-[320px]">
              <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none"></div>

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F5F9FF] to-[#E0F2FE] rounded-2xl flex items-center justify-center mb-6 border border-white shadow-sm">
                  <FileText className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-bold text-[#172033] tracking-tight">My Documents</h3>
                <p className="text-[#64748B] text-sm mt-3 mb-8 leading-relaxed">
                  View past prescriptions, SOAP notes, and upload new lab reports.
                </p>
              </div>
              
              <button 
                className="relative z-10 w-full py-4 bg-white/60 backdrop-blur-sm border border-[#E5E7EB] text-[#172033] font-semibold text-sm rounded-2xl hover:bg-white hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-300"
              >
                View Records
              </button>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes heartbeat {
          0%   { transform: scale(1); filter: brightness(1); }
          15%  { transform: scale(1.05); filter: brightness(1.1); }
          30%  { transform: scale(1); filter: brightness(1); }
          45%  { transform: scale(1.05); filter: brightness(1.1); }
          100% { transform: scale(1); filter: brightness(1); }
        }

        @keyframes pulse-wave {
          0%   { transform: scale(0.5); opacity: 0.5; stroke-width: 4px; }
          100% { transform: scale(1.6); opacity: 0; stroke-width: 1px; }
        }

        @keyframes shimmer {
          100% { transform: translateX(300%) skewX(-12deg); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .animate-heartbeat { animation: heartbeat 2s ease-in-out infinite; }
          .animate-pulse-wave { animation: pulse-wave 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; }
          .animate-shimmer { animation: shimmer 1.5s infinite; }
        }
      `}} />
    </div>
  );
}