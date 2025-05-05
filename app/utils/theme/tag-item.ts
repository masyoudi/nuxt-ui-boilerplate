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
      error: {
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
        base: 'p-[0.075rem]',
        text: 'text-[10px] px-1',
        close: 'p-[0.1rem]',
        closeIcon: 'size-[0.675rem]'
      },
      sm: {
        base: 'p-[0.095rem]',
        text: 'text-xs px-1',
        close: 'p-[0.1rem]',
        closeIcon: 'size-[0.775rem]'
      },
      md: {
        base: 'p-0.5',
        text: 'text-sm px-1',
        close: 'p-0.5',
        closeIcon: 'size-4'
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
        closeIcon: 'size-5'
      }
    }
  },
  compoundVariants: [
    {
      color: 'primary',
      variant: 'solid',
      class: {
        base: 'bg-(--ui-color-primary-500) text-white',
        close: 'hover:bg-(--ui-color-primary-600)'
      }
    },
    {
      color: 'primary',
      variant: 'outlined',
      class: {
        base: 'ring ring-(--ui-color-primary-500) bg-(--ui-bg) text-(--ui-color-primary-500)',
        close: 'hover:bg-(--ui-color-primary-100)'
      }
    },
    {
      color: 'primary',
      variant: 'soft',
      class: {
        base: 'bg-(--ui-color-primary-100) text-(--ui-color-primary-500)',
        close: 'hover:bg-(--ui-color-primary-200)'
      }
    },
    {
      color: 'primary',
      variant: 'subtle',
      class: {
        base: 'ring ring-(--ui-color-primary-500) bg-(--ui-color-primary-100) text-(--ui-color-primary-500)',
        close: 'hover:bg-(--ui-color-primary-200)'
      }
    },
    {
      color: 'error',
      variant: 'solid',
      class: {
        base: 'bg-(--ui-color-error-500) text-white',
        close: 'hover:bg-(--ui-color-error-600)'
      }
    },
    {
      color: 'error',
      variant: 'outlined',
      class: {
        base: 'ring ring-(--ui-color-error-500) bg-(--ui-bg) text-(--ui-color-error-500)',
        close: 'hover:bg-(--ui-color-error-100)'
      }
    },
    {
      color: 'error',
      variant: 'soft',
      class: {
        base: 'bg-(--ui-color-error-100) text-(--ui-color-error-500)',
        close: 'hover:bg-(--ui-color-error-200)'
      }
    },
    {
      color: 'error',
      variant: 'subtle',
      class: {
        base: 'ring ring-(--ui-color-error-500) bg-(--ui-color-error-100) text-(--ui-color-error-500)',
        close: 'hover:bg-(--ui-color-error-200)'
      }
    },
    {
      color: 'neutral',
      variant: 'solid',
      class: {
        base: 'bg-slate-200 text-slate-600',
        close: 'hover:bg-slate-300'
      }
    },
    {
      color: 'neutral',
      variant: 'outlined',
      class: {
        base: 'ring ring-slate-300 bg-(--ui-bg) text-slate-600',
        close: 'hover:bg-slate-100'
      }
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: {
        base: 'bg-slate-100 text-slate-600',
        close: 'hover:bg-slate-200'
      }
    },
    {
      color: 'neutral',
      variant: 'subtle',
      class: {
        base: 'ring ring-slate-300 bg-slate-50 text-slate-600',
        close: 'hover:bg-slate-200'
      }
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
