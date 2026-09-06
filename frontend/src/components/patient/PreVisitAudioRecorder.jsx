import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Pause, Download, Trash2, CheckCircle2 } from 'lucide-react';
import useAudioRecorder from '../../hooks/useAudioRecorder';
import { getPrevisitNote, setPrevisitNote } from '../../services/patientStore';

export default function PreVisitAudioRecorder({ patientId }) {
  const [noteUrl, setNoteUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedForDoctor, setSavedForDoctor] = useState(false);
  const audioRef = useRef(null);

  // Scope the voice note to this patient only. Without a patientId the note
  // is not persisted anywhere (prevents cross-patient contamination).
  useEffect(() => {
    if (!patientId) {
      setNoteUrl(null);
      return;
    }
    setNoteUrl(getPrevisitNote(patientId));
  }, [patientId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const saveNoteToStorage = (blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && patientId) {
        setPrevisitNote(patientId, reader.result);
        setNoteUrl(reader.result);
        setSavedForDoctor(true);
        setTimeout(() => setSavedForDoctor(false), 2500);
      }
    };
    reader.readAsDataURL(blob);
  };

  const { isRecording, startRecording, stopRecording } = useAudioRecorder({
    onStop: saveNoteToStorage,
  });

  const handleTogglePlay = () => {
    if (!noteUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(noteUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = noteUrl;
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!noteUrl) return;
    const link = document.createElement('a');
    link.href = noteUrl;
    link.download = 'pre-visit-note.webm';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    if (patientId) setPrevisitNote(patientId, null);
    setNoteUrl(null);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-white/50 text-center relative overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(79,70,229,0.06)] h-full flex flex-col items-center justify-center">

      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[50px] animate-pulse"></div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center w-full">
        <h3 className="text-lg font-extrabold text-[#172033] mb-2 tracking-tight">Voice Note (Optional)</h3>
        <p className="text-sm font-medium text-[#64748B] mb-6 max-w-sm">Tell the doctor your symptoms in Hindi, English, or Marathi before you arrive.</p>

        <div className="flex justify-center mb-2">
          <div className="relative">
            {isRecording && (
              <>
                <div className="absolute inset-0 bg-red-400 opacity-30 rounded-full animate-ping"></div>
                <div className="absolute -inset-4 border border-red-200 rounded-full animate-pulse"></div>
              </>
            )}

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-md border ${
                isRecording
                  ? 'bg-white text-[#DC2626] border-[#FEE2E2] shadow-[0_10px_30px_rgba(220,38,38,0.2)] scale-105'
                  : 'bg-gradient-to-br from-[#EEF2FF] to-[#E0F2FE] text-[#4F46E5] border-white hover:scale-105 hover:shadow-[0_12px_25px_rgba(79,70,229,0.2)]'
              }`}
            >
              {isRecording ? <Square className="w-10 h-10" fill="currentColor" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>
        </div>

        <div className="h-8 mt-4 flex items-center justify-center">
          {isRecording ? (
            <span className="flex items-center text-sm font-bold text-[#DC2626] animate-pulse bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] mr-2"></span>
              Recording...
            </span>
          ) : noteUrl ? (
            <span className="flex items-center text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-4 py-1.5 rounded-full border border-[#BBF7D0]">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {savedForDoctor ? 'Saved for doctor' : 'Note recorded'}
            </span>
          ) : (
            <span className="text-sm font-semibold text-[#4F46E5] opacity-0 transition-opacity">Recording...</span>
          )}
        </div>

        {noteUrl && !isRecording && (
          <div className="mt-2 flex items-center space-x-2">
            <button
              onClick={handleTogglePlay}
              className="flex items-center text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-3 py-2 rounded-xl border border-[#E0F2FE] hover:bg-[#4F46E5] hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center text-xs font-bold text-[#3B82F6] bg-white px-3 py-2 rounded-xl border border-[#E0F2FE] hover:bg-[#E0F2FE] transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download
            </button>
            <button
              onClick={handleClear}
              className="flex items-center text-xs font-bold text-[#DC2626] bg-white px-3 py-2 rounded-xl border border-[#FEE2E2] hover:bg-[#FEF2F2] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}