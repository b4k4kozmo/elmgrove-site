# Handoff: elmgrove-site

**Last updated:** 2026-11-17 evening, end of session 1 (Opus 5.5 managing). Nothing running; repo clean and pushed.

## How this job is run
Cosmo's words: move elmgrove.games off Namecheap hosting to GitHub Pages, switch mail to forwarding aliases
(cosmo, kyle, krasiv, robert, team), **don't cancel the hosting yet**, then a total redesign, themed and fun,
with a real page per game. Opus manages with `manager-mode` + `handoff`, hands code/content to Sonnet and
surveys to Haiku, one worker at a time. Save progress often. Plan: `docs/proposal.md`. Checklist: `PROGRESS.md`.

## Built
- Old site captured in full (3 pages, 13 files incl. music, font, GIFs, video), all from public URLs:
  `archive/original-2024/` and identical in `site/`.
- Repo public on GitHub, Pages via Actions, custom domain `elmgrove.games` set.
- Docs: proposal (phases 0-7), DNS + email walkthrough, light questionnaire (12 questions).

## Links (all private Claude artifacts; Cosmo shares them from each page's Share menu)
- Phone steps for the DNS switch: https://claude.ai/artifact/C1hhSoMyfnbfSnyYgnhibF (source `docs/migration/switch-steps.html`)
- **Mock-up "The Treehouse"**: https://claude.ai/artifact/9zaFaibcLQcvm4G4Yzvzn4 (source `mockup/`, spec `docs/specs/mockup.md`)
- **Themed proposal + questionnaire**: https://claude.ai/artifact/NfrwjRmqtjet6yXm7XMtne (built by
  `python3 tools/build_proposal_page.py <mockup-url>` from `docs/proposal-page/template.html` + `docs/questionnaire.md`
  + `mockup/data/games.json`; edit those, rebuild, republish the same file path to keep the URL)
To republish from a new session, pass the URL as `url` to the Artifact tool (read it first). The mock-up needs every
file under `mockup/{css,js,data,assets}` in `files` (published path = path inside `mockup/`).

## The mock-up (phase 2.5, done 17 Nov)
Built by a Sonnet worker from the spec, reviewed by the manager (all of index.html, site.js, site.css, data read;
screenshots of every route at 1280 and 390 wide looked at; fixes: game descriptions rewritten in our voice, stray
itch status tags removed, Godot placeholder removed, Shoujo engine = Stencyl, price tag alignment).
Not tested (no real clicks/audio headless): emerald pickups, filters, lightbox, Copy button, jukebox audio, sound
toggle, Loot n' Goblin clip autoplay. Ask Cosmo to tap through on his phone.
Open content gaps shown as placeholders: Loot n' Goblin / Tunnels / Befriend engine `[engine?]`, Cosmo's and Robert's
roles, Spirit Manor description, soundtrack files for the jukebox (locked slots), crew portraits.

## Waiting on Cosmo
1. The DNS switch via the phone steps page (mail is NOT kept; no cPanel backup needed); lock down cPanel a week later.
2. GitHub domain verification (step 1c), nameservers to BasicDNS, host records, email forwarding (steps 2-4).
3. Forward-to addresses for each alias: he types them into Namecheap himself, never into this repo.
4. Answers to the open questions in `PROGRESS.md`.
5. More context, then the team answers the questionnaire on the proposal page (answers come back as pasted text).
6. Soundtrack files (Loot n' Goblin etc.) and engine/role facts to fill the placeholders.

## Next session, first thing
Run the checks in walkthrough step 5. If NS is `registrar-servers.com` and A records are 185.199.x:
enforce HTTPS (`gh api -X PUT repos/b4k4kozmo/elmgrove-site/pages -F https_enforced=true`, retry if the
certificate isn't issued yet), then ask Cosmo to test each alias. Then: fold Cosmo's extra context into `docs/questionnaire.md`, rebuild and republish the proposal page; after the
team answers, phase 4 design spec (`design-handoff` skill) from the answers + mock-up.

## Verified / not verified
- Verified: the capture is byte-checked (`SHA256SUMS`); the old live site had only `index`, `games`, `contact`
  plus linked assets (probed common names, all 404).
- Not verified: files in cPanel `public_html` that nothing links to; mailbox contents; the domain's expiry date.
