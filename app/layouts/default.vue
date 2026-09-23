<script setup lang="ts">
import { useMutationObserver } from '@vueuse/core';
import AppSidebar from '~/components/AppSidebar.vue';

const sidebarOpen = ref(false);
const sidebarMini = useCookie('sidebarmini', { default: () => false });
const title = ref('');
const openLogout = ref(false);
const loadingLogout = ref(false);
const sidebarRef = useTemplateRef('sidebarRef');

const accountActions = shallowRef([
  {
    label: 'Profile',
    icon: 'lucide:user'
  },
  {
    label: 'Logout',
    icon: 'lucide:log-out',
    onSelect: () => {
      openLogout.value = true;
    }
  }
]);

const router = useRouter();

function setTitle() {
  const _title = document.title;
  title.value = _title.substring(0, _title.lastIndexOf('|') - 1).trim();
}

async function onLogout() {
  try {
    loadingLogout.value = true;
    await useRequest('/logout');
    location.replace('/login');
  }
  catch (err: any) {
    loadingLogout.value = false;
    displayError(err);
  }
}

router.beforeEach(() => {
  sidebarOpen.value = false;
});

onMounted(() => {
  const config: MutationObserverInit = {
    subtree: true,
    characterData: true,
    childList: true
  };

  setTitle();
  useMutationObserver(document.querySelector('title'), () => {
    setTitle();
  }, config);
});
</script>

<template>
  <div
    class="relative w-full h-svh flex overflow-hidden"
    :style="{
      '--sidebar-width': '265px',
      '--sidebar-mini-width': '65px',
      '--sidebar-ease': 'cubic-bezier(0.22, 1, 0.36, 1)'
    }"
  >
    <AppSidebar
      ref="sidebarRef"
      v-model:open="sidebarOpen"
      v-model:mini="sidebarMini"
    />
    <BackDrop
      v-model="sidebarOpen"
      class="lg:hidden bg-slate-500/30 backdrop-blur-xs lg:pointer-events-none z-18 lg:-z-10"
      :portal="false"
      @click.prevent.stop="sidebarOpen = false"
    />
    <div
      class="
        relative w-full h-full flex flex-col transition-[padding] ease-(--sidebar-ease)
        duration-300 overflow-x-hidden overflow-y-auto bg-muted dark:bg-muted
      "
      :class="sidebarMini ? 'lg:pl-(--sidebar-mini-width)' : 'lg:pl-(--sidebar-width)'"
    >
      <header class="sticky flex grow-0 shrink-0 w-full h-16 bg-default dark:bg-elevated backdrop-blur-xs top-0 border-b border-b-default px-4 z-10">
        <div class="flex grow h-full gap-x-3">
          <div class="inline-flex lg:hidden h-full items-center">
            <UButton
              icon="lucide:menu"
              color="neutral"
              variant="outline"
              size="sm"
              @click="sidebarOpen = true"
            />
          </div>
          <div class="hidden lg:inline-flex h-full items-center">
            <UButton
              icon="lucide:menu"
              color="neutral"
              variant="outline"
              size="sm"
              @click="sidebarRef?.toggleMinify()"
            />
          </div>
          <div class="inline-flex h-full items-center select-none">
            <span class="text-lg font-semibold">{{ title }}</span>
          </div>
        </div>
        <div class="flex grow h-full justify-end gap-x-3">
          <div class="inline-flex items-center">
            <AppTheme />
          </div>
          <div class="inline-flex items-center">
            <UDropdownMenu
              size="lg"
              :items="accountActions"
              :content="{
                align: 'end'
              }"
              :ui="{
                content: 'w-34'
              }"
            >
              <UButton
                color="neutral"
                variant="ghost"
                icon="ph:user-circle-duotone"
                size="xl"
                class="text-dimmed p-0 rounded-full"
                :ui="{
                  leadingIcon: 'size-8'
                }"
              />
            </UDropdownMenu>
          </div>
        </div>
      </header>
      <main class="relative w-full">
        <slot />
      </main>
    </div>

    <AppModal v-model="openLogout">
      <div class="text-xl text-center font-semibold mb-6">
        Logout
      </div>
      <div class="text-lg text-center mb-6">
        Are you sure you want to logout?
      </div>
      <div class="flex flex-wrap justify-center gap-3">
        <UButton
          color="neutral"
          variant="outline"
          class="px-5"
          @click="openLogout = false"
        >
          Cancel
        </UButton>

        <UButton
          color="danger"
          class="px-5"
          :loading="loadingLogout"
          @click="onLogout"
        >
          Logout
        </UButton>
      </div>
    </AppModal>
  </div>
</template>
