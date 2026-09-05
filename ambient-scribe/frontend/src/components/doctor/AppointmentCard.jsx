import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export default function AppointmentCard({ patientName, time, condition, isNext }) {
  return (
    <div className={`relative h-full p-6 rounded-[2rem] backdrop-blur-xl border transition-all duration-500 overflow-hidden group ${
      isNext 
        ? 'bg-white/95 border-white shadow-[0_10px_40px_rgba(79,70,229,0.08)] hover:shadow-[0_15px_50px_rgba(79,70,229,0.15)] hover:-translate-y-1 ring-2 ring-[#EEF2FF]' 
        : 'bg-white/95 border-white shadow-[0_10px_30px_rgb(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 ring-1 ring-white/50'
    }`}>
      
      {/* Glossy Sheen overlay simulating a sterile, smooth glove/glass reflection */}
      <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border border-white ${
            isNext ? 'bg-gradient-to-br from-[#EEF2FF] to-[#E0F2FE] text-[#4F46E5]' : 'bg-[#F8FAFC] text-[#3B82F6]'
          }`}>
            {patientName.charAt(0)}
          </div>
          <div>
            <h4 className="text-base font-bold text-[#172033] tracking-tight">{patientName}</h4>
            <span className="text-xs font-medium text-[#64748B]">{condition}</span>
          </div>
        </div>
        <div className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-sm ${
          isNext ? 'text-[#4F46E5] bg-white border-[#E0F2FE]' : 'text-[#64748B] bg-[#FAFAFA] border-[#E5E7EB]'
        }`}>
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          {time}
        </div>
      </div>
      
      <div className="relative z-10 flex items-center justify-between mt-6 pt-5 border-t border-[#E5E7EB]/70">
        <span className={`text-xs font-bold tracking-wide uppercase px-3 py-1.5 rounded-lg ${
          isNext ? 'text-[#4F46E5] bg-[#EEF2FF]' : 'text-[#64748B] bg-[#FAFAFA] border border-[#E5E7EB]'
        }`}>
          {isNext ? 'Next up' : 'Scheduled'}
        </span>
        <button className={`flex items-center py-2 px-5 text-sm font-semibold rounded-xl transition-all duration-300 ${
          isNext 
            ? 'bg-[#4F46E5] text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5' 
            : 'bg-white text-[#172033] border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#D1D5DB]'
        }`}>
          Start Scribe <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(300%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}} />
    </div>
  );
}