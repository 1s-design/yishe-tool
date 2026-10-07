import { type VariantProps, cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

/**
 * kit Badge：radius-small 2px · 字号 10px · 字重 550 · 扁平无阴影
 */
export const badgeVariants = cva(
  'inline-flex items-center rounded-[2px] border px-1.5 py-0.5 text-[10px] font-[550] leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--1s-focus-ring-color)] focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--1s-text-color)] text-[var(--1s-surface-background)]',
        secondary:
          'border-transparent bg-[var(--1s-control-surface-muted)] text-[var(--1s-text-color-secondary)]',
        destructive:
          'border-transparent bg-[var(--1s-bg-danger)] text-white hover:bg-[color-mix(in_srgb,var(--1s-bg-danger)_88%,#000)]',
        outline: 'text-[var(--1s-text-color)] border-[var(--1s-border-color)]',
        tonal:
          'border-transparent bg-[var(--1s-accent-color-soft)] text-[var(--1s-text-color)]',
        success:
          'border-transparent bg-[color-mix(in_srgb,var(--1s-bg-success)_15%,transparent)] text-[var(--1s-text-success)]',
        warning:
          'border-transparent bg-[color-mix(in_srgb,var(--1s-bg-warning)_18%,transparent)] text-[var(--1s-text-warning)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
