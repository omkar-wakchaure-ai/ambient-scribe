import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, Users, FileText, LogOut } from 'lucide-react';
import AppointmentCard from '../../components/doctor/AppointmentCard';
import { useAuth } from '../../context/AuthContext'; // Import the auth context

// Ensure you save the new generated image in this location
import glassStethoscopeImg from '../../assets/glass-stethoscope.png';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get the logout function
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the dropdown

  const readAppointments = () => {
    const defaultAppts = [
      { id: 1, patientId: "patient-1", patientName: "Aarav Patel", time: "10:00 AM", condition: "Viral Fever (Follow-up)", isNext: true, status: "SCHEDULED", patientEmail: "aarav@example.com" },
      { id: 2, patientId: "patient-2", patientName: "Priya Sharma", time: "10:30 AM", condition: "Routine Checkup", isNext: false, status: "SCHEDULED", patientEmail: "priya@example.com" }
    ];

    const storedAppointments = localStorage.getItem('demo_appointments');
    let localAppts = [];
    try {
      localAppts = JSON.parse(storedAppointments || '[]');
    } catch (error) {
      localAppts = [];
    }

    if (storedAppointments === null || !Array.isArray(localAppts)) {
      localStorage.setItem('demo_appointments', JSON.stringify(defaultAppts));
      return defaultAppts;
    }
    // Normalize legacy appointments (books created before statuses existed).
    return localAppts.map((appt) => ({
      ...appt,
      status: appt.status || 'SCHEDULED',
      patientId: appt.patientId || (appt.patientEmail ? appt.patientEmail : `patient-${appt.id}`),
    }));
  };

  const readCompletedCount = () => {
    const storedCount = parseInt(localStorage.getItem('completed_notes_count') || '8', 10);
    return Number.isFinite(storedCount) && storedCount >= 8 ? storedCount : 8;
  };

  const [appointments, setAppointments] = useState(readAppointments);
  const [completedCount, setCompletedCount] = useState(readCompletedCount);

  useEffect(() => {
    const refreshDashboard = () => {
      setAppointments(readAppointments());
      setCompletedCount(readCompletedCount());
    };

    window.addEventListener('storage', refreshDashboard);
    window.addEventListener('consultationCompleted', refreshDashboard);
    window.addEventListener('pageshow', refreshDashboard);
    return () => {
      window.removeEventListener('storage', refreshDashboard);
      window.removeEventListener('consultationCompleted', refreshDashboard);
      window.removeEventListener('pageshow', refreshDashboard);
    };
  }, []);

  const pendingReviewsCount = 4;
  // Completed appointments are removed from the "active" list so the grid and
  // the "Today's Patients" stat always reflect remaining upcoming visits.
  const activeAppointments = appointments.filter((a) => a.status !== 'COMPLETED');
  const totalTodayPatients = activeAppointments.length;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.replace('Dr. ', '').trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

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
            <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">Welcome back, {user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name}`}</h1>
            <p className="text-[#64748B] text-sm mt-1 font-medium">Here is your schedule for today.</p>
          </div>
          
          {/* Avatar Profile Wrapper */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-12 h-12 bg-white/95 backdrop-blur-md text-[#4F46E5] font-bold rounded-full flex items-center justify-center border-2 border-[#E0F2FE] shadow-[0_4px_15px_rgba(224,242,254,0.8)] ring-1 ring-white hover:ring-[#E0F2FE] hover:shadow-[0_8px_25px_rgba(79,70,229,0.25)] transition-all duration-300 cursor-pointer z-20 relative"
            >
              {getInitials(user?.name)}
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_15px_35px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_45px_rgba(79,70,229,0.1)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-[#EEF2FF] text-[#4F46E5] rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-[#64748B] text-sm font-bold tracking-wide uppercase">Today's Patients</p>
            {/* Dynamic Total Patients */}
            <h2 className="text-3xl font-black text-[#172033] mt-1">{totalTodayPatients}</h2>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_15px_35px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_45px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-[#ECFDF5] text-[#10B981] rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-[#64748B] text-sm font-bold tracking-wide uppercase">Completed Notes</p>
            {/* Dynamic Completed Notes */}
            <h2 className="text-3xl font-black text-[#172033] mt-1">{completedCount}</h2>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_15px_35px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_45px_rgba(245,158,11,0.1)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-[#FFFBEB] text-[#F59E0B] rounded-2xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-[#64748B] text-sm font-bold tracking-wide uppercase">Pending Reviews</p>
            {/* Pending Reviews */}
            <h2 className="text-3xl font-black text-[#172033] mt-1">{pendingReviewsCount}</h2>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_15px_35px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_45px_rgba(99,102,241,0.1)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-[#EEF2FF] text-[#6366F1] rounded-2xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-[#64748B] text-sm font-bold tracking-wide uppercase">Time Saved</p>
            <h2 className="text-3xl font-black text-[#172033] mt-1">2.4 hrs</h2>
          </div>
        </div>

        {/* Appointments */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-[#172033] mb-6">Upcoming Appointments</h2>
          {activeAppointments.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-white shadow-[0_15px_35px_rgba(0,0,0,0.04)] text-center">
              <p className="text-sm font-medium text-[#64748B]">No upcoming appointments.</p>
              <p className="text-xs text-[#94A3B8] mt-1">All today's visits have been completed.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAppointments.map((appt) => (
              <div key={appt.id} onClick={() => navigate(`/doctor/patient/${appt.id}`, { state: { patient: appt } })} className="cursor-pointer h-full">
                <AppointmentCard patient={appt} patientName={appt.patientName} time={appt.time} condition={appt.condition} isNext={appt.isNext} />
              </div>
            ))}
          </div>
          )}
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