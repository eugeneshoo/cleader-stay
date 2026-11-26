// CLEADER STAY 홈페이지 (사진 중심 고급형, 2026-11-25). 숙소·빈 날짜·접수는 클리더 스크립트에서 로그인 없이 주고받습니다.
(function () {
  'use strict';
  var API = 'https://script.google.com/macros/s/AKfycbwXneEon-Nujp2Z5_tSrp0gQTUAHrkzYx4oTWr7uRDXAfmq3UgxKPCI7ys76DFx9rfC/exec';
  var TEL = '1668-2817';
  // 대표 사진(드라이브 '클리더 홈페이지 사진' 폴더). 바꾸려면 아래 주소만 교체.
  var PIC = {
    hero: 'https://lh3.googleusercontent.com/d/1ghyKpU0HUYx2Y_3aLKrkRWWqRmZXsTKu=w2000', heroRoom: '다담애월하나',
    hostBand: 'https://lh3.googleusercontent.com/d/1-58aXqorwNjjmPJsX5pMusYyA9bEsCCs=w1600',
    hostHero: 'https://lh3.googleusercontent.com/d/19bX30QO0jD7OCIeg-_FtciLpwW3YUyPS=w2000'
  };
  var page = document.body.getAttribute('data-page');
  function $(s, r) { return (r || document).querySelector(s); }
  function E(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function sized(u, w) { return u ? String(u).replace(/=w\d+$/, '=w' + w) : u; }
  function get(params) {
    return fetch(API + '?page=hp901&' + new URLSearchParams(params).toString(), { credentials: 'omit', cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { if (!j || !j.ok) throw new Error(j && j.err || '불러오지 못했습니다.'); return j; });
  }
  function post(body) {
    return fetch(API + '?page=hp901', { method: 'POST', credentials: 'omit', body: JSON.stringify(body) }).then(function (r) { return r.json(); }).then(function (j) { if (!j || !j.ok) throw new Error(j && j.err || '보내지 못했습니다.'); return j; });
  }
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function add(s, n) { var d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return ymd(d); }
  function today() { return ymd(new Date()); }
  function nights(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5); }
  function md(s) { return Number(s.slice(5, 7)) + '/' + Number(s.slice(8, 10)); }
  // ---------- 지역 (전국 확장용) ----------
  var RG = window.REGIONS || { PROV: [], ALIAS: {}, CITY: {}, COVER: {}, LINE: {} };
  var PROVS = RG.PROV.map(function (p) { return p[0]; });
  function regionOf(area) {
    var w = String(area || '').trim().split(/\s+/), first = w[0] || '';
    if (!first) return { prov: '기타', sub: '' };
    var isProv = PROVS.indexOf(first) >= 0 || !!RG.ALIAS[first];
    var prov = PROVS.indexOf(first) >= 0 ? first : RG.ALIAS[first] || RG.CITY[first] || '';
    if (prov) return { prov: prov, sub: isProv ? w.slice(1).join(' ') : w.join(' ') };
    return { prov: first, sub: w.slice(1).join(' ') };
  }
  function areaLabel(r) { var g = regionOf(r.area); return g.sub && g.sub !== g.prov ? g.prov + ' · ' + g.sub : g.prov; }
  function provOrder(p) { var i = PROVS.indexOf(p); return i < 0 ? 99 : i; }
  // 지역 고르기 값: 'p:경기'(시·도 전체) / 'a:청평'(세부 지역) / 예전 값('제주') 모두 받음
  function areaMatch(r, v) {
    if (!v) return true; var g = regionOf(r.area);
    if (v.indexOf('p:') === 0) return g.prov === v.slice(2);
    if (v.indexOf('a:') === 0) return (g.sub || '').split(/\s+/)[0] === v.slice(2);
    return g.prov === v || (r.area || '').indexOf(v) === 0;
  }
  function areaName(v) { return !v ? '' : v.replace(/^[pa]:/, ''); }
  function groupRegions(list) {
    var map = {};
    list.forEach(function (r) {
      var g = regionOf(r.area), k = g.prov; map[k] = map[k] || { prov: k, rooms: [], subs: [] }; map[k].rooms.push(r);
      var s = (g.sub || '').split(/\s+/)[0]; if (s && map[k].subs.indexOf(s) < 0) map[k].subs.push(s);
    });
    return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return provOrder(a.prov) - provOrder(b.prov) || b.rooms.length - a.rooms.length; });
  }
  // ---------- 머리·꼬리 ----------
  function chrome() {
    var hd = $('#hd'); if (hd) {
      hd.className = 'hd';
      hd.innerHTML = '<div class="wrap"><a class="logo" href="./">CLEADER STAY<small>STAY ALL CARE SERVICE</small></a>' +
        '<nav class="nav" id="nav"><a href="./#all" data-p="home">숙소</a><a href="./?type=%ED%95%9C%EB%8B%AC%EC%82%B4%EC%9D%B4#all" data-p="month">한달살이</a><a href="guide.html" data-p="guide">여행 가이드</a><a href="host.html" data-p="host">숙소 맡기기</a><a class="tel" href="tel:' + TEL + '">' + TEL + '</a></nav>' +
        '<button class="menu-btn" type="button" aria-label="메뉴">☰</button></div>';
      var nav = $('#nav');
      var over = document.body.classList.contains('over');
      var paintHd = function () { if (!over) return; hd.classList.toggle('solid', window.scrollY > 40 || nav.classList.contains('open')); document.body.classList.toggle('scrolled', window.scrollY > innerHeight * 0.8); };
      $('.menu-btn').onclick = function () { nav.classList.toggle('open'); paintHd(); };
      Array.prototype.forEach.call(nav.querySelectorAll('a[data-p]'), function (a) { if (a.getAttribute('data-p') === page) a.classList.add('on'); a.addEventListener('click', function () { nav.classList.remove('open'); paintHd(); }); });
      if (over) { window.addEventListener('scroll', paintHd, { passive: true }); paintHd(); }
    }
    var ft = $('#ft'); if (ft) {
      ft.className = 'ft';
      ft.innerHTML = '<div class="wrap"><div class="cols"><div><a class="logo" href="./">CLEADER STAY<small>STAY ALL CARE SERVICE</small></a><div>주식회사 클리더 · 숙소 청소 · 위탁운영 · 직접 예약<br>운영 지역 <span id="ftArea">제주 · 경기 · 강원</span></div><div class="biz">주식회사 클리더 · 대표 <img src="ceo.png" alt="대표자" width="40" height="18" loading="lazy"><br>사업자등록번호 630-86-02860<br>통신판매업 신고 2023-제주아라-0132호<br>제주시 번영로 474</div></div>' +
        '<div><h4>CONTACT</h4>대표번호 <a href="tel:' + TEL + '">' + TEL + '</a><br><a href="host.html#form">숙소 맡기기 상담</a><br>위탁 호스트님은 받으신 현황 링크로 접속해 주세요.</div>' +
        '<div><h4>INFO</h4><a href="guide.html">여행 가이드</a><br><a href="privacy.html">개인정보 처리 안내</a></div></div>' +
        '<div class="bot">© CLEADER. All rights reserved.</div></div>';
    }
    if (page !== 'room') { var call = E('a', 'call', '☎ 전화 문의'); call.href = 'tel:' + TEL; document.body.append(call); }
  }
  // ---------- 숙소 카드 ----------
  // 빠른 길: 스크립트가 2분마다 써 두는 공개 시트(숙소 + 400일 예약된 밤)를 바로 읽음. 못 읽으면 스크립트 주소로.
  var PUB_SHEET = '1AMyKOKDaZ1FtKWNQ-BESY2Vq173OjdJdvAT_-CEH-Nc';
  var PUBP = null;
  function pub() {
    if (PUBP) return PUBP;
    PUBP = new Promise(function (res, rej) {
      if (!PUB_SHEET) { rej(new Error('no sheet')); return; }
      var cb = '__hp' + Date.now(), s = document.createElement('script'), done = false;
      var t = setTimeout(function () { fin(new Error('timeout')); }, 5000);
      function fin(err, val) { if (done) return; done = true; clearTimeout(t); try { delete window[cb]; } catch (e) { window[cb] = undefined; } s.remove(); if (err) rej(err); else res(val); }
      window[cb] = function (r) {
        try {
          if (!r || r.status === 'error') throw new Error('sheet error');
          var txt = (r.table.rows || []).map(function (x) { return x.c && x.c[0] && x.c[0].v || ''; }).join('');
          var p = JSON.parse(txt); if (!p || !p.rooms || !p.busy) throw new Error('bad pack'); fin(null, p);
        } catch (e) { fin(e); }
      };
      s.onerror = function () { fin(new Error('load')); };
      s.src = 'https://docs.google.com/spreadsheets/d/' + PUB_SHEET + '/gviz/tq?headers=0&tq=' + encodeURIComponent('select A') + '&tqx=responseHandler:' + cb + '&_=' + Math.floor(Date.now() / 60000);
      document.head.append(s);
    });
    PUBP.catch(function () {});
    return PUBP;
  }
  // 빈 날짜: 공개 시트에서 기간만 잘라 씀 → 못 하면 스크립트에 물어봄
  function avail(room, from, to) {
    return pub().then(function (p) {
      if (from < p.from || to > p.to) throw new Error('range');
      var out = {}; Object.keys(p.busy).forEach(function (id) { if (room === 'all' || id === room) out[id] = p.busy[id].filter(function (d) { return d >= from && d < to; }); });
      return { ok: true, busy: out, at: p.at };
    }).catch(function () { return get({ fn: 'avail', room: room, from: from, to: to }); });
  }
  var ROOMS = null;
  function rooms() {
    if (ROOMS) return Promise.resolve(ROOMS);
    return pub().then(function (p) { return p.rooms; }, function () { return get({ fn: 'rooms' }).then(function (j) { return j.rooms || []; }); })
      .then(function (l) { ROOMS = l; return ROOMS; });
  }
  function priceText(r) { var p = String(r.price || '').trim(); return !p || p === '문의' ? '요금 문의' : p; }
  function card(r, state, w) {
    var a = E('a', 'room'); a.href = 'room.html?id=' + encodeURIComponent(r.id) + (state && state.q ? '&' + state.q : '');
    var ph = E('div', 'ph');
    if (r.photos && r.photos[0]) { var im = E('img'); im.loading = 'lazy'; im.decoding = 'async'; im.alt = r.name; im.src = sized(r.photos[0], w || 800); ph.append(im); }
    else { ph.classList.add('none'); ph.textContent = '사진 준비 중'; }
    if (state && state.label) ph.append(E('span', 'badge' + (state.no ? ' no' : ''), state.label));
    a.append(ph, E('div', 'area', areaLabel(r)), E('h3', '', r.name));
    var meta = [r.max ? '최대 ' + r.max + '명' : '', r.type].filter(Boolean).join(' · '); if (meta) a.append(E('div', 'meta', meta));
    if (r.line) a.append(E('div', 'meta', r.line));
    a.append(E('div', 'price', priceText(r)));
    return a;
  }
  function season() { var m = new Date(Date.now() + 14 * 864e5).getMonth() + 1; return m === 12 || m <= 2 ? '겨울' : m <= 5 ? '봄' : m <= 8 ? '여름' : '가을'; }
  // ---------- 홈 ----------
  function home() {
    var q = new URLSearchParams(location.search), grid = $('#grid'), chips = $('#chips'), filt = q.get('type') || '전체';
    var fArea = $('#f-area'), fIn = $('#f-in'), fOut = $('#f-out'), fPpl = $('#f-ppl');
    $('#hero').style.backgroundImage = 'url("' + (innerWidth < 700 ? sized(PIC.hero, 1200) : PIC.hero) + '")';
    $('#hostBand').style.backgroundImage = 'url("' + PIC.hostBand + '")';
    $('#featTitle').textContent = '이번 ' + season() + ', 머물기 좋은 곳';
    fIn.min = today(); fOut.min = add(today(), 1);
    if (q.get('in')) fIn.value = q.get('in'); if (q.get('out')) fOut.value = q.get('out'); if (q.get('ppl')) fPpl.value = q.get('ppl');
    fIn.onchange = function () { if (fIn.value) { fOut.min = add(fIn.value, 1); if (!fOut.value || fOut.value <= fIn.value) fOut.value = add(fIn.value, 1); } };
    grid.innerHTML = '<div class="empty">숙소를 불러오는 중…</div>'; $('#feature').innerHTML = '<div class="empty">불러오는 중…</div>';
    rooms().then(function (list) {
      var hr = list.find(function (r) { return r.name === PIC.heroRoom; });
      if (hr) $('#heroCredit').innerHTML = '<a href="room.html?id=' + encodeURIComponent(hr.id) + '" style="color:#fff;text-decoration:none">' + esc(hr.name) + ' · ' + esc(areaLabel(hr)) + ' →</a>';
      // 지역 고르기 (시·도 → 세부 지역)
      var groups = groupRegions(list);
      groups.forEach(function (g) {
        if (!g.subs.length) { var o = E('option', '', g.prov); o.value = 'p:' + g.prov; fArea.append(o); return; }
        var og = E('optgroup'); og.label = g.prov; var all = E('option', '', g.prov + ' 전체'); all.value = 'p:' + g.prov; og.append(all);
        g.subs.forEach(function (s) { var o = E('option', '', s); o.value = 'a:' + s; og.append(o); }); fArea.append(og);
      });
      var qa = q.get('area'); if (qa) { fArea.value = qa; if (fArea.value !== qa) { fArea.value = 'p:' + qa; if (!fArea.value) fArea.value = 'a:' + qa; } }
      $('#ftArea').textContent = groups.map(function (g) { return g.prov; }).join(' · ');
      // 추천 3곳 (사진 있는 숙소, 관리 화면 순서대로)
      var feat = list.filter(function (r) { return r.photos && r.photos.length; }).slice(0, 3), fb = $('#feature'); fb.innerHTML = '';
      feat.forEach(function (r, i) { fb.append(card(r, null, i ? 900 : 1400)); });
      // 지역 카드
      var rb = $('#regions');
      groups.forEach(function (g) {
        var a = E('a', 'region'); a.href = '?area=' + encodeURIComponent('p:' + g.prov) + '#all';
        var cover = RG.COVER[g.prov] || ((g.rooms.find(function (r) { return r.photos && r.photos.length; }) || {}).photos || [])[0];
        if (cover) a.style.backgroundImage = 'url("' + sized(cover, 900) + '")';
        a.innerHTML = '<div><b>' + esc(g.prov) + '</b><span>' + esc(RG.LINE[g.prov] || g.subs.join(' · ')) + ' · 숙소 ' + g.rooms.length + '곳</span></div>';
        a.onclick = function (ev) { ev.preventDefault(); fArea.value = 'p:' + g.prov; $('#searchForm').dispatchEvent(new Event('submit')); };
        rb.append(a);
      });
      var soon = E('a', 'region soon'); soon.href = 'host.html#form'; soon.innerHTML = '<div><b>다음 지역</b><span>우리 동네 숙소도 맡기고 싶다면 →</span></div>'; rb.append(soon);
      // 유형 칩
      var tags = ['전체', '단박', '한달살이']; list.forEach(function (r) { (r.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0 && tags.length < 12) tags.push(t); }); });
      tags.forEach(function (t) { var c = E('button', 'chip' + (t === filt ? ' on' : ''), t); c.type = 'button'; c.onclick = function () { filt = t; Array.prototype.forEach.call(chips.children, function (x) { x.classList.toggle('on', x.textContent === t); }); draw(); }; chips.append(c); });
      draw();
      if (q.get('in') && q.get('out')) $('#searchForm').dispatchEvent(new Event('submit'));
      else if (location.hash === '#all') $('#all').scrollIntoView();
    }, function (e) { grid.innerHTML = ''; $('#feature').innerHTML = ''; grid.append(E('div', 'empty', '숙소를 불러오지 못했습니다. 잠시 후 다시 열어 주세요. (' + e.message + ')')); });
    var busy = null;
    function draw() {
      var list = (ROOMS || []).filter(function (r) {
        if (!areaMatch(r, fArea.value)) return false;
        if (fPpl.value && r.max && Number(r.max) && Number(r.max) < Number(fPpl.value)) return false;
        if (filt === '전체') return true; if (filt === '단박' || filt === '한달살이') return (r.type || '').indexOf(filt) >= 0;
        return (r.tags || []).indexOf(filt) >= 0;
      });
      $('#allTitle').textContent = fArea.value ? areaName(fArea.value) + '의 숙소' : '모든 숙소';
      grid.innerHTML = ''; if (!list.length) { grid.append(E('div', 'empty', '조건에 맞는 숙소가 없습니다. 조건을 바꿔 보시거나 ' + TEL + '로 문의해 주세요.')); return; }
      var qs = fIn.value && fOut.value ? 'in=' + fIn.value + '&out=' + fOut.value + (fPpl.value ? '&ppl=' + fPpl.value : '') : '';
      list.forEach(function (r) {
        var st = { q: qs };
        if (busy && fIn.value && fOut.value) { var b = busy[r.id] || [], hit = b.some(function (d) { return d >= fIn.value && d < fOut.value; }); st.label = hit ? '선택 날짜 마감' : md(fIn.value) + '~' + md(fOut.value) + ' 예약 가능'; st.no = hit; }
        grid.append(card(r, st));
      });
    }
    $('#searchForm').onsubmit = function (ev) {
      ev.preventDefault();
      if (fIn.value && fOut.value && fOut.value > fIn.value) {
        grid.innerHTML = '<div class="empty">빈 날짜를 확인하는 중…</div>';
        avail('all', fIn.value, fOut.value).then(function (j) { busy = j.busy || {}; draw(); }, function () { busy = null; draw(); });
      } else { busy = null; draw(); }
      var u = new URLSearchParams(); if (fArea.value) u.set('area', fArea.value); if (fIn.value) u.set('in', fIn.value); if (fOut.value) u.set('out', fOut.value); if (fPpl.value) u.set('ppl', fPpl.value); if (filt !== '전체') u.set('type', filt);
      history.replaceState(null, '', '?' + u.toString() + '#all');
      $('#all').scrollIntoView();
    };
    guideTeaser($('#guideTeaser'), 3);
  }
  function guideTeaser(box, n, region) {
    if (!box || !window.GUIDE) return; box.innerHTML = '';
    window.GUIDE.filter(function (g) { return !region || g.region === region; }).slice(0, n || 6).forEach(function (g) {
      var a = E('a', 'gcard'); a.href = 'guide.html?a=' + g.slug; var p = E('div', 'gp');
      if (g.photo) p.style.backgroundImage = 'url("' + sized(g.photo, 900) + '")'; else p.style.background = g.color;
      a.append(p, E('small', '', [g.region, g.tag].filter(Boolean).join(' · ')), E('h3', '', g.title), E('p', '', g.summary)); box.append(a);
    });
  }
  // ---------- 숙소 상세 ----------
  function room() {
    var q = new URLSearchParams(location.search), id = q.get('id'), main = $('#main');
    rooms().then(function (list) {
      var r = list.find(function (x) { return x.id === id; });
      if (!r) { main.innerHTML = '<div class="empty">숙소를 찾지 못했습니다. <a href="./">숙소 목록으로</a></div>'; return; }
      document.title = r.name + ' · CLEADER STAY';
      var g = regionOf(r.area);
      $('#crumb').innerHTML = '<a href="./">CLEADER STAY</a> / <a href="./?area=' + encodeURIComponent('p:' + g.prov) + '#all">' + esc(g.prov) + '</a> / ' + esc(r.name);
      $('#r-area').textContent = areaLabel(r);
      // 클리더가 청소하지 않는 지역(regions.js CLEAN에 없는 시·도)은 청소 안내 대신 운영 안내
      var care = $('.care'); if (care && (RG.CLEAN || ['제주']).indexOf(g.prov) < 0) care.innerHTML = '<div><b>클리더가 운영하는 숙소</b><p>예약 확인과 입실 안내를 클리더가 맡습니다.</p></div><div><b>빈 날짜 바로 확인</b><p>운영 장부와 이어진 달력이라 보이는 빈 날이 실제 빈 날입니다.</p></div><div><b>대표번호 응대</b><p>머무는 동안 불편한 점은 ' + TEL + '로 알려 주세요.</p></div>';
      var gal = $('#gal'), ph = r.photos || [];
      if (ph.length) {
        ph.slice(0, 5).forEach(function (u, i) { var d = E('div'); d.style.backgroundImage = 'url("' + sized(u, i ? 900 : 1600) + '")'; d.onclick = function () { lightbox(ph, i); }; gal.append(d); });
        if (ph.length > 1) { var all = E('button', 'all', '사진 ' + ph.length + '장 모두 보기'); all.type = 'button'; all.onclick = function () { lightbox(ph, 0); }; gal.append(all); }
      } else { var d0 = E('div'); d0.style.cssText = 'grid-column:1/-1;grid-row:1/3;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#ece6dc,#d9cfbf);color:#8a7b64;cursor:default;font-family:var(--serif)'; d0.textContent = '사진 준비 중'; gal.append(d0); }
      $('#r-name').textContent = r.name;
      $('#r-meta').textContent = [r.max ? '최대 ' + r.max + '명' : '', r.type].filter(Boolean).join(' · ');
      var tags = $('#r-tags'); (r.tags || []).forEach(function (t) { tags.append(E('span', '', t)); });
      $('#r-line').textContent = r.line || '';
      $('#r-desc').textContent = r.desc || '숙소 소개를 준비하고 있습니다. 궁금한 점은 ' + TEL + '로 문의해 주세요.';
      $('#r-price').textContent = priceText(r); $('#m-price').textContent = priceText(r);
      if (r.link) { var l = $('#r-link'); l.href = r.link; l.style.display = ''; }
      booking(r, q);
    }, function (e) { main.innerHTML = '<div class="empty">불러오지 못했습니다. (' + e.message + ')</div>'; });
  }
  function lightbox(list, start) {
    var lb = $('#lb'); if (!lb) { lb = E('div', 'lb'); lb.id = 'lb'; lb.innerHTML = '<img alt=""><button class="x" type="button" aria-label="닫기">✕</button><button class="p" type="button" aria-label="이전">‹</button><button class="n" type="button" aria-label="다음">›</button><div class="c"></div>'; document.body.append(lb); }
    var i = start || 0, img = $('img', lb), x0 = null;
    function show() { img.src = sized(list[i], 2000); $('.c', lb).textContent = (i + 1) + ' / ' + list.length; }
    function go(d) { i = (i + d + list.length) % list.length; show(); }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); }
    $('.x', lb).onclick = close; $('.p', lb).onclick = function () { go(-1); }; $('.n', lb).onclick = function () { go(1); };
    lb.onclick = function (e) { if (e.target === lb) close(); };
    lb.ontouchstart = function (e) { x0 = e.touches[0].clientX; }; lb.ontouchend = function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); x0 = null; };
    document.addEventListener('keydown', key); document.body.style.overflow = 'hidden'; lb.classList.add('open'); show();
  }
  function booking(r, q) {
    var calBox = $('#cal'), head = $('#calHead'), fIn = $('#b-in'), fOut = $('#b-out'), info = $('#b-info'), busy = {}, from = today(), to = add(today(), 180), view = from.slice(0, 7) + '-01';
    if (q.get('in')) fIn.value = q.get('in'); if (q.get('out')) fOut.value = q.get('out'); if (q.get('ppl')) $('#b-ppl').value = q.get('ppl');
    if (fIn.value) view = fIn.value.slice(0, 8) + '01';
    fIn.min = today(); fOut.min = add(today(), 1);
    calBox.innerHTML = '<div class="legend">빈 날짜를 불러오는 중…</div>';
    avail(r.id, from, to).then(function (j) { (j.busy[r.id] || []).forEach(function (d) { busy[d] = 1; }); paint(); sum(); }, function () { calBox.innerHTML = '<div class="legend">빈 날짜를 불러오지 못했습니다. 날짜를 적어 요청하시면 확인해 드립니다.</div>'; });
    function bad(a, b) { for (var d = a; d < b; d = add(d, 1)) if (busy[d]) return d; return ''; }
    function sum() {
      var mi = $('#m-info');
      if (fIn.value && fOut.value && fOut.value > fIn.value) { var x = bad(fIn.value, fOut.value); info.textContent = x ? md(x) + '은 이미 예약된 날입니다. 다른 날짜를 골라 주세요.' : md(fIn.value) + ' ~ ' + md(fOut.value) + ' · ' + nights(fIn.value, fOut.value) + '박'; info.className = 'note' + (x ? ' msg bad' : ''); if (mi) mi.textContent = x ? '날짜를 다시 골라 주세요' : md(fIn.value) + ' ~ ' + md(fOut.value) + ' · ' + nights(fIn.value, fOut.value) + '박'; }
      else { info.textContent = ''; if (mi) mi.textContent = '날짜를 골라 주세요'; }
    }
    function paint() {
      var y = Number(view.slice(0, 4)), m = Number(view.slice(5, 7)), first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate();
      head.querySelector('b').textContent = y + '년 ' + m + '월';
      calBox.innerHTML = ''; var g = E('div', 'cal');
      '일월화수목금토'.split('').forEach(function (w) { g.append(E('div', 'w', w)); });
      for (var b = 0; b < first.getDay(); b++) g.append(E('div'));
      for (var i = 1; i <= days; i++) {
        var d = view.slice(0, 8) + ('0' + i).slice(-2), c = E('div', 'd', String(i));
        if (d < today()) c.classList.add('past'); else if (busy[d]) c.classList.add('x');
        if (d === fIn.value || d === fOut.value) c.classList.add('sel'); else if (fIn.value && fOut.value && d > fIn.value && d < fOut.value) c.classList.add('mid');
        (function (day, el) { el.onclick = function () {
          if (el.classList.contains('past')) return;
          if (!fIn.value || (fIn.value && fOut.value) || day <= fIn.value) { if (busy[day]) return; fIn.value = day; fOut.value = ''; }
          else { var x = bad(fIn.value, day); if (x) { info.textContent = md(x) + '이 예약돼 있어 이어서 고를 수 없습니다.'; info.className = 'msg bad'; return; } fOut.value = day; }
          paint(); sum();
        }; })(d, c);
        g.append(c);
      }
      calBox.append(g, E('div', 'legend', '줄 그은 날 = 예약 마감 · 체크인과 체크아웃 날짜를 차례로 누르세요'));
    }
    head.querySelector('.prev').onclick = function () { var d = new Date(view + 'T12:00:00'); d.setMonth(d.getMonth() - 1); var v = ymd(d).slice(0, 8) + '01'; if (v >= today().slice(0, 8) + '01') { view = v; paint(); } };
    head.querySelector('.next').onclick = function () { var d = new Date(view + 'T12:00:00'); d.setMonth(d.getMonth() + 1); view = ymd(d).slice(0, 8) + '01'; paint(); };
    fIn.onchange = fOut.onchange = function () { if (fIn.value) view = fIn.value.slice(0, 8) + '01'; paint(); sum(); };
    sum();
    var mb = $('#m-go'); if (mb) mb.onclick = function () { $('#book').scrollIntoView({ behavior: 'smooth' }); };
    $('#bookForm').onsubmit = function (ev) {
      ev.preventDefault(); var msg = $('#b-msg'), btn = $('#b-send');
      if (!fIn.value || !fOut.value || fOut.value <= fIn.value) { msg.className = 'msg bad'; msg.textContent = '체크인·체크아웃 날짜를 골라 주세요.'; return; }
      var x = bad(fIn.value, fOut.value); if (x) { msg.className = 'msg bad'; msg.textContent = md(x) + '은 이미 예약된 날입니다.'; return; }
      if (!$('#b-ok').checked) { msg.className = 'msg bad'; msg.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }
      btn.disabled = true; msg.className = 'msg'; msg.textContent = '보내는 중…';
      post({ fn: 'book', room: r.id, checkIn: fIn.value, checkOut: fOut.value, people: $('#b-ppl').value, name: $('#b-name').value, phone: $('#b-phone').value, email: $('#b-email').value, memo: $('#b-memo').value, consent: true, website: $('#b-web').value })
        .then(function (j) { msg.className = 'msg ok'; msg.textContent = j.message; $('#bookForm').reset(); fIn.value = ''; fOut.value = ''; paint(); sum(); }, function (e) { msg.className = 'msg bad'; msg.textContent = e.message; })
        .then(function () { btn.disabled = false; });
    };
  }
  // ---------- 숙소 맡기기 ----------
  function host() {
    var h = $('#hero'); if (h) h.style.backgroundImage = 'url("' + (innerWidth < 700 ? sized(PIC.hostHero, 1200) : PIC.hostHero) + '")';
    var q = new URLSearchParams(location.search); if (q.get('s')) $('#c-svc').value = q.get('s');
    $('#careForm').onsubmit = function (ev) {
      ev.preventDefault(); var msg = $('#c-msg'), btn = $('#c-send');
      if (!$('#c-ok').checked) { msg.className = 'msg bad'; msg.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }
      btn.disabled = true; msg.className = 'msg'; msg.textContent = '보내는 중…';
      // 늘어난 항목은 서버를 바꾸지 않고 메모 앞에 줄로 붙여 보냄(영업 문의 메모에 그대로 보임)
      var v = function (id) { var e = $(id); return e ? String(e.value || '').trim() : ''; };
      var ch = [].slice.call(document.querySelectorAll('input[name="c-ch"]:checked')).map(function (x) { return x.value; }).join(', ');
      var info = [['숙소 형태', v('#c-type')], ['객실 수', v('#c-rooms')], ['지금 상황', v('#c-now')], ['희망 시작', v('#c-when')], ['예약 채널', ch], ['연락 편한 시간', v('#c-time')]]
        .filter(function (x) { return x[1]; }).map(function (x) { return x[0] + ': ' + x[1]; }).join(' / ');
      var memo = [info, v('#c-memo')].filter(Boolean).join('\n');
      post({ fn: 'care', service: $('#c-svc').value, place: $('#c-place').value, address: $('#c-addr').value, name: $('#c-name').value, phone: $('#c-phone').value, email: $('#c-email').value, memo: memo, consent: true, website: $('#c-web').value })
        .then(function (j) { msg.className = 'msg ok'; msg.textContent = j.message; $('#careForm').reset(); }, function (e) { msg.className = 'msg bad'; msg.textContent = e.message; })
        .then(function () { btn.disabled = false; });
    };
    // 숫자 지표: 공개 자료에 stats가 있을 때만 보임(장부 자동 계산)
    var SHOW_STATS = /[?&]stats=1/.test(location.search); // 대표님 확인 전까지 숨김(주소 끝에 ?stats=1 붙이면 미리보기)
    if (SHOW_STATS) pub().then(function (p) {
      var s = p.stats; if (!s || !s.homes) return;
      $('#st-homes').textContent = s.homes + '곳'; $('#st-rate').textContent = s.rate + '%'; $('#st-nights').textContent = Number(s.nights).toLocaleString('ko-KR') + '박';
      $('#st-foot').textContent = '위탁운영 장부 기준 · 최근 ' + (s.days || 90) + '일 (' + (s.base || '') + ' 집계, 매일 자동 갱신) · 예약률은 숙소별 예약된 밤 ÷ 기간';
      $('#stats').hidden = false;
    }, function () {});
  }
  // ---------- 여행 가이드 ----------
  function guide() {
    var q = new URLSearchParams(location.search), a = q.get('a'), main = $('#main'), G = window.GUIDE || [];
    var g = G.find(function (x) { return x.slug === a; });
    if (!g) {
      main.innerHTML = '<section class="sec"><div class="wrap"><div class="sh"><div><div class="eyebrow">Journal</div><h2>여행 가이드</h2><p>머무는 동안 알아 두면 좋은 이야기</p></div></div><div class="filters" id="gf"></div><div class="glist" id="gl"></div></div></section>';
      var regs = []; G.forEach(function (x) { if (x.region && regs.indexOf(x.region) < 0) regs.push(x.region); });
      var cur = q.get('region') || '';
      if (regs.length > 1) ['전체'].concat(regs).forEach(function (t) { var c = E('button', 'chip' + ((t === '전체' ? '' : t) === cur ? ' on' : ''), t); c.type = 'button'; c.onclick = function () { cur = t === '전체' ? '' : t; Array.prototype.forEach.call($('#gf').children, function (x) { x.classList.toggle('on', x === c); }); guideTeaser($('#gl'), 50, cur); }; $('#gf').append(c); });
      guideTeaser($('#gl'), 50, cur); return;
    }
    document.title = g.title + ' · CLEADER STAY';
    var art = E('article', 'article'); art.append(E('div', 'crumb'), E('div', 'eyebrow', [g.region, g.tag].filter(Boolean).join(' · ')), E('h1', '', g.title), E('p', 'lead', g.summary));
    art.querySelector('.crumb').innerHTML = '<a href="guide.html">여행 가이드</a>';
    var cv = E('div', 'cover'); if (g.photo) cv.style.backgroundImage = 'url("' + sized(g.photo, 1600) + '")'; else cv.style.background = g.color; art.append(cv);
    g.body.forEach(function (b) { if (b[0] === 'ul') { var ul = E('ul'); b[1].forEach(function (t) { ul.append(E('li', '', t)); }); art.append(ul); } else art.append(E(b[0], '', b[1])); });
    var wrap = E('div', 'wrap'); wrap.append(art); var sec = E('section', 'sec'); sec.style.paddingTop = '20px'; sec.append(wrap); main.innerHTML = ''; main.append(sec);
    if (g.rooms) {
      var s2 = E('section', 'sec soft'), w2 = E('div', 'wrap'), gr = E('div', 'grid'), h2 = E('h2', '', '이 글과 어울리는 숙소'); h2.style.marginBottom = '30px';
      w2.append(E('div', 'eyebrow', 'Stay'), h2, gr); s2.append(w2); main.append(s2);
      rooms().then(function (l) { l.filter(function (r) { return !g.region || regionOf(r.area).prov === g.region; }).slice(0, 4).forEach(function (r) { gr.append(card(r)); }); });
    }
  }
  chrome();
  if (page === 'home') home(); else if (page === 'room') room(); else if (page === 'host') host(); else if (page === 'guide') guide();
})();
