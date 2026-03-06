import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import PPEInvoiceList from './PPEInvoiceList';
import PPEAddRecord from './PPEAddRecord';
import { navigateToUrl } from '../utils/routing';

type PPESubView = 'list' | 'add';

interface PPEModuleProps {
  onNavigate: (view: AppView) => void;
}

const SUB_NAV = [
  { key: 'list' as PPESubView, label: 'PPE Invoice List', icon: 'description', url: '/ppe' },
  { key: 'add' as PPESubView, label: 'Add PPE Record', icon: 'add_circle', url: '/ppe/add' },
];

const PPEModule: React.FC<PPEModuleProps> = ({ onNavigate: _onNavigate }) => {
  const syncFromPathname = (pathname: string): PPESubView => {
    if (pathname.endsWith('/add')) return 'add';
    return 'list';
  };

  const [subView, setSubView] = useState<PPESubView>(() => syncFromPathname(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setSubView(syncFromPathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (view: PPESubView) => {
    setSubView(view);
    const url = view === 'add' ? '/ppe/add' : '/ppe';
    navigateToUrl(url);
  };

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)] w-screen sm:w-full sm:max-w-full">
      <div className="w-full space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">PPE Invoices</h1>
            <p className="text-[#4c669a] text-base">
              Manage PPE invoices issued to clients.
            </p>
          </div>
          {subView !== 'add' && (
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

        {subView === 'list' && (
          <PPEInvoiceList onAddRecord={() => navigate('add')} />
        )}
        {subView === 'add' && (
          <PPEAddRecord onBack={() => navigate('list')} />
        )}
      </div>
    </div>
  );
};

export default PPEModule;
