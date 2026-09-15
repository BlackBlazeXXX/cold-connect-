// FILE: src/components/templates/TemplateList.tsx
import React from 'react';
import { Plus, Copy, Trash2, Check, Star } from 'lucide-react';
import { EmailTemplate } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';

export interface TemplateListProps {
  templates: EmailTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: EmailTemplate) => void;
  onCreateNew: () => void;
  onDuplicate: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
  onCreateNew,
  onDuplicate,
  onDelete,
  onSetDefault,
}) => {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Email Templates</h3>
          <p className="text-[11px] text-zinc-500 font-mono">{templates.length} templates available</p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={onCreateNew}
        >
          New
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
        {templates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => onSelect(tpl)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'border-emerald-500/50 bg-white/5 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-transparent hover:border-white/10 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white truncate max-w-[150px]">
                  {tpl.name}
                </span>
                <div className="flex items-center gap-1">
                  {tpl.is_default && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                      <Star className="w-2.5 h-2.5 fill-current" /> Default
                    </span>
                  )}
                  <Badge variant="neutral" size="sm">
                    {tpl.type}
                  </Badge>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 truncate mb-2">
                {tpl.subject || 'No subject set'}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-zinc-500 font-mono">
                <span>Updated {format(new Date(tpl.updated_at), 'MMM d')}</span>

                <div
                  className="flex items-center gap-1 opacity-80 hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!tpl.is_default && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(tpl.id)}
                      className="p-1 hover:text-amber-400 rounded transition-colors cursor-pointer"
                      title="Set as default template"
                    >
                      <Star className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDuplicate(tpl)}
                    className="p-1 hover:text-emerald-400 rounded transition-colors cursor-pointer"
                    title="Duplicate template"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(tpl.id)}
                    className="p-1 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Delete template"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
