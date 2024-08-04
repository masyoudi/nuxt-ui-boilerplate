import { isError, type H3Event, type H3Error } from 'h3';
import logger from './logger';

/**
 * Throw error as JSON response
 * @param event H3Event
 * @param error H3Error
 */
export function sendErrorServer(event: H3Event, error: Partial<H3Error>) {
  if (!isError(error)) {
    logger.error({ event, error });
    return createError('Internal Server Error');
  }

  const message = error.message ? error.message : error.statusMessage ? error.statusMessage : 'Internal Server Error';
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

  logger.error({ event, error: err });
  return createError(err);
}
