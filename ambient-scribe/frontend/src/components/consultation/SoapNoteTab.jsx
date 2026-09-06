import React from 'react';
import Button from '../common/Button';
import { Copy, Check, FileText } from 'lucide-react';
import { useState } from 'react';

const SECTION_RE = /^(Subjective|Objective|Assessment|Plan)\s*:/im;

const parseSections = (soapText) => {
  const sections = { Subjective: '', Objective: '', Assessment: '', Plan: '' };
  const text = (soapText || '').replace(/^"|"$/g, '').trim();

  const matches = [...text.matchAll(/^(Subjective|Objective|Assessment|Plan)\s*:\\s*\n?/gim)];
  if (matches.length === 0) {
    return { sections: [{ title: 'Note', body: text }] };
  }

  for (let i = 0; i < matches.length; i += 1) {
    const title = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const body = text.slice(start, end).replace(/^\s*\n/, '').trim();
    sections[title] = body;
  }

  return { sections: Object.entries(sections).filter(([, body]) => body).map(([title, body]) => ({ title, body })) };
};

export default function SoapNoteTab({ soapNote }) {
  const [copied, setCopied] = useState(false);
  const note = soapNote || '';

  if (!note.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
        <FileText className="w-10 h-10 text-[#94A3B8] mb-3" />
        <p className="text-sm text-[#64748B] font-medium">No SOAP note available.</p>
        <p className="text-xs text-[#94A3B8] mt-1">Complete a consultation to generate the SOAP note.</p>
      </div>
    );
  }

  const { sections } = parseSections(note);

  const sectionColors = {
    Subjective: 'text-[#4F46E5]',
    Objective: 'text-[#3B82F6]',
    Assessment: 'text-[#D97706]',
    Plan: 'text-[#16A34A]',
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <Button variant="outline" icon={copied ? Check : Copy} onClick={handleCopy} className="py-1.5 px-3 text-xs">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <div className="p-6 space-y-6">
        {sections.length > 0 ? (
          sections.map((section) => (
            <section key={section.title}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${sectionColors[section.title] || 'text-[#4F46E5]'}`}>
                {section.title}
              </h4>
              {section.body ? (
                section.title === 'Plan' ? (
                  <ul className="space-y-1.5 list-disc list-inside">
                    {section.body.split(/(?:\r?\n|\s*-\s*)+/).filter(Boolean).map((item, idx) => (
                      <li key={idx} className="text-sm text-[#172033] leading-relaxed">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#172033] leading-relaxed bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E7EB] whitespace-pre-wrap">
                    {section.body}
                  </p>
                )
              ) : (
                <p className="text-xs text-[#94A3B8] italic">Not documented.</p>
              )}
            </section>
          ))
        ) : (
          <p className="text-sm text-[#172033] leading-relaxed whitespace-pre-wrap">{note}</p>
        )}
      </div>
    </div>
  );
}