import { tv } from 'tailwind-variants';

const theme = tv({
  slots: {
    root: [
      'absolute',
      'flex',
      'flex-col',
      'w-(--sidebar-width)',
      'inset-y-0',
      '-left-(--sidebar-width)',
      'lg:left-0',
      'bg-default dark:bg-elevated',
      'transition-[left,width]',
      'ease-(--sidebar-ease)',
      'duration-300',
      'overflow-hidden',
      'border-r',
      'border-r-default',
      'z-20'
    ],
    brandLabel: [
      'w-[200px] max-w-[200px] overflow-hidden whitespace-nowrap truncate text-lg font-bold text-primary',
      'transition-[max-width,opacity,transform] duration-200 ease-(--sidebar-ease)'
    ],
    menuWrapper: 'w-full px-3 mb-1',
    menu: [
      'relative',
      'flex',
      'w-full',
      'min-h-8',
      'items-center',
      'rounded-md',
      'hover:bg-primary-100 dark:hover:bg-primary-400/10 hover:text-primary dark:hover:text-primary-300',
      'cursor-pointer',
      'text-sm',
      'text-toned',
      'py-2',
      'gap-x-1.5',
      'transition-[gap] duration-200 ease-(--sidebar-ease)'
    ],
    menuLabel: [
      'inline-flex items-center grow shrink max-w-52 overflow-hidden whitespace-nowrap font-medium',
      'transition-[max-width,opacity,transform] duration-200 ease-(--sidebar-ease)'
    ],
    menuIcon: 'inline-flex items-center grow-0 shrink-0',
    menuTrailing: [
      'inline-flex items-center grow-0 shrink-0 max-w-5 overflow-hidden',
      'transition-[max-width,opacity,transform] duration-200 ease-(--sidebar-ease)'
    ],
    submenu: [
      'grid grid-rows-[1fr] overflow-hidden py-0.5 opacity-100',
      'transition-[grid-template-rows,opacity] duration-200 ease-(--sidebar-ease)'
    ]
  },
  variants: {
    open: {
      true: {
        root: 'left-0'
      }
    },
    mini: {
      true: {
        root: 'lg:w-(--sidebar-mini-width)',
        menu: 'lg:justify-center lg:gap-x-0'
      }
    },
    menuActive: {
      true: {
        menu: 'bg-primary-100 dark:bg-primary-400/10 text-primary dark:text-primary-300'
      }
    },
    expanded: {
      true: {
        brandLabel: 'lg:max-w-[200px] lg:opacity-100 lg:translate-x-0',
        menuLabel: 'lg:max-w-52 lg:opacity-100 lg:translate-x-0',
        menuTrailing: 'lg:max-w-5 lg:opacity-100 lg:translate-x-0',
        submenu: 'lg:grid-rows-[1fr] lg:opacity-100'
      },
      false: {
        brandLabel: 'lg:max-w-0 lg:opacity-0 lg:-translate-x-1',
        menuLabel: 'lg:max-w-0 lg:opacity-0 lg:-translate-x-1 lg:pointer-events-none',
        menuTrailing: 'lg:max-w-0 lg:opacity-0 lg:-translate-x-1 lg:pointer-events-none',
        submenu: 'lg:grid-rows-[0fr] lg:opacity-0 lg:pointer-events-none'
      }
    }
  }
});

export default theme;
