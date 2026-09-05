import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { FileText, Save, CheckCircle, Activity, List, FileClock } from 'lucide-react';

export default function LiveConsultation() {
  const navigate = useNavigate();
  const { status, setStatus } = useConsultation();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [language, setLanguage] = useState('hi');
  const [activeTab, setActiveTab] = useState('transcript');

  const tabs = [
    { id: 'transcript', label: 'Transcript', icon: FileClock },
    { id: 'extraction', label: 'Extracted Data', icon: Activity },
    { id: 'soap', label: 'SOAP Note', icon: FileText },
    { id: 'actions', label: 'Action Items', icon: List }
  ];

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      // Simulate API call processing pipeline
      setStatus('processing');
      setTimeout(() => setStatus('review'), 3000); // Mocks the API wait time
    } else {
      startRecording();
      setStatus('recording');
    }
  };

  const renderContent = () => {
    if (status === 'processing') {
      return (
        <div className="flex-1 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center justify-center p-20 mt-6">
          <Loader text="Analyzing consultation audio & generating AI notes..." />
        </div>
      );
    }

    if (status === 'review' || status === 'saved') {
      return (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6">
            {activeTab === 'transcript' && <TranscriptTab />}
            {activeTab === 'extraction' && <ExtractionTab />}
            {activeTab === 'soap' && <SoapNoteTab />}
            {activeTab === 'actions' && <ActionItemsTab />}
          </div>
        </div>
      );
    }

    // Idle or Recording state
    return <LiveAudioRecorder isRecording={isRecording} onToggle={handleToggleRecording} />;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 min-h-screen flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#172033] flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#16A34A] mr-3 animate-pulse"></span>
            Active Consultation: Aarav Patel
          </h1>
        </div>
        <div className="flex space-x-3">
          <LanguageSelector selected={language} onChange={setLanguage} />
          {status === 'review' && (
            <Button variant="primary" icon={Save} onClick={() => {
              setStatus('saved');
              setTimeout(() => navigate('/doctor/dashboard'), 1500);
            }}>
              Save to EHR
            </Button>
          )}
        </div>
      </header>

      {status === 'saved' && (
        <div className="mb-6 p-4 bg-[#DCFCE7] border border-[#16A34A] text-[#16A34A] rounded-xl flex items-center font-medium">
          <CheckCircle className="w-5 h-5 mr-2" />
          Successfully saved to Electronic Health Record. Redirecting...
        </div>
      )}

      {renderContent()}
    </div>
  );
}