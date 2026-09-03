export const brujulaColors = {
  teal: '#0F6E62',
  tealLight: '#4FA79A',
  bone: '#F5F4EF',
  ink: '#12211D',
  inkMuted: '#7E9990',
  white: '#FFFFFF',
} as const;

/** Logo tone. `color` = ink type + teal needle (primary). */
export type LogoTone = 'color' | 'ink' | 'onDark';

export interface ToneSpec {
  /** Wordmark + tagline colour. */
  type: string;
  /** Compass ring stroke. */
  ring: string;
  /** North half of the needle. */
  needleNorth: string;
  /** South half of the needle. */
  needleSouth: string;
  /** Tagline colour. */
  tagline: string;
}

export const tones: Record<LogoTone, ToneSpec> = {
  color: {
    type: brujulaColors.ink,
    ring: brujulaColors.ink,
    needleNorth: brujulaColors.teal,
    needleSouth: brujulaColors.ink,
    tagline: brujulaColors.teal,
  },
  ink: {
    type: brujulaColors.ink,
    ring: brujulaColors.ink,
    needleNorth: brujulaColors.ink,
    needleSouth: brujulaColors.ink,
    tagline: brujulaColors.ink,
  },
  onDark: {
    type: brujulaColors.bone,
    ring: brujulaColors.bone,
    needleNorth: brujulaColors.tealLight,
    needleSouth: brujulaColors.bone,
    tagline: brujulaColors.inkMuted,
  },
};

/** Minimum clear space around any lockup, as a multiple of mark height. */
export const clearSpaceRatio = 0.5;

/** Minimum rendered mark size, in px. Below this, drop to the ink tone. */
export const minMarkSize = 16;

export const logoFontFamily = "'Marcellus', 'Times New Roman', serif";
