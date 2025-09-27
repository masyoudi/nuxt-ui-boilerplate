import { tv } from 'tailwind-variants';

const theme = tv({
  slots: {
    base: 'block backdrop-blur-sm',
    wrapper: 'relative flex w-full min-h-screen justify-center items-center',
    content: 'relative w-full bg-(--ui-bg) ring ring-transparent dark:ring-accented rounded-xl shadow shadow-black/8 outline-none',
    card: 'ring-0',
    header: 'sm:px-6',
    body: 'sm:p-6',
    footer: 'flex justify-end gap-x-4 sm:px-6',
    close: 'absolute inline-flex justify-center items-center top-2 right-2'
  },
  variants: {
    fullscreen: {
      true: {
        base: 'overflow-y-hidden',
        wrapper: 'overflow-hidden px-0 py-0',
        content: 'max-w-full h-screen rounded-none p-0'
      },
      false: {
        base: 'overflow-y-auto',
        wrapper: 'py-3 px-4',
        content: 'max-w-xl p-5'
      }
    },
    asCard: {
      true: {
        content: 'p-0'
      },
      false: {

      }
    }
  },
  compoundVariants: [
    {
      fullscreen: true,
      asCard: true,
      class: {
        card: 'flex flex-col h-screen rounded-none',
        header: 'grow-0 shrink-0',
        body: 'grow shrink overflow-y-auto',
        footer: 'grow-0 shrink-0'
      }
    }
  ]
});

export default theme;
