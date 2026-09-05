import React, { createContext, useState, useContext } from 'react';

const ConsultationStateContext = createContext();

// Valid states: 'idle', 'recording', 'processing', 'review', 'saved'
export const ConsultationProvider = ({ children }) => {
  const [status, setStatus] = useState('idle');
  const [clinicalData, setClinicalData] = useState(null);

  return (
    <ConsultationStateContext.Provider value={{ status, setStatus, clinicalData, setClinicalData }}>
      {children}
    </ConsultationStateContext.Provider>
  );
};

export const useConsultation = () => useContext(ConsultationStateContext);