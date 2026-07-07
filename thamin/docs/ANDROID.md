# Thamin on Android

Thamin ships as a Progressive Web App, which installs on Android like a
native app with zero store friction.

## Option 1: direct install (available now)

1. Deploy the app (see README) and open the URL in Chrome on Android.
2. Visit `/install` and tap "Install the app now", or use the Chrome menu
   and choose "Install app".
3. The Thamin icon appears on the home screen; the app runs full screen,
   keeps the user signed in, and works offline for previously opened pages.

## Option 2: Google Play release (TWA wrapper)

To publish on Google Play, wrap the deployed PWA as a Trusted Web Activity
with Bubblewrap:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR-DOMAIN/manifest.json
bubblewrap build            # produces app-release-signed.apk / .aab
```

Then:

1. Host the generated `assetlinks.json` at
   `https://YOUR-DOMAIN/.well-known/assetlinks.json`
   (put it in `public/.well-known/` and redeploy).
2. Upload the `.aab` to the Google Play Console.

The wrapper contains no code of its own; every update you deploy to the web
is live in the Play app immediately.
