import { useStateUser } from '~/composables/state';

export default defineNuxtPlugin((nuxtApp) => {
  const event = nuxtApp.ssrContext?.event;
  if (!event) {
    return;
  }

  const context = event.context;
  const auth = useStateAuth();

  auth.value = context.auth;

  if (context.session) {
    const userData = {
      name: context.session.name,
      email: context.session.email
    };
    const user = useStateUser();

    user.value = userData;
  }
});
