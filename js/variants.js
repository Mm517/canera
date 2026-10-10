/* ============================================================
   variants.js — التشكيلة كصفحات متراكبة بتطلع مع السكرول
   كل نوع = صفحة بلونه، الاسم بيتلوّن لتحت والكلام بينوّر كلمة كلمة
   ============================================================ */
(() => {
  const prod = document.getElementById('prod'), st = prod && prod.querySelector('.st'); if (!st) return;
  prod.style.height = '540vh';
  const vst = document.createElement('div'); vst.className = 'vst';
  vst.innerHTML = P.map((p, i) => `<article class="vpg" style="--c:${p.c};--c2:${p.c2};--a:${p.a};--t:${p.t};z-index:${i + 1}">
    <div class="mq"><div>${`<span>${p.n}</span><i>✦</i><span>${BRAND.name}</span><i>✦</i>`.repeat(10)}</div></div>
    <b class="no">٠${AR(i + 1)}</b>
    <h3 class="nm">${p.n}</h3>
    <p class="ds">${p.d.split(' ').map(w => `<span>${w}</span>`).join(' ')}</p>
    <div class="rl"><span>درجة التحميص</span><b>${p.rl}</b></div><div class="mt"><i style="--w:${p.r}%"></i></div>
    <div class="nt">${p.notes.map((n, j) => `<span style="--d:${.35 + j * .12}s">${n}</span>`).join('')}</div>
    <p class="ex">${p.x}</p><div class="ring"></div></article>`).join('') +
    `<div class="vdots">${P.map((p, i) => `<button data-i="${i}" aria-label="${p.n}"><i></i><span>${p.n}</span></button>`).join('')}<em class="vcn"></em></div>`;
  st.append(vst);
  const pages = [...vst.querySelectorAll('.vpg')], dots = [...vst.querySelectorAll('.vdots button')], vcn = vst.querySelector('.vcn');
  const words = pages.map(el => [...el.querySelectorAll('.ds span')]);
  vst.querySelector('.vdots').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const y = prod.getBoundingClientRect().top + scrollY + (prod.offsetHeight - innerHeight) * (+b.dataset.i / 3 + .08);
    lenis ? lenis.scrollTo(y, { duration: 1.8 }) : scrollTo({ top: y, behavior: 'smooth' });
  };

  let cur = -1, last = 0;
  function vp(p) {
    const now = performance.now(); if (now - last > 300) cur = -1; last = now;
    let a = 0;
    pages.forEach((el, k) => {
      const r = k ? sm(rng(k / 3 - .09, k / 3 + .02, p)) : 1, dep = k < 2 ? sm(rng((k + 1) / 3 - .09, (k + 1) / 3 + .02, p)) : 0;
      if (r > .5) a = k;
      el.style.transform = `translateY(${(1 - r) * 108 - dep * 5}%) rotate(${(1 - r) * 4 - dep * 2.2}deg) scale(${1 - dep * .05})`;
      el.style.filter = dep ? `brightness(${1 - dep * .45})` : '';
      el.style.visibility = r < .002 ? 'hidden' : 'visible';
    });
    const lp = a < 2 ? rng(a / 3, (a + 1) / 3 - .09, p) : rng(2 / 3, 1, p);
    pages.forEach((el, k) => {
      el.style.setProperty('--f', (k < a ? 100 : k > a ? 0 : lp * 100) + '%');
      const n = words[k].length; words[k].forEach((w, i) => w.classList.toggle('l', k < a || (k === a && i / n < lp * 1.35 + .08)));
    });
    if (a !== cur) {
      const first = cur === -1; cur = a;
      pages.forEach((e, k) => e.classList.toggle('on', k === a)); dots.forEach((d, k) => d.classList.toggle('on', k === a));
      vcn.textContent = '٠' + AR(a + 1) + ' / ٠٣';
      setP(a, first); gsap.to(document.body, { '--bg': P[a].c2, duration: .9, overwrite: 'auto' });
    }
    vst.style.transform = `perspective(1300px) rotateY(${-mouse.x * 4}deg) rotateX(${mouse.y * 3}deg)`;
  }

  const B1 = buildScenes;
  buildScenes = function () {
    B1(); SC.prod.bg = P[0].c2;
    const u = SC.prod.update; SC.prod.update = (p, t) => { const c = u(p, t); vp(p); return c };
  };
})();
