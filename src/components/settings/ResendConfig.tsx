// FILE: src/components/settings/ResendConfig.tsx
import React, { useState } from 'react';
import { Mail, Key, Eye, EyeOff, Send, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { sendEmailViaResend } from '../../lib/resend';

export interface ResendConfigProps {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  onChange: (fields: {
    resend_api_key?: string;
    sender_name?: string;
    sender_email?: string;
    reply_to_email?: string;
  }) => void;
  userEmail: string;
}

export const ResendConfig: React.FC<ResendConfigProps> = ({
  apiKey,
  senderName,
  senderEmail,
  replyToEmail,
  onChange,
  userEmail,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const result = await sendEmailViaResend({
        apiKey: apiKey || 're_demo',
        from: `${senderName || 'Cold Connect'} <${senderEmail || 'onboarding@resend.dev'}>`,
        to: userEmail || 'sanju.designer001@gmail.com',
        replyTo: replyToEmail || senderEmail || 'sanju.designer001@gmail.com',
        subject: 'Cold Connect — Test Delivery Confirmation',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #6366f1; margin-top: 0;">Cold Connect Test Email</h2>
            <p>Congratulations! Your email sender configuration with Resend is fully working.</p>
            <p style="color: #64748b; font-size: 12px;">Sent via Cold Connect for Job Seekers</p>
          </div>
        `,
      });

      if (result.success) {
        setTestResult({
          success: true,
          message: `Test email dispatched to ${userEmail}! Check your inbox or spam folder.`,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to dispatch test email.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error executing test send.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Resend Email Service</h4>
          <p className="text-xs text-zinc-500">
            Configure your custom domain or onboarding sender to dispatch recruiter outreach.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-white mb-1.5">
            Resend API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey || ''}
              onChange={(e) => onChange({ resend_api_key: e.target.value })}
              placeholder="re_xxxxxxxxxxxxxxxxx (defaults to demo simulation)"
              className="w-full pl-3 pr-10 py-2 text-xs bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 font-mono text-white placeholder-zinc-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono mt-1">
            Get your API key from your Resend dashboard at resend.com
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Sender Display Name"
            value={senderName || ''}
            onChange={(e) => onChange({ sender_name: e.target.value })}
            placeholder="e.g. Sanju Designer"
          />

          <Input
            label="Sender Email Address"
            type="email"
            value={senderEmail || ''}
            onChange={(e) => onChange({ sender_email: e.target.value })}
            placeholder="e.g. sanju@yourdomain.com or onboarding@resend.dev"
          />
        </div>

        <Input
          label="Reply-To Email Address"
          type="email"
          value={replyToEmail || ''}
          onChange={(e) => onChange({ reply_to_email: e.target.value })}
          placeholder="e.g. sanju.designer001@gmail.com"
          helperText="Where recruiters' responses will arrive when they hit reply"
        />

        {/* Test Email action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5">
          <div className="text-xs text-zinc-400">
            Sends a diagnostic message to <strong className="text-white">{userEmail}</strong>
          </div>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={handleSendTest}
            isLoading={isSendingTest}
          >
            Send Test Email
          </Button>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
