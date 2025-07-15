export default defineNuxtRouteMiddleware(async () => {
  try {
    const auth = useStateAuth();
    if (!auth.valid()) {
      return navigateTo('/login');
    }
  }
  catch (err: any) {
    abortNavigation(err);
  }
});
