<script setup lang="ts">
import { ref } from 'vue';
import type { NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';

const props = defineProps<NodeViewProps>();

const width = ref<number | null>(props.node.attrs.width);
const height = ref<number | null>(props.node.attrs.height);
const aspectRatio = ref(1);

let startX = 0;
let startWidth = 0;

function onImageLoad(e: Event) {
  const img = e.target as HTMLImageElement;

  if (!width.value) {
    width.value = img.naturalWidth;
    height.value = img.naturalHeight;
  }
  aspectRatio.value = img.naturalWidth / img.naturalHeight;
}

function startResize(e: MouseEvent) {
  e.preventDefault();
  startX = e.clientX;
  startWidth = width.value ?? 0;

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  const deltaX = e.clientX - startX;
  const newWidth = Math.max(50, startWidth + deltaX);
  width.value = newWidth;
  height.value = Math.round(newWidth / aspectRatio.value);
}

function onMouseUp() {
  props.updateAttributes({
    width: width.value,
    height: height.value
  });
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
});
</script>

<template>
  <NodeViewWrapper class="inline-block">
    <div
      class="relative inline-block max-w-full"
      :class="{ 'outline outline-primary-400': selected }"
      :style="{
        maxWidth: width ? `${width}px` : undefined,
        maxHeight: height ? `${height}px` : undefined
      }"
    >
      <img
        :src="node.attrs.src"
        :alt="node.attrs.alt"
        class="block h-auto w-full"
        draggable="false"
        @load="onImageLoad"
      >

      <div
        v-if="selected"
        class="absolute -right-1.5 -bottom-1.5 h-3 w-3 cursor-nwse-resize rounded-full border-2 border-white bg-primary-400"
        @mousedown="startResize"
      />
    </div>
  </NodeViewWrapper>
</template>
