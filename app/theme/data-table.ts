import { tv } from 'tailwind-variants';

export const themeTable = tv({
  slots: {
    root: 'border-t border-t-default',
    base: '',
    caption: '',
    thead: '',
    tbody: '',
    tfoot: '',
    tr: 'data-[selected=true]:bg-transparent',
    th: 'bg-muted dark:bg-(--ui-color-neutral-950)',
    td: 'whitespace-normal',
    separator: '',
    empty: '',
    loading: ''
  },
  variants: {
    mobileCards: {
      true: {
        tr: 'block lg:table-row',
        th: 'hidden lg:table-cell',
        td: [
          'flex justify-between gap-2.5 lg:table-cell p-2.5 lg:p-4 text-right lg:text-left',
          '[&:has([role=checkbox])]:pe-2.5 lg:[&:has([role=checkbox])]:pe-0',
          'before:content-(--td-label) before:text-default before:font-semibold lg:before:content-[unset]'
        ]
      },
      false: {}
    },
    loading: {
      true: '',
      false: ''
    }
  },
  compoundVariants: [
    {
      mobileCards: true,
      loading: false,
      class: {
        separator: 'bg-transparent lg:bg-(--ui-border-accented)'
      }
    }
  ]
});

export const themeToolbar = tv({
  slots: {
    root: 'grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5',
    left: 'relative',
    leftWrapper: 'flex flex-wrap gap-3',
    right: 'relative',
    rightWrapper: 'flex flex-wrap justify-end gap-3'
  },
  variants: {
    asCard: {
      true: {
        root: 'px-5'
      },
      false: {
      }
    }
  }
});

export const themeCard = tv({
  slots: {
    root: 'w-full bg-white rounded-lg ring ring-default py-5'
  }
});
