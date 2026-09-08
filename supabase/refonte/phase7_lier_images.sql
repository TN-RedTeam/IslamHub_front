-- ============================================================================
-- Refonte IslamHub — Phase 7 : lier des images (Storage) à un dossier.
-- Prérequis : bucket « references » (créé) + images .webp uploadées dedans.
--
-- Flux : 1) node scripts/optimize-images.mjs public/img  → génère les .webp
--        2) Supabase → Storage → bucket « references » → upload les .webp
--        3) exécute ce fichier (adapte les noms de fichiers si besoin).
-- URL publique = <projet>.supabase.co/storage/v1/object/public/references/<fichier>
-- ============================================================================

insert into public.dossier_images (dossier_id, image_url, alt, legende, source_livre, ordre)
select d.id, v.url, v.alt, v.legende, v.source, v.ordre
from (select id from public.dossiers where slug = 'le-sens-de-l-istiwa') d,
     (values
       ('https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/al-baghdadiyy.webp',
        'Page 1 du livre Al-Farqou bayna l-firaq (Abou Mansour Al-Baghdadiyy)',
        'Extrait sur l''exemption de l''endroit — page 1',
        'Al-Farqou bayna l-firaq — Abou Mansour Al-Baghdadiyy', 1),
       ('https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/al-baghdadiyy2.webp',
        'Page 2 du livre Al-Farqou bayna l-firaq (Abou Mansour Al-Baghdadiyy)',
        'Extrait sur l''exemption de l''endroit — page 2',
        'Al-Farqou bayna l-firaq — Abou Mansour Al-Baghdadiyy', 2)
     ) v(url, alt, legende, source, ordre)
where not exists (select 1 from public.dossier_images di where di.dossier_id = d.id);

-- Vérif : select * from public.dossier_images di
--   join public.dossiers d on d.id=di.dossier_id where d.slug='le-sens-de-l-istiwa';
