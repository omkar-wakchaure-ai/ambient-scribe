import React from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ selected, onChange }) {
  return (
    <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 shadow-sm hover:border-[#4F46E5] transition-colors">
      <Globe className="w-4 h-4 text-[#64748B] mr-2" />
      <select 
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-sm font-medium text-[#172033] cursor-pointer"
      >
        <option value="en">English (Medical)</option>
        <option value="hi">Hindi (Hinglish)</option>
        <option value="mr">Marathi</option>
      </select>
    </div>
  );
}