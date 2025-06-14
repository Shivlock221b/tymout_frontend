import React from 'react';

const EventTabs = ({ activeTab, setActiveTab, tabs = [] }) => (
  <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
    {tabs.map(tab => (
      <button
        key={tab.key}
        className={`flex-1 py-2 text-sm font-medium focus:outline-none transition-colors ${activeTab === tab.key ? 'text-theme-accent border-b-2 border-theme-accent bg-gray-50' : 'text-gray-500'}`}
        onClick={() => setActiveTab(tab.key)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default EventTabs;
