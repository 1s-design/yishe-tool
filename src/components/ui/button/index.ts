import { type VariantProps, cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium text-foreground ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs',
        outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-xs',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        tonal: 'bg-accent text-accent-foreground hover:bg-accent/80 font-medium',
      },
      size: {
        default: 'h-7 px-2.5 py-1 text-xs',
        sm: 'h-6 rounded-md px-2 text-[11px]',
        xs: 'h-5 rounded-xs px-1.5 text-[10px]',
        lg: 'h-8 rounded-md px-4 text-xs',
        icon: 'h-7 w-7 p-0 rounded-md',
        'icon-sm': 'h-6 w-6 p-0 rounded-md',
        'icon-xs': 'h-5 w-5 p-0 rounded-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
