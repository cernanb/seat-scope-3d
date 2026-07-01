# Seat Scope 3D

Seat Scope 3D is a Next.js app for evaluating movie theater seats in a medium auditorium.
Users can select a visible seat, compare viewing metrics, and inspect a 3D seat perspective toward the screen.

## V1 Scope

- Medium auditorium seating chart with aisles and unavailable seats.
- Seat selection with keyboard navigation across available seats.
- URL persistence through the `seat` query parameter.
- Selected seat metrics for distance, horizontal angle, and vertical angle.
- 3D auditorium perspective from the selected viewing position.
- Generic screen-size categories (Boutique through IMAX Giant Screen), or a small
  curated set of real Southern California theaters modeled from researched
  specs (see `docs/adr/0002-approximate-real-theater-data.md` for the
  approximation approach). The selected real theater persists through the
  `theater` query parameter.
- Seat map and 3D perspective are stacked full-width on every screen size.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Verification

Run the local checks before shipping changes:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

`npm run build` may need network access because the app uses `next/font/google` for Geist fonts.
