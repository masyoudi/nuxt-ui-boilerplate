/**
 * Auth middleware
 */
export default defineNuxtRouteMiddleware(async () => {
  try {
    const { isValid, clearAuth } = useStateAuth();

    if (!isValid()) {
      clearAuth();
      await nextTick();

      window.location.replace('/login');
    }
  } catch (err: any) {
    abortNavigation(err);
  }
});
