import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const dates = [14, 15, 16, 17, 18, 19]; 

  return (
    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.06)] transition-all duration-300 ring-1 ring-white/50 h-full flex flex-col justify-center">
      <h3 className="text-base font-bold text-[#172033] flex items-center mb-5 tracking-tight">
        <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center mr-3 border border-[#E0F2FE]">
          <CalendarIcon className="w-4 h-4 text-[#4F46E5]" />
        </div>
        Select Date
      </h3>
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map(date => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-2xl transition-all duration-300 relative overflow-hidden ${
              selectedDate === date 
                ? 'bg-[#4F46E5] text-white shadow-[0_8px_25px_rgba(79,70,229,0.35)] scale-105 border-none' 
                : 'bg-white border border-[#E5E7EB] text-[#172033] hover:border-[#4F46E5]/50 hover:bg-[#F8FAFC] hover:shadow-md'
            }`}
          >
            {selectedDate === date && <div className="absolute top-0 inset-x-0 h-1 bg-white/40 blur-sm"></div>}
            <span className={`text-[10px] font-bold uppercase mb-1 ${selectedDate === date ? 'text-indigo-100' : 'text-[#64748B]'}`}>Oct</span>
            <span className="text-xl font-extrabold">{date}</span>
          </button>
        ))}
      </div>
    </div>
  );
}