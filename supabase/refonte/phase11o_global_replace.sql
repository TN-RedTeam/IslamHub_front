-- ============================================================================
-- Phase 11o — « Remplacer partout » (harmonisation d'un mot / nom)
-- ============================================================================
-- Remplace un terme dans TOUT le site (textes déjà enregistrés inclus), pour
-- harmoniser une orthographe ou un nom (rapporteur / narrateur / savant…).
-- Ex. « Al-Bukhari » → « Al-Boukhariyy », « Allah » → « Allâh ».
--
-- • Sensible à la casse et aux accents (« Allah » ≠ « Allâh »).
-- • Liste BLANCHE de colonnes (texte latin + noms). Exclut volontairement :
--   texte arabe, slugs, hash, tags, colonnes de vocabulaire contrôlé.
-- • p_apply=false → prévisualisation (comptage par rubrique/champ, aucune
--   modification). p_apply=true → applique et renvoie le nb de fiches modifiées.
-- • p_whole_word=true (recommandé) → bornes de mot (\m \M), « Allah » ne touche
--   pas « Abdallah ». false → sous-chaîne brute.
--
-- Le remplacement des noms dénormalisés (hadiths.rapporteur/narrateur,
-- paroles.savant) est fait directement ici ; sync_hadith_refs ne régénère que
-- le statut, donc rien n'est écrasé. Les triggers search_fr se recalculent.
--
-- SECURITY DEFINER. Appliqué via le MCP. Testé : prévisualisation + application
-- (annulée) OK sur « Al-Bukhari » (101 fiches) et « Allah » (158 fiches).
-- ============================================================================
create or replace function public.admin_global_replace(p_find text, p_replace text, p_apply boolean default false, p_whole_word boolean default true)
 returns json language plpgsql security definer set search_path to 'public'
as $function$
declare
  r record; v_cnt bigint; v_total bigint := 0; v_results jsonb := '[]'::jsonb;
  v_esc text; v_pat text; v_cond text; v_set text; v_rep text := replace(coalesce(p_replace,''), '\', '\\');
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if coalesce(btrim(p_find),'') = '' then raise exception 'Le terme à remplacer est vide.'; end if;
  v_esc := regexp_replace(p_find, '([^[:alnum:][:space:]])', '\\\1', 'g');
  v_pat := '\m' || v_esc || '\M';

  for r in select * from (values
    ('hadiths','sujet'),('hadiths','intro'),('hadiths','texte_francais'),('hadiths','phonetique'),('hadiths','explication'),('hadiths','rapporteur'),('hadiths','narrateur'),('hadiths','juge_par'),('hadiths','rubrique'),
    ('hadith_segments','intro'),('hadith_segments','phonetique'),('hadith_segments','texte_francais'),('hadith_segments','explication'),
    ('hadith_variants','intro'),('hadith_variants','phonetique'),('hadith_variants','texte_francais'),('hadith_variants','explication'),('hadith_variants','source'),
    ('paroles','sujet'),('paroles','savant'),('paroles','texte_francais'),('paroles','phonétique'),('paroles','explication'),('paroles','source_livre'),('paroles','commente_livre'),
    ('parole_images','legende'),('parole_images','alt'),('parole_images','source_livre'),
    ('savants','nom'),('savants','biographie'),('savants','resume'),('savants','naissance'),('savants','deces'),
    ('narrateurs','nom'),('recueils','titre'),
    ('coran','sujet'),('coran','texte_francais'),('coran','phonetique'),
    ('invocations','sujet'),('invocations','texte_francais'),('invocations','phonetique'),('invocations','commentaire'),
    ('fiqh','sujet'),('fiqh','chapitre'),('fiqh','texte'),
    ('themes','nom'),
    ('dossiers','h1'),('dossiers','meta_title'),('dossiers','meta_description'),('dossiers','croyance_texte'),('dossiers','objection_texte'),('dossiers','reponse_texte'),
    ('exposes','titre'),('exposes','contenu_md'),('exposes','verset_traduction'),('exposes','verset_phonetique'),('exposes','verset_ref'),
    ('versets_equivoques','theme'),('versets_equivoques','verset_traduction'),('versets_equivoques','verset_phonetique'),('versets_equivoques','sens_juste'),('versets_equivoques','objection'),('versets_equivoques','reponse'),('versets_equivoques','rapporteur'),('versets_equivoques','recueil'),
    ('recits','titre'),('recits','contenu_md'),
    ('contenu_blocs','texte_md'),('contenu_blocs','commentaire_md'),('contenu_blocs','libre_traduction'),('contenu_blocs','libre_ref'),
    ('expose_citations','signification'),('expose_citations','ref'),('expose_citations','phonetique'),
    ('attribut_citations','signification'),('attribut_citations','ref'),('attribut_citations','phonetique'),
    ('attributs','nom'),('attributs','gloss'),('attributs','explication'),
    ('femmes','chapitre'),('femmes','matn'),('femmes','commentaire'),('femmes','source')
  ) as t(tbl, col) loop
    if p_whole_word then
      v_cond := format('%I ~ %L', r.col, v_pat);
      v_set  := format('%I = regexp_replace(%I, %L, %L, %L)', r.col, r.col, v_pat, v_rep, 'g');
    else
      v_cond := format('position(%L in %I) > 0', p_find, r.col);
      v_set  := format('%I = replace(%I, %L, %L)', r.col, r.col, p_find, p_replace);
    end if;
    if p_apply then
      execute format('update public.%I set %s where %s', r.tbl, v_set, v_cond);
      get diagnostics v_cnt = row_count;
    else
      execute format('select count(*) from public.%I where %s', r.tbl, v_cond) into v_cnt;
    end if;
    if v_cnt > 0 then
      v_results := v_results || jsonb_build_object('rubrique', r.tbl, 'champ', r.col, 'fiches', v_cnt);
      v_total := v_total + v_cnt;
    end if;
  end loop;

  return json_build_object('applied', p_apply, 'whole_word', p_whole_word, 'find', p_find, 'replace', p_replace, 'total', v_total, 'details', v_results);
end $function$;
