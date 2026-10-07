<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6bd2744f-3b4e-4a8a-a7f5-d6f4a5be0816

## Run locally

**Prerequisites:** Node.js 20.19+ or 22.12+ and npm.

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open http://localhost:3000 in your browser.

The patient demo and local caregiver PIN gate (`1234`) work without API keys. Without Firebase configuration, data stays in this browser's local storage; account sign-in, cross-device pairing, and cloud photo uploads require a Firebase project. The current app does not use Gemini.

### Connect your own Firebase project (optional)

1. Create a Firebase project and add a **Web app** in the Firebase Console. Copy its web app configuration from **Project settings → Your apps → SDK setup and configuration**.
2. Copy `.env.example` to `.env.local` and fill in the matching `VITE_FIREBASE_*` values. If you use the default Firestore database, leave `VITE_FIREBASE_FIRESTORE_DATABASE_ID` blank. Use your actual database ID if it is a named database.
3. Enable the desired providers in **Authentication → Sign-in method**, create a Firestore database and Storage bucket, and set up appropriate security rules for your users. Add `localhost` to Authentication's authorized domains if necessary.
4. Restart `npm run dev` after changing `.env.local`, then sign in from the caregiver account screen to use cloud features.

The old `firebase-applet-config.json` is **not used** by the app. Firebase web API keys are public client identifiers, not secret server credentials; secure your data with Firebase Auth and Firestore/Storage rules. Never put private service-account keys or a Gemini API key in a `VITE_` variable (Vite embeds these values in the browser bundle). `.env.local` is git-ignored.

To check the project, run `npm run lint` and `npm run build`.
