'use client';

import { useEffect } from 'react';

/**
 * Registers mobile gesture event listeners to prevent unwanted zoom on iOS.
 * Extracted from the Vite app's main.tsx bootstrap code.
 * Must be a Client Component since it uses browser event listeners.
 */
export function MobileGestureProvider() {
  useEffect(() => {
    // Prevent pinch zoom (gesturestart is Safari-specific)
    const preventGesture = (e: Event) => e.preventDefault();

    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });

    // Prevent pinch zoom via touchmove with multiple fingers
    const preventPinch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchmove', preventPinch, { passive: false });

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };
    document.addEventListener('touchend', preventDoubleTap, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      document.removeEventListener('touchmove', preventPinch);
      document.removeEventListener('touchend', preventDoubleTap);
    };
  }, []);

  return null;
}
