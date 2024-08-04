// import { isValidAuth } from '@@/app/utils/auth';

/**
 * Middleware to check if page has not required authentication
 */
export default defineNuxtRouteMiddleware(() => {
  try {
    const auth = useStateAuth();
    const user = useStateUser();

    if (isValidAuth(auth.value) && user.value) {
      return navigateTo('/');
    }
  } catch (err: any) {
    abortNavigation(err);
  }
});
