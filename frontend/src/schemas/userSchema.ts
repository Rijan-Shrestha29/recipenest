import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
