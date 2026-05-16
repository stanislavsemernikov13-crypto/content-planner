# Content Planner

A simple production-ready Next.js dashboard for planning social media post ideas. Content Planner runs entirely in the browser and stores posts in `localStorage`, so no backend or database is required.

## Features

- Add post ideas with title, platform, status, date, and notes.
- Edit and delete planned posts.
- Filter by platform and status.
- Search by title or notes.
- View quick stats for total ideas, drafted, published, and scheduled posts.
- Responsive, modern dashboard built with Tailwind CSS.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Browser `localStorage`

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production build

Create an optimized production build:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

## Data storage

Posts are saved to your browser under the `content-planner-posts` localStorage key. Clearing browser storage will reset the saved content.
