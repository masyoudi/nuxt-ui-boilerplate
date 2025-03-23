<script setup lang="ts">
import { useMutationObserver } from '@vueuse/core';
import AppSidebar from '~/components/AppSidebar.vue';

const sidebarOpen = ref(false);
const sidebarMini = useCookie('sidebarmini', { default: () => false });
const title = ref('');
const openLogout = ref(false);
const loadingLogout = ref(false);

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
    useRequestError(err);
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
    style="--sidebar-width: 265px"
  >
    <AppSidebar
      v-model:open="sidebarOpen"
      v-model:mini="sidebarMini"
    />
    <BackDrop
      v-model="sidebarOpen"
      class="lg:hidden bg-slate-500/30 backdrop-blur-xs lg:pointer-events-none z-[18] lg:-z-10"
      :teleport="false"
      @click.prevent.stop="sidebarOpen = false"
    />
    <div
      class="relative w-full h-full flex flex-col transition-[padding] ease-[cubic-bezier(0.5,1,0.89,1)] duration-200 overflow-x-hidden overflow-y-auto bg-[#f2f7fb]"
      :class="sidebarMini ? 'lg:pl-[70px]' : 'lg:pl-[var(--sidebar-width)]'"
    >
      <header class="sticky flex grow-0 shrink-0 w-full h-16 bg-white/80 backdrop-blur-xs top-0 shadow-sm px-2 z-10">
        <div class="flex grow h-full">
          <div
            class="inline-flex lg:hidden h-full items-center cursor-pointer select-none p-2"
            @click="sidebarOpen = true"
          >
            <UIcon name="lucide:menu" />
          </div>
          <div class="inline-flex h-full items-center select-none p-2">
            <span class="text-lg font-semibold">{{ title }}</span>
          </div>
        </div>
        <div class="flex grow h-full justify-end gap-x-2">
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
                icon="lucide:circle-user-round"
                size="xl"
                class="text-slate-500 p-1"
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
