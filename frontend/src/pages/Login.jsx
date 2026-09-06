import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowRight } from 'lucide-react';
import doctorImage from '../assets/doctor-portrait.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('doctor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    login(email, role, name);
    if (role === 'doctor') navigate('/doctor/dashboard');
    else navigate('/patient/dashboard');
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#E8F0FE] via-[#F8FAFC] to-[#E2E8F0] px-4 py-8 sm:px-8 lg:py-12">
      <div className="pointer-events-none absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-indigo-300/30 blur-[100px] animate-pulse" />

      <div className="relative grid w-full max-w-5xl grid-cols-1 items-center gap-8 animate-[pageFade_0.8s_ease-out_both] lg:grid-cols-2 lg:gap-12">
        <section className="relative z-10 animate-[float_7s_ease-in-out_infinite] rounded-[2rem] border border-white/60 bg-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#5B4EE4]">
              <Activity className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-[#172033]">Ambient Scribe</p>
              <p className="mt-0.5 text-[9px] font-bold tracking-[0.2em] text-[#94A3B8]">CLINICAL AI - V2.0</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight font-extrabold text-[#172033] sm:text-5xl">
              Focus on care.
              <br />
              <span className="italic tracking-tight text-[#5B4EE4]">Notes write themselves.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#64748B]">
              Transform natural patient conversations into structured, professional clinical documentation instantly. Multilingual AI designed for modern healthcare.
            </p>
          </div>

          <div className="mb-7 flex w-full rounded-full bg-[#F1F5F9] p-1">
            {[
              ['doctor', 'Clinician'],
              ['patient', 'Patient'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex-1 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${role === value ? 'bg-[#5B4EE4] text-white shadow-md' : 'text-[#94A3B8]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {role === 'patient' ? (
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold tracking-[0.16em] text-[#64748B]">FULL NAME</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-sm text-[#172033] outline-none transition-all duration-300 placeholder:text-[#CBD5E1] focus:border-[#5B4EE4] focus:ring-4 focus:ring-[#EEF2FF]"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold tracking-[0.16em] text-[#64748B]">WORK EMAIL</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-sm text-[#172033] outline-none transition-all duration-300 placeholder:text-[#CBD5E1] focus:border-[#5B4EE4] focus:ring-4 focus:ring-[#EEF2FF]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold tracking-[0.16em] text-[#64748B]">PASSWORD</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-sm text-[#172033] outline-none transition-all duration-300 placeholder:text-[#CBD5E1] focus:border-[#5B4EE4] focus:ring-4 focus:ring-[#EEF2FF]"
              />
            </label>
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#5B4EE4] px-5 py-4 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(91,78,228,0.4)]"
            >
              Enter workspace
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between border-t border-[#F1F5F9] pt-5 text-[10px] font-medium text-[#94A3B8]">
            <span>HIPAA-aligned</span>
            <span>Trusted by 240+ clinics</span>
          </div>
        </section>

        <section className="relative h-[600px] animate-[float_7s_ease-in-out_infinite] overflow-hidden rounded-[2rem]">
          <img src={doctorImage} alt="Doctor in a clinical workspace" className="h-full w-full rounded-[2rem] object-cover shadow-xl" />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border-t border-white/40 bg-white/20 p-5 shadow-lg backdrop-blur-md">
            <p className="text-sm italic leading-6 text-white drop-shadow-md">
              “I got my evenings back. Notes are done before the patient reaches the parking lot.”
            </p>
            <p className="mt-3 text-[10px] font-semibold tracking-[0.14em] text-white/80 drop-shadow-md">DR. MAYA PATEL · FAMILY MEDICINE</p>
          </div>
        </section>
      </div>
    </main>
  );
}