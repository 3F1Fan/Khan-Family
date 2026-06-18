# Khan Family

A React + Vite site deployed to Firebase Hosting. Every push to `main`
auto-deploys via GitHub Actions.

## Local development

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Deployment

Pushing to `main` triggers `.github/workflows/firebase-deploy.yml`, which
builds the app and deploys it to Firebase Hosting.

### One-time setup

1. Create a Firebase project at https://console.firebase.google.com
2. Replace `YOUR_FIREBASE_PROJECT_ID` in `.firebaserc` and
   `.github/workflows/firebase-deploy.yml` with your project ID.
3. Generate a service account key and add it as the GitHub Actions secret
   `FIREBASE_SERVICE_ACCOUNT` (see the chat instructions for details).
