// eslint-disable-next-line @typescript-eslint/no-unused-vars
const radioIndicator = [
  'start',
  'end',
  'hidden'
] as const;

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      secondary: 'secondary',
      info: 'info',
      success: 'success',
      warning: 'warning',
      danger: 'danger',
      error: 'danger',
      neutral: 'slate'
    },
    card: {
      variants: {
        variant: {
          outline: {
            root: 'dark:bg-elevated'
          }
        }
      }
    },
    icons: {
      arrowDown: 'ph:arrow-down-bold',
      arrowLeft: 'ph:arrow-left-bold',
      arrowRight: 'ph:arrow-right-bold',
      arrowUp: 'ph:arrow-up-bold',
      caution: 'ph:warning-circle-bold',
      check: 'ph:check-bold',
      chevronDoubleLeft: 'ph:caret-double-left-bold',
      chevronDoubleRight: 'ph:caret-double-right-bold',
      chevronDown: 'ph:caret-down-bold',
      chevronLeft: 'ph:caret-left-bold',
      chevronRight: 'ph:caret-right-bold',
      chevronUp: 'ph:caret-up-bold',
      close: 'ph:x-bold',
      copy: 'ph:copy-simple-bold',
      copyCheck: 'ph:check-square-offset-bold',
      dark: 'ph:moon-bold',
      drag: 'ph:dots-six-vertical-bold',
      ellipsis: 'ph:dots-three-bold',
      error: 'ph:x-circle-bold',
      external: 'ph:arrow-up-right-bold',
      eye: 'ph:eye-bold',
      eyeOff: 'ph:eye-closed-bold',
      file: 'ph:file-bold',
      folder: 'ph:folder-simple-bold',
      folderOpen: 'ph:folder-open-bold',
      hash: 'ph:hash-bold',
      info: 'ph:info-bold',
      light: 'ph:sun-bold',
      loading: 'ph:spinner-bold',
      menu: 'ph:list-bold',
      minus: 'ph:minus-bold',
      panelClose: 'ph:caret-line-left-bold',
      panelOpen: 'ph:caret-line-right-bold',
      plus: 'ph:plus-bold',
      reload: 'ph:arrow-counter-clockwise-bold',
      search: 'ph:magnifying-glass-bold',
      stop: 'ph:square-bold',
      star: 'ph:star-bold',
      success: 'ph:check-circle-bold',
      system: 'ph:monitor-bold',
      tip: 'ph:lightbulb-bold',
      upload: 'ph:upload-simple-bold',
      warning: 'ph:warning-bold'
    },
    button: {
      compoundVariants: [
        {
          variant: 'outline',
          color: 'error',
          class: 'ring-(--ui-error)'
        },
        {
          color: ['primary', 'secondary', 'success', 'warning', 'error', 'danger'],
          class: 'dark:text-default'
        }
      ]
    },
    formField: {
      slots: {
        error: 'mt-0.5 text-xs form-field-error'
      }
    },
    input: {
      variants: {
        variant: {
          outline: 'focus-visible:ring-1'
        }
      },
      compoundVariants: [
        {
          variant: 'outline',
          class: 'focus-visible:ring-1'
        }
      ]
    },
    radioGroup: {
      slots: {
        base: 'focus-visible:outline-1 border-2 border-(--ui-color-neutral-400) ring-0'
      },
      variants: {
        color: {
          primary: {
            indicator: 'after:bg-(--ui-primary) bg-default' as typeof radioIndicator[number]
          },
          secondary: {
            indicator: 'after:bg-(--ui-secondary) bg-default' as typeof radioIndicator[number]
          },
          success: {
            indicator: 'after:bg-(--ui-success) bg-default' as typeof radioIndicator[number]
          },
          info: {
            indicator: 'after:bg-(--ui-info) bg-default' as typeof radioIndicator[number]
          },
          warning: {
            indicator: 'after:bg-(--ui-warning) bg-default' as typeof radioIndicator[number]
          },
          error: {
            indicator: 'after:bg-(--ui-error) bg-default' as typeof radioIndicator[number]
          },
          neutral: {
            indicator: 'after:bg-(--ui-neutral) bg-default' as typeof radioIndicator[number]
          }
        },
        size: {
          xs: {
            indicator: 'after:size-1.5' as typeof radioIndicator[number]
          },
          sm: {
            indicator: 'after:size-2' as typeof radioIndicator[number]
          },
          md: {
            indicator: 'after:size-2' as typeof radioIndicator[number]
          },
          lg: {
            indicator: 'after:size-2.5' as typeof radioIndicator[number]
          },
          xl: {
            indicator: 'after:size-3' as typeof radioIndicator[number]
          }
        }
      }
    },
    textarea: {
      compoundVariants: [
        {
          class: 'focus-visible:ring-1'
        }
      ]
    }
  }
});
