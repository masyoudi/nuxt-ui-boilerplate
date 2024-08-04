import { createLogger, format, transports, type LogEntry } from 'winston';
import type { H3Event } from 'h3';

interface ErrorOptions {
  event: H3Event;
  error: any;
}

/**
 * Error formatter
 * @returns string
 */
function formatter({ event }: ErrorOptions) {
  return format.printf(({ level, message }: LogEntry) => {
    const path: string = String(event.node.req.url).split(/[?#]/)[0];

    const str = JSON.stringify({
      level: level,
      ...(message ? { message: message } : {}),
      path: path,
      method: event.node.req.method,
      ...(Object.hasOwn(event.node.req.headers, 'user-agent') ? { ua: event.node.req.headers['user-agent'] } : {}),
      time: new Date().toISOString()
    });

    return str.concat('\n');
  });
}

/**
 * Error logger
 */
function error({ event, error }: ErrorOptions) {
  const isErrorForm = Object.hasOwn(error, 'statusCode') ? error.statusCode === 400 : false;
  if (isErrorForm) {
    return;
  }

  const message = error?.statusMessage ? error.statusMessage : error?.message ? error.message : '';
  if (typeof message !== 'string' || message === '') {
    return;
  }

  const logger = createLogger({
    level: 'error',
    format: formatter({ event, error }),
    transports: [new transports.Console()]
  });

  return logger.error(error?.statusMessage ? error.statusMessage : '');
}

export default {
  error
};
