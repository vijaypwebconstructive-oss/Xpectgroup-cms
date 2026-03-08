import React from 'react';
import ExpenseStatsCards from './ExpenseStatsCards';
import ExpenseByCategoryChart from './ExpenseByCategoryChart';
import ExpenseByClientSiteChart from './ExpenseByClientSiteChart';
import PayrollVsRevenueChart from './PayrollVsRevenueChart';
import MonthlyExpenseTrendChart from './MonthlyExpenseTrendChart';
import RecentExpenseActivity from './RecentExpenseActivity';
import ExpenseListTable from './ExpenseListTable';

const ExpenseDashboardPage: React.FC = () => (
  <div className="w-full space-y-6">
    {/* Page Header */}
    <div>
      <nav className="flex items-center gap-2 text-sm text-[#4c669a] mb-2">
        <span>Home</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span>Finance & Payroll</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span>Expense</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-[#0d121b] font-semibold">Expense Dashboard</span>
      </nav>
      <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-bold font-black">Expense Dashboard</h1>
    </div>

    {/* Top summary cards */}
    <ExpenseStatsCards />

    {/* Charts row 1: Expense by Category + Expense by Client Site */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ExpenseByCategoryChart />
      <ExpenseByClientSiteChart />
    </div>

    {/* Charts row 2: Payroll vs Revenue + Monthly Trend */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PayrollVsRevenueChart />
      <MonthlyExpenseTrendChart />
    </div>

    {/* Recent Activity + Expense List */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <RecentExpenseActivity />
      </div>
      <div className="xl:col-span-2">
        <div className="space-y-4">
          <h2 className="text-[#0d121b] text-lg font-bold">Expense List</h2>
          <ExpenseListTable />
        </div>
      </div>
    </div>
  </div>
);

export default ExpenseDashboardPage;
