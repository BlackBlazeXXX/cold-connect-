// FILE: src/components/auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setIsSubmitted(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white mx-auto shadow-md mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Reset your password
        </h2>
        <p className="text-xs text-[#64748B] mt-1">
          We'll send you an email with instructions to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E2E8F0] rounded-2xl sm:px-10">
          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Check your email</h3>
              <p className="text-xs text-[#64748B] mt-1 mb-6">
                We've sent a password reset link to <strong className="text-[#0F172A]">{email}</strong>.
              </p>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="p-3 text-xs bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] rounded-lg">
                  {errorMessage}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
