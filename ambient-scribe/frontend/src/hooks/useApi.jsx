import { useState } from 'react';

// Wrapper for your FastAPI endpoints
export default function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const BASE_URL = 'http://localhost:8000'; // Replace with Person C's API URL

  const postAudio = async (audioBlob, language) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'consultation.wav');
      formData.append('language', language);

      const response = await fetch(`${BASE_URL}/transcript`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to process audio');
      return await response.json(); // Returns Transcript JSON
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateClinicalNote = async (transcriptJson) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transcriptJson),
      });
      return await response.json(); // Returns Extracted Data, SOAP, Actions
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, postAudio, generateClinicalNote };
}