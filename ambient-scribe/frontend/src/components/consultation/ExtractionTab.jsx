import React from 'react';
import { Activity, Pill, Stethoscope, FlaskConical, AlertTriangle, ClipboardList, User } from 'lucide-react';

function Empty({ label }) {
  return <p className="text-xs text-[#94A3B8] italic py-2">{label}</p>;
}

function Card({ icon: Icon, title, color, children }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
      <h3 className={`flex items-center text-sm font-semibold text-[#172033] mb-4 ${color}`}>
        <Icon className="w-4 h-4 mr-2" /> {title}
      </h3>
      {children}
    </div>
  );
}

export default function ExtractionTab({ extraction }) {
  const data = extraction || {};

  const symptoms = data.symptoms || [];
  const medications = data.medications || [];
  const history = data.history || {};
  const investigations = data.investigations || [];
  const plan = data.plan || [];
  const unclearSegments = data.unclear_segments || [];

  const statusStyles = {
    ordered: 'bg-[#F5F9FF] text-[#3B82F6] border-[#E0F2FE]',
    results_reviewed: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
    recommended: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card icon={Activity} title="Chief Complaint" color="text-[#D97706]">
        {data.chief_complaint ? (
          <p className="text-sm text-[#172033] leading-relaxed">{data.chief_complaint}</p>
        ) : (
          <Empty label="No chief complaint extracted." />
        )}
      </Card>

      <Card icon={Activity} title="Symptoms" color="text-[#D97706]">
        {symptoms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {symptoms.map((s, idx) => (
              <span key={`${s.name}-${idx}`} className="px-3 py-1.5 bg-[#FEF3C7] text-[#D97706] text-xs font-medium rounded-lg border border-[#FDE68A]">
                {s.name}
                {s.duration ? ` (${s.duration})` : ''}
                {s.severity ? ` · severity: ${s.severity}` : ''}
              </span>
            ))}
          </div>
        ) : (
          <Empty label="No symptoms extracted." />
        )}
      </Card>

      <Card icon={Pill} title="Medications Noted" color="text-[#3B82F6]">
        {medications.length > 0 ? (
          <div className="space-y-2">
            {medications.map((m, idx) => (
              <div key={`${m.name}-${idx}`} className="px-3 py-2 bg-[#F5F9FF] text-[#3B82F6] text-xs font-medium rounded-lg border border-[#E0F2FE]">
                <span className="font-semibold">{m.name}</span>
                {m.dosage ? ` · ${m.dosage}` : ''}
                {m.frequency ? ` · ${m.frequency}` : ''}
                {m.status ? ` (${m.status})` : ''}
              </div>
            ))}
          </div>
        ) : (
          <Empty label="No medications noted." />
        )}
      </Card>

      <Card icon={Stethoscope} title="Assessment" color="text-[#4F46E5]">
        {data.assessment ? (
          <p className="text-sm text-[#172033] leading-relaxed">{data.assessment}</p>
        ) : (
          <Empty label="No assessment generated." />
        )}
      </Card>

      <Card icon={FlaskConical} title="Investigations" color="text-[#4F46E5]">
        {investigations.length > 0 ? (
          <div className="space-y-2">
            {investigations.map((inv, idx) => (
              <div key={`${inv.name}-${idx}`} className="flex items-start justify-between px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-[#172033]">{inv.name}</p>
                  {inv.result && <p className="text-xs text-[#64748B] mt-0.5">{inv.result}</p>}
                </div>
                <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 border ${statusStyles[inv.status] || 'bg-gray-100 text-[#64748B] border-gray-200'}`}>
                  {inv.status || 'mentioned'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty label="No investigations extracted." />
        )}
      </Card>

      <Card icon={ClipboardList} title="Treatment Plan" color="text-[#16A34A]">
        {plan.length > 0 ? (
          <ol className="space-y-2 list-decimal list-inside">
            {plan.map((item, idx) => (
              <li key={idx} className="text-sm text-[#172033]">{item}</li>
            ))}
          </ol>
        ) : (
          <Empty label="No treatment plan extracted." />
        )}
      </Card>

      <Card icon={User} title="Medical History" color="text-[#64748B]">
        <div className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-[#172033]">Past medical history: </span>
            {history.past_medical_history && history.past_medical_history.length > 0 ? (
              <span className="text-[#64748B]">{history.past_medical_history.join(', ')}</span>
            ) : (
              <Empty label="None" />
            )}
          </div>
          <div>
            <span className="font-semibold text-[#172033]">Allergies: </span>
            {history.allergies && history.allergies.length > 0 ? (
              <span className="text-[#64748B]">{history.allergies.join(', ')}</span>
            ) : (
              <Empty label="None" />
            )}
          </div>
        </div>
      </Card>

      <Card icon={AlertTriangle} title="Flags & Confidence" color="text-[#94A3B8]">
        <p className="text-xs text-[#64748B] mb-2">
          Extraction confidence:{' '}
          <span className="font-semibold text-[#172033]">{data.extraction_confidence || 'low'}</span>
        </p>
        {unclearSegments.length > 0 ? (
          <div className="space-y-1">
            {unclearSegments.map((seg, idx) => (
              <p key={idx} className="text-xs text-[#D97706]">• {seg}</p>
            ))}
          </div>
        ) : (
          <Empty label="No unclear segments flagged." />
        )}
      </Card>
    </div>
  );
}