import { tv } from 'tailwind-variants';
import type { VariantProps } from 'tailwind-variants';

const theme = tv({
  slots: {
    root: [
      'relative w-full group rounded-md inline-flex items-center',
      'focus:outline-none disabled:cursor-not-allowed disabled:opacity-75',
      'transition-colors'
    ],
    base: [
      'w-full rounded-md transition-colors bg-default ring ring-inset ring-accented border-0',
      'text-sm text-highlighted px-2.5 py-1.5 gap-1.5',
      'placeholder:text-dimmed disabled:cursor-not-allowed disabled:opacity-75',
      'focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary pe-9'
    ],
    value: 'truncate pointer-events-none',
    placeholder: 'truncate text-dimmed',
    leading: 'absolute inset-y-0 start-0 flex items-center',
    leadingIcon: 'shrink-0 text-dimmed',
    trailing: 'group absolute inset-y-0 end-0 flex items-center disabled:cursor-not-allowed disabled:opacity-75',
    trailingIcon: 'shrink-0 text-dimmed',
    content: [
      'max-h-60 w-(--reka-combobox-trigger-width) bg-default shadow-lg rounded-md ring ring-default overflow-hidden',
      'data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in]',
      'origin-(--reka-combobox-content-transform-origin) pointer-events-auto'
    ],
    viewport: 'scroll-py-1',
    group: 'p-1 isolate',
    label: 'font-semibold text-highlighted',
    separator: '-mx-1 my-1 h-px bg-border',
    item: [
      'group relative w-full flex items-center gap-1.5 p-1.5 text-sm select-none outline-none',
      'before:absolute before:z-[-1] before:inset-px before:rounded-md text-default',
      'data-disabled:cursor-not-allowed data-disabled:opacity-75',
      'data-highlighted:not-data-disabled:text-highlighted data-highlighted:not-data-disabled:before:bg-elevated/50',
      'transition-colors before:transition-colors'
    ],
    itemLeadingIcon: ['shrink-0 text-dimmed group-data-highlighted:not-group-data-disabled:text-default', 'transition-colors'],
    itemLeadingAvatar: 'shrink-0',
    itemLeadingAvatarSize: '',
    itemLeadingChip: 'shrink-0',
    itemLeadingChipSize: '',
    itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    itemTrailingIcon: 'shrink-0',
    itemLabel: 'truncate',
    tagsItem: [
      'rounded-sm font-medium inline-flex items-center gap-0.5 ring ring-inset ring-primary bg-elevated',
      'text-default px-1.5 py-0.5 data-disabled:cursor-not-allowed data-disabled:opacity-75',
      'data-[state=active]:bg-accented'
    ],
    tagsItemText: 'truncate',
    tagsItemDelete: [
      'inline-flex items-center rounded-xs text-dimmed hover:text-default hover:bg-accented/75 disabled:pointer-events-none',
      'transition-colors'
    ],
    tagsItemDeleteIcon: '',
    tagsInput: 'relative inline-flex grow shrink',
    tagsInputInput: 'grow shrink peer',
    tagsInputLeading: 'absolute inset-y-0 start-0 flex items-center text-dimmed',
    tagsInputLeadingIcon: '',
    empty: 'py-2 text-center text-sm text-muted',
    searchInput: 'border-default border-t-transparent border-x-transparent border-b',
    loading: 'relative w-full flex justify-center items-center gap-x-1.5 p-2',
    loadingSpinner: 'inline-flex grow-0 shrink-0',
    loadingIcon: 'animate-spin',
    loadingLabel: 'inline-flex text-sm text-slate-500 loading-text'
  },
  variants: {
    buttonGroup: {
      horizontal: {
        root: 'group',
        base: 'group-not-only:group-first:rounded-e-none group-not-only:group-last:rounded-s-none group-not-last:group-not-first:rounded-none'
      },
      vertical: {
        root: 'group',
        base: 'group-not-only:group-first:rounded-b-none group-not-only:group-last:rounded-t-none group-not-last:group-not-first:rounded-none'
      }
    },
    multiple: {
      true: {
        root: 'flex-wrap',
        tagsInputInput: 'border-0 bg-transparent placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75'
      },
      false: {
        base: 'w-full inline-flex border-0 placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75'
      }
    },
    size: {
      xs: {
        base: 'px-2 py-1 text-xs gap-1',
        leading: 'ps-2',
        trailing: 'pe-2',
        leadingIcon: 'size-4',
        trailingIcon: 'size-4',
        label: 'p-1 text-[10px]/3 gap-1',
        item: 'p-1 text-xs gap-1',
        itemLeadingIcon: 'size-4',
        itemTrailingIcon: 'size-4',
        tagsItem: 'text-[10px]/3',
        tagsInputLeadingIcon: 'size-3',
        tagsItemDeleteIcon: 'size-3'
      },
      sm: {
        base: 'px-2.5 py-1.5 text-xs gap-1.5',
        leading: 'ps-2.5',
        trailing: 'pe-2.5',
        leadingIcon: 'size-4',
        trailingIcon: 'size-4',
        label: 'p-1.5 text-[10px]/3 gap-1.5',
        item: 'p-1.5 text-xs gap-1.5',
        itemLeadingIcon: 'size-4',
        itemTrailingIcon: 'size-4',
        tagsItem: 'text-[10px]/3',
        tagsInputLeadingIcon: 'size-3',
        tagsItemDeleteIcon: 'size-3'
      },
      md: {
        base: 'px-2.5 py-1.5 text-sm gap-1.5',
        leading: 'ps-2.5',
        trailing: 'pe-2.5',
        leadingIcon: 'size-5',
        trailingIcon: 'size-5',
        label: 'p-1.5 text-xs gap-1.5',
        item: 'p-1.5 text-sm gap-1.5',
        itemLeadingIcon: 'size-5',
        itemTrailingIcon: 'size-5',
        tagsItem: 'text-xs',
        tagsInputLeadingIcon: 'size-4',
        tagsItemDeleteIcon: 'size-3.5'
      },
      lg: {
        base: 'px-3 py-2 text-sm gap-2',
        leading: 'ps-3',
        trailing: 'pe-3',
        leadingIcon: 'size-5',
        trailingIcon: 'size-5',
        label: 'p-2 text-xs gap-2',
        item: 'p-2 text-sm gap-2',
        itemLeadingIcon: 'size-5',
        itemTrailingIcon: 'size-5',
        tagsItem: 'text-xs',
        tagsInputLeadingIcon: 'size-5',
        tagsItemDeleteIcon: 'size-3.5'
      },
      xl: {
        base: 'px-3 py-2 text-base gap-2',
        leading: 'ps-3',
        trailing: 'pe-3',
        leadingIcon: 'size-6',
        trailingIcon: 'size-6',
        label: 'p-2 text-sm gap-2',
        item: 'p-2 text-base gap-2',
        itemLeadingIcon: 'size-6',
        itemTrailingIcon: 'size-6',
        tagsItem: 'text-sm',
        tagsInputLeadingIcon: 'size-6',
        tagsItemDeleteIcon: 'size-4'
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
      danger: '',
      neutral: ''
    },
    leading: {
      true: ''
    },
    trailing: {
      true: ''
    },
    loading: {
      true: ''
    },
    highlight: {
      true: ''
    },
    tagsInputIcon: {
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
      class: 'focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary'
    },
    {
      color: 'primary',
      multiple: true,
      variant: [
        'outline',
        'subtle'
      ],
      class: 'has-focus-visible:ring-1 has-focus-visible:ring-primary'
    },
    {
      color: 'primary',
      highlight: true,
      class: 'ring ring-inset ring-primary'
    },
    {
      color: 'primary',
      class: {
        tagsInputLeading: 'peer-[:focus]:text-primary'
      }
    },
    {
      color: 'error',
      class: {
        base: 'ring ring-inset ring-error',
        tagsInputLeading: 'peer-[:focus]:text-error'
      }
    },
    {
      color: 'neutral',
      variant: [
        'outline',
        'subtle'
      ],
      class: 'focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-inverted'
    },
    {
      color: 'neutral',
      multiple: true,
      variant: [
        'outline',
        'subtle'
      ],
      class: 'has-focus-visible:ring-1 has-focus-visible:ring-inverted'
    },
    {
      color: 'neutral',
      highlight: true,
      class: 'ring ring-inset ring-inverted'
    },
    {
      color: 'neutral',
      class: {
        tagsInputLeading: 'peer-[:focus]:text-(--ui-border-inverted)'
      }
    },
    {
      leading: true,
      size: 'xs',
      class: 'ps-7'
    },
    {
      leading: true,
      size: 'sm',
      class: 'ps-8'
    },
    {
      leading: true,
      size: 'md',
      class: 'ps-9'
    },
    {
      leading: true,
      size: 'lg',
      class: 'ps-10'
    },
    {
      leading: true,
      size: 'xl',
      class: 'ps-11'
    },
    {
      trailing: true,
      size: 'xs',
      class: 'pe-7'
    },
    {
      trailing: true,
      size: 'sm',
      class: 'pe-8'
    },
    {
      trailing: true,
      size: 'md',
      class: 'pe-9'
    },
    {
      trailing: true,
      size: 'lg',
      class: 'pe-10'
    },
    {
      trailing: true,
      size: 'xl',
      class: 'pe-11'
    },
    {
      loading: true,
      leading: true,
      class: {
        leadingIcon: 'animate-spin'
      }
    },
    {
      loading: true,
      leading: false,
      trailing: true,
      class: {
        trailingIcon: 'animate-spin'
      }
    },
    {
      tagsInputIcon: true,
      size: ['xs', 'sm'],
      class: {
        tagsInputInput: 'ps-4'
      }
    },
    {
      tagsInputIcon: true,
      size: 'md',
      class: {
        tagsInputInput: 'ps-5'
      }
    },
    {
      tagsInputIcon: true,
      size: 'lg',
      class: {
        tagsInputInput: 'ps-6'
      }
    },
    {
      tagsInputIcon: true,
      size: 'xl',
      class: {
        tagsInputInput: 'ps-7'
      }
    }
  ],
  defaultVariants: {
    color: 'primary',
    size: 'md',
    variant: 'outline'
  }
});

export type MultiSelectColor = VariantProps<typeof theme>['color'];

export type MultiSelectSize = VariantProps<typeof theme>['size'];

export type MultiSelectVariant = VariantProps<typeof theme>['variant'];

export default theme;
