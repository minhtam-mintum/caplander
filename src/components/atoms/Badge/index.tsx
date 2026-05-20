import type { ReactNode } from 'react'
import type { TagVariant } from 'app/types/event'
import { cn } from 'app/utils/cn'

const variantClass: Record<TagVariant, string> = {
  error:     'bg-error-container text-on-error-container',
  primary:   'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-container text-on-secondary-container',
  tertiary:  'bg-tertiary-fixed text-on-tertiary-fixed',
}

interface IBadgeProps {
  label: string
  variant?: TagVariant
  icon?: ReactNode
  className?: string
}

export function Badge({ label, variant = 'secondary', icon, className }: IBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-medium whitespace-nowrap', variantClass[variant], className)}>
      {icon && <span className='shrink-0'>{icon}</span>}
      {label}
    </span>
  )
}
