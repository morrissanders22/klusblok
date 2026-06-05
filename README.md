# Klusblok — V1

Eerlijke marktplaats voor klussen. Particulieren plaatsen gratis, aannemers
betalen **alleen per geclaimde lead** (€ 6 / € 10 / € 20 / € 40, afhankelijk
van complexiteit). Geen abonnementen, geen "mollen".

Pay-per-lead model met 2-uur claim-venster.

## Stack

- **Next.js 15** App Router · React 19 · TypeScript · Tailwind v4
- **Prisma** + **PostgreSQL**
- **Auth.js v5** met credentials provider + bcrypt
- **Mollie** voor betalingen (dev-mode: auto-succeed zonder API key)
- Lokale image uploads onder `public/uploads/` (V2: Cloudflare Images)

## Kernflow

1. **Particulier** maakt account, plaatst gratis een klus:
   - titel, beschrijving, tot 4 foto's, services, complexiteit
   - adres + telefoon (verborgen voor publiek)
2. Systeem berekent automatisch de **tier** voor de aannemer:
   - 1 dienst, klein → **€ 6**
   - 1 dienst, standaard → **€ 10**
   - 1 dienst, groot → **€ 20**
   - 3+ diensten → **project € 40**
3. **Aannemer** ziet open klussen (omschrijving + stad + prijs, géén contact).
4. Aannemer **claimt** een klus → wordt naar Mollie gestuurd → na succesvolle
   betaling krijgt hij/zij contactgegevens + adres.
5. **2-uur venster** start. Lukt het niet binnen die tijd? Lead komt
   automatisch weer beschikbaar.
6. Beide partijen bevestigen dat de klus is aangenomen → status `COMPLETED`,
   particulier kan een **review** achterlaten.

## Rollen

| Rol | Kan |
|---|---|
| `CONSUMER` | Klussen plaatsen, claims bevestigen, reviews schrijven |
| `CONTRACTOR` | Klussen claimen + betalen, contactgegevens zien, klussen bevestigen |
| `ADMIN` | Toegang tot `/admin` met omzet, aanmeldingen, recente claims |

Aannemers moeten KVK-nummer invullen en rechtsbijstandsverzekering
bevestigen bij registratie.

## Datamodel

```
User (role: CONSUMER | CONTRACTOR | ADMIN)
 ├─< Job (consumerId)
 │    ├─< JobPhoto
 │    ├─< JobService
 │    └─< JobClaim
 │         └── Payment
 ├─< JobClaim (contractorId)
 └─< Review (authorId/subjectId)
```

Zie [prisma/schema.prisma](prisma/schema.prisma).

## Pagina's

| Route | Wat |
|---|---|
| `/` | Landing met hero, klussen, FAQ |
| `/jobs` | Overzicht open klussen |
| `/jobs/[id]` | Klusdetail (rol-bewust) |
| `/jobs/new` | Klus plaatsen (particulier) |
| `/claims/[id]` | Actieve claim met contactgegevens + bevestigingsflow |
| `/payments/[id]/dev-confirm` | Mock betaling (alleen zonder Mollie key) |
| `/payments/[id]/return` | Mollie return-URL |
| `/api/webhooks/mollie` | Mollie webhook |
| `/api/upload` | Foto-upload (lokaal) |
| `/reviews/new?claim=...` | Review schrijven |
| `/dashboard` | Eigen klussen / claims |
| `/admin` | Admin-only dashboard |
| `/login` · `/register` · `/register/consumer` · `/register/contractor` | Auth |
| `/hoe-werkt-het` · `/contact` · `/voorwaarden` | Info-pagina's |

## Snel starten

### 1. Postgres opzetten — kies één

**Docker** (aanbevolen):
```bash
docker compose up -d
```
**Lokale Postgres** via Homebrew:
```bash
brew install postgresql@16 && brew services start postgresql@16
createuser -s klusblok && createdb -O klusblok klusblok
psql -d klusblok -c "ALTER USER klusblok WITH PASSWORD 'klusblok';"
```
**Hosted** — maak een gratis Postgres op [neon.tech](https://neon.tech)
en zet de connection string in `.env`.

### 2. Schema toepassen + dev server

```bash
npm install
npm run db:push
npm run dev
```

App draait op http://localhost:3002.

### 3. Admin user aanmaken

Promoteer een bestaande user tot admin:
```bash
npx prisma studio
# zet user.role op ADMIN
```

## Integraties

### Mollie

Zonder `MOLLIE_API_KEY` in `.env` draait Klusblok in **dev-mode**:
betalingen worden via `/payments/[id]/dev-confirm` afgerond met één klik —
handig voor demo's. Zet je API key:

```env
MOLLIE_API_KEY="test_xxxxxxxxxxxxxxxxxx"
APP_URL="https://staging.klusblok.nl"   # voor redirect/webhook URLs
```

Belgisch IBAN wordt geaccepteerd door Mollie — log in op je Mollie
dashboard en koppel de gewenste IBAN.

### Cloudflare Images (V2)

V1 slaat foto's lokaal op in `public/uploads/`. Voor productie schaling
migreren naar Cloudflare Images. De upload-endpoint
[`/api/upload`](src/app/api/upload/route.ts) is de plek om te switchen.

### E-mailmeldingen

Stub in [`src/lib/notifications.ts`](src/lib/notifications.ts) logt naar
console. Productie: plug Resend / Postmark / SES erin (zakelijke mail van
Klusblok).

### Google Reviews

Voor V1 hebben we interne reviews (in-app). Google Reviews integratie via
de Places API komt in een latere iteratie.

## Volgende stappen (uit meeting)

- [x] V1 backend met pay-per-lead flow + admin dashboard
- [ ] Demo aan Ricardo (deze build)
- [ ] T&C's (Ricardo levert aan, Morris reviewt)
- [ ] Mollie productie-key + Belgisch IBAN koppelen
- [ ] Cloudflare Images voor productie uploads
- [ ] Zakelijk mailadres koppelen voor notificaties
- [ ] Google Ads campagne (€ 1.500/mnd startbudget, na live)
- [ ] Rond logo van Ricardo plaatsen (placeholder "KB" in
  [Logo.tsx](src/components/Logo.tsx))

## Scripts

| Script | Wat |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Productiebuild |
| `npm start` | Productie server |
| `npm run db:push` | Schema sync |
| `npm run db:migrate` | Nieuwe migration |
| `npm run db:studio` | Prisma Studio GUI |
