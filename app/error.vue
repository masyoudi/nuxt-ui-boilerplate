<template>
  <NuxtErrorBoundary>
    <UApp
      :toaster="{ position: 'top-right', expand: true }"
      :tooltip="{ delayDuration: 150, skipDelayDuration: 100 }"
    >
      <NuxtLayout :name="auth.valid() ? 'default' : 'blank'">
        <div class="w-full px-4 mx-auto">
          <div
            class="flex w-full items-center"
            :class="!auth.valid() ? 'min-h-screen' : ''"
          >
            <div class="relative block w-full py-6">
              <div class="text-6xl font-bold text-center">
                {{ error?.statusCode ? error.statusCode : '500' }}
              </div>
              <div class="text-lg text-center">
                {{ error?.message ? error.message : title }}
              </div>

              <div
                v-if="!auth.valid()"
                class="relative flex justify-center pt-10"
              >
                <UButton
                  variant="outline"
                  class="px-5"
                  @click="goToHome"
                >
                  Home
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </NuxtLayout>
      <NuxtRouteAnnouncer />
    </UApp>
  </NuxtErrorBoundary>
</template>

<script lang="ts" setup>
interface Props {
  error: Record<string, any>;
}

const props = defineProps<Props>();
const title = ref('Oops! Something went wrong');

useHead({
  title: props.error ? (props.error?.message ? props.error.message : title) : title
});

const auth = useStateAuth();

function goToHome() {
  clearError({ redirect: '/' });
}
</script>
