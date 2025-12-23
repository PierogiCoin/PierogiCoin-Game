# Panel Gracza - Dokumentacja

## Przegląd

Projekt zawiera dwa panele gracza na stronie `/buy-tokens`:

### 1. **MyGameDashboard** - Panel dla zalogowanych użytkowników
- Automatycznie ładuje dane zalogowanego użytkownika
- Wymaga logowania przez Google (Supabase Auth)
- Pokazuje dane powiązane z kontem auth_user_id

### 2. **GameDashboard** - Panel publiczny
- Wyszukiwanie po nazwie użytkownika lub emailu
- Dostępny dla wszystkich bez logowania
- Przydatny do sprawdzania statystyk innych graczy

## Jak to działa?

### Logowanie w grze przeglądarowej

1. Użytkownik otwiera grę w przeglądarce
2. Widzi ekran logowania (`Auth.tsx`)
3. Loguje się przez email/hasło (Supabase Auth)
4. System tworzy/ładuje profil gracza z tabeli `users`
5. Pole `auth_user_id` w tabeli `users` jest automatycznie wypełniane UUID z Supabase Auth

### Wyświetlanie danych na stronie

**MyGameDashboard:**
```typescript
// Automatycznie pobiera dane zalogowanego użytkownika
GET /api/game/my-stats
// Używa supabase.auth.getUser() do identyfikacji
// Szuka w tabeli users po auth_user_id
```

**GameDashboard:**
```typescript
// Wyszukiwanie po identyfikatorze
GET /api/game/user-stats?identifier=username_or_email
// Szuka w tabeli users po username LUB email
```

## Statystyki wyświetlane

### Statystyki gry:
- Poziom, XP, PRG, Gemsy
- Punkty areny, wygrane pojedynki
- Osiągnięcia, ukończone zadania
- Sieć znajomych

### Statystyki inwestycyjne:
- Łączna kwota zainwestowana
- Liczba zakupionych tokenów PRG
- Tier inwestora (Bronze/Silver/Gold/Diamond)
- Liczba zakupów

### Statystyki poleceń:
- Liczba poleconych użytkowników
- Zarobki z programu poleceń (5% tokenów)
- Łączny wolumen zakupów poleconych

## Struktura bazy danych

### Tabela `users`
```sql
- id: TEXT (Telegram ID lub UUID)
- auth_user_id: TEXT (UUID z Supabase Auth)
- username: TEXT
- email: TEXT
- prg, gems, level, xp, etc.
```

### Tabela `purchases`
```sql
- buyer_wallet: TEXT (powiązane z users.id)
- buyer_address: TEXT
- prg_delivery_address: TEXT
- referrer_address: TEXT (dla programu poleceń)
- usd_amount: NUMERIC
- tokens_to_credit: BIGINT
- status: TEXT
```

## Konfiguracja

### Zmienne środowiskowe
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Polityki RLS (Row Level Security)
Tabele `users` i `purchases` muszą mieć odpowiednie polityki RLS:
- Odczyt publiczny dla statystyk
- Zapis tylko dla uwierzytelnionych użytkowników

## Bezpieczeństwo

- API `/api/game/my-stats` wymaga uwierzytelnienia
- Używa `createClient()` z serwera do weryfikacji sesji
- Dane osobowe (email) są chronione przez RLS
- Publiczny panel pokazuje tylko podstawowe statystyki

## Rozwój

### Dodawanie nowych statystyk

1. Rozszerz interfejs `PlayerStats` w obu komponentach
2. Dodaj obliczenia w API endpoints
3. Dodaj wyświetlanie w komponencie
4. Dodaj tłumaczenia w `buy-tokens-page.json`
