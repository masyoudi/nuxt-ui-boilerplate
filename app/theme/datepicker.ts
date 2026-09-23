import { tv } from 'tailwind-variants';

const theme = tv({
  slots: {
    trigger: 'justify-start font-normal group hover:bg-muted',
    triggerIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700',
    triggerTrailingIcon: 'text-slate-400 group-focus:text-slate-700 group-data-[state=open]:text-slate-700',
    value: 'overflow-hidden whitespace-nowrap',
    clearAction: 'inline-flex justify-center items-center rounded-full hover:[&>*]:text-error hover:bg-error-100 ms-auto z-[2]',
    calendarAction: 'inline-flex cursor-pointer items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
    clearIcon: 'text-slate-400',
    root: [
      'group relative inline-flex w-full items-center rounded-md border-0 transition-colors',
      'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-75'
    ],
    input: [
      'min-w-0 flex-1 appearance-none border-0 bg-transparent outline-none',
      'placeholder:text-dimmed disabled:cursor-not-allowed'
    ],
    leading: 'inline-flex shrink-0 items-center',
    leadingIcon: 'shrink-0 text-dimmed',
    trailing: 'inline-flex shrink-0 items-center',
    trailingIcon: 'shrink-0 text-dimmed'
  },
  variants: {
    size: {
      xs: {
        clearAction: 'size-4',
        calendarAction: 'size-4',
        input: 'px-2 py-1 text-sm/4',
        leading: 'ps-2',
        trailing: 'gap-1 pe-2',
        leadingIcon: 'size-4',
        trailingIcon: 'size-4'
      },
      sm: {
        clearAction: 'size-4',
        calendarAction: 'size-4',
        input: 'px-2.5 py-1.5 text-sm/4',
        leading: 'ps-2.5',
        trailing: 'gap-1.5 pe-2.5',
        leadingIcon: 'size-4',
        trailingIcon: 'size-4'
      },
      md: {
        clearAction: 'size-5',
        calendarAction: 'size-5',
        input: 'px-2.5 py-1.5 text-base/5 md:text-sm',
        leading: 'ps-2.5',
        trailing: 'gap-1.5 pe-2.5',
        leadingIcon: 'size-5',
        trailingIcon: 'size-5'
      },
      lg: {
        clearAction: 'size-5',
        calendarAction: 'size-5',
        input: 'px-3 py-2 text-base/5 md:text-sm',
        leading: 'ps-3',
        trailing: 'gap-2 pe-3',
        leadingIcon: 'size-5',
        trailingIcon: 'size-5'
      },
      xl: {
        clearAction: 'size-6',
        calendarAction: 'size-6',
        input: 'px-3 py-2 text-base',
        leading: 'ps-3',
        trailing: 'gap-2 pe-3',
        leadingIcon: 'size-6',
        trailingIcon: 'size-6'
      }
    },
    variant: {
      outline: {
        root: 'bg-default ring ring-inset ring-accented'
      },
      soft: {
        root: 'bg-elevated/50 hover:bg-elevated focus-within:bg-elevated'
      },
      subtle: {
        root: 'bg-elevated ring ring-inset ring-accented'
      },
      ghost: {
        root: 'bg-transparent hover:bg-elevated focus-within:bg-elevated'
      },
      link: {
        root: 'bg-transparent'
      },
      solid: {
        root: 'bg-default ring ring-inset ring-accented'
      }
    },
    color: {
      primary: {
        root: 'outline-primary/25 has-focus-visible:outline-3 focus-within:ring-primary'
      },
      secondary: {
        root: 'outline-secondary/25 has-focus-visible:outline-3 focus-within:ring-secondary'
      },
      info: {
        root: 'outline-info/25 has-focus-visible:outline-3 focus-within:ring-info'
      },
      success: {
        root: 'outline-success/25 has-focus-visible:outline-3 focus-within:ring-success'
      },
      warning: {
        root: 'outline-warning/25 has-focus-visible:outline-3 focus-within:ring-warning'
      },
      danger: {
        root: 'outline-danger/25 has-focus-visible:outline-3 focus-within:ring-danger'
      },
      error: {
        root: 'outline-error/25 has-focus-visible:outline-3 focus-within:ring-error'
      },
      neutral: {
        root: 'outline-inverted/25 has-focus-visible:outline-3 focus-within:ring-inverted'
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

  ],
  defaultVariants: {
    size: 'md',
    color: 'neutral',
    variant: 'outline'
  }
});

export default theme;
