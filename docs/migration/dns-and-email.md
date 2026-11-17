# Moving elmgrove.games: DNS and email walkthrough

For Cosmo, step by step, in the Namecheap and GitHub web pages. Do the steps in order.
**Do not cancel the hosting.** It stays as a fallback until the "Done" checklist at the bottom is all ticked.

> This repo is public. Never write personal email addresses, passwords or backup files into it.
> Forward destinations are typed into Namecheap only.

## Where things stand (checked 17 Nov 2026)

| What | Now | After the move |
|---|---|---|
| Nameservers | `dns1/dns2.namecheaphosting.com` (the cPanel hosting runs DNS) | `dns1/dns2.registrar-servers.com` (Namecheap BasicDNS) |
| Website | cPanel server `66.29.153.104`; its certificate is `*.web-hosting.com`, so browsers warn | GitHub Pages, free Let's Encrypt certificate |
| Mail | Mailboxes on the hosting (`mail.elmgrove.games`, MX 0); the site shows `contact@elmgrove.games` | Namecheap free Email Forwarding: aliases go to each person's own inbox |
| Other records | SPF for the hosting, a DKIM key, `mail`/`webmail`/`cpanel`/`ftp` subdomains | Not needed. They pointed at the hosting |

**Why BasicDNS:** today the DNS lives *inside* the hosting account, so cancelling the hosting would take the
domain's DNS and mail down with it. With BasicDNS the records live with the domain itself. Namecheap's free email
forwarding also works only with BasicDNS (or PremiumDNS).

---

## Step 0: back up the hosting (Cosmo; about 15 min)
Claude saved every public page and file into `archive/original-2024/` (13 files). What Claude cannot reach:

1. cPanel → **Files → Backup → Download a Full Account Backup** (Backup Destination: Home Directory) and
   download the `.tar.gz` when the email arrives. Also download **Home Directory**, **Email Forwarders** and
   **Email Filters** from the same page.
2. cPanel → **Email Accounts**: write down every mailbox (e.g. `contact@`). Open each in **Webmail** and
   save anything worth keeping. The easy way is to add the mailbox to Thunderbird over IMAP and drag the
   folders to Local Folders.
3. cPanel → **Domains → Zone Editor → Manage**: screenshot the records. If any are not in the table above
   (a Google or itch verification TXT, an extra subdomain), tell Claude so they get recreated.
4. cPanel → **File Manager → public_html**: check for folders or files that the site never linked to.
   Tell Claude what's there.

Keep these backups **off the repo**, e.g. in `~/Archive/elmgrove-cpanel-2026-11/` on the PC.

## Step 1: GitHub side (Claude did this; Cosmo does part c)
a. Repo `b4k4kozmo/elmgrove-site`, Pages built by GitHub Actions from `site/`.
b. Custom domain `elmgrove.games` set; `site/CNAME` holds it.
c. **Verify the domain** (stops anyone else's GitHub from claiming it): GitHub → your profile picture →
   **Settings → Pages → Add a domain** → `elmgrove.games`. GitHub shows a TXT record with a host like
   `_github-pages-challenge-b4k4kozmo` and a random value. Keep that tab open for Step 3.

## Step 2: switch the nameservers (Namecheap, 2 min)
Namecheap → **Domain List** → elmgrove.games → **Manage** → **Nameservers** → change *Namecheap Web Hosting DNS*
to **Namecheap BasicDNS** → tick ✓.
From here on, do Steps 3 and 4 straight away, so mail is not left without a route for long.

## Step 3: website records (Namecheap → Advanced DNS → Host Records)
Delete Namecheap's parking defaults (a `CNAME www → parkingpage.namecheap.com` and/or a `URL Redirect @`). Then add:

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | Automatic |
| A | `@` | `185.199.109.153` | Automatic |
| A | `@` | `185.199.110.153` | Automatic |
| A | `@` | `185.199.111.153` | Automatic |
| AAAA | `@` | `2606:50c0:8000::153` | Automatic |
| AAAA | `@` | `2606:50c0:8001::153` | Automatic |
| AAAA | `@` | `2606:50c0:8002::153` | Automatic |
| AAAA | `@` | `2606:50c0:8003::153` | Automatic |
| CNAME | `www` | `b4k4kozmo.github.io.` | Automatic |
| TXT | `_github-pages-challenge-b4k4kozmo` | *(the value from Step 1c)* | Automatic |

Then go back to the GitHub tab from Step 1c and press **Verify** (it may need a few minutes).

## Step 4: email forwarding (same Advanced DNS page)
1. Scroll to **Mail Settings** → choose **Email Forwarding** → save. Namecheap adds the MX records
   (`eforward1`–`eforward5.registrar-servers.com`) and an SPF TXT by itself. Don't add them by hand.
2. **Domain** tab → **Redirect Email** → **Add forwarder**, one row per alias:

| Alias | Forwards to |
|---|---|
| `cosmo@` | Cosmo's own inbox |
| `kyle@` | Kyle's own inbox |
| `krasiv@` | Krasiv's own inbox |
| `robert@` | Robert's own inbox |
| `team@` | everyone: add the same alias once per person (one row each) |
| `contact@` | **recommended:** the old site printed this address, so forward it like `team@` |

Leave the catch-all (`*`) off; it mostly collects spam.

**What forwarding can't do:** it only *receives*. Replying *from* `cosmo@elmgrove.games` needs a sending
service (Zoho Mail free plan, Namecheap Private Email, or Gmail "Send mail as" with an SMTP relay). This is a
later, optional step. See the proposal, phase 1.

## Step 5: wait, then check (Claude can do the checks)
Nameserver changes usually land within an hour but can take up to 48 h. Claude runs:

```
dig +short NS elmgrove.games      # expect dns1/dns2.registrar-servers.com
dig +short A elmgrove.games       # expect the four 185.199.x.153
dig +short MX elmgrove.games      # expect eforward1..5.registrar-servers.com
curl -sI https://elmgrove.games   # expect 200 and a valid certificate
```

Once GitHub has issued the certificate (Repo → Settings → Pages shows it), tick **Enforce HTTPS**.
Claude can do this with `gh api -X PUT repos/b4k4kozmo/elmgrove-site/pages -F https_enforced=true`.

## Step 6: test mail
From an address *outside* the domain, send one email to each alias. Check that each one arrives, and look in spam too.

## Done checklist (only then think about the hosting)
- [ ] Step 0 backups downloaded and opened once to check they're readable
- [ ] Site loads at https://elmgrove.games and https://www.elmgrove.games without a warning
- [ ] Every alias tested
- [ ] One quiet week passes
- [ ] Then: in Namecheap, turn **auto-renew OFF for the hosting plan only**. Keep the **domain's** auto-renew
      ON, and check its expiry date on the Domain List page. Cancel the hosting only when Cosmo says so.

## If something goes wrong
Going back takes one change: Namecheap → Nameservers → **Namecheap Web Hosting DNS**. The hosting is untouched, so
the old site and mailboxes come straight back.
