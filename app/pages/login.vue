<script setup lang="ts">
import type { output } from 'zod';
import { loginSchema as schema } from '~~/shared/schemas/auth';

definePageMeta({
  layout: 'blank',
  middleware: 'unauth'
});

useHead({
  title: 'Login'
});

const formModel = reactive<output<typeof schema>>({
  email: '',
  password: ''
});
const formRef = useTemplateRef('formRef');
const loading = ref(false);
const toast = useToast();

const formHandler = defineFormHandler({
  schema,
  state: formModel,
  async  onSubmit(body) {
    try {
      loading.value = true;
      await useRequest('/login', {
        method: 'POST',
        body
      });
      toast.add({ description: 'Login success', color: 'success' });
      window.location.replace('/');
    }
    catch (err) {
      displayError(err, formRef);
    }
    finally {
      loading.value = false;
    }
  }
});
</script>

<template>
  <div class="w-full flex justify-center items-center min-h-screen bg-muted p-5">
    <div class="w-full max-w-[425px] shadow-lg rounded-xl bg-white dark:bg-default ring ring-default py-8 px-6 z-10">
      <div class="text-2xl text-center font-semibold mb-1">
        Welcome Back!
      </div>
      <div class="text-md text-center mb-8">
        Enter your email &amp; password to login
      </div>

      <UForm
        ref="formRef"
        v-bind="formHandler"
        class="space-y-6"
      >
        <UFormField
          label="Email"
          name="email"
        >
          <UInput
            v-model="formModel.email"
            placeholder="Enter your email"
            class="w-full"
            autocomplete="on"
            size="lg"
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
        >
          <InputPassword
            v-model="formModel.password"
            placeholder="Enter your password"
            class="w-full"
            size="lg"
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
      </UForm>
    </div>
  </div>
</template>
