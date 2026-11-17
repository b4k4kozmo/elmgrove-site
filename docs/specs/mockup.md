# Spec: the test mock-up ("The Treehouse")

Written 17 Nov 2026 by the manager (Opus). A builder (Sonnet) builds from this; the manager reviews.
The mock-up is for the team to click through **before** answering the questionnaire, so it shows features, not a
finished site. It lives in `mockup/` and is viewed as a private Claude artifact (phones included). It is **not**
deployed to the public Pages site.

## Cosmo's words (17 Nov)
"A mock-up site based on the old site, using themes from the game … more pleasing, show more information, link to
things in a better way." Only games from the **Elmgrove itch**: a mix of most successful and most recent up front,
the rest in an "other / past games" section; don't play up the jam side. "Playable or downloaded from our website"
if easy. "Comfy", matches our colours and **the tree logo** (low-poly elm with sunglasses and a gun). "Very
goblin-y": base it on **Loot n' Goblin**, a little of the current game's mood (no names, no details). "A treehouse
vibe, like you're inside the tree of the logo, like a bunker with retro arcade machines that have our games on
them." Features he'd like: a **music player** with songs from our games, room for **mini-games**. "Simple enough,
but big enough to show all the features."

## Hard limits
- Public repo: no personal emails, no unannounced game details (the new game is only "something is digging under
  the roots"). No names of the new game.
- Copy facts only from `mockup/data/*.json` and this spec. Where something isn't known (a crew member's role), show a
  visible placeholder like `[role?]`. Never make up facts.
- Anything made up as an *example of a feature* (notice board posts) is labelled "Example" on the page.

## Technical shape
- One-page app with hash routes, so it works in the Claude artifact viewer (no iframes there, no query strings;
  `fetch()` of relative files works) and on any static host.
- Files (the builder may create/edit only these):
  `mockup/index.html`, `mockup/css/site.css`, `mockup/js/site.js`, `mockup/data/content.json`,
  `mockup/data/tracks.json`, `mockup/assets/ui/*` (small generated images/SVG only).
  Read-only inputs: `mockup/data/games.json`, `mockup/assets/games/**`, `mockup/assets/logo.png`,
  `mockup/assets/fonts/GoldBox.ttf`, `mockup/assets/sounds/*`.
- **`index.html` is a fragment**: no `<!doctype>`, `<html>`, `<head>` or `<body>` tags (the artifact host wraps
  it). Start with `<title>Elmgrove Games</title>`, `<meta name="claude:viewport-fit-sides" content="cover">`, the
  Google Fonts link, `<link rel="stylesheet" href="css/site.css">`, then markup, then `<script src="js/site.js">`.
- Fonts: `@font-face` "GoldBox" from `assets/fonts/GoldBox.ttf` for display, falling back to "Pixelify Sans"
  (Google) then monospace. Body: "Atkinson Hyperlegible" (Google), system-ui fallback.
- No libraries. Vanilla JS, no build step. Total page code under ~60 KB.
- `localStorage` only in try/catch (sound on/off, loot found). The page must work with storage blocked.
- Phone first: works at 380 px wide, no sideways scroll, side gutter
  `padding-left: max(16px, env(safe-area-inset-left, 0px))` (same for right). Sticky header uses
  `top: env(safe-area-inset-top, 0px)`. Respect `prefers-reduced-motion`. Visible keyboard focus.
- No `alert/confirm/prompt`, no `<a download>`, no iframes. External links (itch, YouTube) are plain
  `<a href target="_blank" rel="noopener">`. The contact address is shown as text with a Copy button.

## Look: "a treehouse bunker inside the elm, at night"
Single dark theme on purpose (set `color-scheme: dark`, explicit `body` background). Tokens:
```
--night:  #170d22   page background: inside the tree at night
--dusk:   #400968   the logo's sky / cabinet sides (old site purple)
--orchid: #c25cb1   old site pink: highlights, marquee glow
--leaf:   #8fd67e   the logo's leaves: "on" states, links
--bark:   #5a3a22   wood
--plank:  #7a5132   lighter wood
--loot:   #e3a443   torchlight gold: buttons, loot, prices
--parch:  #efe5d2   text
--soot:   #0f0b09   deepest shadow, cabinet screens' bezel
```
- Background: a dark plank wall (CSS `repeating-linear-gradient` boards, subtle) with a soft warm torch glow at
  the top (radial gradient). Panels look like wooden boards with nail dots, not rounded glossy cards.
- The **logo** (`assets/logo.png`, 256×144 pixel art) is shown with `image-rendering: pixelated`, framed as a
  round or square **treehouse window** on the home hero, and small in the header as the home link.
- **Arcade cabinets** are drawn in CSS: a marquee strip on top (game title in GoldBox on orchid glow), a screen
  holding the game's cover (itch covers are 315×250), a control panel with a joystick dot and two buttons, and
  dusk-purple sides. Hover/focus: the screen brightens and the marquee flickers once (no flicker with reduced
  motion). A cabinet is one link to its game page.
- "Back room" older games sit on a wooden **shelf as cartridges** (smaller: cover thumbnail, title, year).
- Copy voice: friendly, a little goblin-y, short. E.g. hero "Climb in. The arcade's open." Don't overdo puns.

## Routes (the "pages")
Header (sticky wooden sign): small logo + "Elmgrove Games", nav: Treehouse · Arcade · Jukebox · Crew · Notice board.
On phones the nav wraps or scrolls horizontally inside its own strip. Right side: **loot counter** (sack icon + "3/8")
and a **sound toggle** (off by default).

1. `#home` (default) **The Treehouse**
   - Hero: the logo in its window; "Elmgrove Games"; "Indie game devs out of Seattle, WA. We make strange little
     games, mostly about goblins lately." Two buttons: "Enter the arcade" (#arcade), "Meet the crew" (#crew).
   - "Now playing" row: the four **featured** cabinets.
   - "What we do": three short boards (we make games fast, in jams and beyond; we went 3D and first-person with
     Loot n' Goblin; we build in Unity and Godot). Use only facts from games.json for engines.
   - Teaser board, dim and mysterious: "Something is digging under the roots." + "More when it surfaces." Nothing else.
   - Two latest notice-board posts (from content.json, labelled Example).
2. `#arcade` **The Arcade**
   - Filter chips: All · Plays in browser · Download (from games.json `browser_playable` / `downloadable`).
   - Featured cabinets (large), then "The back room": the remaining games as cartridges on a shelf.
3. `#game-<slug>` **Game page** (one per game, from games.json)
   - Big cabinet with the cover; title; tagline; fact strip: Year · Engine · Platforms · Made for (jam name, plain
     text, no ranks) · Team (if known).
   - Description; screenshot gallery (tap opens a simple lightbox, Esc/close button, arrow keys); "Watch" link if a
     trailer URL is in content.json.
   - Buttons: "Play in your browser on itch" (if browser_playable) and/or "Download on itch". Price "Free" if price
     is 0. A small note: "Hosted on itch.io".
   - "Players said": the quote from content.json if there is one, credited "itch.io comment".
   - "Behind the scenes" board: placeholder text "Notes from the team go here" labelled Example.
   - Prev / next cabinet links.
4. `#jukebox` **The Jukebox**
   - A jukebox/cassette deck panel: track list from `tracks.json` (title, game, length), play/pause, previous, next,
     a seek bar, current time. Audio starts only from a click.
   - **The player keeps playing while you browse** other routes: a slim "now playing" bar sits at the bottom of the
     screen (respect the bottom safe-area inset) once a track has started, with play/pause and the title.
5. `#crew` **The Crew**
   - Four crew boards from content.json: name, role (or `[role?]`), a pixel placeholder portrait (an initial on a
     coloured square is fine).
   - "Our games over the years": a vertical timeline of every game by year (from games.json), each linking to its page.
   - Contact: `team@elmgrove.games` as text with Copy; the itch link.
6. `#notices` **Notice board** (devlog preview)
   - Pinned paper notes (parchment colour, slight rotation, a pin dot), 3 example posts from content.json, each
     marked Example. One line on top: "Devlogs, jam diaries and news would live here."

Unknown hash → home. Changing route scrolls to top, updates `document.title`, moves focus to the main heading.

## The loot hunt (the first mini-game)
Eight small gold **loot sacks** are hidden around the site: one on each of the six routes types (home, arcade,
jukebox, crew, notices, and one on any game page) plus two more in odd places (e.g. behind the logo in the hero,
at the end of the timeline). Small (about 18 px), a little transparent until hovered, but findable. They are real
buttons with `aria-label="Loot sack"`. Clicking one: a coin "pop" animation, it disappears, the header counter goes
up, a short toast ("+1 loot. 5 to go."). All eight: toast "You've looted the whole treehouse. A true goblin." and
the counter turns leaf green. Found sacks stay found (localStorage, try/catch). A "reset loot" text button sits in the footer.

## Sound
Off by default. Header toggle (speaker or lantern icon, `aria-pressed`). When on: `assets/sounds/portal.wav`
plays quietly on route changes. It must never delay navigation; the old site's 1.5 s wait is gone. The
Jukebox works whatever the toggle says, because pressing play is the choice.

## Data files
- `games.json` (from the inventory, read-only): slug, title, tagline, description, published, platforms, engine,
  jam, browser_playable, downloadable, price, url, cover, shots.
- `content.json` (builder writes, manager reviews):
  `featured` (4 slugs, order), `quotes` {slug: text}, `trailers` {slug: url}, `crew` [{name, role}],
  `notices` [{date, title, body, example: true}].
- `tracks.json` (builder writes from the manager's list): [{title, game, src, length}].

## Done means
- `python3 -m http.server -d mockup 8765` and every route opens with no console errors.
- Firefox headless screenshots at 1280 px and 390 px of #home, #arcade, one game page, #jukebox
  (`firefox --headless --profile <tmp> --window-size=W,H --screenshot out.png URL`). The builder looks at them.
- A real click on sacks, filters, the lightbox and the player can't be done headless: say so.
