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
    icons: {
      loading: 'lucide:loader'
    },
    button: {
      compoundVariants: [
        {
          variant: 'outline',
          color: 'error',
          class: 'ring-(--ui-error)'
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
        base: 'focus-visible:outline-1 border border-accented ring-0'
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
            indicator: 'after:size-2' as typeof radioIndicator[number]
          },
          sm: {
            indicator: 'after:size-2' as typeof radioIndicator[number]
          },
          md: {
            indicator: 'after:size-2.5' as typeof radioIndicator[number]
          },
          lg: {
            indicator: 'after:size-3' as typeof radioIndicator[number]
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
