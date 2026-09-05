import React from 'react';

export default function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex space-x-2 bg-[#F5F9FF] p-1.5 rounded-2xl border border-[#E5E7EB] w-max">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
            activeTab === tab.id
              ? 'bg-white text-[#4F46E5] shadow-sm border border-[#E5E7EB]'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-[#EEF2FF]'
          }`}
        >
          {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}