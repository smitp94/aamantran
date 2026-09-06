# RSVP Website — React + TypeScript + GitHub Pages

A mobile-friendly wedding RSVP website with a Google Sheets backend.

## 1. Customize the event

Edit:

`src/config.ts`

Change:
- couple names
- date/time
- venue
- location
- Google Maps link
- RSVP deadline
- `rsvpEndpoint` after deploying Apps Script
- `heroImage` if you want a photo

## 2. Run locally

Install Node.js 20+.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

Before connecting the backend, the form runs in demo mode and logs submissions to the browser console.

## 3. Connect Google Sheets

1. Create a Google Sheet.
2. Open **Extensions → Apps Script**.
3. Copy `google-apps-script/Code.gs` into the Apps Script editor.
4. Run `setup()` once and authorize it.
5. Click **Deploy → New deployment**.
6. Select **Web app**.
7. Set **Execute as**: Me.
8. Set **Who has access**: Anyone.
9. Deploy and copy the Web app URL ending in `/exec`.
10. Put that URL into `src/config.ts` as `rsvpEndpoint`.

The first row of the sheet will contain the RSVP column headers.

### Important
The website uses `no-cors` for the browser-to-Apps-Script POST. This is intentional. The RSVP is sent to Apps Script, and a successful network request is treated as submitted. Test it with a real RSVP and verify that a row appears in the Sheet before sharing the site.

## 4. Deploy to GitHub Pages

Create a GitHub repository named something like `rsvp`.

Push this project to the repository, then:

```bash
npm install
npm run build
```

The included `vite.config.ts` uses:

```ts
base: "/rsvp/"
```

If your repository has another name, change `/rsvp/` to `/<your-repository-name>/`.

### GitHub Pages settings

In GitHub:
- Settings → Pages
- Source: GitHub Actions

Then add `.github/workflows/deploy.yml` from this project and push.

Your site will be available at:

`https://YOUR-USERNAME.github.io/rsvp/`

## 5. Optional custom domain

You can connect a custom domain through GitHub Pages. If you do, update the `base` setting in `vite.config.ts` to `/`.

## 6. Optional invitation codes

Set:

```ts
requireInviteCode: true
```

This adds an invitation-code field to the form.

For a true guest-list validation system, add server-side validation to Apps Script rather than relying only on the frontend.

## Project structure

```text
rsvp-site/
├── src/
│   ├── App.tsx
│   ├── config.ts
│   ├── main.tsx
│   └── styles.css
├── google-apps-script/
│   └── Code.gs
├── .github/workflows/
│   └── deploy.yml
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```