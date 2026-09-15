// FILE: src/components/analytics/TopCompaniesTable.tsx
import React from 'react';
import { Card } from '../ui/Card';
import { CompanyMetric } from '../../types';

export interface TopCompaniesTableProps {
  companies: CompanyMetric[];
}

export const TopCompaniesTable: React.FC<TopCompaniesTableProps> = ({ companies }) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Top Companies Contacted</h4>
          <p className="text-xs text-zinc-500">
            Companies where you have engaged the most hiring managers
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500 font-mono font-medium">
              <th className="pb-2.5">Company</th>
              <th className="pb-2.5 text-center">Contacts</th>
              <th className="pb-2.5 text-center">Emails Sent</th>
              <th className="pb-2.5 text-center">Replies</th>
              <th className="pb-2.5 text-right">Reply Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-500 font-mono">
                  No company records available yet.
                </td>
              </tr>
            ) : (
              companies.map((comp, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 font-medium text-white">{comp.company}</td>
                  <td className="py-2.5 text-center text-zinc-400 font-mono">{comp.contacts}</td>
                  <td className="py-2.5 text-center text-zinc-400 font-mono">{comp.sent}</td>
                  <td className="py-2.5 text-center font-mono font-medium text-emerald-400">
                    {comp.replied}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        comp.replyRate > 20
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : comp.replyRate > 0
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-white/5 text-zinc-500 border border-white/10'
                      }`}
                    >
                      {comp.replyRate}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
