<template>
  <aside :class="sidebarClass" @mouseenter="onMouseEnter(true)" @mouseleave="onMouseEnter(false)">
    <!-- Sidebar header -->
    <div class="relative w-full px-6 py-4" :class="{ 'lg:px-1': isMini && !isEntering }">
      <div class="flex w-full items-center gap-x-2" :class="{ 'lg:justify-center': isMini && !isEntering }">
        <div class="inline-flex grow-0 shrink-0">
          <img src="/favicon.ico" class="w-7" />
        </div>
        <div class="inline-flex text-xl font-bold text-center" :class="{ 'lg:hidden': isMini && !isEntering }">NUXT</div>
      </div>

      <!-- Toggle mini sidebar -->
      <div class="absolute hidden lg:inline-flex top-5 -right-3">
        <div
          class="inline-flex bg-white dark:bg-slate-800 border dark:border-slate-500 shadow rounded-full p-px select-none cursor-pointer"
          @click="onToggleMinify(!isMini)"
        >
          <UIcon
            :name="`i-heroicons:chevron-double-${isMini ? 'right' : 'left'}-16-solid`"
            class="w-5 h-5 text-slate-500 dark:text-slate-400"
          ></UIcon>
        </div>
      </div>
    </div>

    <!-- Sidebar content -->
    <div class="relative block w-full grow shrink py-2 overflow-y-auto px-4">
      <div v-for="(menu, i) in menus" :key="i" class="relative w-full mb-1">
        <UAccordion v-if="Array.isArray(menu.subs)" :items="[menu]" :default-open="menu.key === activeMenu.parent">
          <template #default="{ open: _open }">
            <NavMenu :label="menu.label" :icon="menu.icon" :ui="uiNavMenu">
              <template #trailing>
                <span class="inline-flex grow-0 shrink-0" :class="{ 'lg:hidden': isMini && !isEntering }">
                  <UIcon
                    name="i-heroicons-chevron-right-20-solid"
                    class="w-5 h-5 text-slate-500 transition-transform"
                    :class="{ 'transform rotate-90': _open }"
                  ></UIcon>
                </span>
              </template>
            </NavMenu>
          </template>

          <template #item>
            <div class="flex flex-col w-full gap-y-1" :class="{ 'lg:invisible lg:pointer-events-none': isMini && !isEntering }">
              <NavMenu
                v-for="(sub, s) in menu.subs"
                :key="'sub-' + i + s"
                :label="sub.label"
                :active="activeMenu.child === sub.key"
                :ui="{ padding: 'pl-9 pr-2 py-1.5' }"
                :to="sub.link"
              ></NavMenu>
            </div>
          </template>
        </UAccordion>

        <NavMenu v-else :label="menu.label" :active="activeMenu.parent === menu.key" :icon="menu.icon" :to="menu.link" :ui="uiNavMenu"></NavMenu>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import appConfig from '#build/app.config.mjs';

interface Props {
  open?: boolean;
  mini?: boolean;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'update:mini', val: boolean): void;
}>();

const _isOpen = ref(false);
const isOpen = computed({
  get: () => props.open ?? _isOpen.value,
  set: (val) => {
    _isOpen.value = val;
    emits('update:open', val);
  }
});

const _isMini = ref(false);
const isMini = computed({
  get: () => props.mini ?? _isMini.value,
  set: (val) => {
    _isMini.value = val;
    emits('update:mini', val);
  }
});
const isEntering = ref(false);

const menus = [
  {
    label: 'Home',
    icon: 'i-heroicons-home',
    link: '/',
    key: 'index'
  },
  {
    label: 'Components',
    icon: 'i-heroicons-square-3-stack-3d',
    key: 'components',
    subs: [
      {
        label: 'Forms',
        link: '/components/forms',
        key: 'components-forms'
      },
      {
        label: 'Data Table',
        link: '/components/data-table',
        key: 'components-data-table'
      }
    ]
  }
];

const uiSidebar = computed(() => appConfig.ui.sidebar);
const sidebarClass = computed(() => [
  uiSidebar.value.base,
  uiSidebar.value.background,
  uiSidebar.value.shadow,
  uiSidebar.value.width.normal,
  isMini.value && !isEntering.value ? uiSidebar.value.width.mini : '',
  uiSidebar.value.placing.default,
  isOpen.value ? uiSidebar.value.placing.normal : uiSidebar.value.placing.mobile
]);

const uiNavMenu = computed(() => ({
  ...(isMini.value && !isEntering.value && { base: 'justify-center' }),
  ...(isMini.value && !isEntering.value && { text: 'lg:hidden' })
}));

const router = useRouter();
const activeMenu = computed(() => {
  const { activeMenu: _val } = router.currentRoute.value.meta;
  const [parent, child] = (_val ? (Array.isArray(_val) ? _val : [_val]) : []) as string[];

  return {
    parent: parent ?? '',
    child: child ?? ''
  };
});

function onMouseEnter(entered: boolean) {
  if (!isMini.value) {
    return;
  }

  isEntering.value = entered;
}

function onToggleMinify(minified: boolean) {
  isMini.value = minified;

  if (!minified) {
    return;
  }

  isEntering.value = false;
}
</script>
