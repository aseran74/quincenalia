import { Sparkles } from 'lucide-react';

function getToastStyle(variant?: string) {
  switch (variant) {
    case 'exchange':
      return {
        icon: <Sparkles className="h-6 w-6 text-yellow-300" />, bg: 'bg-gradient-to-r from-indigo-600 to-purple-600', border: 'border-0', text: 'text-white'
      };
    case 'destructive':
    case 'error':
      return {
        icon: <XCircle className="h-6 w-6 text-red-500" />, bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800'
      };
    case 'warning':
      return {
        icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />, bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800'
      };
    case 'success':
    case 'info':
    default:
      return {
        icon: <CheckCircle className="h-6 w-6 text-blue-500" />, bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800'
      };
  }
} 