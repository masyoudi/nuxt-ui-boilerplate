import { z } from 'zod';

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email()
});

export const authSchema = z.object({
  user: authUserSchema,
  token: z.string(),
  permissions: z.array(z.string()).min(1),
  expiry: z.number()
});

export type AuthSchema = z.output<typeof authSchema>;
