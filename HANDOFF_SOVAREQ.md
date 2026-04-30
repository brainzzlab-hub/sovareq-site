# Sovareq handoff

Laatst bijgewerkt: 2026-04-29 (Claude Code, auto mode)

## Status in één oogopslag

- **Site**: live geduwd naar GitHub Pages → https://github.com/brainzzlab-hub/sovareq-site
- **Custom domain**: `sovareq.com` geregistreerd op de Pages-config (CNAME bestand in repo)
- **Logo**: `assets/sovareq-logo.svg` (recreatie van het ronde Sovareq-logo)
- **DNS bij Infomaniak**: nog NIET aangepast — moet jij doen, zie `DEPLOY.md`
- **E-mail bij Infomaniak**: nog NIET aangemaakt — moet via API-token of Manager
- **DNS Fast Anycast**: blijft bij Infomaniak, geen nameserver-switch

## Domein en provider

- Domein: `sovareq.com`
- Provider: Infomaniak ("The Ethical Cloud")
- Pakket: Domain registration, DNS Fast Anycast, Domain Privacy, Renewal Warranty, Email Service / E-mail Bundle, 5 mailboxen inbegrepen.

## Website

GitHub repo: `brainzzlab-hub/sovareq-site` (publiek)
Lokale werkmap: `/Users/sovareq/Sovareq/website linked in /`

Bestanden:

- `index.html`
- `styles.css`
- `assets/sovareq-logo.svg` (favicon + header brand-mark + hero core)
- `CNAME` (= `sovareq.com`, voor GitHub Pages custom domain)

Eindhost: GitHub Pages, gratis, automatische HTTPS.
Tussen-URL voordat DNS klaar is: https://brainzzlab-hub.github.io/sovareq-site/

### Volgende stap voor de site

Voer de DNS-records uit `DEPLOY.md` in bij Infomaniak. De MX-records van
Infomaniak laat je staan, dus e-mail blijft werken.

## E-mail

Te maken of te controleren bij Infomaniak:

- `support@sovareq.com`
- `info@sovareq.com`
- `bjorn@sovareq.com`

Doorstuurregel:

- `bjorn@sovareq.com` → `brainzzlab@gmail.com`

### Drie paden om de mailboxen aan te maken

1. **Manager (UI)** — log in op manager.infomaniak.com → Mail Service →
   Mailboxen → "Toevoegen", of bulk-import via CSV
   (`sovareq-email-addresses.csv`).

2. **CLI met API-token** — maak een Infomaniak API-token met `mail`-scope
   in Manager → Account → API Tokens, en draai dan:

   ```sh
   INFOMANIAK_API_TOKEN=... node scripts/infomaniak-create-mailboxes.mjs            # dry-run
   INFOMANIAK_API_TOKEN=... node scripts/infomaniak-create-mailboxes.mjs --apply    # echt
   INFOMANIAK_API_TOKEN=... node scripts/infomaniak-forward-bjorn.mjs --apply       # bjorn → gmail
   ```

3. **Hybride** — UI voor de mailboxen, CLI alleen voor de forward.

## Infomaniak API-data

In de repo:

- `infomaniak-mail-openapi.json` — extract met alleen de relevante product/mail endpoints.

Relevante endpoints:

- `GET /1/products`
- `GET /1/mail_hostings/{mail_hosting_id}/mailboxes`
- `POST /1/mail_hostings/{mail_hosting_id}/mailboxes`
- `GET /1/mail_hostings/{mail_hosting_id}/mailboxes/{mailbox_name}/forwarding_addresses`
- `POST /1/mail_hostings/{mail_hosting_id}/mailboxes/{mailbox_name}/forwarding_addresses`

Forwarding body (Infomaniak):

```json
{ "redirect_address": "brainzzlab@gmail.com" }
```

## Veiligheid

- **Nooit** een echte `INFOMANIAK_API_TOKEN` committen of mailen. Alleen lokaal als env var bij scripts.
- Tokens met mail-scope geven blijvende toegang tot je mailconfiguratie. Roteer als die ergens uit de hand loopt.

## Resterende checklist

- [ ] DNS-records in Infomaniak invoeren (zie `DEPLOY.md`)
- [ ] Wachten op DNS-propagatie (5–30 min) en GitHub Pages HTTPS-verificatie
- [ ] In repo Settings → Pages → "Enforce HTTPS" aanvinken zodra `sovareq.com` als verified verschijnt
- [ ] Mailboxen aanmaken via Manager of CLI
- [ ] Forward `bjorn@sovareq.com` → `brainzzlab@gmail.com` instellen
- [ ] Test inkomende mail per adres + verstuur test naar Gmail
- [ ] Optioneel: SPF/DKIM/DMARC bevestigen via mxtoolbox.com
