import api, { getErrorMessage } from './api';
import { ENDPOINTS } from './endpoints';

export const checkBackendStatus = async () => {
  const response = await api.get(ENDPOINTS.STATUS);
  return response.data;
};

// Upload audio and create a background consultation job, strictly bound to
// the supplied patient_id so results can never leak across patients.
export const createConsultation = async (file, language, patientId, appointmentId) => {
  const formData = new FormData();
  formData.append('file', file);
  if (language) formData.append('language', language);
  if (patientId) formData.append('patient_id', patientId);
  if (appointmentId) formData.append('appointment_id', appointmentId);

  const response = await api.post(ENDPOINTS.CONSULTATIONS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

// Poll a job until it reaches a terminal state (completed/failed).
export const pollConsultation = async (jobId, onProgress, patientId, { interval = 2000, maxAttempts = 300 } = {}) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await api.get(ENDPOINTS.CONSULTATION_STATUS(jobId), {
      params: patientId ? { patient_id: patientId } : undefined,
    });
    const job = response.data;
    if (onProgress) onProgress(job);
    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('Timed out waiting for consultation processing to finish.');
};

export const fetchTranscript = async (jobId, patientId) => {
  const response = await api.get(ENDPOINTS.TRANSCRIPT(jobId), {
    params: patientId ? { patient_id: patientId } : undefined,
  });
  return response.data;
};

export const fetchSoapNote = async (jobId, patientId) => {
  const response = await api.get(ENDPOINTS.SOAP_NOTE(jobId), {
    params: patientId ? { patient_id: patientId } : undefined,
  });
  return response.data;
};

export const fetchActionSummary = async (jobId, patientId) => {
  const response = await api.get(ENDPOINTS.ACTION_SUMMARY(jobId), {
    params: patientId ? { patient_id: patientId } : undefined,
  });
  return response.data;
};

// Backend-enforced patient-scoped report history (completed jobs).
export const fetchPatientReports = async (patientId) => {
  if (!patientId) return { reports: [] };
  const response = await api.get(ENDPOINTS.PATIENT_CONSULTATIONS(patientId));
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
  fetchPatientReports,
};