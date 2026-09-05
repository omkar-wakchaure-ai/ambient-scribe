import React from 'react';

export default function TranscriptTab({ transcriptData }) {
  // Mock data for display purposes
  const data = transcriptData || [
    { speaker: 'Doctor', text: 'Namaste, tell me what brings you in today?', time: '00:02' },
    { speaker: 'Patient', text: 'Mujhe 3 din se fever hai and body pain bhi hai.', time: '00:07' }
  ];

  return (
    <div className="space-y-4 p-4">
      {data.map((line, idx) => (
        <div key={idx} className={`flex flex-col ${line.speaker === 'Doctor' ? 'items-end' : 'items-start'}`}>
          <span className="text-xs text-[#64748B] mb-1 font-medium px-1">
            {line.speaker} • {line.time}
          </span>
          <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
            line.speaker === 'Doctor' 
              ? 'bg-[#EEF2FF] text-[#172033] border border-[#E0F2FE] rounded-tr-sm' 
              : 'bg-white border border-[#E5E7EB] text-[#172033] shadow-sm rounded-tl-sm'
          }`}>
            {line.text}
          </div>
        </div>
      ))}
    </div>
  );
}