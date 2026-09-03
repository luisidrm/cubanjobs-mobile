# Brújula logo — direction 2a

Palette: `#0F6E62` teal, `#F5F4EF` bone, `#12211D` ink. Typeface: Marcellus (Google Fonts, OFL).

No dependencies beyond React 17+. Inline styles only, so it drops into any setup.

## Install the font once, app-wide

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" rel="stylesheet" />
```

Self-host for production if you'd rather not hit Google. For print, PDFs, or handing the logo to anyone outside the app, export an **outlined SVG** rather than shipping live text — the components render real text, which depends on the font loading.

## Components

| Component | Use |
| --- | --- |
| `BrujulaLogo` | Primary horizontal lockup. Site header, emails, docs. |
| `BrujulaLogoStacked` | Vertical lockup. Footers, narrow columns, merch. |
| `BrujulaMark` | Needle alone. Favicon, spinner, tight spaces. |
| `BrujulaWordmark` | Name alone, no mark. Where the mark already appears nearby. |
| `BrujulaAppIcon` | Square tile. App icon, social avatar. |

```tsx
import { BrujulaLogo, BrujulaAppIcon, BrujulaMark } from './brujula-logo';

<BrujulaLogo href="/" size={32} />                          // header
<BrujulaLogo size={46} tagline="Tu norte profesional" />     // marketing hero
<BrujulaLogo size={28} tone="onDark" />                      // on #12211D
<BrujulaAppIcon size={120} />
<BrujulaMark size={16} tone="ink" />                         // favicon
```

## Tones

- `color` — ink wordmark, teal needle. The default. Use on white or `#F5F4EF`.
- `ink` — all `#12211D`. One-colour printing, embossing, engraving, anything under 20px.
- `onDark` — bone wordmark, lightened teal (`#4FA79A`) needle. Use on `#12211D`. Full-strength `#0F6E62` fails contrast on ink, which is why this tone exists.

## Rules

- **Clear space:** half the mark's height on all four sides. `clearSpaceRatio` exports the number.
- **Minimum size:** 16px mark, 20px wordmark. Below that, switch to `tone="ink"` — the split needle stops reading in two colours.
- **Don't** put the wordmark inside the icon tile, re-letter the name, stretch either element, add a drop shadow, or place the `color` tone on a mid-tone background.
- The `size` prop drives everything else (mark size, gap, tagline size), so scale by changing that one number rather than adding transforms.

## Assets still to produce

SVG and PNG exports (favicon set, `apple-touch-icon`, social `og:image`, print EPS with outlined type). Say the word and I'll generate the SVG sources.
