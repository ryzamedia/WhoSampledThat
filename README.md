# Who Sampled That?

A music party game for one screen and good company. Play at **[whosampledthat.com](https://whosampledthat.com)**.

Add 1–12 players or teams, listen to an original sample, and guess the newer song that uses it. Each of the 21 rounds offers one point for the newer artist, one for the newer song, and one for identifying the original sample. Tap a point again to correct it. Finish early or play the full collection, then share the results.

## Design and seasons

The app uses warm paper colours, vinyl artwork, and locally hosted Fraunces and DM Sans fonts. Seasonal accents follow the visitor's local date:

- **Christmas:** 1–30 December
- **New Year:** 31 December–5 January
- **Halloween:** 15–31 October
- **Classic:** the rest of the year

Settings provides previews of each theme, an automatic option, and a classic option that disables seasonal accents. Preferences persist across games. Animations respect reduced-motion preferences.

## Development

Use Node.js **24** and npm.

```sh
npm ci
npm run dev
```

```sh
npm test                 # Game, persistence, playback, sharing, and seasonal regressions
npm run lint
npm run build
npx wrangler dev          # Built app, share metadata, and PNG previews on localhost:8787
npx wrangler deploy --dry-run
```

The frontend runs on React, TypeScript, and Vite. Headless UI provides accessible dialogs; react-youtube provides playback. The Cloudflare Worker serves assets and shared results. PNG scorecards use a bounded SVG template, XML escaping, and resvg; they do not fetch player-controlled URLs.

## Game state and sharing

One reducer updates score selections and totals together. Version 2 browser storage keeps settings, players, round position, and per-round selections. The loader validates stored data and migrates the previous separate round-score format. A new game clears all selections; replay keeps the guest list. A failed browser save is disclosed without stopping the current game.

Shared URLs contain UTF-8 JSON encoded as base64url. Old compact links remain supported. Opening a shared result displays that result without replacing the visitor's saved game. Names and scores in a shared link are public to anyone who has the link.

## Playback

Each round creates exactly two players, shared across responsive layouts. Samples respect the configured start and duration; newer songs use 30-second clips. Pause preserves progress and replay returns to the start. Autoplay is opt-in; browser policies can still require a press of Play.

YouTube availability, regional restrictions, advertisements, and embed permissions are outside the app's control. An unavailable track offers a YouTube link and the round navigation remains usable. A temporary loading failure offers one manual retry. The waveform is a decorative progress display, not a real audio waveform.

Track pairs and excerpt timings live in `src/data/tracklist.json`.

## Deployment

Pushes to `master` or `main` in `ryzamedia/WhoSampledThat` run tests, lint, build, and deploy through GitHub Actions using repository secrets. Pull requests run checks without deploying. See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting and DNS details. The domain is registered at Spaceship, with Cloudflare DNS and Workers hosting.
