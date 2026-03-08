import React, { useState, useEffect } from 'react';
import {
  FinanceNavState,
  financeNavigate,
  getFinanceState,
  subscribeFinance,
  syncFinanceFromPathname,
  FinanceView,
} from './financeNavStore';
import PayrollPage from './payroll/PayrollPage';
import PayslipViewPage from './payroll/payslip-view/PayslipViewPage';
import CreatePayslipPage from './payroll/payslip-create/CreatePayslipPage';
import PayslipEditPage from './payroll/payslip-edit/PayslipEditPage';
import PayslipTemplatePage from './payroll/payslip-template/PayslipTemplatePage';
import InvoiceListPage from './invoice/InvoiceListPage';
import InvoiceViewPage from './invoice/invoice-view/InvoiceViewPage';
import InvoiceCreatePage from './invoice/invoice-create/InvoiceCreatePage';
import InvoiceEditPage from './invoice/invoice-edit/InvoiceEditPage';
import InvoiceTemplatePage from './invoice/invoice-template/InvoiceTemplatePage';
import QuotationListPage from './quotation/QuotationListPage';
import QuotationViewPage from './quotation/quotation-view/QuotationViewPage';
import QuotationCreatePage from './quotation/quotation-create/QuotationCreatePage';
import QuotationEditPage from './quotation/quotation-edit/QuotationEditPage';
import QuotationTemplatePage from './quotation/quotation-template/QuotationTemplatePage';
import ExpenseDashboardPage from './expense/ExpenseDashboardPage';
import ProspectListPage from '../prospect/ProspectListPage';
import ProspectCreate from '../prospect/ProspectCreate';
import ProspectDetailPage from '../prospect/ProspectDetailPage';

const FinanceModule: React.FC = () => {
  const [navState, setNavState] = useState<FinanceNavState>(() => {
    syncFinanceFromPathname(window.location.pathname);
    return getFinanceState();
  });
  const [isPayrollOpen, setIsPayrollOpen] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isProspectOpen, setIsProspectOpen] = useState(() =>
    ['prospect-list', 'prospect-create', 'prospect-detail'].includes(getFinanceState().view)
  );

  useEffect(() => {
    const pathname = window.location.pathname;
    if (!pathname.startsWith('/finance-management') && !pathname.startsWith('/prospects')) {
      financeNavigate('payroll-list', undefined, true);
    }
    const unsub = subscribeFinance(setNavState);
    const handlePopState = () => syncFinanceFromPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (isProspectView(navState.view)) setIsProspectOpen(true);
  }, [navState.view]);

  const isPayrollView = (v: FinanceView) =>
    v === 'payroll-list' || v === 'payslip' || v === 'payslip-create' || v === 'payslip-edit' || v === 'payslip-template' || v === 'payslip-view';

  const isInvoiceView = (v: FinanceView) =>
    v === 'invoice-list' || v === 'invoice-view' || v === 'invoice-create' || v === 'invoice-edit' || v === 'invoice-template';

  const isQuotationView = (v: FinanceView) =>
    v === 'quotation-list' || v === 'quotation-view' || v === 'quotation-create' || v === 'quotation-edit' || v === 'quotation-template';

  const isProspectView = (v: FinanceView) =>
    v === 'prospect-list' || v === 'prospect-create' || v === 'prospect-detail';

  const PAYROLL_ITEMS: { view: FinanceView; label: string; icon: string }[] = [
    { view: 'payroll-list', label: 'Payroll List', icon: 'format_list_bulleted' },
    { view: 'payslip', label: 'Payslip', icon: 'receipt_long' },
    { view: 'payslip-create', label: 'Payslip Create', icon: 'add_circle' },
    { view: 'payslip-template', label: 'Payslip Template', icon: 'edit' },
  ];

  const INVOICE_ITEMS: { view: FinanceView; label: string; icon: string; needsId?: boolean }[] = [
    { view: 'invoice-list', label: 'Invoice List', icon: 'format_list_bulleted' },
    { view: 'invoice-view', label: 'Invoice', icon: 'description', needsId: true },
    { view: 'invoice-create', label: 'Invoice Create', icon: 'add_circle' },
    { view: 'invoice-template', label: 'Invoice Template', icon: 'edit' },
  ];

  const QUOTATION_ITEMS: { view: FinanceView; label: string; icon: string; needsId?: boolean }[] = [
    { view: 'quotation-list', label: 'Quotation List', icon: 'format_list_bulleted' },
    { view: 'quotation-view', label: 'Quotation', icon: 'request_quote', needsId: true },
    { view: 'quotation-create', label: 'Quotation Create', icon: 'add_circle' },
    { view: 'quotation-template', label: 'Quotation Template', icon: 'edit' },
  ];

  const PROSPECT_ITEMS: { view: FinanceView; label: string; icon: string }[] = [
    { view: 'prospect-list', label: 'Prospect List', icon: 'format_list_bulleted' },
  ];

  const SIDEBAR_ITEMS: { view: FinanceView; label: string; icon: string }[] = [
    { view: 'expense', label: 'Expense', icon: 'receipt' },
  ];

  const renderContent = () => {
    switch (navState.view) {
      case 'payroll-list':
        return <PayrollPage />;
      case 'payslip-view':
        return navState.id ? <PayslipViewPage payslipId={navState.id} /> : <PayrollPage />;
      case 'payslip-create':
        return <CreatePayslipPage />;
      case 'payslip-template':
        return <PayslipTemplatePage />;
      case 'payslip-edit':
        return navState.id ? <PayslipEditPage payslipId={navState.id} /> : <PayrollPage />;
      case 'payslip':
        return (
          <div className="flex-1 flex items-center justify-center text-[#4c669a]">
            <p className="text-base">payslip – Coming soon</p>
          </div>
        );
      case 'invoice-list':
        return <InvoiceListPage />;
      case 'invoice-view':
        return navState.id ? <InvoiceViewPage invoiceId={navState.id} /> : <InvoiceListPage />;
      case 'invoice-create':
        return <InvoiceCreatePage />;
      case 'invoice-template':
        return <InvoiceTemplatePage />;
      case 'invoice-edit':
        return navState.id ? <InvoiceEditPage invoiceId={navState.id} /> : <InvoiceListPage />;
      case 'quotation-list':
        return <QuotationListPage />;
      case 'quotation-view':
        return navState.id ? <QuotationViewPage quotationId={navState.id} /> : <QuotationListPage />;
      case 'quotation-create':
        return <QuotationCreatePage />;
      case 'quotation-edit':
        return navState.id ? <QuotationEditPage quotationId={navState.id} /> : <QuotationListPage />;
      case 'quotation-template':
        return <QuotationTemplatePage />;
      case 'prospect-list':
        return (
          <ProspectListPage
            onView={id => financeNavigate('prospect-detail', id)}
            onEdit={id => financeNavigate('prospect-detail', id)}
            onAdd={() => financeNavigate('prospect-create')}
          />
        );
      case 'prospect-create':
        return (
          <ProspectCreate
            onBack={() => financeNavigate('prospect-list')}
            onCreated={id => financeNavigate('prospect-detail', id)}
          />
        );
      case 'prospect-detail':
        return (
          <ProspectDetailPage
            prospectId={navState.id ?? ''}
            onBack={() => financeNavigate('prospect-list')}
          />
        );
      case 'expense':
        return <ExpenseDashboardPage />;
      default:
        return <PayrollPage />;
    }
  };

  return (
    <div className="flex flex-1 w-full min-h-[calc(100vh-160px)]">
      {/* Secondary sidebar */}
      <aside className="w-48 shrink-0 bg-white border-r border-[#e7ebf3] py-6 px-3">
        <nav className="space-y-1">
          {/* Payroll - collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setIsPayrollOpen(o => !o)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isPayrollView(navState.view)
                  ? 'bg-[#2e4150] text-white'
                  : 'text-[#4c669a] hover:bg-[#f2f6f9]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span className="flex-1 text-left">Payroll</span>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                  isPayrollOpen ? 'rotate-90' : ''
                }`}
              >
                chevron_right
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isPayrollOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="mt-1 ml-2 pl-3 border-l border-[#e7ebf3] space-y-0.5">
                {PAYROLL_ITEMS.map(({ view, label, icon }) => {
                  const isActive = navState.view === view || (view === 'payslip' && navState.view === 'payslip-view');
                  const onClick = view === 'payslip'
                    ? () => financeNavigate('payslip-view', 'sample')
                    : () => financeNavigate(view);
                  return (
                    <button
                      key={view}
                      onClick={onClick}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#2e4150]/10 text-[#2e4150]'
                          : 'text-[#4c669a] hover:bg-[#f2f6f9]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Invoice - collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setIsInvoiceOpen(o => !o)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isInvoiceView(navState.view)
                  ? 'bg-[#2e4150] text-white'
                  : 'text-[#4c669a] hover:bg-[#f2f6f9]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span className="flex-1 text-left">Invoice</span>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                  isInvoiceOpen ? 'rotate-90' : ''
                }`}
              >
                chevron_right
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isInvoiceOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="mt-1 ml-2 pl-3 border-l border-[#e7ebf3] space-y-0.5">
                {INVOICE_ITEMS.map(({ view, label, icon, needsId }) => {
                  const isActive = navState.view === view;
                  const onClick = needsId
                    ? () => financeNavigate(view, 'sample')
                    : () => financeNavigate(view);
                  return (
                    <button
                      key={view}
                      onClick={onClick}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#2e4150]/10 text-[#2e4150]'
                          : 'text-[#4c669a] hover:bg-[#f2f6f9]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quotation - collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setIsQuotationOpen(o => !o)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isQuotationView(navState.view)
                  ? 'bg-[#2e4150] text-white'
                  : 'text-[#4c669a] hover:bg-[#f2f6f9]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">request_quote</span>
              <span className="flex-1 text-left">Quotation</span>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                  isQuotationOpen ? 'rotate-90' : ''
                }`}
              >
                chevron_right
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isQuotationOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="mt-1 ml-2 pl-3 border-l border-[#e7ebf3] space-y-0.5">
                {QUOTATION_ITEMS.map(({ view, label, icon, needsId }) => {
                  const isActive = navState.view === view;
                  const onClick = needsId
                    ? () => financeNavigate(view, 'sample')
                    : () => financeNavigate(view);
                  return (
                    <button
                      key={view}
                      onClick={onClick}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#2e4150]/10 text-[#2e4150]'
                          : 'text-[#4c669a] hover:bg-[#f2f6f9]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Prospect - collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setIsProspectOpen(o => !o)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isProspectView(navState.view)
                  ? 'bg-[#2e4150] text-white'
                  : 'text-[#4c669a] hover:bg-[#f2f6f9]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person_search</span>
              <span className="flex-1 text-left">Prospect</span>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                  isProspectOpen ? 'rotate-90' : ''
                }`}
              >
                chevron_right
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isProspectOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="mt-1 ml-2 pl-3 border-l border-[#e7ebf3] space-y-0.5">
                {PROSPECT_ITEMS.map(({ view, label, icon }) => (
                  <button
                    key={view}
                    onClick={() => financeNavigate(view)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                      navState.view === view
                        ? 'bg-[#2e4150]/10 text-[#2e4150]'
                        : 'text-[#4c669a] hover:bg-[#f2f6f9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expense - top-level button */}
          {SIDEBAR_ITEMS.map(({ view, label, icon }) => (
            <button
              key={view}
              onClick={() => financeNavigate(view)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                navState.view === view
                  ? 'bg-[#2e4150] text-white'
                  : 'text-[#4c669a] hover:bg-[#f2f6f9]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 py-[15px] sm:py-8 px-4 sm:px-6 md:px-10">
        {renderContent()}
      </div>
    </div>
  );
};

export default FinanceModule;
