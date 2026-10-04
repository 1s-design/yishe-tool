import { type VariantProps, cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium select-none cursor-pointer transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border/60 bg-transparent text-muted-foreground hover:bg-[var(--1s-hover-overlay)] hover:text-foreground hover:border-border',
        secondary: 'bg-secondary/60 text-muted-foreground hover:bg-[var(--1s-hover-overlay)] hover:text-foreground',
        ghost: 'text-muted-foreground hover:bg-[var(--1s-hover-overlay)] hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        tonal: 'bg-accent text-accent-foreground hover:bg-accent/80',
      },
      size: {
        default: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-6 px-2 text-[11px] rounded-md',
        xs: 'h-5 px-1.5 text-[10px] rounded-md',
        lg: 'h-8 px-4 text-xs rounded-md',
        icon: 'h-7 w-7 p-0 rounded-md',
        'icon-sm': 'h-6 w-6 p-0 rounded-md',
        'icon-xs': 'h-5 w-5 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
