import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CountingNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
  delay?: number;
}

const CountingNumber: React.FC<CountingNumberProps> = ({ 
  value, 
  prefix = '', 
  suffix = '', 
  className = '', 
  decimals = 0,
  delay = 100 
}) => {
  const springValue = useSpring(0, {
    mass: 1,
    stiffness: 40,
    damping: 20,
  });

  const displayValue = useTransform(springValue, (latest) => {
    const formatted = latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      springValue.set(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, springValue, delay]);

  return <motion.span className={className}>{displayValue}</motion.span>;
};

export default CountingNumber;
