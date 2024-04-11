import { z } from 'zod';

export const signUpSchema = z
  .object({
    email: z.string().email().min(5),
    password: z.string().min(7).max(32),
  })
  .strict();
