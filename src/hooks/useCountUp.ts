import { useState, useEffect, useRef } from "react";

export function useCountUp(
  target: number,
  duration: number = 800,
  decimals: number = 0
) {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(target);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    const startVal = prevTarget.current;
    const endVal = target;
    startValue.current = startVal;
    prevTarget.current = target;
    startTime.current = null;

    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = startVal + (endVal - startVal) * eased;
      setCurrent(value);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
}
