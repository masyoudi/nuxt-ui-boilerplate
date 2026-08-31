import { useAuth } from '~/composables/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const event = nuxtApp.ssrContext?.event;
  const context = event?.context;
  if (!event || !context?.session) {
    return;
  }

  const auth = useAuth();
  const user = {
    name: context.session.name,
    email: context.session.email
  };

  auth.setState({
    user,
    expiry: context.session.expiry,
    permissions: []
  });
});
