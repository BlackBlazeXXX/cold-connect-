// FILE: src/pages/NotFoundPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center shadow-xs">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[#0F172A]">Page Not Found</h2>
      <p className="text-xs text-[#64748B] max-w-sm">
        The outreach page or resource you requested does not exist or has been relocated.
      </p>
      <Button
        variant="primary"
        leftIcon={<Home className="w-4 h-4" />}
        onClick={() => navigate('/')}
      >
        Return to Dashboard
      </Button>
    </div>
  );
};
