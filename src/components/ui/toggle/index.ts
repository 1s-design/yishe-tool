import { type VariantProps, cva } from 'class-variance-authority'

export { default as Toggle } from './Toggle.vue'

export const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-[5px] text-[11px] font-[450] ring-offset-background transition-colors hover:bg-[var(--1s-state-hover)] hover:text-[var(--1s-text-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--1s-focus-ring-color)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[var(--1s-state-selected)] data-[state=on]:text-[var(--1s-state-selected-text)] select-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-[var(--1s-control-border-color)] bg-transparent hover:bg-[var(--1s-state-hover)] hover:text-[var(--1s-text-color)]',
      },
      size: {
        default: 'h-6 px-2',
        sm: 'h-6 px-2 text-[11px]',
        lg: 'h-8 px-3 text-[12px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ToggleVariants = VariantProps<typeof toggleVariants>
