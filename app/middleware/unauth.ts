import authValidator from '~/utils/auth';

export default defineNuxtRouteMiddleware(async () => {
  try {
    const authState = useStateAuth();
    const userState = useStateUser();
    const authCheck = authValidator(authState.value);

    if (userState.value && authState.value && authCheck.valid()) {
      return navigateTo('/');
    }
  }
  catch (err: any) {
    abortNavigation(err);
  }
});
