/* =====================================================================
   pages.js : les trois pages du site
   ---------------------------------------------------------------------
   accueil()  → la grille des espèces
   fiche()    → la page d'une espèce, avec ses trois onglets
   detail()   → la page d'un don ou d'un héritage
 
   Chaque fonction écrit directement dans la zone « view » et change le titre
   de l'onglet du navigateur. Elles sont appelées par route() (navigation.js).
 
   Attend que ces données existent (fichiers du dossier data/) :
     TITRE   : titre du site
     INTRO   : phrase d'introduction de l'accueil
     ESPECES : tableau des espèces
 
   Dépend de : outils.js (view, html, txt, slug)
               composants.js (portrait, section, liste, descr)
               heritages.js (sousSections)   dons.js (feats, initFiltres)
   Ordre de chargement : après heritages.js et dons.js.
   ===================================================================== */
 
 
/* ---------------------------------------------------------------------
   STATS : les lignes de l'infobox (encadré à droite de la fiche)
   Chaque paire est [nom du champ dans les données, libellé affiché].
   Une espèce dont le champ est vide n'affiche pas la ligne.
   Pour ajouter une ligne : ajouter une paire ici, par exemple
   ["defauts", "Défaut de carac."], puis remplir ce champ dans l'espèce.
   --------------------------------------------------------------------- */
const STATS = [
  ["pv", "Points de vie"],
  ["taille", "Taille"],
  ["vitesse", "Vitesse"],
  ["bonus", "Bonus de carac."],
  ["defauts", "Défaut de carac."],
  ["vision", "Vision"],
  ["langues", "Langues"],
];
 
 
/* ---------------------------------------------------------------------
   ONGLETS : les trois onglets d'une fiche
   Chaque paire est [clé utilisée dans l'adresse, libellé affiché].
   L'onglet "presentation" n'ajoute rien à l'adresse (#/nain), les autres
   oui (#/nain/heritages). Si tu changes une clé, il faut aussi la changer
   dans panneaux (fiche) et dans route() (navigation.js).
   --------------------------------------------------------------------- */
const ONGLETS = [
  ["presentation", "Présentation"],
  ["heritages", "Héritages"],
  ["dons", "Dons"],
];
 
 
/* ---------------------------------------------------------------------
   accueil() : la page d'accueil
   Affiche le titre (TITRE), la phrase d'introduction (INTRO), puis une carte
   par espèce : image (ou numéro), nom et résumé. Chaque carte est un lien
   vers la fiche de l'espèce.
   --------------------------------------------------------------------- */
function accueil() {
  document.title = txt(TITRE);
  view.className = "page";
  view.innerHTML = `<header class="pagehead"><h1>${html(TITRE)}</h1><p class="tagline">${html(INTRO)}</p></header>
  <div class="grid">${ESPECES.map((e, i) => `<a class="card" href="#/${slug(e.nom)}">${portrait(e, i)}<div class="card-body"><h3>${html(e.nom)}</h3><p>${html(e.resume)}</p></div></a>`).join("")}</div>`;
}
 
 
/* ---------------------------------------------------------------------
   fiche(i, onglet) : la page d'une espèce
     i      : position de l'espèce dans ESPECES
     onglet : "presentation" (par défaut), "heritages" ou "dons"
 
   La page contient, dans l'ordre :
     - le fil d'Ariane (Accueil › nom) ;
     - l'en-tête : nom, accroche et tags ;
     - les trois onglets, avec le nombre d'héritages et de dons ;
     - le contenu de l'onglet actif ;
     - l'infobox à droite (portrait, nom, statistiques) ;
     - deux liens vers l'espèce précédente et la suivante.
 
   Étapes de la fonction :
     1. e, p, n : l'espèce courante, la précédente et la suivante. Le calcul
        avec « % » fait revenir au début après la dernière, et inversement.
     2. rows : lignes de l'infobox = les STATS remplies + les « infos » libres
        de l'espèce, sans les lignes dont la valeur est vide.
     3. panneaux : le contenu de chaque onglet. Chaque entrée est une fonction,
        exécutée seulement pour l'onglet demandé. Les messages « Aucun … 
        renseigné » s'affichent quand une fonction renvoie un texte vide.
     4. nb : les nombres affichés dans les pastilles des onglets.
   Seul l'onglet Dons a des filtres, donc initFiltres() n'est lancée que là.
   --------------------------------------------------------------------- */
function fiche(i, tab = "presentation") {
  const e = ESPECES[i],
    p = ESPECES[(i + ESPECES.length - 1) % ESPECES.length],
    n = ESPECES[(i + 1) % ESPECES.length];
  const rows = [
    ...STATS.map(([k, l]) => [l, e[k]]),
    ...(e.infos || []),
  ].filter(([, v]) => v);
  const panneaux = {
    presentation: () =>
      (e.description || []).map(descr).join("") +
      section("Capacités spéciales", e.capacites),
    heritages: () =>
      sousSections(e) || "<p>Aucun héritage renseigné.</p>",
    dons: () => feats(e) || "<p>Aucun don renseigné.</p>",
  };
  const nb = {
    heritages: (e.heritages || []).length,
    dons: (e.dons || []).length,
  };
  document.title = txt(e.nom + " – " + TITRE);
  // "page wide" : mise en page pleine largeur (voir .page.wide dans le CSS)
  view.className = "page wide";
  view.innerHTML = `<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>${html(e.nom)}</span></div>
  <div class="entry-grid"><div class="col"><div class="ph"><p class="eyebrow">Espèce</p><h1>${html(e.nom)}</h1><p class="lede">${html(e.accroche)}</p><div class="tags">${(e.tags || []).map((t) => `<span class="tag">${html(t)}</span>`).join("")}</div></div>
  <div class="body"><nav class="tabs" aria-label="Sections de la fiche">${ONGLETS.map(([k, l]) => `<a href="#/${slug(e.nom)}${k === "presentation" ? "" : "/" + k}"${k === tab ? ' aria-current="page"' : ""}>${l}${nb[k] ? `<small>${nb[k]}</small>` : ""}</a>`).join("")}</nav>
  <div class="prose">${panneaux[tab]()}</div></div></div>
  <aside class="infobox">${portrait(e, i)}<div class="ib-head"><span>Espèce</span><strong>${html(e.nom)}</strong></div><dl>${rows.map(([k, v]) => `<dt>${html(k)}</dt><dd>${html(v)}</dd>`).join("")}</dl></aside></div>
  <div class="refs"><a class="chip" href="#/${slug(p.nom)}"><small>Précédente</small>${html(p.nom)}</a><a class="chip" href="#/${slug(n.nom)}"><small>Suivante</small>${html(n.nom)}</a></div>`;
  if (tab === "dons") initFiltres();
}
 
 
/* ---------------------------------------------------------------------
   detail(i, type, j) : la page d'un don ou d'un héritage
     i    : position de l'espèce dans ESPECES
     type : "don" ou "heritage"
     j    : position de l'élément dans la liste (déjà triée pour les dons)
 
   La page contient :
     - le fil d'Ariane (Accueil › espèce › élément) ;
     - le titre, avec un texte au-dessus (« Don d’ascendance » ou « Héritage ») ;
     - les tags : « Niveau N » (dons seulement), l'action, les traits, et
       « Legacy Content » si l'élément est legacy ;
     - le corps, dans cet ordre : prérequis, champs « meta » (Frequency,
       Trigger…) avec leur libellé en gras, texte, puis la source en italique ;
     - les liens : retour à la liste, élément précédent et suivant (ces deux
       liens n'apparaissent que s'il y a plus d'un élément).
 
   Variables : e = espèce, L = liste, x = élément affiché, p et n = élément
   précédent et suivant (qui reviennent au début/à la fin aux extrémités),
   u(y) = adresse de la page de l'élément y.
   --------------------------------------------------------------------- */
function detail(i, k, j) {
  const e = ESPECES[i],
    L = liste(e, k),
    x = L[j],
    p = L[(j + L.length - 1) % L.length],
    n = L[(j + 1) % L.length];
  const label = k === "don" ? "Don d’ascendance" : "Héritage",
    u = (y) => `#/${slug(e.nom)}/${k}/${slug(y.titre)}`;
  document.title = txt(x.titre + " – " + e.nom + " – " + TITRE);
  view.className = "page";
  view.innerHTML = `<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/${slug(e.nom)}">${html(e.nom)}</a><span>›</span><span>${html(x.titre)}</span></div>
  <div class="ph"><p class="eyebrow">${label} · ${html(e.nom)}</p><h1>${html(x.titre)}</h1>${((tg) => (tg.length ? `<div class="tags">${tg.map((t) => `<span class="tag">${html(t)}</span>`).join("")}</div>` : ""))([...(k === "don" ? ["Niveau " + x.niveau] : []), ...(x.action ? [x.action] : []), ...(x.traits || []), ...(x.legacy ? ["Legacy Content"] : [])])}</div>
  <div class="prose">${x.prereq ? `<p><strong>Prerequisites</strong> ${html(x.prereq)}</p>` : ""}${(x.meta || []).map(([a, b]) => `<p><strong>${html(a)}</strong> : ${html(b)}</p>`).join("")}${[]
    .concat(x.texte)
    .map((t) => `<p>${html(t)}</p>`)
    .join(
      "",
    )}${x.source ? `<p><em>Source: ${html(x.source)}</em></p>` : ""}</div>
  <div class="refs"><a class="chip" href="#/${slug(e.nom)}/${k === "don" ? "dons" : "heritages"}"><small>Retour</small>${k === "don" ? "Dons" : "Héritages"} · ${html(e.nom)}</a>${L.length > 1 ? `<a class="chip" href="${u(p)}"><small>Précédent</small>${html(p.titre)}</a><a class="chip" href="${u(n)}"><small>Suivant</small>${html(n.titre)}</a>` : ""}</div>`;
}