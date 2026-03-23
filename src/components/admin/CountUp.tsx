import React, { useEffect } from 'react';
import { useSpring, motion, useMotionValueEvent } from 'framer-motion';

interface CountUpProps {
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  decimals?: number;
}

const CountUp: React.FC<CountUpProps> = ({ 
  to, 
  duration = 2, 
  delay = 0, 
  suffix = '',
  decimals = 0 
}) => {
  const count = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const [currentValue, setCurrentValue] = React.useState(to.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + suffix);

  useMotionValueEvent(count, "change", (latest) => {
    setCurrentValue(latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + suffix);
  });

  useEffect(() => {
    // Safety check for NaN or undefined
    const targetValue = isNaN(to) ? 0 : to;
    
    const timeout = setTimeout(() => {
      count.set(targetValue);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [to, count, delay]);

  return <span>{currentValue}</span>;
}

export default CountUp;
