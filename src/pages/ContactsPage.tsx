// FILE: src/pages/ContactsPage.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send, Ban, CheckSquare, X } from 'lucide-react';
import { useContacts } from '../hooks/useContacts';
import { useEmailLogs } from '../hooks/useEmailLogs';
import { Contact, ContactStatus } from '../types';
import { ContactFilters, FilterState } from '../components/contacts/ContactFilters';
import { ContactTable } from '../components/contacts/ContactTable';
import { ContactDrawer } from '../components/contacts/ContactDrawer';
import { ManualAddModal } from '../components/contacts/ManualAddModal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { exportContactsToCSV } from '../lib/csvParser';
import { CONTACT_STATUSES } from '../constants/constants';

export const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    contacts,
    loading,
    addContact,
    deleteContact,
    bulkDelete,
    updateContactStatus,
    markReplied,
    toggleDoNotEmail,
    updateNotes,
  } = useContacts();

  const { logs } = useEmailLogs();

  // Selected contact for drawer
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Manual add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirm delete single/bulk dialogs
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    statuses: [],
    source: 'all',
    hasReplies: 'all',
  });

  // Filtered contacts calculation
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Search text
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matches =
          c.hr_name.toLowerCase().includes(q) ||
          c.company_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.job_role && c.job_role.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Statuses filter
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(c.status)) return false;
      }

      // Source filter
      if (filters.source !== 'all') {
        if (c.source !== filters.source) return false;
      }

      return true;
    });
  }, [contacts, filters]);

  const handleRowClick = (contact: Contact) => {
    setActiveContact(contact);
    setIsDrawerOpen(true);
  };

  const handleToggleSelectId = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const handleExport = () => {
    exportContactsToCSV(filteredContacts);
  };

  const handleBulkStatusChange = (newStatus: ContactStatus) => {
    selectedIds.forEach((id) => {
      updateContactStatus(id, newStatus);
    });
    setSelectedIds(new Set());
  };

  const handleBulkSend = () => {
    // Navigate to send page with bulk list
    navigate(`/send?bulkIds=${Array.from(selectedIds).join(',')}`);
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">HR Contacts Directory</h3>
          <p className="text-xs text-zinc-500">
            {filteredContacts.length} of {contacts.length} recruiters matching current filters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <ContactFilters
        filters={filters}
        onChange={setFilters}
        onClear={() =>
          setFilters({
            search: '',
            statuses: [],
            source: 'all',
            hasReplies: 'all',
          })
        }
        onExportCSV={handleExport}
        totalFilteredCount={filteredContacts.length}
      />

      {/* BULK ACTIONS BAR (Appears when checkboxes are selected) */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-[#0c0c0c] border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 font-mono">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedIds.size} contacts selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={handleBulkSend}
            >
              Send Outreach ({selectedIds.size})
            </Button>

            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value as ContactStatus);
                }
              }}
              defaultValue=""
              className="bg-[#0a0a0a] border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#0c0c0c] text-zinc-400">
                Change Status to...
              </option>
              {CONTACT_STATUSES.map((st) => (
                <option key={st} value={st} className="bg-[#0c0c0c] text-white">
                  {st}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
              onClick={() => setShowBulkDeleteConfirm(true)}
            >
              Delete
            </Button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main TanStack Contacts Table */}
      <ContactTable
        contacts={filteredContacts}
        onSelectContact={handleRowClick}
        onSendEmail={(c) => navigate(`/send?contactId=${c.id}`)}
        onMarkReplied={markReplied}
        onDeleteContact={(id) => setDeleteTargetId(id)}
        onUpdateStatus={updateContactStatus}
        onToggleDoNotEmail={toggleDoNotEmail}
        selectedIds={selectedIds}
        onToggleSelectId={handleToggleSelectId}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {/* Contact Drawer for Detailed Overview, History & Notes */}
      <ContactDrawer
        contact={activeContact}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        emailLogs={logs}
        onUpdateStatus={updateContactStatus}
        onMarkReplied={markReplied}
        onToggleDoNotEmail={toggleDoNotEmail}
        onSaveNotes={updateNotes}
      />

      {/* Manual Add Modal */}
      <ManualAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addContact}
        existingContacts={contacts}
      />

      {/* Delete Single Contact Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteContact(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        variant="danger"
        title="Delete Recruiter Contact?"
        message="Are you sure you want to permanently remove this contact? Past outreach logs will be preserved."
        confirmLabel="Yes, Delete"
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={async () => {
          await bulkDelete(Array.from(selectedIds));
          setSelectedIds(new Set());
          setShowBulkDeleteConfirm(false);
        }}
        variant="danger"
        title={`Delete ${selectedIds.size} Contacts?`}
        message="Are you sure you want to delete the selected contacts? This action cannot be undone."
        confirmLabel="Delete Selected"
      />
    </div>
  );
};
