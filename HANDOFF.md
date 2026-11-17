# Handoff: elmgrove-site

**Last updated:** 2026-11-17 evening, session 1 continuing (Opus 5.5 managing).

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

## In progress: the test mock-up (phase 2.5, added 17 Nov)
Cosmo asked for a clickable mock-up *before* the questionnaire: treehouse-bunker-inside-the-logo theme, arcade
cabinets, Loot n' Goblin mood, Elmgrove-itch games only, jukebox, loot-hunt mini-game. Spec: `docs/specs/mockup.md`.
Order: (1) Haiku inventory of the 8 itch games -> `mockup/data/games.json` + `mockup/assets/games/` and a music search;
(2) Sonnet builds `mockup/` from the spec; (3) manager reviews (screenshots via headless Firefox) and publishes it as a
private artifact; (4) themed proposal page with the full questionnaire, published as an artifact.
Uncommitted files under `mockup/` are a worker's unreviewed output: review before committing.

## Waiting on Cosmo
1. Phone steps page: https://claude.ai/artifact/C1hhSoMyfnbfSnyYgnhibF (mail is NOT kept; no cPanel backup needed).
2. GitHub domain verification (step 1c), nameservers to BasicDNS, host records, email forwarding (steps 2-4).
3. Forward-to addresses for each alias: he types them into Namecheap himself, never into this repo.
4. Answers to the open questions in `PROGRESS.md`.
5. More context for the full questionnaire (phase 3).

## Next session, first thing
Run the checks in walkthrough step 5. If NS is `registrar-servers.com` and A records are 185.199.x:
enforce HTTPS (`gh api -X PUT repos/b4k4kozmo/elmgrove-site/pages -F https_enforced=true`, retry if the
certificate isn't issued yet), then ask Cosmo to test each alias. Then phase 2 (Haiku content inventory).

## Verified / not verified
- Verified: the capture is byte-checked (`SHA256SUMS`); the old live site had only `index`, `games`, `contact`
  plus linked assets (probed common names, all 404).
- Not verified: files in cPanel `public_html` that nothing links to; mailbox contents; the domain's expiry date.
