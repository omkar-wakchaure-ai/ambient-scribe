import React from 'react';
import { UploadCloud, File } from 'lucide-react';

export default function DocumentUploader() {
  return (
    <div className="relative group bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 text-center flex flex-col items-center justify-center h-full hover:bg-white/90 transition-all duration-500 cursor-pointer overflow-hidden border-2 border-dashed border-[#4F46E5]/30 hover:border-[#4F46E5]/60 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_50px_rgba(79,70,229,0.1)]">
      
      {/* Background glowing pulse on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4F46E5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-[#E0F2FE] group-hover:-translate-y-2 group-hover:shadow-[0_15px_35px_rgba(79,70,229,0.15)] transition-all duration-500">
        <UploadCloud className="w-10 h-10 text-[#4F46E5]" />
      </div>
      
      <h3 className="text-lg font-extrabold text-[#172033] relative z-10 tracking-tight">Upload Lab Reports</h3>
      <p className="text-sm font-medium text-[#64748B] mt-2 mb-8 relative z-10">Drag and drop PDFs or images here to assist the doctor.</p>
      
      <div className="relative z-10 inline-flex items-center text-sm font-bold text-[#4F46E5] bg-white px-6 py-3 rounded-xl border border-[#E0F2FE] shadow-sm group-hover:bg-[#4F46E5] group-hover:text-white transition-colors duration-300">
        <File className="w-4 h-4 mr-2" /> Browse Files
      </div>
    </div>
  );
}