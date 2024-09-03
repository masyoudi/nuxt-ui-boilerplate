/**
 * Middleware to check if page has not required authentication
 */
export default defineNuxtRouteMiddleware(() => {
  try {
    const { isAuthenticated } = useStateAuth();

    if (isAuthenticated()) {
      return navigateTo('/');
    }
  } catch (err: any) {
    abortNavigation(err);
  }
});
