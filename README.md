# Student Intervention Log

A lightweight, dependency-free web app for tracking conversations and interventions with students.

## Features
- Create, edit and delete students
- Log interventions (date, type, summary, actions, follow-up) and edit or delete them later
- Track open/completed follow-ups
- Search across all students and notes (highlighted matches)
- Export one student's history or everyone's as clean Markdown
- JSON backup and restore

## Run locally
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploy with GitHub Pages
1. Push this repo to GitHub.
2. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`; the included workflow publishes the site.

## Data & privacy
- Data is stored **only in your browser's localStorage** on that device. It is not sent anywhere.
- Clearing browser data deletes it, and it does not sync between devices. Use **Backup (JSON)** regularly.
- GitHub Pages sites are public by default. The page contains no student data, but anyone with the URL can open the app. Never commit backup or export files to the repo (they are git-ignored).
- Check your school or district policy on storing student records before use.

## Files
| File | Purpose |
|---|---|
| `index.html` | Page shell |
| `styles.css` | Styling (light/dark aware) |
| `app.js` | All app logic |
| `.github/workflows/pages.yml` | GitHub Pages deployment |
