<script setup lang="ts">
import theme from '~/theme/sidebar';

interface SidebarMenuItem {
  id: string;
  label: string;
  link: string;
  icon?: string;
  subs?: SidebarMenuItem[];
}

const open = defineModel<boolean>('open', {
  default: false,
  required: false
});

const mini = defineModel<boolean>('mini', {
  default: false,
  required: false
});

const isHovered = ref(false);
const isFocused = ref(false);
const isInteracting = computed(() => isHovered.value || isFocused.value);
const isMinified = computed(() => mini.value && !isInteracting.value);

const menus: SidebarMenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    link: '/',
    icon: 'lucide:house'
  },
  {
    id: 'components',
    label: 'Components',
    link: '/',
    icon: 'lucide:layers-3',
    subs: [
      {
        id: 'datepicker',
        label: 'Datepicker',
        link: '/components/datepicker'
      },
      {
        id: 'input',
        label: 'Input',
        link: '/components/input'
      },
      {
        id: 'loading',
        label: 'Loading',
        link: '/components/loading'
      },
      {
        id: 'modal',
        label: 'Modal',
        link: '/components/modal'
      },
      {
        id: 'select',
        label: 'Select',
        link: '/components/select'
      },
      {
        id: 'table',
        label: 'Table',
        link: '/components/table'
      },
      {
        id: 'upload',
        label: 'Upload',
        link: '/components/upload'
      }
    ]
  }
];

const ui = theme();

const route = useRoute();

function onPointer(hovered: boolean) {
  isHovered.value = hovered;
}

function onFocusOut(event: FocusEvent) {
  const sidebar = event.currentTarget as HTMLElement;
  const nextTarget = event.relatedTarget as Node | null;

  if (!nextTarget || !sidebar.contains(nextTarget)) {
    isFocused.value = false;
  }
}

function onMinify() {
  mini.value = !mini.value;
  isHovered.value = false;
  isFocused.value = false;
}

function isMenuActive(ids: string | string[]) {
  const { activeMenu } = route.meta;
  const metaActive = activeMenu ? Array.isArray(activeMenu) ? activeMenu : [activeMenu] : [];
  if (!metaActive.length || !metaActive.every((v) => typeof v === 'string')) {
    return false;
  }

  if (!Array.isArray(ids)) {
    return metaActive.includes(ids);
  }

  return ids.every((v) => metaActive.includes(v));
}

defineExpose({
  toggleMinify: onMinify
});
</script>

<template>
  <aside
    :class="ui.root({ open: open, mini: isMinified })"
    @pointerenter="onPointer(true)"
    @pointerleave="onPointer(false)"
    @focusin="isFocused = true"
    @focusout="onFocusOut"
  >
    <div class="flex h-16 grow-0 items-center shrink-0 gap-2 px-5">
      <div class="flex shrink-0">
        <UButton
          icon="ph:rocket-launch-fill"
          color="primary"
          size="sm"
          class="hover:bg-primary p-1"
          :ui="{
            leadingIcon: 'size-5'
          }"
        />
      </div>
      <div :class="ui.brandLabel({ expanded: !isMinified })">
        NUXTAPP
      </div>
    </div>
    <div class="flex flex-col grow shrink overflow-y-auto py-4">
      <div
        v-for="menu in menus"
        :key="menu.id"
        :class="ui.menuWrapper()"
      >
        <UCollapsible
          v-if="menu.subs?.length"
          :default-open="menu.subs.some((sub) => isMenuActive([menu.id, sub.id]))"
          class="flex flex-col w-full"
          :ui="{ content: ui.submenu({ expanded: !isMinified }) }"
        >
          <button :class="ui.menu({ class: 'group px-3', mini: isMinified })">
            <span :class="ui.menuIcon({ class: 'size-5' })">
              <UIcon
                v-if="menu.icon"
                :name="menu.icon"
                class="size-5"
              />
            </span>
            <span :class="ui.menuLabel({ expanded: !isMinified })">{{ menu.label }}</span>
            <span :class="ui.menuTrailing({ expanded: !isMinified })">
              <UIcon
                name="lucide:chevron-right"
                class="size-4 transition-transform group-data-[state=open]:rotate-90"
              />
            </span>
          </button>

          <template #content>
            <div class="min-h-0 overflow-hidden">
              <div
                v-for="sub in menu.subs"
                :key="sub.id"
                class="w-full mb-0.5"
              >
                <UCollapsible
                  v-if="sub.subs?.length"
                  :default-open="sub.subs.some((child) => isMenuActive([menu.id, sub.id, child.id]))"
                  class="flex flex-col w-full"
                  :ui="{ content: ui.submenu({ expanded: !isMinified }) }"
                >
                  <button :class="ui.menu({ class: 'group pl-10 pr-3' })">
                    <span :class="ui.menuLabel({ expanded: !isMinified })">{{ sub.label }}</span>
                    <span :class="ui.menuTrailing({ expanded: !isMinified })">
                      <UIcon
                        name="lucide:chevron-right"
                        class="size-4 transition-transform group-data-[state=open]:rotate-90"
                      />
                    </span>
                  </button>

                  <template #content>
                    <div class="min-h-0 overflow-hidden">
                      <div
                        v-for="child in sub.subs"
                        :key="child.id"
                        class="w-full mb-0.5"
                      >
                        <NuxtLink
                          :class="ui.menu({
                            class: 'pl-14 pr-3',
                            menuActive: isMenuActive([menu.id, sub.id, child.id])
                          })"
                          :to="child.link"
                        >
                          <span :class="ui.menuLabel({ expanded: !isMinified })">{{ child.label }}</span>
                        </NuxtLink>
                      </div>
                    </div>
                  </template>
                </UCollapsible>

                <NuxtLink
                  v-else
                  :class="ui.menu({ class: 'pl-10 pr-3', menuActive: isMenuActive([menu.id, sub.id]) })"
                  :to="sub.link"
                >
                  <span :class="ui.menuLabel({ expanded: !isMinified })">{{ sub.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </template>
        </UCollapsible>

        <NuxtLink
          v-else
          :class="ui.menu({ class: 'px-3', mini: isMinified, menuActive: isMenuActive(menu.id) })"
          :to="menu.link"
        >
          <span :class="ui.menuIcon({ class: 'size-5' })">
            <UIcon
              v-if="menu.icon"
              :name="menu.icon"
              class="size-5"
            />
          </span>
          <span :class="ui.menuLabel({ expanded: !isMinified })">{{ menu.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>
