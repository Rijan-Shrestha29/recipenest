import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const chefProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(500, 'Bio too long'),
  specialty: z.string().min(2, 'Specialty is required'),
  experience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience seems too high'),
  profileImage: z.string().url('Must be a valid URL'),
  socialMedia: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  }).optional(),
});

export const registerSchema = chefProfileSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ChefProfileFormData = z.infer<typeof chefProfileSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
