// FILE: src/components/analytics/TemplatePerformance.tsx
import React from 'react';
import { Card } from '../ui/Card';
import { Star } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { TemplateMetric } from '../../types';

export interface TemplatePerformanceProps {
  metrics: TemplateMetric[];
}

export const TemplatePerformance: React.FC<TemplatePerformanceProps> = ({ metrics }) => {
  const renderStars = (rate: number) => {
    const starCount = rate >= 30 ? 5 : rate >= 20 ? 4 : rate >= 10 ? 3 : rate > 0 ? 2 : 1;
    return (
      <div className="flex items-center gap-0.5 text-amber-400" title={`${starCount} / 5 Rating`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < starCount ? 'fill-current' : 'text-zinc-700'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Template Performance</h4>
          <p className="text-xs text-zinc-500">
            Response rates tracked by individual email template copy
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500 font-mono font-medium">
              <th className="pb-2.5">Template</th>
              <th className="pb-2.5">Type</th>
              <th className="pb-2.5 text-center">Sent</th>
              <th className="pb-2.5 text-center">Replies</th>
              <th className="pb-2.5 text-center">Reply Rate</th>
              <th className="pb-2.5 text-right">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {metrics.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-zinc-500 font-mono">
                  No template metrics recorded yet.
                </td>
              </tr>
            ) : (
              metrics.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 font-medium text-white">{t.name}</td>
                  <td className="py-2.5">
                    <Badge variant="neutral" size="sm">
                      {t.type}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-center text-zinc-400 font-mono">{t.sent}</td>
                  <td className="py-2.5 text-center font-mono font-medium text-emerald-400">{t.replied}</td>
                  <td className="py-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        t.replyRate >= 20
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : t.replyRate > 0
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-white/5 text-zinc-500 border border-white/10'
                      }`}
                    >
                      {t.replyRate}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right flex justify-end">
                    {renderStars(t.replyRate)}
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
