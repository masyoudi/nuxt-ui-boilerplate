export default defineNuxtRouteMiddleware(async () => {
  try {
    const auth = useAuth();
    if (!auth.valid()) {
      return navigateTo('/login');
    }
  }
  catch (err: any) {
    abortNavigation(err);
  }
});
