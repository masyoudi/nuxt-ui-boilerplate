import { tv } from 'tailwind-variants';

const theme = tv({
  slots: {
    trigger: 'justify-start font-normal group hover:bg-muted',
    triggerIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700',
    triggerTrailingIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700',
    value: 'overflow-hidden whitespace-nowrap',
    clearAction: 'inline-flex justify-center items-center rounded-full hover:[&>*]:text-error hover:bg-error-100 ms-auto z-[2]',
    clearIcon: 'text-slate-400'
  },
  variants: {
    size: {
      xs: {
        clearAction: 'size-4'
      },
      sm: {
        clearAction: 'size-4'
      },
      md: {
        clearAction: 'size-5'
      },
      lg: {
        clearAction: 'size-5'
      },
      xl: {
        clearAction: 'size-6'
      }
    },
    hasValue: {
      true: {

      },
      false: {
        value: 'text-slate-400'
      }
    }
  },
  compoundVariants: [

  ]
});

export default theme;
