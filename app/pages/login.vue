<script setup lang="ts">
definePageMeta({
  layout: 'blank',
  middleware: 'unauth'
});

useHead({
  title: 'Login'
});

const formModel = reactive({
  email: '',
  password: ''
});
const formRef = ref();
const loading = ref(false);
const toast = useToast();

async function onSubmit() {
  try {
    loading.value = true;
    await useRequest('/login?ahs=s', {
      method: 'POST',
      body: formModel
    });
    toast.add({ description: 'Login success', color: 'success' });
    window.location.replace('/');
  }
  catch (err) {
    loading.value = false;
    useRequestError(err, formRef);
  }
}
</script>

<template>
  <div class="wrapper w-full flex justify-center items-center min-h-screen p-5">
    <div
      class="
        w-full max-w-[425px] shadow-lg rounded-xl bg-white/20 dark:bg-default backdrop-blur-md
        border border-white dark:border-accented py-8 px-6 z-10
      "
    >
      <div class="text-2xl text-center font-semibold mb-1">
        Welcome Back!
      </div>
      <div class="text-md text-center mb-8">
        Enter your email &amp; password to login
      </div>

      <FormRoot
        ref="formRef"
        class="space-y-6"
        @submit="onSubmit"
      >
        <UFormField
          label="Email"
          name="email"
        >
          <UInput
            v-model="formModel.email"
            placeholder="Enter your email"
            :ui="{
              base: 'bg-white/10 shadow'
            }"
            class="w-full"
            autocomplete="on"
            size="lg"
            style="--ui-border-accented: #fff"
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
        >
          <InputPassword
            v-model="formModel.password"
            placeholder="Enter your password"
            :ui="{
              base: 'bg-white/10 shadow'
            }"
            class="w-full"
            size="lg"
            style="--ui-border-accented: #fff"
          />
        </UFormField>

        <div class="pt-5">
          <UButton
            size="lg"
            block
            type="submit"
            :loading="loading"
          >
            Login
          </UButton>
        </div>
      </FormRoot>
    </div>

    <div class="wave" />
    <div class="wave" />
    <div class="wave" />
  </div>
</template>

<style lang="css" scoped>
.wrapper {
  background: linear-gradient(315deg, oklch(66.76% 0.1757 247.04) 78%, oklch(89.19% 0.1561 186.15) 98%);
  background-size: 400% 400%;
  background-attachment: fixed;
}

.wave {
  background: rgb(255 255 255 / 25%);
  border-radius: 1000% 1000% 0 0;
  position: fixed;
  width: 200%;
  height: 60vh;
  animation: wave 10s -3s linear infinite;
  transform: translate3d(0, 0, 0);
  opacity: 0.8;
  bottom: 0;
  left: 0;
}

.wrapper > .wave:nth-of-type(2) {
  bottom: -1.25em;
  animation: wave 18s linear reverse infinite;
  opacity: 0.8;
}

.wrapper > .wave:nth-of-type(3) {
  bottom: -2.5em;
  animation: wave 20s -1s reverse infinite;
  opacity: 0.9;
}

@keyframes wave {
  2% {
    transform: translateX(1);
  }

  25% {
    transform: translateX(-25%);
  }

  50% {
    transform: translateX(-50%);
  }

  75% {
    transform: translateX(-25%);
  }

  100% {
    transform: translateX(1);
  }
}
</style>
