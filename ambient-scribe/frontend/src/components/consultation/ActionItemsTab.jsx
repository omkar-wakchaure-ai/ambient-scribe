import React from 'react';
import { CheckCircle2, FlaskConical, CalendarDays } from 'lucide-react';

export default function ActionItemsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-start p-4 bg-[#DCFCE7] bg-opacity-30 border border-[#DCFCE7] rounded-2xl">
        <CheckCircle2 className="w-5 h-5 text-[#16A34A] mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-[#172033]">Prescribe Paracetamol 650mg</h4>
          <p className="text-xs text-[#64748B] mt-1">SOS for fever. Discontinue previous medication.</p>
        </div>
      </div>

      <div className="flex items-start p-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:border-[#4F46E5] transition-colors cursor-pointer">
        <FlaskConical className="w-5 h-5 text-[#4F46E5] mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-[#172033]">Order Complete Blood Count (CBC)</h4>
          <p className="text-xs text-[#64748B] mt-1">To rule out underlying infection causing 3-day fever.</p>
        </div>
      </div>

      <div className="flex items-start p-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:border-[#4F46E5] transition-colors cursor-pointer">
        <CalendarDays className="w-5 h-5 text-[#3B82F6] mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-[#172033]">Schedule Follow-up</h4>
          <p className="text-xs text-[#64748B] mt-1">Review in 48 hours with CBC reports.</p>
        </div>
      </div>
    </div>
  );
}