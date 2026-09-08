-- ============================================================================
-- Correction de données (2026-09-08) : biographie mal rangée.
-- La fiche « Ibn Hajar Al-Haytami » (id 46) contenait en réalité la biographie
-- d'« Ahmad Ibn Hanbal » (né 164 / mort 241), alors que la fiche Ahmad Ibn
-- Hanbal (id 15) était vide. On DÉPLACE (colonne→colonne, sans retaper l'arabe),
-- puis on vide la fiche Haytami (sa vraie bio reste à écrire).
-- ============================================================================

update public.savants set biographie = (select biographie from public.savants where id = 46)
  where id = 15 and (biographie is null or btrim(biographie) = '');

update public.savants set biographie = null, resume = null, resume_auto = false where id = 46;

with clean as (
  select btrim(regexp_replace(regexp_replace(biographie, '[#*_>\[\]`~]', '', 'g'), '\s+', ' ', 'g')) c
  from public.savants where id = 15
)
update public.savants s set
  resume = (select case when char_length(btrim(split_part(c, '.', 1))) between 1 and 180
                        then btrim(split_part(c, '.', 1))
                        else btrim(regexp_replace(left(c, 180), '\s\S*$', '')) end from clean),
  resume_auto = true
where s.id = 15;
