import * as React from 'react';
import { tones, type LogoTone } from './tokens';

export interface BrujulaMarkProps extends Omit<React.SVGProps<SVGSVGElement>, 'children'> {
  /** Rendered width and height in px. Default 62. */
  size?: number;
  tone?: LogoTone;
  /** Ring stroke weight in viewBox units. Bump to 3+ under 24px. */
  strokeWidth?: number;
  /** Set false when the mark sits next to the wordmark (which carries the label). */
  labelled?: boolean;
}

/** The compass needle, on its own. Use for favicons, avatars, loading states. */
export const BrujulaMark = React.forwardRef<SVGSVGElement, BrujulaMarkProps>(function BrujulaMark(
  { size = 62, tone = 'color', strokeWidth, labelled = true, ...rest },
  ref,
) {
  const t = tones[tone];
  const sw = strokeWidth ?? (size < 24 ? 4 : size < 40 ? 3 : 2.5);
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={labelled ? 'img' : 'presentation'}
      aria-label={labelled ? 'Brújula' : undefined}
      aria-hidden={labelled ? undefined : true}
      {...rest}
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke={t.ring} strokeWidth={sw} />
      <polygon points="50,12 63,50 50,50" fill={t.needleNorth} />
      <polygon points="50,88 37,50 50,50" fill={t.needleSouth} />
    </svg>
  );
});
