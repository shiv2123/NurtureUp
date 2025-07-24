import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Custom props can be added here if needed
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input } 