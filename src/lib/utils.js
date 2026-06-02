// Shared utility helpers used by shadcn-style components to merge classes safely.
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Combines conditional class names and resolves Tailwind CSS conflicts.
 * Uses clsx for conditional logic and tailwind-merge to ensure the last class wins.
 *
 * @param {...(string|Object|Array|undefined|null)} inputs - Class names or conditional objects.
 * @returns {string} - The merged and resolved class string.
 */
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

/**
 * Returns a safe, user-facing error string.
 * Never leaks raw technical details (subaccount ids, "Merchant not found", Railway logs,
 * Flutterwave internals, long traces, etc.) to toasts, error screens or public UI.
 * Used everywhere we do toast.error(err.response?.data?.detail ...) or setError.
 */
export function getUserFriendlyError(err, fallback = 'Something went wrong. Please try again or contact support.') {
  const raw = err?.response?.data?.detail || err?.message || (typeof err === 'string' ? err : '');
  const s = String(raw || '').trim();
  if (!s) return fallback;
  // Anything that smells like internals, provider error, or is excessively long -> generic
  const isTechnical = /subaccount|RS_[A-Z0-9]{10,}|flutterwave|railway|payment_event|traceback|stack|internal server|merchant not|could not prepare|see .* log|0x[0-9a-f]+|exception|failed to update subaccount/i.test(s)
    || s.length > 160
    || /"status":\s*"error"/i.test(s);
  return isTechnical ? fallback : s;
}
