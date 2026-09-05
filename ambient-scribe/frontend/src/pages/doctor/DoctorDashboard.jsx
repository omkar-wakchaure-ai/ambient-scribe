import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, Users, FileText, LogOut } from 'lucide-react';
import AppointmentCard from '../../components/doctor/AppointmentCard';
import { useAuth } from '../../context/AuthContext'; // Import the auth context

// Ensure you save the new generated image in this location
import glassStethoscopeImg from '../../assets/glass-stethoscope.png';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get the logout function
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the dropdown

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] overflow-hidden flex flex-col items-center">
      
      {/* ========================================= */}
      {/* 3D BACKGROUND ANIMATION LAYER             */}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        
        {/* Soft Ambient Glow - positioned to highlight the stethoscope */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#4F46E5]/10 to-[#EEF2FF]/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#3B82F6]/10 to-transparent rounded-full blur-[100px]"></div>
        
        {/* Sweeping Glass Stethoscope Image */}
        <div className="absolute w-[120%] md:w-[100%] h-full flex items-center justify-center opacity-[0.15] animate-float-slow">
          <img 
            src={glassStethoscopeImg} 
            alt="Medical AI Stethoscope" 
            className="w-full h-auto max-h-screen object-cover filter drop-shadow-[0_10px_40px_rgba(79,70,229,0.5)]"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
              maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)'
            }}
          />
        </div>
      </div>

      {/* ========================================= */}
      {/* FOREGROUND DASHBOARD CONTENT              */}
      {/* ========================================= */}
      <div className="relative z-10 w-full max-w-6xl p-6 md:p-10 space-y-8 mt-4">
        
        <header className="flex justify-between items-end mb-8 relative">
          <div>
            <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">Welcome back, Dr. Smith</h1>
            <p className="text-[#64748B] text-sm mt-1 font-medium">Here is your schedule for today.</p>
          </div>
          
          {/* Avatar Profile Wrapper */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-12 h-12 bg-white/95 backdrop-blur-md text-[#4F46E5] font-bold rounded-full flex items-center justify-center border-2 border-[#E0F2FE] shadow-[0_4px_15px_rgba(224,242,254,0.8)] ring-1 ring-white hover:ring-[#E0F2FE] hover:shadow-[0_8px_25px_rgba(79,70,229,0.25)] transition-all duration-300 cursor-pointer z-20 relative"
            >
              DS
            </button>

            {/* Glassy Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Invisible overlay to close dropdown when clicking outside */}
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                
                <div className="absolute top-[120%] right-0 w-48 bg-white/95 backdrop-blur-xl border border-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
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
        </header>

        {/* Stats Row with Stronger White Backgrounds (bg-white/95) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { title: "Today's Patients", value: "12", icon: Users, color: "text-[#3B82F6]", bg: "bg-[#F5F9FF]" },
            { title: "Completed Notes", value: "8", icon: FileText, color: "text-[#16A34A]", bg: "bg-[#DCFCE7]" },
            { title: "Pending Reviews", value: "4", icon: Activity, color: "text-[#D97706]", bg: "bg-[#FEF3C7]" },
            { title: "Time Saved", value: "2.4 hrs", icon: Clock, color: "text-[#4F46E5]", bg: "bg-[#EEF2FF]" },
          ].map((stat, idx) => (
            <div key={idx} className="relative bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
              
              {/* Glossy Sheen overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/80 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform -translate-x-full group-hover:translate-x-full"></div>
              
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 border border-white shadow-sm`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-[#64748B] font-medium">{stat.title}</p>
              <p className="text-3xl font-extrabold text-[#172033] mt-1 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-[#172033] mb-6">Upcoming Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => navigate('/doctor/patient/1')} className="cursor-pointer h-full">
              <AppointmentCard patientName="Aarav Patel" time="10:00 AM" condition="Viral Fever (Follow-up)" isNext={true} />
            </div>
            <div onClick={() => navigate('/doctor/patient/2')} className="cursor-pointer h-full">
              <AppointmentCard patientName="Priya Sharma" time="10:30 AM" condition="Routine Checkup" isNext={false} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* CUSTOM ANIMATION STYLES                   */}
      {/* ========================================= */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-slow {
          0%   { transform: translateY(0px) rotate(0deg) scale(1); filter: brightness(1); }
          50%  { transform: translateY(-15px) rotate(1deg) scale(1.02); filter: brightness(1.05); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); filter: brightness(1); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
        }
      `}} />
    </div>
  );
}