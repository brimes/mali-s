import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800", 
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800"
}

const variantIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

export function Alert({ variant = 'info', children, className }: AlertProps) {
  const Icon = variantIcons[variant]
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 border rounded-md",
      variantStyles[variant],
      className
    )}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  )
}