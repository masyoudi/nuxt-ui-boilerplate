import { createLogger, format, transports } from 'winston';
import { isEvent } from 'h3';

/**
 * Custom parser logging metadata
 * @param metadata - Logger metadata
 * @returns object
 */
function parseMetadata(metadata?: Record<string, any>) {
  let result: Record<string, any> = {};

  if (!metadata) {
    return result;
  }

  const event = (metadata as any)?.event;
  if (isEvent(event)) {
    result = {
      path: event.node.req.originalUrl?.split('?')[0],
      method: event.node.req.method,
      ...(Object.hasOwn(event.node.req.headers, 'user-agent') && { ua: event.node.req.headers['user-agent'] })
    };
  }

  return result;
}

const formatTemplate = format.printf(({ level, message, timestamp, metadata }) => {
  const result = JSON.stringify({
    level,
    message,
    timestamp,
    ...parseMetadata(metadata as any)
  });

  return result.concat('\n');
});

export const logger = createLogger({
  format: format.combine(
    format.metadata(),
    format.timestamp(),
    formatTemplate
  ),
  transports: [
    new transports.Console()
  ]
});
