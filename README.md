# Brújula — mobile app

Expo (React Native) app for job seekers and employers. Talks to the Brújula API in `../back`.

- Bundle ID / Android package: `com.luisidrm.brujula`
- URL scheme: `brujula`
- Languages: English and Spanish

## Run it locally

1. Start the API (see `../back/README.md`).
2. Copy `.env.example` to `.env`. `EXPO_PUBLIC_API_URL` must start with `EXPO_PUBLIC_` or Expo will not embed it. On a physical phone use your computer's LAN address (`http://192.168.x.x:5000`), not `localhost`.
3. `npm install`, then `npx expo start`.

Checks: `npx tsc --noEmit`. CI also bundles the app with `npx expo export --platform android`.

## Configuration

| Variable | Where | Meaning |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `.env` locally, `eas.json` per build profile | API base URL. Release builds **throw at startup** if it is missing, a `REPLACE_WITH_...` placeholder, or localhost (`src/lib/config.ts`). |
| `EXPO_PUBLIC_STRIPE_ENABLED` | build profile | `true` shows the Stripe buttons on the billing screen. Hidden by default; payments go through Transfermóvil. |

## Release builds (EAS)

```
eas build --platform android --profile preview      # installable APK for testing
eas build --platform android --profile production   # AAB for Google Play
eas build --platform ios --profile production
eas submit --platform android|ios --profile production
```

Before the first build, replace the `REPLACE_WITH_...` values in `eas.json` (API URLs, App Store Connect app ID) and add the Google Play service-account key it points to. The EAS project is registered under the slug `mobile`; renaming the slug in `app.json` requires renaming the project on expo.dev first.

The `android/` and `ios/` folders are generated and git-ignored; EAS builds from `app.json`.
