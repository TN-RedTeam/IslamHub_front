# 📝 Cheatsheet — Rédaction de contenu (IslamHub)

Aide-mémoire pour ajouter du contenu **sans galérer** : arabe/français, listes, Markdown,
et les pièges courants. Deux contextes :

- **Dans les pages `.tsx`** (ex. `src/pages/ecoles/Hanbalite.tsx`) → tu écris du **JSX/HTML**.
- **Dans la base Supabase** (champs `explication`, `commentaire`, `biographie`, cours Femmes/fiqh…)
  → tu écris du **Markdown** (rendu par le composant `Markdown`).

---

## 1) Texte arabe

### En JSX (dans une page .tsx)
Toujours envelopper l'arabe avec `lang="ar" dir="rtl"`. Ça déclenche automatiquement :
**police Scheherazade + sens RTL + parenthèses coraniques ﴿ ﴾ bien placées + centrage**.

```tsx
{/* Verset / citation sur sa propre ligne (bloc) */}
<p lang="ar" dir="rtl" className="font-arabic text-2xl leading-loose">
  ﴿ لَيْسَ كَمِثْلِهِ شَيْءٌ ﴾
</p>

{/* Arabe AU MILIEU d'une phrase française (inline) */}
… il a dit{' '}
<span lang="ar" dir="rtl" className="font-arabic whitespace-nowrap">﴿ وَجَاءَ رَبُّكَ ﴾</span>{' '}
[wa jâ-a rabbouk] …
```

- `{' '}` = une **espace** propre autour du span (sinon les mots se collent).
- `whitespace-nowrap` = empêche l'arabe de **se couper** et passer à la ligne au milieu
  (à mettre sur les passages **courts** ; un long passage → mets-le **sur sa propre ligne**).

### En Markdown (champ Supabase ou composant Markdown)
Mets simplement l'arabe **sur sa propre ligne** → il est détecté et rendu **RTL + Scheherazade** tout seul :

```markdown
Il a interprété le verset :

﴿ وَجَاءَ رَبُّكَ ﴾

« wa jâ-a Rabbouka », ce qui signifie…
```

### Ponctuation des citations
- **Coran** → parenthèses coraniques **﴿ … ﴾**
- **Hadith / parole** → guillemets **« … »**

---

## 2) ⚠️ Le piège des accolades `{ }` en JSX

En JSX, `{ }` = **code JavaScript**. Donc `{وجاء ربك}` provoque l'erreur :
`[PARSE_ERROR] Expected } but found Identifier`.

| Je veux… | J'écris… |
|---|---|
| un verset coranique | `﴿ وجاء ربك ﴾` (parenthèses coraniques, pas `{ }`) |
| des accolades **littérales** `{` `}` comme texte | `{'{'}` et `{'}'}` |

> En **Markdown**, ce piège n'existe pas : `{ }` y est du texte normal.

---

## 3) Listes à puces / numérotées

⚠️ **Tailwind enlève les puces par défaut.** Il FAUT `list-disc` (puces) ou `list-decimal` (numéros) **+ `pl-6`**.

### En JSX
```tsx
{/* Puces */}
<ul className="list-disc pl-6 space-y-2 marker:text-emerald-500 mb-4">
  <li>Premier élément ;</li>
  <li>Deuxième élément ;</li>
  <li>Et d'autres qu'eux.</li>
</ul>

{/* Numérotée */}
<ol className="list-decimal pl-6 space-y-2 marker:text-emerald-500 mb-4">
  <li>Étape une ;</li>
  <li>Étape deux.</li>
</ol>
```
- `space-y-2` = espace entre les éléments.
- `marker:text-emerald-500` = couleur des puces/numéros.

### En Markdown
```markdown
Intro de la liste :

- premier élément
- deuxième élément
- et d'autres

1. étape une
2. étape deux
```
(laisse une **ligne vide** avant la liste, et écris les lignes **collées à gauche**.)

---

## 4) Markdown — mémo syntaxe

Le composant `Markdown` est utilisé pour : cours **Femmes**, points de **fiqh**, `explication` des
**paroles/hadiths**, **biographies** des savants. On peut aussi l'utiliser dans une page .tsx.

```tsx
import { Markdown } from '../../components/Markdown';   // ajuste le chemin

<Markdown>{`
## Titre de section

Un paragraphe. Laisse une **ligne vide** pour séparer les paragraphes.

- une puce
- une autre

> une citation

﴿ آية عربية ﴾   ← l'arabe sur sa propre ligne = RTL + Scheherazade auto
`}</Markdown>
```

| Élément | Syntaxe |
|---|---|
| Gras | `**texte**` |
| Italique | `*texte*` |
| Titres | `# H1` · `## H2` · `### H3` |
| Puces | `- élément` |
| Numéros | `1. élément` |
| Citation | `> texte` |
| Lien | `[texte](https://…)` |
| Séparateur | `---` (ligne seule) |
| Tableau | `\| a \| b \|` puis `\| --- \| --- \|` |
| Note de bas de page | `un mot[^1]` … puis en bas : `[^1]: l'explication` |

### Notes de bas de page (footnotes)
```markdown
Le tashahhoud est obligatoire[^1] selon l'école.

[^1]: Certains savants le considèrent comme une sounnah confirmée.
```
→ `[^1]` devient un **petit chiffre en exposant** ; l'explication s'affiche **en bas du bloc**.
La numérotation **repart à 1** dans chaque entrée : c'est normal, ne la « continue » pas.

### ⚠️ Pièges du template `` `...` `` (Markdown en JSX)
Dans `<Markdown>{`…`}</Markdown>`, évite dans le texte :
- les **backtick** `` ` `` (casse la chaîne → mets `'` ou « »),
- la suite **`${`** (interpolation JS),
- écris les lignes **collées à gauche** (4+ espaces = bloc de code).

---

## 5) Paragraphes & espacement (JSX)

```tsx
<p className="mb-4">Paragraphe courant…</p>       {/* mb-4 entre paragraphes */}
<p className="mb-6">…</p>                          {/* mb-6 pour séparer 2 sous-blocs */}
```
- Reste **cohérent** : `mb-4` par défaut, `mb-6` avant une citation/sous-section.
- Un simple retour à la ligne dans le code **ne crée pas** de saut visible → utilise des `<p>` séparés (JSX) ou une **ligne vide** (Markdown).

---

## 6) Polices du site

| Classe / attribut | Police | Usage |
|---|---|---|
| `lang="ar"` **ou** `className="font-arabic"` | **Scheherazade New** | tout texte **arabe** (RTL + centré auto) |
| `className="font-amiri"` | **Amiri** | **titres** en français |
| (par défaut) | **Inter** | texte courant |

> Ne mets **jamais** d'arabe dans un `font-amiri` **sans** `lang="ar"` : il s'afficherait dans la mauvaise police et les `﴿ ﴾` pourraient s'inverser.

---

## 7) Contenu dans Supabase (base de données)

- Champs **longs** (`explication`, `commentaire`, `biographie`, cours) = **Markdown** → sers-toi de la
  section 4 (gras, listes, `##`, arabe sur sa propre ligne, footnotes).
- **Paragraphes** = **ligne vide** entre les blocs (double retour à la ligne).
- **`id`** : ne le remplis **jamais** à la main (auto-incrément). Laisse le champ **vide**.
- **Paroles** : remplis **`savant_id`** (menu déroulant) → `savant` et `ecole` se remplissent **tout seuls**
  (et ça alimente le **badge école** + la page **/savants**).
- **Doublon d'arabe** bloqué à l'ajout ? C'est le `arabe_hash` : un texte arabe **identique** existe déjà.

---

## 8) Erreurs fréquentes → solution express

| Symptôme | Cause | Solution |
|---|---|---|
| `Expected } but found Identifier` | texte dans des `{ }` JSX | `﴿ ﴾` pour le Coran, ou `{'{'}` / `{'}'}` |
| Les **puces** n'apparaissent pas | Tailwind enlève les puces | `list-disc pl-6` sur le `<ul>` |
| Arabe dans la **mauvaise police** / `﴿ ﴾` inversées | pas de `lang="ar"` | ajoute `lang="ar" dir="rtl"` |
| Arabe **coupé** en 2 lignes | passage inline trop long | `whitespace-nowrap` (court) ou sur sa **propre ligne** (long) |
| `**gras**` s'affiche littéralement | texte rendu en brut, pas en Markdown | utilise le composant `Markdown` |
| « une erreur est survenue » sur une page | souvent un champ `null` mal géré | signale-le, c'est un correctif code |

---

_Astuce : garde ce fichier ouvert pendant que tu rédiges. Si tu tombes sur un cas non couvert, demande — on l'ajoutera ici._
