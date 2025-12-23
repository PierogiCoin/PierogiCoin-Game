# 🔒 Plan Naprawy Bezpieczeństwa PRGCOIN

## Data: 2025-11-25
## Status: 12 krytycznych luk bezpieczeństwa

---

## 🚨 CRITICAL (1)

### 1. Next.js - Wiele krytycznych luk
- **Wersja:** 14.2.5 → **AKTUALIZUJ DO:** 14.2.33
- **CVE:** 
  - Cache Poisoning (GHSA-gp8f-8m3g-qvj9)
  - DoS w Image Optimization (GHSA-g77x-44xx-532m)
  - Server Actions DoS (GHSA-7m27-7ghc-44w9)
  - Authorization Bypass (GHSA-7gfc-8cq8-jh5f)
- **Fix:** `npm install next@14.2.33`

---

## ⚠️ HIGH (11)

### 2. Axios - DoS Attack
- **Wersja:** Nieznana (sprawdź `npm ls axios`)
- **CVE:** GHSA-4hjh-wcwx-xvwj (CVSS 7.5)
- **Problem:** Brak walidacji rozmiaru danych
- **Fix:** `npm update axios@latest`

### 3. bigint-buffer - Buffer Overflow
- **Wersja:** ≤1.1.5
- **CVE:** GHSA-3gc7-fjrx-p6mg (CVSS 7.5)
- **Problem:** Przepełnienie bufora w toBigIntLE()
- **Fix:** Aktualizacja przez @solana/spl-token

### 4. @solana/spl-token - Luki w zależnościach
- **Problem:** Zależność od vulnerable bigint-buffer
- **Wpływ:** 
  - @irys/upload-solana
  - @irys/web-upload-solana
  - @metaplex-foundation/mpl-token-metadata
  - helius-sdk
- **Fix:** Czekaj na oficjalną aktualizację lub użyj workaround

### 5. glob - Command Injection
- **Wersja:** 10.2.0 - 10.4.5
- **CVE:** GHSA-5j98-mcp5-4vw2
- **Problem:** Injection przez -c/--cmd
- **Fix:** `npm update glob@latest` (może wymagać force)

---

## 📋 PLAN DZIAŁANIA

### Faza 1: Bezpieczne aktualizacje (✅ Wykonaj teraz)
```bash
# 1. Backup
npm pack
cp package-lock.json package-lock.json.backup

# 2. Aktualizuj Next.js
npm install next@14.2.33

# 3. Aktualizuj axios
npm install axios@latest

# 4. Aktualizuj inne bezpieczne pakiety
npm update @supabase/supabase-js @tailwindcss/typography
```

### Faza 2: Problematyczne zależności
```bash
# Solana/Metaplex - POCZEKAJ na oficjalne wersje
# Lub użyj npm overrides w package.json:
```

### Faza 3: Usuń deprecated
```bash
npm uninstall @solana/wallet-adapter-backpack
```

### Faza 4: Weryfikacja
```bash
npm audit
npm run build
npm run lint
```

---

## 🛠️ NPM OVERRIDES (Tymczasowe rozwiązanie)

Dodaj do `package.json`:
```json
{
  "overrides": {
    "bigint-buffer": "^2.0.0",
    "axios": "^1.12.0",
    "glob": "^11.0.0"
  }
}
```

---

## ⚡ SZYBKA NAPRAWA (Wykonaj po kolei)

1. **Aktualizuj Next.js (CRITICAL):**
   ```bash
   npm install next@14.2.33
   ```

2. **Aktualizuj axios:**
   ```bash
   npm install axios@1.7.9
   ```

3. **Sprawdź:**
   ```bash
   npm audit
   ```

4. **Test:**
   ```bash
   npm run build
   ```

---

## 📊 PRZED vs PO

| Pakiet | Przed | Po | Status |
|--------|-------|-----|--------|
| next | 14.2.5 | 14.2.33 | ⏳ |
| axios | ? | 1.7.9 | ⏳ |
| glob | 10.x | 11.x | ⏳ |
| bigint-buffer | ≤1.1.5 | 2.0.0 | ⚠️ Czeka |

---

## 🚫 NIE RÓB (Breaking changes)

- ❌ `npm audit fix --force` - może zepsuć projekt
- ❌ Aktualizacja React 18.2 → 19 - duże zmiany
- ❌ Masowa aktualizacja Solana pakietów - niestabilne

---

## ✅ TODO

- [ ] Backup projektu
- [ ] Aktualizuj Next.js
- [ ] Aktualizuj axios
- [ ] Test build
- [ ] Test production
- [ ] Deploy na staging
- [ ] Monitor błędów
- [ ] Deploy na production

---

## 📞 W RAZIE PROBLEMÓW

1. Przywróć backup: `npm ci`
2. Sprawdź logi: `npm run build 2>&1 | tee build.log`
3. Rollback: `git checkout package-lock.json && npm ci`
