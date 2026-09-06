import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  icon: Icon,
  className = '', 
  ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 ease-in-out px-5 py-2.5 text-sm";
  
  const variants = {
    primary: "bg-[#4F46E5] text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5",
    secondary: "bg-[#F5F9FF] text-[#3B82F6] hover:bg-[#E0F2FE] border border-[#E0F2FE]",
    outline: "bg-white text-[#172033] border border-[#E5E7EB] hover:border-[#4F46E5] hover:bg-[#F7F5FF] hover:text-[#4F46E5]",
    ghost: "bg-transparent text-[#64748B] hover:bg-[#F5F9FF] hover:text-[#4F46E5]"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
}