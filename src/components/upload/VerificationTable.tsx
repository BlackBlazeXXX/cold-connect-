// FILE: src/components/upload/VerificationTable.tsx
import React, { useState } from 'react';
import { Trash2, CheckCircle2, AlertTriangle, XCircle, Copy, Check, Edit2 } from 'lucide-react';
import { ExtractedContact } from '../../types';
import { EMAIL_REGEX } from '../../lib/csvParser';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DuplicateWarning } from './DuplicateWarning';

export interface VerificationTableProps {
  contacts: ExtractedContact[];
  onChange: (updatedContacts: ExtractedContact[]) => void;
  onImport: (validToImport: ExtractedContact[]) => void;
  onCancel: () => void;
  isImporting?: boolean;
}

export const VerificationTable: React.FC<VerificationTableProps> = ({
  contacts,
  onChange,
  onImport,
  onCancel,
  isImporting = false,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(contacts.map((_, i) => i))
  );
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [duplicateDecisions, setDuplicateDecisions] = useState<
    Record<number, 'skip' | 'update' | 'keep'>
  >({});

  const toggleSelectAll = () => {
    if (selectedIndices.size === contacts.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(contacts.map((_, i) => i)));
    }
  };

  const toggleSelectRow = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  const deleteSelected = () => {
    const remaining = contacts.filter((_, i) => !selectedIndices.has(i));
    onChange(remaining);
    setSelectedIndices(new Set());
  };

  const deleteRow = (index: number) => {
    const remaining = contacts.filter((_, i) => i !== index);
    onChange(remaining);
    const nextSelected = new Set(selectedIndices);
    nextSelected.delete(index);
    setSelectedIndices(nextSelected);
  };

  const updateCell = (rowIndex: number, field: keyof ExtractedContact, value: string) => {
    const updated = [...contacts];
    const item = { ...updated[rowIndex], [field]: value };

    // Re-validate row
    const errors: string[] = [];
    if (!item.email || !EMAIL_REGEX.test(item.email)) {
      errors.push('Invalid email format');
    }
    if (!item.hr_name || item.hr_name.trim().length < 2) {
      errors.push('HR Name must be at least 2 chars');
    }
    if (!item.company_name || item.company_name.trim().length < 1) {
      errors.push('Missing company name');
    }

    item.errors = errors;
    item.is_valid = errors.length === 0;
    updated[rowIndex] = item;
    onChange(updated);
  };

  const markSelectedValid = () => {
    const updated = contacts.map((c, i) => {
      if (selectedIndices.has(i)) {
        return {
          ...c,
          is_valid: true,
          errors: [],
        };
      }
      return c;
    });
    onChange(updated);
  };

  // Compute stats
  const totalRows = contacts.length;
  const validRows = contacts.filter((c) => c.is_valid && !c.is_duplicate).length;
  const warningRows = contacts.filter((c) => c.is_valid && (!c.job_role || c.is_duplicate)).length;
  const invalidRows = contacts.filter((c) => !c.is_valid).length;
  const duplicateRows = contacts.filter((c) => c.is_duplicate).length;

  const handleStartImport = () => {
    const toImport = contacts.filter((c, index) => {
      if (!selectedIndices.has(index)) return false;
      if (!c.is_valid) return false;
      if (c.is_duplicate) {
        const decision = duplicateDecisions[index] || 'skip';
        if (decision === 'skip') return false;
      }
      return true;
    });

    onImport(toImport);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0c0c0c] rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={toggleSelectAll}>
            {selectedIndices.size === contacts.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={deleteSelected}
            disabled={selectedIndices.size === 0}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
          >
            Delete Selected ({selectedIndices.size})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={markSelectedValid}
            disabled={selectedIndices.size === 0}
            leftIcon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Mark Valid
          </Button>
        </div>

        <div className="text-xs text-zinc-500 font-mono">
          <span className="font-semibold text-white">{selectedIndices.size}</span> of{' '}
          {contacts.length} rows selected
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0c0c0c] shadow-xs">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/5 text-zinc-500 font-mono font-medium uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-white/10 accent-emerald-500 cursor-pointer"
                    checked={selectedIndices.size === contacts.length && contacts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-2.5 px-3">HR Name</th>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Job Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map((contact, index) => {
                const isSelected = selectedIndices.has(index);
                const isDuplicate = contact.is_duplicate;
                const isValid = contact.is_valid;
                const isEditing = editingCell?.row === index;

                // Left border indicator based on row state
                const borderStateClass = !isValid
                  ? 'border-l-4 border-l-rose-500'
                  : isDuplicate
                  ? 'border-l-4 border-l-amber-500'
                  : !contact.job_role
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-emerald-500';

                return (
                  <React.Fragment key={index}>
                    <tr
                      className={`hover:bg-white/[0.02] transition-colors ${borderStateClass} ${
                        isSelected ? 'bg-emerald-500/[0.04]' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-white/10 accent-emerald-500 cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(index)}
                        />
                      </td>

                      {/* HR Name */}
                      <td className="py-2 px-3 font-medium text-white">
                        {isEditing && editingCell?.col === 'hr_name' ? (
                          <input
                            type="text"
                            autoFocus
                            defaultValue={contact.hr_name}
                            onBlur={(e) => {
                              updateCell(index, 'hr_name', e.target.value);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCell(index, 'hr_name', e.currentTarget.value);
                                setEditingCell(null);
                              }
                            }}
                            className="w-full bg-[#0a0a0a] border border-emerald-500/50 text-white rounded px-1.5 py-0.5 text-xs outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell({ row: index, col: 'hr_name' })}
                            className="cursor-pointer hover:text-emerald-400 flex items-center gap-1 group"
                          >
                            <span>{contact.hr_name || '—'}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-500" />
                          </div>
                        )}
                      </td>

                      {/* Company */}
                      <td className="py-2 px-3 text-zinc-300">
                        {isEditing && editingCell?.col === 'company_name' ? (
                          <input
                            type="text"
                            autoFocus
                            defaultValue={contact.company_name}
                            onBlur={(e) => {
                              updateCell(index, 'company_name', e.target.value);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCell(index, 'company_name', e.currentTarget.value);
                                setEditingCell(null);
                              }
                            }}
                            className="w-full bg-[#0a0a0a] border border-emerald-500/50 text-white rounded px-1.5 py-0.5 text-xs outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell({ row: index, col: 'company_name' })}
                            className="cursor-pointer hover:text-emerald-400 flex items-center gap-1 group"
                          >
                            <span>{contact.company_name || '—'}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-500" />
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="py-2 px-3 font-mono text-[11px] text-zinc-400">
                        {isEditing && editingCell?.col === 'email' ? (
                          <input
                            type="email"
                            autoFocus
                            defaultValue={contact.email}
                            onBlur={(e) => {
                              updateCell(index, 'email', e.target.value);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCell(index, 'email', e.currentTarget.value);
                                setEditingCell(null);
                              }
                            }}
                            className="w-full bg-[#0a0a0a] border border-emerald-500/50 text-white rounded px-1.5 py-0.5 text-xs outline-none font-mono"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell({ row: index, col: 'email' })}
                            className="cursor-pointer hover:text-emerald-400 flex items-center gap-1 group"
                          >
                            <span>{contact.email || '—'}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-500" />
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-2 px-3 text-zinc-400">
                        {isEditing && editingCell?.col === 'job_role' ? (
                          <input
                            type="text"
                            autoFocus
                            defaultValue={contact.job_role}
                            onBlur={(e) => {
                              updateCell(index, 'job_role', e.target.value);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCell(index, 'job_role', e.currentTarget.value);
                                setEditingCell(null);
                              }
                            }}
                            className="w-full bg-[#0a0a0a] border border-emerald-500/50 text-white rounded px-1.5 py-0.5 text-xs outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell({ row: index, col: 'job_role' })}
                            className="cursor-pointer hover:text-emerald-400 flex items-center gap-1 group"
                          >
                            <span>{contact.job_role || <span className="text-zinc-600">Optional role</span>}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-500" />
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3">
                        {!isValid ? (
                          <Badge variant="danger" size="sm">
                            <XCircle className="w-3 h-3" />
                            <span>Invalid</span>
                          </Badge>
                        ) : isDuplicate ? (
                          <Badge variant="warning" size="sm">
                            <Copy className="w-3 h-3" />
                            <span>Duplicate</span>
                          </Badge>
                        ) : !contact.job_role ? (
                          <Badge variant="neutral" size="sm">
                            <AlertTriangle className="w-3 h-3" />
                            <span>No Role</span>
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Valid</span>
                          </Badge>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteRow(index)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Remove row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>

                    {/* Duplicate warning bar if duplicate */}
                    {isDuplicate && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <DuplicateWarning
                            email={contact.email}
                            currentAction={duplicateDecisions[index] || 'skip'}
                            onAction={(act) =>
                              setDuplicateDecisions((prev) => ({ ...prev, [index]: act }))
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary Bar & Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0c0c0c] rounded-xl border border-white/5">
        <div className="text-xs text-zinc-500 font-mono">
          Summary: <strong className="text-emerald-400">{validRows} valid</strong>,{' '}
          <strong className="text-amber-400">{warningRows} with warnings</strong>,{' '}
          <strong className="text-rose-400">{invalidRows} invalid</strong>,{' '}
          <strong className="text-amber-400">{duplicateRows} duplicates</strong>.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="secondary" onClick={onCancel} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleStartImport}
            isLoading={isImporting}
            disabled={validRows === 0 && warningRows === 0}
          >
            Import Verified Contacts &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
};
