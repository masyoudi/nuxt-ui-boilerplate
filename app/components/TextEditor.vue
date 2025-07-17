<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3';
import type { Editor as CoreEditor } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import type { HeadingOptions } from '@tiptap/extension-heading';
import { promiseTimeout } from '@vueuse/core';
import type { Node as ProsemirrorNode } from '@tiptap/pm/model';

type ExtensionNames = 'bold'
  | 'blockquote'
  | 'bulletList'
  | 'code'
  | 'codeBlock'
  | 'heading'
  | 'horizontalRule'
  | 'italic'
  | 'listItem'
  | 'orderedList'
  | 'strike'
  | 'underline'
  | 'subscript'
  | 'superscript'
  | 'textAlign'
  | 'link';

interface CommonToolbarItem {
  id: ExtensionNames;
  name: string;
  icon: string;
  shortcuts: string[];
  command: VoidFunction;
  active: () => boolean | undefined;
};

interface PlaceholderProps {
  editor: CoreEditor;
  node: ProsemirrorNode;
  pos: number;
  hasAnchor: boolean;
}

interface Props {
  modelValue?: string;
  ignoreExtensions?: ExtensionNames[];
  placeholder?: string | ((ctx: PlaceholderProps) => string);
  teleport?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter text...',
  teleport: true,
  disabled: false
});
const emits = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const editor = shallowRef<Editor>();

const _content = ref('');
const content = computed({
  get: () => props.modelValue ?? _content.value,
  set: (val) => {
    _content.value = val;
    emits('update:modelValue', val);
  }
});

const headings = computed(() => [
  {
    id: 1,
    label: 'Heading 1',
    slot: 'heading1',
    onSelect: async () => {
      await promiseTimeout(150);
      editor.value?.chain().focus().toggleHeading({ level: 1 }).run();
    },
    color: getDropdownItemColor(editor.value?.isActive('heading', { level: 1 }))
  },
  {
    id: 2,
    label: 'Heading 2',
    slot: 'heading2',
    onSelect: async () => {
      await promiseTimeout(150);
      editor.value?.chain().focus().toggleHeading({ level: 2 }).run();
    },
    color: getDropdownItemColor(editor.value?.isActive('heading', { level: 2 }))
  },
  {
    id: 3,
    label: 'Heading 3',
    slot: 'heading3',
    onSelect: async () => {
      await promiseTimeout(150);
      editor.value?.chain().focus().toggleHeading({ level: 3 }).run();
    },
    color: getDropdownItemColor(editor.value?.isActive('heading', { level: 3 }))
  },
  {
    id: 0,
    label: 'Paragraph',
    onSelect: async () => {
      await promiseTimeout(150);
      editor.value?.chain().focus().setParagraph().run();
    },
    color: getDropdownItemColor(![1, 2, 3].some((v) => editor.value?.isActive('heading', { level: v })))
  }
]);

const commonToolbarItems: CommonToolbarItem[] = [
  {
    id: 'bold',
    name: 'Bold',
    shortcuts: ['Ctrl', 'B'],
    icon: 'lucide:bold',
    command: () => {
      editor.value?.chain().focus().toggleBold().run();
    },
    active: () => editor.value?.isActive('bold')
  },
  {
    id: 'italic',
    name: 'Italic',
    shortcuts: ['Ctrl', 'I'],
    icon: 'lucide:italic',
    command: () => {
      editor.value?.chain().focus().toggleItalic().run();
    },
    active: () => editor.value?.isActive('italic')
  },
  {
    id: 'underline',
    name: 'Underline',
    shortcuts: ['Ctrl', 'U'],
    icon: 'lucide:underline',
    command: () => {
      editor.value?.chain().focus().toggleUnderline().run();
    },
    active: () => editor.value?.isActive('underline')
  },
  {
    id: 'strike',
    name: 'Strikethrough',
    shortcuts: ['Ctrl', 'Shift', 'S'],
    icon: 'lucide:strikethrough',
    command: () => {
      editor.value?.chain().focus().toggleStrike().run();
    },
    active: () => editor.value?.isActive('strike')
  },
  {
    id: 'superscript',
    name: 'Superscript',
    shortcuts: ['Ctrl', '.'],
    icon: 'lucide:superscript',
    command: () => {
      editor.value?.chain().focus().toggleSuperscript().run();
    },
    active: () => editor.value?.isActive('superscript')
  },
  {
    id: 'subscript',
    name: 'Subscript',
    shortcuts: ['Ctrl', ','],
    icon: 'lucide:subscript',
    command: () => {
      editor.value?.chain().focus().toggleSubscript().run();
    },
    active: () => editor.value?.isActive('subscript')
  },
  {
    id: 'blockquote',
    name: 'Blockquote',
    shortcuts: ['Ctrl', 'Shift', 'B'],
    icon: 'lucide:quote',
    command: () => {
      editor.value?.chain().focus().toggleBlockquote().run();
    },
    active: () => editor.value?.isActive('blockquote')
  },
  {
    id: 'bulletList',
    name: 'Bullet List',
    shortcuts: [],
    icon: 'lucide:list',
    command: () => {
      editor.value?.chain().focus().toggleBulletList().run();
    },
    active: () => editor.value?.isActive('bulletList')
  },
  {
    id: 'orderedList',
    name: 'Ordered List',
    shortcuts: [],
    icon: 'lucide:list-ordered',
    command: () => {
      editor.value?.chain().focus().toggleOrderedList().run();
    },
    active: () => editor.value?.isActive('orderedList')
  }
];

const textAligns = computed(() => [
  {
    id: 'left',
    icon: 'lucide:align-left',
    onSelect: async () => {
      await promiseTimeout(150);
      editor.value?.chain().focus().setTextAlign('left').run();
    },
    color: getDropdownItemColor(editor.value?.isActive({ textAlign: 'left' }))
  },
  {
    id: 'right',
    icon: 'lucide:align-right',
    onSelect: async () => {
      await promiseTimeout(150);
      editor.value?.chain().focus().setTextAlign('right').run();
    },
    color: getDropdownItemColor(editor.value?.isActive({ textAlign: 'right' }))
  },
  {
    id: 'center',
    icon: 'lucide:align-center',
    onSelect: async () => {
      await promiseTimeout(150);
      editor.value?.chain().focus().setTextAlign('center').run();
    },
    color: getDropdownItemColor(editor.value?.isActive({ textAlign: 'center' }))
  },
  {
    id: 'justify',
    icon: 'lucide:align-justify',
    onSelect: async () => {
      await promiseTimeout(150);
      editor.value?.chain().focus().setTextAlign('justify').run();
    },
    color: getDropdownItemColor(editor.value?.isActive({ textAlign: 'justify' }))
  }
]);

const isFocused = ref(false);

const link = reactive({
  open: false,
  url: '',
  mode: 'add' as 'add' | 'edit'
});

function getDropdownItemColor(isActive?: boolean) {
  return isActive ? 'primary' as const : 'neutral' as const;
}

/**
 * Check is extension disabled
 * @param ext - Extension name
 */
function isEnable(ext: ExtensionNames) {
  return !(props.ignoreExtensions ?? []).includes(ext);
}

/**
 * Initialize editor
 */
function init() {
  const headingConfig: Partial<HeadingOptions> = {
    levels: [1, 2, 3]
  };

  const _TextAlign = TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: textAligns.value.map((v) => v.id)
  });

  const _Link = Link.configure({
    openOnClick: false,
    defaultProtocol: 'https'
  });

  editor.value = new Editor({
    editorProps: {
      attributes: {
        class: 'min-h-[150px] max-h-[500px] prose prose-slate dark:prose-invert prose-sm max-w-none outline-none resize-y overflow-y-auto p-1.5'
      },
      handleClick: (_view: any, _pos: any, evt: MouseEvent) => {
        const { target } = evt;

        if (!(target instanceof HTMLElement)) {
          return;
        }

        const isAnchor = target instanceof HTMLAnchorElement ? true : target?.parentElement instanceof HTMLAnchorElement;
        if (target.closest('a') && isAnchor) {
          evt.stopPropagation();
          onOpenLink();
          nextTick(() => link.open = true);
        }
      }
    },
    extensions: [
      StarterKit.configure({
        bold: isEnable('bold') ? undefined : false,
        blockquote: isEnable('blockquote') ? undefined : false,
        bulletList: isEnable('bulletList') ? undefined : false,
        code: isEnable('code') ? undefined : false,
        codeBlock: isEnable('codeBlock') ? undefined : false,
        heading: isEnable('heading') ? headingConfig : false,
        horizontalRule: isEnable('horizontalRule') ? undefined : false,
        italic: isEnable('italic') ? undefined : false,
        listItem: isEnable('listItem') ? undefined : false,
        orderedList: isEnable('orderedList') ? undefined : false,
        strike: isEnable('strike') ? undefined : false,
        link: false,
        underline: false
      }),
      ...(isEnable('subscript') ? [Subscript] : []),
      ...(isEnable('superscript') ? [Superscript] : []),
      ...(isEnable('underline') ? [Underline] : []),
      ...(isEnable('textAlign') ? [_TextAlign] : []),
      ...(isEnable('link') ? [_Link] : []),
      Placeholder.configure({
        emptyEditorClass: 'is-editor-empty',
        placeholder: props.placeholder
      })
    ],
    content: content.value,
    editable: !props.disabled,
    onFocus: () => {
      isFocused.value = true;
    },
    onBlur: () => {
      isFocused.value = false;
    },
    onUpdate: ({ editor: _editor }) => {
      content.value = removeEmptyHtml(_editor.getHTML());
    }
  });
}

/**
 * Set input url on open link
 */
async function onOpenLink() {
  if (!editor.value) {
    return;
  }

  const prevURL = editor.value.getAttributes('link').href;
  const hasURL = typeof prevURL === 'string' && prevURL !== '';

  link.mode = hasURL ? 'edit' : 'add';
  link.url = hasURL ? prevURL : '';
}

/**
 * Insert link
 */
function onSetLink() {
  if (!editor.value || link.url === '') {
    link.open = false;
    return;
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: link.url }).run();
}

/**
 * Remove link
 */
function onUnsetLink() {
  if (!editor.value) {
    link.open = false;
    return;
  }

  editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
  link.open = false;
}

function removeEmptyHtml(value: string) {
  const parsed = value.replace(/(<\/?[^>]+(>|$)|&nbsp;|\s)/g, '');

  return parsed !== '' ? value : '';
}

watchEffect(() => {
  const isEqual = removeEmptyHtml(editor.value?.getHTML() ?? '') === removeEmptyHtml(content.value);
  if (isEqual) {
    return;
  }

  editor.value?.commands.setContent(content.value);
});

watchEffect(() => {
  editor.value?.setEditable(!props.disabled);
});

onMounted(() => {
  init();
});

onUnmounted(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div
    class="relative w-full bg-(--ui-bg) border rounded-md tiptap"
    :class="isFocused ? 'border-(--ui-color-primary-500)' : 'border-(--ui-border-accented)'"
  >
    <div class="flex flex-wrap bg-muted gap-2 p-2 rounded-t-md border-b border-b-(--ui-border-accented)">
      <UDropdownMenu
        v-if="isEnable('heading')"
        :items="headings"
        :ui="{ content: 'w-38' }"
        :portal="props.teleport"
      >
        <UButton
          :label="headings.find((val) => editor?.isActive('heading', { level: val.id }))?.label ?? 'Paragraph'"
          color="neutral"
          size="sm"
          block
          class="max-w-[115px] justify-between"
          trailing-icon="lucide:chevron-down"
          variant="subtle"
        />

        <template #heading1-label="{ item }">
          <div class="text-xl font-bold leading-5">
            {{ item.label }}
          </div>
        </template>
        <template #heading2-label="{ item }">
          <div class="text-lg font-bold leading-5">
            {{ item.label }}
          </div>
        </template>
        <template #heading3-label="{ item }">
          <div class="text-md font-bold leading-5">
            {{ item.label }}
          </div>
        </template>
      </UDropdownMenu>

      <template
        v-for="item in commonToolbarItems"
        :key="item.id"
      >
        <UTooltip
          v-if="isEnable(item.id)"
          :text="item.name"
          :kbds="item.shortcuts"
          arrow
          :portal="props.teleport"
        >
          <UButton
            size="sm"
            :color="item.active() ? 'primary' : 'neutral'"
            variant="subtle"
            :icon="item.icon"
            class="cursor-pointer"
            @click="item.command"
          />
        </UTooltip>
      </template>

      <UDropdownMenu
        v-if="isEnable('textAlign')"
        :items="textAligns"
        size="sm"
        :ui="{
          content: 'min-w-9 w-9'
        }"
        :portal="props.teleport"
      >
        <UTooltip
          text="Text Align"
          arrow
          :portal="props.teleport"
        >
          <UButton
            :icon="textAligns.find((v) => editor?.isActive({ textAlign: v.id }))?.icon ?? 'lucide:align-left'"
            color="neutral"
            size="sm"
            variant="subtle"
          />
        </UTooltip>
      </UDropdownMenu>

      <UPopover
        v-if="isEnable('link')"
        v-model:open="link.open"
        :portal="props.teleport"
      >
        <UButton
          icon="lucide:link"
          :color="editor?.isActive('link') ? 'primary' : 'neutral'"
          variant="subtle"
          size="sm"
          @click="onOpenLink"
        />

        <template #content>
          <div class="w-56 p-3">
            <UFormField
              label="URL"
              class="mb-4"
              size="xs"
            >
              <UInput
                v-model="link.url"
                class="w-full"
                placeholder="Enter url..."
                size="xs"
              />
            </UFormField>

            <div class="flex justify-end gap-2">
              <UButton
                color="danger"
                size="xs"
                :disabled="!editor?.isActive('link')"
                @click="onUnsetLink"
              >
                Unset Link
              </UButton>
              <UButton
                color="primary"
                size="xs"
                @click="onSetLink"
              >
                {{ ucFirst(link.mode) }} Link
              </UButton>
            </div>
          </div>
        </template>
      </UPopover>
    </div>

    <div class="w-full min-h-[150px] p-px">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<style scoped>
.tiptap :deep(.is-editor-empty:first-child::before) {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
