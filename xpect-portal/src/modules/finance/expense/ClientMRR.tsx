import React, { useMemo } from "react";
import { Sale, ClientType } from "./types";

interface Props {
  sales: Sale[];
}

const ClientMRR: React.FC<Props> = ({ sales }) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(val);
  };
  const clientMonthlyRecurringList = useMemo(() => {
    const normalize = (name: string) =>
      (name || "").trim().replace(/\s+/g, " ");

    const recurringStreams: Record<
      string,
      Record<string, { startDate: string; monthlyAmount: number }>
    > = {};
    const clientDisplayName: Record<string, string> = {};

    sales.forEach((sale) => {
      if (sale.type !== ClientType.RECURRING) return;

      const key = normalize(sale.clientName);
      if (!key) return;

      clientDisplayName[key] = sale.clientName;

      if (!recurringStreams[key]) recurringStreams[key] = {};

      const stream = recurringStreams[key][sale.service];
      const amount = Number(sale.amount) || 0;

      if (!stream || sale.date < stream.startDate) {
        recurringStreams[key][sale.service] = {
          startDate: sale.date,
          monthlyAmount: amount,
        };
      }
    });

    const list: { name: string; monthlyRecurring: number }[] = [];

    Object.entries(recurringStreams).forEach(([key, streams]) => {
      const monthlyRecurring = Object.values(streams).reduce(
        (sum, s) => sum + s.monthlyAmount,
        0,
      );

      if (monthlyRecurring > 0) {
        list.push({
          name: clientDisplayName[key] || key,
          monthlyRecurring,
        });
      }
    });

    list.sort((a, b) => b.monthlyRecurring - a.monthlyRecurring);

    return list;
  }, [sales]);

  const currentMRR = useMemo(
    () =>
      clientMonthlyRecurringList.reduce(
        (sum, row) => sum + row.monthlyRecurring,
        0,
      ),
    [clientMonthlyRecurringList],
  );

  const mrrAnnualCurrent = currentMRR * 12;

  return (
    <div className="mt-10 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
      <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
        Client Monthly Recurring (MRR)
      </h4>

      <p className="text-slate-500 text-sm mb-4">
        Sum of monthly recurring per client (earliest sale per service). Total ×
        12 = MRR Annual Goal current.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                Client
              </th>
              <th className="py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase text-right">
                Monthly Recurring (£)
              </th>
            </tr>
          </thead>

          <tbody>
            {clientMonthlyRecurringList.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-4 px-3 text-slate-400 text-sm">
                  No recurring clients
                </td>
              </tr>
            ) : (
              clientMonthlyRecurringList.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2.5 px-3 text-slate-900 font-medium">
                    {row.name}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {formatINR(row.monthlyRecurring)}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {clientMonthlyRecurringList.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <td className="py-3 px-3">Total MRR</td>
                <td className="py-3 px-3 text-right">
                  {formatINR(currentMRR)}
                </td>
              </tr>
              <tr className="bg-slate-50 font-semibold">
                <td className="py-2 px-3 text-sm">MRR × 12 (Annual)</td>
                <td className="py-2 px-3 text-right">
                  {formatINR(mrrAnnualCurrent)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ClientMRR;
