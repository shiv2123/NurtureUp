import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-sage-green text-white hover:bg-sage-green/90 focus-visible:ring-sage-green shadow-sm',
        primary: 'bg-sky-blue text-black hover:bg-sky-blue/90 focus-visible:ring-sky-blue shadow-sm',
        secondary: 'bg-slate-gray text-white hover:bg-slate-gray/90 focus-visible:ring-slate-gray shadow-sm',
        outline: 'border-2 border-slate-gray text-black hover:bg-slate-gray/10 focus-visible:ring-slate-gray',
        ghost: 'text-black hover:bg-slate-gray/10 focus-visible:ring-slate-gray',
        coral: 'bg-soft-coral text-black hover:bg-soft-coral/90 focus-visible:ring-soft-coral shadow-sm',
        yellow: 'bg-sunny-yellow text-black hover:bg-sunny-yellow/90 focus-visible:ring-sunny-yellow shadow-sm',
        mint: 'bg-mint-green text-black hover:bg-mint-green/90 focus-visible:ring-mint-green shadow-sm',
        success: 'bg-success text-white hover:bg-success/90 focus-visible:ring-success shadow-sm',
        warning: 'bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning shadow-sm',
        destructive: 'bg-error text-white hover:bg-error/90 focus-visible:ring-error shadow-sm'
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, loadingText, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants } 