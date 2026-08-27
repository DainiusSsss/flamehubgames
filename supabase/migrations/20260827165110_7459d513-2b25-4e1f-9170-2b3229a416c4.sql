ALTER TABLE public.members ADD COLUMN IF NOT EXISTS session_token uuid NOT NULL DEFAULT gen_random_uuid();

DROP POLICY IF EXISTS members_read ON public.members;
DROP POLICY IF EXISTS members_insert ON public.members;
DROP POLICY IF EXISTS members_update ON public.members;
DROP POLICY IF EXISTS messages_read ON public.messages;
DROP POLICY IF EXISTS messages_insert ON public.messages;

REVOKE ALL ON public.members FROM anon, authenticated;
REVOKE ALL ON public.messages FROM anon, authenticated;
GRANT ALL ON public.members TO service_role;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_no_direct_access" ON public.members FOR SELECT USING (false);
CREATE POLICY "messages_no_direct_access" ON public.messages FOR SELECT USING (false);

ALTER PUBLICATION supabase_realtime DROP TABLE public.members;
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;