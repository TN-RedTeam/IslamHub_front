-- ============================================================================
-- Back-office /admin — écriture sécurisée (Hadith) — Supabase Auth
-- ============================================================================
-- Règle admin : seul le compte connecté dont l'e-mail == l'admin peut écrire.
create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = 'karimromdhane7@gmail.com'
$$;
-- Politiques d'écriture (INSERT/UPDATE/DELETE) réservées à l'admin sur
-- hadiths, hadith_sources, narrateurs, recueils, hadith_themes (SELECT reste public).
--   create policy "admin insert" on public.<t> for insert to authenticated with check (public.is_admin());
--   create policy "admin update" on public.<t> for update to authenticated using (public.is_admin()) with check (public.is_admin());
--   create policy "admin delete" on public.<t> for delete to authenticated using (public.is_admin());
--
-- RPC :
--   admin_get_hadith(id)   → colonnes brutes + sources + tag (lecture pour édition)
--   themes_for_tag(tag)    → aperçu des thèmes déduits d'un CSV de tags
--   admin_save_hadith(p jsonb) SECURITY DEFINER, gardé par is_admin() :
--     enregistre en une transaction le hadith (+ statut/slug), un narrateur
--     éventuellement nouveau, remplace les hadith_sources (recueil existant ou
--     nouveau) et re-déduit les hadith_themes depuis les tags. Retourne l'id.
--   grant execute admin_save_hadith → authenticated seulement.
