/**
 * Show error message with toast/form field if applicable
 * @param err - Error result
 * @param formRef - FormRoot ref
 */
export function displayError(err: any, formRef?: Ref) {
  const appToastBus = useAppToastBus();

  const errors = Array.isArray(err.response?._data?.data?.errors) ? toArray(err.response?._data.data.errors) : undefined;
  if (
    err.response?.status === 400
    && Array.isArray(errors)
    && errors.every((e) => typeof e.name === 'string' && typeof e.message === 'string')
    && !!formRef
  ) {
    formRef?.value?.setErrors?.(errors);
    return;
  }

  if (err.response?._data) {
    const description = typeof err.response._data.message === 'string' ? err.response._data.message : err.response.statusText;
    appToastBus.emit('add', {
      description,
      color: 'danger'
    });
    return;
  }

  if (typeof err === 'string') {
    appToastBus.emit('add', {
      description: err,
      color: 'danger'
    });
    return;
  }

  appToastBus.emit('add', {
    description: typeof err.message === 'string' ? err.message : 'Something went wrong',
    color: 'danger'
  });
}
