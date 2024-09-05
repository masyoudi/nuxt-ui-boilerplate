<template>
  <div class="relative w-full min-h-screen">
    <!-- Sidebar -->
    <aside :class="sidebarClass" @mouseenter="onMouseEnter(true)" @mouseleave="onMouseEnter(false)">
      <!-- Sidebar header -->
      <div class="relative w-full px-6 py-4" :class="{ 'lg:px-1': isMiniSidebar && !isEnterSidebar }">
        <div class="flex w-full items-center gap-x-2" :class="{ 'lg:justify-center': isMiniSidebar && !isEnterSidebar }">
          <div class="inline-flex grow-0 shrink-0">
            <img src="/favicon.ico" class="w-7" />
          </div>
          <div class="inline-flex text-xl font-bold text-center" :class="{ 'lg:hidden': isMiniSidebar && !isEnterSidebar }">NUXT</div>
        </div>

        <!-- Toggle mini sidebar -->
        <div class="absolute hidden lg:inline-flex top-5 -right-3">
          <div
            class="inline-flex bg-white dark:bg-slate-800 border dark:border-slate-500 shadow rounded-full p-px select-none cursor-pointer"
            @click="onToggleMinify(!isMiniSidebar)"
          >
            <UIcon
              :name="`i-heroicons:chevron-double-${isMiniSidebar ? 'right' : 'left'}-16-solid`"
              class="w-5 h-5 text-slate-500 dark:text-slate-400"
            ></UIcon>
          </div>
        </div>
      </div>

      <!-- Sidebar content -->
      <div class="relative block w-full grow shrink py-2 overflow-y-auto px-4">
        <div v-for="(menu, i) in menus" :key="i" class="relative w-full mb-1">
          <UAccordion v-if="Array.isArray(menu.subs)" :items="[menu]" :default-open="menu.key === activeMenu.parent">
            <template #default="{ open }">
              <NavMenu :label="menu.label" :icon="menu.icon" :ui="uiNavMenu">
                <template #trailing>
                  <span class="inline-flex grow-0 shrink-0" :class="{ 'lg:hidden': isMiniSidebar && !isEnterSidebar }">
                    <UIcon
                      name="i-heroicons-chevron-right-20-solid"
                      class="w-5 h-5 text-slate-500 transition-transform"
                      :class="{ 'transform rotate-90': open }"
                    ></UIcon>
                  </span>
                </template>
              </NavMenu>
            </template>

            <template #item>
              <div class="flex flex-col w-full gap-y-1" :class="{ 'invisible pointer-events-none': isMiniSidebar && !isEnterSidebar }">
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

    <!-- Sidebar overlay -->
    <Transition v-bind="uiSidebar.overlay.transition">
      <div v-if="isOpenSidebar" :class="uiSidebar.overlay.base" @click="isOpenSidebar = false"></div>
    </Transition>

    <main
      class="relative w-full min-h-screen bg-[#eaeef7] dark:bg-[#24293a] transition-all transform duration-300"
      :class="isMiniSidebar ? uiSidebar.constraint.padding.mini : uiSidebar.constraint.padding.normal"
    >
      <!-- Navbar -->
      <nav :class="navbarClass">
        <!-- Navbar left -->
        <div :class="uiNavbar.section">
          <div class="lg:hidden text-slate-400 cursor-pointer" :class="uiNavbar.item" @click="isOpenSidebar = !isOpenSidebar">
            <UIcon name="i-heroicons:ellipsis-horizontal-circle" class="w-6 h-6"></UIcon>
          </div>
          <div class="text-slate-600 dark:text-slate-400" :class="uiNavbar.item">
            <div class="text-lg font-medium">{{ title }}</div>
          </div>
        </div>

        <!-- Navbar right -->
        <div :class="uiNavbar.section" class="justify-end">
          <div :class="uiNavbar.item">
            <ClientOnly>
              <UButton
                :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                color="primary"
                variant="ghost"
                aria-label="Theme"
                size="sm"
                @click="isDark = !isDark"
              />
              <template #fallback>
                <div class="w-8 h-8" />
              </template>
            </ClientOnly>
          </div>
          <div :class="uiNavbar.item">
            <UDropdown :items="[userMenus]" :popper="{ placement: 'bottom-end', strategy: 'fixed' }">
              <UAvatar icon="i-heroicons-user-circle" :ui="uiAvatar" size="sm" />
            </UDropdown>
          </div>
        </div>
      </nav>

      <!-- Content -->
      <div class="relative w-full">
        <slot></slot>
      </div>
    </main>

    <UModal v-model="openLogout">
      <div class="w-full px-4 py-7">
        <div class="text-xl font-semibold text-center mb-6">Logout</div>
        <p class="text-center mb-8">Are you sure you want to logout?</p>
        <div class="flex justify-center gap-x-4">
          <UButton @click="openLogout = false">Cancel</UButton>
          <UButton :loading="loading" color="red" @click="doLogout">Logout</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useMutationObserver } from '@vueuse/core';
import appConfig from '#build/app.config.mjs';

const isOpenSidebar = ref(false);
const isMiniSidebar = useCookie('sidebarmini', { default: () => false, watch: true });
const isEnterSidebar = ref(false);
const title = ref('');
const openLogout = ref(false);

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

const userMenus = [
  {
    label: 'Profile',
    icon: 'i-heroicons-user-circle'
  },
  {
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-start-on-rectangle-solid',
    click: () => (openLogout.value = true)
  }
];
const loading = ref(false);

const uiSidebar = computed(() => appConfig.ui.sidebar);
const sidebarClass = computed(() => [
  uiSidebar.value.base,
  uiSidebar.value.background,
  uiSidebar.value.shadow,
  uiSidebar.value.width.normal,
  isMiniSidebar.value && !isEnterSidebar.value ? uiSidebar.value.width.mini : '',
  uiSidebar.value.placing.default,
  isOpenSidebar.value ? uiSidebar.value.placing.normal : uiSidebar.value.placing.mobile
]);

const uiNavMenu = computed(() => ({
  ...(isMiniSidebar.value && !isEnterSidebar.value && { base: 'justify-center' }),
  ...(isMiniSidebar.value && !isEnterSidebar.value && { text: 'lg:hidden' })
}));

const uiNavbar = computed(() => appConfig.ui.navbar);
const navbarClass = computed(() => [
  uiNavbar.value.base,
  uiNavbar.value.background,
  uiNavbar.value.height,
  uiNavbar.value.padding,
  uiNavbar.value.shadow
]);

const uiAvatar = /* ui */ {
  background: 'bg-white',
  icon: {
    base: 'text-slate-500',
    size: {
      sm: 'h-8 w-8'
    }
  }
};

const colorMode = useColorMode();
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: () => (colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark')
});

const router = useRouter();
const activeMenu = computed(() => {
  const { activeMenu: _val } = router.currentRoute.value.meta;
  const [parent, child] = (_val ? (Array.isArray(_val) ? _val : [_val]) : []) as string[];

  return {
    parent: parent ?? '',
    child: child ?? ''
  };
});

function setTitle() {
  const txt = document.title;
  title.value = txt.trim();
}

function onMouseEnter(entered: boolean) {
  if (!isMiniSidebar.value) {
    return;
  }

  isEnterSidebar.value = entered;
}

function onToggleMinify(minified: boolean) {
  isMiniSidebar.value = minified;

  if (!minified) {
    return;
  }

  isEnterSidebar.value = false;
}

async function doLogout() {
  try {
    loading.value = true;
    await useRequest('/api/logout');
    window.location.replace('/login');
  } catch {
    loading.value = false;
  }
}

onMounted(() => {
  setTitle();
  useMutationObserver(document.head.querySelector('title'), setTitle, { childList: true });
});
</script>
