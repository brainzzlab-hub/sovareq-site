# Sovareq deployment

Statische site → **GitHub Pages**, gratis, met custom domain `sovareq.com`.
Geen nameserver-switch — Infomaniak DNS blijft, e-mail blijft werken.

## Wat is er gedaan

1. Repo geïnitialiseerd in deze map.
2. `CNAME` bestand met `sovareq.com` toegevoegd (Pages leest dit).
3. Site bestanden klaar: `index.html`, `styles.css`, `assets/sovareq-logo.svg`.
4. Repo aangemaakt op GitHub als `brainzzlab-hub/sovareq-site` (publiek).
5. Push naar `main` branch.
6. Pages ingeschakeld op `main` / root.

## Wat jij nog moet doen — DNS bij Infomaniak

In de Infomaniak Manager → Domeinen → `sovareq.com` → DNS-zone toevoegen:

### A-records voor de apex (sovareq.com)

| Type | Naam | Waarde            | TTL  |
|------|------|-------------------|------|
| A    | @    | 185.199.108.153   | 3600 |
| A    | @    | 185.199.109.153   | 3600 |
| A    | @    | 185.199.110.153   | 3600 |
| A    | @    | 185.199.111.153   | 3600 |

### CNAME voor www

| Type  | Naam | Waarde                   | TTL  |
|-------|------|--------------------------|------|
| CNAME | www  | brainzzlab-hub.github.io | 3600 |

### NIET aanraken

De volgende records moeten blijven staan, anders breekt e-mail:

- MX records (richt naar `mta-gw.infomaniak.ch`)
- SPF TXT record (`v=spf1 include:infomaniak.com ~all`)
- DKIM records (`*._domainkey.sovareq.com`)
- DMARC record (`_dmarc.sovareq.com`) als die er is

## Verificatie na DNS-propagatie (~5–30 min)

```sh
dig sovareq.com A +short          # moet 4 GitHub IPs tonen
dig www.sovareq.com CNAME +short  # moet brainzzlab-hub.github.io tonen
dig sovareq.com MX +short         # MOET ongewijzigd Infomaniak MX tonen
curl -I https://sovareq.com       # GitHub Pages header + HTTPS OK
```

Daarna in GitHub → Settings → Pages → "Enforce HTTPS" aanvinken.

## Rollback

Verwijder de A-records en CNAME `www` weer in Infomaniak.
De repo en GitHub Pages-config kunnen blijven staan, of de Pages site
kan in de repo Settings uitgeschakeld worden.
