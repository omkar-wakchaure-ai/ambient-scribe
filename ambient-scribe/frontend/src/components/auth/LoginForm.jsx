import React from 'react';
import Button from '../common/Button';
import { Activity } from 'lucide-react';

export default function LoginForm() {
  return (
    <div className="min-h-screen bg-[#F5F9FF] flex flex-col justify-center items-center p-4">
      <div className="bg-white p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E7EB] w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-[#EEF2FF] rounded-2xl flex items-center justify-center border border-[#E0F2FE]">
            <Activity className="w-7 h-7 text-[#4F46E5]" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-[#172033] text-center mb-2">Ambient Scribe</h2>
        <p className="text-[#64748B] text-center mb-8 text-sm">Clinical intelligence at your fingertips.</p>
        
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Email / Doctor ID</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#EEF2FF] focus:border-[#4F46E5] outline-none transition-all text-[#172033]"
              placeholder="dr.smith@hospital.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#EEF2FF] focus:border-[#4F46E5] outline-none transition-all text-[#172033]"
              placeholder="••••••••"
            />
          </div>
          <Button className="w-full mt-4" variant="primary">Access Workspace</Button>
        </form>
      </div>
    </div>
  );
}