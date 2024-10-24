import authValidator from '~/utils/auth';

export default defineNuxtRouteMiddleware(async () => {
  try {
    const authState = useStateAuth();
    const userState = useStateUser();
    const authCheck = authValidator(authState.value);

    if (!authState.value || !userState.value || (authState.value && !authCheck.valid())) {
      authState.value = '';

      if (import.meta.client) {
        window.location.replace('/login');
        return;
      }

      return await navigateTo('/login');
    }
  }
  catch (err: any) {
    abortNavigation(err);
  }
});
