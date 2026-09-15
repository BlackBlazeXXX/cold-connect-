// FILE: src/components/auth/SignupPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { APP_CONFIG } from '../../constants/constants';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setErrorMessage(error.message);
      } else {
        // First run new user goes directly to Settings setup
        navigate('/settings?firstRun=true');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Signup failed. Please try again.');
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
          Create your account
        </h2>
        <p className="text-xs text-[#64748B] mt-1">
          Start personalizing job outreach in minutes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E2E8F0] rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3 text-xs bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] rounded-lg">
                {errorMessage}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              required
              leftIcon={<User className="w-4 h-4" />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson"
            />

            <Input
              label="Email Address"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
            />

            <Input
              label="Password"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-[#F1F5F9] pt-4">
            <p className="text-xs text-[#64748B]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
