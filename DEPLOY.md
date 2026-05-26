# Deploy Klusblok naar Vercel

Stap-voor-stap checklist om Klusblok live te zetten.

## ✅ Pre-flight

- [x] App build is groen (`npm run build`)
- [x] Vercel Blob support in upload-route
- [x] `vercel.json` met regio `fra1` (Frankfurt — dichtstbij NL)
- [ ] Code is gepusht naar GitHub

## 1. Code naar GitHub

```bash
cd /Users/morrissanders/Documents/klusblok
git add -A
git commit -m "Klusblok V1 — ready to deploy"

# Maak repo via GitHub CLI (snelste)
gh repo create klusblok --private --source=. --remote=origin --push

# Of handmatig: maak repo op github.com en dan
git remote add origin https://github.com/<jouw-user>/klusblok.git
git branch -M main
git push -u origin main
```

## 2. Postgres database aanmaken

Kies één — alle drie werken plug-and-play met Prisma.

### Optie A: Neon (aanbevolen — gratis tier, snelst)

1. Ga naar [neon.tech](https://neon.tech) → maak account
2. **Create project** → naam `klusblok` → regio Frankfurt
3. Kopieer de **pooled** connection string (eindigt op `-pooler.eu-central-1.aws.neon.tech`)

### Optie B: Vercel Postgres (na project import)

1. Verwacht eerst stap 3 (project importeren in Vercel)
2. In Vercel project → **Storage** tab → **Create Database** → **Postgres**
3. `DATABASE_URL` wordt automatisch toegevoegd aan je env

### Optie C: Supabase

1. [supabase.com](https://supabase.com) → New project
2. **Database → Connection string → URI** kopiëren
3. Belangrijk: gebruik de **pooled** connection (port 6543) voor serverless

## 3. Vercel project importeren

1. Ga naar [vercel.com/new](https://vercel.com/new)
2. Klik **Import** bij je GitHub-repo `klusblok`
3. **Framework Preset**: Next.js (auto-detect)
4. **Root Directory**: `./` (laat staan)
5. **Build Command**: `npm run build` (staat al goed)
6. **Output Directory**: `.next` (default)
7. **Install Command**: `npm install` (default)

Klik **nog niet** op Deploy — eerst env vars instellen ↓

## 4. Environment variables instellen

Onder **Settings → Environment Variables** voeg toe:

| Key | Value | Environment |
|---|---|---|
| `DATABASE_URL` | (Neon/Supabase connection string) | Production, Preview, Development |
| `AUTH_SECRET` | run `openssl rand -base64 32` lokaal | All |
| `NEXTAUTH_URL` | `https://<jouw-project>.vercel.app` | Production |
| `APP_URL` | `https://<jouw-project>.vercel.app` | Production |
| `MOLLIE_API_KEY` | (leeg = dev-mode, of `test_xxx`/`live_xxx`) | Production |

`AUTH_SECRET` lokaal genereren:
```bash
openssl rand -base64 32
```

## 5. Vercel Blob koppelen (voor foto-uploads)

1. In je Vercel project → **Storage** tab → **Create Database** → **Blob**
2. Naam: `klusblok-uploads`
3. Klik **Create** — `BLOB_READ_WRITE_TOKEN` wordt automatisch geïnjecteerd
4. Connect naar je project (vinkje aan) en kies environments

Vanaf dat moment gaan alle foto-uploads naar Vercel Blob (publiek bereikbaar via een `https://...blob.vercel-storage.com/...` URL).

## 6. Deploy

Klik **Deploy** in Vercel — eerste build duurt ~2 min.

## 7. Database schema toepassen

De DB is na deploy nog leeg. Sync je Prisma schema:

```bash
# Lokaal, tegen de hosted DB
DATABASE_URL="<je hosted url>" npx prisma db push

# Of pull eerst je Vercel env vars dan push
npx vercel link
npx vercel env pull .env.production.local
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d'=' -f2- | tr -d '"') npx prisma db push
```

## 8. Eerste admin user

Browse naar `https://<jouw-project>.vercel.app/register/contractor` en maak een account aan. Je e-mailadres wordt automatisch geverifieerd in dev-mode (zie `/verify/check` voor de demo-link).

Promoot je user tot ADMIN:
```bash
DATABASE_URL="<je hosted url>" npx prisma studio
# In de User-tabel → zet je `role` op `ADMIN`
```

Of via SQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'jouw@email.nl';
```

## 9. Custom domain (optioneel)

1. Vercel project → **Settings → Domains**
2. Voeg `klusblok.nl` (of subdomain) toe
3. Update DNS records bij je registrar (Vercel toont de juiste waarden)
4. Update `NEXTAUTH_URL` en `APP_URL` in env vars naar het nieuwe domein
5. Redeploy

## 10. Productie checklist na go-live

- [ ] **Mollie**: live API key in env (test eerst met `test_` key)
- [ ] **Email sender**: koppel Resend/Postmark in [src/lib/notifications.ts](src/lib/notifications.ts) onder Ricardo's domein
- [ ] **Sentry / error tracking** (optioneel): `npx @sentry/wizard@latest -i nextjs`
- [ ] **Analytics**: voeg Plausible/PostHog toe
- [ ] **Vercel Speed Insights**: aan zetten via Vercel project
- [ ] **Eerste demo-klusser + demo-klus** voor sales-demo

## Troubleshooting

**"P1001: Can't reach database"**
→ Check dat je de **pooled** connection string gebruikt, niet de direct connection.

**"Type error: Property X does not exist on type"**
→ Lokaal `npm run build` draaien om snel te zien. Vergeet `npx prisma generate` niet na schema-wijzigingen.

**Foto-uploads geven 500**
→ Controleer `BLOB_READ_WRITE_TOKEN` env var, en dat de Blob store gekoppeld is aan het project.

**"Authentication failed" bij login**
→ `AUTH_SECRET` moet identiek zijn in alle environments waarin sessions worden gemaakt.

**Cold start traag (eerste request)**
→ Normaal voor serverless. Vercel Pro plan biedt Fluid Compute / pre-warming.
