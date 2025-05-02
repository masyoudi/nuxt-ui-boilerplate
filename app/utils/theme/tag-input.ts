import { tv, type VariantProps } from 'tailwind-variants';

const theme = tv({
  slots: {
    root: 'w-full',
    wrapper: 'flex items-center rounded-md w-full flex-wrap bg-white',
    input: 'flex-1 rounded bg-transparent border border-transparent placeholder:text-(--ui-text-dimmed) focus:outline-none px-1'
  },
  variants: {
    color: {
      primary: {
        wrapper: 'border border-slate-300 data-focus:border-(--ui-primary)'
      },
      neutral: {
        wrapper: 'border border-slate-300 data-focus:border-slate-400'
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
        root: '',
        wrapper: 'gap-1 py-0.5 px-[0.2rem]',
        input: 'text-[10px] py-[0.1rem]'
      },
      sm: {
        root: '',
        wrapper: 'gap-x-1.5 gap-y-1 py-0.5 px-[0.2rem]',
        input: 'text-xs py-0.5'
      },
      md: {
        root: '',
        wrapper: 'gap-1.5 p-[0.2rem_0.25rem]',
        input: 'text-sm py-0.5'
      },
      lg: {
        root: '',
        wrapper: 'gap-1.5 p-1',
        input: 'text-md py-0.5'
      },
      xl: {
        root: '',
        wrapper: 'gap-2 p-1',
        input: 'text-lg py-0.5'
      }
    },
    disabled: {
      true: ''
    }
  },
  compoundSlots: [
    {
      color: ['primary', 'neutral'],
      slots: ['wrapper'],
      disabled: true,
      class: 'pointer-events-none'
    }
  ],
  defaultVariants: {
    size: 'md',
    color: 'primary',
    variant: 'subtle'
  }
});

export type TagInputSize = VariantProps<typeof theme>['size'];

export type TagInputColor = VariantProps<typeof theme>['color'];

export type TagInputVariant = VariantProps<typeof theme>['variant'];

export default theme;
