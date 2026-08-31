import { z } from 'zod';
import type { H3Event, H3Error } from 'h3';
import { schema, MAX_LIMIT_FILE } from '~~/shared/schemas/profile';
import type { FormDataFile } from '../utils/body';

const validation = schema.extend({
  file: z.custom<FormDataFile>((data) => isFormDataFile(data)).superRefine((input, ctx) => {
    if (input.size > MAX_LIMIT_FILE) {
      ctx.addIssue({ code: 'custom', message: 'Max file size 2mb', input });
    }
  })
});

async function handler(event: H3Event) {
  try {
    await useValidateBody(event, { schema: validation });

    const data = {
      success: true
    };

    return {
      data
    };
  }
  catch (err) {
    throw sendErrorServer(event, err as H3Error);
  }
}

export default defineEventHandler({
  onRequest: [authSessionHandler],
  handler
});
