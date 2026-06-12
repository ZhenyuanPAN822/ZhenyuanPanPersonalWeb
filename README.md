# Zhenyuan Pan Personal Site - Release Package

This folder is the clean release package for the personal website.

## Entry File

Open or deploy:

```text
index.html
```

This is a static site. There is no build step and no backend requirement.

## Local Preview

From this folder, run any static server. Example:

```bash
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

Do not preview by double-clicking the HTML file if possible. A local static server is safer because PDF/image paths and browser behavior are closer to production.

## Folder Contents

```text
index.html
terminal.css
research.css
room.css
iso-room.css
resume.css
hero-chart.js
data.js
terminal.js
research-data.js
research.js
iso-room.js
room.js
resume.js
morph-overlay.js
transition.js
assets/
  s4-workspace-clean.png
  ZhenyuanPan_Resume.pdf
  resume-pages/
    page-1.png
    page-2.png
```

## Current Site Flow

1. Screen 1: Market Opening / animated candlestick hero
2. Screen 2: Equity & Quant Terminal
3. Screen 3: Research Console
4. Screen 4: Methods & Systems Console
5. Screen 5: Resume Archive / Timeline & Contact

Screen 5 uses a clean three-column archive layout: timeline, resume preview, and contact/actions.

## External Dependencies

The page loads Google Fonts from:

```text
https://fonts.googleapis.com
https://fonts.gstatic.com
```

Everything else required for the current public page is included locally in this package.

## Resume Files

The embedded resume preview uses rendered PNG pages:

```text
assets/resume-pages/page-1.png
assets/resume-pages/page-2.png
```

The download/open buttons point to:

```text
assets/ZhenyuanPan_Resume.pdf
```

If the resume PDF changes later, replace the PDF and regenerate the preview PNG pages with the same filenames.

## Contact Link Status

The public page currently uses:

```text
Email: s230001081@mail.uic.edu.cn
GitHub: https://github.com/ZhenyuanPAN822
Resume PDF: assets/ZhenyuanPan_Resume.pdf
```

These are intentionally shown as non-clickable status rows until final URLs are available:

```text
LinkedIn: Available on request
Research Portfolio: Coming soon
```

## Deployment Notes

- Upload the entire folder contents together.
- Keep the relative file structure unchanged.
- The production server should serve `index.html` as the main entry.
- No Node/Vite/React build is needed.
- The previous development tweak panel and React/Babel debug scripts are not included in this release package.
