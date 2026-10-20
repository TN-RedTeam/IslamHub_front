-- ============================================================================
-- « Questions fréquentes » — sous-partie 4 : seed de démarrage
-- ============================================================================
-- Amorce la rubrique :
--   • 1 question PUBLIÉE complète (« Où est Allah ? ») avec réponse courte +
--     développement sourcé (blocs composables : texte / preuve en saisie libre
--     ﴿﴾ «…» / commentaire) + maillage thème & dossier (si présents).
--   • 6 questions BROUILLON (publiee=false) prêtes à être rédigées en admin.
-- Idempotent (ON CONFLICT (slug) ; blocs purgés avant réinsertion).
-- Gouvernance : uniquement du sourcé, aucune figure nommée. L'auteur ajuste /
-- complète ensuite via l'admin. À exécuter après questions_01 + questions_02.
-- ============================================================================

-- 1) La question publiée de démonstration -----------------------------------
insert into public.questions (question, slug, reponse_courte, variantes, publiee, ordre, locale)
values (
  'Où est Allah ?',
  'ou-est-allah',
  'Allah est au-dessus de Sa création, élevé au-dessus du Trône (al-istiwāʾ), comme l’affirment le Coran et la Sunna. Il est distinct de Sa création — « Rien ne Lui est semblable » (42:11) — et l’on affirme Son élévation sans Lui prêter lieu, limite ou ressemblance avec les créatures.',
  array['Allah est-il au ciel ?','Allah est-il partout ?','Où se trouve Allah ?','Allah est-il au-dessus du Trône ?'],
  true,
  1,
  'fr'
)
on conflict (slug) do update
  set question = excluded.question,
      reponse_courte = excluded.reponse_courte,
      variantes = excluded.variantes,
      publiee = excluded.publiee,
      ordre = excluded.ordre;

-- 2) Développement sourcé (blocs composables, parent_type='question') --------
delete from public.contenu_blocs
 where parent_type = 'question'
   and parent_id = (select id::text from public.questions where slug = 'ou-est-allah');

insert into public.contenu_blocs (parent_type, parent_id, ordre, type, texte_md)
select 'question', q.id::text, 0, 'texte',
  'La question « où est Allah ? » est légitime : le Prophète ﷺ l’a lui-même posée. La réponse des textes est claire et douce : Allah est **au-dessus** de Sa création, sans que cela implique un lieu, une direction ou une limite à la manière des créatures.'
from public.questions q where q.slug = 'ou-est-allah';

insert into public.contenu_blocs (parent_type, parent_id, ordre, type, citation_type, libre_arabe, libre_traduction, libre_ref)
select 'question', q.id::text, 1, 'preuve', 'verset',
  '﴿أَأَمِنتُم مَّن فِي السَّمَاءِ أَن يَخْسِفَ بِكُمُ الْأَرْضَ فَإِذَا هِيَ تَمُورُ﴾',
  '« Êtes-vous à l’abri que Celui qui est au ciel vous enfouisse en la terre ? Et voici qu’elle tremble ! »',
  'Coran, sourate Al-Mulk (67), v. 16'
from public.questions q where q.slug = 'ou-est-allah';

insert into public.contenu_blocs (parent_type, parent_id, ordre, type, citation_type, libre_arabe, libre_traduction, libre_ref)
select 'question', q.id::text, 2, 'preuve', 'hadith',
  'قَالَ لَهَا رَسُولُ اللَّهِ ﷺ: «أَيْنَ اللَّهُ؟» قَالَتْ: فِي السَّمَاءِ. قَالَ: «مَنْ أَنَا؟» قَالَتْ: أَنْتَ رَسُولُ اللَّهِ. قَالَ: «أَعْتِقْهَا فَإِنَّهَا مُؤْمِنَةٌ»',
  '« Où est Allah ? » — Elle répondit : « Au ciel (fī as-samāʾ). » Il dit : « Qui suis-je ? » — « Tu es le Messager d’Allah. » Il dit : « Affranchis-la, car elle est croyante. »',
  'Rapporté par Muslim'
from public.questions q where q.slug = 'ou-est-allah';

insert into public.contenu_blocs (parent_type, parent_id, ordre, type, texte_md)
select 'question', q.id::text, 3, 'commentaire',
  'On affirme donc l’élévation d’Allah (al-ʿuluww) telle que les textes l’énoncent, sans chercher à en décrire la modalité (« comment ») et sans assimilation à Sa création, car ﴿لَيْسَ كَمِثْلِهِ شَيْءٌ﴾ « Rien ne Lui est semblable » (42:11).'
from public.questions q where q.slug = 'ou-est-allah';

-- 3) Maillage (si un thème « croyance » / un dossier publié existe) ----------
insert into public.question_themes (question_id, theme_slug)
select q.id, t.slug
from public.questions q, public.themes t
where q.slug = 'ou-est-allah' and t.famille = 'croyance'
order by t.ordre, t.slug
limit 1
on conflict do nothing;

insert into public.question_dossiers (question_id, dossier_id, ordre)
select q.id, d.id, 0
from public.questions q, public.dossiers d
where q.slug = 'ou-est-allah' and d.published
order by d.id
limit 1
on conflict do nothing;

-- 4) Questions à fort trafic — BROUILLONS (publiee=false) --------------------
insert into public.questions (question, slug, reponse_courte, publiee, ordre, locale) values
  ('Allah est-il partout / dans Sa création ?', 'allah-est-il-partout', null, false, 2, 'fr'),
  ('Que signifie l’istiwāʾ ʿalā-l-ʿarsh ?',      'istiwa-ala-l-arsh',    null, false, 3, 'fr'),
  ('Verra-t-on Allah au Paradis ?',              'voir-allah-au-paradis',null, false, 4, 'fr'),
  ('Allah a-t-il une forme / un corps ?',        'allah-a-t-il-une-forme',null,false, 5, 'fr'),
  ('Comment comprendre les versets et hadiths équivoques ?', 'comprendre-versets-equivoques', null, false, 6, 'fr'),
  ('Doit-on interpréter (taʾwīl) ou s’abstenir (tafwīḍ) ?',   'tawil-ou-tafwid',               null, false, 7, 'fr')
on conflict (slug) do nothing;

-- ---- PREUVE : 1 publiée (avec ses blocs) + 6 brouillons --------------------
select
  (select count(*) from public.questions where publiee)        as publiees,
  (select count(*) from public.questions where not publiee)    as brouillons,
  (select count(*) from public.contenu_blocs
     where parent_type='question'
       and parent_id=(select id::text from public.questions where slug='ou-est-allah')) as blocs_demo;
