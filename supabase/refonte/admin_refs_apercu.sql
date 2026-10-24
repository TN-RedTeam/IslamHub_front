-- ============================================================================
-- Admin — aperçu des sources dans le sélecteur de preuve (blocs composables)
-- ============================================================================
-- Problème : dans « Développement sourcé (blocs) », le menu « Choisir la source »
-- n'affichait que le SUJET. Quand plusieurs hadiths/paroles/versets partagent le
-- même sujet (ex. 7 hadiths « Apprendre la science de la religion »), impossible
-- de distinguer le bon.
--
-- Correctif : le `label` de chaque option gagne un APERÇU du contenu (début de la
-- traduction française, à défaut l'arabe) + un identifiant « · #id » unique.
-- Ex. :  « Apprendre la science de la religion — « Celui qui emprunte un
--          chemin pour y acquérir une science… » · #42 »
-- Aucun changement de données ni de schéma — juste la composition du libellé.
-- Ré-émet admin_list_dossier_refs (utilisée par l'éditeur de blocs). Non destructif.
-- ============================================================================

create or replace function public.admin_list_dossier_refs()
 returns json language plpgsql security definer set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return json_build_object(
    'hadiths', coalesce((
      select json_agg(json_build_object('id', h.id, 'label',
          coalesce(nullif(btrim(h.sujet), ''), 'Hadith')
          || coalesce(' — « ' || nullif(btrim(left(regexp_replace(coalesce(h.texte_francais, h.texte_arabe, ''), '[[:space:]]+', ' ', 'g'), 70), ' «»"'), '') || '… »', '')
          || ' · #' || h.id)
        order by h.sujet nulls last, h.id)
      from public.hadiths h), '[]'::json),
    'paroles', coalesce((
      select json_agg(json_build_object('id', p.id, 'label',
          coalesce(nullif(btrim(p.sujet), ''), s.nom, 'Parole')
          || coalesce(' — « ' || nullif(btrim(left(regexp_replace(coalesce(p.texte_francais, p.texte_arabe, ''), '[[:space:]]+', ' ', 'g'), 70), ' «»"'), '') || '… »', '')
          || ' · #' || p.id)
        order by p.sujet nulls last, p.id)
      from public.paroles p left join public.savants s on s.id = p.savant_id), '[]'::json),
    'versets', coalesce((
      select json_agg(json_build_object('id', c.id, 'label',
          coalesce(nullif(btrim(c.sujet), ''), 'Verset')
          || case when c.sourate is not null then ' — ' || c.sourate else '' end
          || coalesce(' — « ' || nullif(btrim(left(regexp_replace(coalesce(c.texte_francais, c.texte_arabe, ''), '[[:space:]]+', ' ', 'g'), 70), ' «»"'), '') || '… »', '')
          || ' · #' || c.id)
        order by c.sujet nulls last, c.id)
      from public.coran c), '[]'::json)
  );
end $function$;

-- ---- PREUVE : aperçu direct des libellés hadiths (sans session admin) --------
select
  coalesce(nullif(btrim(h.sujet), ''), 'Hadith')
  || coalesce(' — « ' || nullif(btrim(left(regexp_replace(coalesce(h.texte_francais, h.texte_arabe, ''), '[[:space:]]+', ' ', 'g'), 70), ' «»"'), '') || '… »', '')
  || ' · #' || h.id as apercu_label
from public.hadiths h
order by h.sujet nulls last, h.id
limit 8;
