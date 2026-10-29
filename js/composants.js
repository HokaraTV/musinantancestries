/* =====================================================================
   composants.js : petits morceaux de page réutilisables
   ---------------------------------------------------------------------
   Chaque fonction reçoit des données (une espèce, un don, un texte) et
   renvoie un morceau de code HTML sous forme de texte. Elles n'écrivent rien
   dans la page elle-même : ce sont les pages (pages.js) qui les assemblent.
 
   Dépend de : outils.js (esc, html, txt, hue, slug).
   Ordre de chargement : juste après outils.js.
   ===================================================================== */
 
 
/* ---------------------------------------------------------------------
   portrait(espèce, position) : le bloc image d'une espèce
   Avec une image : une balise <img> (chargée en différé, avec un texte
   alternatif tiré du nom). Sans image : le numéro de l'espèce, sur un fond
   coloré dont la teinte vient de hue().
   Exemples : portrait({nom:"Nain", image:"images/nain.png"}, 0)
                → <div class="card-img" style="--h:200"><img src="images/nain.png" …></div>
              portrait({nom:"Elfe"}, 2)
                → <div class="card-img" style="--h:280"><span>3</span></div>
   Utilisé par : les cartes de l'accueil et l'infobox de la fiche.
   --------------------------------------------------------------------- */
const portrait = (e, i) =>
  `<div class="card-img" style="--h:${hue(i)}">${e.image ? `<img src="${esc(e.image)}" alt="${esc(txt(e.nom))}" loading="lazy">` : `<span>${i + 1}</span>`}</div>`;
 
 
/* ---------------------------------------------------------------------
   section(titre, liste) : un titre <h3> suivi de paragraphes « Titre. Texte »
   Si la liste est vide ou absente, ne renvoie rien (aucun titre orphelin).
   Exemple : section("Capacités spéciales", [{titre:"Vision", texte:"Voit dans le noir."}])
                → <h3>Capacités spéciales</h3><p><strong>Vision.</strong> Voit dans le noir.</p>
   Utilisé par : l'onglet Présentation (capacités spéciales).
   Attention : "texte" doit être une simple chaîne. Contrairement à descr(),
   cette fonction ne gère pas un tableau : ["A", "B"] s'afficherait « A,B ».
   --------------------------------------------------------------------- */
const section = (t, a) =>
  a && a.length
    ? `<h3>${t}</h3>` +
      a
        .map(
          (x) =>
            `<p><strong>${html(x.titre)}.</strong> ${html(x.texte)}</p>`,
        )
        .join("")
    : "";
 
 
/* ---------------------------------------------------------------------
   liste(espèce, type) : la liste d'éléments à afficher
     "don"      → les dons, triés par niveau croissant (sans toucher à l'original)
     "heritage" → les héritages, dans l'ordre de tes données
     autre      → une liste vide (aucune erreur)
   Exemple : liste(nain, "don")  →  [don niveau 1, …, don niveau 17]
   Utilisé par : les tableaux, les liens et la navigation (c'est elle qui
   retrouve l'élément demandé dans l'adresse).
   --------------------------------------------------------------------- */
const liste = (e, k) =>
  k === "don"
    ? [...(e.dons || [])].sort((x, y) => x.niveau - y.niveau)
    : k === "heritage"
      ? e.heritages || []
      : [];
 
 
/* ---------------------------------------------------------------------
   lien(espèce, type, élément) : lien cliquable vers la page d'un don
   Affiche le titre, avec une pastille « Legacy » si l'élément est marqué
   legacy, et « Uncommon » s'il a ce trait. L'adresse est construite avec
   slug() : #/espèce/type/titre.
   Exemple : lien(nain, "don", clanLore)
                → <a … href="#/nain/don/clan-lore"><span>Clan Lore</span>…</a>
   Utilisé par : les lignes du tableau des dons.
   --------------------------------------------------------------------- */
const lien = (e, k, x) =>
  `<a class="d-btn d-link" href="#/${slug(e.nom)}/${k}/${slug(x.titre)}"><span>${html(x.titre)}${x.legacy ? ` <em class="legacy">Legacy</em>` : ""}${(x.traits || []).includes("Uncommon") ? ` <em class="legacy">Uncommon</em>` : ""}</span><i aria-hidden="true"></i></a>`;
 
 
/* ---------------------------------------------------------------------
   descr(élément) : un élément de la description d'une espèce
   Accepte deux formes :
     - une chaîne                    → un paragraphe
     - { titre, texte }              → un sous-titre <h3> puis ses paragraphes
                                       (texte peut être une chaîne OU un tableau)
   Exemples : descr("Un peuple discret.")
                → <p>Un peuple discret.</p>
              descr({titre:"Société", texte:["A", "B"]})
                → <h3>Société</h3><p>A</p><p>B</p>
   Utilisé par : l'onglet Présentation (champ description de l'espèce).
   --------------------------------------------------------------------- */
const descr = (t) =>
  typeof t === "string"
    ? `<p>${html(t)}</p>`
    : `<h3>${html(t.titre)}</h3>${[]
        .concat(t.texte)
        .map((p) => `<p>${html(p)}</p>`)
        .join("")}`;