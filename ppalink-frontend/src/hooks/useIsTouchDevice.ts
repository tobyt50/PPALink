import { useState, useEffect } from 'react';

/**
 * A simple hook to determine if the current device has touch capabilities.
 * It checks once on mount and does not update.
 */
export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // A common and reliable way to check for touch support.
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(hasTouch);
  }, []); // Empty dependency array means this runs only once.

  return isTouch;
};