import { tv, type VariantProps } from 'tailwind-variants';

const theme = tv({
  slots: {
    root: 'flex flex-col max-h-60 overflow-hidden bg-white rounded-lg mx-auto',
    inputWrapper: 'border-b border-(--ui-border)',
    input: [
      'w-full',
      'border-0',
      'placeholder:text-[var(--ui-text-dimmed)]',
      'focus:outline-none',
      'text-[var(--ui-text-highlighted)]',
      'text-sm',
      'bg-transparent',
      'px-2.5',
      'py-1.5'
    ],
    viewport: 'divide-y divide-(--ui-border) scroll-py-1 min-h-36 divide-y-0 overflow-y-auto scroll-mini',
    group: 'p-1 isolate',
    item: [
      'group',
      'relative',
      'w-full',
      'flex',
      'items-center',
      'select-none',
      'outline-none',
      'before:absolute',
      'before:z-[-1]',
      'before:inset-px',
      'before:rounded-[calc(var(--ui-radius)*1.5)]',
      'data-disabled:cursor-not-allowed',
      'data-disabled:opacity-75',
      'text-(--ui-text)',
      'data-highlighted:text-(--ui-text-highlighted)',
      'data-highlighted:before:bg-(--ui-bg-elevated)/50',
      'transition-colors',
      'before:transition-colors',
      'data-highlighted:before:z-[unset]'
    ],
    itemLabel: 'font-normal z-[2]',
    itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    itemTrailingIcon: 'shrink-0',
    empty: 'relative w-full py-8',
    emptyLabel: 'text-center text-sm text-slate-600',
    loading: 'relative w-full flex justify-center items-center gap-x-1.5 p-2',
    loadingSpinner: 'inline-flex grow-0 shrink-0',
    loadingIcon: 'animate-spin',
    loadingLabel: 'inline-flex text-sm text-slate-500 loading-text'
  },
  variants: {
    size: {
      xs: {
        input: 'px-2 py-1 text-xs gap-1',
        item: 'p-1 text-xs gap-1',
        itemTrailingIcon: 'size-4'
      },
      sm: {
        input: 'px-2.5 py-1.5 text-xs gap-1.5',
        item: 'p-1.5 text-xs gap-1.5',
        itemTrailingIcon: 'size-4'
      },
      md: {
        input: 'px-2.5 py-1.5 text-sm gap-1.5',
        item: 'p-1.5 text-sm gap-1.5',
        itemTrailingIcon: 'size-5'
      },
      lg: {
        input: 'px-3 py-2 text-sm gap-2',
        item: 'p-2 text-sm gap-2',
        itemTrailingIcon: 'size-5'
      },
      xl: {
        input: 'px-3 py-2 text-base gap-2',
        item: 'p-2 text-base gap-2',
        itemTrailingIcon: 'size-6'
      }
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export type ListboxSize = VariantProps<typeof theme>['size'];

export default theme;
