<template>
  <div class="relative w-full min-h-screen">
    <!-- Sidebar -->
    <AppSidebar v-model:open="isOpenSidebar" v-model:mini="isMiniSidebar" />

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
const title = ref('');
const openLogout = ref(false);

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

function setTitle() {
  const txt = document.title;
  title.value = txt.trim();
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
