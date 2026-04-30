# Sovareq e-mailadressen

Gevraagde adressen:

- `support@sovareq.com`
- `info@sovareq.com`
- `bjorn@sovareq.com`

Deze mock-up toont de adressen op de website met `mailto:` links. De echte
mailboxen moeten aangemaakt worden in het controlepaneel van de provider waar
het e-mailpakket voor `sovareq.com` actief is.

## Checklist bij de provider

1. Open het e-mailbeheer voor `sovareq.com`.
2. Maak de drie mailboxen of aliassen aan.
3. Controleer dat de MX-records naar de mailprovider wijzen.
4. Voeg SPF, DKIM en DMARC toe voor betere afleverbaarheid.
5. Test inkomende en uitgaande mail per adres.

## CLI-helper

Er staat een lokale helper klaar in `scripts/infomaniak-create-mailboxes.mjs`.
Die gebruikt de officiële Infomaniak API:

- `GET /1/products` om de mail hosting te vinden
- `GET /1/mail_hostings/{mail_hosting_id}/mailboxes` om bestaande mailboxen te controleren
- `POST /1/mail_hostings/{mail_hosting_id}/mailboxes` om ontbrekende mailboxen aan te maken

Dry-run:

```sh
INFOMANIAK_API_TOKEN=... node scripts/infomaniak-create-mailboxes.mjs
```

Echt uitvoeren:

```sh
INFOMANIAK_API_TOKEN=... node scripts/infomaniak-create-mailboxes.mjs --apply
```

Als de mail hosting niet automatisch gevonden wordt:

```sh
INFOMANIAK_API_TOKEN=... INFOMANIAK_MAIL_HOSTING_ID=12345 node scripts/infomaniak-create-mailboxes.mjs --apply
```

## Bjorn doorsturen

Voor `bjorn@sovareq.com` naar `brainzzlab@gmail.com` staat deze helper klaar:

```sh
INFOMANIAK_API_TOKEN=... node scripts/infomaniak-forward-bjorn.mjs
```

Echt uitvoeren:

```sh
INFOMANIAK_API_TOKEN=... node scripts/infomaniak-forward-bjorn.mjs --apply
```

Als de mail hosting niet automatisch gevonden wordt:

```sh
INFOMANIAK_API_TOKEN=... INFOMANIAK_MAIL_HOSTING_ID=12345 node scripts/infomaniak-forward-bjorn.mjs --apply
```
