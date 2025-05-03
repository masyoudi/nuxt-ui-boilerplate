import { defineEventHandler } from 'h3';

export function authSessionHandler(handler: ReturnType<typeof defineEventHandler>) {
  return defineEventHandler({
    onRequest: async (event) => {
      if (typeof event.context.session === 'undefined') {
        throw createError({ statusCode: 403, message: 'Forbidden' });
      }
    },
    handler
  });
}
