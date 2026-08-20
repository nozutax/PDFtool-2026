# AGENTS.md

## Cursor Cloud specific instructions

### Overview
This repo is a single self-contained static web app: `index.html` (Japanese-language "PDF Tools"). It runs entirely client-side using CDN libraries (Bootstrap, Bootstrap Icons, pdf-lib via unpkg, JSZip via cdnjs, Google Fonts). There is **no build step, no package manager, no lockfile, no backend, and no database**.

### Running the app (development)
Serve the folder with any static file server and open `index.html`:

```
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Opening the file via `file://` also works, but a static server better matches the intended embedded/iframe context (`<base target="_top">`, originally an Apps Script `HtmlService` artifact).

### Important, non-obvious notes
- The app requires **outbound internet access to CDNs** (`cdn.jsdelivr.net`, `unpkg.com`, `cdnjs.cloudflare.com`, `fonts.googleapis.com`). Without egress the libraries fail to load and PDF processing (`PDFLib`, `JSZip`) will not work — this is the single most likely cause of a "blank/broken" app.
- There is **no install/update step**. Do not add one; there are no dependencies to fetch.
- There are **no automated tests, linters, or build scripts** configured. Validation is done by manually exercising the three tabs (分割 / 結合 / 整理) in a browser.
- Core functions are all in the inline `<script>` in `index.html`: `processSplit()`, `processMerge()`, `processDelete()`, and `parseRange()`.
