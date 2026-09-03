import * as React from 'react';
import { BrujulaMark } from './BrujulaMark';
import { BrujulaWordmark } from './BrujulaWordmark';
import { tones, type LogoTone } from './tokens';

export interface BrujulaLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Wordmark type size in px; the mark and gap scale from it. Default 46. */
  size?: number;
  tone?: LogoTone;
  /** Pass a string to show a tagline under the name, or false for none. */
  tagline?: string | false;
  /** Renders as a link when set. */
  href?: string;
}

/** Primary horizontal lockup: needle left, name right. Use in the site header. */
export const BrujulaLogo = React.forwardRef<HTMLDivElement, BrujulaLogoProps>(function BrujulaLogo(
  { size = 46, tone = 'color', tagline = false, href, style, ...rest },
  ref,
) {
  const t = tones[tone];
  const content = (
    <>
      <BrujulaMark size={size * 1.35} tone={tone} labelled={false} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: size * 0.13 }}>
        <BrujulaWordmark size={size} tone={tone} />
        {tagline ? (
          <span
            style={{
              fontSize: Math.max(8, size * 0.2),
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              color: t.tagline,
              paddingLeft: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </>
  );

  const frame: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: size * 0.48,
    textDecoration: 'none',
    ...style,
  };

  if (href) {
    return (
      <a ref={ref as React.Ref<never>} href={href} aria-label="Brújula" style={frame} {...(rest as object)}>
        {content}
      </a>
    );
  }
  return (
    <div ref={ref} role="img" aria-label="Brújula" style={frame} {...rest}>
      {content}
    </div>
  );
});
