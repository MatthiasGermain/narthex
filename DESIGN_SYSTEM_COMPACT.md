# Spotlight — Design System (condensé)

> Charte graphique de référence du site Spotlight / Narthex.

---

## 1. Couleurs

| Nom            | Hex       | Usage                                        |
|----------------|-----------|----------------------------------------------|
| **Raisin**     | `#1e2952` | Primaire sombre — texte, fonds sombres       |
| **Indigo**     | `#8B80F9` | Accent — labels, focus states                |
| **Violet**     | `#c9a0dc` | Secondaire — fonds de section, décorations   |
| **Sunglow**    | `#FCCA46` | Accent doré — soulignés, CTA, highlights     |
| **Cyan**       | `#628f93` | Vert-bleu — fonds de section, overlays       |
| **Isabelline** | `#EEE7E8` | Neutre — bordures d'inputs                   |
| **Cream**      | `#f4f0ec` | Fond principal — blanc cassé chaud           |
| **White**      | `#FFFFFF` | Blanc pur                                    |

Dérivées : `#f8f4f0` / `#ede7e0` / `#e4ddd5` (polaroid), `#1E1E24` (texte body).

**Associations fond / section :**
Hero, Histoire → Cream · About, Footer → Violet · Témoignages, Banner → Raisin · Services → Sunglow · Manifeste → Cyan · Formulaires → Cream

**⚠ Règle absolue : aucun fond blanc (`bg-white`, `#FFFFFF`) sur les pages publiques.**
Utiliser `bg-cream`, `bg-cream/50`, `bg-violet/10`, `bg-raisin`, etc. Le blanc pur est trop froid et décalé par rapport au thème chaleureux Spotlight.

---

## 2. Typographie

| Police               | Variable CSS        | Usage                        |
|----------------------|---------------------|------------------------------|
| **Avenir LT Std**    | `--font-avenir`     | Titres (h1-h6), menu         |
| **Montserrat**       | `--font-montserrat` | Corps, boutons, navigation   |
| **Brittany Signature** | `--font-brittany` | Accents cursifs décoratifs   |

**Graisses** — Avenir : 300-900 · Montserrat : 300-800

**Échelle responsive :**

| Élément        | Mobile     | Desktop          | Police     | Graisse |
|----------------|------------|------------------|------------|---------|
| Hero H1        | `text-5xl` | `text-7xl`–`8xl` | Avenir     | 900     |
| Section H2     | `text-2xl` | `text-5xl`       | Avenir     | 900     |
| Corps large    | `text-base`| `text-xl`        | Montserrat | 400     |
| Corps standard | `text-sm`  | `text-lg`        | Montserrat | 400     |
| Navigation     | `text-sm`  | 13-14px          | Montserrat | 500     |

**Style** — Titres : uppercase, `tracking-wide`, `leading-snug` · Corps : casse normale, `leading-relaxed`

---

## 3. Animations

**Philosophie** : fluide et organique, spring physics (Framer Motion), jamais brusque.

**Easing signature** : `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — partout.

**Animation signature — Souligné animé (AnimatedUnderlineText) :**
- `background-size` de 0% → 100%, durée 1s, ease-out
- Épaisseur 0.35em, couleur Sunglow, déclenché au scroll
- Variante Hero : `scaleX(0→1)`, 700ms

**Animations CSS :**
- `fadeInSlideDown` : glisse du haut + fade, 0.4s
- `slideUp` : glisse du bas + fade, 0.35s
- `popIn` : scale 0.95→1 + fade, 0.35s

**Spring configs (Framer Motion) :**
- Standard : stiffness 300, damping 25
- Hover cards : stiffness 120, damping 16
- Slide entrée : stiffness 100, damping 20

**Texte gradient animé (Manifeste) :**
`linear-gradient(to right, #FCCA46, #c9a0dc, #f4f0ec, #FCCA46)` — pan 6s infini, `background-clip: text`

---

## 4. Composants UI

### Boutons
Style : **outline arrondi** (`rounded-full`, `border-2`) — jamais plein au repos, inversion au hover.

| Variante | Bordure/Texte | Hover                      | Contexte         |
|----------|---------------|----------------------------|------------------|
| Sunglow  | `#FCCA46`     | Fond sunglow, texte cream  | Fonds clairs     |
| Violet   | `#c9a0dc`     | Fond violet, texte blanc   | Fonds clairs     |
| Raisin   | `#1e2952`     | Fond raisin, texte sunglow | Fond sunglow     |
| White    | `#FFF`        | Fond blanc, texte raisin   | Fonds sombres    |

Tailles : `sm` (px-4 py-2) · `md` (px-6 py-2.5) · `lg` (px-8 py-3) · Transition : `duration-200`

### Formulaires
Bordure `isabelline` · Fond blanc · `rounded-md` · Focus : ring `indigo` · Erreur : ring `red-500` · Labels : `text-sm font-medium text-indigo` · Placeholder : `raisin/50`

### Cartes Équipe
Ratio 4/5 · Image plein cadre · Overlay cyan 90% au hover (glisse du bas) · Texte blanc · 300ms

### Cartes Polaroid
Fond gradient 165° (cream) · Ombre douce · Hover : spread, scale 1.05, élévation · Spring 120/16

---

## 5. Header & Navigation

**État initial** : pleine largeur, logo 240px, nav `text-sm` tracking 0.05em

**État compact (scroll > 50px, desktop)** :
- `rounded-full`, glassmorphism (`blur(20px) saturate(180%)`)
- Fond gradient semi-transparent, ombre `rgba(30,41,82,0.15)`
- Logo réduit 48px (icône seul)
- Transition 600ms

**Page active** : barre sunglow 2px sous le lien, animée 300ms

**Menu mobile** : 3 panneaux colorés (indigo → violet → cream) en stagger depuis la droite, backdrop blur, items numérotés (01, 02…), liens sociaux en bas

---

## 6. Éléments décoratifs

- **Cercles rayés (Zebra)** : SVG, rayures horizontales, coins de sections
- **Light leaks** : gradients sunglow/orange, `mix-blend-screen`, opacité 30%

---

## 7. Responsive

**Approche** : Mobile First · Breakpoints : `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536
**Conteneur** : `max-w-7xl` (1280px), `mx-auto`, padding `px-4 sm:px-6 lg:px-8`

---

## 8. Z-index

z-70 toggle menu · z-60 couches menu · z-55 backdrop · z-50 header · z-30 overlays cartes · z-10 contenu · z-0 fonds

---

## 9. Identité en 10 points

1. **Souligné animé Sunglow** — signature visuelle principale
2. **Fond cream chaud** `#f4f0ec` — ni blanc froid ni beige
3. **Avenir Black uppercase** — impact des titres
4. **Animations spring douces** — mouvement naturel
5. **Easing signature** `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
6. **Boutons outline arrondis** — inversion au hover
7. **Glassmorphism header** — blur + transparence au scroll
8. **Cercles décoratifs rayés** — touche graphique unique
9. **Gradient texte animé** — sunglow/violet/cream en boucle
10. **Menu à panneaux staggerés** — entrée cinématographique

**Mots-clés** : Chaleureux · Organique · Raffiné · Joyeux · Professionnel
