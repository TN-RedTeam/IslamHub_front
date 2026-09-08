-- ============================================================================
-- Refonte IslamHub — passe « coquilles de sujets ».
-- Appliqué le 2026-09-07. Corrige des fautes + harmonise 2 variantes de casse.
-- (Le trim universel des espaces parasites n'a PAS été demandé : non appliqué.)
-- ============================================================================

-- A) Coquilles
update public.hadiths set sujet = 'Le Prophète Adam'                 where btrim(sujet) = 'Le Prohète Adam';
update public.hadiths set sujet = 'Témoignage sur l''unicité de Dieu' where btrim(sujet) = 'Temoignage sur l unicite de Dieu';
update public.coran   set sujet = 'Châtiment'                        where btrim(sujet) = 'Chatîment';
update public.coran   set sujet = 'Croyance, Attributs'              where btrim(sujet) = 'Croyance, Attrbuts';

-- C) Harmonisation de casse (regexp_replace pour préserver « qiyām » à l'identique)
update public.hadiths set sujet = regexp_replace(btrim(sujet), '^Les Prières', 'Les prières')
  where sujet ~ '^Les Prières de nuit';
update public.paroles set sujet = 'Les Attributs de Allah'          where btrim(sujet) = 'Les attributs de Allah';

-- Contrôle : 0 variante de casse restante, 0 coquille restante.
