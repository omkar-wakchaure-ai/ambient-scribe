import React, { useState } from 'react';
import { Mic, Square } from 'lucide-react';

export default function PreVisitAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-white/50 text-center relative overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(79,70,229,0.06)] h-full flex flex-col items-center justify-center">
      
      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[50px] animate-pulse"></div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center w-full">
        <h3 className="text-lg font-extrabold text-[#172033] mb-2 tracking-tight">Voice Note (Optional)</h3>
        <p className="text-sm font-medium text-[#64748B] mb-8 max-w-sm">Tell the doctor your symptoms in Hindi, English, or Marathi before you arrive.</p>
        
        <div className="flex justify-center mb-2">
          <div className="relative">
            {isRecording && (
              <>
                <div className="absolute inset-0 bg-red-400 opacity-30 rounded-full animate-ping"></div>
                <div className="absolute -inset-4 border border-red-200 rounded-full animate-pulse"></div>
              </>
            )}
            
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`relative z-10 w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-md border ${
                isRecording 
                  ? 'bg-white text-[#DC2626] border-[#FEE2E2] shadow-[0_10px_30px_rgba(220,38,38,0.2)] scale-105' 
                  : 'bg-gradient-to-br from-[#EEF2FF] to-[#E0F2FE] text-[#4F46E5] border-white hover:scale-105 hover:shadow-[0_12px_25px_rgba(79,70,229,0.2)]'
              }`}
            >
              {isRecording ? <Square className="w-10 h-10" fill="currentColor" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>
        </div>
        
        <div className="h-8 mt-6 flex items-center justify-center">
          {isRecording ? (
            <span className="flex items-center text-sm font-bold text-[#DC2626] animate-pulse bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] mr-2"></span>
              Recording...
            </span>
          ) : (
            <span className="text-sm font-semibold text-[#4F46E5] opacity-0 transition-opacity">Recording...</span>
          )}
        </div>
      </div>
    </div>
  );
}