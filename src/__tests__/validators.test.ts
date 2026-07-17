import { describe, it, expect } from 'vitest';
import { checkoutSchema } from '@/lib/validators/checkout';
import { businessInfoSchema, accountDetailsSchema } from '@/lib/validators/onboarding';

describe('checkoutSchema', () => {
  it('accepts valid checkout data', () => {
    const result = checkoutSchema.safeParse({
      attendees: [{ fullName: 'John Doe', email: 'john@example.com', phone: '+263771234567' }],
      paymentMethod: 'paynow',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing attendee name', () => {
    const result = checkoutSchema.safeParse({
      attendees: [{ fullName: '', email: 'john@example.com', phone: '+263771234567' }],
      paymentMethod: 'paynow',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = checkoutSchema.safeParse({
      attendees: [{ fullName: 'John', email: 'not-an-email', phone: '+263771234567' }],
      paymentMethod: 'paynow',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty attendees array', () => {
    const result = checkoutSchema.safeParse({
      attendees: [],
      paymentMethod: 'paynow',
    });
    expect(result.success).toBe(false);
  });
});

describe('businessInfoSchema', () => {
  it('accepts valid business info', () => {
    const result = businessInfoSchema.safeParse({
      businessName: 'My Org',
      businessEmail: 'org@example.com',
      phone: '+263771234567',
      businessType: 'registered',
      organizerCategory: 'promoter',
      yearsInBusiness: '2-5',
      country: 'Zimbabwe',
      city: 'Harare',
      physicalAddress: '123 Main St, Harare',
      companyDescription: 'We organize amazing events across Zimbabwe.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing business name', () => {
    const result = businessInfoSchema.safeParse({
      businessName: '',
      businessEmail: 'org@example.com',
      phone: '+263771234567',
      businessType: 'registered',
      organizerCategory: 'promoter',
      yearsInBusiness: '2-5',
      country: 'Zimbabwe',
      city: 'Harare',
      physicalAddress: '123 Main St',
      companyDescription: 'We organize events.',
    });
    expect(result.success).toBe(false);
  });
});

describe('accountDetailsSchema', () => {
  it('accepts valid account details', () => {
    const result = accountDetailsSchema.safeParse({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'test@example.com',
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak password', () => {
    const result = accountDetailsSchema.safeParse({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'test@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = accountDetailsSchema.safeParse({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'test@example.com',
      password: 'StrongP@ss1',
      confirmPassword: 'Different1!',
    });
    expect(result.success).toBe(false);
  });
});