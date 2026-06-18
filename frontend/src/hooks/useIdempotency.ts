import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export function useIdempotency() {
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => uuidv4());
  const resetKey = useCallback(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  return {
    idempotencyKey,
    resetKey,
  };
}
