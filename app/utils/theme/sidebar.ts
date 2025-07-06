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
      'bg-(--ui-bg)',
      'shadow-md',
      'transition-[left,width]',
      'ease-[cubic-bezier(0.5,1,0.89,1)]',
      'duration-200',
      'border-r',
      'border-r-muted',
      'z-20'
    ],
    menuWrapper: 'w-full px-2 mb-1',
    menu: [
      'relative',
      'flex',
      'w-full',
      'min-h-8',
      'items-center',
      'rounded-md',
      'hover:bg-elevated',
      'cursor-pointer',
      'text-sm',
      'py-2',
      'gap-x-1.5'
    ],
    menuLabel: 'inline-flex items-center grow shrink',
    menuIcon: 'inline-flex items-center grow-0 shrink-0',
    toggle: [
      'absolute',
      'hidden',
      'lg:inline-flex',
      'justify-center',
      'items-center',
      'cursor-pointer',
      'shadow-xs',
      'ring',
      'ring-accented',
      'top-5',
      '-right-2.5',
      'rounded',
      'bg-muted',
      'p-1'
    ],
    toggleIcon: 'size-3 transition-transform duration-150'
  },
  variants: {
    open: {
      true: {
        root: 'left-0'
      }
    },
    mini: {
      true: {
        root: 'lg:w-[70px]',
        menu: 'lg:justify-center'
      }
    },
    menuActive: {
      true: {
        menu: 'bg-elevated text-(--ui-color-primary-500)'
      }
    },
    childVisible: {
      false: {
        menuLabel: 'lg:hidden'
      }
    }
  }
});

export default theme;
