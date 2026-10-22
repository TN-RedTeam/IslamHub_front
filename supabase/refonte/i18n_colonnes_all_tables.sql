-- ============================================================================
-- Modèle « colonnes par langue » — généralisation à toutes les tables
-- ============================================================================
-- 1) Ajoute les colonnes de traduction _en / _ar (prose seulement ; l'arabe
--    original reste unique ; traduction & phonétique = EN seul).
-- 2) Deux RPC GÉNÉRIQUES (liste blanche table→colonnes) pour lire/écrire les
--    traductions depuis l'admin, réutilisées par le composant <TranslationFields> :
--      admin_entry_i18n_get(p_table, p_id)         → json des colonnes i18n
--      admin_entry_i18n_set(p_table, p_id, p jsonb)→ update des colonnes permises
-- Les RPC de LECTURE publique (get_X / search_X) sont réécrites par ailleurs,
-- table par table. (exposes : clé = slug, traité séparément.)
-- NON DESTRUCTIF.
-- ============================================================================

-- 1) COLONNES ---------------------------------------------------------------
alter table public.hadiths
  add column if not exists sujet_en text, add column if not exists sujet_ar text,
  add column if not exists texte_en text, add column if not exists phonetique_en text,
  add column if not exists explication_en text, add column if not exists explication_ar text,
  add column if not exists intro_en text, add column if not exists intro_ar text,
  add column if not exists invocation_commentaire_en text, add column if not exists invocation_commentaire_ar text;

alter table public.coran
  add column if not exists sujet_en text, add column if not exists sujet_ar text,
  add column if not exists texte_en text, add column if not exists phonetique_en text,
  add column if not exists explication_en text, add column if not exists explication_ar text;

alter table public.versets_equivoques
  add column if not exists theme_en text, add column if not exists theme_ar text,
  add column if not exists verset_traduction_en text, add column if not exists verset_phonetique_en text,
  add column if not exists sens_juste_en text, add column if not exists sens_juste_ar text,
  add column if not exists objection_en text, add column if not exists objection_ar text,
  add column if not exists reponse_en text, add column if not exists reponse_ar text;

alter table public.dossiers
  add column if not exists h1_en text, add column if not exists h1_ar text,
  add column if not exists meta_title_en text, add column if not exists meta_title_ar text,
  add column if not exists meta_description_en text, add column if not exists meta_description_ar text,
  add column if not exists croyance_texte_en text, add column if not exists croyance_texte_ar text,
  add column if not exists objection_texte_en text, add column if not exists objection_texte_ar text,
  add column if not exists reponse_texte_en text, add column if not exists reponse_texte_ar text;

alter table public.recits
  add column if not exists titre_en text, add column if not exists titre_ar text,
  add column if not exists contenu_md_en text, add column if not exists contenu_md_ar text;

alter table public.fiqh
  add column if not exists chapitre_en text, add column if not exists chapitre_ar text,
  add column if not exists sujet_en text, add column if not exists sujet_ar text,
  add column if not exists texte_en text;

alter table public.femmes
  add column if not exists chapitre_en text, add column if not exists chapitre_ar text,
  add column if not exists section_titre_en text, add column if not exists section_titre_ar text,
  add column if not exists matn_en text,
  add column if not exists commentaire_en text, add column if not exists commentaire_ar text;

alter table public.invocations
  add column if not exists sujet_en text, add column if not exists sujet_ar text,
  add column if not exists texte_en text, add column if not exists phonetique_en text,
  add column if not exists explication_en text, add column if not exists explication_ar text,
  add column if not exists commentaire_en text, add column if not exists commentaire_ar text;

alter table public.savants
  add column if not exists biographie_en text, add column if not exists biographie_ar text,
  add column if not exists resume_en text, add column if not exists resume_ar text;

alter table public.sourates
  add column if not exists nom_en text, add column if not exists nom_ar text,
  add column if not exists introduction_md_en text, add column if not exists introduction_md_ar text;

-- 2) RPC GÉNÉRIQUES ---------------------------------------------------------
-- Registre (table, colonne autorisée) partagé par get & set.
create or replace function public._i18n_cols(p_table text)
 returns text[] language sql immutable set search_path to 'public' as $function$
  select array_agg(col) from (values
    ('hadiths','sujet_en'),('hadiths','sujet_ar'),('hadiths','texte_en'),('hadiths','phonetique_en'),
      ('hadiths','explication_en'),('hadiths','explication_ar'),('hadiths','intro_en'),('hadiths','intro_ar'),
      ('hadiths','invocation_commentaire_en'),('hadiths','invocation_commentaire_ar'),
    ('coran','sujet_en'),('coran','sujet_ar'),('coran','texte_en'),('coran','phonetique_en'),
      ('coran','explication_en'),('coran','explication_ar'),
    ('versets_equivoques','theme_en'),('versets_equivoques','theme_ar'),('versets_equivoques','verset_traduction_en'),
      ('versets_equivoques','verset_phonetique_en'),('versets_equivoques','sens_juste_en'),('versets_equivoques','sens_juste_ar'),
      ('versets_equivoques','objection_en'),('versets_equivoques','objection_ar'),('versets_equivoques','reponse_en'),('versets_equivoques','reponse_ar'),
    ('dossiers','h1_en'),('dossiers','h1_ar'),('dossiers','meta_title_en'),('dossiers','meta_title_ar'),
      ('dossiers','meta_description_en'),('dossiers','meta_description_ar'),('dossiers','croyance_texte_en'),('dossiers','croyance_texte_ar'),
      ('dossiers','objection_texte_en'),('dossiers','objection_texte_ar'),('dossiers','reponse_texte_en'),('dossiers','reponse_texte_ar'),
    ('recits','titre_en'),('recits','titre_ar'),('recits','contenu_md_en'),('recits','contenu_md_ar'),
    ('fiqh','chapitre_en'),('fiqh','chapitre_ar'),('fiqh','sujet_en'),('fiqh','sujet_ar'),('fiqh','texte_en'),
    ('femmes','chapitre_en'),('femmes','chapitre_ar'),('femmes','section_titre_en'),('femmes','section_titre_ar'),
      ('femmes','matn_en'),('femmes','commentaire_en'),('femmes','commentaire_ar'),
    ('invocations','sujet_en'),('invocations','sujet_ar'),('invocations','texte_en'),('invocations','phonetique_en'),
      ('invocations','explication_en'),('invocations','explication_ar'),('invocations','commentaire_en'),('invocations','commentaire_ar'),
    ('savants','biographie_en'),('savants','biographie_ar'),('savants','resume_en'),('savants','resume_ar'),
    ('sourates','nom_en'),('sourates','nom_ar'),('sourates','introduction_md_en'),('sourates','introduction_md_ar')
  ) as w(tbl,col) where w.tbl = p_table;
$function$;

create or replace function public.admin_entry_i18n_get(p_table text, p_id bigint)
 returns json language plpgsql security definer set search_path to 'public' as $function$
declare v_allowed text[]; v_cols text; v_json json;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  v_allowed := public._i18n_cols(p_table);
  if v_allowed is null then raise exception 'Table non prise en charge : %', p_table; end if;
  select string_agg(quote_ident(c), ', ') into v_cols from unnest(v_allowed) c;
  execute format('select to_json(t) from (select %s from public.%I where id=$1) t', v_cols, p_table) into v_json using p_id;
  return v_json;
end $function$;

create or replace function public.admin_entry_i18n_set(p_table text, p_id bigint, p jsonb)
 returns void language plpgsql security definer set search_path to 'public' as $function$
declare v_allowed text[]; r record;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  v_allowed := public._i18n_cols(p_table);
  if v_allowed is null then raise exception 'Table non prise en charge : %', p_table; end if;
  for r in select key, value from jsonb_each_text(p) loop
    if r.key = any(v_allowed) then
      execute format('update public.%I set %I = $1 where id = $2', p_table, r.key)
        using nullif(btrim(r.value), ''), p_id;
    end if;
  end loop;
end $function$;

grant execute on function public.admin_entry_i18n_get(text,bigint)        to authenticated;
grant execute on function public.admin_entry_i18n_set(text,bigint,jsonb)  to authenticated;

-- ---- PREUVE ----------------------------------------------------------------
select 'hadiths' t, array_length(public._i18n_cols('hadiths'),1) n
union all select 'dossiers', array_length(public._i18n_cols('dossiers'),1)
union all select 'versets_equivoques', array_length(public._i18n_cols('versets_equivoques'),1);
