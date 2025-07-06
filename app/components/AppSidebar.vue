<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import theme from '~/utils/theme/sidebar';

const open = defineModel<boolean>('open', {
  default: false,
  required: false
});

const mini = defineModel<boolean>('mini', {
  default: false,
  required: false
});

const isHovered = ref(false);
const isMinified = computed(() => mini.value && !isHovered.value);
const _isChildVisible = ref(!mini.value);
const isChildVisible = computed(() => mini.value ? _isChildVisible.value : true);

const menus = [
  {
    id: 'home',
    label: 'Home',
    link: '/',
    icon: 'lucide:house',
    subs: []
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

const onHovered = useThrottleFn((hovered: boolean) => {
  isHovered.value = hovered;
  setTimeout(() => _isChildVisible.value = hovered, hovered ? 100 : 0);
}, 200);

async function onMinify() {
  const value = !mini.value;
  await nextTick();
  mini.value = value;
  isHovered.value = false;
  _isChildVisible.value = false;
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
</script>

<template>
  <aside
    :class="ui.root({ open: open, mini: isMinified })"
    @mouseenter="() => onHovered(true)"
    @mouseleave="() => onHovered(false)"
  >
    <div
      :class="ui.toggle()"
      @click="onMinify"
    >
      <UIcon
        name="lucide:arrow-left-to-line"
        :class="[ui.toggleIcon(), { 'rotate-180': mini }]"
      />
    </div>
    <div class="flex h-16 grow-0 items-center shrink-0 px-3">
      <div class="text-lg font-bold">
        APP
      </div>
    </div>
    <div class="flex flex-col grow shrink overflow-y-auto py-4">
      <div
        v-for="(menu, i) in menus"
        :key="i"
        :class="ui.menuWrapper()"
      >
        <UCollapsible
          v-if="menu.subs.length > 0"
          :default-open="menu.subs.some((s) => isMenuActive([menu.id, s.id]))"
          class="flex flex-col w-full"
          :ui="{ content: `${!isChildVisible ? 'lg:hidden' : ''} py-0.5` }"
        >
          <button :class="ui.menu({ class: 'group px-3', mini: isMinified })">
            <span :class="ui.menuIcon({ class: 'size-5' })">
              <UIcon
                :name="menu.icon"
                class="size-5"
              />
            </span>
            <span :class="ui.menuLabel({ childVisible: isChildVisible })">{{ menu.label }}</span>
            <span
              :class="ui.menuIcon({ class: `${!isChildVisible ? 'lg:hidden' : ''}` })"
            >
              <UIcon
                name="lucide:chevron-right"
                class="size-4 transition-transform group-data-[state=open]:rotate-90"
              />
            </span>
          </button>

          <template #content>
            <div
              v-for="(sub, s) in menu.subs"
              :key="i + s"
              class="w-full mb-0.5"
            >
              <NuxtLink
                :class="ui.menu({ class: 'pl-10 pr-3', menuActive: isMenuActive([menu.id, sub.id]) })"
                :to="sub.link"
              >
                <span :class="ui.menuLabel({ childVisible: isChildVisible })">{{ sub.label }}</span>
              </NuxtLink>
            </div>
          </template>
        </UCollapsible>

        <NuxtLink
          v-if="!menu.subs.length"
          :class="ui.menu({ class: 'px-3', mini: isMinified, menuActive: isMenuActive(menu.id) })"
          :to="menu.link"
        >
          <span :class="ui.menuIcon({ class: 'size-5' })">
            <UIcon
              :name="menu.icon"
              class="size-5"
            />
          </span>
          <span :class="ui.menuLabel({ childVisible: isChildVisible })">{{ menu.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>
