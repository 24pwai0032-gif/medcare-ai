import { z } from 'zod';

// Messages are keys in auth.json `validation.*`. Rules mirror backend/schemas.py.
const email = z.string().trim().min(1, 'required').pipe(z.email('email'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'required'),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'nameShort'),
    email,
    // bcrypt only uses the first 72 bytes.
    password: z.string().min(6, 'passwordShort').max(72, 'passwordLong'),
    role: z.enum(['patient', 'doctor']),
    pmdc: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.role === 'doctor' && !values.pmdc) ctx.addIssue({ code: 'custom', path: ['pmdc'], message: 'pmdcRequired' });
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ValidationKey = 'required' | 'email' | 'nameShort' | 'passwordShort' | 'passwordLong' | 'pmdcRequired';
