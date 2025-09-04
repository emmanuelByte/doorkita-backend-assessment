import { Injectable } from '@nestjs/common';
import { securityConfig } from '../config/security.config';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class PasswordValidator {
  validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    const { password: config } = securityConfig;

    // Check minimum length
    if (password.length < config.minLength) {
      errors.push(
        `Password must be at least ${config.minLength} characters long`,
      );
    }

    // Check for uppercase letters
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letters
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for numbers
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for special characters
    if (
      config.requireSpecialChars &&
      !/[!@#$%^&*()_+\-={};':"\\|,.<>/?]/.test(password)
    ) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const weakPasswords = [
      'password',
      '123456',
      'password123',
      'admin',
      'qwerty',
      'letmein',
      'welcome',
      'monkey',
      'dragon',
      'master',
    ];

    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a stronger password');
    }

    // Check for sequential characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push(
        'Password cannot contain more than 2 consecutive identical characters',
      );
    }

    // Check for keyboard patterns
    const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', '654321'];

    for (const pattern of keyboardPatterns) {
      if (password.toLowerCase().includes(pattern)) {
        errors.push('Password cannot contain keyboard patterns');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;

    // Length contribution
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety contribution
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-={};':"\\|,.<>/?]/.test(password)) score += 1;

    // Complexity contribution
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) score += 1;
    if (
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={};':"\\|,.<>/?])/.test(
        password,
      )
    )
      score += 1;

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
  }
}
