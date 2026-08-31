export default defineNuxtRouteMiddleware(async () => {
  try {
    const { isValid: isAuthValid } = useAuth();
    if (isAuthValid.value) {
      return navigateTo('/');
    }
  }
  catch (err: any) {
    abortNavigation(err);
  }
});
