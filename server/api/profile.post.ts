import { z } from 'zod';
import type { H3Event, H3Error } from 'h3';

const validation = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Invalid email address'),
  gender: z
    .string()
    .min(1, 'Choose your gender')
    .refine((v) => ['male', 'female'].includes(v), 'Invalid gender'),
  address: z.string().trim().min(1, 'Enter your address'),
  phone: z.string().trim().min(1, 'Enter your phone number'),
  dob: z.string().min(1, 'Please enter date of birth'),
  bio: z.string().trim().min(1, 'Write bio'),
  hobbies: z.string().array().min(1, 'Please select hobby'),
  file: z.any()
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
