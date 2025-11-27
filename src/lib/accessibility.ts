/**
 * Accessibility utility functions
 * These utilities help ensure WCAG 2.1 AA compliance across the application
 */

let idCounter = 0;

/**
 * Generates a unique ID for form elements and ARIA attributes
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateId(prefix: string = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Announces a message to screen readers using an ARIA live region
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof window === 'undefined') return;

  // Find or create the live region
  let liveRegion = document.getElementById('a11y-announcer');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-announcer';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
  }

  // Update the priority if needed
  if (liveRegion.getAttribute('aria-live') !== priority) {
    liveRegion.setAttribute('aria-live', priority);
  }

  // Clear and set the message
  liveRegion.textContent = '';
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 100);
}

/**
 * Traps focus within a container element (useful for modals/dialogs)
 * @param containerElement - The element to trap focus within
 * @returns A cleanup function to remove the trap
 */
export function trapFocus(containerElement: HTMLElement): () => void {
  const focusableElements = containerElement.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  containerElement.addEventListener('keydown', handleTabKey);

  // Focus the first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    containerElement.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Detects if the user has reduced motion preference enabled
 * @returns true if reduced motion is preferred
 */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates a ref callback that announces focus changes to screen readers
 * Useful for dynamic content or single-page app navigation
 */
export function createFocusAnnouncer() {
  return (element: HTMLElement | null) => {
    if (element) {
      const text = element.textContent || element.getAttribute('aria-label') || '';
      if (text) {
        announceToScreenReader(`Navigated to ${text}`);
      }
    }
  };
}

/**
 * Checks if an element has sufficient color contrast
 * Note: This is a basic implementation. For production, consider using a library like 'wcag-contrast'
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @returns Object with contrast ratio and WCAG AA/AAA compliance
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  AA: boolean;
  AAA: boolean;
} {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const val = c / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5, // WCAG AA for normal text
    AAA: ratio >= 7, // WCAG AAA for normal text
  };
}

/**
 * Hook-like function to manage keyboard navigation for custom components
 * @param options - Configuration for keyboard navigation
 */
export function handleKeyboardNavigation(options: {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
}) {
  return (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        options.onEnter?.();
        break;
      case ' ':
        event.preventDefault();
        options.onSpace?.();
        break;
      case 'Escape':
        event.preventDefault();
        options.onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        options.onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        options.onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        options.onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        options.onArrowRight?.();
        break;
    }
  };
}
