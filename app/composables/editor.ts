import type { Editor, JSONContent } from '@tiptap/vue-3';
import type { EditorToolbarItem } from '@nuxt/ui';
import { mapEditorItems } from '@nuxt/ui/utils/editor';
import { upperFirst } from 'scule';

export function useEditorActions(editorRef: Ref<{ editor?: Editor } | undefined>) {
  const editor = computed(() => editorRef.value?.editor);
  const selectedNode = ref<{ node: JSONContent; pos: number }>();
  const markItems: EditorToolbarItem[] = [
    {
      kind: 'mark',
      mark: 'bold',
      icon: 'lucide:bold',
      tooltip: {
        text: 'Bold',
        kbds: ['meta', 'B']
      }
    },
    {
      kind: 'mark',
      mark: 'italic',
      icon: 'lucide:italic',
      tooltip: {
        text: 'Italic',
        kbds: ['meta', 'I']
      }
    },
    {
      kind: 'mark',
      mark: 'underline',
      icon: 'lucide:underline',
      tooltip: {
        text: 'Underline',
        kbds: ['meta', 'U']
      }
    },
    {
      kind: 'mark',
      mark: 'strike',
      icon: 'lucide:strikethrough',
      tooltip: {
        text: 'Strikethrough',
        kbds: ['meta', 'shift', 'S']
      }
    },
    {
      kind: 'subscript',
      icon: 'lucide:subscript',
      tooltip: {
        text: 'Subscript',
        kbds: ['meta', ',']
      }
    },
    {
      kind: 'superscript',
      icon: 'lucide:superscript',
      tooltip: {
        text: 'Superscript',
        kbds: ['meta', '.']
      }
    },
    {
      kind: 'mark',
      mark: 'code',
      icon: 'lucide:code',
      tooltip: {
        text: 'Inline Code',
        kbds: ['meta', 'E']
      }
    },
    {
      slot: 'color'
    },
    {
      slot: 'background'
    }
  ];

  const fixedToolbarItems: EditorToolbarItem[][] = [
    [
      {
        kind: 'undo',
        icon: 'lucide:undo',
        tooltip: {
          text: 'Undo',
          kbds: ['meta', 'z']
        }
      },
      {
        kind: 'redo',
        icon: 'lucide:redo',
        tooltip: {
          text: 'Redo',
          kbds: ['meta', 'y']
        }
      }
    ],
    [
      {
        icon: 'lucide:heading',
        trailingIcon: 'lucide:chevron-down',
        tooltip: {
          text: 'Headings'
        },
        content: {
          align: 'start'
        },
        ui: {
          base: 'gap-0.5'
        },
        items: [
          {
            kind: 'heading',
            level: 1,
            icon: 'lucide:heading-1',
            label: 'Heading 1'
          },
          {
            kind: 'heading',
            level: 2,
            icon: 'lucide:heading-2',
            label: 'Heading 2'
          },
          {
            kind: 'heading',
            level: 3,
            icon: 'lucide:heading-3',
            label: 'Heading 3'
          },
          {
            kind: 'heading',
            level: 4,
            icon: 'lucide:heading-4',
            label: 'Heading 4'
          }
        ]
      },
      {
        icon: 'lucide:list',
        trailingIcon: 'lucide:chevron-down',
        tooltip: {
          text: 'Lists'
        },
        content: {
          align: 'start'
        },
        ui: {
          base: 'gap-0.5'
        },
        items: [
          {
            kind: 'bulletList',
            icon: 'lucide:list',
            label: 'Bullet List'
          },
          {
            kind: 'orderedList',
            icon: 'lucide:list-ordered',
            label: 'Ordered List'
          }
        ]
      },
      {
        kind: 'blockquote',
        icon: 'lucide:text-quote',
        tooltip: {
          text: 'Blockquote',
          kbds: ['meta', 'shift', 'B']
        }
      },
      {
        kind: 'codeBlock',
        icon: 'lucide:square-code',
        tooltip: {
          text: 'Code Block',
          kbds: ['meta', 'alt', 'c']
        }
      }
    ],
    markItems,
    [
      {
        kind: 'table',
        slot: 'table' as const,
        icon: 'lucide:table',
        tooltip: {
          text: 'Table'
        }
      },
      {
        kind: 'imageUpload',
        icon: 'lucide:image',
        tooltip: {
          text: 'Image'
        }
      },
      {
        slot: 'link' as const,
        icon: 'lucide:link'
      }
    ],
    [
      {
        icon: 'lucide:align-justify',
        trailingIcon: 'lucide:chevron-down',
        tooltip: {
          text: 'Text Align'
        },
        content: {
          align: 'end'
        },
        ui: {
          base: 'gap-0.5'
        },
        items: [
          {
            kind: 'textAlign',
            align: 'left',
            icon: 'lucide:align-left',
            label: 'Align Left'
          },
          {
            kind: 'textAlign',
            align: 'center',
            icon: 'lucide:align-center',
            label: 'Align Center'
          },
          {
            kind: 'textAlign',
            align: 'right',
            icon: 'lucide:align-right',
            label: 'Align Right'
          },
          {
            kind: 'textAlign',
            align: 'justify',
            icon: 'lucide:align-justify',
            label: 'Align Justify'
          }
        ]
      }
    ]
  ];

  const bubbleToolbarItems: EditorToolbarItem[][] = [
    [
      {
        label: 'Turn into',
        trailingIcon: 'lucide:chevron-down',
        activeColor: 'neutral',
        activeVariant: 'ghost',
        tooltip: {
          text: 'Turn into'
        },
        content: {
          align: 'start'
        },
        ui: {
          label: 'text-xs'
        },
        items: [
          {
            type: 'label',
            label: 'Turn into'
          },
          {
            kind: 'paragraph',
            label: 'Paragraph',
            icon: 'lucide:type'
          },
          {
            kind: 'heading',
            level: 1,
            icon: 'lucide:heading-1',
            label: 'Heading 1'
          },
          {
            kind: 'heading',
            level: 2,
            icon: 'lucide:heading-2',
            label: 'Heading 2'
          },
          {
            kind: 'heading',
            level: 3,
            icon: 'lucide:heading-3',
            label: 'Heading 3'
          },
          {
            kind: 'heading',
            level: 4,
            icon: 'lucide:heading-4',
            label: 'Heading 4'
          },
          {
            kind: 'bulletList',
            icon: 'lucide:list',
            label: 'Bullet List'
          },
          {
            kind: 'orderedList',
            icon: 'lucide:list-ordered',
            label: 'Ordered List'
          },
          {
            kind: 'blockquote',
            icon: 'lucide:text-quote',
            label: 'Blockquote'
          },
          {
            kind: 'codeBlock',
            icon: 'lucide:square-code',
            label: 'Code Block'
          }
        ]
      }
    ],
    markItems,
    [
      {
        kind: 'table',
        icon: 'lucide:table'
      },
      {
        kind: 'imageUpload',
        icon: 'lucide:image',
        tooltip: {
          text: 'Image'
        }
      },
      {
        slot: 'link',
        icon: 'lucide:link'
      }
    ],
    [
      {
        icon: 'lucide:align-justify',
        trailingIcon: 'lucide:chevron-down',
        tooltip: {
          text: 'Text Align'
        },
        content: {
          align: 'end'
        },
        ui: {
          base: 'gap-0.5'
        },
        items: [
          {
            kind: 'textAlign',
            align: 'left',
            icon: 'lucide:align-left',
            label: 'Align Left'
          },
          {
            kind: 'textAlign',
            align: 'center',
            icon: 'lucide:align-center',
            label: 'Align Center'
          },
          {
            kind: 'textAlign',
            align: 'right',
            icon: 'lucide:align-right',
            label: 'Align Right'
          },
          {
            kind: 'textAlign',
            align: 'justify',
            icon: 'lucide:align-justify',
            label: 'Align Justify'
          }
        ]
      }
    ]
  ];

  const suggestionItems = [
    [
      {
        type: 'label' as const,
        label: 'Style'
      },
      {
        kind: 'paragraph',
        label: 'Paragraph',
        icon: 'lucide:type'
      },
      {
        kind: 'heading',
        level: 1,
        label: 'Heading 1',
        icon: 'lucide:heading-1'
      },
      {
        kind: 'heading',
        level: 2,
        label: 'Heading 2',
        icon: 'lucide:heading-2'
      },
      {
        kind: 'heading',
        level: 3,
        label: 'Heading 3',
        icon: 'lucide:heading-3'
      },
      {
        kind: 'bulletList',
        label: 'Bullet List',
        icon: 'lucide:list'
      },
      {
        kind: 'orderedList',
        label: 'Numbered List',
        icon: 'lucide:list-ordered'
      },
      {
        kind: 'blockquote',
        label: 'Blockquote',
        icon: 'lucide:text-quote'
      },
      {
        kind: 'codeBlock',
        label: 'Code Block',
        icon: 'lucide:square-code'
      }
    ],
    [
      {
        type: 'label' as const,
        label: 'Insert'
      },
      {
        kind: 'table',
        label: 'Table',
        icon: 'lucide:table'
      },
      {
        kind: 'imageUpload',
        label: 'Image',
        icon: 'lucide:image'
      },
      {
        kind: 'horizontalRule',
        label: 'Horizontal Rule',
        icon: 'lucide:separator-horizontal'
      }
    ]
  ];

  const tableToolbarItems: EditorToolbarItem[][] = [
    [
      {
        icon: 'lucide:between-vertical-start',
        tooltip: {
          text: 'Add row above'
        },
        onClick: () => {
          editor.value?.chain().focus().addRowBefore().run();
        }
      },
      {
        icon: 'lucide:between-vertical-end',
        tooltip: {
          text: 'Add row below'
        },
        onClick: () => {
          editor.value?.chain().focus().addRowAfter().run();
        }
      },
      {
        icon: 'lucide:between-horizontal-start',
        tooltip: {
          text: 'Add column before'
        },
        onClick: () => {
          editor.value?.chain().focus().addColumnBefore().run();
        }
      },
      {
        icon: 'lucide:between-horizontal-end',
        tooltip: {
          text: 'Add column after'
        },
        onClick: () => {
          editor.value?.chain().focus().addColumnAfter().run();
        }
      }
    ],
    [
      {
        icon: 'lucide:table-cells-merge',
        tooltip: {
          text: 'Merge cells'
        },
        onClick: () => {
          editor.value?.chain().focus().mergeCells().run();
        }
      },
      {
        icon: 'lucide:table-columns-split',
        tooltip: {
          text: 'Split cells'
        },
        onClick: () => {
          editor.value?.chain().focus().splitCell().run();
        }
      }
    ],
    [
      {
        icon: 'lucide:rows-3',
        tooltip: {
          text: 'Delete row'
        },
        onClick: () => {
          editor.value?.chain().focus().deleteRow().run();
        }
      },
      {
        icon: 'lucide:columns-3',
        tooltip: {
          text: 'Delete column'
        },
        onClick: () => {
          editor.value?.chain().focus().deleteColumn().run();
        }
      }
    ],
    [
      {
        icon: 'lucide:trash',
        tooltip: {
          text: 'Delete table'
        },
        onClick: () => {
          editor.value?.chain().focus().deleteTable().run();
        }
      }
    ]
  ];

  const dragHandleItems = computed<EditorToolbarItem[][]>(() => {
    const editor = editorRef.value?.editor;
    if (!editor || !selectedNode.value?.node?.type) {
      return [];
    }

    return mapEditorItems(editor, [
      [
        {
          type: 'label',
          label: upperFirst(selectedNode.value.node.type)
        },
        {
          label: 'Turn into',
          icon: 'lucide:repeat-2',
          children: [
            {
              kind: 'paragraph',
              label: 'Paragraph',
              icon: 'lucide:type'
            },
            {
              kind: 'heading',
              level: 1,
              label: 'Heading 1',
              icon: 'lucide:heading-1'
            },
            {
              kind: 'heading',
              level: 2,
              label: 'Heading 2',
              icon: 'lucide:heading-2'
            },
            {
              kind: 'heading',
              level: 3,
              label: 'Heading 3',
              icon: 'lucide:heading-3'
            },
            {
              kind: 'heading',
              level: 4,
              label: 'Heading 4',
              icon: 'lucide:heading-4'
            },
            {
              kind: 'bulletList',
              label: 'Bullet List',
              icon: 'lucide:list'
            },
            {
              kind: 'orderedList',
              label: 'Ordered List',
              icon: 'lucide:list-ordered'
            },
            {
              kind: 'blockquote',
              label: 'Blockquote',
              icon: 'lucide:text-quote'
            },
            {
              kind: 'codeBlock',
              label: 'Code Block',
              icon: 'lucide:square-code'
            }
          ]
        },
        {
          kind: 'clearFormatting',
          pos: selectedNode.value?.pos,
          label: 'Reset formatting',
          icon: 'lucide:rotate-ccw'
        }
      ],
      [
        {
          kind: 'duplicate',
          pos: selectedNode.value?.pos,
          label: 'Duplicate',
          icon: 'lucide:copy'
        },
        {
          label: 'Copy to clipboard',
          icon: 'lucide:clipboard',
          onSelect: async () => {
            if (!selectedNode.value) {
              return;
            }

            const pos = selectedNode.value.pos;
            const node = editor.state.doc.nodeAt(pos);
            if (node) {
              await navigator.clipboard.writeText(node.textContent);
            }
          }
        }
      ],
      [
        {
          kind: 'moveUp',
          pos: selectedNode.value?.pos,
          label: 'Move up',
          icon: 'lucide:arrow-up'
        },
        {
          kind: 'moveDown',
          pos: selectedNode.value?.pos,
          label: 'Move down',
          icon: 'lucide:arrow-down'
        }
      ],
      [
        {
          kind: 'delete',
          pos: selectedNode.value?.pos,
          label: 'Delete',
          icon: 'lucide:trash'
        }
      ]
    ]);
  });

  const imageToolbarItems: EditorToolbarItem[][] = [
    [
      {
        icon: 'lucide:refresh-cw',
        tooltip: {
          text: 'Replace'
        },
        onClick: () => {
          if (!editor.value) {
            return;
          }

          const { state } = editor.value;
          const { selection } = state;

          const pos = selection.from;
          const node = state.doc.nodeAt(pos);

          if (node && node.type.name === 'imageResize') {
            editor.value.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).insertContentAt(pos, { type: 'imageUpload' }).run();
          }
        }
      },
      {
        icon: 'lucide:trash',
        tooltip: {
          text: 'Delete'
        },
        onClick: () => {
          if (!editor.value) {
            return;
          }

          const { state } = editor.value;
          const { selection } = state;

          const pos = selection.from;
          const node = state.doc.nodeAt(pos);

          if (node && node.type.name === 'imageResize') {
            editor.value.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
          }
        }
      }
    ]
  ];

  return {
    fixedToolbarItems,
    tableToolbarItems,
    suggestionItems,
    bubbleToolbarItems,
    dragHandleItems,
    imageToolbarItems,
    selectedNode
  };
}
