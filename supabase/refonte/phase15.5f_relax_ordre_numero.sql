-- ============================================================================
-- Phase 15.5 — vague 5f : relâcher les UNIQUE de clé naturelle partagée
-- ============================================================================
-- attributs.ordre / noms_allah.ordre / sourates.numero sont des clés
-- LANGUAGE-NEUTRAL qui doivent se répéter entre langues (l'ordre 5, la sourate 2
-- existent en FR, EN et AR). Leur UNIQUE global empêcherait une ligne par langue.
-- On remplace unique(cle) par unique(cle, locale).
--
-- NON DESTRUCTIF : l'état actuel (tout FR, valeurs distinctes) satisfait les deux
-- formes ; aucune de ces clés n'est référencée par une FK (les FK pointent `id`).
-- Idempotent.
-- ============================================================================

do $relax$
begin
  -- attributs.ordre
  alter table public.attributs drop constraint if exists attributs_ordre_key;
  if not exists (select 1 from pg_constraint
                 where conname='attributs_ordre_locale_key'
                   and conrelid='public.attributs'::regclass) then
    alter table public.attributs add constraint attributs_ordre_locale_key unique (ordre, locale);
  end if;

  -- noms_allah.ordre
  alter table public.noms_allah drop constraint if exists noms_allah_ordre_key;
  if not exists (select 1 from pg_constraint
                 where conname='noms_allah_ordre_locale_key'
                   and conrelid='public.noms_allah'::regclass) then
    alter table public.noms_allah add constraint noms_allah_ordre_locale_key unique (ordre, locale);
  end if;

  -- sourates.numero
  alter table public.sourates drop constraint if exists sourates_numero_key;
  if not exists (select 1 from pg_constraint
                 where conname='sourates_numero_locale_key'
                   and conrelid='public.sourates'::regclass) then
    alter table public.sourates add constraint sourates_numero_locale_key unique (numero, locale);
  end if;
end $relax$;

-- PREUVE : les contraintes composites (…, locale) sont présentes, les anciennes absentes.
select conrelid::regclass::text as tbl, conname, pg_get_constraintdef(oid) as def
from pg_constraint
where connamespace='public'::regnamespace
  and contype='u'
  and conrelid::regclass::text in ('attributs','noms_allah','sourates')
order by tbl, conname;
