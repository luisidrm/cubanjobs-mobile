import * as React from 'react';
import { BrujulaMark } from './BrujulaMark';
import { BrujulaWordmark } from './BrujulaWordmark';
import { tones, type LogoTone } from './tokens';

export interface BrujulaLogoStackedProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Wordmark type size in px. Default 20. */
  size?: number;
  tone?: LogoTone;
  tagline?: string | false;
}

/** Vertical lockup: needle above the name. Use in narrow columns, footers, merch. */
export const BrujulaLogoStacked = React.forwardRef<HTMLDivElement, BrujulaLogoStackedProps>(
  function BrujulaLogoStacked({ size = 20, tone = 'color', tagline = false, style, ...rest }, ref) {
    const t = tones[tone];
    return (
      <div
        ref={ref}
        role="img"
        aria-label="Brújula"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: size * 0.4,
          ...style,
        }}
        {...rest}
      >
        <BrujulaMark size={size * 1.5} tone={tone} labelled={false} />
        <BrujulaWordmark size={size} tone={tone} />
        {tagline ? (
          <span
            style={{
              fontSize: Math.max(8, size * 0.42),
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: t.tagline,
              whiteSpace: 'nowrap',
            }}
          >
            {tagline}
          </span>
        ) : null}
      </div>
    );
  },
);
