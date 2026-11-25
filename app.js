// CLEADER STAY 홈페이지 (시제품). 숙소·빈 날짜·접수는 클리더 스크립트에서 로그인 없이 주고받습니다.
(function () {
  'use strict';
  var API = 'https://script.google.com/macros/s/AKfycbwXneEon-Nujp2Z5_tSrp0gQTUAHrkzYx4oTWr7uRDXAfmq3UgxKPCI7ys76DFx9rfC/exec';
  var TEL = '1668-2817';
  var page = document.body.getAttribute('data-page');
  function $(s, r) { return (r || document).querySelector(s); }
  function E(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
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
  // ---------- 머리·꼬리 ----------
  function chrome() {
    var hd = $('#hd'); if (hd) {
      hd.className = 'hd';
      hd.innerHTML = '<div class="wrap"><a class="logo" href="./">CLEADER STAY<small>Stay All Care Service</small></a>' +
        '<nav class="nav" id="nav"><a href="./" data-p="home">숙소</a><a href="./?type=%ED%95%9C%EB%8B%AC%EC%82%B4%EC%9D%B4" data-p="month">한달살이</a><a href="guide.html" data-p="guide">제주 가이드</a><a class="host" href="host.html" data-p="host">숙소 맡기기</a><a href="tel:' + TEL + '">☎ ' + TEL + '</a></nav>' +
        '<button class="menu-btn" type="button" aria-label="메뉴">☰</button></div>';
      var nav = $('#nav'); $('.menu-btn').onclick = function () { nav.classList.toggle('open'); };
      Array.prototype.forEach.call(nav.querySelectorAll('a[data-p]'), function (a) { if (a.getAttribute('data-p') === page) a.classList.add('on'); });
    }
    var ft = $('#ft'); if (ft) {
      ft.className = 'ft';
      ft.innerHTML = '<div class="wrap cols"><div><b>주식회사 클리더 · CLEADER</b><br>숙소 청소 · 위탁운영 · 직접 예약<br>제주 · 청평/가평/홍천<br>사업자 정보: (등록 예정)</div>' +
        '<div><b>문의</b><br>대표번호 <a href="tel:' + TEL + '">' + TEL + '</a><br><a href="host.html">숙소 맡기기 상담</a><br>위탁 호스트님은 받으신 현황 링크로 접속해 주세요.</div>' +
        '<div><a href="privacy.html">개인정보 처리 안내</a><br>© CLEADER</div></div>';
    }
    var call = E('a', 'call', '☎ 전화 문의'); call.href = 'tel:' + TEL; document.body.append(call);
  }
  // ---------- 숙소 카드 ----------
  var ROOMS = null;
  function rooms() { if (ROOMS) return Promise.resolve(ROOMS); return get({ fn: 'rooms' }).then(function (j) { ROOMS = j.rooms || []; return ROOMS; }); }
  function card(r, state) {
    var a = E('a', 'room'); a.href = 'room.html?id=' + encodeURIComponent(r.id) + (state && state.q ? '&' + state.q : '');
    var ph = E('div', 'ph'); if (r.photos[0]) ph.style.backgroundImage = 'url("' + r.photos[0] + '")';
    if (state && state.label) { var b = E('span', 'badge' + (state.no ? ' no' : ''), state.label); ph.append(b); }
    a.append(ph, E('h3', '', r.name), E('div', 'meta', [r.area, r.max ? '최대 ' + r.max + '명' : '', r.type].filter(Boolean).join(' · ')));
    if (r.line) a.append(E('div', 'meta', r.line));
    a.append(E('div', 'price', r.price || '문의'));
    return a;
  }
  // ---------- 홈 ----------
  function home() {
    var q = new URLSearchParams(location.search), grid = $('#grid'), chips = $('#chips'), filt = q.get('type') || '전체';
    var fArea = $('#f-area'), fIn = $('#f-in'), fOut = $('#f-out'), fPpl = $('#f-ppl');
    fIn.min = today(); fOut.min = add(today(), 1);
    if (q.get('in')) fIn.value = q.get('in'); if (q.get('out')) fOut.value = q.get('out'); if (q.get('ppl')) fPpl.value = q.get('ppl');
    fIn.onchange = function () { if (fIn.value) { fOut.min = add(fIn.value, 1); if (!fOut.value || fOut.value <= fIn.value) fOut.value = add(fIn.value, 1); } };
    grid.innerHTML = '<div class="empty">숙소를 불러오는 중…</div>';
    rooms().then(function (list) {
      var areas = []; list.forEach(function (r) { var a = (r.area || '').split(' ')[0]; if (a && areas.indexOf(a) < 0) areas.push(a); });
      areas.forEach(function (a) { var o = E('option', '', a); o.value = a; fArea.append(o); }); if (q.get('area')) fArea.value = q.get('area');
      var tags = ['전체', '단박', '한달살이']; list.forEach(function (r) { (r.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0 && tags.length < 12) tags.push(t); }); });
      tags.forEach(function (t) { var c = E('button', 'chip' + (t === filt ? ' on' : ''), t); c.type = 'button'; c.onclick = function () { filt = t; Array.prototype.forEach.call(chips.children, function (x) { x.classList.toggle('on', x.textContent === t); }); draw(); }; chips.append(c); });
      draw();
    }, function (e) { grid.innerHTML = ''; grid.append(E('div', 'empty', '숙소를 불러오지 못했습니다. 잠시 후 다시 열어 주세요. (' + e.message + ')')); });
    var busy = null;
    function draw() {
      var list = (ROOMS || []).filter(function (r) {
        if (fArea.value && (r.area || '').indexOf(fArea.value) !== 0) return false;
        if (fPpl.value && r.max && Number(r.max) && Number(r.max) < Number(fPpl.value)) return false;
        if (filt === '전체') return true; if (filt === '단박' || filt === '한달살이') return (r.type || '').indexOf(filt) >= 0;
        return (r.tags || []).indexOf(filt) >= 0;
      });
      grid.innerHTML = ''; if (!list.length) { grid.append(E('div', 'empty', '조건에 맞는 숙소가 없습니다. 조건을 바꿔 보시거나 ' + TEL + '로 문의해 주세요.')); return; }
      var qs = fIn.value && fOut.value ? 'in=' + fIn.value + '&out=' + fOut.value + (fPpl.value ? '&ppl=' + fPpl.value : '') : '';
      list.forEach(function (r) {
        var st = { q: qs };
        if (busy && fIn.value && fOut.value) { var b = busy[r.id] || [], hit = b.some(function (d) { return d >= fIn.value && d < fOut.value; }); st.label = hit ? '선택 날짜 마감' : md(fIn.value) + '~' + md(fOut.value) + ' 가능'; st.no = hit; }
        grid.append(card(r, st));
      });
    }
    $('#searchForm').onsubmit = function (ev) {
      ev.preventDefault();
      if (fIn.value && fOut.value && fOut.value > fIn.value) {
        grid.innerHTML = '<div class="empty">빈 날짜를 확인하는 중…</div>';
        get({ fn: 'avail', room: 'all', from: fIn.value, to: fOut.value }).then(function (j) { busy = j.busy || {}; draw(); }, function () { busy = null; draw(); });
      } else { busy = null; draw(); }
      var u = new URLSearchParams(); if (fArea.value) u.set('area', fArea.value); if (fIn.value) u.set('in', fIn.value); if (fOut.value) u.set('out', fOut.value); if (fPpl.value) u.set('ppl', fPpl.value); if (filt !== '전체') u.set('type', filt);
      history.replaceState(null, '', '?' + u.toString());
    };
    if (q.get('in') && q.get('out')) $('#searchForm').dispatchEvent(new Event('submit'));
    guideTeaser($('#guideTeaser'), 2);
  }
  function guideTeaser(box, n) {
    if (!box || !window.GUIDE) return;
    window.GUIDE.slice(0, n || 6).forEach(function (g) {
      var a = E('a', 'gcard'); a.href = 'guide.html?a=' + g.slug; var p = E('div', 'gp'); p.style.background = g.color; var t = E('div', 't');
      t.append(E('small', '', g.tag), E('h3', '', g.title), E('p', '', g.summary)); a.append(p, t); box.append(a);
    });
  }
  // ---------- 숙소 상세 ----------
  function room() {
    var q = new URLSearchParams(location.search), id = q.get('id'), main = $('#main');
    rooms().then(function (list) {
      var r = list.find(function (x) { return x.id === id; });
      if (!r) { main.innerHTML = '<div class="empty">숙소를 찾지 못했습니다. <a href="./">숙소 목록으로</a></div>'; return; }
      document.title = r.name + ' · CLEADER STAY';
      $('#crumb').innerHTML = '<a href="./">숙소</a> › ' + r.name.replace(/[<>&]/g, '');
      var gal = $('#gal'); var ph = r.photos.length ? r.photos : [null, null, null];
      ph.slice(0, 5).forEach(function (u, i) { var d = E('div'); if (u) { d.style.backgroundImage = 'url("' + u + '")'; d.onclick = function () { window.open(u, '_blank'); }; } else d.style.background = ['linear-gradient(135deg,#7dd3fc,#0e7490)', 'linear-gradient(135deg,#bbf7d0,#15803d)', 'linear-gradient(135deg,#fde68a,#d97706)'][i % 3]; gal.append(d); });
      $('#r-name').textContent = r.name;
      $('#r-meta').textContent = [r.area, r.max ? '최대 ' + r.max + '명' : '', r.type].filter(Boolean).join(' · ');
      var tags = $('#r-tags'); (r.tags || []).forEach(function (t) { tags.append(E('span', '', t)); });
      $('#r-line').textContent = r.line || '';
      $('#r-desc').textContent = r.desc || '숙소 소개를 준비하고 있습니다.';
      $('#r-price').textContent = r.price || '문의';
      if (r.link) { var l = $('#r-link'); l.href = r.link; l.style.display = ''; }
      booking(r, q);
    }, function (e) { main.innerHTML = '<div class="empty">불러오지 못했습니다. (' + e.message + ')</div>'; });
  }
  function booking(r, q) {
    var calBox = $('#cal'), head = $('#calHead'), fIn = $('#b-in'), fOut = $('#b-out'), info = $('#b-info'), busy = {}, from = today(), to = add(today(), 180), view = from.slice(0, 7) + '-01';
    if (q.get('in')) fIn.value = q.get('in'); if (q.get('out')) fOut.value = q.get('out'); if (q.get('ppl')) $('#b-ppl').value = q.get('ppl');
    fIn.min = today(); fOut.min = add(today(), 1);
    calBox.innerHTML = '<div class="legend">빈 날짜를 불러오는 중…</div>';
    get({ fn: 'avail', room: r.id, from: from, to: to }).then(function (j) { (j.busy[r.id] || []).forEach(function (d) { busy[d] = 1; }); paint(); }, function () { calBox.innerHTML = '<div class="legend">빈 날짜를 불러오지 못했습니다. 날짜를 적어 요청하시면 확인해 드립니다.</div>'; });
    function bad(a, b) { for (var d = a; d < b; d = add(d, 1)) if (busy[d]) return d; return ''; }
    function sum() {
      if (fIn.value && fOut.value && fOut.value > fIn.value) { var x = bad(fIn.value, fOut.value); info.textContent = x ? md(x) + '은 이미 예약된 날입니다. 다른 날짜를 골라 주세요.' : md(fIn.value) + ' ~ ' + md(fOut.value) + ' · ' + nights(fIn.value, fOut.value) + '박'; info.className = 'note' + (x ? ' msg bad' : ''); }
      else info.textContent = '';
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
      calBox.append(g, E('div', 'legend', '회색 줄 = 예약 마감 · 입실일과 퇴실일을 차례로 누르세요'));
    }
    head.querySelector('.prev').onclick = function () { var d = new Date(view + 'T12:00:00'); d.setMonth(d.getMonth() - 1); var v = ymd(d).slice(0, 8) + '01'; if (v >= today().slice(0, 8) + '01') { view = v; paint(); } };
    head.querySelector('.next').onclick = function () { var d = new Date(view + 'T12:00:00'); d.setMonth(d.getMonth() + 1); view = ymd(d).slice(0, 8) + '01'; paint(); };
    fIn.onchange = fOut.onchange = function () { if (fIn.value) view = fIn.value.slice(0, 8) + '01'; paint(); sum(); };
    sum();
    $('#bookForm').onsubmit = function (ev) {
      ev.preventDefault(); var msg = $('#b-msg'), btn = $('#b-send');
      if (!fIn.value || !fOut.value || fOut.value <= fIn.value) { msg.className = 'msg bad'; msg.textContent = '입실·퇴실 날짜를 골라 주세요.'; return; }
      var x = bad(fIn.value, fOut.value); if (x) { msg.className = 'msg bad'; msg.textContent = md(x) + '은 이미 예약된 날입니다.'; return; }
      if (!$('#b-ok').checked) { msg.className = 'msg bad'; msg.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }
      btn.disabled = true; msg.className = 'msg'; msg.textContent = '보내는 중…';
      post({ fn: 'book', room: r.id, checkIn: fIn.value, checkOut: fOut.value, people: $('#b-ppl').value, name: $('#b-name').value, phone: $('#b-phone').value, email: $('#b-email').value, memo: $('#b-memo').value, consent: true, website: $('#b-web').value })
        .then(function (j) { msg.className = 'msg ok'; msg.textContent = j.message; $('#bookForm').reset(); fIn.value = ''; fOut.value = ''; paint(); }, function (e) { msg.className = 'msg bad'; msg.textContent = e.message; })
        .then(function () { btn.disabled = false; });
    };
  }
  // ---------- 숙소 맡기기 ----------
  function host() {
    var q = new URLSearchParams(location.search); if (q.get('s')) $('#c-svc').value = q.get('s');
    $('#careForm').onsubmit = function (ev) {
      ev.preventDefault(); var msg = $('#c-msg'), btn = $('#c-send');
      if (!$('#c-ok').checked) { msg.className = 'msg bad'; msg.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }
      btn.disabled = true; msg.className = 'msg'; msg.textContent = '보내는 중…';
      post({ fn: 'care', service: $('#c-svc').value, place: $('#c-place').value, address: $('#c-addr').value, name: $('#c-name').value, phone: $('#c-phone').value, email: $('#c-email').value, memo: $('#c-memo').value, consent: true, website: $('#c-web').value })
        .then(function (j) { msg.className = 'msg ok'; msg.textContent = j.message; $('#careForm').reset(); }, function (e) { msg.className = 'msg bad'; msg.textContent = e.message; })
        .then(function () { btn.disabled = false; });
    };
  }
  // ---------- 제주 가이드 ----------
  function guide() {
    var a = new URLSearchParams(location.search).get('a'), main = $('#main'), G = window.GUIDE || [];
    var g = G.find(function (x) { return x.slug === a; });
    if (!g) { main.innerHTML = '<section class="sec"><div class="wrap"><h2>제주 가이드</h2><p class="lead">머무는 동안 알아 두면 좋은 이야기</p><div class="glist" id="gl"></div></div></section>'; guideTeaser($('#gl'), 50); return; }
    document.title = g.title + ' · CLEADER STAY';
    var art = E('article', 'article'); art.append(E('div', 'crumb'), E('small', '', g.tag), E('h1', '', g.title), E('p', 'lead', g.summary));
    art.querySelector('.crumb').innerHTML = '<a href="guide.html">제주 가이드</a>';
    var cv = E('div', 'cover'); cv.style.background = g.color; art.append(cv);
    g.body.forEach(function (b) { if (b[0] === 'ul') { var ul = E('ul'); b[1].forEach(function (t) { ul.append(E('li', '', t)); }); art.append(ul); } else art.append(E(b[0], '', b[1])); });
    var wrap = E('div', 'wrap'); wrap.append(art); var sec = E('section', 'sec'); sec.append(wrap); main.innerHTML = ''; main.append(sec);
    if (g.rooms) { var s2 = E('section', 'sec soft'), w2 = E('div', 'wrap'), gr = E('div', 'grid'); w2.append(E('h2', '', '이 글과 어울리는 숙소'), gr); s2.append(w2); main.append(s2); rooms().then(function (l) { l.slice(0, 4).forEach(function (r) { gr.append(card(r)); }); }); }
  }
  chrome();
  if (page === 'home' || page === 'month') home(); else if (page === 'room') room(); else if (page === 'host') host(); else if (page === 'guide') guide();
})();
