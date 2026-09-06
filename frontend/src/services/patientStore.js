// Patient-scoped local persistence.
//
// Every voice note and generated report is keyed by patientId so one
// patient's audio/transcripts/SOAP notes can never surface on another
// patient's profile, session, or records view.

const REPORTS_KEY = 'medscribe_reports';
const PREVISIT_KEY = 'medscribe_previsit_notes';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (error) {
    console.warn(`[patientStore] corrupted ${key}, resetting`, error);
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// --- Medical reports (SOAP + transcript + actions) ----------------------

// Initialize a patient's report collection as empty by default. This is
// called whenever a new patient/appointment is created so the Reports/
// History section is never undefined or shared with another patient.
export const ensurePatientReports = (patientId) => {
  if (!patientId) return;
  const all = readJson(REPORTS_KEY, {});
  if (!Array.isArray(all[patientId])) {
    all[patientId] = [];
    writeJson(REPORTS_KEY, all);
  }
};

export const getReports = (patientId) => {
  if (!patientId) return [];
  const all = readJson(REPORTS_KEY, {});
  return Array.isArray(all[patientId]) ? all[patientId] : [];
};

// Append a finished consultation report to exactly one patient's history.
export const addReport = (patientId, report) => {
  if (!patientId) return;
  const all = readJson(REPORTS_KEY, {});
  if (!Array.isArray(all[patientId])) all[patientId] = [];
  all[patientId].unshift(report);
  writeJson(REPORTS_KEY, all);
};

// --- Pre-visit voice notes -------------------------------------------------

export const getPrevisitNote = (patientId) => {
  if (!patientId) return null;
  const all = readJson(PREVISIT_KEY, {});
  return all[patientId] || null;
};

export const setPrevisitNote = (patientId, dataUrl) => {
  if (!patientId) return;
  const all = readJson(PREVISIT_KEY, {});
  if (dataUrl) {
    all[patientId] = dataUrl;
  } else {
    delete all[patientId];
  }
  writeJson(PREVISIT_KEY, all);
};

export default {
  ensurePatientReports,
  getReports,
  addReport,
  getPrevisitNote,
  setPrevisitNote,
};