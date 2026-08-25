/**
 * Show error message with toast
 * @param err - Error result
 */
export function displayError(err: any) {
  const appToastBus = useAppToastBus();

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
