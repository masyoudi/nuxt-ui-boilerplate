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
      'ease-[cubic-bezier(0.5,1,0.89,1)]',
      'duration-200',
      'border-r',
      'border-r-default',
      'z-20'
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
      'gap-x-1.5'
    ],
    menuLabel: 'inline-flex items-center grow shrink font-medium',
    menuIcon: 'inline-flex items-center grow-0 shrink-0'
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
        menu: 'bg-primary-100 dark:bg-primary-400/10 text-primary dark:text-primary-300'
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
