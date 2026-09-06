import React from 'react';

export default function Loader({ text = "AI is analyzing..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#E0F2FE] animate-[spin_3s_linear_infinite]"></div>
        {/* Inner pulse */}
        <div className="absolute inset-2 rounded-full border-2 border-t-[#4F46E5] border-r-[#3B82F6] border-b-transparent border-l-transparent animate-spin"></div>
        {/* Center dot */}
        <div className="absolute inset-6 bg-[#4F46E5] rounded-full shadow-[0_0_15px_rgba(79,70,229,0.6)] animate-pulse"></div>
      </div>
      <p className="text-[#64748B] text-sm font-medium animate-pulse">{text}</p>
    </div>
  );
}