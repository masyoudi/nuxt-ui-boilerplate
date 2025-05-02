import { z } from 'zod';
import type { H3Error } from 'h3';

const validation = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.string().trim().min(1, 'Enter your email address').email('Invalid email address'),
  gender: z
    .string()
    .min(1, 'Choose your gender')
    .refine((v) => ['male', 'female'].includes(v), 'Invalid gender'),
  address: z.string().trim().min(1, 'Enter your address'),
  phone: z.string().trim().min(1, 'Enter your phone number'),
  dob: z.string().min(1, 'Please enter date of birth'),
  hobbies: z.string().array().min(1, 'Please select hobby'),
  file: z.any()
});

export default defineEventHandler(async (event) => {
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
});
