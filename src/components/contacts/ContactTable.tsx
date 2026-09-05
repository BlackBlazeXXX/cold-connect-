// FILE: src/components/contacts/ContactTable.tsx
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import {
  Eye,
  Send,
  MessageSquare,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Ban,
} from 'lucide-react';
import { Contact, ContactStatus } from '../../types';
import { StatusBadge } from './StatusBadge';
import { ReplyCounter } from './ReplyCounter';
import { DoNotEmailToggle } from './DoNotEmailToggle';
import { Button } from '../ui/Button';
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns';

export interface ContactTableProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onSendEmail: (contact: Contact) => void;
  onMarkReplied: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onUpdateStatus: (contactId: string, status: ContactStatus) => void;
  onToggleDoNotEmail: (contactId: string, blocked: boolean) => void;
  selectedIds?: Set<string>;
  onToggleSelectId?: (id: string) => void;
  onToggleSelectAll?: () => void;
  showCheckboxes?: boolean;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onSelectContact,
  onSendEmail,
  onMarkReplied,
  onDeleteContact,
  onUpdateStatus,
  onToggleDoNotEmail,
  selectedIds,
  onToggleSelectId,
  onToggleSelectAll,
  showCheckboxes = true,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);

  const columns = useMemo<ColumnDef<Contact>[]>(() => {
    const cols: ColumnDef<Contact>[] = [];

    if (showCheckboxes && onToggleSelectId && onToggleSelectAll && selectedIds) {
      cols.push({
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            className="rounded border-white/20 bg-white/5 text-emerald-500 accent-emerald-500 cursor-pointer"
            checked={selectedIds.size === contacts.length && contacts.length > 0}
            onChange={onToggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-white/20 bg-white/5 text-emerald-500 accent-emerald-500 cursor-pointer"
            checked={selectedIds.has(row.original.id)}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelectId(row.original.id);
            }}
          />
        ),
        enableSorting: false,
        size: 40,
      });
    }

    cols.push(
      {
        accessorKey: 'hr_name',
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-mono text-zinc-400 hover:text-white cursor-pointer uppercase text-[11px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>HR Name</span>
            <ArrowUpDown className="w-3 h-3 text-zinc-600" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-white">
            <div className="flex items-center gap-1.5">
              <span>{row.original.hr_name}</span>
              {row.original.do_not_email && (
                <span title="Blocked / Do Not Email">
                  <Ban className="w-3 h-3 text-rose-400" />
                </span>
              )}
            </div>
            {row.original.job_role && (
              <div className="text-[11px] text-zinc-500 font-mono font-normal truncate max-w-[160px]">
                {row.original.job_role}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'company_name',
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-mono text-zinc-400 hover:text-white cursor-pointer uppercase text-[11px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Company</span>
            <ArrowUpDown className="w-3 h-3 text-zinc-600" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-zinc-200">{row.original.company_name}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-zinc-400">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            onChangeStatus={(newSt) => onUpdateStatus(row.original.id, newSt)}
          />
        ),
      },
      {
        accessorKey: 'reply_count',
        header: 'Replies',
        cell: ({ row }) => (
          <ReplyCounter
            count={row.original.reply_count}
            onMarkReplied={() => onMarkReplied(row.original.id)}
          />
        ),
      },
      {
        accessorKey: 'last_sent_at',
        header: 'Last Sent',
        cell: ({ row }) => {
          const date = row.original.last_sent_at;
          if (!date) return <span className="text-zinc-600 text-[11px] font-mono">Never</span>;
          return (
            <span className="text-[11px] text-zinc-500 font-mono">
              {formatDistanceToNow(new Date(date), { addSuffix: true })}
            </span>
          );
        },
      },
      {
        accessorKey: 'follow_up_due_at',
        header: 'Follow-Up Due',
        cell: ({ row }) => {
          const due = row.original.follow_up_due_at;
          if (!due || row.original.status === 'Replied' || row.original.do_not_email) {
            return <span className="text-zinc-600 text-[11px] font-mono">—</span>;
          }

          const dueDate = new Date(due);
          if (isToday(dueDate)) {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3" /> Today
              </span>
            );
          }
          if (isTomorrow(dueDate)) {
            return (
              <span className="text-[11px] text-zinc-300 font-mono">Tomorrow</span>
            );
          }
          if (isPast(dueDate)) {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                Overdue
              </span>
            );
          }
          return <span className="text-[11px] text-zinc-400 font-mono">{format(dueDate, 'MMM d')}</span>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onSelectContact(contact)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title="View Contact Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={contact.do_not_email}
                onClick={() => onSendEmail(contact)}
                className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Send Email"
              >
                <Send className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onMarkReplied(contact.id)}
                className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                title="Mark as Replied"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              <DoNotEmailToggle
                contact={contact}
                onToggle={(blocked) => onToggleDoNotEmail(contact.id, blocked)}
                variant="icon"
              />

              <button
                type="button"
                onClick={() => onDeleteContact(contact.id)}
                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Delete Contact"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      }
    );

    return cols;
  }, [
    contacts,
    selectedIds,
    showCheckboxes,
    onToggleSelectId,
    onToggleSelectAll,
    onSelectContact,
    onSendEmail,
    onMarkReplied,
    onDeleteContact,
    onUpdateStatus,
    onToggleDoNotEmail,
  ]);

  const table = useReactTable({
    data: contacts,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-3">
      <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0c0c0c] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#0a0a0a] border-b border-white/5 text-zinc-400 font-mono text-[11px]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-3 select-none">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectContact(row.original)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {contacts.length > 10 && (
        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono px-1">
          <div>
            Showing{' '}
            <strong className="text-white">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-white">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                contacts.length
              )}
            </strong>{' '}
            of <strong className="text-white">{contacts.length}</strong> recruiters
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="text-xs font-mono text-zinc-400">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
