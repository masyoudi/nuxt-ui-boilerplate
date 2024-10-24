import { isError, type H3Event, type H3Error } from 'h3';

/**
 * Throw error as JSON response
 * @param event - H3Event
 * @param error - H3Error
 */
export function sendErrorServer(event: H3Event, error: Partial<H3Error>) {
  const defaultMessage = 'Internal Server Error';
  if (!isError(error)) {
    logger.error(typeof error === 'string' ? error : error.message ?? defaultMessage, { event });
    return createError({
      message: error.message ?? defaultMessage,
      statusCode: 500
    });
  }

  const message = error.message ? error.message : error.statusMessage ?? defaultMessage;
  const err: Partial<H3Error> = {
    name: error?.name ?? 'UnknownError',
    statusCode: error?.statusCode ?? 500,
    fatal: false,
    ...(error?.data ? { data: error.data } : {}),
    unhandled: false,
    stack: '',
    cause: error?.cause ?? 'Unknown',
    message: message
  };

  // Skip logger for error validation
  const isErrorValidation = err.statusCode === 400 && Object.keys(err.data ?? {}).length > 0;
  if (!isErrorValidation) {
    logger.error(err.message!, { event });
  }

  return createError(err);
}
