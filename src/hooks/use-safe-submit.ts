import { useState, useRef, useEffect } from "react";

interface UseSafeSubmitOptions<T, R> {
  onSubmit: (data: T, idempotencyKey: string) => Promise<R>;
  onSuccess?: (result: R) => void;
  onError?: (error: any) => void;
}

export function useSafeSubmit<T, R>({ onSubmit, onSuccess, onError }: UseSafeSubmitOptions<T, R>) {
  const [loading, setLoading] = useState(false);
  const idempotencyKeyRef = useRef<string>("");

  const generateKey = () => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // Fallback for SSR or environments without crypto.randomUUID
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  // Generate idempotency key on mount
  useEffect(() => {
    idempotencyKeyRef.current = generateKey();
  }, []);

  const resetIdempotencyKey = () => {
    idempotencyKeyRef.current = generateKey();
  };

  const submitSafe = async (data: T) => {
    // Synchronous Guard: Block execution if currently transmitting
    if (loading) return;

    setLoading(true);
    try {
      const result = await onSubmit(data, idempotencyKeyRef.current);
      onSuccess?.(result);
      // Generate a fresh key for next transaction
      resetIdempotencyKey();
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitSafe,
    idempotencyKey: idempotencyKeyRef.current,
    resetIdempotencyKey,
  };
}
