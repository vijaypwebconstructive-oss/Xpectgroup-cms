import React, { useState } from 'react';
import { AppView, PPEIssueRecord } from '../types';
import PPEList from './PPEList';
import PPEIssue from './PPEIssue';
import PPEDetail from './PPEDetail';
import PPEInventory from './PPEInventory';

type PPESubView = 'list' | 'issue' | 'detail' | 'inventory';

interface PPEModuleProps {
  onNavigate: (view: AppView) => void;
}

const SUB_NAV = [
  { key: 'list'      as PPESubView, label: 'PPE Records',  icon: 'safety_check',  url: '/ppe' },
  { key: 'issue'     as PPESubView, label: 'Issue PPE',    icon: 'add_circle',    url: '/ppe/issue' },
  { key: 'inventory' as PPESubView, label: 'Inventory',    icon: 'inventory_2',   url: '/ppe/inventory' },
];

const PPEModule: React.FC<PPEModuleProps> = ({ onNavigate: _onNavigate }) => {
  const [subView, setSubView]               = useState<PPESubView>('list');
  const [selectedRecord, setSelectedRecord] = useState<PPEIssueRecord | null>(null);

  const navigate = (view: PPESubView, record?: PPEIssueRecord) => {
    setSubView(view);
    if (record) setSelectedRecord(record);
    const found = SUB_NAV.find(n => n.key === view);
    const url   = view === 'detail' ? `/ppe/${record?.id || ''}` : (found?.url ?? '/ppe');
    window.history.pushState({}, '', url);
  };

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)]">
      <div className="w-full space-y-6">

        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-black">PPE Records</h1>
            <p className="text-[#4c669a] text-base">
              Track personal protective equipment issuance, replacements, and worker acknowledgements.
            </p>
          </div>
          {/* Sub-nav tabs — hidden on detail/issue views */}
          {subView !== 'detail' && (
            <div className="flex items-center gap-1 bg-white border border-[#e7ebf3] rounded-full p-1">
              {SUB_NAV.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => navigate(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                    subView === tab.key
                      ? 'bg-[#2e4150] text-white shadow-sm'
                      : 'text-[#4c669a] hover:bg-[#f2f6f9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sub-view content */}
        {subView === 'list' && (
          <PPEList
            onOpenDetail={(record) => navigate('detail', record)}
            onOpenIssue={() => navigate('issue')}
            onOpenInventory={() => navigate('inventory')}
          />
        )}
        {subView === 'issue' && (
          <PPEIssue onBack={() => navigate('list')} />
        )}
        {subView === 'detail' && selectedRecord && (
          <PPEDetail record={selectedRecord} onBack={() => navigate('list')} />
        )}
        {subView === 'inventory' && (
          <PPEInventory onBack={() => navigate('list')} />
        )}

      </div>
    </div>
  );
};

export default PPEModule;
