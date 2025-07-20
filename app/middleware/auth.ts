export default defineNuxtRouteMiddleware(async () => {
  try {
    const auth = useAuth();
    if (!auth.valid()) {
      auth.clear();

      if (import.meta.client) {
        window.location.replace('/login');
        return;
      }

      return await navigateTo('/login');
    }
  }
  catch (err: any) {
    abortNavigation(err);
  }
});
