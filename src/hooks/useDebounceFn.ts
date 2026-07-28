import { useCallback, useRef } from 'react';

/**
 * 防抖 Hook
 */
interface DebounceOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export function useDebounceFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: DebounceOptions = {}
) {
  const { wait = 300, leading = false, trailing = true } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (leading && !timerRef.current) {
        fn(...args);
      }

      timerRef.current = setTimeout(() => {
        if (trailing) {
          fn(...args);
        }
        timerRef.current = null;
      }, wait);
    },
    [fn, wait, leading, trailing]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { run, cancel };
}

export default useDebounceFn;
