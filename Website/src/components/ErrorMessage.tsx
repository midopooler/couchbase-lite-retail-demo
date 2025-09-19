// Error Message Component - iOS inspired design
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  type = 'error'
}) => {
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      button: 'text-red-500 hover:text-red-700'
    },
    warning: {
      container: 'bg-orange-50 border-orange-200 text-orange-800',
      icon: 'text-orange-500',
      button: 'text-orange-500 hover:text-orange-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      button: 'text-blue-500 hover:text-blue-700'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`p-4 rounded-lg border ${styles.container} mb-4`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.button} hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
