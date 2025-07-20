export default defineNuxtRouteMiddleware(async () => {
  try {
    const auth = useAuth();
    if (auth.valid()) {
      return navigateTo('/');
    }
  }
  catch (err: any) {
    abortNavigation(err);
  }
});
