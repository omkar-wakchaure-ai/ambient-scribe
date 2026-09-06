import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Centralized axios instance for the FastAPI backend.
// Override the base URL at build/dev time with:
//   VITE_API_BASE_URL=http://127.0.0.1:8000
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const httpError = (status, message, technical) => {
  const err = new Error(message);
  err.status = status;
  err.technical = technical;
  return err;
};

export const getErrorMessage = (err) => {
  if (err && err.isAxiosError) {
    if (!err.response) {
      if (err.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
      }
      return 'Backend is offline. Make sure the FastAPI server is running on port 8000.';
    }
    const { status, data } = err.response;
    const detail = data && data.detail ? data.detail : '';
    switch (status) {
      case 404:
        return `Not found: ${detail || 'the requested resource does not exist.'}`;
      case 409:
        return detail ? `Still processing: ${detail}` : 'Requested result is not ready yet.';
      case 422:
        return `Invalid request: ${detail || 'the submitted data is not valid.'}`;
      case 400:
        return `Bad request: ${detail || 'input was rejected.'}`;
      case 500:
        return 'Server error. Check the backend logs for details.';
      case 502:
        return detail || 'The AI pipeline failed while processing.';
      default:
        return detail || `Request failed with status ${status}.`;
    }
  }
  return err && err.message ? err.message : 'An unexpected error occurred.';
};

export default api;