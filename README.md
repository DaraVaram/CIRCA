# CIRCA research group site

**C**onstrained **I**nference, **R**epresentation, **C**ompression and
**A**pplications. American University of Sharjah.

React + Vite + TypeScript + Tailwind v4. Content lives in JSON, and components
never hardcode it.

```bash
npm install
npm run dev        # http://localhost:5173/CIRCA/
npm run build      # typecheck + production build to dist/
npm run typecheck
```

The dev server serves from `/CIRCA/` too, matching production, so path bugs
surface locally rather than at deploy time.

## Where to edit content

Everything editable without touching a component:

| File | Holds |
| --- | --- |
| `src/site.config.ts` | Group name, tagline, logo, PI details, nav, contact routing |
| `src/data/pi.json` | The principal investigator profile: bio, education, appointments, teaching, awards, service, government roles |
| `src/data/tracks.json` | The five research tracks (title, blurb, long description, accent color) |
| `src/data/members.json` | Current members and alumni, including theses and abstracts |
| `src/data/publications.json` | Full bibliography, keyed to the CV labels (`J12`, `C7`, `B1`, `T3`, `D1`) |
| `src/data/news.json` | News feed. `featured: true` also puts an item on the home ticker |
| `src/data/collaborators.json` | Institutions for the collaboration map. The entry with `"kind": "home"` is the group's own institution and the origin of every arc, so it is not counted as a collaborator |
| `src/data/projects.json` | Senior design and capstone projects |
| `src/data/undergraduates.json` | Where capstone students went afterwards, matched by name |
| `src/data/scholar.json` | Citation count and h-index (see below) |

Types for all of it are in `src/types/content.ts`. `npm run typecheck` will fail
if a JSON file drifts from its schema, so a typo in a track id is caught at build
time rather than in the browser.

### Branding

`siteConfig.name` is the only place the group name appears.

The mark lives in `src/components/ui/Mark.tsx` and has five variants, all built
on the same idea the name carries: a circle approximated by straight segments.
Switch between them with `logoVariant` in `site.config.ts`, or set `logo` to a
path in `/public` to use a custom file instead.

| Variant | Mark |
| --- | --- |
| `A` | Seven chords, open as a C |
| `B` | The same chords with the exact circle ghosted behind, showing the error |
| `C` | A constrained path bending around a boundary |
| `D` | The circle snapped to an integer lattice |
| `E` | Three arcs, coarser toward the center. **The current mark** |

Variant E carries three rings at display size. Below roughly 24px they merge
into a blob, so `Mark` takes a `compact` prop that drops to a two-ring reduction
for small renders. The favicon uses that same reduction.

`public/favicon.svg` is generated from the same geometry as the component, so the
two cannot drift apart. Regenerate it after changing `logoVariant`, and update
`VARIANT` at the top of the script to match:

```bash
npm run favicon
```

### Track tagging

Every publication, member and project carries a `tracks` array of one or two
`TrackId` values. That tagging drives the publication filters, the track detail
pages, and the per-track counts, so it is worth keeping accurate.

## Metrics

Four of the five home page metrics are computed from the data files and cannot go
stale: publication count, collaborating institutions, country count, and member
count. They update the moment you edit the JSON.

Citations and h-index cannot be derived, because Google Scholar has no public
API. They live in `src/data/scholar.json` with a `lastUpdated` date that is shown
in the footer, so the number is never presented as more current than it is. Three
ways to keep it fresh, in increasing order of effort:

1. Edit `scholar.json` by hand a few times a year (current setup).
2. A scheduled GitHub Action that scrapes the Scholar profile and opens a pull
   request. Scholar rate-limits and occasionally serves a CAPTCHA, so it needs to
   fail gracefully and leave the last good value in place.
3. A paid API such as SerpApi. Reliable, roughly $50 per month.

## Images

| Folder | Holds |
| --- | --- |
| `public/images/members/` | Square member photos, referenced by `photo` in `members.json` |
| `public/images/pi/` | Principal investigator portraits |
| `public/images/news/` | Event photography, referenced by `image` in `news.json` |
| `public/images/papers/` | Publication figures, referenced by `figure` on a publication |

News items carry `imageKind: "figure"` when the image is a paper artifact on a
white ground, a journal title block or a diagram. The UI frames those as a
document rather than bleeding them into the dark layout. Event photography uses
`"photo"` and is cropped to fill.

A news item that announces a paper does not need its own image. If its `href` is
`/publications#<id>` and that publication has a `figure`, the news card inherits
it, so the figure lives in exactly one place and the two cannot drift apart. An
explicit `image` on the news item still wins, which is how the one paper with a
title block but no figure keeps it.

### Publication figures

Source images live in `PublicationPictures/` and are a mix of architecture
diagrams and journal title pages, at very different sizes and aspect ratios. The
optimizer scales each one to fit a single fixed canvas and centers it on white,
so every output is identically 1400x467 and the figure cards down the publication
list cannot drift out of alignment. Nothing is cropped.

```bash
python scripts/optimize-figures.py
```

To add a figure, drop the image in `PublicationPictures/` and add a line to
`MAPPING` in the script, keyed by publication id. The script reports anything
unmapped. Figures are optional: publications without one simply render without,
which is the case for the older papers and most of those under review.

## Adding a person

Add an entry to `members.json` and drop a square photo in
`public/images/members/`. `slug` becomes the profile URL. Publications link
themselves to a member automatically: `src/lib/content.ts` matches author strings
to members on first initial plus surname, so `Hamza A. Abushahla` in a paper
resolves to the `hamza-abushahla` profile with no manual cross-referencing.

Set `activeCollaborator: true` on an alumnus who is still working with the group.
They keep their alumni status but stay marked as active on the People page.

## Typography and theme

Fonts are self-hosted through `@fontsource-variable`, so there are no external
requests and the site works offline. Plus Jakarta Sans carries everything and
JetBrains Mono carries the small uppercase labels.

One family means headings only need a weight, which the base rule in
`index.css` sets to 700. Display headings additionally carry `tracking-tight`,
redefined to `-0.032em` because Plus Jakarta Sans is wide and needs more
negative tracking at large sizes than a default sans would. Card titles set
`font-medium` and keep their natural spacing, so do not add `tracking-tight`
to anything below roughly 20px.

The identity color is the MIT and AUS maroon. Tokens are named by **role**, not
by literal color: `ink-950` always means "page background" and `slate-50` always
means "strongest text". The light theme reassigns those same tokens rather than
introducing a parallel set of classes, so no component carries a `dark:` variant.

- `src/index.css` holds both themes. The `@theme` block is the dark set of
  values, and `:root[data-theme='light']` overrides the same custom properties.
  Tailwind v4 utilities read those properties at use time, so an override flips
  every utility built on them.
- `src/lib/theme.ts` is the runtime side: the toggle, the `useTheme()` hook, and
  `vizPalette()`, which resolves the active theme's colors for canvas code that
  cannot use classes.
- `trackVar(id)` returns `var(--color-track-<id>)`, safe inside an inline style,
  so track accents follow the theme without threading it through props.

Light is the house default. A stored choice wins, and a visitor whose system
asks for dark gets dark. An inline script in `index.html` applies the result
before first paint, so there is no flash of the wrong theme.

## The hero background

`FieldBackdrop` draws contour lines with descent trajectories running across
them. Both halves come from one scalar field: the contours are its level sets
and the streaks follow its gradient, so the streaks cross the contours at right
angles because that is what a gradient does. It is the same picture the
optimization demo draws with two paths, at wall scale.

While the pointer is over the field, most new trajectories are released at the
cursor, so moving the mouse feeds the flow and the streaks run downhill away
from it.

Four things keep it cheap. The first version stroked once per particle, which
is what made it slow:

- **Segments are batched.** Every segment goes into one `Path2D` per color and
  alpha bucket, and each path is stroked once. A frame costs a fixed handful of
  stroke calls regardless of particle count. This took stroke calls from roughly
  126,000 per second to about 400.
- **The field is a shared grid.** Values and gradient are sampled onto one
  56 by 38 grid, and the per-particle gradient is a bilinear read off it rather
  than a fresh evaluation of every well.
- **The layers run at different rates.** Contours drift slowly, so they redraw
  at 5 fps and the shared field is recomputed on the same cadence. Flow runs at
  20 fps on its own canvas at 0.62 scale, since the streaks are soft.
- **It stops when nobody is looking.** An IntersectionObserver and
  `document.hidden` both gate the loop.

One detail worth keeping: trails fade with `destination-out` rather than by
washing the page color over them. An opaque wash converges to a solid sheet,
which silently buried the contour layer underneath.

Measured on a 1273 by 1216 field: median frame 6.9 ms, p95 7.2 ms, and about
1.4 ms of that is the flow step, against a 50 ms budget at 20 fps.

Two earlier attempts are in the history if they are ever wanted: `AuroraField`,
a soft gradient field with grain, and `FlowField`, the streaks without the
contours. Recover either with
`git show a1c12b1:src/components/viz/ContourField.tsx`.

## Research track demos

Each of the five tracks has a working demo in `src/components/viz/`, shown in the
home page carousel (`TrackShowcase.tsx`) and on the matching track page. They run
the real method rather than showing a picture of it:

| Track | Demo | What it computes |
| --- | --- | --- |
| Optimization | `ConstrainedDescent` | Priority-constrained descent against plain gradient descent, with a live tau |
| Efficient & Edge ML | `QuantizationDemo` | Uniform symmetric quantization at 1 to 8 bits, with real RMSE |
| Wireless Sensing | `MultipathDemo` | Image-method reflections and the resulting channel impulse response |
| Representation Learning | `SeparationDemo` | Class separation across depth, scored by between-class over within-class scatter |
| Applied & Trustworthy | `FingerprintDemo` | Log-distance RSSI fingerprints, and which cells stay resolvable as access points go offline |

All five share `useCanvasPainter.ts`, which handles device pixel ratio, resize,
and repainting when the theme flips. Each is lazily loaded, so only the first
slide is in the initial bundle.

## Publication links

`scripts/fetch-dois.mjs` looks up DOIs against Crossref. It only accepts a match
when the returned title is a close token match **and** one of our authors appears
on the record, because a wrong DOI is worse than no DOI. Anything below that bar
is reported for a human to confirm.

```bash
node scripts/fetch-dois.mjs          # report only
node scripts/fetch-dois.mjs --write  # apply the confident matches
```

Every publication row offers BibTeX and plain-text citation copy, generated in
`src/lib/citation.ts`.

## House style

Site copy avoids em dashes and semicolons, and uses American spellings
throughout. `scripts/check-copy.py` enforces all three across `src/` and this
file.

```bash
python scripts/check-copy.py
```

## Deployment

Live at **https://daravaram.github.io/CIRCA/**

Every push to `main` triggers `.github/workflows/deploy.yml`, which typechecks,
builds, runs the house style check, and publishes `dist/` to GitHub Pages. A
failing typecheck or style check fails the deploy rather than shipping.

### Serving from a subpath

The site lives at `/CIRCA/`, not the domain root, which three things depend on:

- `vite.config.ts` sets `base` to `/CIRCA/`. Override it with the `BASE_PATH`
  environment variable, for example `BASE_PATH=/ npm run build` for a custom
  domain.
- `src/main.tsx` passes `import.meta.env.BASE_URL` to the router as `basename`.
- `src/lib/assets.ts` exports `assetUrl()`, which joins the base onto the
  site-absolute image paths stored in the data files. **Any new `<img>` fed from
  JSON must go through it**, or it will 404 on the deployed subpath.

The absolute URLs in the `og:` meta tags in `index.html` are not rewritten by
the build, so update them by hand if the domain changes.

### The 404 status on deep links

GitHub Pages has no SPA rewrite. The build copies `index.html` to `404.html`, so
a deep link like `/CIRCA/people` loads and renders correctly, but the HTTP status
is 404, which crawlers see. Options, in order of effort:

1. Leave it. Users are unaffected, and this is what most SPAs on Pages do.
2. Switch `BrowserRouter` to `HashRouter` in `src/main.tsx`. Correct statuses,
   uglier URLs (`/CIRCA/#/people`).
3. Move to a host with real rewrites. Vercel and Netlify both handle this out of
   the box and would also allow a custom domain with `BASE_PATH=/`.

## Content still needed

- A photo for Kenzy Khalifa.
- A thesis title for Sarah Elfattal, and her track tags.
- A higher-resolution photo for Yousef Irshaid. The current one is 200x200.
- DOIs and links for publications. `Publication` has optional `doi`, `url` and
  `pdf` fields that the UI already uses when present.
- Confirmation of which paper backs each collaboration in `collaborators.json`.
  The institution list is confirmed, but the per-paper attribution is inferred
  from co-author names.
