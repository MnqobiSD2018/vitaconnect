import { describe, it, expect } from 'vitest';
import { generateOrderNumber, generateTicketCode } from '@/lib/utils/slug';

describe('generateOrderNumber', () => {
  it('returns a string starting with VTC-', () => {
    const result = generateOrderNumber();
    expect(result).toMatch(/^VTC-/);
  });

  it('returns a string of reasonable length', () => {
    const result = generateOrderNumber();
    expect(result.length).toBeGreaterThan(8);
    expect(result.length).toBeLessThan(30);
  });

  it('generates unique values on successive calls', () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});

describe('generateTicketCode', () => {
  it('returns a string based on the order number', () => {
    const result = generateTicketCode('VTC-2026-00001');
    expect(result).toContain('VTC-2026');
  });

  it('generates unique values for the same order', () => {
    const a = generateTicketCode('VTC-2026-00001');
    const b = generateTicketCode('VTC-2026-00001');
    expect(a).not.toBe(b);
  });
});