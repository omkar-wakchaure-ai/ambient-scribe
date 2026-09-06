import React, { useState } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';

export default function DocumentViewer({ documents = [] }) {
  const [previewDoc, setPreviewDoc] = useState(null);

  const docs = documents.length > 0 ? documents : [
    { id: 1, name: 'Blood_Test_Results_2023.pdf', date: 'Oct 12', type: 'Lab Report' },
    { id: 2, name: 'Previous_Prescription.jpg', date: 'Sep 05', type: 'Prescription' }
  ];

  const handleDownload = (doc) => {
    const content = [
      `Ambient Scribe - Patient Document`,
      `----------------------------------`,
      `Name:    ${doc.name}`,
      `Type:    ${doc.type}`,
      `Recorded: ${doc.date}`,
      ``,
      `This is a local placeholder: the clinical document archive is not `,
      `connected to a backend in this demo, so no source file was attached.`,
    ].join('\n');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    link.download = `${doc.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-[#E5E7EB]/50 bg-gradient-to-b from-[#FAFAFA]/50 to-transparent">
        <h3 className="text-base font-extrabold text-[#172033] flex items-center tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center mr-3 border border-[#E0F2FE]">
            <FileText className="w-4 h-4 text-[#4F46E5]" />
          </div>
          Patient Documents
        </h3>
      </div>
      
      {/* List */}
      <div className="p-3">
        {docs.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-[#F5F9FF] rounded-2xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#E0F2FE] hover:shadow-sm">
            <div
              className="flex items-center space-x-4 min-w-0"
              onClick={() => setPreviewDoc(doc)}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm group-hover:bg-[#EEF2FF] group-hover:border-[#E0F2FE] transition-colors">
                <FileText className="w-5 h-5 text-[#64748B] group-hover:text-[#4F46E5] transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#172033] truncate max-w-[160px] tracking-tight">{doc.name}</p>
                <p className="text-[11px] font-medium text-[#64748B] mt-0.5">{doc.type} • {doc.date}</p>
              </div>
            </div>
            
            {/* Hover Actions */}
            <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
              <button
                onClick={() => setPreviewDoc(doc)}
                className="p-2 text-[#3B82F6] bg-white border border-[#E0F2FE] hover:bg-[#E0F2FE] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] rounded-xl transition-all"
                aria-label={`Preview ${doc.name}`}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 text-[#4F46E5] bg-white border border-[#E0F2FE] hover:bg-[#EEF2FF] hover:shadow-[0_0_15px_rgba(79,70,229,0.2)] rounded-xl transition-all"
                aria-label={`Download ${doc.name}`}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview panel */}
      {previewDoc && (
        <div className="p-4 mx-3 mb-3 bg-[#F5F9FF]/80 backdrop-blur rounded-2xl border border-[#E0F2FE]">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#172033] truncate">{previewDoc.name}</p>
              <p className="text-[11px] font-medium text-[#64748B]">{previewDoc.type} • {previewDoc.date}</p>
            </div>
            <button
              onClick={() => setPreviewDoc(null)}
              className="p-1.5 text-[#94A3B8] hover:text-[#64748B] hover:bg-white rounded-lg transition-colors"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs font-medium text-[#64748B] leading-relaxed bg-white/90 border border-[#E0F2FE] rounded-xl p-4">
            Preview unavailable — this demo does not include the original clinical
            document file. Use <span className="font-bold text-[#3B82F6]">Download</span> to save a
            placeholder record of this document.
          </p>
        </div>
      )}
    </div>
  );
}