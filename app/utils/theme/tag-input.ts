import { tv, type VariantProps } from 'tailwind-variants';

const theme = tv({
  slots: {
    base: [
      'w-full inline-flex flex-wrap rounded-md transition-colors bg-default',
      'text-sm text-highlighted px-2.5 py-1.5 gap-1.5',
      'placeholder:text-dimmed disabled:cursor-not-allowed disabled:opacity-75'
    ],
    item: [
      'rounded-sm font-medium inline-flex items-center gap-0.5 ring ring-inset ring-primary bg-primary-100',
      'text-default px-1.5 py-0.5 data-disabled:cursor-not-allowed data-disabled:opacity-75',
      'data-[state=active]:bg-primary-200'
    ],
    itemText: 'truncate',
    itemDelete: [
      'inline-flex items-center rounded-xs text-dimmed hover:text-default hover:bg-accented/75 disabled:pointer-events-none',
      'transition-colors'
    ],
    itemDeleteIcon: '',
    wrapper: 'relative inline-flex grow shrink',
    input: 'grow shrink bg-transparent peer placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75',
    leading: 'absolute inset-y-0 start-0 flex items-center text-dimmed',
    leadingIcon: ''
  },
  variants: {
    buttonGroup: {
      horizontal: {
        base: 'not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none'
      },
      vertical: {
        base: 'not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none'
      }
    },
    size: {
      xs: {
        base: 'px-2 py-1 text-xs gap-1',
        leadingIcon: 'size-3',
        item: 'text-[10px]/3',
        itemDeleteIcon: 'size-3'
      },
      sm: {
        base: 'px-2.5 py-1.5 text-xs gap-1.5',
        leadingIcon: 'size-3',
        item: 'text-[10px]/3',
        itemDeleteIcon: 'size-3'
      },
      md: {
        base: 'px-2.5 py-1.5 text-sm gap-1.5',
        leadingIcon: 'size-4',
        item: 'text-xs',
        itemDeleteIcon: 'size-3.5'
      },
      lg: {
        base: 'px-3 py-2 text-sm gap-2',
        leadingIcon: 'size-5',
        item: 'text-xs',
        itemDeleteIcon: 'size-3.5'
      },
      xl: {
        base: 'px-3 py-2 text-base gap-2',
        leadingIcon: 'size-6',
        item: 'text-sm',
        itemDeleteIcon: 'size-4'
      }
    },
    variant: {
      outline: 'text-highlighted bg-default ring ring-inset ring-accented',
      soft: 'text-highlighted bg-elevated/50 hover:bg-elevated data-[state=focus]:bg-elevated disabled:bg-elevated/50',
      subtle: 'text-highlighted bg-elevated ring ring-inset ring-accented',
      ghost: 'text-highlighted bg-transparent hover:bg-elevated data-[state=focus]:bg-elevated disabled:bg-transparent',
      none: 'text-highlighted bg-transparent'
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      info: '',
      warning: '',
      error: '',
      danger: '',
      neutral: ''
    },
    leading: {
      true: ''
    }
  },
  compoundVariants: [
    {
      color: 'primary',
      class: {
        leading: 'peer-[:focus]:text-primary'
      }
    },
    {
      color: 'primary',
      variant: ['outline', 'subtle'],
      class: {
        base: 'data-[state=focus]:ring-primary'
      }
    },
    {
      color: 'error',
      class: {
        leading: 'peer-[:focus]:text-error'
      }
    },
    {
      color: 'error',
      variant: ['outline', 'subtle'],
      class: {
        base: 'ring-error'
      }
    },
    {
      color: 'neutral',
      class: {
        leading: 'peer-[:focus]:text-(--ui-border-inverted)'
      }
    },
    {
      leading: true,
      size: ['xs', 'sm'],
      class: {
        input: 'ps-4'
      }
    },
    {
      leading: true,
      size: 'md',
      class: {
        input: 'ps-5'
      }
    },
    {
      leading: true,
      size: 'lg',
      class: {
        input: 'ps-6'
      }
    },
    {
      leading: true,
      size: 'xl',
      class: {
        input: 'ps-7'
      }
    }
  ],
  defaultVariants: {
    color: 'primary',
    size: 'md',
    variant: 'outline'
  }
});

export type TagInputColor = VariantProps<typeof theme>['color'];

export type TagInputSize = VariantProps<typeof theme>['size'];

export type TagInputVariant = VariantProps<typeof theme>['variant'];

export default theme;
