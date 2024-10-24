export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      secondary: 'secondary',
      info: 'info',
      success: 'success',
      warning: 'warning',
      danger: 'danger',
      neutral: 'slate'
    },
    icons: {
      loading: 'lucide:loader'
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
        base: 'focus-visible:outline-1 border border-[var(--ui-border-accented)] ring-0'
      },
      variants: {
        color: {
          primary: {
            indicator: 'after:bg-[var(--ui-primary)] bg-white'
          },
          secondary: {
            indicator: 'after:bg-[var(--ui-secondary)] bg-white'
          },
          success: {
            indicator: 'after:bg-[var(--ui-success)] bg-white'
          },
          info: {
            indicator: 'after:bg-[var(--ui-info)] bg-white'
          },
          warning: {
            indicator: 'after:bg-[var(--ui-warning)] bg-white'
          },
          error: {
            indicator: 'after:bg-[var(--ui-error)] bg-white'
          },
          neutral: {
            indicator: 'after:bg-[var(--ui-neutral)] bg-white'
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
