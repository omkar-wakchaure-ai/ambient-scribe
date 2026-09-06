import React, { createContext, useState, useContext } from 'react';

const ConsultationStateContext = createContext();

// Valid statuses: 'idle', 'recording', 'uploading', 'processing', 'review', 'saved', 'error'
export const ConsultationProvider = ({ children }) => {
  const [status, setStatus] = useState('idle');
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState({ step: '', percent: 0 });
  const [clinicalData, setClinicalData] = useState(null);
  const [error, setError] = useState(null);

  const reset = () => {
    setStatus('idle');
    setJobId(null);
    setProgress({ step: '', percent: 0 });
    setClinicalData(null);
    setError(null);
  };

  return (
    <ConsultationStateContext.Provider
      value={{
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
      }}
    >
      {children}
    </ConsultationStateContext.Provider>
  );
};

export const useConsultation = () => useContext(ConsultationStateContext);