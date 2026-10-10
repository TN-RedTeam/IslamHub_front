-- ============================================================================
-- Phase 11i — Téléversement des scans depuis l'admin (bucket `references`)
-- ============================================================================
-- Avant : les scans étaient uploadés à la main via le dashboard Supabase, puis
-- leur URL collée dans le formulaire. Désormais l'admin téléverse directement
-- depuis la page (supabase.storage.from('references').upload) — ce qui exige
-- des policies RLS sur storage.objects (aucune n'existait → tout écrit bloqué).
--
-- Bucket `references` : public (lecture), 5 Mo/fichier, image/webp|jpeg|png.
-- Écriture réservée à l'admin (public.is_admin() = email autorisé).
-- Appliqué via le MCP. Idempotent.
-- ============================================================================
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='references_admin_insert') then
    create policy references_admin_insert on storage.objects for insert to authenticated
      with check (bucket_id='references' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='references_admin_update') then
    create policy references_admin_update on storage.objects for update to authenticated
      using (bucket_id='references' and public.is_admin())
      with check (bucket_id='references' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='references_admin_delete') then
    create policy references_admin_delete on storage.objects for delete to authenticated
      using (bucket_id='references' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='references_public_select') then
    create policy references_public_select on storage.objects for select to public
      using (bucket_id='references');
  end if;
end $$;

-- Pour relever la limite de taille du bucket (ex. 10 Mo), décommenter :
-- update storage.buckets set file_size_limit = 10485760 where id = 'references';
