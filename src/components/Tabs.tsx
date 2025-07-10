import React, { useState } from 'react';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('Sheet 1');
  const tabs = ['Sheet 1', 'Sheet 2']; // Update if Figma shows more/less tabs
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-6 py-2 -mb-px rounded-t-lg font-semibold tracking-wide transition text-base border-b-2 focus:outline-none ${
            activeTab === tab
              ? 'bg-white border-blue-600 text-blue-600 border-b-2 shadow-sm'
              : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
          }`}
          style={{ minWidth: 120 }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;