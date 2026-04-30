# Sovareq handoff

Datum: 2026-04-30

## Doel

De website mock-up voor `sovareq.com` en de Infomaniak e-mailsetup verder
afwerken.

## Domein en provider

- Domein: `sovareq.com`
- Provider: Infomaniak
- Provider slogan op aankoopbewijs: The Ethical Cloud
- Aangekocht volgens screenshot/conversatie:
  - Domain registration
  - DNS Fast Anycast
  - Domain Privacy
  - Renewal Warranty
  - Email Service / E-mail Bundle
  - 5 e-mailadressen inbegrepen

## Website

Bestanden:

- `index.html`
- `styles.css`

De site is een statische mock-up voor Sovareq / The Ethical Cloud met:

- hero-sectie
- diensten: domeinbeheer, DNS Fast Anycast, domain privacy
- e-mailsectie
- contactblok

De site kan lokaal geopend worden via:

```text
file:///Users/brainzzlab/Documents/New%20project/index.html
```

Uploadpakket:

- `sovareq-site.zip`

## E-mailadressen

Te maken of te controleren bij Infomaniak:

- `support@sovareq.com`
- `info@sovareq.com`
- `bjorn@sovareq.com`

Doorstuurregel gevraagd:

- `bjorn@sovareq.com` -> `brainzzlab@gmail.com`

Let op: oorspronkelijk stond `suport@sovareq.com`, daarna is dit gecorrigeerd
naar `support@sovareq.com`.

## Infomaniak API-data

Gedownload uit de Infomaniak Developer Portal:

- `infomaniak-openapi.json`
  - volledige OpenAPI spec
  - OpenAPI versie: `3.1.0`
  - titel: `API Reference - Developer tools`
  - 1164 paths
- `infomaniak-mail-openapi.json`
  - extract met alleen relevante product/mail endpoints

Relevante endpoints:

- `GET /1/products`
- `GET /1/mail_hostings/{mail_hosting_id}/mailboxes`
- `POST /1/mail_hostings/{mail_hosting_id}/mailboxes`
- `GET /1/mail_hostings/{mail_hosting_id}/mailboxes/{mailbox_name}/forwarding_addresses`
- `POST /1/mail_hostings/{mail_hosting_id}/mailboxes/{mailbox_name}/forwarding_addresses`

Voor forwarding gebruikt Infomaniak:

```json
{
  "redirect_address": "brainzzlab@gmail.com"
}
```

## Scripts

Mailboxen aanmaken:

```sh
INFOMANIAK_API_TOKEN=... node scripts/infomaniak-create-mailboxes.mjs
INFOMANIAK_API_TOKEN=... node scripts/infomaniak-create-mailboxes.mjs --apply
```

Als de mail hosting niet automatisch gevonden wordt:

```sh
INFOMANIAK_API_TOKEN=... INFOMANIAK_MAIL_HOSTING_ID=12345 node scripts/infomaniak-create-mailboxes.mjs --apply
```

Doorsturen van Bjorn instellen:

```sh
INFOMANIAK_API_TOKEN=... node scripts/infomaniak-forward-bjorn.mjs
INFOMANIAK_API_TOKEN=... node scripts/infomaniak-forward-bjorn.mjs --apply
```

Als de mail hosting niet automatisch gevonden wordt:

```sh
INFOMANIAK_API_TOKEN=... INFOMANIAK_MAIL_HOSTING_ID=12345 node scripts/infomaniak-forward-bjorn.mjs --apply
```

## Status

Klaar:

- website mock-up gemaakt
- e-mailadressen in website gezet
- `support` correct gespeld
- CSV met e-mailnamen gemaakt: `sovareq-email-addresses.csv`
- Infomaniak API spec gedownload
- mail-only API extract gemaakt
- script voor mailboxen gemaakt
- script voor `bjorn` forwarding gemaakt
- uploadpakket `sovareq-site.zip` gemaakt

Nog nodig:

- geldige Infomaniak API-token met mail-scope
- mogelijk `INFOMANIAK_MAIL_HOSTING_ID` als autodetectie via `/1/products`
  niet genoeg metadata geeft
- echte mailboxen aanmaken met `--apply`
- forwarding voor `bjorn@sovareq.com` aanmaken met `--apply`
- controleren dat DNS/MX/SPF/DKIM/DMARC goed staan
- website uploaden naar hosting of domein naar gekozen hosting wijzen

## Belangrijke veiligheidsnotitie

Een `INFOMANIAK_API_TOKEN` is gevoelige permanente toegang tot het Infomaniak
account. Bewaar die niet in dit pakket en commit die niet in Git. Gebruik de
token alleen als environment variable wanneer de scripts uitgevoerd worden.
