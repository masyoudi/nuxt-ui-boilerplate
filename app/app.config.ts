export default defineAppConfig({
  ui: {
    primary: 'main',
    button: {
      default: {
        size: 'md'
      }
    },
    checkbox: {
      base: 'w-[1.15rem] h-[1.15rem]'
    },
    container: {
      constrained: 'max-w-[90rem]'
    },
    dropdown: {
      item: {
        base: 'select-none'
      }
    },
    formGroup: {
      error: 'mt-0.5 text-xs form-field-error'
    },
    modal: {
      wrapper: 'z-[58]'
    },
    notifications: {
      wrapper: 'z-[60]',
      position: 'top-0 right-0 bottom-[unset]'
    },
    input: {
      color: {
        white: {
          outline: 'focus:ring-1'
        }
      },
      variant: {
        outline: 'focus:ring-1'
      },
      default: {
        size: 'lg'
      }
    },
    popover: {
      background: 'dark:bg-gray-800'
    },
    select: {
      color: {
        white: {
          outline: 'focus:ring-1'
        }
      },
      variant: {
        outline: 'focus:ring-1'
      },
      default: {
        size: 'md'
      }
    },
    selectMenu: {
      variant: {
        outline: 'focus:ring-1'
      }
    },
    table: {
      td: {
        base: 'whitespace-normal',
        color: 'text-slate-500'
      }
    },
    sidebar: {
      base: 'fixed top-0 lg:left-0 bottom-0 flex flex-col w-[265px] z-[57] transition-all border-r dark:border-slate-700 transform duration-300',
      background: 'bg-white dark:bg-slate-900',
      shadow: 'shadow-[0_3px_16px_rgba(0,0,0,0.04)]',
      width: {
        normal: 'w-[265px]',
        mini: 'lg:w-[70px]'
      },
      placing: {
        default: 'lg:left-0',
        normal: 'left-0',
        mobile: '-left-[265px]'
      },
      overlay: {
        base: 'fixed lg:hidden lg:pointer-events-none inset-0 bg-slate-700/30 dark:bg-black/50 z-[56]',
        transition: {
          enter: 'ease-out duration-300',
          enterFrom: 'opacity-0',
          enterTo: 'opacity-100',
          leave: 'ease-in duration-200',
          leaveFrom: 'opacity-100',
          leaveTo: 'opacity-0'
        }
      },
      constraint: {
        padding: {
          normal: 'lg:pl-[265px]',
          mini: 'lg:pl-[70px]'
        }
      }
    },
    navbar: {
      base: 'sticky flex items-center top-0 left-0 right-0 border-b dark:border-slate-700 z-[55]',
      height: 'h-16',
      padding: 'px-4',
      background: 'bg-white dark:bg-slate-900',
      shadow: 'shadow-[0_3px_16px_rgba(142,134,171,0.05)]',
      section: 'flex items-center grow shrink gap-x-2 h-full',
      item: 'inline-flex items-center'
    },
    navMenu: {
      base: 'flex items-center gap-x-2 select-none cursor-pointer',
      rounded: 'rounded-md',
      color: 'text-slate-500',
      padding: 'px-2 py-1.5',
      active: {
        background: 'bg-slate-100 dark:bg-slate-800',
        color: 'text-primary-500'
      },
      inactive: 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300',
      text: 'inline-flex grow shrink text-sm font-medium truncate',
      icon: {
        wrapper: 'inline-flex grow-0 shrink-0',
        size: 'w-5 h-5'
      }
    },
    taginput: {
      root: 'relative w-full',
      base: 'flex flex-wrap',
      background: 'bg-white dark:bg-gray-800',
      rounded: 'rounded-md',
      size: {
        '2xs': 'text-xs',
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-sm',
        xl: 'text-base'
      },
      gap: {
        '2xs': 'gap-1',
        xs: 'gap-1.5',
        sm: 'gap-1.5',
        md: 'gap-1.5',
        lg: 'gap-2.5',
        xl: 'gap-2.5'
      },
      padding: {
        '2xs': 'px-2 py-1',
        xs: 'px-2.5 py-[0.3125rem]',
        sm: 'px-2.5 py-[0.3125rem]',
        md: 'px-3 py-[0.4375rem]',
        lg: 'px-3.5 py-[0.5625rem]',
        xl: 'px-3.5 py-[0.5625rem]'
      },
      color: {
        white: {
          outline:
            'bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus-within:ring-primary-500 dark:focus-within:ring-primary-400'
        },
        gray: {
          outline:
            'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus-within:ring-primary-500 dark:focus-within:ring-primary-400'
        }
      },
      variant: {
        outline:
          'bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-{color}-500 dark:ring-{color}-400 focus-within:ring-{color}-500 dark:focus-within:ring-{color}-400',
        none: 'bg-transparent focus:ring-0 focus:shadow-none'
      },
      input: {
        wrapper: 'relative inline-flex grow shrink',
        base: 'w-full outline-none py-px bg-transparent',
        placeholder: 'placeholder-gray-400 dark:placeholder-gray-500',
        autocomplete: 'pointer-events-none'
      },
      tag: {
        base: 'inline-flex items-center max-w-full whitespace-nowrap select-none gap-1',
        background: 'bg-slate-200 dark:bg-slate-700',
        rounded: 'rounded',
        padding: {
          '2xs': 'px-1.5 py-px',
          xs: 'px-1.5 py-px',
          sm: 'px-1.5 py-px',
          md: 'px-1.5 py-px',
          lg: 'px-2.5 py-[0.210rem]',
          xl: 'px-2.5 py-1'
        },
        label: 'inline-flex items-center truncate h-full overflow-hidden leading-[1]',
        close: 'inline-flex grow-0 shrink-0 cursor-pointer'
      },
      default: {
        size: 'sm',
        color: 'white',
        variant: 'outline'
      }
    }
  }
});
