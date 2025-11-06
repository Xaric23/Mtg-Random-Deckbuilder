import { describe, it, expect } from 'vitest';
import { validateDeckName, validateCardId, validateJSON, sanitizeString } from '../validation';

describe('input validation', () => {
  it('should sanitize strings', () => {
    expect(sanitizeString('  Test  ')).toBe('Test');
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('should validate deck names', () => {
    expect(validateDeckName('My Cool Deck')).toBe(true);
    expect(validateDeckName('')).toBe(false);
    expect(validateDeckName('a'.repeat(101))).toBe(false);
    expect(validateDeckName('Invalid$Characters!')).toBe(false);
  });

  it('should validate card IDs', () => {
    expect(validateCardId('1234abcd-ef56')).toBe(true);
    expect(validateCardId('invalid!')).toBe(false);
  });

  it('should validate JSON strings', () => {
    expect(validateJSON('{"name": "test"}')).toBe(true);
    expect(validateJSON('invalid')).toBe(false);
  });
});