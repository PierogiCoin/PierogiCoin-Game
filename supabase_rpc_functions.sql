-- RPC Functions for get-sales-summary API
-- Run this in Supabase SQL Editor

-- Function to get total confirmed USD raised from purchases table
CREATE OR REPLACE FUNCTION get_total_confirmed_usd_raised()
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(usd_amount) FROM purchases WHERE status = 'success' AND project_tag = 'PRG'),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total confirmed PRG tokens credited
CREATE OR REPLACE FUNCTION get_total_confirmed_prg_credited()
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(tokens_to_credit) FROM purchases WHERE status = 'success' AND project_tag = 'PRG'),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
