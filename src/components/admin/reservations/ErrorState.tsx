
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateProps {
  errorMessage: string;
  onBackClick: () => void;
}

const ErrorState = ({ errorMessage, onBackClick }: ErrorStateProps) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" onClick={onBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorState;
