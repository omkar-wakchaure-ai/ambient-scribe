export const ENDPOINTS = {
  STATUS: '/status',
  CONSULTATIONS: '/consultations',
  JOB_STATUS: (jobId) => `/status/${jobId}`,
  CONSULTATION_STATUS: (jobId) => `/consultations/${jobId}`,
  TRANSCRIPT: (jobId) => `/transcript/${jobId}`,
  SOAP_NOTE: (jobId) => `/soap-note/${jobId}`,
  ACTION_SUMMARY: (jobId) => `/action-summary/${jobId}`,
};