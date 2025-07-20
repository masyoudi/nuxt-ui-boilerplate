import { useAuth } from '~/composables/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const event = nuxtApp.ssrContext?.event;
  if (!event) {
    return;
  }

  const context = event.context;
  if (context.session) {
    const auth = useAuth();
    const user = {
      name: context.session.name,
      email: context.session.email
    };

    auth.setState({
      user,
      token: context.auth,
      permissions: []
    });
  }
});
