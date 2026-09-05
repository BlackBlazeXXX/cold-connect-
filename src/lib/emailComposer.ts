// FILE: src/lib/emailComposer.ts
import { Contact, EmailTemplate, UserSettings } from '../types';

export interface ComposedEmail {
  subject: string;
  htmlBody: string;
  plainTextBody: string;
}

export function composeMail(
  template: Pick<EmailTemplate, 'subject' | 'body'>,
  contact: Pick<Contact, 'hr_name' | 'company_name' | 'job_role' | 'email'>,
  settings: Partial<UserSettings>,
  customSubject?: string
): ComposedEmail {
  const hrFirstName = (contact.hr_name || 'Hiring Manager').trim().split(' ')[0] || 'Hiring Manager';
  const company = contact.company_name?.trim() || 'your company';
  const role = contact.job_role?.trim() || 'the open position';
  const yourName = settings.sender_name?.trim() || settings.full_name?.trim() || 'Candidate';
  const rawDriveLink = settings.resume_drive_link?.trim() || '';

  const resumeHtml = rawDriveLink
    ? `<a href="${rawDriveLink}" target="_blank" rel="noopener noreferrer" style="color: #4F46E5; text-decoration: underline; font-weight: 500;">View Resume &rarr;</a>`
    : 'Resume (link upon request)';

  const resumePlainText = rawDriveLink ? `View Resume: ${rawDriveLink}` : 'Resume upon request';

  const replaceMap: Record<string, { html: string; plain: string }> = {
    '{HR_Name}': { html: hrFirstName, plain: hrFirstName },
    '{Company_Name}': { html: company, plain: company },
    '{Job_Role}': { html: role, plain: role },
    '{Your_Name}': { html: yourName, plain: yourName },
    '{Resume_Link}': { html: resumeHtml, plain: resumePlainText },
  };

  // Replace subject line
  let rawSubject = customSubject !== undefined && customSubject.trim().length > 0
    ? customSubject
    : template.subject;

  let subject = rawSubject;
  for (const [key, val] of Object.entries(replaceMap)) {
    const reg = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    subject = subject.replace(reg, val.plain);
  }

  // Replace body
  let bodyTemplate = template.body;
  let plainBody = bodyTemplate;
  let htmlBody = bodyTemplate;

  for (const [key, val] of Object.entries(replaceMap)) {
    const reg = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    plainBody = plainBody.replace(reg, val.plain);
    htmlBody = htmlBody.replace(reg, val.html);
  }

  // Convert newlines to paragraphs/breaks for HTML email
  const formattedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 16px; background-color: #ffffff; }
    p { margin-bottom: 1em; margin-top: 0; }
  </style>
</head>
<body>
  <div>
    ${htmlBody
      .split('\n\n')
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
      .join('')}
  </div>
</body>
</html>
`.trim();

  return {
    subject,
    htmlBody: formattedHtml,
    plainTextBody: plainBody,
  };
}
