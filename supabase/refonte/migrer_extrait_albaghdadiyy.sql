-- Extrait migré depuis src/_legacy (Al-Baghdadiyy.tsx) — hadith adh-Dhahir/al-Batin.
-- Généré par script (l'arabe provient du fichier source, non retapé).
-- À exécuter dans Supabase → SQL Editor. Puis (optionnel) lier au dossier istiwa.
insert into public.paroles (sujet, savant, texte_arabe, texte_francais, "phonétique", explication, tag)
values (
  $s$L'exemption de l'endroit (adh-Dhahir / al-Batin)$s$,
  $sv$Abou Mansour Al-Baghdadiyy$sv$,
  $ar$أَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَىْءٌ وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَىْءٌ$ar$,
  $fr$Al-Bayhaqiyy a dit : "Certains de nos compagnons ont pris pour argument concernant l'exemption de l'endroit au sujet de Allah, la parole du Prophète salla l-Lahou ^alayhi wa sallam :" ce qui signifie : "Tu es Adh-Dhahir, rien n'est au dessus de Toi ; et Tu es Al-Batin, rien n'est en dessous de Toi". Et s'il n'y a rien au-dessus de Lui et rien au-dessous de Lui, Il n'est donc pas dans un endroit." Fin de citation.$fr$,
  $ph$('anta dh-dhahirou falayça fawqaka chay' ; wa 'anta l-batinou falayça dounaka chay')$ph$,
  $ex$Source : « Al-Farqou bayna l-firaq » — Abou Mansour Al-Baghdadiyy.$ex$,
  $tg$exemption, attributs, croyance, tanzih$tg$
)
on conflict (arabe_hash) do nothing
returning id, sujet, savant;

-- Pour le lier comme preuve au dossier istiwa (remplace :PID par l'id ci-dessus) :
-- insert into public.dossier_preuves (dossier_id, type, ref_id, ordre)
-- select d.id, 'parole', :PID, 4 from public.dossiers d where d.slug='le-sens-de-l-istiwa';
