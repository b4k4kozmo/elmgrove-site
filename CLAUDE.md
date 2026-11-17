# elmgrove-site

Website for Elmgrove Games, served at https://elmgrove.games by GitHub Pages (repo `b4k4kozmo/elmgrove-site`).
**Public repo**: no personal emails, passwords, cPanel backups, money or unannounced game details. Private
notes go in `~/Notes/library/elmgrove/`.

Start every session with `HANDOFF.md`, then `PROGRESS.md`. Use the `handoff` skill; for build phases add `manager-mode`;
for the redesign spec use `design-handoff` (spec goes in `docs/specs/`).

## Map
| Path | What |
|---|---|
| `site/` | What gets deployed. Now the 2024 site unchanged, plus `CNAME` and `.nojekyll` |
| `archive/original-2024/` | Byte-exact capture of the old site (`SHA256SUMS` inside). Never edit |
| `.github/workflows/pages.yml` | Deploys `site/` on push to `main` (paths `site/**`) |
| `docs/proposal.md` | Direction, tech choice, phases 0-7 |
| `docs/migration/dns-and-email.md` | Namecheap DNS + email forwarding walkthrough for Cosmo |
| `docs/questionnaire.md` | Team questionnaire draft v1 (32 questions); the proposal page renders it |
| `docs/proposal-page/` | Themed proposal artifact: `template.html` -> `index.html` via `tools/build_proposal_page.py` |
| `docs/migration/switch-steps.html` | Phone page of the DNS steps (artifact) |
| `mockup/` | Clickable test site (hash routes, vanilla JS; artifact). Data in `mockup/data/*.json`. Not deployed to Pages |
| `docs/specs/` | Design specs (phase 4 onwards) |

## Commands
```
python3 -m http.server -d site 8000            # preview at http://localhost:8000
python3 -m http.server -d mockup 8765          # mock-up preview
python3 tools/build_proposal_page.py <mockup-artifact-url>
gh run list -R b4k4kozmo/elmgrove-site -L 3     # deploy status
gh api repos/b4k4kozmo/elmgrove-site/pages      # Pages config, cname, https state
dig +short A elmgrove.games; dig +short MX elmgrove.games
```

## Screenshots
Firefox is a snap with a private /tmp: use a profile and output under `~/` (e.g. `~/elmgrove-shots/`), never /tmp:
`firefox --headless --profile ~/elmgrove-shots/prof --window-size=390,1400 --screenshot ~/elmgrove-shots/x.png URL`

## Done means
Previewed locally, deploy run green, live URL checked with curl. Say what wasn't checked (e.g. "sound untested").
