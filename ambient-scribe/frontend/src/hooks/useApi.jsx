import { useState } from 'react';
import {
  createConsultation,
  fetchTranscript,
  formatError,
} from '../services/consultationApi';

// Wrapper around the centralized FastAPI-backed services.
// Kept for compatibility; the LiveConsultation page uses
// services/consultationApi directly.
export default function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const postAudio = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const uploaded = await createConsultation(file);
      return uploaded;
    } catch (err) {
      const friendly = formatError(err);
      setError(friendly);
      console.error('Upload failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTranscript = async (jobId) => {
    setIsLoading(true);
    setError(null);
    try {
      return await fetchTranscript(jobId);
    } catch (err) {
      setError(formatError(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, postAudio, getTranscript };
}