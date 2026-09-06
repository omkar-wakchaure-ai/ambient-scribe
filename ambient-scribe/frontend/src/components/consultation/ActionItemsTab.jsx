import React from 'react';
import { CheckCircle2, FlaskConical, CalendarDays, Stethoscope, Info, AlertTriangle, ClipboardList } from 'lucide-react';

function ActionCard({ icon: Icon, title, items, iconColor, bgClass }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex items-start p-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
      <Icon className={`w-5 h-5 ${iconColor} mt-0.5 mr-3 flex-shrink-0`} />
      <div>
        <h4 className="text-sm font-semibold text-[#172033]">{title}</h4>
        <ul className="mt-1 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-xs text-[#64748B] leading-relaxed">• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ActionItemsTab({ actions }) {
  const data = actions || {};

  const medicationActions = data.medication_actions || [];
  const investigationActions = data.investigation_actions || [];
  const referralActions = data.referral_actions || [];
  const patientInstructions = data.patient_instructions || [];
  const flagsForReview = data.flags_for_review || [];
  const followUp = data.follow_up || {};

  const hasAnything =
    medicationActions.length > 0 ||
    investigationActions.length > 0 ||
    referralActions.length > 0 ||
    patientInstructions.length > 0 ||
    flagsForReview.length > 0 ||
    followUp.required;

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
        <ClipboardList className="w-10 h-10 text-[#94A3B8] mb-3" />
        <p className="text-sm text-[#64748B] font-medium">No action items generated.</p>
        <p className="text-xs text-[#94A3B8] mt-1">Complete a consultation to generate action items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ActionCard
        icon={CheckCircle2}
        title="Medication actions"
        items={medicationActions}
        iconColor="text-[#16A34A]"
      />
      <ActionCard
        icon={FlaskConical}
        title="Investigations to order"
        items={investigationActions}
        iconColor="text-[#4F46E5]"
      />
      <ActionCard
        icon={Stethoscope}
        title="Referrals"
        items={referralActions}
        iconColor="text-[#D97706]"
      />
      <ActionCard
        icon={Info}
        title="Patient instructions"
        items={patientInstructions}
        iconColor="text-[#3B82F6]"
      />

      {followUp.required && (
        <div className="flex items-start p-4 bg-[#DCFCE7] bg-opacity-30 border border-[#DCFCE7] rounded-2xl">
          <CalendarDays className="w-5 h-5 text-[#16A34A] mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-[#172033]">Follow-up Required</h4>
            {followUp.timeframe && <p className="text-xs text-[#64748B] mt-1">Timeframe: {followUp.timeframe}</p>}
            {followUp.reason && <p className="text-xs text-[#64748B] mt-0.5">Reason: {followUp.reason}</p>}
          </div>
        </div>
      )}

      {flagsForReview.length > 0 && (
        <div className="flex items-start p-4 bg-[#FEF3C7] bg-opacity-40 border border-[#FDE68A] rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-[#D97706] mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-[#172033]">Flags for clinician review</h4>
            <ul className="mt-1 space-y-1">
              {flagsForReview.map((item, idx) => (
                <li key={idx} className="text-xs text-[#92400E] leading-relaxed">• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}