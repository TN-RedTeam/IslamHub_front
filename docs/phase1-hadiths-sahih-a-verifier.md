# Phase 1.4 — Hadiths « Sahih » à justifier (rapport, aucune modification)

**Règle appliquée** (issue du plan de refonte) : si le rapporteur est
**Al-Bukhari** ou **Muslim**, l'authenticité *Sahih* découle du recueil. Pour
**tous les autres** recueils/savants, un *Sahih* doit être justifié par un
**`juge_par`** explicite (le muhaddith qui a authentifié).

Ci-dessous : les **59 hadiths** actuellement marqués `degre_authenticite = 'Sahih'`
dont le rapporteur n'inclut ni Bukhari ni Muslim et qui n'ont **pas** de juge.
À **relire** : soit renseigner `juge_par` (et garder Sahih), soit ajuster le degré.

> Rien n'a été modifié. Les colonnes `statut`/`statut_id` d'origine sont intactes,
> et `hadiths_backup_phase1` contient une copie complète d'avant migration.

## Par rapporteur

### (rapporteur vide)
- **128** — Les Anges

### Abou Dawoud (seul)
- **24** — Le Châtiment de la tombe
- **55** — Les signes de la fin du monde
- **97** — Utilisation du douff
- **154** — Le Discours du Contrat de Mariage

### Abou Dawoud (+ autres Sunan/Musnad)
- **71** — La Récitation du Qour'an sur les morts · *Abou Dawoud, Ahmad Ibn Hanbal, Al-Hâkim, An-Nasa'i, Ibn Hibban, Ibn Majah*
- **106** — Porter un ḥirz ou ḥijāb · *Abou Dawoud, Ahmad Ibn Hanbal, At-Tirmidhi*
- **81** — L'importance des Invocations · *Abou Dawoud, Ahmad Ibn Hanbal, At-Tirmidhi, Ibn Hibban, Ibn Majah*
- **109** — Délaisser la Prière · *Abou Dawoud, Al-Bayhaqi, An-Nasa'i, Ibn Majah, Imam Malik*
- **131** — Les petits signes du jour du jugement · *Abou Dawoud, Al-Hakim, At-Tirmidhi, Ibn Hibban*
- **115** — L'interdiction des jeux de hasard · *Abou Dawoud, Ibn Majah*

### Ahmad Ibn Hanbal
- **52** — Commémorer le Mawlid · *Ahmad Ibn Hanbal*
- **137** — Faire miséricorde au plus jeune… · *Ahmad Ibn Hanbal, Al-Hâkim, At-Tabarani*
- **121** — Ordonner le Bien et Interdire le Mal · *Ahmad Ibn Hanbal, Al-Hâkim, At-Tirmidhi*
- **70** — La bonne innovation · *Ahmad Ibn Hanbal, An-Nasa'i, At-Tirmidhi, Ibn Majah*
- **101** — L'invocation en faveur du Prophète · *Ahmad Ibn Hanbal, An-Nasa'i, Hāfiḍh As-Sakhāwiyy*
- **38** — Comment faire les Ablutions · *Ahmad Ibn Hanbal, An-Nasa'i, Ibn Hibban, Ibn Majah*
- **15** — La mécréance par la parole · *Ahmad Ibn Hanbal, At-Tirmidhi, Ibn Hibban*

### Al-Bayhaqi
- **16** — L'Exemption de Allah · *Al-Bayhaqi*
- **32** — Apprendre la Science de la Religion · *Al-Bayhaqi*
- **73** — La visite des tombes · *Al-Bayhaqi*
- **91** — Serrer la main à une femme ’ajnabiyyah · *Al-Bayhaqi, At-Tabarani*
- **155** — Le Mariage · *Al-Bayhaqi, At-Tirmidhi*
- **62** — Hadith de an-nouzoul au jour de ^Arafah · *Al-Bayhaqi, Ibn Hibban*

### Al-Hakim
- **111** — La détermination des temps des prières · *Al-Hakim*
- **141** — Conseil pour la Bonne Vie de Couple · *Al-Hâkim, An-Nasa'i*

### An-Nasa'i
- **36** — Comment faire les Ablutions · *An-Nasa'i*
- **113** — Le mérite de l'invocation en faveur du Prophète · *An-Nasa'i*
- **23** — Le Châtiment de la tombe · *An-Nasa'i, At-Tabarani*

### At-Tabarani
- **53** — Suivre la voie du Prophète
- **54** — Sens Figuré dans le ḥadīth et le Qour'ân
- **108** — Les Invocation lors des assemblées de science
- **129** — Apprendre la Science de la Religion
- **135** — La demande de pardon ('istighfar)

### At-Tirmidhi (seul)
- **18** — Le Supplice et la Félicité de la Tombe
- **20** — L'état dans sa tombe
- **21** — Le Supplice et la Félicité de la Tombe
- **22** — Le Châtiment de la tombe
- **29** — Apprendre la Science de la Religion
- **30** — La bonne intention à elle seule ne suffit pas
- **35** — Faire le bien
- **47** — Interdiction d'aider aux péchés
- **98** — Le Prohète Adam
- **99** — Les caractéristiques des Prophètes
- **103** — Demander à Allah en priorité
- **112** — Remercier son frère pour un bienfait
- **122** — Le danger de l'insouciance
- **138** — Conseil pour la Bonne Vie de Couple

### At-Tirmidhi (+ autres)
- **114** — Le mérite de l'invocation en faveur du Prophète · *At-Tirmidhi, Ibn Hibban*
- **150** — Conseil pour la Bonne Vie de Couple · *At-Tirmidhi, Ibn Majah*
- **45** — La Parole des Prophètes · *At-Tirmidhi, Imam Malik*

### Ibn Hibban
- **17** — La méditation sur la création
- **31** — La bonne intention à elle seule ne suffit pas
- **87** — L'eau, première des créatures
- **148** — Conseil pour la Bonne Vie de Couple
- **149** — Conseil pour la Bonne Vie de Couple

### Savants (pas un recueil de hadith — à justifier avec soin)
- **126** — Le Prophète au sujet de Jibril · *Imam Al-Qourṭoubiyy*
- **123** — Donner un avis sans science · *Imam As-Souyoutiyy*
- **50** — La Meilleure parole · *Imam Malik*

---

**Total : 59 hadiths.** Quand tu auras tranché, deux façons de renseigner le juge :
```sql
-- Exemple : garder Sahih en justifiant le juge
update public.hadiths set juge_par = 'Al-Bayhaqi' where id = 16;
-- Exemple : ajuster le degré
update public.hadiths set degre_authenticite = 'Hassan' where id = 52;
```
