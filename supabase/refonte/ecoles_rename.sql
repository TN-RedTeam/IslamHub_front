-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Uniformisation des NOMS d'écoles (affichage) :                        ║
-- ║   hanafite · malikite · chaféite · hanbalite                           ║
-- ║  (les slugs/routes et fiqh.ecole = clés internes, NON modifiés)        ║
-- ║  À exécuter dans Supabase → SQL Editor (Run).                          ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- 1) Table des écoles (nom affiché)
update public.ecoles set nom = 'hanafite'  where nom ilike 'hanaf%';
update public.ecoles set nom = 'malikite'  where nom ilike 'malik%';
update public.ecoles set nom = 'chaféite'  where nom ilike 'shafi%' or nom ilike 'chaf%' or nom ilike 'ach-chaf%';
update public.ecoles set nom = 'hanbalite' where nom ilike 'hanbal%';

-- 2) Colonne ecole des paroles (affichée via le badge « École … »)
update public.paroles set ecole = 'hanafite'  where ecole ilike 'hanaf%';
update public.paroles set ecole = 'malikite'  where ecole ilike 'malik%';
update public.paroles set ecole = 'chaféite'  where ecole ilike 'shafi%' or ecole ilike 'chaf%' or ecole ilike 'ach-chaf%';
update public.paroles set ecole = 'hanbalite' where ecole ilike 'hanbal%';

-- 3) Suffixe « - ecole X » dans les sujets fiqh → « — <nouveau nom> »
-- (NB: en regex Postgres, \b = backspace ; on borne avec [^ ]* à la place.)
update public.fiqh set sujet = btrim(regexp_replace(sujet, '\s*[-–—]?\s*ecole\s+hanafi[^ ]*',    ' — hanafite',  'gi')) where sujet ~* 'ecole\s+hanafi';
update public.fiqh set sujet = btrim(regexp_replace(sujet, '\s*[-–—]?\s*ecole\s+malik[^ ]*',     ' — malikite',  'gi')) where sujet ~* 'ecole\s+malik';
update public.fiqh set sujet = btrim(regexp_replace(sujet, '\s*[-–—]?\s*ecole\s+(shafi|chaf)[^ ]*', ' — chaféite',  'gi')) where sujet ~* 'ecole\s+(shafi|chaf)';
update public.fiqh set sujet = btrim(regexp_replace(sujet, '\s*[-–—]?\s*ecole\s+hanbal[^ ]*',    ' — hanbalite', 'gi')) where sujet ~* 'ecole\s+hanbal';
