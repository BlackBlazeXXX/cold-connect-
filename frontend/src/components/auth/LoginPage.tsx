// FILE: src/components/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { APP_CONFIG } from '../../constants/constants';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('sanju.designer001@gmail.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMessage(error.message || 'Invalid credentials. Try again.');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please try again.');
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
          {APP_CONFIG.name}
        </h2>
        <p className="text-xs text-[#64748B] mt-1">{APP_CONFIG.tagline}</p>
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
              label="Email Address"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Demo account ready</span>
              <Link
                to="/forgot-password"
                className="font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-[#F1F5F9] pt-4">
            <p className="text-xs text-[#64748B]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
