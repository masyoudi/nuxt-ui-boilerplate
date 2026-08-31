<script setup lang="ts">
import z from 'zod';

definePageMeta({
  layout: 'blank',
  middleware: 'unauth'
});

useHead({
  title: 'Login'
});

const formSchema = z.object({
  email: z.email('Please enter email address'),
  password: z.string().refine((val) => val.trim().length > 0, 'Please enter password')
});

const formModel = reactive<z.output<typeof formSchema>>({
  email: '',
  password: ''
});

const loading = ref(false);
const toast = useToast();
const auth = useAuth();

const formHandler = defineFormHandler({
  state: formModel,
  schema: formSchema,
  async onSubmit(data) {
    try {
      loading.value = true;

      const user = {
        id: new Date().valueOf().toString(),
        name: data.email.split('@').at(0)!,
        email: data.email
      };
      const permissions = [
        'dashboard'
      ];

      const d = new Date();
      const isValidAuthState = await auth.setState({
        user,
        token: new Date().valueOf().toString(),
        permissions,
        expiry: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, d.getHours(), d.getMinutes()).valueOf()
      });

      if (!isValidAuthState) {
        toast.add({ description: 'Login failed', color: 'error' });
        return;
      }

      toast.add({ description: 'Login success', color: 'success' });
      window.location.replace('/');
    }
    catch (err) {
      loading.value = false;
      displayError(err);
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
