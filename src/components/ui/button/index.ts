import { type VariantProps, cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

/**
 * 与 src/style/controls.less 对齐的按钮体系 — kit Button 实测规格
 * 高度：24（Default） / 32（Large）  圆角：5（radius-medium）
 * 字阶：11px / 450（body/medium），行高随字号写在一处（text-[11px]/4 = 11/16）
 * padding：4px 8px（Default） / 4px 12px（Large）  gap 4（kit spacer-1）
 * hover 轻叠层、active 加深、focus 环、solid disabled 灰底白字
 *
 * 注意：tailwind-merge 会把「写在 text-[Npx] 之后的 leading-*」吃掉（text-[] 被
 * 归入行高分组），所以行高必须用 text-[11px]/4 与字号写在一起，禁止另起 leading-*
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1 whitespace-nowrap select-none cursor-pointer',
    'box-border border-0 font-[450] tracking-[0.005em]',
    'transition-[background-color,color,border-color,box-shadow] duration-[80ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
    'disabled:pointer-events-none disabled:cursor-default',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--1s-focus-ring-color)]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-[var(--1s-accent-color)] text-white hover:bg-[color-mix(in_srgb,var(--1s-accent-color)_88%,#000)] active:bg-[var(--1s-accent-text-color)] disabled:opacity-100 disabled:bg-[var(--1s-control-disabled-background)] disabled:text-white',
        destructive:
          'bg-[var(--1s-bg-danger)] text-white hover:bg-[color-mix(in_srgb,var(--1s-bg-danger)_88%,#000)] active:bg-[color-mix(in_srgb,var(--1s-bg-danger)_78%,#000)] disabled:opacity-100 disabled:bg-[var(--1s-control-disabled-background)] disabled:text-white',
        outline:
          'border border-[var(--1s-control-border-color)] bg-[var(--1s-surface-background)] text-[var(--1s-text-color)] hover:bg-[var(--1s-state-hover)] hover:border-[var(--1s-border-color-strong)] active:bg-[var(--1s-hover-background)] disabled:opacity-40',
        secondary:
          'bg-[var(--1s-control-surface-muted)] text-[var(--1s-text-color-secondary)] hover:bg-[var(--1s-state-hover)] hover:text-[var(--1s-text-color)] active:bg-[var(--1s-hover-background)] disabled:opacity-40',
        ghost:
          'bg-transparent text-[var(--1s-text-color-secondary)] hover:bg-[var(--1s-state-hover)] hover:text-[var(--1s-text-color)] active:bg-[var(--1s-state-active)] disabled:opacity-40',
        link: 'text-[var(--1s-accent-text-color)] underline-offset-4 hover:underline active:opacity-80 disabled:opacity-40',
        tonal:
          'bg-[var(--1s-state-selected)] text-[var(--1s-state-selected-text)] hover:bg-[color-mix(in_srgb,var(--1s-state-selected)_88%,#000)] active:bg-[color-mix(in_srgb,var(--1s-state-selected)_78%,#000)] disabled:opacity-40',
      },
      size: {
        /* kit Default = 24px 高 / 5px 圆角 / 11px 字 / 行高 16 / pad 4 8 */
        default: 'h-6 min-w-6 px-2 py-1 text-[11px]/4 rounded-[5px]',
        sm: 'h-6 min-w-6 px-2 py-1 text-[11px]/4 rounded-[5px]',
        xs: 'h-5 min-w-5 px-1.5 py-0.5 text-[10px]/[14px] rounded-[4px]',
        /* kit Large = 32px 高 / pad 4 12 / 字号仍 11px */
        lg: 'h-8 min-w-8 px-3 py-1 text-[11px]/4 rounded-[5px]',
        icon: 'h-6 w-6 p-0 rounded-[5px]',
        'icon-sm': 'h-6 w-6 p-0 rounded-[5px]',
        'icon-xs': 'h-5 w-5 p-0 rounded-[4px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
