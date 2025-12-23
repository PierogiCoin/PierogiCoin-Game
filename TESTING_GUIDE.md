# 🧪 Instrukcje Testowania - Panel Gracza

## Przygotowanie Środowiska

### 1. Upewnij się, że masz skonfigurowane zmienne środowiskowe:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://rncpchtpnvwwcrtjzmcz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Zainstaluj zależności (jeśli jeszcze nie):

```bash
npm install @supabase/supabase-js dotenv
```

## Krok 1: Dodanie Danych Testowych

### Uruchom skrypt seedowania:

```bash
node scripts/seed-test-data.js
```

**Co zostanie utworzone:**
- 3 użytkowników testowych z różnymi poziomami i statystykami
- 5 zakupów z różnymi kwotami (Bronze, Silver, Diamond Investor)
- Relacje poleceń między użytkownikami
- Stany gry dla każdego użytkownika

**Użytkownicy testowi:**

| Username | Email | Level | Invested | Tier | Referrals |
|----------|-------|-------|----------|------|-----------|
| pierogifan | test1@pierogicoin.com | 15 | $750 | Silver | 2 |
| cryptohunter | test2@pierogicoin.com | 8 | $150 | Bronze | 0 |
| moonwalker | test3@pierogicoin.com | 22 | $3000 | Diamond | 0 |

## Krok 2: Testowanie Publicznego Panelu (GameDashboard)

### Test 1: Wyszukiwanie po username

1. Otwórz stronę: `http://localhost:3000/buy-tokens`
2. Przewiń do sekcji "Player Dashboard" (publiczny panel)
3. Wpisz w pole wyszukiwania: `pierogifan`
4. Kliknij "Search"

**Oczekiwany rezultat:**
- ✅ Wyświetlą się statystyki użytkownika
- ✅ Poziom: 15, PRG: 50,000, Gems: 250
- ✅ Sekcja inwestycji: $750 zainwestowane, Silver Investor
- ✅ Sekcja poleceń: 2 polecenia, zarobki z poleceń

### Test 2: Wyszukiwanie po email

1. Wyczyść pole wyszukiwania
2. Wpisz: `test3@pierogicoin.com`
3. Kliknij "Search"

**Oczekiwany rezultat:**
- ✅ Wyświetlą się statystyki użytkownika moonwalker
- ✅ Poziom: 22, Diamond Investor
- ✅ $3,000 zainwestowane

### Test 3: Nieistniejący użytkownik

1. Wpisz: `nonexistent@test.com`
2. Kliknij "Search"

**Oczekiwany rezultat:**
- ✅ Komunikat błędu: "User not found"

## Krok 3: Testowanie Panelu Zalogowanego (MyGameDashboard)

### Przygotowanie:

**Opcja A: Ręczne połączenie konta (szybsze)**

1. Otwórz Supabase Dashboard
2. Przejdź do Authentication → Users
3. Utwórz nowego użytkownika z emailem: `test1@pierogicoin.com`
4. Skopiuj UUID użytkownika
5. Przejdź do Table Editor → users
6. Znajdź użytkownika `test-user-1`
7. Ustaw pole `auth_user_id` na skopiowane UUID
8. Zapisz

**Opcja B: Przez grę (pełny flow)**

1. Otwórz grę w przeglądarce
2. Zaloguj się emailem: `test1@pierogicoin.com` (utwórz konto jeśli nie istnieje)
3. System automatycznie połączy konto

### Testowanie:

1. Otwórz stronę: `http://localhost:3000/buy-tokens`
2. Przewiń do sekcji "My Game Stats" (pierwszy panel)

**Jeśli NIE jesteś zalogowany:**
- ✅ Wyświetli się przycisk "Sign In with Google"
- ✅ Po kliknięciu przekierowanie do OAuth

**Jeśli JESTEŚ zalogowany:**
- ✅ Automatycznie załadują się Twoje statystyki
- ✅ Wyświetli się email zalogowanego użytkownika
- ✅ Wszystkie statystyki będą widoczne (gra + inwestycje + polecenia)

### Test 4: Logowanie przez Google

**Uwaga:** Wymaga konfiguracji Google OAuth w Supabase

1. Kliknij "Sign In with Google"
2. Zaloguj się kontem Google
3. Po powrocie sprawdź czy:
   - ✅ Panel automatycznie załadował dane
   - ✅ Wyświetla się email z Google
   - ✅ Jeśli to nowe konto, pokaże się komunikat "No game account found"

## Krok 4: Weryfikacja Obliczeń

### Test Tier Inwestora:

| Kwota | Oczekiwany Tier |
|-------|-----------------|
| $50 | Brak |
| $100-499 | Bronze Investor |
| $500-999 | Silver Investor |
| $1000-2499 | Gold Investor |
| $2500+ | Diamond Investor |

### Test Bonusów Polecających:

Użytkownik `pierogifan` powinien mieć:
- Polecenie 1: cryptohunter ($150) → 5% z 4,687,500 PRG = 234,375 PRG
- Polecenie 2: moonwalker ($2500) → 5% z 96,875,000 PRG = 4,843,750 PRG
- **Łącznie:** ~5,078,125 PRG zarobione z poleceń

## Krok 5: Testowanie Edge Cases

### Test 1: Użytkownik bez zakupów

```bash
# Dodaj użytkownika bez zakupów
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('users').insert({
  id: 'test-no-purchases',
  username: 'newbie',
  email: 'newbie@test.com',
  level: 1,
  prg: 0,
  gems: 0
}).then(() => console.log('Created user without purchases'));
"
```

Wyszukaj: `newbie`

**Oczekiwany rezultat:**
- ✅ Wyświetlą się podstawowe statystyki
- ✅ Brak sekcji inwestycji i poleceń

### Test 2: Bardzo duże liczby

Sprawdź czy liczby są poprawnie formatowane:
- ✅ 1,000,000 PRG wyświetla się jako "1,000,000" lub "1M"
- ✅ $10,000 wyświetla się jako "$10,000"

## Krok 6: Czyszczenie Danych Testowych

Po zakończeniu testów:

```bash
node scripts/clean-test-data.js
```

## Checklist Testowania

### Publiczny Panel (GameDashboard)
- [ ] Wyszukiwanie po username działa
- [ ] Wyszukiwanie po email działa
- [ ] Wyświetlają się statystyki gry
- [ ] Wyświetlają się statystyki inwestycji (jeśli są)
- [ ] Wyświetlają się statystyki poleceń (jeśli są)
- [ ] Obsługa błędów (user not found)
- [ ] Loading state podczas pobierania
- [ ] Tłumaczenia (PL/EN) działają

### Panel Zalogowanego (MyGameDashboard)
- [ ] Wykrywa zalogowanego użytkownika
- [ ] Wyświetla przycisk logowania dla niezalogowanych
- [ ] Automatycznie ładuje dane po zalogowaniu
- [ ] Wyświetla email użytkownika
- [ ] Wszystkie statystyki są widoczne
- [ ] Obsługa błędów (no game account)
- [ ] Link do gry działa

### Obliczenia
- [ ] Tier inwestora jest poprawny
- [ ] Suma zainwestowana jest poprawna
- [ ] Liczba tokenów jest poprawna
- [ ] Zarobki z poleceń są poprawne (5%)
- [ ] Wolumen poleceń jest poprawny

### UI/UX
- [ ] Responsywność (mobile/tablet/desktop)
- [ ] Animacje działają płynnie
- [ ] Ikony wyświetlają się poprawnie
- [ ] Kolory i gradienty są spójne
- [ ] Wszystkie linki działają

## Znane Problemy i Rozwiązania

### Problem: "createClient is not a function"
**Rozwiązanie:** Sprawdź czy plik `/src/lib/supabase/client.ts` eksportuje `createClient`

### Problem: "No game account found"
**Rozwiązanie:** 
1. Sprawdź czy pole `auth_user_id` jest ustawione w tabeli `users`
2. Upewnij się, że używasz tego samego emaila co w grze

### Problem: Statystyki nie ładują się
**Rozwiązanie:**
1. Sprawdź console w przeglądarce (F12)
2. Sprawdź czy API endpoint zwraca dane: `/api/game/my-stats` lub `/api/game/user-stats?identifier=...`
3. Sprawdź logi serwera

### Problem: Duplikaty w JSON
**Rozwiązanie:** Już naprawione - sprawdź czy nie ma duplikatów kluczy w plikach tłumaczeń

## Następne Kroki

Po pomyślnym przetestowaniu:

1. **Konfiguracja Google OAuth:**
   - Skonfiguruj Google Cloud Console
   - Dodaj redirect URLs w Supabase

2. **Monitoring:**
   - Dodaj Google Analytics
   - Skonfiguruj Sentry dla błędów

3. **Optymalizacja:**
   - Dodaj cache dla często pobieranych danych
   - Rozważ rate limiting dla API

4. **Dokumentacja:**
   - Zaktualizuj README z instrukcjami dla użytkowników
   - Dodaj FAQ

---

**Powodzenia w testowaniu! 🚀**
