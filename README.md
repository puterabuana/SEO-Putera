# SEO Putera Portfolio

Static, evidence-led SEO portfolio for `seo.puteragani.com`.

## Local preview

```powershell
npm install
npm run serve
```

Open `http://127.0.0.1:4173`.

## Add a portfolio project

1. Add the project metadata to `data/projects.json`.
2. Add its evidence images under `assets/projects/<slug>/`.
3. Add its reports under `assets/reports/<slug>/`.
4. Create `case-study/<slug>/index.html` with the project evidence and limitations.
5. Run `npm run build:projects` to refresh the homepage and project archive.
6. Add the case-study URL to `sitemap.xml` and the public-page lists in the tests and validator.
7. Run `npm test`, `npm run validate`, and `npm run qa:visual`.

Scores must always include the audit source and date. Do not present a technical score as proof of traffic or ranking growth without supporting data.
