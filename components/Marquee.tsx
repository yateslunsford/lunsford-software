'use client';

import React from 'react';

interface MarqueeProps {
  items: string[];
  /** Seconds for one full loop. Lower = faster. Default 35. */
  speed?: number;
  /** Reverse scroll direction. */
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
}

/**
 * Infinite horizontal marquee.
 * Doubles the items array and translates -50% for a seamless loop.
 * Respects prefers-reduced-motion via .marquee-track CSS class.
 */
export default function Marquee({
  items,
  speed = 35,
  reverse = false,
  className = '',
  itemClassName = '',
  itemStyle,
}: MarqueeProps) {
  // Double for seamless loop: translate -50% brings us back to visual start
  const track = [...items, ...items];

  return (
    <div className={`overflow-hidden select-none ${className}`} aria-hidden="true">
      <div
        className="marquee-track flex whitespace-nowrap will-change-transform"
        style={{
          animation: `${reverse ? 'marqueeReverse' : 'marquee'} ${speed}s linear infinite`,
        }}
      >
        {track.map((item, i) => (
          <span key={i} className={`shrink-0 ${itemClassName}`} style={itemStyle}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
