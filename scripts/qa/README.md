# Visual QA

Nothing in this folder is used by the site.

`browser.mjs` is a small driver for the Chrome already installed on this Mac. It runs Chrome headless with a throwaway profile and has no dependencies. Use it to capture a page at an exact viewport, part-way through an animation, with reduced motion on, and to collect console errors. Set `CHROME_PATH` if Chrome is installed somewhere else.

## The standing check

With the dev server running on port 3000:

```bash
npm run qa
```

It writes screenshots to `.qa/latest/` (git-ignored) and prints any console errors, failed requests, broken images or sideways overflow it found. It exits non-zero if there are findings.

- `pages/`: every page, full length, at 1440, 768 and 390 wide.
- `states/`: each demonstration, state by state. The splash bouquet closed, opening, open, with a screen chosen, hovered and released. The ticketing suite as one creative, mid-way, open and in focus. The color comparison at rest, dragged and with a region picked out. Then the same three with reduced motion, and one capture per meaningful state of the quieter demonstrations.

Pass a name to keep runs apart, and `--only pages` or `--only states` to run half:

```bash
node scripts/qa/sweep.mjs after-fix --only states
```

## Audiences

`check-audiences.mjs` confirms the public build cannot serve unapproved media and the internal preview can. It expects a public build on port 3001 and the dev server on port 3000:

```bash
npm run build
```

```bash
npx next start --port 3001
```

```bash
node scripts/qa/check-audiences.mjs
```

Pass `-` in place of either origin to skip it.
