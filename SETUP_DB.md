# Database Setup Guide

It appears your local database is missing the required tables for the Presale functionality.
Since you cannot run migrations directly without the proper setup, you can manually create the tables in your Supabase SQL Editor.

## 1. Create Tables

Run the following SQL in your Supabase Project's SQL Editor:

```sql
-- Create presale_stages table
CREATE TABLE IF NOT EXISTS public.presale_stages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    bonus_percent NUMERIC,
    is_active BOOLEAN DEFAULT false,
    price NUMERIC, -- Price in USD
    hardcap_usd NUMERIC, -- Hardcap in USD
    cap NUMERIC, -- Alias for hardcap if needed by some components
    slots_left NUMERIC,
    current_price NUMERIC, -- Alias for price
    stage_ends_at TIMESTAMPTZ -- Alias for end_date
);

-- Seed initial stage
INSERT INTO public.presale_stages (name, start_date, end_date, bonus_percent, is_active, price, hardcap_usd, current_price, stage_ends_at)
VALUES 
('Seed Round', NOW(), NOW() + INTERVAL '7 days', 20, true, 0.02, 500000, 0.02, NOW() + INTERVAL '7 days');

-- Create sales table (if missing)
CREATE TABLE IF NOT EXISTS public.sales (
    id SERIAL PRIMARY KEY,
    usd_amount NUMERIC(10, 2),
    status TEXT, -- 'success', 'pending', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    transaction_id TEXT,
    buyer_wallet TEXT
);
```

## 2. Verify Connection

Ensure your `.env.local` file in the root directory contains the correct keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Once the tables are created, the application will switch from "Mock Data" mode to "Live Data" mode automatically.
