import { useState, useCallback } from 'react';

/**
 * 加载状态 Hook — 管理异步操作的 loading 状态
 */
export function useLoading(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setLoading(true);
      try {
        return await fn();
      } catch (error) {
        console.error('useLoading error:', error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, setLoading, withLoading };
}

export default useLoading;
