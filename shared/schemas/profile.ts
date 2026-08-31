import { z } from 'zod';

export const MAX_LIMIT_FILE = 2 * 1024 * 1024;

export const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Invalid email address'),
  gender: z
    .string()
    .min(1, 'Choose your gender')
    .refine((v) => ['male', 'female'].includes(v), 'Invalid gender'),
  address: z.string().trim().min(1, 'Enter your address'),
  phone: z.string().trim().min(1, 'Enter your phone number'),
  dob: z.iso.date('Please enter date of birth'),
  bio: z.string().trim().min(1, 'Write bio'),
  hobbies: z.coerce.number().array().min(1, 'Please select hobby')
});
