import React from 'react';
import { Activity, Pill, Clock } from 'lucide-react';

export default function ExtractionTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <h3 className="flex items-center text-sm font-semibold text-[#172033] mb-4">
          <Activity className="w-4 h-4 mr-2 text-[#D97706]" /> Symptoms
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-[#FEF3C7] text-[#D97706] text-xs font-medium rounded-lg border border-[#FDE68A]">Fever (3 Days)</span>
          <span className="px-3 py-1.5 bg-[#FEF3C7] text-[#D97706] text-xs font-medium rounded-lg border border-[#FDE68A]">Body Pain</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <h3 className="flex items-center text-sm font-semibold text-[#172033] mb-4">
          <Pill className="w-4 h-4 mr-2 text-[#3B82F6]" /> Medications Noted
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-[#F5F9FF] text-[#3B82F6] text-xs font-medium rounded-lg border border-[#E0F2FE]">Crocin (Self-administered)</span>
        </div>
      </div>
    </div>
  );
}