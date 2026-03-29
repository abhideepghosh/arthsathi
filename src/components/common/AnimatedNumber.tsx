import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../constants/typography';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  style?: TextStyle;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '\u20B9',
  style,
}) => {
  const { colors } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const from = prevValueRef.current;
    prevValueRef.current = value;
    const start = Date.now();
    const duration = 800;

    const rafId = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2); // easeOut quad
      const current = Math.round(from + (value - from) * eased);
      setDisplayValue(current);
      if (progress >= 1) clearInterval(rafId);
    }, 16);

    return () => clearInterval(rafId);
  }, [value]);

  return (
    <Text
      style={[
        typography.monoAmountLg,
        { color: colors.textPrimary },
        style,
      ]}
    >
      {prefix}{displayValue.toLocaleString('en-IN')}
    </Text>
  );
};

export default AnimatedNumber;
