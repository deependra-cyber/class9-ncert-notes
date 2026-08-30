# Class 9 NCERT Notes

A focused study companion for Class 9 students with:

- Mathematics — Ganita Manjari
- Hindi — Ganga
- English — Kaveri
- Science — Exploration
- Social Science — Exploring Society: India and Beyond
- Chapter summaries and searchable chapter maps
- 100 topic-linked practice MCQs for every subject (500 questions total)
- Chapter topics, revision notes, chapter Q&A, and extra Q&A with hidden answers
- Local progress tracking and best scores
- A working math calculator
- Offline-ready installable PWA for Android and Windows

## Run locally

```bash
cd artifacts/class9-ncert-notes
pnpm install
pnpm run dev
```

The app is a static React + Vite site. Quiz progress is stored in the browser with `localStorage`.

## Install for offline use

Build the site and serve the `dist` folder over HTTPS, then choose **Install app** in Chrome or Edge.

- **Android:** open the site in Chrome, choose the browser menu, then **Install app** or **Add to Home screen**.
- **Windows:** open the site in Edge or Chrome, choose the install icon in the address bar, then launch Padhai Desk from the desktop or Start menu.

The installed app caches the study interface and local content. A first online visit is needed to install the offline shell.