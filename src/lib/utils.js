// Shared utility helpers used by shadcn-style components to merge classes safely.
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combines conditional class names and resolves Tailwind conflicts in one step.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
