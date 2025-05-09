import { tv } from 'tailwind-variants';

export default tv({
  slots: {
    base: [
      'relative group rounded-md inline-flex items-center focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-75',
      'transition-colors'
    ],
    content: [
      'max-h-60 bg-default shadow-lg rounded-md ring ring-default overflow-hidden pointer-events-auto',
      'data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in]',
      'w-(--reka-combobox-trigger-width) origin-(--reka-combobox-content-transform-origin)'
    ],
    viewport: 'scroll-py-1',
    group: 'p-1 isolate',
    value: 'truncate pointer-events-none',
    placeholder: 'truncate text-dimmed',
    label: 'font-semibold text-highlighted',
    separator: '-mx-1 my-1 h-px bg-border',
    item: [
      'group relative w-full flex items-center select-none outline-none text-default',
      'before:absolute before:z-[-1] before:inset-px before:rounded-md',
      'data-highlighted:not-data-disabled:text-highlighted data-highlighted:not-data-disabled:before:bg-elevated/50',
      'data-disabled:cursor-not-allowed data-disabled:opacity-75',
      'transition-colors before:transition-colors'
    ],
    itemLeadingIcon: [
      'shrink-0 text-dimmed group-data-highlighted:not-group-data-disabled:text-default',
      'transition-colors'
    ],
    itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    itemTrailingIcon: 'shrink-0',
    itemLabel: 'truncate',
    empty: 'py-2 text-center text-sm text-muted',
    input: 'border-default border-t-transparent border-x-transparent border-b',
    loading: 'relative w-full flex justify-center items-center gap-x-1.5 p-2',
    loadingSpinner: 'inline-flex grow-0 shrink-0',
    loadingIcon: 'animate-spin',
    loadingLabel: 'inline-flex text-sm text-slate-500 loading-text'
  },
  variants: {
    buttonGroup: {
      horizontal: 'not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none',
      vertical: 'not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none'
    },
    size: {
      xs: {
        base: 'px-2 py-1 text-xs gap-1',
        label: 'p-1 text-[10px]/3 gap-1',
        item: 'p-1 text-xs gap-1',
        itemLeadingIcon: 'size-4',
        itemTrailingIcon: 'size-4'
      },
      sm: {
        base: 'px-2.5 py-1.5 text-xs gap-1.5',
        label: 'p-1.5 text-[10px]/3 gap-1.5',
        item: 'p-1.5 text-xs gap-1.5',
        itemLeadingIcon: 'size-4',
        itemTrailingIcon: 'size-4'
      },
      md: {
        base: 'px-2.5 py-1.5 text-sm gap-1.5',
        label: 'p-1.5 text-xs gap-1.5',
        item: 'p-1.5 text-sm gap-1.5',
        itemLeadingIcon: 'size-5',
        itemTrailingIcon: 'size-5'
      },
      lg: {
        base: 'px-3 py-2 text-sm gap-2',
        label: 'p-2 text-xs gap-2',
        item: 'p-2 text-sm gap-2',
        itemLeadingIcon: 'size-5',
        itemTrailingIcon: 'size-5'
      },
      xl: {
        base: 'px-3 py-2 text-base gap-2',
        label: 'p-2 text-sm gap-2',
        item: 'p-2 text-base gap-2',
        itemLeadingIcon: 'size-6',
        itemTrailingIcon: 'size-6'
      }
    },
    variant: {
      outline: 'text-highlighted bg-default ring ring-inset ring-accented',
      soft: 'text-highlighted bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50',
      subtle: 'text-highlighted bg-elevated ring ring-inset ring-accented',
      ghost: 'text-highlighted bg-transparent hover:bg-elevated focus:bg-elevated disabled:bg-transparent dark:disabled:bg-transparent',
      none: 'text-highlighted bg-transparent'
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      info: '',
      warning: '',
      error: '',
      neutral: ''
    },
    loading: {
      true: ''
    },
    highlight: {
      true: ''
    }
  },
  compoundVariants: [
    {
      color: 'primary',
      variant: [
        'outline',
        'subtle'
      ],
      class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary'
    },
    {
      color: 'primary',
      highlight: true,
      class: 'ring ring-inset ring-primary'
    },
    {
      color: 'neutral',
      variant: [
        'outline',
        'subtle'
      ],
      class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted'
    },
    {
      color: 'neutral',
      highlight: true,
      class: 'ring ring-inset ring-inverted'
    }
  ],
  defaultVariants: {
    size: 'md',
    color: 'primary',
    variant: 'outline'
  }
});
