import type { H3Event } from 'h3';

export function authSessionHandler(event: H3Event) {
  if (typeof event.context.session === 'undefined') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }
}
