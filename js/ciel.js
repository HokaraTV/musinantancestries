/* ---------- 6. Décor : ciel étoilé animé ---------- */
// Dessine des étoiles scintillantes et quelques étoiles filantes sur le
// <canvas id="sky"> en arrière-plan. Purement décoratif : si tu le supprimes,
// le reste du site fonctionne pareil. La fonction est lancée immédiatement
// "(() => { ... })();" pour ne pas laisser de variables en dehors.
(() => {
  const c = document.getElementById("sky"),
    x = c.getContext("2d"),
    // RM : vrai si l'utilisateur a demandé moins d'animations dans son système
    RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, // largeur de la fenêtre
    H, // hauteur de la fenêtre
    stars = [], // étoiles fixes
    shots = [], // étoiles filantes en cours
    last = 0, // heure de l'image précédente
    next = 0, // heure de la prochaine étoile filante
    raf = 0; // identifiant de l'animation, pour pouvoir l'arrêter

  // build : prépare le canvas à la taille de la fenêtre et crée les étoiles.
  // Le nombre d'étoiles dépend de la surface (max 900). Environ 6 % sont
  // "brillantes" (plus grosses). La résolution est doublée au maximum pour
  // rester nette sur les écrans haute densité.
  function build() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    c.width = W * d;
    c.height = H * d;
    x.setTransform(d, 0, 0, d, 0, 0);
    stars = Array.from(
      { length: Math.min(900, Math.round((W * H) / 7500)) },
      () => {
        const b = Math.random() < 0.06;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          r: b ? 1.5 + Math.random() * 0.8 : 0.35 + Math.random() * 0.75,
          a: 0.3 + Math.random() * 0.6,
          ph: Math.random() * 6.28,
          sp: 0.5 + Math.random() * 1.5,
          b,
        };
      },
    );
    draw(0, 0);
  }

  // draw : dessine une image complète. t = temps écoulé, dt = durée depuis
  // l'image précédente. Ordre : effacer, halo violet/bleu en fond, étoiles
  // (leur éclat varie avec le temps pour scintiller), puis étoiles filantes.
  function draw(t, dt) {
    x.clearRect(0, 0, W, H);
    const g = x.createRadialGradient(
      W * 0.55,
      H * 0.32,
      0,
      W * 0.55,
      H * 0.32,
      Math.max(W, H) * 0.65,
    );
    g.addColorStop(0, "rgba(72,52,130,.17)");
    g.addColorStop(0.5, "rgba(24,40,90,.07)");
    g.addColorStop(1, "rgba(5,8,19,0)");
    x.globalAlpha = 1;
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    for (const s of stars) {
      // tw : facteur de scintillement (fixe à 1 si animations réduites)
      const tw = RM ? 1 : 0.62 + 0.38 * Math.sin((t / 1000) * s.sp + s.ph);
      x.globalAlpha = Math.min(1, s.a * tw);
      x.fillStyle = s.b ? "#fff" : "#d9e6ff";
      x.beginPath();
      x.arc(s.x, s.y, s.r, 0, 6.2832);
      x.fill();
    }
    x.globalAlpha = 1;
    // Étoiles filantes : on avance chacune, on la supprime quand sa durée de
    // vie est finie, sinon on trace sa traînée (dégradé transparent → blanc).
    for (let k = shots.length - 1; k >= 0; k--) {
      const o = shots[k];
      o.age += dt;
      if (o.age > o.life) {
        shots.splice(k, 1);
        continue;
      }
      const hx = o.x + o.vx * o.age,
        hy = o.y + o.vy * o.age,
        sp = Math.hypot(o.vx, o.vy),
        tx = hx - (o.vx / sp) * o.len,
        ty = hy - (o.vy / sp) * o.len;
      const lg = x.createLinearGradient(tx, ty, hx, hy);
      lg.addColorStop(0, "rgba(255,255,255,0)");
      lg.addColorStop(1, "#fff");
      x.globalAlpha = Math.sin((Math.PI * o.age) / o.life);
      x.strokeStyle = lg;
      x.lineWidth = 1.5;
      x.beginPath();
      x.moveTo(tx, ty);
      x.lineTo(hx, hy);
      x.stroke();
    }
    x.globalAlpha = 1;
  }

  // loop : boucle d'animation, appelée à chaque image par le navigateur.
  // Quand l'heure "next" est dépassée, lance une nouvelle étoile filante
  // (angle, vitesse, position et durée au hasard) et programme la suivante
  // dans 3,5 à 9 secondes.
  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    if (t > next) {
      const a = ((28 + Math.random() * 14) * Math.PI) / 180,
        sp = 650 + Math.random() * 350;
      shots.push({
        x: Math.random() * W * 0.8,
        y: Math.random() * H * 0.45,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        age: 0,
        life: 0.8 + Math.random() * 0.6,
        len: 110 + Math.random() * 90,
      });
      next = t + 3500 + Math.random() * 5500;
    }
    draw(t, dt);
    raf = requestAnimationFrame(loop);
  }

  build();
  // go : démarre l'animation (première étoile filante après 1,5 s)
  const go = () => {
    raf = requestAnimationFrame((t) => {
      last = t;
      next = t + 1500;
      loop(t);
    });
  };
  // Si les animations ne sont pas réduites : on lance, et on met l'animation
  // en pause quand l'onglet est caché (pour économiser la batterie).
  // Sinon, le ciel reste une image fixe.
  if (!RM) {
    go();
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) go();
    });
  }
  // Au redimensionnement, on reconstruit le ciel (après 200 ms de calme),
  // mais seulement si la taille a vraiment changé : cela évite de le refaire
  // quand la barre d'adresse d'un téléphone apparaît ou disparaît.
  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (Math.abs(innerWidth - W) > 40 || innerHeight - H > 150) build();
    }, 200);
  });
})();
