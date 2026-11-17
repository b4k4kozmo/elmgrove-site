# Progress: elmgrove-site

Tick items as they land; add the date. Phases are explained in `docs/proposal.md`.

## Phase 0: capture and repo (17 Nov 2026)
- [x] Mirror every public page and asset (wget + JS-linked pages by hand), with SHA256SUMS
- [x] Repo `~/Projects/elmgrove-site`, public on GitHub, Pages by Actions from `site/`
- [x] Custom domain set in Pages
- [x] Proposal, DNS/email walkthrough, light questionnaire, CLAUDE.md, HANDOFF.md

## Phase 1: cut-over (waiting on Cosmo)
- [x] Step 0 dropped: Cosmo says nobody used the mail; site already archived (17 Nov)
- [x] Phone steps page published: https://claude.ai/artifact/C1hhSoMyfnbfSnyYgnhibF
- [ ] Step 1c: verify domain on GitHub (Cosmo)
- [ ] Steps 2-4: BasicDNS, host records, email forwarding + aliases (Cosmo)
- [ ] Step 5: DNS checks pass, HTTPS enforced (Claude)
- [ ] Step 6: every alias tested from an outside address (Cosmo)
- [ ] A quiet week, then the hosting's auto-renew off. Do not cancel until Cosmo says so

## Phase 2.5: test mock-up (17 Nov, in progress). Spec `docs/specs/mockup.md`
- [ ] Haiku: itch inventory (8 games) + music search
- [ ] Sonnet: build `mockup/`
- [ ] Manager: review, screenshots, publish as private artifact
- [ ] Themed proposal page + full questionnaire (20+ multiple choice), published as artifact

## Open questions for Cosmo
- Keep `contact@` as an alias too? The old site printed it. Recommended: yes, forwarding to the same people as `team@`.
- Does anyone need to *send* from @elmgrove.games (phase 1b), or is receiving enough?
- Should the repo live under the personal account `b4k4kozmo` or an Elmgrove GitHub organisation? It can be
  moved later; Pages and the domain survive a transfer, but the `www` CNAME target would change.
- Is Robert's game work anywhere on this PC? He isn't in the goblin docs.

## Phase 2+: not started
See `docs/proposal.md`. Theme sources are listed privately in `~/Notes/library/elmgrove/README.md`.
