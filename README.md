# VM-tipset 2026

Casual VM-tips för kompisgäng/jobb med konto via Supabase Auth, adminresultat och leaderboard.

## Funktioner
- Konto/inloggning via e-post + lösenord
- Deltagare kan lämna tips
- Admin kan lägga in matchresultat
- Automatisk poängräkning
- Leaderboard
- Mobilvänligt Next.js UI

## Kör lokalt
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase
1. Skapa ett projekt på Supabase.
2. Kopiera URL och anon key till `.env.local`.
3. Kör SQL från `supabase/schema.sql` i Supabase SQL Editor.
4. Skapa konto i appen.
5. Sätt dig själv som admin:
```sql
update profiles set role = 'admin' where email = 'DIN_EMAIL';
```

## Deploy
Rekommenderat: Vercel + Supabase.
- Importera repo/projekt i Vercel.
- Lägg in env vars från `.env.example`.
- Deploya.

## Poängmodell
- Grupp: 5p exakt placering, 3p rätt lag i topp fyra men fel plats.
- Slutspel: 2p kvartsfinal, 5p semifinal, 10p finalist, 15p vinnare.
- Bonus: 5p per rätt bonusfråga.

## Obs
Matchschema/lag är seedat som exempel. Uppdatera `supabase/schema.sql` när FIFA:s slutliga grupper/spelschema är klart.
