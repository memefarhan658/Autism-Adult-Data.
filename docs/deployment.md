# Publish a recruiter-facing demo

The app is a static site: there is no API key, database server, patient input form, or runtime data download to configure. Fonts, the original contour illustration, and the curated data ship with the build. Hash routes and a relative asset base support repository subpaths.

## GitHub Pages

1. Put the reviewed project and `.github/workflows/workspace.yml` on the repository’s default branch. Enable GitHub Actions if the repository has Actions turned off.
2. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
3. In **Actions → Verify and publish Spectrum Atlas → Run workflow**, select the default branch and run it. It checks formatting, validates the preparation and analytics, builds, and exercises the production site with Chromium **before** deployment.
4. Open the public URL shown by the **Publish public demo** job or in **Settings → Pages**. Check it in a private browser window. Put that verified URL in the repository’s About/Website field, README, and CV.

Once Pages is enabled, subsequent pushes to the default branch run the same checks and refresh the site. Pull requests run checks but do not publish. Manual deployment requires the workflow to exist on the default branch and the selected ref to be allowed by the repository’s `github-pages` environment rules.

## Any static host

- **Node:** 22.12 or newer.
- **Install:** `npm ci`
- **Build:** `npm run build`
- **Publish directory:** `dist/`, including its `assets/` and notices file.
- No API URL or secrets; no SPA rewrite rules are required for hash-based deep links.

To inspect the actual production bundle locally, run `npm run build && npm run preview` and open the address printed by Vite. An Arena Live Preview or local dev server is convenient for review, but it is not a permanent portfolio URL.
