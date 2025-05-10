import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

function getToastStyle(variant?: string) {
  switch (variant) {
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

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const { icon, bg, border, text } = getToastStyle(variant);
        return (
          <Toast key={id} variant={variant} {...props} className={`!p-0 !border-l-8 ${border} ${bg} ${text} shadow-lg rounded-lg mb-4`}>
            <div className="flex items-start gap-3 p-4">
              <div className="mt-1">{icon}</div>
              <div className="flex-1 grid gap-1">
                {title && <ToastTitle className="text-base font-bold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
