-- ============================================================================
-- Phase 11y — Parole : commenter aussi un hadith ou un verset du Coran
-- ============================================================================
-- Jusqu'ici une parole ne pouvait commenter qu'une autre parole
-- (commente_parole_id) ou un livre (commente_livre, texte libre).
-- On ajoute la possibilité de commenter :
--   • un hadith  → commente_hadith_id  (FK hadiths)
--   • un verset  → commente_verset_id  (FK coran, la table thématique du Coran)
-- Un sélecteur de type côté admin ne remplit qu'un seul des trois id.
-- commente_type ('parole'|'hadith'|'verset') garde la trace du choix.
--
-- A) Schéma — déjà appliqué via MCP (alter add column).
-- B/C) Lectures (get_parole, admin_get_parole) : fonctions SQL STABLE → appliquées via MCP.
-- D) Écriture admin (admin_save_parole) : SECURITY DEFINER → à exécuter à la main
--    si MCP timeout. Fichier idempotent (create or replace).
-- ============================================================================

-- A) Schéma (déjà appliqué).
alter table public.paroles add column if not exists commente_type text;
alter table public.paroles add column if not exists commente_hadith_id bigint references public.hadiths(id) on delete set null;
alter table public.paroles add column if not exists commente_verset_id bigint references public.coran(id) on delete set null;

-- ----------------------------------------------------------------------------
-- B) Lecture publique : get_parole — `commente` devient polymorphe.
--    { type, sujet, slug? , id?, sourate? } selon la cible commentée.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_parole(p_slug text)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public', 'pg_temp'
AS $function$
  select row_to_json(x) from (
    select p.id, p.slug, p.sujet, p.rubrique, p.intro, p.texte_arabe, p.texte_francais, p."phonétique" as phonetique,
           p.explication, p.source_livre, p.page, p.ecole,
           coalesce(sv.nom, p.savant) as savant, sv.slug as savant_slug, sv.generation,
           p.commente_livre,
           (select json_build_object('nom', rs.nom, 'slug', rs.slug) from public.savants rs where rs.id = p.rapporteur_savant_id) as rapporteur,
           case
             when p.commente_parole_id is not null then
               (select json_build_object('type','parole','sujet', cp.sujet, 'slug', cp.slug)
                  from public.paroles cp where cp.id = p.commente_parole_id)
             when p.commente_hadith_id is not null then
               (select json_build_object('type','hadith',
                         'sujet', coalesce(nullif(btrim(h.sujet),''), left(h.texte_arabe,60)),
                         'id', h.id, 'slug', h.slug)
                  from public.hadiths h where h.id = p.commente_hadith_id)
             when p.commente_verset_id is not null then
               (select json_build_object('type','verset',
                         'sujet', coalesce(nullif(btrim(c.sujet),''), left(c.texte_arabe,60)),
                         'sourate', c.sourate)
                  from public.coran c where c.id = p.commente_verset_id)
             else null
           end as commente,
           coalesce((select json_agg(json_build_object('ordre', s.ordre, 'intro', s.intro, 'texte_arabe', s.texte_arabe,
                                                        'phonetique', s.phonetique, 'texte_francais', s.texte_francais,
                                                        'explication', s.explication) order by s.ordre, s.id)
             from public.parole_segments s where s.parole_id = p.id), '[]'::json) as segments,
           coalesce((select json_agg(row_to_json(im) order by im.ordre, im.id)
             from (select pi.id, pi.image_url, pi.legende, pi.alt, pi.source_livre, pi.source_livre_ar, pi.ordre
                   from public.parole_images pi where pi.parole_id = p.id) im), '[]'::json) as images,
           coalesce((select json_agg(json_build_object('slug', th.slug, 'nom', th.nom) order by th.famille, th.ordre)
             from public.parole_themes pt join public.themes th on th.slug = pt.theme_slug
             where pt.parole_id = p.id), '[]'::json) as themes
    from public.paroles p
    left join public.savants sv on sv.id = p.savant_id
    where p.slug = p_slug limit 1
  ) x;
$function$;

-- ----------------------------------------------------------------------------
-- C) Lecture admin : admin_get_parole — expose commente_type + les 3 id.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_parole(p_id bigint)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public', 'pg_temp'
AS $function$
  select row_to_json(x) from (
    select p.id, p.sujet, p.rubrique, p.intro, p.texte_arabe, p.texte_francais, p."phonétique" as phonetique, p.explication,
           p.source_livre, p.page, p.ecole, p.savant_id, p.tag,
           p.rapporteur_savant_id, p.commente_parole_id, p.commente_hadith_id, p.commente_verset_id, p.commente_type, p.commente_livre,
           coalesce((select json_agg(json_build_object('ordre', s.ordre, 'intro', s.intro, 'texte_arabe', s.texte_arabe,
                                                        'phonetique', s.phonetique, 'texte_francais', s.texte_francais,
                                                        'explication', s.explication) order by s.ordre, s.id)
                     from public.parole_segments s where s.parole_id = p.id), '[]'::json) as segments,
           coalesce((select json_agg(json_build_object('image_url', pi.image_url, 'alt', pi.alt, 'legende', pi.legende, 'source_livre', pi.source_livre, 'source_livre_ar', pi.source_livre_ar, 'ordre', pi.ordre) order by pi.ordre, pi.id)
                     from public.parole_images pi where pi.parole_id = p.id), '[]'::json) as images
    from public.paroles p where p.id = p_id
  ) x;
$function$;

-- ----------------------------------------------------------------------------
-- D) Écriture admin : admin_save_parole — persiste le type + un seul des 3 id.
--    >>> À EXÉCUTER À LA MAIN si MCP timeout (SECURITY DEFINER) <<<
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_save_parole(p jsonb)
 RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_savant_id bigint := nullif(p->>'savant_id','')::bigint;
  v_rapporteur bigint := nullif(p->>'rapporteur_savant_id','')::bigint;
  v_ctype text := nullif(btrim(p->>'commente_type'),'');
  v_cparole bigint := case when v_ctype='parole' then nullif(p->>'commente_parole_id','')::bigint else null end;
  v_chadith bigint := case when v_ctype='hadith' then nullif(p->>'commente_hadith_id','')::bigint else null end;
  v_cverset bigint := case when v_ctype='verset' then nullif(p->>'commente_verset_id','')::bigint else null end;
  v_livre text := nullif(btrim(p->>'commente_livre'),'');
  v_savant_nom text; v_slug text; v_sslug text; im jsonb;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  -- type nettoyé : s'il ne correspond à aucun id valide, on le remet à null
  if v_cparole is null and v_chadith is null and v_cverset is null then v_ctype := null; end if;

  if (p->'new_savant') is not null and nullif(btrim(p->'new_savant'->>'nom'),'') is not null then
    v_savant_nom := btrim(p->'new_savant'->>'nom');
    v_sslug := lower(regexp_replace(regexp_replace(public.unaccent(v_savant_nom),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
    if v_sslug='' or exists (select 1 from public.savants where slug=v_sslug) then v_sslug := coalesce(nullif(v_sslug,''),'savant')||'-'||floor(random()*100000)::text; end if;
    insert into public.savants (nom, slug) values (v_savant_nom, v_sslug)
    on conflict (nom) do update set nom=excluded.nom returning id, nom into v_savant_id, v_savant_nom;
  elsif v_savant_id is not null then
    select nom into v_savant_nom from public.savants where id=v_savant_id;
  end if;

  if v_id is null then
    v_slug := lower(regexp_replace(regexp_replace(public.unaccent(coalesce(p->>'sujet','parole')),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
    if v_slug='' then v_slug:='parole'; end if;
    if exists (select 1 from public.paroles where slug=v_slug) then v_slug := v_slug||'-'||floor(random()*100000)::text; end if;
    insert into public.paroles (sujet, rubrique, intro, savant, savant_id, texte_arabe, texte_francais, "phonétique", explication, tag, ecole, source_livre, page, slug, rapporteur_savant_id, commente_type, commente_parole_id, commente_hadith_id, commente_verset_id, commente_livre)
    values (nullif(btrim(p->>'sujet'),''), nullif(btrim(p->>'rubrique'),''), nullif(btrim(p->>'intro'),''), v_savant_nom, v_savant_id, btrim(p->>'texte_arabe'), nullif(p->>'texte_francais',''),
            nullif(p->>'phonetique',''), nullif(p->>'explication',''), nullif(p->>'tag',''), nullif(p->>'ecole',''),
            nullif(p->>'source_livre',''), nullif(p->>'page',''), v_slug, v_rapporteur, v_ctype, v_cparole, v_chadith, v_cverset, v_livre)
    returning id into v_id;
  else
    update public.paroles set sujet=nullif(btrim(p->>'sujet'),''), rubrique=nullif(btrim(p->>'rubrique'),''), intro=nullif(btrim(p->>'intro'),''), savant=v_savant_nom, savant_id=v_savant_id,
      texte_arabe=btrim(p->>'texte_arabe'), texte_francais=nullif(p->>'texte_francais',''),
      "phonétique"=nullif(p->>'phonetique',''), explication=nullif(p->>'explication',''),
      tag=nullif(p->>'tag',''), ecole=nullif(p->>'ecole',''), source_livre=nullif(p->>'source_livre',''), page=nullif(p->>'page',''),
      rapporteur_savant_id=v_rapporteur, commente_type=v_ctype, commente_parole_id=v_cparole, commente_hadith_id=v_chadith, commente_verset_id=v_cverset, commente_livre=v_livre
    where id=v_id;
  end if;

  delete from public.parole_images where parole_id=v_id;
  for im in select * from jsonb_array_elements(coalesce(p->'images','[]'::jsonb)) loop
    if nullif(btrim(im->>'image_url'),'') is not null then
      insert into public.parole_images (parole_id, image_url, alt, legende, source_livre, source_livre_ar, ordre)
      values (v_id, btrim(im->>'image_url'), coalesce(nullif(btrim(im->>'alt'),''), 'Scan du livre'),
              nullif(im->>'legende',''), nullif(im->>'source_livre',''), nullif(btrim(im->>'source_livre_ar'),''), coalesce(nullif(im->>'ordre','')::int, 0));
    end if;
  end loop;

  if p ? 'segments' then
    delete from public.parole_segments where parole_id = v_id;
    insert into public.parole_segments (parole_id, ordre, intro, texte_arabe, phonetique, texte_francais, explication)
    select v_id, (e.ord)::int,
           nullif(btrim(e.val->>'intro'),''), nullif(btrim(e.val->>'texte_arabe'),''),
           nullif(btrim(e.val->>'phonetique'),''), nullif(btrim(e.val->>'texte_francais'),''),
           nullif(btrim(e.val->>'explication'),'')
    from jsonb_array_elements(coalesce(p->'segments','[]'::jsonb)) with ordinality as e(val, ord)
    where coalesce(btrim(e.val->>'texte_arabe'),'') <> '' or coalesce(btrim(e.val->>'texte_francais'),'') <> ''
          or coalesce(btrim(e.val->>'intro'),'') <> '' or coalesce(btrim(e.val->>'explication'),'') <> '';
  end if;

  delete from public.parole_themes where parole_id=v_id;
  insert into public.parole_themes (parole_id, theme_slug)
  select v_id, tt.theme_slug from unnest(string_to_array(coalesce(p->>'tag',''),',')) raw(tok)
  join public.theme_tags tt on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g')=regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
  where btrim(raw.tok)<>'' on conflict do nothing;

  return v_id;
end $function$;
