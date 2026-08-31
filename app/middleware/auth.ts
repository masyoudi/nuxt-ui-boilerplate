export default defineNuxtRouteMiddleware(async () => {
  try {
    const { isValid: isAuthValid } = useAuth();
    if (!isAuthValid.value) {
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
