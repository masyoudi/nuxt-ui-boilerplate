<template>
  <div class="relative w-full flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-700 to-sky-300 px-4 py-20">
    <UCard class="w-full max-w-[450px]" :ui="{ shadow: 'shadow-lg' }">
      <div class="text-xl font-bold text-slate-800 text-center mb-1">Welcome back</div>
      <p class="text-center text-slate-600 mb-6">Login to your account</p>
      <FormRoot ref="formRef" class="space-y-4" @submit="() => onSubmit()">
        <UFormGroup label="Email" name="email">
          <UInput v-model="formModel.email" placeholder="Enter your email address" size="md" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="formModel.password" type="password" placeholder="Enter your secret password" size="md" />
        </UFormGroup>

        <div class="flex pt-5">
          <UButton type="submit" :loading="status === 'pending'" block> Submit </UButton>
        </div>
      </FormRoot>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank',
  middleware: 'unauth'
});

useHead({
  title: 'Login'
});

const formRef = ref();
const formModel = reactive({
  email: '',
  password: ''
});

const { status, execute: onSubmit } = useRequest('/api/login', {
  method: 'POST',
  body: formModel,
  formRef,
  onResponse({ response }) {
    if (!response.ok) {
      return;
    }

    window.location.replace('/');
  }
});
</script>
