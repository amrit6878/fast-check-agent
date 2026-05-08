# Fact-Check Agent 🔍

> An AI-powered truth layer for complex documents. Upload a PDF, extract verifiable claims, and cross-reference them against live data — automatically.

Built for journalists, researchers, and legal professionals who need objective, auditable fact-checking at scale.

---

## Features

- **PDF Upload** — Drag and drop any PDF, DOCX, or TXT file
- **AI Claim Extraction** — Gemini 1.5 Flash identifies stats, dates, figures, and factual assertions
- **Automated Verification** — Each claim is cross-referenced and tagged as `VERIFIED`, `INACCURATE`, or `FALSE`
- **Confidence Scores** — Every result includes a 0–100% confidence score and source citations
- **Exportable Reports** — Download the full institutional transparency report as a text file
- **Archive & History** — Browse all past analyses with truth scores

## Tech Stack

- **Frontend** — React 18 (Create React App)
- **AI** — Google Gemini 1.5 Flash API
- **PDF Parsing** — PDF.js (client-side, no backend required)
- **Deployment** — Static build, deployable to Vercel / Netlify / GitHub Pages

## Getting Started

```bash
git clone https://github.com/your-username/factcheck-agent
cd factcheck-agent
npm install
npm start
```

App runs at `http://localhost:3000`.

## Environment

The Gemini API key is set directly in `src/utils/gemini.js`. To use your own key, replace the value on line 1:

```js
const GEMINI_API_KEY = 'your-key-here';
```

## License

MIT
