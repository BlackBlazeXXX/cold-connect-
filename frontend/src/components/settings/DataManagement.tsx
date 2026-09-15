// FILE: src/components/settings/DataManagement.tsx
import React, { useState } from 'react';
import { Download, Database, RefreshCw, Trash2, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Contact, EmailTemplate } from '../../types';
import { exportContactsToCSV } from '../../lib/csvParser';

export interface DataManagementProps {
  contacts: Contact[];
  templates: EmailTemplate[];
  onResetData: () => void;
  onLoadSampleData: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  contacts,
  templates,
  onResetData,
  onLoadSampleData,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const handleExportContacts = () => {
    exportContactsToCSV(contacts, `cold-connect-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportTemplates = () => {
    const jsonStr = JSON.stringify(templates, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cold-connect-templates-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Database className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Data Export & Backup</h4>
          <p className="text-xs text-zinc-500">
            Export contacts and templates, or manage local development data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-medium text-white">Export Contacts (CSV)</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Includes recruiter names, companies, emails, statuses, reply counts, and notes.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportContacts}
          >
            Download CSV ({contacts.length} rows)
          </Button>
        </div>

        <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-medium text-white">Export Templates (JSON)</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Save complete backup of email templates, merge tags, and subjects.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportTemplates}
          >
            Download JSON ({templates.length} templates)
          </Button>
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
          onClick={onLoadSampleData}
        >
          Reload Demo Sample Recruiters
        </Button>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
          onClick={() => setShowResetConfirm(true)}
        >
          Reset All Stored Data
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          setShowResetConfirm(false);
          onResetData();
        }}
        variant="danger"
        title="Reset All Local Data?"
        message="This will clear your contacts, email logs, and custom templates stored in local state and reload clean defaults. Continue?"
        confirmLabel="Yes, Reset Everything"
      />
    </Card>
  );
};
