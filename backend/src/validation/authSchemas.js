import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(80, 'Name is too long'),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['Student', 'Teacher', 'Admin']).optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};
