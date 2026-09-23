<script lang="ts">
import type { ButtonProps, EmitsToProps, IconProps, LinkPropsKeys } from '@nuxt/ui';
import { useLocale, usePortal } from '#ui/composables';
import { fieldGroupInjectionKey } from '@nuxt/ui/composables/useFieldGroup';
import { createReusableTemplate, reactivePick } from '@vueuse/core';
import type { DialogRootEmits, DialogContentProps, DialogContentEmits, PointerDownOutsideEvent } from 'reka-ui';
import {
  DialogRoot,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  VisuallyHidden,
  DialogContent,
  useForwardPropsEmits
} from 'reka-ui';
import { tv } from 'tailwind-variants';
import { pointerDownOutside } from '#ui/utils/overlay';
import type { VNode } from 'vue';
import theme from '~/theme/modal';

type ModalTheme = typeof theme;

const modalTheme = tv(theme);

type ModalUI = ReturnType<typeof modalTheme>;

export interface AppModalProps {
  /** The open state of the dialog when it is initially rendered. Use when you do not need to control its open state. */
  defaultOpen?: boolean;
  /**
   * The modality of the dialog When set to `true`, <br>
   * interaction with outside elements will be disabled and only dialog content will be visible to screen readers.
   */
  modal?: boolean;
  /**
   * When set to `false`, the dialog content will not be unmounted when closed, but instead hidden with CSS. <br>
   * Useful for SEO or when you want to improve performance by not remounting the component on every open.
   * @defaultValue true
   */
  unmountOnHide?: boolean;
  title?: string;
  description?: string;
  /** The content of the modal. */
  content?: Omit<DialogContentProps, 'as' | 'asChild' | 'forceMount'> & Partial<EmitsToProps<DialogContentEmits>>;
  /**
   * Render an overlay behind the modal.
   * @defaultValue true
   */
  overlay?: boolean;
  /**
   * When `true`, enables scrollable overlay mode where content scrolls within the overlay.
   * @defaultValue false
   */
  scrollable?: boolean;
  /**
   * Animate the modal when opening or closing.
   * @defaultValue true
   */
  transition?: boolean;
  /**
   * When `true`, the modal will take up the full screen.
   * @defaultValue false
   */
  fullscreen?: boolean;
  /**
   * Render the modal in a portal.
   * @defaultValue true
   */
  portal?: boolean | string | HTMLElement;
  /**
   * Display a close button to dismiss the modal.
   * `{ size: 'md', color: 'neutral', variant: 'ghost' }`
   * @defaultValue true
   */
  close?: boolean | Omit<ButtonProps, LinkPropsKeys>;
  /**
   * The icon displayed in the close button.
   * @defaultValue appConfig.ui.icons.close
   * @IconifyIcon
   */
  closeIcon?: IconProps['name'];
  /**
   * When `false`, the modal will not close when clicking outside or pressing escape.
   * @defaultValue true
   */
  dismissible?: boolean;
  class?: any;
  ui?: Partial<ModalTheme['slots']>;
}

export interface AppModalEmits extends DialogRootEmits {
  'leave': [];
  'after:leave': [];
  'enter': [];
  'after:enter': [];
  'close:prevent': [];
}

interface SlotProps {
  open: boolean;
  close: () => void;
}

export interface AppModalSlots {
  default?(props: Pick<SlotProps, 'close'>): VNode[];
  trigger?(props: Pick<SlotProps, 'open'>): VNode[];
  header?(props: Pick<SlotProps, 'close'>): VNode[];
  title?(): VNode[];
  description?(): VNode[];
  actions?(): VNode[];
  close?(props: { ui: ModalUI }): VNode[];
  body?(props: Pick<SlotProps, 'close'>): VNode[];
  footer?(props: Pick<SlotProps, 'close'>): VNode[];
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<AppModalProps>(), {
  portal: true,
  overlay: true,
  scrollable: false,
  transition: true,
  close: true,
  closeIcon: 'lucide:x',
  modal: true,
  dismissible: true
});
const emits = defineEmits<AppModalEmits>();
const slots = defineSlots<AppModalSlots>();
const open = defineModel<boolean>({ required: false, default: false });

const rootProps = useForwardPropsEmits(
  reactivePick(props, 'defaultOpen', 'modal', 'unmountOnHide'),
  emits
);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => props.content);
const { t } = useLocale();

const CLOSE_EVENTS = ['interactOutside', 'escapeKeyDown'] as const;
const contentEvents = computed(() => {
  if (props.dismissible) {
    return {
      pointerDownOutside: (e: PointerDownOutsideEvent) => pointerDownOutside(e, { scrollable: props.scrollable })
    };
  }

  return CLOSE_EVENTS.reduce((events, eventName) => {
    events[eventName] = (e) => {
      e.preventDefault();
      emits('close:prevent');
    };

    return events;
  }, {} as Record<(typeof CLOSE_EVENTS)[number], (e: Event) => void>);
});

const uiTheme = computed(() => {
  return modalTheme({
    transition: props.transition,
    fullscreen: props.fullscreen,
    overlay: props.overlay,
    scrollable: props.scrollable,
    asCard: !slots.default
  });
});

const FieldGroupReset = defineComponent({
  name: 'FieldGroupReset',
  setup(_, { slots }) {
    provide(fieldGroupInjectionKey, computed(() => ({
      size: undefined,
      orientation: undefined
    })));
    return () => slots.default?.();
  }
});

const [DefineContentTemplate, ReuseContentTemplate] = createReusableTemplate();
</script>

<template>
  <DialogRoot
    v-slot="{ open: isOpen, close: onClose }"
    v-model:open="open"
    v-bind="rootProps"
  >
    <DefineContentTemplate>
      <DialogContent
        data-slot="content"
        :class="uiTheme.content({ class: [props.class, props.ui?.content] })"
        v-bind="contentProps"
        @enter="!props.scrollable && emits('enter')"
        @after-enter="!props.scrollable && emits('after:enter')"
        @leave="!props.scrollable && emits('leave')"
        @after-leave="!props.scrollable && emits('after:leave')"
        v-on="contentEvents"
      >
        <VisuallyHidden v-if="(!props.title && !slots.title) || (!props.description && !slots.description) || !!slots.default">
          <DialogTitle v-if="!props.title && !slots.title" />
          <DialogTitle v-else-if="!!slots.default">
            <slot name="title">
              {{ props.title }}
            </slot>
          </DialogTitle>

          <DialogDescription v-if="!props.description && !slots.description" />
          <DialogDescription v-else-if="!!slots.default">
            <slot name="description">
              {{ props.description }}
            </slot>
          </DialogDescription>
        </VisuallyHidden>

        <DialogClose
          v-if="!!slots.default && (props.close || !!slots.close)"
          as-child
        >
          <slot
            name="close"
            :ui="uiTheme"
          >
            <UButton
              v-if="props.close"
              :icon="props.closeIcon"
              color="neutral"
              variant="ghost"
              :aria-label="t('modal.close')"
              v-bind="(typeof props.close === 'object' ? props.close : {})"
              data-slot="close"
              :class="uiTheme.close({ class: props.ui?.close })"
            />
          </slot>
        </DialogClose>

        <slot :close="onClose">
          <div
            v-if="!!slots.header || (props.title || !!slots.title) || (props.description || !!slots.description) || (props.close || !!slots.close)"
            data-slot="header"
            :class="uiTheme.header({ class: props.ui?.header })"
          >
            <slot
              name="header"
              :close="onClose"
            >
              <div
                v-if="props.title || !!slots.title || props.description || !!slots.description"
                :class="uiTheme.wrapper({ class: props.ui?.wrapper })"
              >
                <DialogTitle
                  v-if="props.title || !!slots.title"
                  data-slot="title"
                  :class="uiTheme.title({ class: props.ui?.title })"
                >
                  <slot name="title">
                    {{ props.title }}
                  </slot>
                </DialogTitle>

                <DialogDescription
                  v-if="props.description || !!slots.description"
                  data-slot="description"
                  :class="uiTheme.description({ class: props.ui?.description })"
                >
                  <slot name="description">
                    {{ props.description }}
                  </slot>
                </DialogDescription>
              </div>

              <slot name="actions" />

              <DialogClose
                v-if="props.close || !!slots.close"
                as-child
              >
                <slot
                  name="close"
                  :ui="uiTheme"
                >
                  <UButton
                    v-if="props.close"
                    :icon="props.closeIcon"
                    color="neutral"
                    variant="ghost"
                    :aria-label="t('modal.close')"
                    v-bind="(typeof props.close === 'object' ? props.close : {})"
                    data-slot="close"
                    :class="uiTheme.close({ class: props.ui?.close })"
                  />
                </slot>
              </DialogClose>
            </slot>
          </div>

          <div
            v-if="!!slots.body"
            data-slot="body"
            :class="uiTheme.body({ class: props.ui?.body })"
          >
            <slot
              name="body"
              :close="onClose"
            />
          </div>

          <div
            v-if="!!slots.footer"
            data-slot="footer"
            :class="uiTheme.footer({ class: props.ui?.footer })"
          >
            <slot
              name="footer"
              :close="onClose"
            />
          </div>
        </slot>
      </DialogContent>
    </DefineContentTemplate>
    <DialogTrigger
      v-if="!!slots.trigger"
      as-child
      :class="props.class"
    >
      <slot
        name="trigger"
        :open="isOpen"
      />
    </DialogTrigger>

    <DialogPortal
      v-bind="portalProps"
      :force-mount="portalProps.disabled && props.unmountOnHide === false || undefined"
    >
      <FieldGroupReset>
        <template v-if="props.scrollable">
          <DialogOverlay
            data-slot="overlay"
            :class="uiTheme.overlay({ class: props.ui?.overlay })"
            @enter="emits('enter')"
            @after-enter="emits('after:enter')"
            @leave="emits('leave')"
            @after-leave="emits('after:leave')"
          >
            <ReuseContentTemplate />
          </DialogOverlay>
        </template>

        <template v-else>
          <DialogOverlay
            v-if="props.overlay"
            data-slot="overlay"
            :class="uiTheme.overlay({ class: props.ui?.overlay })"
          />

          <ReuseContentTemplate />
        </template>
      </FieldGroupReset>
    </DialogPortal>
  </DialogRoot>
</template>
