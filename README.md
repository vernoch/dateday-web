# DateDay Web

Online verze DateDay pro vás dva — běží v Safari na iPhonu, **bez Xcode** a bez 7denní expirace.

## Rychlý start (lokálně)

```bash
cd /Users/jakubvernoch/DateDay/dateday-web
npm install
npm run dev
```

Otevři URL z terminálu (obvykle `http://localhost:5173`).

Bez Firebase appka běží **lokálně v prohlížeči** (data jen na tom zařízení).

## Sdílení na dálku (Firebase — zdarma)

1. Jdi na [Firebase Console](https://console.firebase.google.com) → vytvoř projekt **DateDay**.
2. Zapni:
   - **Authentication** → Sign-in method → **Anonymous**
   - **Firestore Database** → Create (test mode nejdřív, pak nahraj `firestore.rules`)
   - **Storage** → zapni a nahraj `storage.rules`
3. Project settings → Tvoje webová appka → zkopíruj config.
4. V této složce:

```bash
cp .env.example .env
```

5. Do `.env` doplň hodnoty `VITE_FIREBASE_*`.
6. Restartuj `npm run dev`.

### Propojení vás dvou

1. Ty: **Nastavení → Vytvořit pár** → zkopíruj kód.
2. Ona: otevře stejnou webovou URL → **Nastavení → zadá kód → Připojit se**.
3. Rande a nápady se syncují živě.

## Nasazení online (GitHub + Vercel)

1. Vytvoř GitHub repo a pushni složku `dateday-web`.
2. Na [vercel.com](https://vercel.com) → Import projektu → Framework: Vite.
3. Do Environment Variables vlož stejné `VITE_FIREBASE_*` jako v `.env`.
4. Deploy → dostaneš URL typu `https://dateday-xxx.vercel.app`.
5. Oba otevřete URL v Safari.

### Přidat na plochu iPhonu

Safari → **Sdílet** (čtverec se šipkou) → **Na plochu** → ikona DateDay jako appka.

## Co umí

- Dnes (dashboard), Kalendář, Nápady, Nastavení
- Rande: název, datum, místo, poznámka, fotka
- Nápady: kategorie + Wishlist / Plánujeme / Splněno
- Kód páru pro společná data

## Poznámky

- iOS appka v Xcode zůstává odděleně — web ji nenahrazuje v kódu, jen v používání.
- Kód páru ber jako heslo — kdo ho zná, vidí vaše data.
