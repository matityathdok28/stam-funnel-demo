# דמו אינטראקטיבי — משפך אוטומציה | קורס סופר סת"ם

Static, client-side-only demo of the lead funnel: Facebook comment → ManyChat (Messenger bot) → Make.com → Google Sheets + team alerts → WhatsApp template sequence.

- **Demo only — no message is ever sent.** All "APIs" are simulated in `app.js` with fake JSON requests/responses and small delays.
- No backend, no cookies/storage, no analytics. The page's Content-Security-Policy sets `connect-src 'none'`, so the browser blocks any network request from the script.
- Fonts (Heebo, Frank Ruhl Libre — SIL OFL 1.1) are self-hosted in `fonts/`.
- Phone numbers are demo numbers only; links (`soferstam.org/...`) are non-navigating placeholders.
