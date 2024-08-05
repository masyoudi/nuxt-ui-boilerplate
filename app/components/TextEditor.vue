<style scoped>
:deep(.tiptap) p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>

<template>
  <div ref="root" class="w-full min-h-[200px] border rounded-md" :class="focused ? 'border-primary': 'dark:border-slate-700'">
    <div class="flex flex-wrap gap-1 px-3 py-2 border-b dark:border-b-slate-700">
      <UDropdown :items="[textSizes]" :popper="{ placement: 'bottom-start', arrow: true }">
        <UButton
          color="white"
          class="min-w-[100px] justify-between"
          :label="textSizes.find((v) => v.active())?.label ?? 'Normal'"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          size="2xs"
        />
      </UDropdown>

      <UTooltip v-for="(menu, i) in menus" :key="i" :text="menu.title" :shortcuts="menu.shortcuts">
        <UButton
          :color="menu.active() ? 'primary' : 'gray'"
          :icon="menu.icon"
          size="2xs"
          variant="ghost"
          :disabled="menu.disable()"
          @click="menu.handler"
        />
      </UTooltip>

      <UPopover v-model:open="link.open" :popper="{ arrow: true }" @update:open="onTogglePopoverLink">
        <UTooltip text="Link">
          <UButton color="gray" icon="i-heroicons-link-16-solid" size="2xs" variant="ghost" />
        </UTooltip>

        <template #panel>
          <div class="min-w-[245px] space-y-2 p-3">
            <UFormGroup label="Text" size="xs">
              <UInput v-model="link.text" placeholder="Enter text" size="xs" autofocus></UInput>
            </UFormGroup>
            <UFormGroup label="Link" size="xs">
              <UInput v-model="link.url" placeholder="Enter link" size="xs"></UInput>
            </UFormGroup>
            <div class="flex justify-end gap-2 pt-1">
              <UButton
                v-if="link.url"
                icon="i-heroicons-arrow-top-right-on-square"
                size="xs"
                variant="ghost"
                :to="link.url"
                target="_blank"
              ></UButton>
              <UButton color="red" size="xs" @click="onToggleLink(false)">Reset</UButton>
              <UButton size="xs" @click="onToggleLink(true)">Save</UButton>
            </div>
          </div>
        </template>
      </UPopover>

      <UTooltip v-if="typeof props.imageHandler === 'function'" text="Image">
        <UButton color="gray" icon="i-heroicons-photo" size="2xs" variant="ghost" @click="() => inputImage?.click()" />
      </UTooltip>
    </div>

    <div class="hidden pointer-events-none -z-10">
      <input ref="inputImage" type="file" :accept="props.imageAccept" @change="onChangeImage" />
    </div>

    <EditorContent :editor="editor"></EditorContent>
  </div>
</template>

<script setup lang="ts">
import { getMarkRange } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import type { CommandProps } from '@tiptap/core';
import { ImageResize } from '@/utils/tiptap/image-resize';

interface Props {
  modelValue?: string;
  placeholder?: string;
  imageAccept?: string;
  imageHandler?: (file: File) => Promise<string>;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  imageAccept: 'image/*',
  disabled: false
});
const emits = defineEmits<{
  (e: 'update:modelValue', val?: string): void;
}>();

const _value = ref('');
const vmodel = computed({
  get: () => props.modelValue ?? _value.value,
  set: (val) => {
    _value.value = val;
    emits('update:modelValue', val);
  }
});
const focused = ref(false);
const root = ref();
const inputImage = ref();

const editor = useEditor({
  content: props.modelValue ?? '',
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      defaultProtocol: 'https'
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
      showOnlyWhenEditable: true
    }),
    ImageResize,
    Underline
  ],
  editable: !props.disabled,
  editorProps: {
    attributes: {
      class: 'prose !max-w-none focus:outline-none min-h-[150px] px-3 py-2'
    },
    handleClick: (view, pos) => {
      const { schema, doc, tr } = view.state;

      const rangeLink = getMarkRange(doc.resolve(pos), schema.marks.link as any);
      if (!rangeLink) {
        return;
      }

      const _start = doc.resolve(rangeLink.from);
      const _end = doc.resolve(rangeLink.to);
      const transaction = tr.setSelection(new TextSelection(_start, _end));

      view.dispatch(transaction);
      view.state.doc.nodesBetween(view.state.selection.from, view.state.selection.to, (node) => {
        const mark = node.marks.find((v) => v.type.name === 'link');
        link.url = mark?.attrs?.href ?? '';
        link.text = node.text ?? '';
        link.open = true;
      });
    }
  },
  onUpdate: (ctx) => {
    vmodel.value = ctx.editor.getHTML();
  },
  onFocus: () => {
    focused.value = true;
  },
  onBlur: () => {
    focused.value = false;
  }
});

const textSizes = computed(() => [
  {
    label: 'Normal',
    active: () => editor.value?.isActive('paragraph'),
    click: () => editor.value?.chain().focus().setParagraph().run()
  },
  {
    label: 'Heading 1',
    active: () => editor.value?.isActive('heading', { level: 1 }),
    click: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    label: 'Heading 2',
    active: () => editor.value?.isActive('heading', { level: 2 }),
    click: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    label: 'Heading 3',
    active: () => editor.value?.isActive('heading', { level: 3 }),
    click: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run()
  }
]);

const menus = computed(() => [
  {
    title: 'Bold',
    icon: 'i-heroicons-bold',
    shortcuts: ['Ctrl', 'B'],
    active: () => editor.value?.isActive('bold'),
    disable: () => !editor.value?.can().chain().focus().toggleBold().run(),
    handler: () => editor.value?.chain().focus().toggleBold().run()
  },
  {
    title: 'Italic',
    icon: 'i-heroicons-italic-16-solid',
    shortcuts: ['Ctrl', 'I'],
    active: () => editor.value?.isActive('italic'),
    disable: () => !editor.value?.can().chain().focus().toggleItalic().run(),
    handler: () => editor.value?.chain().focus().toggleItalic().run()
  },
  {
    title: 'Strikethrough',
    icon: 'i-heroicons-strikethrough-16-solid',
    shortcuts: ['Ctrl', 'Shift', 'S'],
    active: () => editor.value?.isActive('strike'),
    disable: () => !editor.value?.can().chain().focus().toggleStrike().run(),
    handler: () => editor.value?.chain().focus().toggleStrike().run()
  },
  {
    title: 'Underline',
    icon: 'i-heroicons-underline-16-solid',
    shortcuts: ['Ctrl', 'U'],
    active: () => editor.value?.isActive('underline'),
    disable: () => !editor.value?.can().chain().focus().toggleUnderline().run(),
    handler: () => editor.value?.chain().focus().toggleUnderline().run()
  },
  {
    title: 'Numbered List',
    icon: 'i-heroicons-numbered-list-16-solid',
    shortcuts: [],
    active: () => editor.value?.isActive('orderedList'),
    disable: () => !editor.value?.can().chain().focus().toggleOrderedList().run(),
    handler: () => editor.value?.chain().focus().toggleOrderedList().run()
  },
  {
    title: 'List Bullet',
    icon: 'i-heroicons-list-bullet-16-solid',
    shortcuts: [],
    active: () => editor.value?.isActive('bulletList'),
    disable: () => !editor.value?.can().chain().focus().toggleBulletList().run(),
    handler: () => editor.value?.chain().focus().toggleBulletList().run()
  }
]);

// Link
const link = reactive({
  open: false,
  text: '',
  url: ''
});

function onTogglePopoverLink(open: boolean) {
  const state = editor.value?.state;
  if (open && link.text === '' && link.url === '' && state) {
    state.doc.nodesBetween(state.selection.from, state.selection.to, (node) => {
      const mark = node.marks.find((v) => v.type.name === 'link');
      link.url = mark?.attrs?.href ?? '';
      link.text = node.text ?? '';
    });
  }

  if (!open) {
    link.text = '';
    link.url = '';
  }
}

function onToggleLink(isAdd: boolean) {
  const _editor = editor.value;
  if (!_editor) {
    return;
  }

  const insertText = (cmd: CommandProps) => {
    cmd.tr.insertText(link.text);
    return true;
  };

  if (!isAdd) {
    _editor.chain().focus().extendMarkRange('link').command(insertText).unsetLink().run();
    link.open = false;
    return;
  }

  const setLink = () => _editor.chain().focus().extendMarkRange('link').setLink({ href: link.url });

  setLink().command(insertText).run();
  link.open = false;
}

// Image
async function onChangeImage(e: Event) {
  const [file] = [...(e.target as any).files];

  if (!file || typeof props.imageHandler !== 'function') {
    return;
  }

  try {
    const src = await props.imageHandler(file);
    const isExists = await isImageExists(src);
    const _editor = editor.value;

    if (!isExists || !_editor) {
      return;
    }

    _editor.chain().focus().setImage({ src }).run();
  } catch {
    // todo handle error
  }
}

function isImageExists(src: string) {
  return new Promise<boolean>((resolve) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(true));
    image.addEventListener('error', () => resolve(false));
    image.src = src;
  });
}

// Content
function setContent() {
  if (editor.value?.getHTML() === vmodel.value) {
    return;
  }

  editor.value?.commands.setContent(vmodel.value, false);
}

watch(() => vmodel.value, setContent);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>
