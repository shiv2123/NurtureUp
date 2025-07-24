import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-slate-gray text-white hover:bg-slate-gray/80',
        secondary:
          'border-transparent bg-slate-200 text-black hover:bg-slate-200/80',
        destructive:
          'border-transparent bg-error text-white hover:bg-error/80',
        outline: 'text-black border-slate-300',
        success:
          'border-transparent bg-success text-white hover:bg-success/80',
        warning:
          'border-transparent bg-warning text-white hover:bg-warning/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }