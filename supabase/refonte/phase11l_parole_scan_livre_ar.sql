-- ============================================================================
-- Phase 11l — Scans de paroles : nom du livre en arabe (optionnel)
-- ============================================================================
-- Nouveau champ `source_livre_ar` sur chaque scan d'une parole, pour afficher
-- le nom de l'ouvrage en arabe sous le scan (fiche + plein écran).
--
-- Colonne + lectures (admin_get_parole / get_parole) : appliquées via le MCP.
-- Écriture admin_save_parole (SECURITY DEFINER) : expire via le MCP →
-- À EXÉCUTER MANUELLEMENT (dernière section). Idempotent.
-- ============================================================================

-- 1) Colonne  [déjà appliqué]
alter table public.parole_images add column if not exists source_livre_ar text;

-- 2) Lecture admin  [déjà appliqué]  (voir définition en base)
-- 3) Lecture publique get_parole  [déjà appliqué]  (voir définition en base)

-- ----------------------------------------------------------------------------
-- 4) ÉCRITURE — persiste source_livre_ar sur les scans. ⚠️ À EXÉCUTER MANUELLEMENT.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_save_parole(p jsonb)
 RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_savant_id bigint := nullif(p->>'savant_id','')::bigint;
  v_rapporteur bigint := nullif(p->>'rapporteur_savant_id','')::bigint;
  v_commente bigint := nullif(p->>'commente_parole_id','')::bigint;
  v_livre text := nullif(btrim(p->>'commente_livre'),'');
  v_savant_nom text; v_slug text; v_sslug text; im jsonb;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;

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
    insert into public.paroles (sujet, savant, savant_id, texte_arabe, texte_francais, "phonétique", explication, tag, ecole, source_livre, page, slug, rapporteur_savant_id, commente_parole_id, commente_livre)
    values (nullif(btrim(p->>'sujet'),''), v_savant_nom, v_savant_id, btrim(p->>'texte_arabe'), nullif(p->>'texte_francais',''),
            nullif(p->>'phonetique',''), nullif(p->>'explication',''), nullif(p->>'tag',''), nullif(p->>'ecole',''),
            nullif(p->>'source_livre',''), nullif(p->>'page',''), v_slug, v_rapporteur, v_commente, v_livre)
    returning id into v_id;
  else
    update public.paroles set sujet=nullif(btrim(p->>'sujet'),''), savant=v_savant_nom, savant_id=v_savant_id,
      texte_arabe=btrim(p->>'texte_arabe'), texte_francais=nullif(p->>'texte_francais',''),
      "phonétique"=nullif(p->>'phonetique',''), explication=nullif(p->>'explication',''),
      tag=nullif(p->>'tag',''), ecole=nullif(p->>'ecole',''), source_livre=nullif(p->>'source_livre',''), page=nullif(p->>'page',''),
      rapporteur_savant_id=v_rapporteur, commente_parole_id=v_commente, commente_livre=v_livre
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

  delete from public.parole_themes where parole_id=v_id;
  insert into public.parole_themes (parole_id, theme_slug)
  select v_id, tt.theme_slug from unnest(string_to_array(coalesce(p->>'tag',''),',')) raw(tok)
  join public.theme_tags tt on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g')=regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
  where btrim(raw.tok)<>'' on conflict do nothing;

  return v_id;
end $function$;
