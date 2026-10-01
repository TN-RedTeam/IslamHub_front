-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Blocs « Preuve » à source facultative (saisie libre)                  ║
-- ║  À exécuter dans Supabase → SQL Editor (Run).                          ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1) Colonnes de saisie libre (si la source n'est pas en base).
alter table public.contenu_blocs
  add column if not exists libre_arabe text,
  add column if not exists libre_traduction text,
  add column if not exists libre_ref text;

-- 2) Admin : relire aussi les champs libres.
CREATE OR REPLACE FUNCTION public.admin_get_blocs(p_parent_type text, p_parent_id text)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  select coalesce(json_agg(json_build_object(
    'type', type, 'ordre', ordre, 'texte_md', texte_md,
    'citation_type', citation_type, 'citation_id', citation_id, 'commentaire_md', commentaire_md,
    'libre_arabe', libre_arabe, 'libre_traduction', libre_traduction, 'libre_ref', libre_ref)
    order by ordre, id), '[]'::json)
  from public.contenu_blocs where parent_type=p_parent_type and parent_id=p_parent_id;
$function$;

-- 3) Admin : enregistrer une preuve avec source OU saisie libre.
CREATE OR REPLACE FUNCTION public.admin_save_blocs(p jsonb)
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare pt text := p->>'parent_type'; pid text := p->>'parent_id'; el jsonb; v_ord int := 0; v_n int := 0;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if nullif(btrim(pt),'') is null or nullif(btrim(pid),'') is null then raise exception 'parent_type et parent_id requis.'; end if;

  delete from public.contenu_blocs where parent_type=pt and parent_id=pid;
  for el in select * from jsonb_array_elements(coalesce(p->'blocs','[]'::jsonb)) loop
    if el->>'type' in ('texte','commentaire','preuve') then
      if el->>'type'='preuve' then
        if el->>'citation_type' in ('verset','hadith','parole')
           and (nullif(el->>'citation_id','') is not null
                or nullif(btrim(el->>'libre_arabe'),'') is not null
                or nullif(btrim(el->>'libre_traduction'),'') is not null) then
          insert into public.contenu_blocs (parent_type,parent_id,ordre,type,citation_type,citation_id,commentaire_md,libre_arabe,libre_traduction,libre_ref)
          values (pt,pid,v_ord,'preuve',el->>'citation_type',
                  nullif(el->>'citation_id','')::bigint,
                  nullif(el->>'commentaire_md',''),
                  nullif(btrim(el->>'libre_arabe'),''),
                  nullif(btrim(el->>'libre_traduction'),''),
                  nullif(btrim(el->>'libre_ref'),''));
          v_ord:=v_ord+1; v_n:=v_n+1;
        end if;
      elsif nullif(btrim(el->>'texte_md'),'') is not null then
        insert into public.contenu_blocs (parent_type,parent_id,ordre,type,texte_md)
        values (pt,pid,v_ord,el->>'type',btrim(el->>'texte_md'));
        v_ord:=v_ord+1; v_n:=v_n+1;
      end if;
    end if;
  end loop;
  return v_n;
end $function$;

-- 4) Public : résoudre la preuve depuis la source, ou depuis la saisie libre.
CREATE OR REPLACE FUNCTION public.get_blocs(p_parent_type text, p_parent_id text)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  select coalesce(json_agg(row_to_json(b) order by b.ordre, b.id), '[]'::json) from (
    select cb.id, cb.type, cb.ordre,
      cb.texte_md,
      cb.citation_type, cb.commentaire_md,
      case cb.citation_type
        when 'hadith' then 'Hadiths' when 'parole' then 'Paroles des savants' when 'verset' then 'Coran' end as source_rubrique,
      case
        when cb.type <> 'preuve' then null
        when cb.citation_id is null then json_build_object(
             'libre', true, 'texte_arabe', cb.libre_arabe, 'texte_francais', cb.libre_traduction, 'ref', cb.libre_ref)
        else case cb.citation_type
          when 'hadith' then (select row_to_json(h) from (
               select x.id, x.sujet, x.slug, x.texte_arabe, x.texte_francais, x.phonetique as "phonétique",
                      x.degre_authenticite, public.recueils_for_hadith(x.id) as recueils
               from public.hadiths x where x.id = cb.citation_id) h)
          when 'parole' then (select row_to_json(p) from (
               select x.id, x.sujet, x.slug, coalesce(s.nom, x.savant) as savant, s.slug as savant_slug,
                      x.ecole, x.texte_arabe, x.texte_francais, x."phonétique" as "phonétique", x.explication
               from public.paroles x left join public.savants s on s.id = x.savant_id where x.id = cb.citation_id) p)
          when 'verset' then (select row_to_json(c) from (
               select x.id, x.sujet, x.sourate, x.texte_arabe, x.texte_francais, x.phonetique as "phonétique"
               from public.coran x where x.id = cb.citation_id) c)
        end
      end as ref
    from public.contenu_blocs cb
    where cb.parent_type = p_parent_type and cb.parent_id = p_parent_id
  ) b;
$function$;

-- 5) Assouplir la contrainte CHECK : une preuve accepte une source OU une
--    saisie libre (sinon elle exigeait citation_id).
alter table public.contenu_blocs drop constraint if exists contenu_blocs_preuve_chk;
alter table public.contenu_blocs add constraint contenu_blocs_preuve_chk check (
  type <> 'preuve'
  or (citation_type is not null and (citation_id is not null or libre_arabe is not null or libre_traduction is not null))
);
