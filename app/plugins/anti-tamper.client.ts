import type { AuthSchema } from '~/composables/auth';

export default defineNuxtPlugin(() => {
  const authState = useState<AuthSchema | null>('auth');
  const nativeReload = window.location.reload.bind(window.location);

  Object.freeze({ ...authState.value });
  Object.defineProperty(window.location, 'reload', {
    writable: false,
    configurable: false
  });

  const onWatch = () => {
    nativeReload();

    setTimeout(() => {
      showError({ status: 403, message: 'Unauthorized state mutation detected.' });
    }, 1000);
  };

  watch(authState, onWatch);
});
