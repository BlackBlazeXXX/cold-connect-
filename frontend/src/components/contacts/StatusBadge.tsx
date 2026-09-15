// FILE: src/components/contacts/StatusBadge.tsx
import React, { useState } from 'react';
import { STATUS_COLORS, CONTACT_STATUSES } from '../../constants/constants';
import { ContactStatus } from '../../types';
import { ChevronDown } from 'lucide-react';

export interface StatusBadgeProps {
  status: ContactStatus;
  onChangeStatus?: (newStatus: ContactStatus) => void;
  interactive?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onChangeStatus,
  interactive = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorHex = STATUS_COLORS[status] || '#64748B';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={!interactive || !onChangeStatus}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-all select-none ${
          interactive && onChangeStatus ? 'hover:opacity-85 cursor-pointer shadow-2xs' : 'cursor-default'
        }`}
        style={{
          backgroundColor: `${colorHex}15`,
          color: colorHex,
          borderColor: `${colorHex}35`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: colorHex }}
        />
        <span>{status}</span>
        {interactive && onChangeStatus && (
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
        )}
      </button>

      {isOpen && onChangeStatus && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div className="absolute left-0 mt-1 w-44 rounded-xl bg-[#0c0c0c] shadow-2xl border border-white/10 py-1 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-b border-white/5">
              Change Status
            </div>
            {CONTACT_STATUSES.map((item) => {
              const itemColor = STATUS_COLORS[item];
              return (
                <button
                  key={item}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeStatus(item as ContactStatus);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-white/5 transition-colors cursor-pointer ${
                    item === status ? 'font-medium bg-white/10 text-white' : 'text-zinc-300'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: itemColor }}
                  />
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
