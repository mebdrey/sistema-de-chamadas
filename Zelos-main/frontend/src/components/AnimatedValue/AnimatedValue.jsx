import { useEffect, useRef, useState } from 'react';

export default function AnimatedNumber({ value, duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);
  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(animationFrameRef.current); // cancela animação anterior
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const newValue = Math.floor(
        startValueRef.current + (value - startValueRef.current) * progress
      );
      setDisplayValue(newValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}
