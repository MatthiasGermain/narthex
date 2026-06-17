# Spotlight - Charte Graphique & Design System

> Document de reference de l'identite visuelle du site Spotlight.
> Objectif : capturer l'ADN graphique du site pour pouvoir le transferer, le reproduire ou le faire evoluer.

---

## 1. Palette de couleurs

### Couleurs principales

| Nom          | Hex       | Usage                                                    |
|--------------|-----------|----------------------------------------------------------|
| **Raisin**   | `#1e2952` | Couleur primaire sombre - texte, fonds sombres           |
| **Indigo**   | `#8B80F9` | Accent violet/bleu - labels de formulaire, focus states  |
| **Violet**   | `#c9a0dc` | Accent secondaire - fonds de section, decorations        |
| **Sunglow**  | `#FCCA46` | Accent dore/jaune - soulignements, CTA, highlights       |
| **Cyan**     | `#628f93` | Vert-bleu - fonds de section, overlays equipe            |
| **Isabelline** | `#EEE7E8` | Gris clair neutre - bordures d'inputs                  |
| **Cream**    | `#f4f0ec` | Fond principal du site - blanc casse chaud               |
| **White**    | `#FFFFFF` | Blanc pur                                                |

### Couleurs derivees

| Hex       | Usage                                      |
|-----------|--------------------------------------------|
| `#f8f4f0` | Variante claire du cream (cartes polaroid) |
| `#ede7e0` | Demi-ton polaroid                          |
| `#e4ddd5` | Ton sombre polaroid                        |
| `#8b6db5` | Variante violette (fleches SVG)            |
| `#1E1E24` | Foreground par defaut (texte body)         |

### Associations fond / section

| Section             | Couleur de fond     |
|---------------------|---------------------|
| Hero, Histoire      | Cream `#f4f0ec`     |
| About, Footer       | Violet `#c9a0dc`    |
| Temoignages, Banner | Raisin `#1e2952`    |
| Services            | Sunglow `#FCCA46`   |
| Imagine, Manifeste  | Cyan `#628f93`      |
| Formulaire contact  | Cream `#f4f0ec`     |

---

## 2. Typographie

### Familles de polices

| Police                | Variable CSS          | Usage                          | Fichiers                         |
|-----------------------|-----------------------|--------------------------------|----------------------------------|
| **Avenir LT Std**    | `--font-avenir`       | Titres (h1-h6), menu           | AvenirLTStd-{Weight}.otf        |
| **Montserrat**        | `--font-montserrat`   | Corps de texte, boutons, nav   | Montserrat-{Weight}.otf         |
| **Brittany Signature**| `--font-brittany`     | Accents cursifs decoratifs     | BrittanySignature.ttf           |

### Graisses disponibles

**Avenir** : Light (300), Book (400), Roman (450), Medium (500), Heavy (700), Black (900)
**Montserrat** : Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)

### Echelle typographique (responsive)

| Element             | Mobile          | Tablette        | Desktop               | Police    | Graisse    |
|---------------------|-----------------|-----------------|------------------------|-----------|------------|
| Hero H1             | `text-5xl`      | `text-6xl`      | `text-7xl` a `text-8xl`| Avenir    | Black (900)|
| Section H2          | `text-2xl`      | `text-4xl`      | `text-5xl`             | Avenir    | Black (900)|
| Sous-titre H3       | `text-3xl`      | `text-4xl`      | `text-5xl`             | Avenir    | Black (900)|
| Corps large         | `text-base`     | `text-lg`       | `text-xl`              | Montserrat| Regular    |
| Corps standard      | `text-sm`       | `text-base`     | `text-lg`              | Montserrat| Regular    |
| Petits textes       | `text-xs`       | `text-sm`       | `text-sm`              | Montserrat| Regular    |
| Navigation          | `text-sm`       | `text-sm`       | `text-sm` (13-14px)    | Montserrat| Medium     |
| Items menu          | `text-2xl`      | `text-3xl`      | `text-4xl`             | Avenir    | -          |
| Labels formulaire   | `text-sm`       | `text-sm`       | `text-sm`              | Montserrat| Medium     |

### Style de texte recurrent

- **Titres** : uppercase, `tracking-wide` (letter-spacing: 0.05em), `leading-snug`
- **Navigation** : uppercase, `tracking-wide`, `font-medium`
- **Corps** : casse normale, `leading-relaxed`

---

## 3. Systeme d'animations

### Philosophie d'animation

Le site utilise un style d'animation **fluide et organique** base sur des spring physics (Framer Motion) et des easings doux. Les animations sont toujours subtiles, jamais brusques, avec un sentiment de "glissement naturel".

### Animation signature : le souligne anime

C'est l'element le plus identitaire du site. Un souligne colore (generalement Sunglow `#FCCA46`) qui se "dessine" progressivement sous le texte.

```
Composant : AnimatedUnderlineText
- Technique : background-size de 0% a 100% (gradient lineaire)
- Duree : 1 seconde
- Easing : ease-out
- Epaisseur : 0.35em par defaut
- Couleur : Sunglow par defaut (personnalisable)
- Declenchement : au scroll (intersection observer)
- Delais staggers possibles entre mots/lignes
```

**Variante Hero** : Souligne via `scaleX(0) → scaleX(1)`, duree 700ms, ease-out.

### Presets de delais (staggers)

```
none     : 0ms
short    : 100ms
medium   : 200ms
long     : 400ms
veryLong : 600ms
```

### Animations CSS globales

| Nom               | Mouvement                              | Duree  | Easing                                    |
|--------------------|----------------------------------------|--------|-------------------------------------------|
| fadeInSlideDown     | Glisse du haut + fade in + leger scale | 0.4s   | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`   |
| slideUp             | Glisse du bas + fade in                | 0.35s  | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`   |
| popIn               | Scale 0.95→1 + fade in                | 0.35s  | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`   |
| fadeIn              | Scale 0.9→1 + fade in                 | -      | -                                          |

> **Easing signature** : `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — utilise partout, donne un mouvement doux avec une deceleration naturelle.

### Animations Framer Motion (spring configs)

| Context                  | Stiffness | Damping | Usage                                    |
|--------------------------|-----------|---------|------------------------------------------|
| **Standard**             | 300       | 25      | Texte rotatif, transitions generales     |
| **Hover cards**          | 120       | 16      | Cartes polaroid au survol                |
| **Slide entree**         | 100       | 20      | Sections qui glissent a l'ecran          |
| **Flip cartes**          | 80        | 14      | Retournement de cartes (origines)        |
| **Carousel navigation**  | 300       | 30      | Navigation temoignages                   |
| **Entree polaroid**      | 200       | 18      | Apparition des cartes polaroid           |
| **Stack mobile**         | 200       | 20      | Pile de cartes sur mobile                |

### GSAP (Menu hamburger)

| Element              | Duree  | Easing          | Stagger |
|----------------------|--------|-----------------|---------|
| Panneaux de fond     | 0.5s   | `power4.out`    | 0.07s   |
| Panneau menu         | 0.65s  | `power4.out`    | -       |
| Items de menu        | 1s     | `power4.out`    | 0.1s    |
| Numeros              | 0.6s   | `power2.out`    | 0.08s   |
| Liens sociaux        | 0.55s  | `power3.out`    | 0.08s   |
| Fermeture            | 0.32s  | `power3.in`     | -       |

### Animation speciale : texte gradient anime (Manifeste)

```css
animation: background-pan 6s linear infinite;
background: linear-gradient(to right, #FCCA46, #c9a0dc, #f4f0ec, #FCCA46);
background-size: 200%;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

Un gradient sunglow → violet → cream qui defile en boucle a travers le texte. Utilisable pour du texte a impact fort.

---

## 4. Composants UI

### Boutons

**Style** : Outline arrondi (`rounded-full`, `border-2`) — jamais plein par defaut.

| Variante  | Bordure/Texte       | Hover                         | Context typique         |
|-----------|----------------------|-------------------------------|--------------------------|
| Sunglow   | `#FCCA46` / `#FCCA46`| Fond sunglow, texte cream     | Fonds clairs (cream)     |
| Violet    | `#c9a0dc` / `#c9a0dc`| Fond violet, texte blanc      | Fonds clairs             |
| Raisin    | `#1e2952` / `#1e2952`| Fond raisin, texte sunglow    | Fond sunglow             |
| White     | `#FFF` / `#FFF`      | Fond blanc, texte raisin      | Fonds sombres            |

**Tailles** :
- `sm` : px-4 py-2 text-sm
- `md` : px-6 py-2.5 text-base
- `lg` : px-8 py-3 text-lg

**Transition** : `transition-colors duration-200`

### Champs de formulaire (Input, Textarea, Select)

- Bordure : `border-isabelline` (#EEE7E8)
- Fond : blanc
- Coins : `rounded-md`
- Focus : bordure et ring `indigo` (#8B80F9)
- Erreur : bordure et ring `red-500`
- Labels : `text-sm font-medium text-indigo`
- Placeholder : `text-raisin/50` (raisin a 50% opacite)

### Cartes Equipe

- Aspect ratio : 4/5
- Image plein cadre avec overlay au survol
- Overlay : `#628f93` (cyan) a 90% d'opacite
- Animation overlay : glisse du bas (`translate-y-full → translate-y-0`)
- Texte sur overlay : blanc
- Transition : 300ms

### Cartes Polaroid (Carousel amis/partenaires)

```
Fond : gradient lineaire 165deg (#f8f4f0 → #ede7e0 → #e4ddd5)
Bordure : white/40
Ombre : inset 0 1px 2px rgba(255,255,255,0.6), 0 4px 20px rgba(0,0,0,0.3)
Hover : spread ±50px, scale 1.05, elevation -10px, ombre renforcee
Animation : spring stiffness 120, damping 16
```

---

## 5. Header & Navigation

### Comportement au scroll

Le header a deux etats :

**Etat initial (top)** :
- Pleine largeur
- Logo large (240px)
- Navigation : `text-sm`, letter-spacing 0.05em

**Etat compact (scroll > 50px, desktop seulement)** :
- Forme arrondie centree (`rounded-full`)
- Effet glassmorphism : `blur(20px) saturate(180%)`
- Fond : gradient semi-transparent blanc
- Ombre : `0 10px 40px -10px rgba(30,41,82,0.15)`
- Bordure : `white/20`
- Logo reduit (48px, icone seul)
- Navigation : 13px, letter-spacing 0.04em
- Transition : 600ms (largeur/gaps), 400ms (border-radius)

### Indicateur de page active

- Barre sous le lien : hauteur 2px (`h-0.5`)
- Largeur animee : `duration-300`
- Couleur : adaptee au theme de la page (sunglow par defaut)

### Menu mobile (Staggered Menu)

- Panneaux colores qui glissent en stagger depuis la droite
- 3 couches : indigo, violet, cream
- Backdrop : `raisin/30` avec `backdrop-blur-sm`
- Items de menu avec numeros decoratifs (01, 02, 03...)
- Liens sociaux en bas avec icones

---

## 6. Elements decoratifs

### Cercles a rayures (Zebra circles)

- Motif SVG de cercles avec remplissage a rayures horizontales
- Tailles : 60-72 unites (responsive)
- Positionnement : coins de sections (top-right, bottom-left)
- Utilise dans : Hero, Histoire, Equipe

### Motifs raye (Striped patterns)

- Bandes horizontales en SVG
- Opacite de remplissage : 0.7
- Alternance transparent / couleur

### Effets de lumiere (Light leaks)

- Gradients SVG simulant des fuites de lumiere
- Couleurs : sunglow (60% opacite), orange `rgba(255,120,80,0.4)`
- Blend mode : `mix-blend-screen`
- Opacite globale : 30%

---

## 7. Effets d'interaction

### Survol texte / liens

- Navigation : `hover:opacity-70`
- Noms de services : `hover:-translate-y-1` (leger saut vers le haut)
- Transition standard : `duration-300`

### Survol cartes

- Equipe : overlay glisse du bas
- Polaroid : ecartement des cartes voisines, elevation, ombre renforcee
- Temoignages : fleches avec scale progressif (1 → 1.08 → 1.15)

### Scroll-triggered (Intersection Observer)

- Soulignements animes au scroll
- Sections qui entrent en glissant (slide in)
- Collage photos avec entrees directionnelles staggerees

---

## 8. Hierarchy de z-index

| Valeur | Element                           |
|--------|-----------------------------------|
| z-70   | Bouton toggle menu                |
| z-60   | Couches du menu (pre-layers)      |
| z-55   | Backdrop du menu                  |
| z-50   | Header                            |
| z-30   | Overlays cartes equipe            |
| z-20   | Elements secondaires              |
| z-10   | Contenu principal                 |
| z-0    | Fonds, elements decoratifs        |

---

## 9. Responsive Design

### Approche : Mobile First

- Styles de base = mobile
- `sm:` (640px+), `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+), `2xl:` (1536px+)

### Conteneurs

- Principal : `max-w-7xl` (1280px), `mx-auto`
- Padding horizontal : `px-4 sm:px-6 lg:px-8` (varie selon section)

### Patterns de mise en page

| Section  | Mobile                | Desktop                        |
|----------|-----------------------|---------------------------------|
| Equipe   | Grille 2 colonnes     | 2 rangees decalees (offset)    |
| Services | Liste verticale       | 2 colonnes (liste + grille)    |
| Hero     | Colonne unique centree| Idem, typo plus grande         |

---

## 10. Resume de l'identite visuelle

### Mots-cles du style

- **Chaleureux** : palette cream/sunglow, coins arrondis, polices elegantes
- **Organique** : animations spring, mouvements fluides, pas de transitions mecaniques
- **Raffine** : typo Avenir noire en uppercase, soulignements animes, glassmorphism subtil
- **Joyeux** : accents sunglow dores, gradient anime, couleurs vivantes (violet, cyan)
- **Professionnel** : hierarchie typographique claire, espacement genereux, responsive soigne

### Signatures visuelles a retenir

1. **Le souligne anime Sunglow** — element le plus distinctif, texte souligne qui se dessine progressivement
2. **Le fond cream chaud** (#f4f0ec) — base neutre reconnaissable, ni blanc froid ni beige
3. **La typo Avenir Black uppercase** — impact des titres
4. **Les animations spring douces** — mouvement naturel, pas de rigidite
5. **L'easing signature** : `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — presente partout
6. **Les boutons outline arrondis** — jamais pleins au repos, inversion au hover
7. **Le glassmorphism du header compact** — transparence + blur au scroll
8. **Les cercles decoratifs rayes** — touche graphique unique dans les coins
9. **Le gradient texte anime** (Manifeste) — sunglow/violet/cream qui defile
10. **Le menu a panneaux staggeres** — entree cinematographique des couches colorees
