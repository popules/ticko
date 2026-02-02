-- Migration: Enable Short Selling Transaction Types
-- Run this in Supabase SQL Editor

-- 1. Drop the existing check constraint on 'type'
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 2. Add the new check constraint allowing 'short' and 'cover'
ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('buy', 'sell', 'short', 'cover'));

-- 3. (Optional) Comment to document the types
COMMENT ON COLUMN transactions.type IS 'Transaction type: buy, sell, short, cover';
