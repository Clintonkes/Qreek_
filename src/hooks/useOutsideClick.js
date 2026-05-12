import { useEffect } from 'react';

/**
 * Custom hook that triggers a callback when a click or touch event occurs outside of the referenced element.
 * Useful for closing dropdowns, modals, or menus.
 *
 * @param {React.RefObject} ref - The React ref of the element to monitor.
 * @param {Function} handler - The callback function to execute when an outside click is detected.
 */
export function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
