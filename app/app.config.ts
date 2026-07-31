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
            indicator: 'after:bg-(--ui-primary) bg-default'
          },
          secondary: {
            indicator: 'after:bg-(--ui-secondary) bg-default'
          },
          success: {
            indicator: 'after:bg-(--ui-success) bg-default'
          },
          info: {
            indicator: 'after:bg-(--ui-info) bg-default'
          },
          warning: {
            indicator: 'after:bg-(--ui-warning) bg-default'
          },
          error: {
            indicator: 'after:bg-(--ui-error) bg-default'
          },
          neutral: {
            indicator: 'after:bg-(--ui-neutral) bg-default'
          }
        },
        size: {
          xs: {
            indicator: 'after:size-2'
          },
          sm: {
            indicator: 'after:size-2'
          },
          md: {
            indicator: 'after:size-2.5'
          },
          lg: {
            indicator: 'after:size-3'
          },
          xl: {
            indicator: 'after:size-3'
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
