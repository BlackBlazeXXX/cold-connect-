// FILE: src/lib/pdfParser.ts
import { PDF_EXTRACTION_PATTERNS } from '../constants/constants';
import { Contact, ExtractedContact } from '../types';
import { EMAIL_REGEX } from './csvParser';

export interface PDFParseResult {
  contacts: ExtractedContact[];
  rawTextPreview: string;
  warning: string;
}

export async function extractTextFromPDFFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder('latin1');
  const binaryString = textDecoder.decode(bytes);

  // Extract text within PDF text objects: (Text) Tj, [(T) (e) (x) (t)] TJ, or plain text streams
  const textChunks: string[] = [];

  // Match literal text strings ( ... ) Tj or ' or "
  const textStringRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
  let match: RegExpExecArray | null;
  while ((match = textStringRegex.exec(binaryString)) !== null) {
    // Unescape basic PDF escape sequences
    const unescaped = match[1]
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
    textChunks.push(unescaped);
  }

  // Also match TJ arrays [ (text) -10 (text) ] TJ
  const tjRegex = /\[(.*?)\]\s*TJ/g;
  while ((match = tjRegex.exec(binaryString)) !== null) {
    const inner = match[1];
    const subParts = inner.match(/\(([^)]*)\)/g);
    if (subParts) {
      const line = subParts.map((s) => s.slice(1, -1)).join('');
      textChunks.push(line);
    }
  }

  // Also check for readable email / name lines directly in stream
  const rawTextMatch = binaryString.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);

  let combinedText = textChunks.join(' ');
  if (combinedText.trim().length < 20 && rawTextMatch && rawTextMatch.length > 0) {
    // PDF streams might be decoded or plain
    combinedText = binaryString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  }

  if (combinedText.trim().length < 10) {
    throw new Error(
      'Could not extract text. Is this a scanned PDF? Try copying text to a CSV instead.'
    );
  }

  return combinedText;
}

export async function parsePDFContacts(
  file: File,
  existingContacts: Contact[] = []
): Promise<PDFParseResult> {
  const fullText = await extractTextFromPDFFile(file);

  const existingEmailMap = new Map<string, Contact>();
  existingContacts.forEach((c) => {
    if (c.email) {
      existingEmailMap.set(c.email.trim().toLowerCase(), c);
    }
  });

  // Extract emails
  const foundEmails = Array.from(new Set(fullText.match(PDF_EXTRACTION_PATTERNS.email) || []));

  if (foundEmails.length === 0) {
    throw new Error(
      'No email addresses found in the PDF. Please verify the document or use a CSV file.'
    );
  }

  // Break text into lines / segments around emails
  const lines = fullText
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const contacts: ExtractedContact[] = [];

  for (const email of foundEmails) {
    const cleanEmail = email.toLowerCase().trim();
    // Locate the line or context containing this email
    const lineIndex = lines.findIndex((l) => l.toLowerCase().includes(cleanEmail));
    const nearbyContext = lineIndex !== -1
      ? lines.slice(Math.max(0, lineIndex - 2), lineIndex + 3).join(' ')
      : fullText;

    // Try extracting Name
    let hrName = '';
    const nameMatch = /Name:\s*([^,\n|]+)/i.exec(nearbyContext) ||
      /(?:Contact|HR|Recruiter):\s*([^,\n|]+)/i.exec(nearbyContext);
    if (nameMatch && nameMatch[1]) {
      hrName = nameMatch[1].trim();
    } else {
      // Guess from email prefix (e.g., john.doe@company.com -> John Doe)
      const prefix = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
      hrName = prefix
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    // Try extracting Company
    let companyName = '';
    const companyMatch = /(?:Company|Organization|Employer|Firm):\s*([^,\n|]+)/i.exec(nearbyContext);
    if (companyMatch && companyMatch[1]) {
      companyName = companyMatch[1].trim();
    } else {
      // Guess company from domain (e.g. google.com -> Google)
      const domain = cleanEmail.split('@')[1] || '';
      const domainName = domain.split('.')[0] || '';
      if (domainName && !['gmail', 'yahoo', 'outlook', 'hotmail', 'icloud', 'proton'].includes(domainName)) {
        companyName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
      } else {
        companyName = 'Company';
      }
    }

    // Try extracting Role
    let jobRole = '';
    const roleMatch = /(?:Role|Title|Position|Job):\s*([^,\n|]+)/i.exec(nearbyContext);
    if (roleMatch && roleMatch[1]) {
      jobRole = roleMatch[1].trim();
    }

    const rowErrors: string[] = [];
    if (!EMAIL_REGEX.test(cleanEmail)) {
      rowErrors.push('Invalid email format');
    }
    if (!hrName || hrName.length < 2) {
      rowErrors.push('Missing or invalid HR name');
    }
    if (!companyName) {
      rowErrors.push('Missing company name');
    }

    const existing = existingEmailMap.get(cleanEmail);
    const isDuplicate = Boolean(existing);

    contacts.push({
      hr_name: hrName,
      company_name: companyName,
      email: cleanEmail,
      job_role: jobRole,
      is_valid: rowErrors.length === 0,
      errors: rowErrors,
      is_duplicate: isDuplicate,
      existing_id: existing?.id || null,
    });
  }

  return {
    contacts,
    rawTextPreview: fullText.slice(0, 300) + '...',
    warning: 'PDF extraction may be imperfect. Please verify all rows before importing.',
  };
}

export async function parsePDFFile(
  file: File,
  existingContacts: Contact[] = []
): Promise<{ contacts: ExtractedContact[]; warnings: string[] }> {
  const result = await parsePDFContacts(file, existingContacts);
  return {
    contacts: result.contacts,
    warnings: result.warning ? [result.warning] : [],
  };
}
