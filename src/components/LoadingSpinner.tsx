import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
  </div>
);