-- ============================================================================
-- Phase 14 B — La femme musulmane : catégories + fusion al-istiḥāḍah
-- ============================================================================
-- NON DESTRUCTIF. Sauvegarde complète d'abord. Aucun texte (matn/commentaire/
-- arabe) n'est modifié : on ajoute des colonnes, on renomme le chapitre des 5
-- parties istiḥāḍah et on les étiquette (section_titre/section_ordre).
-- ============================================================================

-- 1) Sauvegarde (filet)
drop table if exists public.femmes_backup_phase14;
create table public.femmes_backup_phase14 as select * from public.femmes;

-- 2) Colonnes (non destructives)
alter table public.femmes add column if not exists categorie text;
alter table public.femmes add column if not exists cat_ordre int;
alter table public.femmes add column if not exists section_titre text;
alter table public.femmes add column if not exists section_ordre int;

-- 3) Fusion des 5 « al-istiḥāḍah … Partie N » en UN cours à 5 sections.
--    Le WHERE s'évalue sur l'ancien chapitre (UPDATE unique).
update public.femmes
set section_ordre = substring(chapitre from 'Partie\s+([0-9]+)')::int,
    section_titre = 'Partie ' || substring(chapitre from 'Partie\s+([0-9]+)'),
    categorie     = coalesce(categorie, 'Purification & règles féminines'),
    cat_ordre     = coalesce(cat_ordre, 1),
    chapitre      = 'Le saignement irrégulier (al-istiḥāḍah)'
where chapitre ~ 'Partie\s+[0-9]+\s*$'
  and (chapitre ilike '%istiḥāḍah%' or chapitre ilike '%isti%adah%');

-- 4) Lecture : femmes_all expose categorie/cat_ordre + section par segment.
CREATE OR REPLACE FUNCTION public.femmes_all()
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public', 'pg_temp'
AS $function$
  select coalesce(json_agg(chap order by cat_ord nulls last, ord, nom), '[]'::json)
  from (
    select chapitre as nom, min(ordre) as ord, min(cat_ordre) as cat_ord,
      json_build_object(
        'chapitre', chapitre,
        'categorie', max(categorie),
        'cat_ordre', min(cat_ordre),
        'segments', json_agg(json_build_object(
          'id', id, 'matn', matn, 'commentaire', commentaire,
          'texte_arabe', texte_arabe, 'source', source,
          'section_titre', section_titre, 'section_ordre', section_ordre
        ) order by section_ordre nulls first, ordre, id)
      ) as chap
    from public.femmes group by chapitre
  ) s;
$function$;

-- 5) PREUVE zéro perte (à comparer) :
select
  (select count(*) from public.femmes_backup_phase14)                                            as backup_rows,
  (select count(*) from public.femmes)                                                           as total_rows_after,      -- doit = backup_rows
  (select count(*) from public.femmes where chapitre = 'Le saignement irrégulier (al-istiḥāḍah)') as istihadah_rows_after,  -- doit = 42
  (select count(distinct section_ordre) from public.femmes
     where chapitre = 'Le saignement irrégulier (al-istiḥāḍah)')                                  as sections_after,        -- doit = 5
  (select coalesce(sum(length(coalesce(commentaire,''))),0) from public.femmes_backup_phase14)    as comm_len_backup,
  (select coalesce(sum(length(coalesce(commentaire,''))),0) from public.femmes)                   as comm_len_after;        -- doit = comm_len_backup
