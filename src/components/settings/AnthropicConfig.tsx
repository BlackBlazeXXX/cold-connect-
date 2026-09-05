// FILE: src/components/settings/AnthropicConfig.tsx
import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { testAnthropicConnection } from '../../lib/anthropic';

export interface AnthropicConfigProps {
  apiKey: string;
  onChange: (key: string) => void;
}

export const AnthropicConfig: React.FC<AnthropicConfigProps> = ({ apiKey, onChange }) => {
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testAnthropicConnection(apiKey);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to verify Claude AI key.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Claude AI Integration</h4>
          <p className="text-xs text-zinc-500">
            Powers cold email feedback, personalized subject generation, and follow-up copy.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-white mb-1.5">
            Anthropic API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="sk-ant-xxxxxxxxxxxxxxxxx (defaults to demo simulation)"
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
            Uses Anthropic Claude for real-time outreach suggestions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="text-xs text-zinc-500">
            Model: <code className="text-emerald-400 font-mono">claude-sonnet-4-20250514</code>
          </div>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={handleTest}
            isLoading={isTesting}
          >
            Test Connection
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
