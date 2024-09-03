/**
 * Auth middleware
 */
export default defineNuxtRouteMiddleware(async () => {
  try {
    const { isAuthenticated, clear } = useStateAuth();

    if (!isAuthenticated()) {
      clear();
      await nextTick();

      window.location.replace('/login');
    }
  } catch (err: any) {
    abortNavigation(err);
  }
});
