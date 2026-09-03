import * as React from 'react';
import { BrujulaMark } from './BrujulaMark';
import { brujulaColors } from './tokens';

export interface BrujulaAppIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tile edge length in px. Default 62. */
  size?: number;
  /** `dark` = ink tile (primary). `light` = bone tile for light-only contexts. */
  variant?: 'dark' | 'light';
  /** Corner radius in px. Defaults to size * 0.21 (iOS-ish). Pass 0 or size/2 as needed. */
  radius?: number;
}

/** Square app / avatar tile. Mark only — never set the wordmark inside a tile. */
export const BrujulaAppIcon = React.forwardRef<HTMLDivElement, BrujulaAppIconProps>(
  function BrujulaAppIcon({ size = 62, variant = 'dark', radius, style, ...rest }, ref) {
    const dark = variant === 'dark';
    return (
      <div
        ref={ref}
        role="img"
        aria-label="Brújula"
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: dark ? brujulaColors.ink : brujulaColors.bone,
          border: dark ? undefined : `1px solid #E0DED5`,
          borderRadius: radius ?? size * 0.21,
          boxSizing: 'border-box',
          ...style,
        }}
        {...rest}
      >
        <BrujulaMark
          size={size * 0.55}
          tone={dark ? 'onDark' : 'color'}
          strokeWidth={3}
          labelled={false}
        />
      </div>
    );
  },
);
