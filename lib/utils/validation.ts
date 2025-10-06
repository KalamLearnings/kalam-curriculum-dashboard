const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || '@kalamkidslearning.com';

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!email.endsWith(ALLOWED_DOMAIN)) {
    return { valid: false, error: `Only ${ALLOWED_DOMAIN} emails are allowed` };
  }

  return { valid: true };
}
