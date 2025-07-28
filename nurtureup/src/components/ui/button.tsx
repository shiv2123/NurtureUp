import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500 shadow-sm',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
        coral: 'bg-pink-500 text-white hover:bg-pink-600 focus-visible:ring-pink-500 shadow-sm',
        yellow: 'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500 shadow-sm',
        mint: 'bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500 shadow-sm',
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm',
        warning: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500 shadow-sm',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm'
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