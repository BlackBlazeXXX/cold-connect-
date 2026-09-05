// FILE: src/components/contacts/ManualAddModal.tsx
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { EMAIL_REGEX } from '../../lib/csvParser';
import { Contact } from '../../types';

export interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contactData: Omit<Contact, 'id' | 'user_id' | 'created_at'>) => Promise<any> | any;
  existingContacts: Contact[];
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingContacts,
}) => {
  const [hrName, setHrName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setHrName('');
    setCompanyName('');
    setEmail('');
    setJobRole('');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!hrName.trim() || hrName.trim().length < 2) {
      setError('HR Name must be at least 2 characters.');
      return;
    }

    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }

    // Duplicate check
    const isDuplicate = existingContacts.some(
      (c) => c.email.toLowerCase() === cleanEmail
    );
    if (isDuplicate) {
      setError(`Contact with email ${cleanEmail} already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        hr_name: hrName.trim(),
        company_name: companyName.trim(),
        email: cleanEmail,
        job_role: jobRole.trim(),
        status: 'New',
        reply_count: 0,
        last_sent_at: null,
        last_replied_at: null,
        follow_up_due_at: null,
        notes: notes.trim(),
        do_not_email: false,
        source: 'manual',
        upload_batch_id: null,
      });
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Recruiter Contact"
      description="Manually record a new HR contact or recruiter to include in outreach."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="HR / Recruiter Name"
          required
          value={hrName}
          onChange={(e) => setHrName(e.target.value)}
          placeholder="e.g. Rachel Adams"
        />

        <Input
          label="Company Name"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Stripe, OpenAI, Airbnb"
        />

        <Input
          label="Work Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. rachel@company.com"
        />

        <Input
          label="Target Job Role (Optional)"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="e.g. Staff Frontend Engineer"
          helperText="Used automatically in email merge tags {Job_Role}"
        />

        <Textarea
          label="Initial Notes / Referrals (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Met at tech conference, mutual connection on LinkedIn..."
          rows={3}
        />

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Add Contact
          </Button>
        </div>
      </form>
    </Modal>
  );
};
