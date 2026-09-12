-- ============================================================================
-- narrateurs : rôle distinctif (badge à part) + genre (honorifique)
-- ============================================================================
alter table public.narrateurs
  add column if not exists role text,
  add column if not exists sexe text;

-- role ∈ { epouse_prophete | calife_rachidoun } ; sexe ∈ { f | m }
alter table public.narrateurs add constraint narrateurs_role_check
  check (role is null or role in ('epouse_prophete','calife_rachidoun'));
alter table public.narrateurs add constraint narrateurs_sexe_check
  check (sexe is null or sexe in ('f','m'));

-- Épouses du Prophète (Mères des croyants) : ʿAichah (1) + 31–39 → féminin.
update public.narrateurs set role = 'epouse_prophete', sexe = 'f'
where id = 1 or id between 31 and 39;

-- Califes bien-guidés présents : Omar (3), Ali (16).
update public.narrateurs set role = 'calife_rachidoun', sexe = 'm' where id in (3, 16);

-- get_hadith / search_hadiths renvoient narrateur_role + narrateur_sexe (en plus
-- de narrateur_generation) ; le composant BadgeGeneration en déduit le badge et
-- l'honorifique (au bon genre ; honorifique masqué dans la modale).
