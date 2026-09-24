import { z } from 'zod';
import { MAX_LIMIT_FILE, schema as profileSchema } from '~~/shared/schemas/profile';
import type { FormDataFile } from '~~/server/utils/body';
import { isFormDataFile } from '~~/server/utils/body';

export const updateProfileSchema = profileSchema.extend({
  file: z.custom<FormDataFile>((data) => isFormDataFile(data)).superRefine((input, context) => {
    if (input.size > MAX_LIMIT_FILE) {
      context.addIssue({
        code: 'custom',
        message: 'Max file size 2mb',
        input
      });
    }
  })
});
