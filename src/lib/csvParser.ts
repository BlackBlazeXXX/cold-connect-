// FILE: src/lib/csvParser.ts
import Papa from 'papaparse';
import { CSV_COLUMN_MAPPINGS } from '../constants/constants';
import { Contact, ExtractedContact } from '../types';

export interface CSVParseResult {
  contacts: ExtractedContact[];
  totalRows: number;
  validCount: number;
  warningCount: number;
  invalidCount: number;
  duplicateCount: number;
  warnings: string[];
}

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function detectColumnKey(headers: string[], mappingList: string[]): string | null {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  for (const mapping of mappingList) {
    const idx = normalizedHeaders.indexOf(mapping.toLowerCase());
    if (idx !== -1) {
      return headers[idx];
    }
  }
  // Try partial includes
  for (const mapping of mappingList) {
    const idx = normalizedHeaders.findIndex((h) => h.includes(mapping.toLowerCase()));
    if (idx !== -1) {
      return headers[idx];
    }
  }
  return null;
}

export function parseCSVFile(
  fileOrText: File | string,
  existingContacts: Contact[] = []
): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileOrText as any, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        const warnings: string[] = [];
        const rawData = results.data as Record<string, string>[];

        if (!rawData || rawData.length === 0) {
          return reject(new Error('File appears empty.'));
        }

        const headers = results.meta.fields || Object.keys(rawData[0] || {});
        if (headers.length === 0) {
          return reject(new Error('File appears empty or could not detect columns.'));
        }

        const nameKey = detectColumnKey(headers, CSV_COLUMN_MAPPINGS.name);
        const companyKey = detectColumnKey(headers, CSV_COLUMN_MAPPINGS.company);
        const emailKey = detectColumnKey(headers, CSV_COLUMN_MAPPINGS.email);
        const roleKey = detectColumnKey(headers, CSV_COLUMN_MAPPINGS.role);

        if (!nameKey && !emailKey && !companyKey) {
          return reject(
            new Error(
              'Could not detect contact columns. Expected headers like: Name, Email, Company'
            )
          );
        }

        let processRows = rawData;
        if (rawData.length > 500) {
          warnings.push('Showing first 500 rows. Please import remaining contacts in batches.');
          processRows = rawData.slice(0, 500);
        }

        // Map existing emails for duplicate checking
        const existingEmailMap = new Map<string, Contact>();
        existingContacts.forEach((c) => {
          if (c.email) {
            existingEmailMap.set(c.email.trim().toLowerCase(), c);
          }
        });

        // Set to track duplicates inside this file itself
        const seenInFile = new Set<string>();

        let validCount = 0;
        let warningCount = 0;
        let invalidCount = 0;
        let duplicateCount = 0;

        const extractedContacts: ExtractedContact[] = processRows.map((row) => {
          const hrName = (nameKey ? row[nameKey] : '')?.trim() || '';
          const companyName = (companyKey ? row[companyKey] : '')?.trim() || '';
          const email = (emailKey ? row[emailKey] : '')?.trim().toLowerCase() || '';
          const jobRole = (roleKey ? row[roleKey] : '')?.trim() || '';

          const rowErrors: string[] = [];

          if (!email) {
            rowErrors.push('Missing email address');
          } else if (!EMAIL_REGEX.test(email)) {
            rowErrors.push('Invalid email format');
          }

          if (!hrName) {
            rowErrors.push('Missing HR name');
          } else if (hrName.length < 2) {
            rowErrors.push('HR Name must be at least 2 characters');
          }

          if (!companyName) {
            rowErrors.push('Missing company name');
          }

          const existing = email ? existingEmailMap.get(email) : undefined;
          const duplicateInFile = email ? seenInFile.has(email) : false;
          if (email) seenInFile.add(email);

          const isDuplicate = Boolean(existing || duplicateInFile);
          if (isDuplicate) {
            duplicateCount++;
          }

          const isValid = rowErrors.length === 0;

          if (!isValid) {
            invalidCount++;
          } else if (!jobRole || isDuplicate) {
            warningCount++;
          } else {
            validCount++;
          }

          return {
            hr_name: hrName,
            company_name: companyName,
            email,
            job_role: jobRole,
            is_valid: isValid,
            errors: rowErrors,
            is_duplicate: isDuplicate,
            existing_id: existing?.id || null,
          };
        });

        // Check if all were invalid
        const hasAnyValidEmail = extractedContacts.some((c) => EMAIL_REGEX.test(c.email));
        if (!hasAnyValidEmail && extractedContacts.length > 0) {
          return reject(new Error('No valid contacts found. Check your file format.'));
        }

        resolve({
          contacts: extractedContacts,
          totalRows: rawData.length,
          validCount,
          warningCount,
          invalidCount,
          duplicateCount,
          warnings,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parse error: ${error.message}`));
      },
    });
  });
}

export function parseCSVText(
  text: string,
  existingContacts: Contact[] = []
): Promise<CSVParseResult> {
  return parseCSVFile(text, existingContacts);
}

export function exportContactsToCSV(
  contacts: Contact[],
  filename: string = 'recruiter_contacts.csv'
) {
  const csv = Papa.unparse(contacts);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
