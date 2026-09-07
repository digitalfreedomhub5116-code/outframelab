-- ==============================================================================
-- OUTFRAME LABS — ADDRESSES TABLE ENHANCEMENTS & DELETE POLICY
-- ==============================================================================

-- 1. Add delivery_instructions column for courier delivery notes
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

-- 2. Ensure DELETE policy exists so users can delete their saved addresses
DROP POLICY IF EXISTS "Public addresses delete" ON public.addresses;
CREATE POLICY "Public addresses delete" ON public.addresses FOR DELETE USING (true);
