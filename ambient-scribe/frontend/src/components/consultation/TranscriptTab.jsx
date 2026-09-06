import React from 'react';
import { MessageSquare } from 'lucide-react';

const formatTime = (seconds) => {
  if (seconds == null) return '';
  const s = typeof seconds === 'number' ? seconds : parseFloat(seconds);
  if (Number.isNaN(s)) return '';
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function TranscriptTab({ segments }) {
  const data = Array.isArray(segments) ? segments : [];

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
        <MessageSquare className="w-10 h-10 text-[#94A3B8] mb-3" />
        <p className="text-sm text-[#64748B] font-medium">No transcript segments available.</p>
        <p className="text-xs text-[#94A3B8] mt-1">Process an audio consultation to see the speaker transcript.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <h3 className="text-sm font-semibold text-[#172033]">Speaker-labelled transcript</h3>
        <span className="text-xs text-[#94A3B8]">{data.length} segments</span>
      </div>
      {data.map((line, idx) => {
        const speaker = line.speaker || 'SPEAKER';
        const isSpeaker00 = String(speaker).toLowerCase().endsWith('00');
        const timeLabel = formatTime(line.start);
        return (
          <div key={`${speaker}-${idx}`} className={`flex flex-col ${isSpeaker00 ? 'items-start' : 'items-end'}`}>
            <span className="text-xs text-[#64748B] mb-1 font-medium px-1">
              {speaker}
              {timeLabel ? ` • ${timeLabel}` : ''}
            </span>
            <div
              className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                isSpeaker00
                  ? 'bg-white border border-[#E5E7EB] text-[#172033] shadow-sm rounded-tl-sm'
                  : 'bg-[#EEF2FF] text-[#172033] border border-[#E0F2FE] rounded-tr-sm'
              }`}
            >
              {line.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}