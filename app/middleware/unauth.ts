/**
 * Middleware to check if page has not required authentication
 */
export default defineNuxtRouteMiddleware(() => {
  try {
    const { isValid } = useStateAuth();

    if (isValid()) {
      return navigateTo('/');
    }
  } catch (err: any) {
    abortNavigation(err);
  }
});
