# Proposal: the new elmgrove.games

Written 17 Nov 2026. Status: **phase 1 waiting on Cosmo's Namecheap steps**. Live checklist: `PROGRESS.md`.

## What the team asked for
- Get off Namecheap hosting onto something easier to update that doesn't expire (GitHub Pages), keep the
  domain, and replace hosted mailboxes with free forwarding aliases (cosmo, kyle, krasiv, robert, team).
- Then a **total redesign**: themed and fun to click around, with a proper page for each game rather than one
  paragraph and an itch link. Borrow the mood of the next game without announcing it.
- Run it as phases that an Opus session can pick up cold with the `manager-mode` + `handoff` skills, handing
  pieces to Sonnet/Haiku. Decide the look through a multiple-choice team questionnaire (20+ questions).

## What exists today (archived in `archive/original-2024/`)
- Three pages: home (title, "indie game devs out of Seattle, WA", the elm tree picture, menu), **Games**
  (nine games: Shoujo Showdown, Tomb of the Sun God, Taskforce Zeta, SheepCreep, Party Crashers TD, MetaPizza
  Delivery, Tunnels of Set, Befriend All Humans, Loot n' Goblin), **Contact** (`contact@elmgrove.games`).
- Charm worth keeping: Gold Box pixel font, the elm tree, the "Gobblin" tune, a portal sound on every click,
  pink→green palette (#c25cb1, #86ba86, #400968).
- Problems: links are `javascript:` delays (no middle-click, no back button, bad for search engines);
  music tries to autoplay; no mobile layout; no page descriptions or social preview images; small
  pictures; typos ("rougelike", "Shoujou"); the TLS certificate doesn't match the domain.

## Direction (to be confirmed by the questionnaire)
**"The Elmgrove orchard, and what lives under it."** The top of the site keeps the orchard: the elm tree,
pixel font, warm and friendly. Going into the games takes you **underground** into a torchlit goblin den.
That's where the next game's mood comes in: soot `#12100e`, worn stone `#3b3229`, parchment `#efe5d2`,
torchlight `#e3a443`, moss `#93b06c` (from the team's own settings-menu mock-up). It carries the look over
without showing anything unannounced.

Fun, but not a chore to use:
- Every link is a real link (keyboard, middle-click, back button all work); the portal sound plays on click
  but never delays navigation.
- Sound is **off until the visitor turns it on**, with a lantern/speaker toggle that is remembered.
- Each game has its own page: hero art or GIF, trailer, a "how it plays" blurb, jam and team credits, the
  engine, play/download buttons, screenshots, and a small "behind the scenes" note.
- Optional small touches, chosen in the questionnaire: a hover-wobble on game cards, a hidden goblin, a
  "loot" counter, a pixel-art map of the orchard as the games index.

## Technical choice (recommended)
Static site on GitHub Pages, built by GitHub Actions (already wired: `.github/workflows/pages.yml` deploys
`site/`). For the redesign, use **Eleventy (11ty)**: each game is one Markdown file with front matter
(title, year, jam, engine, links, credits), and one template makes every game page and the index. A new
game page means adding one file, so a Sonnet session or a teammate can do it without touching layout code.
No framework or tracking scripts, nothing to renew. Rejected options: Astro/React (more than this site
needs) and staying on cPanel (the thing that keeps expiring).

## Phases
Each phase ends with a commit, a push, and an updated `HANDOFF.md` and `PROGRESS.md`. Models follow the
`manager-mode` table: decisions and review by the manager (Opus or Fable), code and content by Sonnet,
surveys by Haiku.

| # | Phase | Who | Done when |
|---|---|---|---|
| 0 | Capture old site, make repo, Pages + domain set | manager | ✅ 17 Nov |
| 1 | **Cut-over**: Cosmo does `docs/migration/dns-and-email.md` steps 0–4; Claude checks DNS, enforces HTTPS, Cosmo tests mail | Cosmo + manager | Site on HTTPS, every alias tested, cPanel backup saved privately |
| 1b | *(optional)* Sending mail as `@elmgrove.games` (Zoho free / Private Email) | Cosmo + manager | Only if the team wants to reply from the domain |
| 2 | **Content inventory**: every Elmgrove game's itch page (cover, screenshots, description, jam, ratings, credits), YouTube links, repo notes | Haiku survey → manager checks | `docs/content/games-inventory.md` |
| 3 | **Full questionnaire** (20+ multiple choice) after Cosmo adds more context; team answers together | manager drafts, team answers | `docs/questionnaire.md` answered |
| 4 | **Design spec** + 2–3 homepage mock-ups for a team vote | strongest model available (`design-handoff` skill) | `docs/specs/redesign.md` approved |
| 5 | **Build**, one piece at a time from the spec: B1 Eleventy skeleton + theme tokens + layout; B2 game page template + all game files; B3 home/about/team; B4 contact + press page; B5 fun layer (sound toggle, hovers, easter egg); B6 accessibility, mobile, SEO, link check | Sonnet workers, one at a time, manager reviews each | Each piece previewed and reviewed |
| 6 | **Launch**: swap `site/` for the build output, keep `games.html`/`contact.html` working (redirect pages), Lighthouse + link check, announce to team | manager | Live, old URLs still work |
| 7 | **Later**: next game's page (hidden until the team says announce), devlog/news, press kit, mailing list | as needed | When a demo is near |

Note on phase 6: GitHub Pages can't do server redirects, so old URLs get small HTML pages with
`<meta http-equiv="refresh">` and a `rel=canonical`.

## Rules for every phase
- **Public repo.** No personal emails, passwords, cPanel backups, money talk or unannounced game details.
  Private notes go in `~/Notes/library/elmgrove/` on Cosmo's PC.
- Game repos are read-only from here; copy art in, never edit the game repos.
- Nothing is called done without a local preview check (`python3 -m http.server -d site 8000`, later
  `npx @11ty/eleventy --serve`). Say plainly what was not checked.
