// Shared utility helpers used by shadcn-style components to merge classes safely.
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Combines conditional class names and resolves Tailwind conflicts in one step.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a phone number using libphonenumber-js.
 * Accepts numbers in international format (e.g., +1234567890).
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;
  try {
    const phoneNumber = parsePhoneNumberFromString(phone.trim());
    return phoneNumber ? phoneNumber.isValid() : false;
  } catch (e) {
    return false;
  }
}

/**
 * Formats a phone number to E.164 standard (e.g., +2348012345678).
 * Returns null if invalid.
 * @param {string} phone - The phone number to format.
 * @returns {string|null} - E.164 formatted phone or null.
 */
export function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return null;
  try {
    const phoneNumber = parsePhoneNumberFromString(phone.trim());
    return phoneNumber ? phoneNumber.format('E.164') : null;
  } catch (e) {
    return null;
  }
}
