// FILE: src/pages/UploadPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCSVFile, parseCSVText } from '../lib/csvParser';
import { parsePDFFile } from '../lib/pdfParser';
import { ExtractedContact, Contact } from '../types';
import { useContacts } from '../hooks/useContacts';
import { FileTypeSelector } from '../components/upload/FileTypeSelector';
import { UploadZone } from '../components/upload/UploadZone';
import { ExtractionPreview } from '../components/upload/ExtractionPreview';
import { VerificationTable } from '../components/upload/VerificationTable';
import { ImportSummary } from '../components/upload/ImportSummary';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { contacts: existingContacts, importContacts } = useContacts();

  const [step, setStep] = useState<'upload' | 'verify' | 'summary'>('upload');
  const [selectedType, setSelectedType] = useState<'csv' | 'pdf'>('csv');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [extractedRows, setExtractedRows] = useState<ExtractedContact[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Summary stats
  const [importResults, setImportResults] = useState<{
    imported: number;
    skipped: number;
    duplicates: number;
    batchId: string;
  }>({ imported: 0, skipped: 0, duplicates: 0, batchId: '' });

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setParseWarnings([]);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let contacts: ExtractedContact[] = [];
      let warnings: string[] = [];

      if (ext === 'pdf') {
        setSelectedType('pdf');
        const res = await parsePDFFile(file);
        contacts = res.contacts;
        warnings = res.warnings;
      } else {
        setSelectedType('csv');
        const res = await parseCSVFile(file);
        contacts = res.contacts;
        warnings = res.warnings;
      }

      // Check against existing contacts in DB for duplicates
      const existingEmailSet = new Set(
        existingContacts.map((c) => c.email.toLowerCase())
      );

      const flaggedContacts = contacts.map((c) => {
        const isDup = existingEmailSet.has(c.email.toLowerCase());
        return {
          ...c,
          is_duplicate: isDup,
        };
      });

      setExtractedRows(flaggedContacts);
      setParseWarnings(warnings);
      setStep('verify');
    } catch (err: any) {
      setParseWarnings([err.message || 'Failed to parse file.']);
    } finally {
      setIsParsing(false);
    }
  };

  // Sample CSV quick loader for testing
  const handleLoadSampleCSV = async () => {
    const sampleCSV = `Full Name,Company,Email Address,Target Position
Jessica Miller,Figma,jessica.m@figma.com,Design Systems Lead
David Chen,Notion,dchen@notion.so,Product Designer
Amara Okafor,Linear,amara@linear.app,Frontend Architect
Robert Vance,Retool,rvance@retool.com,Technical Recruiter
Elena Rostova,Datadog,elena.r@datadoghq.com,Software Engineer
`;
    const res = await parseCSVText(sampleCSV, existingContacts);
    const existingEmailSet = new Set(existingContacts.map((c) => c.email.toLowerCase()));
    const flagged = res.contacts.map((c) => ({
      ...c,
      is_duplicate: existingEmailSet.has(c.email.toLowerCase()),
    }));

    setExtractedRows(flagged);
    setParseWarnings(res.warnings);
    setStep('verify');
  };

  const handleExecuteImport = async (validToImport: ExtractedContact[]) => {
    setIsImporting(true);
    try {
      const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;

      const contactsToCreate: Omit<Contact, 'id' | 'user_id' | 'created_at'>[] = validToImport.map(
        (v) => ({
          hr_name: v.hr_name,
          company_name: v.company_name,
          email: v.email,
          job_role: v.job_role,
          status: 'New',
          reply_count: 0,
          last_sent_at: null,
          last_replied_at: null,
          follow_up_due_at: null,
          notes: '',
          do_not_email: false,
          source: selectedType,
          upload_batch_id: batchId,
        })
      );

      const res = await importContacts(contactsToCreate);

      const totalDuplicates = extractedRows.filter((r) => r.is_duplicate).length;
      const totalSkipped = extractedRows.length - validToImport.length;

      setImportResults({
        imported: res.length,
        skipped: totalSkipped,
        duplicates: totalDuplicates,
        batchId,
      });

      setStep('summary');
    } catch (err: any) {
      alert(err.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetAll = () => {
    setStep('upload');
    setSelectedFile(null);
    setExtractedRows([]);
    setParseWarnings([]);
  };

  return (
    <div className="space-y-6">
      {/* STEP 1: Upload Dropzone */}
      {step === 'upload' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">Import Recruiter Contacts</h3>
            <p className="text-xs text-zinc-500">
              Upload CSV spreadsheets or structured recruiter PDF documents to parse HR contacts.
            </p>
          </div>

          <FileTypeSelector
            selectedType={selectedType}
            onSelectType={(t) => setSelectedType(t)}
            disabled={isParsing}
          />

          <Card className="p-6">
            <UploadZone
              onFileSelected={handleFileSelected}
              isLoading={isParsing}
              selectedFile={selectedFile}
            />

            {isParsing && (
              <div className="py-6 text-center">
                <Spinner size="md" label="Parsing and extracting contact records..." />
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-zinc-500">Don't have a CSV handy?</span>
              <Button size="sm" variant="secondary" onClick={handleLoadSampleCSV}>
                Load Sample Recruiter CSV Data
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 2: Verification & Duplicate Check Table */}
      {step === 'verify' && (
        <div className="space-y-6">
          <ExtractionPreview
            totalRows={extractedRows.length}
            validCount={extractedRows.filter((r) => r.is_valid && !r.is_duplicate).length}
            warningCount={
              extractedRows.filter((r) => r.is_valid && (!r.job_role || r.is_duplicate)).length
            }
            invalidCount={extractedRows.filter((r) => !r.is_valid).length}
            duplicateCount={extractedRows.filter((r) => r.is_duplicate).length}
            warnings={parseWarnings}
          />

          <VerificationTable
            contacts={extractedRows}
            onChange={(updated) => setExtractedRows(updated)}
            onImport={handleExecuteImport}
            onCancel={resetAll}
            isImporting={isImporting}
          />
        </div>
      )}

      {/* STEP 3: Summary */}
      {step === 'summary' && (
        <ImportSummary
          importedCount={importResults.imported}
          skippedCount={importResults.skipped}
          duplicateCount={importResults.duplicates}
          batchId={importResults.batchId}
          onReset={resetAll}
        />
      )}
    </div>
  );
};
