const CATS = Array.isArray(window.GALLERY) ? window.GALLERY : [];
const featuredEl = document.getElementById('featuredGallery');
const filtersEl = document.getElementById('filters');
const galleryEl = document.getElementById('gallery');
const countEl = document.getElementById('galleryCount');
const pageType = document.body.dataset.page || 'index';
const pageCategory = document.body.dataset.category || '';

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, {threshold: .08});

function initPortfolio() {
  setupThemeToggle();
  setupHeroPlaceholder();
  hideEmptyReel();

  if (pageType === 'index') {
    buildFeatured();
    buildCategoryCards();
  } else if (pageType === 'category') {
    renderCategoryPage();
  }

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');

  if (nav) {
    addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));
  }

  if (navToggle && navLinks) {
    navToggle.onclick = () => navLinks.classList.toggle('open');
  }

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(a => a.onclick = () => navLinks.classList.remove('open'));
  }
}

function setupThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  toggle.onclick = () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  };
}

function setupHeroPlaceholder() {
  const base = document.getElementById('heroPhoto');
  const ph = document.getElementById('heroPlaceholder');
  if (!base) return;
  base.onerror = () => {
    base.style.display = 'none';
    if (ph) ph.style.display = 'flex';
  };
}

function hideEmptyReel() {
  const reel = document.getElementById('reel');
  if (reel && !reel.querySelector('iframe, video')) {
    reel.style.display = 'none';
    const link = document.querySelector('.nav-links a[href="#reel"]');
    if (link) link.style.display = 'none';
  }
}

function categoryPageFile(label) {
  if (/character/i.test(label)) return 'character-designs.html';
  if (/comic/i.test(label)) return 'comic-book.html';
  if (/storyboard/i.test(label)) return 'storyboards.html';
  return '#';
}

function buildFeatured() {
  if (!featuredEl) return;
  featuredEl.innerHTML = '';
  if (!CATS.length) return;

  const featuredItems = [];
  CATS.forEach(c => {
    c.images.slice(0, 3).forEach(file => featuredItems.push({category: c, file}));
  });

  featuredItems.slice(0, 10).forEach((item, i) => {
    const {category, file} = item;
    const src = encodeURI(`images/${category.folder}/${file}`);
    const fig = document.createElement('figure'); fig.className = 'card';
    fig.style.setProperty('--d', Math.min(i, 12) * 45 + 'ms');
    const img = document.createElement('img'); img.src = src; img.alt = category.label; img.loading = 'lazy';
    img.onerror = () => {
      fig.classList.add('placeholder');
      fig.innerHTML = `<div class="ph-miss">image not found<br><small>${file}</small></div>`;
    };
    fig.appendChild(img);
    const isComic = /comic/i.test(category.folder);
    const categoryIndex = CATS.indexOf(category);
    const imageIndex = category.images.indexOf(file);
    fig.onclick = isComic ? (() => { renderCategoryPage(category.label); openFlip(imageIndex); }) : (() => { renderCategoryPage(category.label); openLightbox(categoryIndex, imageIndex); });
    featuredEl.appendChild(fig);
    io.observe(fig);
  });
}

function buildCategoryCards() {
  if (!filtersEl) return;
  filtersEl.innerHTML = '';
  if (!CATS.length) {
    filtersEl.innerHTML = '<p style="color:var(--muted)">No categories found yet. Add images inside the <b>images/</b> sub-folders, then run <b>refresh-portfolio.bat</b> and reload.</p>';
    return;
  }

  CATS.forEach(c => {
    const card = document.createElement('article');
    card.className = 'category-card';
    const meta = document.createElement('div');
    meta.className = 'cat-meta';
    meta.innerHTML = `<h3>${c.label}</h3><span>${c.images.length} pieces</span>`;
    const thumbs = document.createElement('div'); thumbs.className = 'thumbs';
    c.images.slice(0, 3).forEach(file => {
      const img = document.createElement('img');
      img.src = encodeURI(`images/${c.folder}/${file}`);
      img.alt = c.label;
      img.loading = 'lazy';
      thumbs.appendChild(img);
    });
    const link = document.createElement('a');
    link.className = 'btn btn-ghost view-category';
    link.textContent = `Explore ${c.label}`;
    link.href = categoryPageFile(c.label);
    card.appendChild(meta);
    card.appendChild(thumbs);
    card.appendChild(link);
    filtersEl.appendChild(card);
  });
}

function renderCategoryPage(categoryLabel = pageCategory) {
  const category = CATS.find(c => c.label === categoryLabel);
  if (!category) return;

  comicCat = category;

  const titleEl = document.querySelector('.section-title');
  if (titleEl) titleEl.textContent = category.label;
  const subtitleEl = document.querySelector('.eyebrow');
  if (subtitleEl) subtitleEl.textContent = category.label.includes('Comic') ? 'Comic book' : category.label.includes('Storyboard') ? 'Storyboards' : 'Character designs';

  if (galleryEl) {
    galleryEl.innerHTML = '';
    galleryEl.classList.toggle('rows', /comic/i.test(category.folder));
    if (countEl) {
      const isComic = /comic/i.test(category.folder);
      if (isComic) {
        countEl.innerHTML = `${category.images.length} pages · ${category.label} &nbsp;&nbsp;<button class="readbook" id="readBook">📖 Read as a book</button>`;
      } else {
        countEl.textContent = `${category.images.length} pieces · ${category.label}`;
      }
    }
    category.images.forEach((file, i) => {
      const src = encodeURI(`images/${category.folder}/${file}`);
      const fig = document.createElement('figure'); fig.className = 'card';
      fig.style.setProperty('--d', Math.min(i, 12) * 45 + 'ms');
      const img = document.createElement('img'); img.src = src; img.alt = category.label; img.loading = 'lazy';
      img.onerror = () => {
        fig.classList.add('placeholder');
        fig.innerHTML = `<div class="ph-miss">image not found<br><small>${file}</small></div>`;
      };
      fig.appendChild(img);
      fig.onclick = /comic/i.test(category.folder) ? (() => openFlip(i)) : (() => openLightbox(CATS.indexOf(category), i));
      galleryEl.appendChild(fig);
      io.observe(fig);
    });
    const rb = document.getElementById('readBook');
    if (rb) rb.onclick = () => openFlip(0);
  }
}

/* ----- lightbox ----- */
const lb = document.getElementById('lightbox');
const lbBody = document.getElementById('lbBody');
const lbCap = document.getElementById('lbCap');
let lbCat = 0, lbIndex = 0;
function openLightbox(ci, i) { lbCat = ci; lbIndex = i; showLb(); if (lb) lb.classList.add('open'); }
function showLb() {
  if (!lbBody || !lbCap) return;
  const c = CATS[lbCat];
  const file = c.images[lbIndex];
  const src = encodeURI(`images/${c.folder}/${file}`);
  lbBody.innerHTML = `<img src="${src}" alt="${c.label}">`;
  lbCap.innerHTML = `<span class="card-cat">${c.label}</span><div class="card-title">${lbIndex + 1} / ${c.images.length}</div>`;
}
function lbMove(d) { const c = CATS[lbCat]; lbIndex = (lbIndex + d + c.images.length) % c.images.length; showLb(); }
if (lb) {
  document.getElementById('lbClose').onclick = () => lb.classList.remove('open');
  document.getElementById('lbPrev').onclick = () => lbMove(-1);
  document.getElementById('lbNext').onclick = () => lbMove(1);
  lb.onclick = e => { if (e.target === lb) lb.classList.remove('open'); };
}

/* ===== comic flipbook reader ===== */
let comicCat = null, screens = [], fpos = 0, fmax = 0, fAnim = false;
const flipReader = document.getElementById('flipReader');
const pgLeft = document.getElementById('pgLeft');
const pgRight = document.getElementById('pgRight');
const pgFlip = document.getElementById('pgFlip');
const pgFlipFront = document.getElementById('pgFlipFront');
const pgFlipBack = document.getElementById('pgFlipBack');
const flipCount = document.getElementById('flipCount');
const FLIP_MS = 900;

function comicSrc(i) { if (!comicCat || i == null || i < 0 || i >= comicCat.images.length) return null; return encodeURI(`images/${comicCat.folder}/${comicCat.images[i]}`); }
function isSpread(name) { const b = name.replace(/\.[^.]+$/, ''); return /\d+\s*-\s*\d+/.test(b) || /spread/i.test(b); }
function setSlot(el, d) {
  if (!d || d.idx == null) { if(el) el.innerHTML = ''; return; }
  const s = comicSrc(d.idx); if (!s) { if(el) el.innerHTML = ''; return; }
  if (d.half) {
    const shift = d.half === 'right' ? 'left:-100%;' : 'left:0;';
    el.innerHTML = `<img class="halfimg" style="${shift}" src="${s}" alt="">`;
  } else { el.innerHTML = `<img src="${s}" alt="">`; }
}
function buildScreens() {
  if (!comicCat) return;
  const P = comicCat.images; screens = [];
  screens.push({type:'pair',left:null,right:0});
  let i = 1;
  while (i < P.length) {
    if (isSpread(P[i])) { screens.push({type:'spread',img:i}); i++; }
    else if (i + 1 < P.length && !isSpread(P[i + 1])) { screens.push({type:'pair',left:i,right:i+1}); i += 2; }
    else { screens.push({type:'pair',left:i,right:null}); i++; }
  }
  fmax = screens.length - 1;
}
function scrLeft(s) { const c = screens[s]; if (!c) return null; return c.type === 'spread' ? {idx:c.img,half:'left'} : {idx:c.left}; }
function scrRight(s) { const c = screens[s]; if (!c) return null; return c.type === 'spread' ? {idx:c.img,half:'right'} : {idx:c.right}; }
function screenOf(idx) { for (let s = 0; s < screens.length; s++) { const c = screens[s]; if (c.type === 'spread') { if (c.img === idx) return s; } else if (c.left === idx || c.right === idx) return s; } return 0; }
function renderSpread() {
  setSlot(pgLeft, scrLeft(fpos));
  setSlot(pgRight, scrRight(fpos));
  const total = comicCat.images.length;
  const r = scrRight(fpos) || scrLeft(fpos);
  const pg = (r && r.idx != null) ? Math.min(r.idx + 1, total) : 1;
  if (flipCount) flipCount.textContent = `${comicCat.label} — page ${pg} of ${total}`;
}
function openFlip(startIdx) {
  if (!comicCat) return;
  buildScreens();
  fpos = startIdx > 0 ? screenOf(startIdx) : 0;
  if (pgFlip) { pgFlip.style.display = 'none'; pgFlip.style.transition = 'none'; pgFlip.style.transform = 'rotateY(0deg)'; }
  renderSpread();
  if (flipReader) flipReader.classList.add('open');
  if (document.body) document.body.classList.add('flip-open');
}
function closeFlip() { if (flipReader) flipReader.classList.remove('open'); if (document.body) document.body.classList.remove('flip-open'); }
function nextPage() {
  if (fAnim || fpos >= fmax) return;
  fAnim = true;
  setSlot(pgFlipFront, scrRight(fpos));
  setSlot(pgFlipBack, scrLeft(fpos + 1));
  setSlot(pgRight, scrRight(fpos + 1));
  if (pgFlip) {
    pgFlip.style.display = 'block'; pgFlip.style.transition = 'none'; pgFlip.style.transform = 'rotateY(0deg)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pgFlip.style.transition = `transform ${FLIP_MS}ms cubic-bezier(.3,.1,.3,1)`;
      pgFlip.style.transform = 'rotateY(-180deg)';
    }));
    setTimeout(() => { fpos++; renderSpread(); pgFlip.style.display = 'none'; fAnim = false; }, FLIP_MS + 30);
  }
}
function prevPage() {
  if (fAnim || fpos <= 0) return;
  fAnim = true; const t = fpos - 1;
  setSlot(pgFlipFront, scrRight(t));
  setSlot(pgFlipBack, scrLeft(fpos));
  setSlot(pgLeft, scrLeft(t));
  if (pgFlip) {
    pgFlip.style.display = 'block'; pgFlip.style.transition = 'none'; pgFlip.style.transform = 'rotateY(-180deg)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pgFlip.style.transition = `transform ${FLIP_MS}ms cubic-bezier(.3,.1,.3,1)`;
      pgFlip.style.transform = 'rotateY(0deg)';
    }));
    setTimeout(() => { fpos = t; setSlot(pgRight, scrRight(t)); renderSpread(); pgFlip.style.display = 'none'; fAnim = false; }, FLIP_MS + 30);
  }
}
if (flipReader) {
  const flipNext = document.getElementById('flipNext');
  const flipPrev = document.getElementById('flipPrev');
  const flipClose = document.getElementById('flipClose');
  if (flipNext) flipNext.onclick = nextPage;
  if (flipPrev) flipPrev.onclick = prevPage;
  if (flipClose) flipClose.onclick = closeFlip;
  flipReader.onclick = e => { if (e.target === flipReader) closeFlip(); };
}

document.addEventListener('keydown', e => {
  if (lb && lb.classList.contains('open')) {
    if (e.key === 'Escape') lb.classList.remove('open');
    if (e.key === 'ArrowLeft') lbMove(-1);
    if (e.key === 'ArrowRight') lbMove(1);
  }
  if (flipReader && flipReader.classList.contains('open')) {
    if (e.key === 'Escape') closeFlip();
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft') prevPage();
  }
});

initPortfolio();
