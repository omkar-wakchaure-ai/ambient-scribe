import React from 'react';
import Button from '../common/Button';
import { Copy } from 'lucide-react';

export default function SoapNoteTab() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm relative overflow-hidden group">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" icon={Copy} className="py-1.5 px-3 text-xs">Copy</Button>
      </div>
      <div className="p-6 space-y-6">
        <section>
          <h4 className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider mb-2">Subjective</h4>
          <p className="text-sm text-[#172033] leading-relaxed bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E7EB]">
            Patient presents with a 3-day history of fever accompanied by generalized body ache. Reports taking Crocin at home without significant relief.
          </p>
        </section>
        <section>
          <h4 className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider mb-2">Objective</h4>
          <p className="text-sm text-[#172033] leading-relaxed bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E7EB]">
            Pending vital signs and physical examination input.
          </p>
        </section>
        {/* Assessment and Plan sections follow the same structure */}
      </div>
    </div>
  );
}