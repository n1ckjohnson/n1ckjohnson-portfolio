# The site

n1ckjohnson.com is a short personal site. The pages are quiet and mostly text. The work is shown inside the project pages, where each Creative Technology project has one interactive demonstration built from its real output.

This file covers the whole site: the design rules, the layout system, the routes, and how to change things. The Creative Technology projects, their media and the approval pipeline have their own file: [docs/creative-technology/README.md](../creative-technology/README.md).

## Routes

| Route | What it is |
| --- | --- |
| `/` | Name, one sentence, About opened in place, the eight Creative Technology projects, the design work behind a disclosure. |
| `/creative-technology` | One continuous page: every project as a section (`#<slug>`) with its demonstration, code and technical details. Table of contents in the margin. |
| `/work/<slug>` | A design case study. These addresses have not changed. |
| `/profile` | Redirects to About on the homepage (`/#more-info`). |

Earlier addresses (`/creative-technology/<slug>`, the six systems once under `/work`, `/profile`) redirect to the right section (`next.config.ts`). The redirects are temporary while the site is under review.

There is no navigation bar. The homepage is the index, and every other page carries one link back up a level.

## Design rules

1. **The site is simple. The work is sophisticated.** Nothing on a page is there to decorate it.
2. **White.** `#FFFFFF` page, `#121212` text, one neutral grey for secondary text. `#F5F5F5` appears only as the stage behind real work. Teal `#006778` is reserved for focus rings and text selection. There are no dark sections, gradients or glows; dark creative sits on the same light stage as everything else.
3. **One type size for almost everything.** Inter at 15px on a 24px line. Small text is 13px. A page title is 18px and medium weight; nothing is larger. Hierarchy comes from colour and weight, not size. Sentence case throughout, no letter-spaced capitals, no numbered section labels.
4. **A narrow column.** Text never runs wider than 580px, on any screen. On a wide screen the extra space is margin.
5. **Media may be wider than text, when it needs to be.** A stage can grow to 960px, centred on the same axis as the column. A photograph or a single graphic is sized to itself, not stretched to the stage.
6. **Motion explains something or it is not there.** One easing curve, four durations. Movement shows a change of state, a relationship or a comparison. Nothing loops for effect, nothing intercepts scrolling, and everything honours reduced motion.

## Where things live

```
app/globals.css                 Tokens and every shared class
tailwind.config.ts              The same tokens as Tailwind utilities
app/(site)/                     All pages
components/site/                Shell, page head, footer
components/case-study/          Design case-study template
components/media/               Images, video and the gallery for case studies
components/creative-technology/ Project page frame, details, demonstrations
content/                        All copy and structured data
lib/                            Build-time helpers (media, portfolio, projects)
scripts/creative-technology/    Media builder
scripts/qa/                     Visual QA driver
```

### Tokens

All in `:root` in `app/globals.css`: colours, `--measure` (580px), `--stage` (960px), gutters, two radii (`--radius` 12px for stages, `--radius-s` 6px for exports and thumbnails), one easing family and four durations. Reduced motion collapses the durations to 1ms in one place, so every CSS transition on the site respects it without further work.

### Layout classes

| Class | Use |
| --- | --- |
| `.col` | The reading column. Everything textual. |
| `.wide` | The media stage: up to 960px, centred. |
| `.spaced` | The standard gap above a section. |
| `.stage` | The off-white rounded tile real work sits on. |
| `.plate` | A stage of fixed height that fits one graphic inside it. Switching between a tall and a wide export moves nothing else on the page. |
| `.caption` | Small grey centred text under a figure. |
| `.rows` / `.row` | A list of links with hairlines. Neighbours step back when one is hovered or focused. |
| `.pairs` / `.pair` | A list of facts: grey term, value. |
| `.seg` | The segmented control every demonstration uses. |
| `.chip` | A single button in the same voice. |
| `.details` | The closed-by-default technical details block. |

`PageHead` (in `components/site/page-head.tsx`) is the top of every page below the homepage: back link, title, one grey line. On screens 1120px and wider the back link moves to the left margin so every title starts at the same height.

## Changing things

**Homepage copy** is in `app/(site)/page.tsx`. It lists every Creative Technology project, linking to its section. The design work comes from `content/projects.ts`.

**A design case study**: edit its entry in `content/projects.ts`. Media is picked up by filename from `public/work/<slug>/` (`hero`, `thumb`, `break`, `support-N` and so on); how it is arranged is in `content/creative-layouts.ts`. To retire one, set `status: "archived"`.

**About and contact**: `content/profile.ts`.

**A Creative Technology project**: see the other README.

## Checks

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm run test:ct
```

```bash
npm run build
```

`npm run build` is the public build. It contains only media marked approved. See the other README for the internal build and for how to confirm nothing unapproved is in the output.

### Visual QA

With the dev server running:

```bash
npm run qa
```

This drives the Chrome installed on this Mac, headless, and writes captures to `.qa/` (git-ignored): every page at 1440, 768 and 390 wide, then every demonstration state by state, with and without reduced motion. It prints console errors, failed requests and any page wider than its viewport. Details in [scripts/qa/README.md](../../scripts/qa/README.md).

To confirm the two audiences behave as documented, run a public build on port 3001 beside the dev server, then:

```bash
node scripts/qa/check-audiences.mjs
```

It fetches every pending asset from the public server and expects none of them to be served.

### Design skills

Checked on 2026-11-14, for the record:

- There is no `/taste` command or skill in this Claude Code setup, and Anthropic's frontend-design skill is not installed.
- The installed `design` plugin provides `design:design-critique` and `design:accessibility-review`. They are review checklists, not generators, and are safe to run against these pages.
- Stageshow (Benji Taylor) is a third-party skill and was not installed. It is built for staging simulated product interfaces, which these pages deliberately avoid. Its working method, to film an interaction, look at the frames and fix what they show, is what `scripts/qa` does here with no third-party code and nothing leaving this machine.

## Deliberate choices worth knowing

- **Inter, not the system font.** Inter is served from the site itself (`next/font`), so the page looks the same on a Mac, a Windows laptop and an Android phone. The system stack would be San Francisco on Apple devices and something else everywhere else. DIN 2014 is no longer the interface typeface; it remains where it belongs, inside the Jaguars creative.
- **Real exports are plain `<img>` elements**, not `next/image`, on the Creative Technology pages. Each file is already built at display size by the media builder, and the internal preview serves files from outside `/public`, which the image optimiser cannot read.
- **Pinned scenes**: the splash bouquet and the five scroll scenes hold their stage while the page scrolls past, using `position: sticky`. Scrolling is never intercepted, and with reduced motion nothing pins.
- **Secondary text is `#6B6B6B`**, darker than the references use, so it passes contrast at body size.
