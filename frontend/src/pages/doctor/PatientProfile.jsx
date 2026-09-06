import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, PauseCircle, Info } from 'lucide-react';
import Button from '../../components/common/Button';
import DocumentViewer from '../../components/doctor/DocumentViewer';
import HistoryTimeline from '../../components/doctor/HistoryTimeline';
import { getPrevisitNote, getReports } from '../../services/patientStore';

export default function PatientProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient ?? {};
  const patientName = patient.patientName || 'Unknown Patient';
  // Strictly patient-scoped: reports and the pre-visit note are keyed by
  // patientId so another patient's data can never render on this profile.
  const patientId = patient.patientId || String(patient.id || '');
  const [notePlaying, setNotePlaying] = useState(false);
  const [noteUrl, setNoteUrl] = useState(null);
  const [reports, setReports] = useState([]);
  const audioRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.replace('Dr. ', '').trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    if (!patientId) {
      setNoteUrl(null);
      setReports([]);
      return;
    }
    setNoteUrl(getPrevisitNote(patientId));
    setReports(getReports(patientId));
  }, [patientId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handlePlayNote = () => {
    if (!noteUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(noteUrl);
      audioRef.current.onended = () => setNotePlaying(false);
    }

    if (notePlaying) {
      audioRef.current.pause();
      setNotePlaying(false);
    } else {
      audioRef.current.src = noteUrl;
      audioRef.current.play().catch(() => setNotePlaying(false));
      setNotePlaying(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] overflow-hidden flex flex-col pb-20">
      
      {/* ========================================= */}
      {/* AMBIENT GLOWING BACKGROUND                */}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-[#4F46E5]/10 to-[#E0F2FE]/40 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[700px] h-[700px] bg-gradient-to-tl from-[#3B82F6]/10 to-[#EEF2FF]/40 rounded-full blur-[120px]"></div>
      </div>

      {/* ========================================= */}
      {/* FOREGROUND CONTENT                        */}
      {/* ========================================= */}
      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10 space-y-6 mt-4">
        
        <button onClick={() => navigate('/doctor/dashboard')} className="flex items-center text-sm font-semibold text-[#64748B] hover:text-[#4F46E5] transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white shadow-sm w-max">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ========================================= */}
          {/* LEFT SIDEBAR                              */}
          {/* ========================================= */}
          <div className="col-span-1 space-y-8">
            
            {/* Patient Info Card */}
            <div className="group bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_50px_rgba(79,70,229,0.08)] transition-all duration-500 text-center relative overflow-hidden">
              {/* Glossy Sheen overlay on hover */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none"></div>
              
              <div className="relative z-10">
                {/* Glassy Avatar */}
                <div className="relative overflow-hidden w-24 h-24 bg-gradient-to-br from-[#EEF2FF] to-[#E0F2FE] text-[#4F46E5] text-3xl font-extrabold rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_8px_20px_rgba(79,70,229,0.15)] ring-2 ring-white">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6 bg-gradient-to-b from-white to-transparent opacity-80 rounded-full blur-[1px]"></div>
                  <span className="relative z-10">{getInitials(patientName)}</span>
                </div>
                
                <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">{patientName}</h2>
                <p className="text-sm font-medium text-[#64748B] mt-1 mb-8">32 yrs • Male • O+ Blood</p>
                
                {/* Glowing Primary Button */}
                <button 
                  onClick={() => navigate('/doctor/consultation', { state: { patient } })} 
                  className="w-full py-3.5 bg-[#4F46E5] text-white font-semibold text-sm rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  Start Ambient Scribe
                </button>
              </div>
            </div>

            {/* Pre-visit Voice Note Card */}
            <div className="bg-[#F5F9FF]/80 backdrop-blur-md p-6 rounded-[2rem] border border-[#E0F2FE] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-[#172033] mb-4 tracking-tight">Pre-visit Voice Note</h3>
              <button
                onClick={handlePlayNote}
                disabled={!noteUrl}
                className={`w-full flex items-center justify-center p-3.5 bg-white/90 backdrop-blur-sm rounded-xl border border-white shadow-sm text-sm font-bold transition-all duration-300 group ${
                  noteUrl
                    ? 'text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white hover:shadow-[0_8px_20px_rgba(79,70,229,0.2)] hover:-translate-y-0.5'
                    : 'text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                {notePlaying ? (
                  <PauseCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                ) : (
                  <PlayCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                )}
                {!noteUrl ? 'No Pre-visit Note Recorded' : notePlaying ? 'Pause Note' : 'Play Patient Note'}
              </button>
              {!noteUrl && (
                <p className="flex items-center justify-center text-[11px] font-medium text-[#64748B] mt-3">
                  <Info className="w-3.5 h-3.5 mr-1.5" />
                  Recorded on the patient's booking screen (demo, stored locally).
                </p>
              )}
            </div>

            <DocumentViewer documents={patient.documents || []} />
          </div>

          {/* ========================================= */}
          {/* RIGHT SIDEBAR (HISTORY)                   */}
          {/* ========================================= */}
          <div className="col-span-2 bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
            <h3 className="text-2xl font-extrabold text-[#172033] mb-8 tracking-tight">Patient History & Reports</h3>
            <HistoryTimeline reports={reports} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        @keyframes shimmer { 100% { transform: translateX(300%) skewX(-12deg); } }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
      `}} />
    </div>
  );
}