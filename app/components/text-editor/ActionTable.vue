<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';

const props = defineProps<{
  editor: Editor;
}>();

const open = ref(false);

const actions = [
  {
    label: 'Add row above',
    icon: 'lucide:between-vertical-start',
    onSelect: () => {
      props.editor.chain().focus().addRowBefore().run();
    }
  },
  {
    label: 'Add row below',
    icon: 'lucide:between-vertical-end',
    onSelect: () => {
      props.editor.chain().focus().addRowAfter().run();
    }
  },
  {
    label: 'Add column before',
    icon: 'lucide:between-horizontal-start',
    onSelect: () => {
      props.editor.chain().focus().addColumnBefore().run();
    }
  },
  {
    label: 'Add column after',
    icon: 'lucide:between-horizontal-end',
    onSelect: () => {
      props.editor.chain().focus().addColumnAfter().run();
    }
  },
  {
    type: 'separator' as const
  },
  {
    label: 'Merge cells',
    icon: 'lucide:table-cells-merge',
    onSelect: () => {
      props.editor.chain().focus().mergeCells().run();
    }
  },
  {
    label: 'Split cells',
    icon: 'lucide:table-columns-split',
    onSelect: () => {
      props.editor.chain().focus().splitCell().run();
    }
  },
  {
    type: 'separator' as const
  },
  {
    label: 'Delete row',
    icon: 'lucide:rows-3',
    onSelect: () => {
      props.editor.chain().focus().deleteRow().run();
    }
  },
  {
    label: 'Delete column',
    icon: 'lucide:columns-3',
    onSelect: () => {
      props.editor.chain().focus().deleteColumn().run();
    }
  },
  {
    type: 'separator' as const
  },
  {
    label: 'Delete table',
    icon: 'lucide:trash',
    onSelect: () => {
      props.editor.chain().focus().deleteTable().run();
    }
  }
];

const isActive = computed(() => props.editor.isActive('table'));
const disabled = computed(() => {
  if (!props.editor.isEditable) {
    return true;
  }

  if (isActive.value) {
    return false;
  }

  const { selection } = props.editor.state;
  return !selection.empty;
});

const creator = reactive({
  row: 1,
  col: 1
});

function resetCreator() {
  creator.row = 1;
  creator.col = 1;
}

function onMouseEnterCreateTable(row: number, col: number) {
  creator.row = row;
  creator.col = col;
}

function onClickCreateTable(row: number, col: number) {
  open.value = false;
  props.editor.chain().focus().insertTable({ rows: row, cols: col, withHeaderRow: true }).run();
}

function onOpen(isOpen: boolean) {
  if (isOpen) {
    resetCreator();
  }
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :ui="{
      content: 'p-0.5'
    }"
    @update:open="onOpen"
  >
    <UTooltip text="Table">
      <UButton
        icon="i-lucide-table"
        color="neutral"
        active-color="primary"
        variant="ghost"
        active-variant="soft"
        size="sm"
        :active="isActive"
        :disabled="disabled"
      />
    </UTooltip>

    <template #content>
      <div
        v-if="isActive"
        class="flex flex-col gap-y-0.5 p-0.5"
      >
        <template
          v-for="(action, i) in actions"
          :key="`action.${i}`"
        >
          <UButton
            v-if="action.type !== 'separator'"
            color="neutral"
            variant="ghost"
            block
            size="sm"
            class="justify-start font-normal"
            :label="action.label"
            :icon="action.icon"
            @click="action.onSelect"
          />
          <USeparator v-else />
        </template>
      </div>
      <div
        v-else
        class="flex flex-col gap-y-1 p-3"
        @mouseleave="resetCreator"
      >
        <div
          v-for="row in 10"
          :key="`row.${row}`"
          class="grid grid-cols-10 gap-x-1"
        >
          <div
            v-for="col in 10"
            :key="`column.${row}.${col}`"
            class="relative size-[16px] border-1 rounded-sm"
            :class="creator.row >= row && creator.col >= col ? 'border-primary-500 bg-primary-100' : 'border-accented bg-slate-50'"
            @mouseenter="onMouseEnterCreateTable(row, col)"
            @click.prevent="onClickCreateTable(row, col)"
          />
        </div>
        <p class="text-sm text-center">
          {{ creator.row }}x{{ creator.col }}
        </p>
      </div>
    </template>
  </UPopover>
</template>
