/* Elmgrove Games mock-up. Vanilla JS, hash routes, one persistent <audio>. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var app = $('#main'), audio = $('#player');
  var S = { games: [], by: {}, C: {}, tracks: [], cur: -1, filter: 'all', ready: false, shots: [], shotI: 0 };
  var GEMS = ['hero', 'home', 'arcade', 'game', 'jukebox', 'crew', 'timeline', 'notices'];
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function fmt(t) {
    if (!isFinite(t)) return '0:00';
    t = Math.floor(t);
    return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
  }

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  /* ---------- loot hunt ---------- */
  var found = [];
  try { found = JSON.parse(store('elmgrove-loot') || '[]').filter(function (x) { return GEMS.indexOf(x) > -1; }); } catch (e) { found = []; }
  function lootUI() {
    $('#loot-n').textContent = found.length + '/' + GEMS.length;
    $('#loot').classList.toggle('all', found.length === GEMS.length);
  }
  function gem(id, style) {
    if (found.indexOf(id) > -1) return '';
    return '<button type="button" class="emerald" data-gem="' + id + '" aria-label="Emerald" style="' + style + '">' + ic('gem') + '</button>';
  }
  function grab(btn) {
    var id = btn.getAttribute('data-gem');
    if (found.indexOf(id) < 0) found.push(id);
    store('elmgrove-loot', JSON.stringify(found));
    btn.classList.add('pop');
    setTimeout(function () { if (btn.parentNode) btn.parentNode.removeChild(btn); }, reduce ? 0 : 450);
    lootUI();
    var left = GEMS.length - found.length;
    toast(left ? '+1 loot. ' + left + ' to go.' : "You've looted the whole treehouse. A true goblin.");
  }

  /* ---------- sound toggle (route-change blip) ---------- */
  var soundOn = store('elmgrove-sound') === '1', blip = null;
  function soundUI() { $('#snd').setAttribute('aria-pressed', soundOn ? 'true' : 'false'); }
  function playBlip() {
    if (!soundOn) return;
    try {
      if (!blip) { blip = new Audio('assets/sounds/portal.wav'); blip.volume = 0.25; }
      blip.currentTime = 0;
      var p = blip.play(); if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  /* ---------- data helpers ---------- */
  function tagFor(g) {
    var t = (S.C.tags || {})[g.slug];
    if (t) return t;
    return '';  // status tags come only from content.json (manager, 17 Nov)
  }
  function tagHtml(g) { var t = tagFor(g); return t ? '<span class="tag">' + esc(t) + '</span>' : ''; }
  function order() {
    var f = S.C.featured || [];
    var rest = S.games.filter(function (g) { return f.indexOf(g.slug) < 0; });
    return f.map(function (s) { return S.by[s]; }).filter(Boolean).concat(rest);
  }
  function featured() { return (S.C.featured || []).map(function (s) { return S.by[s]; }).filter(Boolean); }
  function backroom() { var f = S.C.featured || []; return S.games.filter(function (g) { return f.indexOf(g.slug) < 0; }); }
  function team(g) { return (S.C.credits || {})[g.slug] || (g.authors || []).join(', '); }
  function dataAttrs(g) { return ' data-b="' + (g.browser_playable ? 1 : 0) + '" data-d="' + (g.downloadable ? 1 : 0) + '"'; }

  function cabinet(g, big) {
    var inner =
      '<span class="cab-top"><span class="cab-marquee">' + esc(g.title) + '</span></span>' +
      '<span class="cab-body"><span class="cab-bezel"><span class="cab-screen">' + (big && g.clip && !reduce
        ? '<video src="' + esc(g.clip) + '" poster="' + esc(g.screen) + '" muted loop autoplay playsinline></video>'
        : '<img src="' + esc(g.screen) + '" alt="' + (big ? esc(g.title) + ' screenshot' : '') + '" decoding="async">') +
      '</span></span><span class="cab-panel"><i class="stick"></i><i class="btnc b1"></i><i class="btnc b2"></i><span class="cab-year">' + g.year + '</span></span></span>' +
      '<span class="cab-kick"></span>' +
      '<span class="cab-plaque">' + tagHtml(g) + '</span>';
    if (big) return '<div class="cab lg">' + inner + '</div>';
    return '<a class="cab" href="#game-' + g.slug + '"' + dataAttrs(g) + ' aria-label="' + esc(g.title) + ', ' + g.year + '">' + inner + '</a>';
  }
  function cartridge(g) {
    return '<a class="cart" href="#game-' + g.slug + '"' + dataAttrs(g) + ' aria-label="' + esc(g.title) + ', ' + g.year + '">' +
      '<span class="cart-body"><span class="cart-img"><img src="' + esc(g.cover) + '" alt="" decoding="async"></span>' +
      '<span class="cart-lab">' + esc(g.title) + '</span><span class="cart-yr">' + g.year + ' ' + tagHtml(g) + '</span></span></a>';
  }
  function noticeHtml(n) {
    var d = new Date(n.date + 'T12:00:00');
    var ds = isNaN(d) ? n.date : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return '<article class="note">' + (n.example ? '<span class="tag ex">Example</span>' : '') +
      '<h3>' + esc(n.title) + '</h3><time datetime="' + esc(n.date) + '">' + esc(ds) + '</time><p>' + esc(n.body) + '</p></article>';
  }

  /* ---------- views: each returns {title, html, after} ---------- */
  function vHome() {
    var n = S.games.length, minY = Math.min.apply(null, S.games.map(function (g) { return g.year; }));
    var notes = (S.C.notices || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 2);
    return { title: 'The Treehouse', html:
      '<section class="hero"><div class="window rel">' + gem('hero', 'left:14px;bottom:-6px') +
      '<div class="glass"><img class="pix" src="assets/logo.png" alt="The Elmgrove Games logo: a low-poly elm tree with sunglasses, holding a gun" width="256" height="144"></div><div class="sill"></div></div>' +
      '<div><span class="tag">Open late</span><h1 tabindex="-1">Climb in. The arcade&rsquo;s open.</h1>' +
      '<p class="lead">Elmgrove Games: indie game devs out of Seattle, WA. We make strange little games, mostly about goblins lately.</p>' +
      '<div class="btns"><a class="btn" href="#arcade">Enter the arcade</a><a class="btn alt" href="#crew">Meet the crew</a></div></div></section>' +
      '<section class="sect"><h2>Now playing</h2><div class="cabs four">' + featured().map(function (g) { return cabinet(g); }).join('') + '</div></section>' +
      '<section class="sect"><h2>What we do</h2><div class="grid3">' +
      '<div class="board"><h3>Games, fast</h3><p>' + n + ' games on itch.io since ' + minY + ', many of them started at game jams and some still growing.</p></div>' +
      '<div class="board"><h3>3D and first-person</h3><p>With Loot n&rsquo; Goblin we went 3D and first-person: a goblin, a dungeon and a lot of green loot.</p></div>' +
      '<div class="board rel"><h3>Unity, and more</h3><p>Unity, RPG Maker and Stencyl so far, and always trying new tools.</p>' + gem('home', 'right:6px;bottom:4px') + '</div></div></section>' +
      '<section class="sect"><div class="teaser"><h2>Something is digging under the roots.</h2><p>More when it surfaces.</p>' +
      '<svg viewBox="0 0 400 46" preserveAspectRatio="none" aria-hidden="true"><path d="M0 46 C40 20 60 40 100 14 S160 36 200 8 S270 40 320 16 S380 30 400 20 L400 46Z" fill="#1a0e26"/><path d="M60 46 C70 30 90 30 96 20 M250 46 C255 30 280 28 286 14" stroke="#3a2414" stroke-width="3" fill="none"/></svg></div></section>' +
      '<section class="sect"><h2>From the notice board</h2><div class="notes">' + notes.map(noticeHtml).join('') + '</div>' +
      '<p><a href="#notices">See the whole board</a></p></section>' };
  }

  function vArcade() {
    var chips = [['all', 'All'], ['b', 'Plays in browser'], ['d', 'Download']].map(function (c) {
      return '<button type="button" class="chip" data-f="' + c[0] + '" aria-pressed="' + (S.filter === c[0]) + '">' + c[1] + '</button>';
    }).join('');
    return { title: 'The Arcade', html:
      '<h1 tabindex="-1">The Arcade</h1><p class="lead">Pick a cabinet. Every game here lives on itch.io.</p>' +
      '<div class="chips" role="group" aria-label="Filter games">' + chips + '</div>' +
      '<section class="sect" data-sec><h2>On the floor</h2><div class="cabs">' + featured().map(function (g) { return cabinet(g); }).join('') + '</div><p class="empty" hidden>Nothing on this floor matches. Try another filter.</p></section>' +
      '<section class="sect" data-sec><h2>The back room</h2><p class="muted">Older and smaller games, kept on the shelf.</p><div class="shelf rel">' +
      backroom().map(cartridge).join('') + gem('arcade', 'right:2px;top:-18px') + '</div><p class="empty" hidden>Nothing in the back room matches. Try another filter.</p></section>',
      after: applyFilter };
  }
  function applyFilter() {
    $$('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-f') === S.filter); });
    $$('[data-sec]').forEach(function (sec) {
      var any = false;
      $$('[data-b]', sec).forEach(function (it) {
        var ok = S.filter === 'all' || (S.filter === 'b' && it.dataset.b === '1') || (S.filter === 'd' && it.dataset.d === '1');
        it.hidden = !ok; if (ok) any = true;
      });
      $('.empty', sec).hidden = any;
    });
  }

  function vGame(slug) {
    var g = S.by[slug]; if (!g) return null;
    var o = order(), i = o.indexOf(g), pv = o[(i + o.length - 1) % o.length], nx = o[(i + 1) % o.length];
    var q = (S.C.quotes || {})[slug], tr = (S.C.trailers || {})[slug];
    var shots = g.shots || [];
    var btns = '';
    if (g.browser_playable) btns += '<a class="btn" href="' + esc(g.url) + '" target="_blank" rel="noopener">Play in your browser on itch ' + ic('ext') + '</a>';
    if (g.downloadable) btns += '<a class="btn' + (g.browser_playable ? ' alt' : '') + '" href="' + esc(g.url) + '" target="_blank" rel="noopener">Download on itch ' + ic('ext') + '</a>';
    if (tr) btns += '<a class="btn alt" href="' + esc(tr) + '" target="_blank" rel="noopener">Watch the trailer ' + ic('ext') + '</a>';
    var price = (g.price === 0 || g.price === '0' || !g.price) ? 'Free' : g.price;
    return { title: g.title, html:
      '<p class="small"><a href="#arcade">The Arcade</a> / ' + esc(g.title) + '</p>' +
      '<div class="gp"><div>' + cabinet(g, true) + '</div><div><h1 tabindex="-1">' + esc(g.title) + '</h1>' +
      '<p class="tagline">' + (g.tagline ? esc(g.tagline) : '<span class="ph">[tagline?]</span>') + '</p>' + tagHtml(g) +
      '<dl class="facts">' +
      '<div><dt>Year</dt><dd>' + g.year + '</dd></div>' +
      '<div><dt>Engine</dt><dd>' + (g.made_with ? esc(g.made_with) : '<span class="ph">[engine?]</span>') + '</dd></div>' +
      '<div><dt>Platforms</dt><dd>' + esc((g.platforms || []).join(', ') || '?') + '</dd></div>' +
      '<div><dt>Made for</dt><dd>' + (g.jam ? esc(g.jam.name) : '<span class="ph">[jam?]</span>') + '</dd></div>' +
      '<div><dt>Team</dt><dd>' + esc(team(g)) + '</dd></div></dl>' +
      '<p>' + (g.description ? esc(g.description) : '<span class="ph">[description?]</span>') + '</p>' +
      '<div class="btns">' + btns + '<span class="tag">' + esc(price) + '</span></div>' +
      '<p class="small">Hosted on itch.io</p></div></div>' +
      (shots.length ? '<section class="sect rel"><h2>Screenshots</h2><div class="gal">' + shots.map(function (s, k) {
        return '<button type="button" data-shot="' + k + '" aria-label="Open screenshot ' + (k + 1) + ' of ' + shots.length + '"><img src="' + esc(s) + '" alt="" loading="lazy" decoding="async"></button>';
      }).join('') + '</div>' + gem('game', 'right:4px;bottom:-26px') + '</section>' : gem('game', '')) +
      '<div class="grid3" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))">' +
      (q ? '<section class="board"><h3>Players said</h3><blockquote class="quote">&ldquo;' + esc(q) + '&rdquo;<cite>' + esc(S.C.quote_credit || 'itch.io comment') + '</cite></blockquote></section>' : '') +
      '<section class="board"><h3>Behind the scenes <span class="tag ex">Example</span></h3><p class="ph">Notes from the team go here.</p></section></div>' +
      '<nav class="pn" aria-label="Other cabinets"><a href="#game-' + pv.slug + '">' + ic('left') + '<span>' + esc(pv.title) + '</span></a>' +
      '<a href="#game-' + nx.slug + '"><span>' + esc(nx.title) + '</span>' + ic('right') + '</a></nav>',
      after: function () { S.shots = shots; } };
  }

  function vJuke() {
    var rows = S.tracks.map(function (t, i) {
      if (!t.src) {
        return '<li><div class="track locked" aria-disabled="true"><span class="tn">' + ic('lock') + '</span><span class="tt">' + esc(t.title) + '</span><span class="tl">Locked</span><span class="tg">' + esc(t.game) + ' &middot; ' + esc(t.locked_note || 'Soundtrack coming: send us the files') + '</span></div></li>';
      }
      return '<li><button type="button" class="track" data-i="' + i + '"><span class="tn">' + (i + 1) + '</span><span class="tt">' + esc(t.title) + '</span><span class="tl">' + esc(t.length || '') + '</span><span class="tg">' + esc(t.game) + '</span></button></li>';
    }).join('');
    return { title: 'The Jukebox', html:
      '<h1 tabindex="-1">The Jukebox</h1><p class="lead">Press play. The music keeps going while you wander the treehouse.</p>' +
      '<section class="deck rel" id="deck">' + gem('jukebox', 'right:8px;top:-12px') +
      '<div class="deck-top"><div class="lcd"><div class="lcd-title" id="jb-title">Pick a track</div><div class="lcd-game" id="jb-game">&nbsp;</div>' +
      '<div class="lcd-time"><span id="jb-cur">0:00</span> / <span id="jb-len">-:--</span></div></div>' +
      '<div class="reels" aria-hidden="true"><i class="reel"></i><i class="reel"></i></div></div>' +
      '<input type="range" class="seek" id="jb-seek" min="0" max="1000" value="0" aria-label="Seek" disabled>' +
      '<div class="ctrls"><button type="button" class="ctrl" id="jb-prev" aria-label="Previous track">' + ic('prev') + '</button>' +
      '<button type="button" class="ctrl big" id="jb-play" aria-label="Play">' + ic('play') + '</button>' +
      '<button type="button" class="ctrl" id="jb-next" aria-label="Next track">' + ic('next') + '</button></div></section>' +
      '<ol class="tracks" aria-label="Tracks">' + rows + '</ol>',
      after: syncPlayer };
  }

  function vCrew() {
    var cols = ['#e3a443', '#8fd67e', '#c25cb1', '#7ab8e8'];
    var years = S.games.slice().sort(function (a, b) { return b.year - a.year; });
    return { title: 'The Crew', html:
      '<h1 tabindex="-1">The Crew</h1><p class="lead">The goblins behind the cabinets.</p>' +
      '<div class="crew">' + (S.C.crew || []).map(function (c, i) {
        var role = /^\[.*\]$/.test(c.role) ? '<span class="ph">' + esc(c.role) + '</span>' : esc(c.role);
        return '<div class="board rel"><div class="portrait" style="background:' + cols[i % 4] + '" aria-hidden="true">' + esc(c.name.charAt(0)) + '</div><h3>' + esc(c.name) + '</h3><p>' + role + '</p>' +
          (i === 1 ? gem('crew', 'right:6px;bottom:4px') : '') + '</div>';
      }).join('') + '</div>' +
      '<section class="sect"><h2>Our games over the years</h2><ol class="timeline rel">' + years.map(function (g) {
        return '<li><span class="yr">' + g.year + '</span><br><a href="#game-' + g.slug + '">' + esc(g.title) + '</a> ' + tagHtml(g) + '</li>';
      }).join('') + gem('timeline', 'left:-4px;bottom:-14px') + '</ol></section>' +
      '<section class="sect"><h2>Find us</h2><div class="board contact"><code id="mail">' + esc(S.C.contact || '') + '</code>' +
      '<button type="button" class="btn alt" id="copy">' + ic('copy') + ' Copy</button>' +
      '<a class="btn" href="' + esc(S.C.itch || 'https://elmgrove.itch.io/') + '" target="_blank" rel="noopener">Elmgrove on itch.io ' + ic('ext') + '</a></div></section>' };
  }

  function vNotices() {
    var n = (S.C.notices || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    return { title: 'Notice board', html:
      '<h1 tabindex="-1">Notice board</h1><p class="lead">Devlogs, jam diaries and news would live here.</p>' +
      '<div class="notes rel">' + n.map(noticeHtml).join('') + gem('notices', 'right:30px;bottom:-4px') + '</div>' };
  }

  /* ---------- router ---------- */
  var first = true;
  function route() {
    if (!S.ready) return;
    var h = (location.hash || '#home').slice(1), v = null, nav = 'home';
    if (h === 'home') v = vHome();
    else if (h === 'arcade') { v = vArcade(); nav = 'arcade'; }
    else if (h === 'jukebox') { v = vJuke(); nav = 'jukebox'; }
    else if (h === 'crew') { v = vCrew(); nav = 'crew'; }
    else if (h === 'notices') { v = vNotices(); nav = 'notices'; }
    else if (h.indexOf('game-') === 0) { v = vGame(h.slice(5)); nav = 'arcade'; }
    if (!v) { if (location.hash) { try { history.replaceState(null, '', '#home'); } catch (e) { location.hash = '#home'; } } v = vHome(); nav = 'home'; }
    closeLb();
    app.innerHTML = v.html;
    document.title = v.title + ' \u00b7 Elmgrove Games';
    $$('.nav a').forEach(function (a) { if (a.dataset.r === nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    markPix(app);
    if (v.after) v.after();
    window.scrollTo(0, 0);
    var hd = $('h1', app); if (hd) hd.focus({ preventScroll: true });
    var cur = $('.nav a[aria-current]'); if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: 'nearest', inline: 'center' }); window.scrollTo(0, 0); } catch (e) {} }
    if (!first) playBlip();
    first = false;
  }

  /* small images are scaled crisply */
  function markPix(root) {
    $$('img', root).forEach(function (im) {
      var set = function () { if (im.naturalWidth && im.naturalWidth < 400) im.classList.add('pix'); };
      if (im.complete) set(); else im.addEventListener('load', set, { once: true });
    });
  }

  /* ---------- lightbox ---------- */
  var lbFrom = null;
  function showShot(i) {
    var n = S.shots.length; if (!n) return;
    S.shotI = (i + n) % n;
    var im = $('#lb-img'); im.classList.remove('pix');
    im.onload = function () { if (im.naturalWidth < 400) im.classList.add('pix'); };
    im.src = S.shots[S.shotI];
    im.alt = 'Screenshot ' + (S.shotI + 1) + ' of ' + n;
    $('#lb-cap').textContent = (S.shotI + 1) + ' / ' + n;
    $('#lb-p').hidden = $('#lb-nx').hidden = n < 2;
  }
  function openLb(i, from) { lbFrom = from; $('#lb').hidden = false; showShot(i); $('#lb-x').focus(); }
  function closeLb() {
    var lb = $('#lb'); if (lb.hidden) return;
    lb.hidden = true; $('#lb-img').removeAttribute('src');
    if (lbFrom && document.body.contains(lbFrom)) lbFrom.focus();
    lbFrom = null;
  }

  /* ---------- player ---------- */
  function playable(from, dir) {
    var n = S.tracks.length;
    for (var k = 1; k <= n; k++) {
      var i = (from + dir * k + n * 2) % n;
      if (S.tracks[i].src) return i;
    }
    return -1;
  }
  function load(i) {
    var t = S.tracks[i]; if (!t || !t.src) return false;
    if (S.cur !== i) { S.cur = i; audio.src = t.src; }
    return true;
  }
  function play(i) {
    if (!load(i)) return;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { toast("Couldn't play that track."); syncPlayer(); });
    syncPlayer();
  }
  function toggle() {
    if (S.cur < 0) { var i = playable(-1, 1); if (i > -1) play(i); else toast('No playable tracks yet.'); return; }
    if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); } else audio.pause();
  }
  function step(d) { var i = playable(S.cur < 0 ? (d > 0 ? -1 : 0) : S.cur, d); if (i > -1) play(i); }
  function syncPlayer() {
    var t = S.tracks[S.cur], on = S.cur > -1 && !audio.paused;
    $('#np').hidden = S.cur < 0;
    document.body.classList.toggle('has-np', S.cur > -1);
    if (t) $('#np-title').textContent = t.title + ' \u00b7 ' + t.game;
    $('#np-play').innerHTML = ic(on ? 'pause' : 'play');
    $('#np-play').setAttribute('aria-label', on ? 'Pause' : 'Play');
    var d = $('#deck'); if (!d) { tick(); return; }
    d.classList.toggle('playing', on);
    $('#jb-title').textContent = t ? t.title : 'Pick a track';
    $('#jb-game').textContent = t ? t.game : '\u00a0';
    $('#jb-play').innerHTML = ic(on ? 'pause' : 'play');
    $('#jb-play').setAttribute('aria-label', on ? 'Pause' : 'Play');
    $('#jb-seek').disabled = S.cur < 0;
    $$('.track[data-i]').forEach(function (b) { b.classList.toggle('on', +b.dataset.i === S.cur); });
    tick();
  }
  function tick() {
    var cur = audio.currentTime || 0, dur = audio.duration, t = S.tracks[S.cur];
    var has = isFinite(dur) && dur > 0;
    $('#np-time').textContent = fmt(cur);
    $('#np-fill').style.width = has ? (cur / dur * 100) + '%' : '0';
    if ($('#jb-cur')) {
      $('#jb-cur').textContent = fmt(cur);
      $('#jb-len').textContent = has ? fmt(dur) : (t && t.length ? t.length : '-:--');
      var sk = $('#jb-seek'); if (has && document.activeElement !== sk) sk.value = Math.round(cur / dur * 1000);
    }
  }
  ['play', 'pause', 'loadedmetadata'].forEach(function (e) { audio.addEventListener(e, syncPlayer); });
  audio.addEventListener('timeupdate', tick);
  audio.addEventListener('ended', function () { var i = playable(S.cur, 1); if (i > -1 && i !== S.cur) play(i); else syncPlayer(); });
  audio.addEventListener('error', function () { if (S.cur > -1) toast("Couldn't load that track."); });

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if ((el = t.closest('.emerald'))) { e.preventDefault(); grab(el); return; }
    if ((el = t.closest('.chip'))) { S.filter = el.dataset.f; applyFilter(); return; }
    if ((el = t.closest('[data-shot]'))) { openLb(+el.dataset.shot, el); return; }
    if ((el = t.closest('button.track[data-i]'))) { var i = +el.dataset.i; if (i === S.cur) toggle(); else play(i); return; }
    if (t.closest('#jb-play') || t.closest('#np-play')) { toggle(); return; }
    if (t.closest('#jb-prev')) { step(-1); return; }
    if (t.closest('#jb-next')) { step(1); return; }
    if (t.closest('#lb-x')) { closeLb(); return; }
    if (t.closest('#lb-p')) { showShot(S.shotI - 1); return; }
    if (t.closest('#lb-nx')) { showShot(S.shotI + 1); return; }
    if (t.id === 'lb') { closeLb(); return; }
    if (t.closest('#loot')) { toast(found.length === GEMS.length ? 'All eight emeralds found.' : 'Eight emeralds are hidden around the treehouse. Look closely.'); return; }
    if (t.closest('#snd')) { soundOn = !soundOn; store('elmgrove-sound', soundOn ? '1' : '0'); soundUI(); toast(soundOn ? 'Sound on.' : 'Sound off.'); return; }
    if (t.closest('#reset-loot')) { found = []; store('elmgrove-loot', '[]'); lootUI(); toast('Loot reset.'); route(); return; }
    if (t.closest('#copy')) { copyMail(); return; }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'jb-seek' && isFinite(audio.duration)) audio.currentTime = e.target.value / 1000 * audio.duration;
  });
  document.addEventListener('keydown', function (e) {
    if ($('#lb').hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') showShot(S.shotI - 1);
    else if (e.key === 'ArrowRight') showShot(S.shotI + 1);
    else if (e.key === 'Tab') {
      var f = $$('#lb button').filter(function (b) { return !b.hidden; });
      if (!f.length) return;
      var a = f.indexOf(document.activeElement);
      if (e.shiftKey && a <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && a === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  function copyMail() {
    var m = S.C.contact || '', ok = function () { toast('Copied ' + m); }, bad = function () {
      var r = document.createRange(); r.selectNodeContents($('#mail'));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); toast('Press Ctrl+C to copy.');
    };
    try { navigator.clipboard.writeText(m).then(ok, bad); } catch (e) { bad(); }
  }
  window.addEventListener('hashchange', route);

  /* ---------- boot ---------- */
  function getJSON(u) {
    return fetch(u).then(function (r) { if (!r.ok) throw new Error(u + ' (' + r.status + ')'); return r.json(); });
  }
  soundUI(); lootUI();
  Promise.all([getJSON('data/games.json'), getJSON('data/content.json'), getJSON('data/tracks.json')]).then(function (d) {
    S.games = d[0]; S.C = d[1]; S.tracks = d[2];
    S.games.forEach(function (g) { S.by[g.slug] = g; });
    S.ready = true; route();
  }).catch(function (err) {
    app.innerHTML = '<div class="err"><h1 tabindex="-1">The lanterns went out</h1><p>We could not load the site data: ' + esc(err.message) +
      '.</p><p class="muted">If you opened this file directly, serve the folder over http (for example <code>python3 -m http.server</code>) and reload.</p></div>';
  });
})();
