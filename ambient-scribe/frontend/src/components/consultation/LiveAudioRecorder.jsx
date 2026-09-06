import React, { useRef } from 'react';
import { Mic, Square, Upload } from 'lucide-react';

export default function LiveAudioRecorder({ isRecording, onToggle, onFileSelect, uploading = false }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    event.target.value = '';
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB] mt-4 relative overflow-hidden">
      {/* Background glowing rings when recording */}
      {isRecording && (
        <>
          <div className="absolute w-48 h-48 bg-[#EEF2FF] rounded-full animate-ping opacity-75"></div>
          <div className="absolute w-64 h-64 bg-[#E0F2FE] rounded-full animate-pulse opacity-50"></div>
        </>
      )}

      <button
        onClick={onToggle}
        disabled={uploading}
        className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          uploading
            ? 'bg-white border-2 border-[#E5E7EB] text-[#94A3B8] cursor-wait'
            : isRecording
              ? 'bg-white border-2 border-[#DC2626] text-[#DC2626] shadow-[0_0_20px_rgba(220,38,38,0.3)]'
              : 'bg-[#4F46E5] text-white hover:scale-105 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]'
        }`}
      >
        {isRecording ? <Square className="w-8 h-8" fill="currentColor" /> : <Mic className="w-8 h-8" />}
      </button>

      <p className="mt-6 text-sm font-medium text-[#64748B] z-10">
        {isRecording ? (
          <span className="flex items-center text-[#4F46E5]">
            <span className="w-2 h-2 bg-[#DC2626] rounded-full mr-2 animate-pulse"></span>
            Ambient Scribe is listening...
          </span>
        ) : uploading ? (
          <span className="text-[#4F46E5]">Uploading consultation audio...</span>
        ) : (
          <>Tap to start consultation, or upload an existing audio file</>
        )}
      </p>

      {!isRecording && !uploading && (
        <div className="mt-5 z-10 flex flex-col items-center">
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="flex items-center px-5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#4F46E5] shadow-sm hover:border-[#4F46E5] hover:bg-[#F7F5FF] transition-all duration-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose audio file (wav/mp3/m4a/ogg/webm)
          </button>
          <input ref={fileInputRef} type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm" className="hidden" onChange={handleFileChange} />
          <p className="mt-3 text-xs text-[#94A3B8]">
            Audio is processed server-side by the AI pipeline. Nothing runs in the browser.
          </p>
        </div>
      )}
    </div>
  );
}