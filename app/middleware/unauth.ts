/**
 * Middleware to check if page has not required authentication
 */
export default defineNuxtRouteMiddleware(() => {
  try {
    //
  } catch (err: any) {
    abortNavigation(err);
  }
});
