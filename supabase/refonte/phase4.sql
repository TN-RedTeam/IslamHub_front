-- ============================================================================
-- Refonte IslamHub — Phase 4a : page par hadith (SEO « sûr », HashRouter conservé).
-- Appliqué le 2026-09-07 (branche refonte/architecture-v2).
-- ============================================================================

-- Fiche d'un hadith par id (page dédiée /hadiths/:id/:slug).
create or replace function public.get_hadith(hadith_id integer)
returns json language sql stable as $function$
  select case when not exists (select 1 from public.hadiths where id = hadith_id) then null else
    (select row_to_json(x) from (
       select h.id, h.sujet, h.slug, h.texte_arabe, h.texte_francais, h.phonetique as "phonétique",
              h.explication, h.degre_authenticite, h.type_hadith, h.juge_par,
              h.rapporteur, h.narrateur, h.tag,
              (select string_agg(r.nom, ', ') from public.hadith_sources hs
                 join public.recueils r on r.id = hs.recueil_id where hs.hadith_id = h.id) as recueils
       from public.hadiths h where h.id = hadith_id) x) end;
$function$;
grant execute on function public.get_hadith(integer) to anon, authenticated;

-- RESTE (Phase 4b, chantier dédié — validation utilisateur requise) :
--  • HashRouter → BrowserRouter (URLs propres sans #) + basename selon l'URL Pages
--  • fallback SPA GitHub Pages (404.html = copie d'index.html)
--  • prérendu SSG (contenu visible sans JS)
--  • sitemap.xml (URLs propres) — inutile tant qu'on est en HashRouter.
