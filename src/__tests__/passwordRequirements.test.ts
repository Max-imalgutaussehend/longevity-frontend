import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  PASSWORD_RULES,
  checkPasswordRequirements,
  PasswordRequirements,
} from '../components/PasswordRequirements.js';

describe('Password Requirements Checklist (#81)', () => {
  it('defines the 4 required password criteria matching backend passwordSchema', () => {
    expect(PASSWORD_RULES).toHaveLength(4);
    const ruleIds = PASSWORD_RULES.map((r) => r.id);
    expect(ruleIds).toContain('length');
    expect(ruleIds).toContain('lowercase');
    expect(ruleIds).toContain('uppercase');
    expect(ruleIds).toContain('special');
  });

  it('correctly checks each rule individually', () => {
    // Too short (9 chars)
    expect(checkPasswordRequirements('Abc!12345').length).toBe(false);
    // 10 chars
    expect(checkPasswordRequirements('Abc!123456').length).toBe(true);

    // No lowercase
    expect(checkPasswordRequirements('ABC!123456').lowercase).toBe(false);
    expect(checkPasswordRequirements('AbC!123456').lowercase).toBe(true);

    // No uppercase
    expect(checkPasswordRequirements('abc!123456').uppercase).toBe(false);
    expect(checkPasswordRequirements('Abc!123456').uppercase).toBe(true);

    // No number or special char
    expect(checkPasswordRequirements('Abcdefghij').special).toBe(false);
    // With number
    expect(checkPasswordRequirements('Abcdefghi1').special).toBe(true);
    // With special char
    expect(checkPasswordRequirements('Abcdefghi!').special).toBe(true);
  });

  it('determines allValid correctly', () => {
    expect(checkPasswordRequirements('WeakPw').allValid).toBe(false);
    expect(checkPasswordRequirements('ValidPassword123!').allValid).toBe(true);
  });

  it('renders requirements checklist HTML with satisfied and pending states', () => {
    // Empty password
    const emptyHtml = renderToString(createElement(PasswordRequirements, { password: '' }));
    expect(emptyHtml).toContain('data-testid="password-requirements"');
    expect(emptyHtml).toContain('Mindestens 10 Zeichen');
    expect(emptyHtml).toContain('Mindestens 1 Kleinbuchstabe');
    expect(emptyHtml).toContain('Mindestens 1 Großbuchstabe');
    expect(emptyHtml).toContain('Mindestens 1 Zahl oder Sonderzeichen');

    // Valid password
    const validHtml = renderToString(createElement(PasswordRequirements, { password: 'ValidPassword123!' }));
    expect(validHtml).toContain('data-testid="password-rule-length"');
    expect(validHtml).toContain('#0f6e56'); // green accent for checked state
  });
});
