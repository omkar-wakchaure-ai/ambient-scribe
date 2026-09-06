import React, { useState } from 'react';
import { Activity, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const REPORT_RE = /^(Subjective|Objective|Assessment|Plan)\s*:/im;

// Toggle-expanding card for one completed SOAP report.
function ReportCard({ report, expanded, onToggle }) {
  const hasSections = REPORT_RE.test(report.soap_note || '');
  const chiefComplaint = (typeof report.extraction === 'object' && report.extraction
    && report.extraction.chief_complaint) || '';
  const isPending = report.status && report.status !== 'completed';

  return (
    <div className="group bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] -mt-2 hover:shadow-[0_12px_35px_rgba(79,70,229,0.08)] hover:-translate-y-1 hover:bg-white/95 transition-all duration-300">
      <button onClick={onToggle} className="w-full text-left">
        <span className="text-[10px] font-extrabold tracking-widest text-[#64748B] uppercase bg-[#FAFAFA] px-2 py-1 rounded-md border border-[#E5E7EB]">
          {report.date || 'Recent visit'}
        </span>
        <h4 className="text-lg font-bold text-[#172033] mt-3 flex items-center tracking-tight">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-3 border bg-[#EEF2FF] text-[#4F46E5] border-[#E0F2FE]">
            <FileText className="w-4 h-4" />
          </div>
          SOAP Consultation Report
          {expanded ? <ChevronUp className="w-4 h-4 ml-auto text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 ml-auto text-[#94A3B8]" />}
        </h4>
        {chiefComplaint && (
          <p className="text-sm font-medium text-[#64748B] mt-2 leading-relaxed">
            Chief complaint: {chiefComplaint}
          </p>
        )}
      </button>
      {expanded && (
        <pre className="mt-4 text-sm text-[#172033] leading-relaxed bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 whitespace-pre-wrap font-sans">
          {report.soap_note || 'No SOAP note generated for this consultation.'}
        </pre>
      )}
      {isPending && (
        <p className="text-[11px] font-medium text-[#D97706] mt-3">Still processing…</p>
      )}
    </div>
  );
}

export default function HistoryTimeline({ reports = [], loading = false }) {
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div className="space-y-8">
        <p className="text-sm font-medium text-[#94A3B8] animate-pulse">Loading patient history…</p>
      </div>
    );
  }

  if (!Array.isArray(reports) || reports.length === 0) {
    return (
      <div className="space-y-8">
        <div className="relative pl-8 border-l-2 border-[#EEF2FF] last:border-transparent">
          <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full border-[3px] border-white flex items-center justify-center shadow-sm bg-[#EEF2FF]">
            <CheckCircle2 className="w-3 h-3 text-[#94A3B8]" />
          </div>
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <p className="text-sm font-medium text-[#64748B]">
              No medical history yet.
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Completed consultations will appear here as SOAP reports.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reports.map((report) => {
        const id = report.id || report.jobId || `${report.date}-${report.patientId}`;
        return (
          <div key={id} className="relative pl-8 border-l-2 border-[#EEF2FF] last:border-transparent">
            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full border-[3px] border-white flex items-center justify-center shadow-sm bg-[#EEF2FF]">
              <Activity className="w-3 h-3 text-[#4F46E5]" />
            </div>
            <ReportCard
              report={report}
              expanded={expandedId === id}
              onToggle={() => setExpandedId(expandedId === id ? null : id)}
            />
          </div>
        );
      })}
    </div>
  );
}