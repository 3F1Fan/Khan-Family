# Deploying Khan Family to Firebase Hosting

This app is a React + Vite site served by Firebase Hosting. There are two ways
to deploy; both end at the same live URL: `https://<project-id>.web.app`.

---

## Step 1 — Create the Firebase project (browser, one time)

1. Go to https://console.firebase.google.com
2. **Add project** → name it (e.g. `khan-family`). Firebase generates a
   **Project ID** like `khan-family-1a2b3` — write it down.
3. Google Analytics: optional, disable for simplicity.
4. **Create project** → wait → **Continue**.
5. Left sidebar → **Build → Hosting → Get started** → click through every
   screen. You can ignore the npm/firebase commands it shows.

You do **not** need to add a web "app" or touch API keys — Hosting just serves
built files, so the Project ID is all you need.

---

## Option A — Deploy from this repo / Claude Code (no local machine)

The Firebase CLI is already installed in the Claude Code container. Because a
container can't open a browser, it authenticates with a **service account key**
instead of `firebase login`.

1. In the Firebase Console: **⚙️ → Project settings → Service accounts →
   Generate new private key**. A JSON file downloads.
2. Provide that JSON to Claude Code; it's saved to `.secrets/key.json`
   (gitignored — it is never committed).
3. Deploy:

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=.secrets/key.json
   npm run deploy -- --project <your-project-id>
   ```

   `npm run deploy` builds the app, then runs `firebase deploy --only hosting`.

After ~30s you'll see `Hosting URL: https://<project-id>.web.app`.

> Security: rotate/delete that key in the console once you're done if it was
> shared in chat.

---

## Option B — Deploy from your own computer

Requires Node.js installed locally and a clone of this repo.

```bash
npm install -g firebase-tools   # install the CLI
firebase --version              # verify
firebase login                  # opens a browser; pick the right Google account
firebase use --add              # pick your project, alias it "default"
npm run deploy                  # build + deploy
```

`firebase use --add` writes your Project ID into `.firebaserc` so you don't have
to pass `--project` each time.

> Don't run `firebase init` — `firebase.json` is already configured and init
> could overwrite it.

---

## Option C — Auto-deploy on every push to `main`

The workflow at `.github/workflows/deploy.yml` deploys automatically on every
push to `main`. It needs two GitHub Actions secrets
(repo → **Settings → Secrets and variables → Actions**):

- `FIREBASE_SERVICE_ACCOUNT` — the full contents of the service account JSON.
- `FIREBASE_PROJECT_ID` — your Project ID.

---

## Troubleshooting

- **`firebase: command not found`** — reopen the terminal, or the global npm bin
  isn't on PATH.
- **"No currently active project"** — run `firebase use --add`, or pass
  `--project <id>`.
- **403 / permission error** — you're authenticated as the wrong account /
  service account lacks access.
- **Refreshing a route 404s** — already handled; `firebase.json` rewrites all
  routes to `index.html`.
