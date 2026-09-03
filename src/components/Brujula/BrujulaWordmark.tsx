import * as React from 'react';
import { logoFontFamily, tones, type LogoTone } from './tokens';

export interface BrujulaWordmarkProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Cap-to-descender type size in px. Default 46. */
  size?: number;
  tone?: LogoTone;
  /** Override the type colour outright. */
  color?: string;
}

/**
 * The name, set in Marcellus. Load the face before use:
 * <link href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" rel="stylesheet" />
 * For print or third-party placements, export an outlined SVG instead of shipping live text.
 */
export const BrujulaWordmark = React.forwardRef<HTMLSpanElement, BrujulaWordmarkProps>(
  function BrujulaWordmark({ size = 46, tone = 'color', color, style, ...rest }, ref) {
    return (
      <span
        ref={ref}
        style={{
          fontFamily: logoFontFamily,
          fontSize: size,
          fontWeight: 400,
          lineHeight: 0.92,
          letterSpacing: '0.02em',
          color: color ?? tones[tone].type,
          whiteSpace: 'nowrap',
          ...style,
        }}
        {...rest}
      >
        Brújula
      </span>
    );
  },
);
