<template>
  <NodeViewWrapper as="span" class="inline-block max-w-full leading-[0] select-none align-baseline">
    <span class="relative inline-block max-w-full clear-both" draggable data-drag-handle>
      <img :src="attrs.src" :alt="attrs.alt" :style="attrs.style" class="not-prose" @load="onImageLoad" @click="selectImage" />

      <span
        v-if="props.editor?.view?.editable"
        v-show="props.selected || resizing"
        class="absolute inset-0 border border-blue-500 z-[1]"
      >
        <span
          v-for="(dir, i) in resizeDirections"
          :key="i"
          class="absolute w-[12px] h-[12px] border border-white bg-blue-500 z-[2]"
          :class="resizeClass[dir]"
          @mousedown="onMouseDown($event, dir)"
        ></span>
      </span>
    </span>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/vue-3';
import { useThrottleFn } from '@vueuse/core';

const props = defineProps<NodeViewProps & { selected: boolean }>();

const RESIZE_DIRECTION = {
  TOP_LEFT: 'tl',
  TOP_RIGHT: 'tr',
  BOTTOM_LEFT: 'bl',
  BOTTOM_RIGHT: 'br'
};

const originalSize = reactive({
  width: 0,
  height: 0
});

const maxSize = reactive({
  width: 0,
  height: 0
});

const resizeDirections = shallowRef<string[]>([
  RESIZE_DIRECTION.TOP_LEFT,
  RESIZE_DIRECTION.TOP_RIGHT,
  RESIZE_DIRECTION.BOTTOM_LEFT,
  RESIZE_DIRECTION.BOTTOM_RIGHT
]);

const resizeClass: Record<string, string> = {
  tl: '-top-[6px] -left-[6px] cursor-nw-resize',
  tr: '-top-[6px] -right-[6px] cursor-ne-resize',
  bl: '-bottom-[6px] -left-[6px] cursor-sw-resize',
  br: '-bottom-[6px] -right-[6px] cursor-se-resize'
};

const resizing = ref(false);

const resizeModel = reactive({
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  dir: ''
});

const attrs = computed(() => {
  const { src, alt, width: _width, height: _height } = props.node.attrs;
  const width = (typeof _width === 'number' ? `${_width}px` : _width) || undefined;
  const height = (typeof _height === 'number' ? `${_height}px` : _height) || undefined;

  return {
    src: src || undefined,
    alt: alt || undefined,
    style: { width, height }
  };
});

const getMaxSize = useThrottleFn(() => {
  maxSize.width = Number.parseInt(getComputedStyle(props.editor.view.dom).width);
}, 16);

function onImageLoad(e: Record<string, any>) {
  originalSize.width = e.target.width;
  originalSize.height = e.target.height;
}

function selectImage() {
  props.editor.commands.setNodeSelection(props.getPos());
}

function onMouseDown(e: MouseEvent, dir: string) {
  e.preventDefault();
  e.stopPropagation();

  resizeModel.x = e.clientX;
  resizeModel.y = e.clientY;

  const originalWidth = unref(originalSize).width;
  const originalHeight = unref(originalSize).height;
  const aspectRatio = originalWidth / originalHeight;

  let width = Number(props.node.attrs.width);
  let height = Number(props.node.attrs.height);
  const maxWidth = unref(maxSize).width;

  if (width && !height) {
    width = width > maxWidth ? maxWidth : width;
    height = Math.round(width / aspectRatio);
  } else if (height && !width) {
    width = Math.round(height * aspectRatio);
    width = width > maxWidth ? maxWidth : width;
  } else if (!width && !height) {
    width = originalWidth > maxWidth ? maxWidth : originalWidth;
    height = Math.round(width / aspectRatio);
  } else {
    width = width > maxWidth ? maxWidth : width;
  }

  resizeModel.w = width;
  resizeModel.h = height;
  resizeModel.dir = dir;

  resizing.value = true;

  onEvents();
}

const onMouseMove = useThrottleFn((e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (!resizing.value) {
    return;
  }

  const { x, y, w, h, dir } = unref(resizeModel);
  const dx = (e.clientX - x) * (/l/.test(dir) ? -1 : 1);
  const dy = (e.clientY - y) * (/t/.test(dir) ? -1 : 1);

  const width = clamp(w + dx, 20, unref(maxSize).width);
  const height = Math.max(h + dy, 20);

  props.updateAttributes({ width, height });
}, 16);

function onMouseUp(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (!unref(resizing)) return;

  resizing.value = false;

  resizeModel.x = 0;
  resizeModel.y = 0;
  resizeModel.w = 0;
  resizeModel.h = 0;
  resizeModel.dir = '';

  offEvents();
  selectImage();
}

function onEvents() {
  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('mouseup', onMouseUp, true);
}

function offEvents() {
  document.removeEventListener('mousemove', onMouseMove, true);
  document.removeEventListener('mouseup', onMouseUp, true);
}

function clamp(val: number, min: number, max: number) {
  return val < min ? min : val > max ? max : val;
}

const resizeObserver = new ResizeObserver(() => getMaxSize());

watchEffect((onCleanup) => {
  resizeObserver.observe(props.editor.view.dom);

  onCleanup(() => resizeObserver.disconnect());
});
</script>
