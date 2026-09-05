import React from 'react';
import { Activity, Pill, CheckCircle2 } from 'lucide-react';

export default function HistoryTimeline() {
  const history = [
    { id: 1, date: 'Oct 15, 2023', title: 'Viral Fever Consultation', icon: Activity, color: 'text-[#D97706]', bg: 'bg-[#FEF3C7]', border: 'border-[#FDE68A]', active: true },
    { id: 2, date: 'Sep 05, 2023', title: 'Routine Checkup', icon: CheckCircle2, color: 'text-[#16A34A]', bg: 'bg-[#DCFCE7]', border: 'border-[#BBF7D0]', active: false },
  ];

  return (
    <div className="space-y-8">
      {history.map((event) => (
        <div key={event.id} className="relative pl-8 border-l-2 border-[#EEF2FF] last:border-transparent">
          
          {/* Timeline Dot (Glowing if active) */}
          <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-[3px] border-white flex items-center justify-center shadow-sm ${event.bg} ${event.active ? 'shadow-[0_0_15px_rgba(217,119,6,0.4)] animate-pulse' : ''}`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-current ${event.color}`}></div>
          </div>
          
          {/* Glassy Event Card */}
          <div className="group bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] -mt-2 hover:shadow-[0_12px_35px_rgba(79,70,229,0.08)] hover:-translate-y-1 hover:bg-white/95 transition-all duration-300">
            <span className="text-[10px] font-extrabold tracking-widest text-[#64748B] uppercase bg-[#FAFAFA] px-2 py-1 rounded-md border border-[#E5E7EB]">
              {event.date}
            </span>
            <h4 className="text-lg font-bold text-[#172033] mt-3 flex items-center tracking-tight">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 border ${event.bg} ${event.color} ${event.border}`}>
                <event.icon className="w-4 h-4" />
              </div>
              {event.title}
            </h4>
            <p className="text-sm font-medium text-[#64748B] mt-3 leading-relaxed">
              Patient presented with mild symptoms. Prescribed standard medication and advised 3 days rest.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}