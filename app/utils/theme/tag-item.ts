import { tv, type VariantProps } from 'tailwind-variants';

const theme = tv({
  slots: {
    base: 'inline-flex items-center justify-center font-medium rounded whitespace-nowrap gap-0.5',
    text: '',
    close: 'inline-flex justify-center items-center grow-0 shrink-0 rounded-xs select-none cursor-pointer',
    closeIcon: ''
  },
  variants: {
    color: {
      primary: {
        base: '',
        close: 'hover:bg-black/10'
      },
      neutral: {
        base: '',
        close: 'hover:bg-slate-500/20'
      }
    },
    variant: {
      solid: '',
      outlined: '',
      subtle: '',
      soft: ''
    },
    size: {
      xs: {
        base: 'p-[0.1rem]',
        text: 'text-[10px] px-1',
        close: 'p-[0.115rem]',
        closeIcon: 'w-[0.675rem] h-[0.675rem]'
      },
      sm: {
        base: 'p-0.5',
        text: 'text-xs px-1',
        close: 'p-0.5',
        closeIcon: 'w-[0.85rem] h-[0.85rem]'
      },
      md: {
        base: 'p-0.5',
        text: 'text-sm px-1',
        close: 'p-0.5',
        closeIcon: 'w-4 h-4'
      },
      lg: {
        base: 'p-0.5',
        text: 'text-md px-1.5',
        close: 'p-0.5',
        closeIcon: 'w-[1.15rem] h-[1.25rem]'
      },
      xl: {
        base: 'p-0.5',
        text: 'text-lg px-2',
        close: 'p-0.5',
        closeIcon: 'w-5 h-5'
      }
    }
  },
  compoundVariants: [
    {
      color: 'primary',
      variant: 'solid',
      class: 'bg-[var(--ui-color-primary-500)] text-white'
    },
    {
      color: 'primary',
      variant: 'outlined',
      class: 'border border-[var(--ui-color-primary-500)] bg-[var(--ui-bg)] text-[var(--ui-color-primary-500)]'
    },
    {
      color: 'primary',
      variant: 'soft',
      class: 'bg-[var(--ui-color-primary-100)] text-[var(--ui-color-primary-500)]'
    },
    {
      color: 'primary',
      variant: 'subtle',
      class: 'border border-[var(--ui-color-primary-500)] bg-[var(--ui-color-primary-100)] text-[var(--ui-color-primary-500)]'
    },
    {
      color: 'neutral',
      variant: 'solid',
      class: 'bg-slate-200 text-slate-600'
    },
    {
      color: 'neutral',
      variant: 'outlined',
      class: 'border border-slate-300 bg-[var(--ui-bg)] text-slate-600'
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: 'bg-slate-100 text-slate-600'
    },
    {
      color: 'neutral',
      variant: 'subtle',
      class: 'border border-slate-300 bg-slate-50 text-slate-600'
    }
  ],
  defaultVariants: {
    size: 'md',
    color: 'primary',
    variant: 'subtle'
  }
});

export type TagItemSize = VariantProps<typeof theme>['size'];

export type TagItemColor = VariantProps<typeof theme>['color'];

export type TagItemVariant = VariantProps<typeof theme>['variant'];

export default theme;
