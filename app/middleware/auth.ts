import { isValidAuth } from '@/utils/auth';

/**
 * Auth validator with named middleware
 */
export default defineNuxtRouteMiddleware(async () => {
  try {
    const auth = useStateAuth();
    const user = useStateUser();

    // Redirect to login page when user auth is invalid.
    if (!auth.value || !isValidAuth(auth.value) || !user.value) {
      auth.value = '';

      if (import.meta.client) {
        window.location.replace('/login');
        return;
      }

      return await navigateTo('/login');
    }
  } catch (err: any) {
    abortNavigation(err);
  }
});
