-- ============================================================================
-- Admin — liste hadiths : ajout du filtre « sans phonétique »
-- ============================================================================
-- Ré-émet admin_hadiths_extras À L'IDENTIQUE en ajoutant un mode
-- 'sans_phonetique' : hadiths sans AUCUNE phonétique, ni au niveau principal,
-- ni dans leurs segments, ni dans leurs variantes (pour les repérer et les
-- compléter). Les autres modes (dialogue, variante, both, sans_source,
-- sans_arabe) sont inchangés. is_admin() respecté. Non destructif.
-- ============================================================================

create or replace function public.admin_hadiths_extras(
  p_mode text default 'any'::text, p_q text default ''::text, p_limit integer default 300)
 returns json language plpgsql stable security definer set search_path to 'public'
as $function$
declare v_q text := btrim(coalesce(p_q,''));
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return (
    with base as (
      select h.id, h.sujet, h.statut, h.tag, h.texte_arabe, h.texte_francais,
        (select count(*) from public.hadith_segments s where s.hadith_id=h.id) as n_seg,
        (select count(*) from public.hadith_variants v where v.hadith_id=h.id) as n_var,
        (select count(*) from public.hadith_sources hs where hs.hadith_id=h.id) as n_src,
        -- Phonétique présente quelque part : principal + segments + variantes.
        (case when coalesce(btrim(h.phonetique),'') <> '' then 1 else 0 end
         + (select count(*) from public.hadith_segments s
              where s.hadith_id=h.id and coalesce(btrim(s.phonetique),'') <> '')
         + (select count(*) from public.hadith_variants v
              where v.hadith_id=h.id and coalesce(btrim(v.phonetique),'') <> '')) as n_phon
      from public.hadiths h
      where (v_q = '' or h.sujet ilike '%'||v_q||'%'
             or public.normalize_ar(coalesce(h.texte_arabe,'')) ilike '%'||public.normalize_ar(v_q)||'%'
             or (v_q ~ '^[0-9]+$' and h.id = v_q::bigint))
    ),
    flt as (
      select * from base where case p_mode
        when 'dialogue'        then n_seg > 0
        when 'variante'        then n_var > 0
        when 'both'            then n_seg > 0 and n_var > 0
        when 'sans_source'     then n_src = 0
        when 'sans_arabe'      then texte_arabe is null or btrim(texte_arabe) = ''
        when 'sans_phonetique' then n_phon = 0
        else (n_seg > 0 or n_var > 0) end
    )
    select json_build_object('total', (select count(*) from flt),
      'data', coalesce((select json_agg(row_to_json(x)) from (select * from flt order by id limit p_limit) x), '[]'::json))
  );
end $function$;

-- ---- PREUVE : combien de hadiths sans aucune phonétique --------------------
-- (requête directe équivalente — ne nécessite pas de session admin)
select count(*) as sans_phonetique
from public.hadiths h
where coalesce(btrim(h.phonetique),'') = ''
  and not exists (select 1 from public.hadith_segments s
                  where s.hadith_id=h.id and coalesce(btrim(s.phonetique),'') <> '')
  and not exists (select 1 from public.hadith_variants v
                  where v.hadith_id=h.id and coalesce(btrim(v.phonetique),'') <> '');
