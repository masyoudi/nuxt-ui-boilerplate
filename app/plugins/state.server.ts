import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(async (nuxtApp) => {
  const event = nuxtApp.ssrContext?.event;
  if (!event) {
    return;
  }

  const user = useStateUser();
  const auth = useStateAuth();

  auth.value = event.context.auth;

  if (!event.context.session) {
    return;
  }

  user.value = {
    id: event.context.session.id,
    name: event.context.session.name
  };
});
