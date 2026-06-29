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
    editor: {
      slots: {
        base: [
          '*:my-2',
          // Paragraph
          '[&_p]:leading-5',
          // Tables
          '[&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:rounded-md',
          '[&_th]:py-3 [&_th]:px-4 [&_th]:font-semibold [&_th]:text-sm [&_th]:text-left [&_th]:bg-muted/50 [&_th]:border-t [&_th]:border-b [&_th]:border-e [&_th]:first:border-s [&_th]:border-muted',
          '[&_th_p]:my-0 [&_th_p]:leading-5',
          '[&_td]:py-3 [&_td]:px-4 [&_td]:text-sm [&_td]:text-left [&_td]:border-b [&_td]:border-e [&_td]:first:border-s [&_td]:border-muted',
          '[&_td_p]:my-0 [&_td_p]:leading-5 [&_td_code]:text-xs/5 [&_td_ul]:my-0 [&_td_ol]:my-0 [&_td_ul]:ps-4.5 [&_td_ol]:ps-4.5 [&_td_li]:leading-6 [&_td_li]:my-0.5',
          '[&_tr:first-child_th:first-child]:rounded-tl-md [&_tr:first-child_th:last-child]:rounded-tr-md [&_tr:last-child_td:first-child]:rounded-bl-md [&_tr:last-child_td:last-child]:rounded-br-md',
          '[&_.selectedCell]:bg-primary/10 [&_.selectedCell]:ring-2 [&_.selectedCell]:ring-primary [&_.selectedCell]:ring-inset'
        ]
      }
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
