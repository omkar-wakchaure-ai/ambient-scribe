import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsultation } from '../../context/ConsultationStateContext';
import useAudioRecorder from '../../hooks/useAudioRecorder';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Tabs from '../../components/common/Tabs';
import LanguageSelector from '../../components/consultation/LanguageSelector';
import LiveAudioRecorder from '../../components/consultation/LiveAudioRecorder';
import TranscriptTab from '../../components/consultation/TranscriptTab';
import ExtractionTab from '../../components/consultation/ExtractionTab';
import SoapNoteTab from '../../components/consultation/SoapNoteTab';
import ActionItemsTab from '../../components/consultation/ActionItemsTab';
import {
  checkBackendStatus,
  createConsultation,
  pollConsultation,
  fetchTranscript,
  fetchSoapNote,
  fetchActionSummary,
  formatError,
} from '../../services/consultationApi';
import { Server, ServerOff, FileText, CheckCircle, Activity, List, FileClock, XCircle } from 'lucide-react';

const PROCESSING_STEPS = [
  'Uploading audio',
  'Processing audio',
  'Transcribing audio',
  'Identifying speakers',
  'Extracting clinical information',
  'Generating SOAP note',
  'Generating action summary',
  'Completed',
];

export default function LiveConsultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPatient = location.state?.patient ?? null;
  const activePatientName = currentPatient?.patientName || 'Aarav Patel';
  const {
    status,
    setStatus,
    jobId,
    setJobId,
    progress,
    setProgress,
    clinicalData,
    setClinicalData,
    error,
    setError,
    reset,
  } = useConsultation();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder({
    onStop: (blob) => {
      if (blob && blob.size > 0) {
        const file = new File([blob], 'consultation-recording.webm', { type: blob.type || 'audio/webm' });
        runConsultation(file, 'Live recording');
      }
    },
  });
  const [language, setLanguage] = useState('hi');
  const [activeTab, setActiveTab] = useState('transcript');
  const [backendOnline, setBackendOnline] = useState(null);
  const [backendChecked, setBackendChecked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const tabs = [
    { id: 'transcript', label: 'Transcript', icon: FileClock },
    { id: 'extraction', label: 'Extracted Data', icon: Activity },
    { id: 'soap', label: 'SOAP Note', icon: FileText },
    { id: 'actions', label: 'Action Items', icon: List },
  ];

  const normalizedStep = (step) => {
    const s = String(step || '').toLowerCase();
    if (s.includes('transcrib')) return 'Transcribing audio';
    if (s.includes('speaker') || s.includes('diariz')) return 'Identifying speakers';
    if (s.includes('extract')) return 'Extracting clinical information';
    if (s.includes('soap')) return 'Generating SOAP note';
    if (s.includes('action')) return 'Generating action summary';
    if (s.includes('complete')) return 'Completed';
    if (s.includes('start')) return 'Processing audio';
    return 'Processing audio';
  };

  const runConsultation = async (audioFile, sourceName) => {
    setError(null);
    setClinicalData(null);
    setStatus('uploading');
    setIsUploading(true);
    try {
      const uploaded = await createConsultation(audioFile, language);
      const id = uploaded.job_id;
      setJobId(id);
      setProgress({ step: 'Processing audio', percent: 1 });
      setStatus('processing');

      const job = await pollConsultation(id, (statusUpdate) => {
        setProgress({
          step: normalizedStep(statusUpdate.step),
          percent: statusUpdate.progress || 0,
        });
        setStatus(statusUpdate.status === 'failed' ? 'error' : 'processing');
      });

      if (job.status === 'failed') {
        setStatus('error');
        setError(job.error || 'Consultation processing failed on the server.');
        return;
      }

      setProgress({ step: 'Completed', percent: 100 });

      const [transcript, soapNote, actions] = await Promise.all([
        fetchTranscript(id),
        fetchSoapNote(id),
        fetchActionSummary(id),
      ]);

      setClinicalData({
        jobId: id,
        source: sourceName,
        segments: transcript.segments || [],
        soap_note: soapNote.soap_note || '',
        actions: actions.actions || {},
        extraction: (job.result && job.result.extraction) || {},
      });
      setStatus('review');
    } catch (err) {
      console.error('Consultation pipeline failed:', err);
      setError(formatError(err));
      setStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
      setStatus('recording');
    }
  };

  const handleFileSelect = (file) => {
    runConsultation(file, file.name);
  };

  const handleBackendCheck = async () => {
    setBackendChecked(false);
    try {
      const res = await checkBackendStatus();
      setBackendOnline(Boolean(res && res.status === 'ok'));
    } catch (err) {
      console.error('Backend status check failed:', err);
      setBackendOnline(false);
    } finally {
      setBackendChecked(true);
    }
  };

  const handleEndVisit = () => {
    let appts = [];
    try {
      appts = JSON.parse(localStorage.getItem('demo_appointments') || '[]');
    } catch (error) {
      appts = [];
    }

    let currentId = currentPatient?.id;
    if (currentId === undefined && Array.isArray(appts) && appts.length > 0) {
      currentId = appts[0].id;
    }

    const remaining = (Array.isArray(appts) ? appts : []).filter((a) => a.id !== currentId);
    localStorage.setItem('demo_appointments', JSON.stringify(remaining));

    const completed = parseInt(localStorage.getItem('completed_notes_count') || '8', 10);
    localStorage.setItem('completed_notes_count', String(Number.isFinite(completed) ? completed + 1 : 9));
    window.dispatchEvent(new Event('consultationCompleted'));

    navigate('/doctor/dashboard');
  };

  const renderContent = () => {
    if (status === 'uploading' || status === 'processing') {
      const stepIndex = PROCESSING_STEPS.indexOf(progress.step);
      const currentStepLabel = stepIndex >= 0 ? progress.step : 'Processing audio';
      return (
        <div className="flex-1 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center justify-center p-20 mt-6">
          <div className="flex flex-col items-center">
            <Loader text={`Analyzing consultation audio...`} />
            <div className="w-full max-w-sm mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#4F46E5]">{currentStepLabel}</span>
                <span className="text-sm font-medium text-[#64748B]">{progress.percent || 0}%</span>
              </div>
              <div className="h-2 bg-[#EEF2FF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
                  style={{ width: `${progress.percent || 0}%` }}
                ></div>
              </div>
              <div className="mt-4 space-y-1.5">
                {PROCESSING_STEPS.map((step, idx) => (
                  <div key={step} className="flex items-center text-xs">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        idx < stepIndex
                          ? 'bg-[#16A34A]'
                          : idx === stepIndex
                            ? 'bg-[#4F46E5] animate-pulse'
                            : 'bg-[#E5E7EB]'
                      }`}
                    ></span>
                    <span className={idx <= stepIndex ? 'text-[#172033]' : 'text-[#94A3B8]'}>{step}</span>
                  </div>
                ))}
              </div>
              {jobId && (
                <p className="mt-4 text-xs text-[#94A3B8] text-center">
                  Job ID: {jobId} · results will appear when processing finishes
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="bg-white rounded-2xl border border-[#FCA5A5] shadow-sm p-8 mt-6">
          <div className="flex items-center mb-4">
            <XCircle className="w-8 h-8 text-[#DC2626] mr-3" />
            <h2 className="text-lg font-bold text-[#172033]">Processing failed</h2>
          </div>
          <p className="text-sm text-[#64748B] bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
            {error || 'An unexpected error occurred. Please try again.'}
          </p>
          <p className="text-xs text-[#94A3B8] mt-3">
            Technical details were logged to the browser console and backend logs.
          </p>
          <div className="flex space-x-3 mt-6">
            <Button
              variant="primary"
              onClick={() => {
                if (jobId) {
                  setStatus('processing');
                  setError(null);
                  setProgress({ step: 'Processing audio', percent: 10 });
                } else {
                  reset();
                }
              }}
            >
              Retry
            </Button>
            <Button variant="outline" onClick={() => reset()}>
              Start over
            </Button>
          </div>
        </div>
      );
    }

    if (status === 'review' || status === 'saved') {
      return (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#94A3B8]">
              {clinicalData.source ? `Source: ${clinicalData.source}` : ''}
              {clinicalData.jobId ? ` · Job ${clinicalData.jobId}` : ''}
            </p>
            <Button variant="outline" onClick={() => reset()} className="py-1.5 px-3 text-xs">
              New consultation
            </Button>
          </div>
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6">
            {activeTab === 'transcript' && <TranscriptTab segments={clinicalData.segments} />}
            {activeTab === 'extraction' && <ExtractionTab extraction={clinicalData.extraction} />}
            {activeTab === 'soap' && <SoapNoteTab soapNote={clinicalData.soap_note} />}
            {activeTab === 'actions' && <ActionItemsTab actions={clinicalData.actions} />}
          </div>
        </div>
      );
    }

    // Idle or Recording state
    return (
      <LiveAudioRecorder
        isRecording={isRecording}
        uploading={isUploading}
        onToggle={handleToggleRecording}
        onFileSelect={handleFileSelect}
      />
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 min-h-screen flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#172033] flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#16A34A] mr-3 animate-pulse"></span>
            Active Consultation: {activePatientName}
          </h1>
          <button
            onClick={handleBackendCheck}
            className={`mt-1 flex items-center text-xs font-medium ${
              backendChecked && !backendOnline ? 'text-[#DC2626]' : 'text-[#64748B]'
            } hover:underline`}
          >
            {backendChecked ? (
              backendOnline ? (
                <>
                  <Server className="w-3.5 h-3.5 mr-1 text-[#16A34A]" /> Backend connected (click to recheck)
                </>
              ) : (
                <>
                  <ServerOff className="w-3.5 h-3.5 mr-1" /> Backend unreachable — is uvicorn running on :8000? (click to retry)
                </>
              )
            ) : (
              <>
                <Server className="w-3.5 h-3.5 mr-1" /> Check backend connection
              </>
            )}
          </button>
        </div>
        <div className="flex space-x-3">
          <LanguageSelector selected={language} onChange={setLanguage} />
          {status === 'review' && (
            <Button
              variant="primary"
              icon={CheckCircle}
              onClick={handleEndVisit}
            >
              End Visit
            </Button>
          )}
        </div>
      </header>

      {status === 'error' && jobId && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-xl flex items-center font-medium">
          <XCircle className="w-5 h-5 mr-2" />
          Job {jobId} failed: {error}
        </div>
      )}

      {renderContent()}
    </div>
  );
}