import React from 'react';
import { ComplianceAlert } from './types';

interface AlertsPanelProps {
  alerts: ComplianceAlert[];
}

const severityConfig = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-800',
    subColor: 'text-red-500',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    icon: 'error',
    label: 'Critical',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-900',
    subColor: 'text-amber-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    icon: 'warning',
    label: 'Warning',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-900',
    subColor: 'text-blue-500',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    icon: 'info',
    label: 'Info',
  },
};

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const sorted = [...alerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e7ebf3] flex items-start sm:items-center gap-2 justify-between sm:flex-row flex-col">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-red-600">notifications_active</span>
          <h3 className="text-sm font-bold text-[#0d121b]">Live Alerts</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
              {warningCount} warnings
            </span>
          )}
          <span className="text-xs text-[#00c950] bg-[#00c950]/10 text-[#00c950] px-2 py-0.5 rounded-full ml-2">{alerts.length} active</span>
        </div>
      </div>

      {/* Alert grid — horizontal wrap */}
      <div className="p-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px] text-green-600">check_circle</span>
            </div>
            <p className="text-sm font-semibold text-[#0d121b]">All Clear</p>
            <p className="text-xs text-[#6b7a99] mt-1">No compliance alerts at this time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {sorted.map(alert => {
              const cfg = severityConfig[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                      <span className={`material-symbols-outlined text-[18px] ${cfg.iconColor}`}>{cfg.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                          {cfg.label}
                        </span>
                        <span className={`text-xs font-semibold ${cfg.subColor}`}>{alert.module}</span>
                      </div>
                      <p className={`text-sm font-medium leading-snug ${cfg.textColor}`}>{alert.message}</p>
                      <p className={`text-xs mt-1.5 ${cfg.subColor}`}>
                        {alert.timestamp === new Date().toISOString().split('T')[0]
                          ? 'Today'
                          : new Date(alert.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
