import type { z } from 'zod/v4';
import type { updateProfileSchema } from './schema';

export type UpdateProfileDto = z.output<typeof updateProfileSchema>;
