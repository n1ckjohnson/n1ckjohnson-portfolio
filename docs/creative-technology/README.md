# Creative Technology

Eight projects, each a section of one continuous page at `/creative-technology`, addressed as `/creative-technology#<slug>`. A table of contents sits in the left margin on wide screens. Every section has the same quiet frame and one demonstration that is its own, built from that project's real output, with the code behind it.

For the site as a whole (design rules, layout classes, routes) see [docs/site/README.md](../site/README.md).

## The projects

| # | Project | Section | Demonstration |
| --- | --- | --- | --- |
| 1 | Game week | `#game-week` | Scroll scene: the computed variable regions are outlined, and each week's delivered header replaces the last in one crossfade. Then the Week 1 package opens from its header as one composition: nine finished files of the week's 24 game-week deliverables (7 from the final delivery folder, the rest re-exported after the designer's manual pass), in the montage's original layout. Part: **Jaguars App splash screens** (`#splash-screens`), the delivered Lottie files in a fan; choosing one centres it and it loops. |
| 2 | Creative suite versioning | `#creative-suites` | The original Week 8 creative opens into its formats once, when half on screen; the reader then switches the same ten placements between Rivalries, Throwback (Week 3, verified against the approved Throwback creative source) and Salute to Service (Week 12, pending), all ten at once. Then **In Spanish**: the camera visits each region that changes in the 16:9, the Spanish pixels replace the English there, and the corrected version joins the other Spanish sizes. |
| 3 | Rivalries color | `#rivalries-color` | A studio photograph as shot and as corrected. The divider sweeps with scroll and can be dragged; a camera frames Full image, Jersey, Pants or Helmet, never outside the photograph's safe area. |
| 4 | Injury report | `#injury-report` | Scroll scene: three delivered reports (4, 8, 11 players) assembled from their own header and their rows (as one group), cut from the delivered file; then the delivered RIVALRIES and Throwback reports. |
| 5 | Score graphics | `#score-graphics` | Two scroll scenes: Week 1 state by state (Q1, Half, Q3, Jags Win) in 3:4 and 9:16, the camera moving in on the score band at each change; then the win state in Throwback, RIVALRIES and TNF. |
| 6 | Player birthdays | `#player-birthdays` | Scroll scene: Trevor Lawrence's graphic built from the layer groups of its production PSD, the delivered file, then the batch of ten. Any graphic opens large. |
| 7 | Jags Win email | `#jags-win-email` | Scroll scene: the master's six modules, the sent Rivalries email assembled into them, then the TNF and Throwback editions re-skinning the same modules. |

A project with `parent` set is shown as a part of that project's section, after its demonstration, with its own heading and address, and is not listed in the contents.

Projects retired from the website (new hire, carousel, targeted automation) are kept uncompiled in `content/creative-technology/archive/` and `components/creative-technology/archive/`. Their old addresses redirect to the page.

## Scroll scenes

`components/creative-technology/motion/` is the motion engine:

- `timeline.ts`: a timeline is a pure function of one number, 0 to 1. Tracks move transforms, opacity and CSS custom properties between two values over a window. Every frame is computed from scratch, so a scene plays backwards, survives a resize and can be opened half-way through from a link.
- `drivers.ts`: the scroll bar (pinned or passing) or a clock, straight from an animation frame. No React state per frame. `useDecodeAhead` decodes a figure's images before it arrives.
- `scene.tsx`: `useTimeline`, `Stage`, `PinnedStage`.
- `step-figure.tsx`: the frame every system demonstration shares. Nothing pins and nothing reads the scroll bar: the stage, its labelled step controls and the sentence about the current step sit in the page like a figure in an article. It plays like directed motion: it starts only when most of it is on screen, holds its opening composition (`openHold`), then plays each change for its own duration (`ms`) followed by its own hold (`hold`). A looping figure holds its last step longest (`loopHold`) and fades back to its first; others end on their last step. Off screen it pauses; back on screen it holds briefly, then carries on. Choosing a step pauses the guided sequence; a quiet Play resumes it. With reduced motion it shows the last step and the controls switch without animating. The code follows the figure.

Elements a timeline moves carry `data-m="<name>"`. Sizes inside a stage are in `cqw`, so a scene is the same picture on a phone and on a desktop.

The LED / Media Day photography project was retired on 2026-11-14 and replaced by Rivalries color engineering. Its content is kept in `content/creative-technology/archive/`.

## How a project is put together

```
content/creative-technology/
  projects/<id>.ts      Copy, status, facts and the demonstration's configuration
  index.ts              The list, in order
  media.json            Every asset, with its approval
  types.ts              The content model
lib/creative-technology/
  projects.ts           Filters copy and media for the build audience
  media.ts              Resolves an asset id to a file, or to nothing
  audience.ts           Public or internal
  pack.ts               Packs the ticketing formats into one rectangle
  injury-layout.ts      The Injury Report layout rules, for captions
components/creative-technology/
  project-section.tsx   The frame every section shares
  code-block.tsx        The one way code is shown
  contents.tsx          The table of contents
  details.tsx           Technical details, closed by default
  demos/                One demonstration per project, and the registry
  motion/               Timeline, drivers, scroll scene
  ui/                   Plate, segmented control, cross-fade, hooks
```

Each project has a stable `id` (which also names its demonstration), a `slug` (its section address), a `title`, one `line` under the name, an honest `status`, its `stack`, `facts` with a public or internal tier, `code` samples, a `mediaPrefix` and a `demo` configuration. `publication.copy` says whether the page itself may appear in a public build.

### Rules the content follows

- `status` says exactly how far a system has got. It is never rounded up. The carousel is "Architecture designed" and says what is still planned.
- No time savings, output counts or accuracy figures are stated unless they were counted from files on disk. The ticketing counts (53 deliverables, 25 sizes) are read from the Week 8 shipping package.
- Demonstrations show results. None of them claims to be operating Photoshop. Where something is a model and not output, the caption says "Illustrative".
- Code is labelled "Source excerpt" or "Illustrative". Seven projects show sanitized excerpts of their working source (shortened, paths and private values removed). Rivalries color is illustrative: no automation source for it exists on disk.
- Only games that have been played are shown. Splash screens and Game Week headers are listed by an explicit allowlist in their content files; add a week once its game is over.

## Audiences and media

Every asset is declared in `content/creative-technology/media.json` with an `approval` of `approved` or `pending`. A graphic having been released by the team does not make it approved for this site: approval is a decision recorded per asset.

| Build | What it shows | How to run it |
| --- | --- | --- |
| Internal | Approved and pending media, internal-tier facts. Never indexed. | `npm run dev`, or `npm run build:internal` (writes `.next-internal`) |
| Public | Approved media and public-tier copy only. | `npm run build` |

Pending files live in `media-internal/`, which is git-ignored and outside `public/`. A public build resolves a pending asset to nothing: the page never references it, the file is never traced into the build, and the route that serves internal media answers 404.

What a public build shows in place of pending media is decided by each demonstration:

- **Splash screens** plays the three approved Lottie files (Weeks 1, 2 and 8).
- **Creative suite versioning** draws the ten placements as outlines at their true proportions, with the same keeps-and-drops readout, and leaves out the Spanish scene.
- **Everything else** shows one short paragraph saying the visuals are held back and what the demonstration covers.

### To approve an asset

1. Set its `approval` to `approved` in `media.json`.
2. Run the media builder. It writes the derivative to `public/creative-technology/media/`.

```bash
npm run media
```

3. Run `npm run build` and check the page.

### To add or rebuild media

The builder reads `media.json` and a private source map, `media-internal/sources.local.mjs`, which points at the original files on this Mac. It writes display-sized derivatives only. Originals are opened read-only. PSDs are never copied.

Two exceptions read PSDs, both with `psd-tools` (`pip install psd-tools`):

- `extract-color-masks.py` reads the layer-mask channels of named adjustment groups in the Rivalries working PSD and writes small alpha masks.
- `extract-psd-layers.py` renders the layer groups of one birthday PSD (Trevor Lawrence, Side layout) on transparent canvases, and finds every row in three delivered Injury Reports: it writes each report with its rows lifted out, and the row boxes to `content/creative-technology/data/injury-rows.json`. Its private paths are in `media-internal/psd_sources.local.json`. Outputs go to `media-internal/derived/`, and the source map points the builder at them.

### Checking a public build is clean

```bash
npm run build
```

```bash
grep -rl "internal-media" .next/server/app .next/static --include=*.html --include=*.rsc --include=*.js | grep -v "app/internal-media/"
```

The second command should print nothing: no built page or script mentions the internal media route. `public/` should contain no file listed as pending in `media.json`.

## Adding a project

1. Create `content/creative-technology/projects/<id>.ts` and add it to `index.ts`.
2. Add its assets to `media.json` (pending) and to the private source map, then run `npm run media`.
3. Write its demonstration in `components/creative-technology/demos/` and add it to `registry.tsx`, keyed by `id`. Set `ownsCode` when the demonstration draws the code itself. A project with no entry gets its first image on a stage.

A demonstration receives `{ project, media, internal }`. `media` maps asset ids to files; an id this build may not show maps to `null`, and the demonstration must handle that. Reuse `Plate`, `Segmented`, `Swap` and `Picker` before writing new controls: they are what keep the pages consistent.

## Media that needs a decision

Nothing below is in a public build. Each needs the owner's approval, and where it carries a likeness, a signature or a partner mark, the team's.

| Project | Pending, used on a page | Why it is held |
| --- | --- | --- |
| Splash screens | 6 Lottie files, 9 final-frame images, 1 night background | Opponent and partner marks |
| Creative suite versioning | 22 Week 8 formats, 5 of them Spanish | Opponent, league and partner marks; player likeness |
| Rivalries color | 1 photograph pair (two more pairs, masks and QA sheets are declared but not shown) | Team photography; player likeness |
| Injury Report | 6 delivered reports and 6 derived bases (rows lifted out) | Real players' reported injuries; partner marks |
| Game Week | 6 headers, 1 computed mask, 9 Week 4 package files | Opponent and partner marks; player likeness |
| Score graphics | 8 Week 1 graphics, 3 Jags Win editions (Weeks 3, 8, 9) | Team photography; player likeness |
| Player birthday | 10 graphics (five from September 2026), 6 PSD layer renders | Likeness; a player's signature |
| Jags Win email | 3 sent emails | Photography; partner marks |
| New hire | 9 synthetic outputs | Team and stadium artwork (no employee appears) |
| Carousel | 5 slides | Partner marks; event photography |
| Targeted automation | 4 artefacts | Campaign creative; likeness |

Held back entirely and not used on any page: the Week 14 ticketing suite (70 files), splash screens and Game Week creative for games not yet played, two further Week 9 splash versions, and the Media Day review sheet.

## What is missing

Recorded so no page implies more than exists.

- **Public build.** Only three splash animations and two phone backgrounds are approved. Every other demonstration falls back as described above.
- **Rivalries color.** The page is new. Its wording was drafted from the working files and should be read through before it is published. No correction accuracy is claimed.
- **Ticketing.** The per-format "keeps and drops" lists were read off the delivered Week 8 files by eye. The six SMS backgrounds and the print ad are counted in the totals and not shown. The Spanish regions were measured by comparing the English and Spanish 16:9 files.
- **New hire.** Only output rendered from synthetic test cards and fictional names is shown.
- **Jags Win email.** No standard-theme sent email exists on disk, so the editions are Rivalries (W8), Night (W9) and Throwback (W3). Jags Rewind is not on the website.
- **Rivalries.** No three-stage All Smiles sequence exists for the Rivalries uniform; the All Smiles graphics found are other games.
- **Player birthdays.** Daniel Faalele is excluded. The September 2026 "Jags at Work" (`_02`) variants are a different design family and are not used.
- **Carousel.** No standard-theme fan zone slide exists, so that combination is switched off.
- **Targeted automation.** Roster graphics, newsletter production and export workflows are named by the owner; there is no artefact for them.

## Earlier directions

Two earlier builds are saved as local refs and can be read or restored:

- `refs/backup/pre-editorial-redesign`: the single-page white Creative Technology experience and the systems-first homepage, as they stood on 2026-11-14 before this redesign.
- `refs/backup/pre-white-redesign`: the presentation-style build before that.

For example: `git show refs/backup/pre-editorial-redesign --stat`.
