-- Lookbook images table
CREATE TABLE IF NOT EXISTS public.lookbook_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lookbook_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lookbook images"
  ON public.lookbook_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins insert lookbook images"
  ON public.lookbook_images FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update lookbook images"
  ON public.lookbook_images FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete lookbook images"
  ON public.lookbook_images FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public storage bucket for lookbook images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lookbook', 'lookbook', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the lookbook bucket
CREATE POLICY "Public can view lookbook files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'lookbook');

CREATE POLICY "Admins upload lookbook files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lookbook' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update lookbook files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lookbook' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete lookbook files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lookbook' AND public.has_role(auth.uid(), 'admin'));