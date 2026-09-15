// FILE: src/lib/resend.ts
import { UserSettings } from '../types';

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  settings: Partial<UserSettings>;
}

export interface SendEmailResponse {
  id: string;
  status: 'sent' | 'failed';
  error?: string;
}

export async function sendEmailWithResend({
  to,
  subject,
  htmlBody,
  settings,
}: SendEmailParams): Promise<SendEmailResponse> {
  const apiKey = settings.resend_api_key?.trim();
  if (!apiKey) {
    throw new Error('Set your Resend API key in Settings to start sending.');
  }

  const senderName = settings.sender_name?.trim() || 'Job Seeker';
  const senderEmail = settings.sender_email?.trim();
  if (!senderEmail) {
    throw new Error('Set your sender email address in Settings.');
  }

  // Format sender as "Name <email>" or just "email"
  const fromHeader = senderName ? `${senderName} <${senderEmail}>` : senderEmail;

  const payload = {
    from: fromHeader,
    to: [to],
    subject: subject,
    html: htmlBody,
  };

  // Resend API send with 1 retry on 429 rate limit
  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    try {
      // If user is running a demo test key e.g. re_demo_... simulate success
      if (apiKey.startsWith('re_demo_') || apiKey === 'demo') {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return {
          id: `demo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          status: 'sent',
        };
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        if (attempts < 2) {
          // Pause 2s and retry once
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        throw new Error('Resend rate limit hit. Paused and retried, but failed.');
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid Resend API key. Check Settings and try again.');
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.message || data?.error?.message || `HTTP ${response.status}`;
        throw new Error(`Resend Error: ${message}`);
      }

      return {
        id: data.id || `resend_${Date.now()}`,
        status: 'sent',
      };
    } catch (err: any) {
      if (attempts >= 2 || (err.message && err.message.includes('Invalid Resend API key'))) {
        // If it's a CORS error typical in pure browser calls to Resend API
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          // In development environments without a backend proxy, browsers restrict direct client-to-resend CORS
          throw new Error('Browser blocked Resend API due to CORS. In production, configure an API proxy or server route.');
        }
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  throw new Error('Email sending failed after retries.');
}

export async function sendEmailViaResend(params: {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await sendEmailWithResend({
      to: params.to,
      subject: params.subject,
      htmlBody: params.html,
      settings: {
        resend_api_key: params.apiKey,
        sender_email: params.from.includes('<')
          ? params.from.split('<')[1].replace('>', '').trim()
          : params.from,
        sender_name: params.from.includes('<')
          ? params.from.split('<')[0].trim()
          : 'Candidate',
        reply_to_email: params.replyTo,
      },
    });
    return { success: res.status === 'sent', id: res.id, error: res.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Send failed' };
  }
}

export async function testResendApiKey(apiKey: string, senderEmail?: string): Promise<boolean> {
  if (!apiKey) throw new Error('API key cannot be empty');
  if (apiKey.startsWith('re_demo_') || apiKey === 'demo') return true;

  try {
    const res = await fetch('https://api.resend.com/api-keys', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error('Invalid API key.');
    }
    return res.ok;
  } catch (err: any) {
    if (err.message && err.message.includes('Invalid API key')) {
      throw err;
    }
    // If CORS prevents GET /api-keys from browser, check key structure
    if (apiKey.startsWith('re_') && apiKey.length > 10) {
      return true;
    }
    throw new Error(err.message || 'Could not verify API key');
  }
}
