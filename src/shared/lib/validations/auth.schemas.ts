import { z } from 'zod';

/** Login form */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// SECURITY FIX (VULN-013): Shared strong-password rule used by both register
// and reset-password schemas. Minimum 8 characters, at least one letter and
// one number. Max 128 to prevent DoS via extremely long inputs.
const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine(v => /[a-zA-Z]/.test(v), 'Password must contain at least one letter')
  .refine(v => /[0-9]/.test(v), 'Password must contain at least one number');

/** Register form */
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long'),
    username: z
      .string()
      .optional()
      .transform(v => v ?? '')
      .refine(
        v => v === '' || /^[a-z0-9_.]{3,30}$/.test(v),
        'Username must be 3–30 chars (letters, numbers, _ or .)',
      ),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Password reset — step 1: email */
export const resetEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type ResetEmailFormValues = z.infer<typeof resetEmailSchema>;

/** Password reset — step 2: verification code */
export const resetCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

export type ResetCodeFormValues = z.infer<typeof resetCodeSchema>;

/** Password reset — step 3: new password */
export const resetPasswordSchema = z
  .object({
    newPassword: strongPassword,
    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
