# Small Wins

Small Wins is a lightweight to-do app designed to feel calm, friendly, and easy to use. It helps you track daily tasks, mark them complete, filter your list, and keep everything saved in the browser.

## Features

- Add new tasks
- Mark tasks as complete or active
- Delete individual tasks
- Clear completed tasks
- Filter by all, active, or completed items
- Progress bar and summary counts
- Local browser storage so your list persists after refreshes
- Minimal, warm visual design inspired by a soft daily planning ritual

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript

## Project Structure

- `index.html` — app layout and markup
- `style.css` — styling and layout
- `script.js` — task logic and browser storage
- `favicon.svg` — small app icon

## Run the app locally

Because this is a static app, you can open it directly in a browser or run a simple local server.

### Option 1: Open directly

1. Open `index.html` in your browser.

### Option 2: Run a local server

From the project folder, run:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## How it works

The app stores tasks in `localStorage`, so your list remains available even after refreshing the page or reopening the browser. The interface updates in real time as you add, complete, filter, and remove tasks.

## Notes

This project is intentionally simple and dependency-free, making it a good example of a vanilla JavaScript app for learning DOM manipulation and browser persistence.
