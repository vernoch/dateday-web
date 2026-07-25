# DateDay online — jen pro vás dva

Cíl: společná appka na internetu. Odkaz znáte jen vy. Nikdo jiný ho nedostane.

**Soukromí = 3 vrstvy**
1. Privátní GitHub repo (kód nevidí veřejnost)
2. Tajná Vercel URL (nesdílíš nikomu kromě ní)
3. Kód páru v Nastavení (bez něj data neuvidí)

---

## Krok 1 — Firebase (nutné pro společná data)

Bez toho by každý měl jen svoje data v prohlížeči.

1. Otevři https://console.firebase.google.com → **Create project** → `DateDay`
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**
3. **Build → Firestore Database → Create database → Start in test mode** (region Europe)
4. Záložka **Rules** → vlož obsah ze souboru `firestore.rules` → Publish
5. **Build → Storage → Get started** → Rules ze souboru `storage.rules` → Publish
6. ⚙️ Project settings → **Your apps** → Web (`</>`) → nickname `dateday-web`
7. Zkopíruj hodnoty do souboru `.env` (z `.env.example`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Krok 2 — Privátní GitHub repo

1. https://github.com/new
2. Název např. `dateday-web`
3. **Private** (důležité)
4. **Nevytvářej** README (už ho máme)
5. Na Macu v Terminálu:

```bash
cd /Users/jakubvernoch/DateDay/dateday-web
git remote add origin https://github.com/TVE_GITHUB_JMENO/dateday-web.git
git push -u origin main
```

(GitHub tě vyzve k přihlášení.)

---

## Krok 3 — Vercel (veřejná URL appky)

1. https://vercel.com → Sign up přes **GitHub**
2. **Add New Project** → vyber `dateday-web`
3. **Environment Variables** — přidej všechny `VITE_FIREBASE_*` z `.env`
4. Deploy
5. Dostaneš odkaz typu `https://dateday-web-xxx.vercel.app`

Ten odkaz pošli **jen jí** (iMessage / WhatsApp). Nikam veřejně.

---

## Krok 4 — Propojení vás dvou

1. Ty otevřeš odkaz → **Nastavení → Vytvořit pár** → zkopíruj kód
2. Ona otevře stejný odkaz → **Nastavení → zadá kód → Připojit se**
3. Hotovo — oba zapisujete do stejných dat

Na iPhonu: Safari → Sdílet → **Na plochu**.

---

## Poznámka

Odkaz není „neprolomitelný“ jako banka — kdo dostane URL **a** kód páru, vidí data. Proto odkaz a kód posílej jen sobě navzájem.
