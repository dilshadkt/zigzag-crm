/**
 * Debounce function to prevent rapid successive calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to call function immediately on first trigger
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  };
};

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Create a function that can only be called once
 * @param {Function} func - Function to call once
 * @returns {Function} Function that can only be called once
 */
export const once = (func) => {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;
      result = func.apply(this, args);
    }
    return result;
  };
};

/**
 * Prevent multiple simultaneous async function calls
 * @param {Function} asyncFunc - Async function to protect
 * @returns {Function} Protected async function
 */
export const preventConcurrent = (asyncFunc) => {
  let isRunning = false;

  return async function (...args) {
    if (isRunning) {
      console.warn("Function is already running, ignoring call");
      return { success: false, message: "Function is already running" };
    }

    try {
      isRunning = true;
      const result = await asyncFunc.apply(this, args);
      return result;
    } finally {
      isRunning = false;
    }
  };
};
