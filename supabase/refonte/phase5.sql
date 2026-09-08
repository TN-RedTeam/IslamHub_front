-- ============================================================================
-- Refonte IslamHub — Phase 5 : dossiers thématiques (le nouveau cœur).
-- Appliqué le 2026-09-07 (branche refonte/architecture-v2).
--
-- + Fix sécurité appliqué au passage :
--   alter table public.hadiths_backup_phase1 enable row level security;
--   (bloque l'accès anon à la table de backup.)
-- ============================================================================

-- RPC : assemble un dossier publié + ses preuves (résolues en hadith/parole/
-- verset) + images + dossiers liés, en un seul JSON.
create or replace function public.get_dossier(dossier_slug text)
returns json language sql stable as $function$
  with d as (select * from public.dossiers where slug = dossier_slug and published)
  select case when not exists (select 1 from d) then null else json_build_object(
    'dossier', (select row_to_json(x) from (
        select id, slug, h1, meta_title, meta_description,
               croyance_texte, objection_texte, reponse_texte from d) x),
    'preuves', coalesce((select json_agg(row_to_json(t) order by t.ordre, t.id) from (
        select dp.id, dp.type, dp.ordre,
          case dp.type
            when 'hadith' then (select row_to_json(hh) from (
                 select h.id, h.sujet, h.slug, h.texte_arabe, h.texte_francais,
                        h.phonetique as "phonétique", h.degre_authenticite, h.type_hadith, h.juge_par,
                        (select string_agg(r.nom, ', ') from public.hadith_sources hs
                           join public.recueils r on r.id = hs.recueil_id where hs.hadith_id = h.id) as recueils
                 from public.hadiths h where h.id = dp.ref_id) hh)
            when 'parole' then (select row_to_json(pp) from (
                 select p.id, p.sujet, p.slug, p.savant, p.ecole, p.texte_arabe, p.texte_francais, p.explication
                 from public.paroles p where p.id = dp.ref_id) pp)
            when 'verset' then (select row_to_json(cc) from (
                 select c.id, c.sujet, c.sourate, c.texte_arabe, c.texte_francais
                 from public.coran c where c.id = dp.ref_id) cc)
          end as ref
        from public.dossier_preuves dp where dp.dossier_id = (select id from d)) t), '[]'::json),
    'images', coalesce((select json_agg(row_to_json(i) order by i.ordre, i.id) from (
        select id, image_url, legende, alt, source_livre, ordre
        from public.dossier_images where dossier_id = (select id from d)) i), '[]'::json),
    'lies', coalesce((select json_agg(row_to_json(l)) from (
        select dl.slug, dl.h1 from public.dossiers_lies x
          join public.dossiers dl on dl.id = x.dossier_lie_id
        where x.dossier_id = (select id from d) and dl.published) l), '[]'::json)
  ) end;
$function$;
grant execute on function public.get_dossier(text) to anon, authenticated;

-- Dossier d'exemple : « Le sens de l'istiwā' » (croyance/objection/réponse en
-- français + translittération ; preuves = hadiths existants 10, 16, 76).
insert into public.dossiers (slug, h1, meta_title, meta_description, croyance_texte, objection_texte, reponse_texte, published)
values (
  'le-sens-de-l-istiwa',
  $h1$Le sens de l'istiwā'$h1$,
  $mt$Le sens de l'istiwā' — Allah existe sans endroit$mt$,
  $md$Que signifie l'istiwā' attribué à Allah dans le Coran ? Réponse sourcée : Allah existe sans endroit ni direction, selon le Coran, la Sunna authentique et le consensus des savants.$md$,
  $croy$Allah existe sans endroit et sans direction. Il existait de toute éternité, avant de créer les lieux et le temps ; et Il n'a pas changé : Il existe maintenant sans endroit, tel qu'Il était avant de créer l'espace. Le terme « istiwā' » mentionné dans le Coran ne signifie pas qu'Allah serait assis, installé ou localisé au-dessus du Trône : Allah est exempt du corps, de la limite, du mouvement et de la direction.$croy$,
  $obj$« Le verset dit : "ar-Raḥmānou ʿalā l-ʿarch-istawā". Puisque le Trône (al-ʿarch) est ce qu'il y a de plus élevé, cela prouverait qu'Allah est établi au-dessus du Trône — donc en haut, en un lieu. »$obj$,
  $rep$Cette lecture littérale est rejetée par les savants du Salaf comme du Khalaf. En arabe, le verbe « istawā » possède plusieurs sens (dominer, préserver, parachever…) et n'implique nullement une installation corporelle. Attribuer à Allah un lieu, une position ou une direction reviendrait à Le comparer à Ses créatures — ce que le Coran exclut formellement : « Rien n'est tel que Lui » (Sourate ach-Chūrā, 42:11). L'imam ʿAlī a dit : « Allah existait de toute éternité et il n'y avait pas de lieu ; et Il est maintenant tel qu'Il était [de toute éternité, sans lieu]. » Le sens correct d'« istiwā' » est donc la domination et la préservation du Trône par Allah, non l'occupation d'un endroit. Voir aussi Sourate Ṭā-Hā (20:5).$rep$,
  true
) on conflict (slug) do nothing;

insert into public.dossier_preuves (dossier_id, type, ref_id, ordre)
select d.id, v.type, v.ref_id, v.ordre
from (select id from public.dossiers where slug = 'le-sens-de-l-istiwa') d,
     (values ('hadith', 10, 1), ('hadith', 16, 2), ('hadith', 76, 3)) v(type, ref_id, ordre)
where not exists (select 1 from public.dossier_preuves dp where dp.dossier_id = d.id);
-- Emplacements à compléter à la main : versets 20:5 et 42:11 (type 'verset'),
-- et paroles de savants sourcées.
