REVOKE ALL ON public.user_roles FROM anon, authenticated;
REVOKE ALL ON public.products FROM anon, authenticated;
REVOKE ALL ON public.lookbook_images FROM anon, authenticated;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT ON public.lookbook_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lookbook_images TO authenticated;
GRANT ALL ON public.lookbook_images TO service_role;