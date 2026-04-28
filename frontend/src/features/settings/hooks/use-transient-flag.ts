import { useCallback, useRef, useState } from "react";

export function useTransientFlag(durationMs: number) {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const trigger = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setActive(true);
    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
      timeoutRef.current = null;
    }, durationMs);
  }, [durationMs]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActive(false);
  }, []);

  return { active, trigger, reset };
}
