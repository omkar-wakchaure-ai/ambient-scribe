import api, { getErrorMessage } from './api';
import { ENDPOINTS } from './endpoints';

export const checkBackendStatus = async () => {
  const response = await api.get(ENDPOINTS.STATUS);
  return response.data;
};

// Upload audio and create a background consultation job.
export const createConsultation = async (file, language) => {
  const formData = new FormData();
  formData.append('file', file);
  if (language) formData.append('language', language);

  const response = await api.post(ENDPOINTS.CONSULTATIONS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

// Poll a job until it reaches a terminal state (completed/failed).
export const pollConsultation = async (jobId, onProgress, { interval = 2000, maxAttempts = 300 } = {}) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await api.get(ENDPOINTS.CONSULTATION_STATUS(jobId));
    const job = response.data;
    if (onProgress) onProgress(job);
    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('Timed out waiting for consultation processing to finish.');
};

export const fetchTranscript = async (jobId) => {
  const response = await api.get(ENDPOINTS.TRANSCRIPT(jobId));
  return response.data;
};

export const fetchSoapNote = async (jobId) => {
  const response = await api.get(ENDPOINTS.SOAP_NOTE(jobId));
  return response.data;
};

export const fetchActionSummary = async (jobId) => {
  const response = await api.get(ENDPOINTS.ACTION_SUMMARY(jobId));
  return response.data;
};

export const formatError = getErrorMessage;

export default {
  checkBackendStatus,
  createConsultation,
  pollConsultation,
  fetchTranscript,
  fetchSoapNote,
  fetchActionSummary,
};