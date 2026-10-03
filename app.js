(() => {
  "use strict";

  // 앱 버전(APP_VERSION): 백업 화면에 표시. sw.js의 CACHE 이름과 같이 올림
  const APP_VERSION = "v15";
  // 저장소 이름(KEY): 휴대폰 브라우저 안에 자료를 저장할 때 쓰는 이름
  const KEY = "dawon-mobile-v1";
  // 업무 종류(ROLES)
  const ROLES = ["찬모", "서빙", "설거지", "기타"];

  // ---------- 작은 도구들 ----------
  const $ = (selector, root = document) => root.querySelector(selector);
  // esc: 화면에 글자를 안전하게 넣기 위한 변환
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // ---------- 선 아이콘 ----------
  // 이모지 대신 쓰는 아이콘 모음 (그림 파일 없이 코드로 그림, 글자색을 따라감)
  const ICONS = {
    phone: '<path d="M5.5 3.5h3l1.8 4.6-2.2 1.4a11.5 11.5 0 0 0 6.4 6.4l1.4-2.2 4.6 1.8v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2z"/>',
    message: '<path d="M4 4.5h16a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1h-8.5L7 20.5V17H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    alert: '<path d="M12 4 3 19.5h18z"/><path d="M12 10v4.5M12 17.2v.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    contacts: '<rect x="5" y="3" width="15" height="18" rx="2.5"/><circle cx="12.5" cy="10" r="2.5"/><path d="M8.5 17c.6-1.9 2.1-3 4-3s3.4 1.1 4 3M3 7.5h3M3 12h3M3 16.5h3"/>',
    camera: '<path d="M4 7.5h3l2-2.5h6l2 2.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.2" r="3.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m21 15.5-5-5L6.5 20"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',
    folder: '<path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    note: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 8.5h6M9 12.5h6M9 16.5h3"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    send: '<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z"/>',
    copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9.5a1 1 0 0 0 1 1h3.5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.8.8 3.1 2.6 3.5 5.2"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6 2.5 2.5V21M8 12l2.5-4.5h3l2 4 2.5 1M10.5 7.5 9 13l3 2"/>',
  };
  // icon("phone") → 선 아이콘. 두 번째 칸에 "fill"을 주면 속을 채움 (예: 하트)
  const icon = (name, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  // 움직임을 줄이는 설정을 켠 휴대폰인지
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  // 짧은 진동 (안드로이드만, 아이폰은 조용히 무시)
  const buzz = () => { try { navigator.vibrate?.(12); } catch (_) {} };

  // uid: 겹치지 않는 번호 만들기
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = (plus = 0) => { const d = new Date(); d.setDate(d.getDate() + plus); return ymd(d); };
  const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
  // dateText: "2026-10-02" → "오늘 10/2(금)"
  const dateText = (s) => {
    if (!s) return "";
    const [y, m, d] = s.split("-").map(Number);
    const w = WEEK[new Date(y, m - 1, d).getDay()];
    const rel = s === today() ? "오늘 " : s === today(1) ? "내일 " : s === today(-1) ? "어제 " : "";
    return `${rel}${m}/${d}(${w})`;
  };
  const won = (n) => (Number(n) ? `${Number(n).toLocaleString("ko-KR")}원` : "일당 미정");
  // ---------- 근무 시간 · 시급 계산 ----------
  const toMin = (t) => { const [h, m] = String(t || "").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
  // workMinutes: 끝 - 시작 - 휴게 (끝이 시작보다 이르면 밤을 넘긴 근무로 봄. 예: 18:00~02:00 = 8시간)
  const workMinutes = (start, end, breakMin = 0) => {
    if (!start || !end) return 0;
    let d = toMin(end) - toMin(start);
    if (d <= 0) d += 24 * 60;
    return Math.max(0, d - (Number(breakMin) || 0));
  };
  const hoursText = (min) => { const h = Math.floor(min / 60); const m = min % 60; return `${h ? `${h}시간` : ""}${h && m ? " " : ""}${m ? `${m}분` : ""}` || "0시간"; };
  // 밤 시간(밤 10시~아침 6시)이 근무 중 몇 분인지
  const NIGHT = [[0, 360], [1320, 1800], [2760, 2880]]; // 이틀에 걸친 근무까지 분 단위로 (22:00=1320, 다음날 06:00=1800)
  const nightMinutes = (start, end) => {
    if (!start || !end) return 0;
    const s = toMin(start);
    let e = toMin(end);
    if (e <= s) e += 24 * 60;
    return NIGHT.reduce((sum, [a, b]) => sum + Math.max(0, Math.min(e, b) - Math.max(s, a)), 0);
  };
  // 급여 나누기: 휴게시간은 낮 시간에서 먼저 빼고, 모자라면 밤 시간에서 뺌
  const payBreakdown = (start, end, breakMin, hourly, nightHourly) => {
    const total = workMinutes(start, end, 0);
    const nightAll = nightMinutes(start, end);
    let dayMin = total - nightAll;
    let nightMin = nightAll;
    const brk = Math.min(Number(breakMin) || 0, total);
    const fromDay = Math.min(brk, dayMin);
    dayMin -= fromDay;
    nightMin -= brk - fromDay;
    const nightRate = Number(nightHourly) || Number(hourly) || 0;
    const pay = Math.round(((Number(hourly) || 0) * dayMin + nightRate * nightMin) / 60);
    return { dayMin, nightMin, nightRate, pay };
  };
  const hasNightRate = (j) => Boolean(j.nightHourly && Number(j.nightHourly) !== Number(j.hourly) && nightMinutes(j.start, j.end));
  // 문자·화면용 급여 글: "시급 11,000원(밤 16,500원) · 일당 110,000원"
  const payText = (j) => (j.hourly
    ? `시급 ${won(j.hourly)}${hasNightRate(j) ? `(밤 ${won(j.nightHourly)})` : ""} · 일당 ${won(j.pay)}`
    : `일당 ${won(j.pay)}`);
  // 시간을 "오전 9:00"처럼
  const timeLabel = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const part = h === 0 ? "밤" : h < 6 ? "새벽" : h < 12 ? "오전" : h === 12 ? "낮" : h < 18 ? "오후" : h < 22 ? "저녁" : "밤";
    return `${part} ${h % 12 || 12}:${String(m).padStart(2, "0")}`;
  };
  const digits = (p) => String(p || "").replace(/[^0-9+]/g, "");
  const telHref = (p) => `tel:${digits(p)}`;
  // 갤럭시 문자 앱을 내용이 채워진 상태로 여는 주소
  const smsHref = (p, body) => `sms:${digits(p)}?body=${encodeURIComponent(body)}`;
  const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

  // ---------- 기본 문자 문구 ----------
  const defaultScripts = () => [
    { id: "s1", title: "밤늦게 온 연락 답장", kind: "sms", text: "늦은 시간까지 연락 주셔서 고마워요 😊 지금은 바로 통화가 어려워서요, 내일 아침 7시에 제가 먼저 전화드릴게요. 급한 일이면 한 번 더 걸어주세요~" },
    { id: "s2", title: "일 언제 주냐는 연락", kind: "sms", text: "연락 주셔서 고마워요~ 요즘 약속 잘 지켜주시는 분들께 먼저 연락드리고 있어요. 자리 나면 꼭 챙겨드릴게요 😊" },
    { id: "s3", title: "술 드시고 온 전화 (말로 할 때)", kind: "talk", text: "오늘은 늦었으니까 내일 맑은 정신으로 얘기해요. 제가 내일 꼭 전화드릴게요. 푹 쉬세요~" },
    { id: "s4", title: "직전 취소 연락 받았을 때", kind: "sms", text: "알려주셔서 고마워요. 다음부터는 하루 전까지만 알려주시면 식당에 미리 말씀드릴 수 있어요. 몸 잘 챙기세요 🙏" },
    { id: "s5", title: "대기 부탁", kind: "sms", text: "혹시 내일 빈자리가 생기면 바로 나가실 수 있을까요? 대기해 주시면 다음 일 먼저 챙겨드릴게요 😊" },
    { id: "s6", title: "처음 가입한 분 안내", kind: "sms", text: "[다원] 가입해 주셔서 고마워요 😊 일은 약속 잘 지켜주시는 분들께 먼저 연락드려요. 못 가시게 되면 꼭 하루 전까지 알려주세요. 밤에는 문자 남겨주시면 아침에 연락드릴게요~" },
  ];

  // ---------- 자료 저장/불러오기 ----------
  const blank = () => ({ version: 1, restaurants: [], workers: [], jobs: [], assigns: [], scripts: defaultScripts(), feeRate: 10, lastBackup: "" });
  const isValidData = (s) => s && Array.isArray(s.workers) && Array.isArray(s.jobs) && Array.isArray(s.assigns) && Array.isArray(s.restaurants);
  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (isValidData(saved)) return { ...blank(), ...saved };
    } catch (_) {}
    return blank();
  };
  let state = load();
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (_) { toast("저장하지 못했어요. 백업 파일을 꼭 만들어 두세요."); }
  };
  // 휴대폰이 저장 공간을 정리할 때 이 자료를 지우지 않도록 요청
  try { navigator.storage?.persist?.(); } catch (_) {}

  // ---------- 사진 저장소 ----------
  // 사진은 용량이 커서 더 큰 저장 공간(IndexedDB)에 따로 보관. photos: 구직자 번호 → 사진
  const photos = new Map();
  const photoDb = (() => {
    let opening;
    const open = () => (opening ||= new Promise((resolve, reject) => {
      const req = indexedDB.open("dawon-photos", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("photos");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
    const run = async (mode, work) => {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("photos", mode);
        const req = work(tx.objectStore("photos"));
        tx.oncomplete = () => resolve(req?.result);
        tx.onerror = () => reject(tx.error);
      });
    };
    return {
      all: async () => { const keys = await run("readonly", (s) => s.getAllKeys()); const vals = await run("readonly", (s) => s.getAll()); return keys.map((k, i) => [k, vals[i]]); },
      put: (id, url) => run("readwrite", (s) => s.put(url, id)),
      del: (id) => run("readwrite", (s) => s.delete(id)),
      clear: () => run("readwrite", (s) => s.clear()),
    };
  })();
  const setPhoto = async (id, url) => {
    if (!url) return;
    photos.set(id, url);
    try { await photoDb.put(id, url); } catch (_) { toast("사진을 저장하지 못했어요. 휴대폰 저장 공간을 확인해 주세요."); }
  };
  const removePhoto = (id) => { photos.delete(id); photoDb.del(id).catch(() => {}); };
  // shrinkImage: 사진을 작은 정사각형(가로세로 240)으로 줄여서 용량을 아낌
  const shrinkImage = (src, size = 240) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      if (!side) { resolve(""); return; }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve("");
    img.src = src;
  });

  // ---------- 연락처 읽기 ----------
  // 연락처 이름 "김○○ 찬모"에서 업무 말을 찾아냄 (홀·설겆이 같은 다른 표현도 인정)
  const ROLE_WORDS = { 찬모: "찬모", 서빙: "서빙", 홀서빙: "서빙", 홀: "서빙", 설거지: "설거지", 설겆이: "설거지" };
  const parseContactName = (full) => {
    const roles = [];
    const rest = [];
    const addRole = (r) => { if (!roles.includes(r)) roles.push(r); };
    String(full || "").split(/[\s/,·()[\]]+/).filter(Boolean).forEach((token) => {
      if (ROLE_WORDS[token]) { addRole(ROLE_WORDS[token]); return; }
      // "김영희찬모"처럼 붙여 쓴 경우
      const word = Object.keys(ROLE_WORDS).sort((a, b) => b.length - a.length).find((k) => token.length > k.length && token.endsWith(k));
      if (word) { rest.push(token.slice(0, -word.length)); addRole(ROLE_WORDS[word]); return; }
      rest.push(token);
    });
    // 업무 말이 없으면 이름을 나누지 않고 그대로 씀 (예: "우리 딸")
    if (!roles.length) return { name: String(full || "").trim(), roles, extra: "" };
    return { name: rest[0] || String(full || "").trim(), roles, extra: rest.slice(1).join(" ") };
  };
  // 전화번호를 010-1234-5678 모양으로
  const normPhone = (p) => {
    let d = String(p || "").replace(/[^0-9]/g, "");
    if (d.startsWith("82")) d = "0" + d.slice(2);
    if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    if (d.length === 10) return d.startsWith("02") ? `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}` : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return d;
  };
  const samePhone = (a, b) => { const x = normPhone(a).replace(/-/g, ""); return x.length >= 9 && x === normPhone(b).replace(/-/g, ""); };

  // QP(Quoted-Printable): 옛 연락처 파일에서 한글을 =EA=B9=80 처럼 적는 방식을 원래 글자로 되돌림
  const qpDecode = (s, charset) => {
    const bytes = [];
    for (let i = 0; i < s.length; i++) {
      if (s[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(s.substr(i + 1, 2))) { bytes.push(parseInt(s.substr(i + 1, 2), 16)); i += 2; }
      else bytes.push(s.charCodeAt(i) & 0xff);
    }
    try { return new TextDecoder(charset || "utf-8").decode(new Uint8Array(bytes)); }
    catch (_) { return new TextDecoder().decode(new Uint8Array(bytes)); }
  };
  const vUnescape = (v) => v.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
  // parseVcf: 연락처 파일(.vcf) 글자를 사람 목록으로 바꿈
  const parseVcf = (text) => {
    const lines = [];
    for (const line of String(text).replace(/\r\n?/g, "\n").split("\n")) {
      const last = lines.length - 1;
      // 줄이 접혀 있으면 앞줄에 이어 붙임
      if (last >= 0 && /^[ \t]/.test(line)) { lines[last] += line.slice(1); continue; }
      if (last >= 0 && /QUOTED-PRINTABLE/i.test(lines[last].split(":")[0]) && lines[last].endsWith("=")) { lines[last] = lines[last].slice(0, -1) + line; continue; }
      lines.push(line);
    }
    const cards = [];
    let cur = null;
    for (const line of lines) {
      if (/^BEGIN:VCARD/i.test(line)) { cur = { fn: "", n: "", tels: [], photo: "" }; continue; }
      if (/^END:VCARD/i.test(line)) { if (cur) cards.push(cur); cur = null; continue; }
      if (!cur) continue;
      const at = line.indexOf(":");
      if (at < 0) continue;
      const head = line.slice(0, at).split(";");
      const prop = head[0].split(".").pop().toUpperCase();
      const params = head.slice(1).join(";").toUpperCase();
      let value = line.slice(at + 1);
      if (/QUOTED-PRINTABLE/.test(params)) value = qpDecode(value, (params.match(/CHARSET=([^;:]+)/) || [])[1]);
      if (prop === "FN") cur.fn = vUnescape(value);
      else if (prop === "N") { const p = value.split(";").map(vUnescape); cur.n = `${p[0] || ""}${p[1] || ""}`.trim(); }
      else if (prop === "TEL") cur.tels.push({ num: value.trim(), cell: /CELL/.test(params), pref: /PREF/.test(params) });
      else if (prop === "PHOTO") {
        const v = value.replace(/\s/g, "");
        if (v.startsWith("data:")) cur.photo = v;
        else if (/ENCODING=(B|BASE64)|BASE64/.test(params) && v) cur.photo = `data:image/${/PNG/.test(params) ? "png" : "jpeg"};base64,${v}`;
      }
    }
    return cards.map((c) => {
      const full = c.fn || c.n;
      // 번호 고르는 순서: 기본(pref) 휴대폰 → 휴대전화(CELL) → 010 등 휴대폰 번호 → 첫 번호
      const mobile = (t) => normPhone(t.num).startsWith("01");
      const tel = (c.tels.find((t) => t.pref && mobile(t)) || c.tels.find((t) => t.cell) || c.tels.find(mobile) || c.tels[0] || {}).num || "";
      return { full, phone: normPhone(tel), photo: c.photo, ...parseContactName(full) };
    }).filter((c) => c.full && c.phone);
  };
  // 크롬 연락처 선택 기능을 쓸 수 있는지
  const canPickContacts = "contacts" in navigator && "ContactsManager" in window;
  const avatar = (w, cls = "") => {
    const src = w && photos.get(w.id);
    return src ? `<img class="avatar ${cls}" src="${src}" alt="" />` : `<span class="avatar ${cls}" aria-hidden="true">${esc((w?.name || "?").slice(0, 1))}</span>`;
  };

  // ---------- 자료 찾기 ----------
  const worker = (id) => state.workers.find((w) => w.id === id);
  const rest = (id) => state.restaurants.find((r) => r.id === id);
  const job = (id) => state.jobs.find((j) => j.id === id);
  const assign = (id) => state.assigns.find((a) => a.id === id);
  const assignsOf = (jobId) => state.assigns.filter((a) => a.jobId === jobId);
  const confirmedOf = (j) => assignsOf(j.id).filter((a) => a.status === "confirmed");
  const jobNeed = (j) => Math.max(0, Number(j.headcount || 1) - confirmedOf(j).length);
  const restName = (j) => rest(j.restaurantId)?.name || "식당 미정";

  // ---------- 약속 기록과 신뢰도 ----------
  // statsOf: 한 사람의 출근·취소 기록 정리
  const statsOf = (workerId) => {
    const rows = state.assigns
      .filter((a) => a.workerId === workerId && a.outcome)
      .map((a) => ({ a, j: job(a.jobId) }))
      .filter((r) => r.j)
      .sort((x, y) => y.j.date.localeCompare(x.j.date));
    const count = (list, o) => list.filter((r) => r.a.outcome === o).length;
    const recent = rows.slice(0, 10); // 최근 10번만 보고 판단 (옛날 실수는 잊어줌)
    return {
      done: count(rows, "done"),
      late: count(rows, "late"),
      noshow: count(rows, "noshow"),
      rehire: rows.filter((r) => r.a.rehire).length,
      recentMiss: count(recent, "late") + count(recent, "noshow"),
      recentNoshow: count(recent, "noshow"),
      lastWork: rows.find((r) => r.a.outcome === "done")?.j.date || "",
    };
  };
  // trustOf: 기록을 보고 "믿음직 / 보통 / 신규 / 주의"로 나눔
  const trustOf = (s) => {
    if (s.recentNoshow >= 2 || s.recentMiss >= 3) return { level: 2, label: "주의", cls: "bad" };
    if (s.recentMiss >= 1) return { level: 1, label: "보통", cls: "mid" };
    if (s.done >= 3) return { level: 0, label: "믿음직", cls: "good" };
    if (s.done >= 1) return { level: 1, label: "보통", cls: "mid" };
    return { level: 1, label: "신규", cls: "new" };
  };
  const badge = (t) => `<span class="badge ${t.cls}">${t.label}</span>`;
  const statLine = (s) => `<span class="stats">${icon("check")}${s.done}${icon("alert")}${s.late}${icon("x")}${s.noshow}${s.rehire ? `${icon("heart", "fill")}${s.rehire}` : ""}</span>`;
  // 순서 정하기: 믿음직 → 보통 → 주의, 같으면 오래 쉰 사람 먼저
  const byPriority = (x, y) => (x.t.level - y.t.level) || (x.s.lastWork || "").localeCompare(y.s.lastWork || "") || x.w.name.localeCompare(y.w.name, "ko");
  const ranked = (list) => list.map((w) => { const s = statsOf(w.id); return { w, s, t: trustOf(s) }; });

  // 같은 날 시간이 겹치는 확정 근무가 있는지
  const overlaps = (a, b) => a.date === b.date && (!a.start || !a.end || !b.start || !b.end || (a.start < b.end && b.start < a.end));
  const busyFor = (workerId, j) => state.assigns.some((x) => {
    if (x.workerId !== workerId || x.jobId === j.id || x.status !== "confirmed") return false;
    const other = job(x.jobId);
    return other && overlaps(other, j);
  });

  // 일감에 맞는 추천 순서
  const candidatesFor = (j) => {
    const r = rest(j.restaurantId);
    const taken = new Set(assignsOf(j.id).map((a) => a.workerId));
    return ranked(state.workers.filter((w) => w.active !== false && !taken.has(w.id) && (w.roles || []).includes(j.role)))
      .map((x) => ({ ...x, near: Boolean(r?.area && x.w.area && (r.area.includes(x.w.area.trim()) || x.w.area.includes(r.area.trim()))), busy: busyFor(x.w.id, j) }))
      .sort((x, y) => (x.busy - y.busy) || (x.t.level - y.t.level) || (Number(y.near) - Number(x.near)) || byPriority(x, y));
  };
  // 업무별 대기 순서에서 몇 번째인지 (재촉 전화 받을 때 확인용)
  const rankIn = (role, workerId) => {
    const list = ranked(state.workers.filter((w) => w.active !== false && (w.roles || []).includes(role))).sort(byPriority);
    return { pos: list.findIndex((x) => x.w.id === workerId) + 1, total: list.length };
  };

  // ---------- 문자 내용 ----------
  const offerMsg = (j, w) => { const r = rest(j.restaurantId); return `[다원] ${w.name}님~ ${dateText(j.date)} ${j.start}~${j.end} ${r?.name || ""}${r?.area ? `(${r.area})` : ""} ${j.role} 일 있어요. ${payText(j)}.${groupOf(j).length > 1 ? ` (${groupRange(j)} ${groupOf(j).length}일 연속)` : ""} 가능하시면 연락 주세요 😊`; };
  // mapUrl: 네이버 지도 검색 주소 (주소가 없으면 식당 이름+지역으로 찾음). 누르면 지도 앱이나 지도 웹이 열림
  const mapUrl = (r) => {
    const q = (r?.address ? r.address.replace(/\s*\([^)]*\)\s*$/, "") : `${r?.name || ""} ${r?.area || ""}`).trim();
    return q ? `https://map.naver.com/p/search/${encodeURIComponent(q)}` : "";
  };
  // 확정 문자: 날짜·시간, 주소, 오시는 길, 지도 링크, 식당 전화를 한 줄씩
  const confirmMsg = (j, w) => {
    const r = rest(j.restaurantId);
    const map = mapUrl(r);
    return [
      `[다원] ${w.name}님 확정됐어요!`,
      `${dateText(j.date)} ${j.start}까지 ${r?.name || ""} 가시면 돼요.`,
      // 여러 날 연속으로 확정됐으면 근무일을 모두 적음
      (() => {
        const days = groupOf(j).filter((x) => state.assigns.some((a) => a.jobId === x.id && a.workerId === w.id && a.status === "confirmed"));
        return days.length > 1 ? `📅 근무일: ${days.map((x) => dateText(x.date).replace(/^(오늘|내일|어제) /, "")).join(", ")} (${days.length}일)` : "";
      })(),
      `⏰ ${j.start}~${j.end}${j.breakMin ? ` (휴게 ${hoursText(Number(j.breakMin))})` : ""} · ${payText(j)}`,
      r?.address ? `📍 주소: ${fullAddress(r)}` : "",
      r?.way ? `🚶 오시는 길: ${r.way}` : "",
      map ? `🗺 지도: ${map}` : "",
      r?.phone ? `☎ 식당 전화: ${r.phone}` : "",
      "혹시 못 가시게 되면 꼭 미리 알려주세요 🙏",
    ].filter(Boolean).join("\n");
  };
  const restMsg = (j, w) => `[다원] 사장님, ${dateText(j.date)} ${j.role} ${w.name}님 보내드려요. ${j.start} 출근입니다.${w.phone ? ` 연락처: ${w.phone}` : ""}`;
  // 식당에 보내는 문자: 확정된 사람 수에 따라 내용이 달라짐
  const restJobMsg = (j) => {
    const names = confirmedOf(j).map((a) => worker(a.workerId)?.name).filter(Boolean).map((n) => `${n}님`);
    const need = jobNeed(j);
    const head = `[다원] 사장님, ${dateText(j.date)} ${j.role}`;
    if (!names.length) return `${head} ${j.headcount}명 요청 잘 받았어요. 사람 구해지면 바로 연락드릴게요 😊`;
    if (need) return `${head} ${names.join(", ")} 먼저 보내드려요. ${j.start} 출근입니다. 나머지 ${need}명도 구해지면 바로 연락드릴게요.`;
    return `${head} ${names.join(", ")} 보내드려요. ${j.start} 출근입니다.`;
  };
  const standbyMsg = (j, w) => `[다원] ${w.name}님, ${dateText(j.date)} ${restName(j)} ${j.role} 대기 부탁드려요. 빈자리 생기면 바로 연락드릴게요. 대기해 주시면 다음 일 먼저 챙겨드려요 😊`;

  // ---------- 알림(토스트) ----------
  let toastTimer;
  const toast = (msg) => {
    const box = $("#toast");
    // 입력창이 열려 있으면 안내 글을 입력창 안으로 옮겨서 가려지지 않게 함
    const host = $("#sheet").open ? $("#sheet") : document.body;
    if (box.parentElement !== host) host.append(box);
    box.textContent = msg;
    box.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove("show"), 2800);
  };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); }
    catch (_) {
      // 예전 방식으로 복사 (보안 연결이 아닐 때)
      const t = document.createElement("textarea");
      t.value = text; document.body.append(t); t.select();
      try { document.execCommand("copy"); } catch (_) {}
      t.remove();
    }
    toast("복사했어요. 원하는 곳에 붙여넣으세요.");
  };

  // ---------- 아래에서 올라오는 입력창(시트) ----------
  const sheet = $("#sheet");
  const sheetForm = $("#sheet-form");
  let sheetSubmit = null;
  // 입력창이 닫힐 때 아래로 미끄러져 내려가게 함 (원래 닫기 기능을 감싸서 사용)
  const nativeClose = HTMLDialogElement.prototype.close;
  let closeTimer = null;
  sheet.close = function () {
    if (!this.open || closeTimer) return;
    if (reduceMotion) { nativeClose.call(this); return; }
    this.classList.add("closing");
    closeTimer = setTimeout(() => {
      closeTimer = null;
      this.classList.remove("closing");
      nativeClose.call(this);
    }, 200);
  };
  // 휴대폰 뒤로 가기·Esc로 닫을 때도 같은 움직임
  sheet.addEventListener("cancel", (e) => { e.preventDefault(); sheet.close(); });
  const openSheet = ({ title, body, submit = "저장", onSubmit, onReady }) => {
    // 닫히는 중에 새 창을 열면 닫기를 취소하고 내용만 바꿈
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; sheet.classList.remove("closing"); }
    sheetForm.innerHTML = `<div class="sheet-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="닫기">${icon("x")}</button></div>
      <div class="sheet-body">${body}</div>
      <div class="sheet-foot"><button type="button" class="btn ghost" data-close>닫기</button>${onSubmit ? `<button type="submit" class="btn primary">${esc(submit)}</button>` : ""}</div>`;
    sheetSubmit = onSubmit || null;
    if (!sheet.open) sheet.showModal();
    sheetForm.querySelector(".sheet-body").scrollTop = 0;
    onReady?.(sheetForm);
  };
  sheetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!sheetSubmit || !sheetForm.reportValidity()) return;
    if (sheetSubmit(new FormData(sheetForm), sheetForm) !== false) sheet.close();
  });
  sheetForm.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) { sheet.close(); return; }
    const step = e.target.closest("[data-step]");
    if (step) {
      const input = step.parentElement.querySelector("input");
      input.value = Math.min(20, Math.max(1, (Number(input.value) || 1) + Number(step.dataset.step)));
    }
  });
  // 입력창이 닫히면 안내 글을 원래 자리로 돌려놓음 (닫힌 뒤에도 보이게)
  sheet.addEventListener("close", () => document.body.append($("#toast")));
  // 바깥 어두운 부분을 누르면 닫기
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });

  // ---------- 화면 이동 ----------
  let route = { name: "home" };
  // navDir: 화면 움직임 방향 (forward = 오른쪽에서 들어옴, back = 왼쪽에서, tab = 아래에서 차례로). 처음 열 때는 tab
  let navDir = "tab";
  const isDetail = (r) => r.name === "job" || r.name === "worker";
  const ui = { peopleMode: "workers", peopleQuery: "", peopleRole: "", jobsMode: "upcoming", showAll: {} };
  const go = (next) => {
    navDir = isDetail(next) ? "forward" : "tab";
    route = next;
    history.pushState(next, "");
    render();
    window.scrollTo(0, 0);
  };
  window.addEventListener("popstate", (e) => {
    const prev = route;
    route = e.state || { name: "home" };
    navDir = isDetail(prev) ? "back" : "tab";
    if (sheet.open) sheet.close();
    render();
  });
  history.replaceState(route, "");

  // ---------- 화면: 홈 ----------
  const jobCard = (j) => {
    const need = jobNeed(j);
    const conf = confirmedOf(j).length;
    const sb = assignsOf(j.id).filter((a) => a.status === "standby").length;
    const past = j.date < today();
    const g = groupOf(j);
    return `<button class="job-card ${need ? "need" : "full"} ${past ? "past" : ""}" data-act="open-job" data-id="${j.id}">
      <div class="job-when">${esc(dateText(j.date))} · ${esc(j.start)}~${esc(j.end)}${g.length > 1 ? ` <span class="pill gray">${g.length}일 연속 · ${g.indexOf(j) + 1}일째</span>` : ""}</div>
      <div class="job-what"><strong>${esc(restName(j))}</strong><span class="role">${esc(j.role)}</span></div>
      <div class="job-state">${need ? `<span class="pill need">${need}명 더 필요</span>` : `<span class="pill ok">인원 다 참</span>`}
      <span class="muted">확정 ${conf}/${esc(j.headcount)}명${sb ? ` · 대기 ${sb}명` : ""}</span></div></button>`;
  };
  const sortJobs = (a, b) => a.date.localeCompare(b.date) || (a.start || "").localeCompare(b.start || "");
  // 여러 날 일감 묶음: 같은 group 번호를 가진 일감들 (날짜순). 묶음이 아니면 자기 하나
  const groupOf = (j) => (j?.group ? state.jobs.filter((x) => x.group === j.group).sort(sortJobs) : [j]);
  const groupRange = (j) => { const g = groupOf(j); return `${dateText(g[0].date).replace(/^(오늘|내일|어제) /, "")}~${dateText(g[g.length - 1].date).replace(/^(오늘|내일|어제) /, "")}`; };

  // 근무 날이 지났는데 출근 여부를 아직 안 적은 사람들
  const pendingChecks = () => state.assigns
    .filter((a) => a.status === "confirmed" && !a.outcome)
    .map((a) => ({ a, j: job(a.jobId), w: worker(a.workerId) }))
    .filter((x) => x.j && x.w && x.j.date <= today())
    .sort((x, y) => sortJobs(x.j, y.j));

  const checkRow = ({ a, j, w }) => `<div class="check-row">
      <div class="who">${avatar(w)}<div><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>
      <div class="muted small">${esc(dateText(j.date))} · ${esc(restName(j))} ${esc(j.role)}</div></div></div>
      <div class="btn-row three">
        <button class="btn ok" data-act="outcome" data-id="${a.id}" data-v="done">${icon("check")}출근함</button>
        <button class="btn warn" data-act="cancel-ask" data-id="${a.id}">${icon("alert")}취소</button>
        <button class="btn bad" data-act="outcome" data-id="${a.id}" data-v="noshow">${icon("x")}안 나옴</button>
      </div></div>`;

  const renderHome = () => {
    const hasData = state.workers.length || state.jobs.length;
    const needJobs = state.jobs.filter((j) => j.date >= today() && jobNeed(j) > 0).sort(sortJobs);
    const fullJobs = state.jobs.filter((j) => (j.date === today() || j.date === today(1)) && jobNeed(j) === 0).sort(sortJobs);
    const checks = pendingChecks();
    const month = today().slice(0, 7);
    const doneThisMonth = state.assigns.filter((a) => a.outcome === "done" && job(a.jobId)?.date.startsWith(month));
    const feeSum = doneThisMonth.reduce((sum, a) => sum + (Number(a.fee) || 0), 0);
    const backupDays = state.lastBackup ? daysBetween(state.lastBackup, today()) : null;

    // 맨 위 큰 요약 (오늘 날짜 + 사람이 필요한 일 건수)
    const now = new Date();
    const todayNeed = needJobs.filter((j) => j.date === today()).length;
    let html = `<section class="hero">
        <p class="hero-date">${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEK[now.getDay()]}요일</p>
        <p class="hero-title">${!hasData ? "반가워요,<br>다원 소개소예요" : needJobs.length ? `사람이 필요한 일<br><span class="num" data-count="${needJobs.length}" data-suffix="건">${needJobs.length}건</span>` : "빈자리 없이<br>다 채웠어요"}</p>
        ${hasData && (todayNeed || checks.length) ? `<p class="hero-sub">${[todayNeed ? `오늘 ${todayNeed}건` : "", checks.length ? `출근 체크 ${checks.length}명` : ""].filter(Boolean).join(" · ")}</p>` : ""}
      </section>
      <div class="big-actions">
        <button class="btn primary big" data-act="new-job">${icon("plus")}일감 받기</button>
        <button class="btn big" data-act="new-worker">${icon("plus")}사람 등록</button>
      </div>`;

    if (!hasData) {
      html += `<h2>처음 오셨네요</h2><div class="card"><p>1. <strong>사람 등록</strong>으로 구직자를 적어 주세요.</p><p>2. 식당에서 전화가 오면 <strong>일감 받기</strong>를 누르세요.</p><p>3. 일감 화면에서 추천 순서대로 연락하고 <strong>확정</strong>을 누르면 끝이에요.</p>
        <p class="muted small">먼저 연습해 보고 싶으면 아래 '백업' 메뉴에서 연습용 예시 자료를 넣을 수 있어요.</p></div>`;
      return html;
    }
    if (backupDays === null || backupDays >= 7) {
      html += `<div class="banner warn" style="margin-top:14px">${icon("download")}${backupDays === null ? "아직 백업을 한 번도 안 했어요." : `마지막 백업이 ${backupDays}일 전이에요.`}<br>휴대폰을 잃어버려도 괜찮도록 백업해 두세요.<button class="btn" data-act="backup">지금 백업하기</button></div>`;
    }
    html += `<h2>사람이 필요해요 <span class="count">${needJobs.length}</span></h2>`;
    html += needJobs.length ? needJobs.map(jobCard).join("") : `<div class="empty">빈자리가 없어요</div>`;
    if (checks.length) {
      html += `<h2>출근했는지 체크해 주세요 <span class="count">${checks.length}</span></h2><div class="card">${checks.map(checkRow).join("")}</div>`;
    }
    html += `<h2>오늘·내일 확정된 일</h2>`;
    html += fullJobs.length ? fullJobs.map(jobCard).join("") : `<div class="empty">아직 없어요</div>`;
    html += `<h2>이번 달</h2><div class="month"><div><small>출근 완료</small><strong data-count="${doneThisMonth.length}" data-suffix="건">${doneThisMonth.length}건</strong></div><div><small>수수료 (${esc(state.feeRate)}%)</small><strong data-count="${feeSum}" data-suffix="원">${feeSum.toLocaleString("ko-KR")}원</strong></div></div>`;
    return html;
  };

  // ---------- 화면: 일감 목록 ----------
  const renderJobs = () => {
    const upcoming = ui.jobsMode === "upcoming";
    const list = state.jobs.filter((j) => (upcoming ? j.date >= today() : j.date < today())).sort(sortJobs);
    if (!upcoming) list.reverse();
    return `<button class="btn primary big" data-act="new-job">${icon("plus")}일감 받기</button>
      <div class="segment" style="margin-top:14px"><button class="${upcoming ? "active" : ""}" data-act="jobs-mode" data-v="upcoming">오늘부터</button><button class="${upcoming ? "" : "active"}" data-act="jobs-mode" data-v="past">지난 일감</button></div>
      ${list.length ? list.map(jobCard).join("") : `<div class="empty">${upcoming ? "예정된 일감이 없어요" : "지난 일감이 없어요"}</div>`}`;
  };

  // ---------- 화면: 일감 하나 ----------
  const statusText = { asked: "연락함", standby: "대기 중", confirmed: "확정", canceled: "취소" };
  const outcomeText = { done: icon("check") + "출근함", late: icon("alert") + "직전 취소", noshow: icon("x") + "안 나옴", cancel_ok: "미리 알리고 취소" };

  const contactButtons = (w, j, msg, msgLabel = icon("message") + "문자") => w.phone
    ? `<a class="btn" href="${telHref(w.phone)}" data-act="contacted" data-worker="${w.id}" data-job="${j.id}">${icon("phone")}전화</a>
       <a class="btn" href="${smsHref(w.phone, msg)}" data-act="contacted" data-worker="${w.id}" data-job="${j.id}">${msgLabel}</a>`
    : `<button class="btn" data-act="edit-worker" data-id="${w.id}">${icon("phone")}전화번호 넣기</button>`;

  const assignRow = (a, j) => {
    const w = worker(a.workerId);
    if (!w) return "";
    const s = statsOf(w.id);
    const head = `<div class="name-line"><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>${badge(trustOf(s))}</div>`;
    const started = j.date <= today();
    let state_ = "";
    let buttons = "";
    if (a.status === "confirmed" && a.outcome === "done") {
      state_ = `<span class="pill ok">${icon("check")}출근함</span> <span class="muted small">수수료 ${won(a.fee)}</span>`;
      buttons = `<button class="btn ${a.rehire ? "on" : ""}" data-act="toggle-rehire" data-id="${a.id}">${a.rehire ? icon("heart", "fill") + "식당이 또 찾음" : icon("heart") + "식당이 또 찾나요?"}</button>
        <button class="btn ghost" data-act="undo-assign" data-id="${a.id}">되돌리기</button>`;
    } else if (a.status === "confirmed") {
      state_ = `<span class="pill ok">확정</span>`;
      buttons = started
        ? `<button class="btn ok" data-act="outcome" data-id="${a.id}" data-v="done">${icon("check")}출근함</button>
           <button class="btn bad" data-act="outcome" data-id="${a.id}" data-v="noshow">${icon("x")}안 나옴</button>
           <button class="btn warn" data-act="cancel-ask" data-id="${a.id}">${icon("alert")}취소 연락옴</button>
           ${w.phone ? `<a class="btn" href="${telHref(w.phone)}">${icon("phone")}전화</a>` : ""}`
        : `${contactButtons(w, j, confirmMsg(j, w), icon("message") + "확정 문자")}
           ${rest(j.restaurantId)?.phone ? `<a class="btn" href="${smsHref(rest(j.restaurantId).phone, restMsg(j, w))}">${icon("message")}식당에 알림</a>` : `<button class="btn" data-act="copy-rest-msg" data-id="${a.id}">식당 문자 복사</button>`}
           <button class="btn warn" data-act="cancel-ask" data-id="${a.id}">${icon("alert")}취소 연락옴</button>`;
    } else if (a.status === "standby") {
      state_ = `<span class="pill gray">대기 중</span>`;
      buttons = `${contactButtons(w, j, standbyMsg(j, w))}
        <button class="btn primary" data-act="set-status" data-id="${a.id}" data-v="confirmed">${icon("check")}확정</button>
        <button class="btn ghost" data-act="remove-assign" data-id="${a.id}">빼기</button>`;
    } else if (a.status === "asked") {
      state_ = `<span class="pill gray">연락함 · 답 기다리는 중</span>`;
      buttons = `${contactButtons(w, j, offerMsg(j, w))}
        <button class="btn primary" data-act="set-status" data-id="${a.id}" data-v="confirmed">${icon("check")}확정</button>
        <button class="btn" data-act="set-status" data-id="${a.id}" data-v="standby">대기로</button>
        <button class="btn ghost" data-act="remove-assign" data-id="${a.id}">빼기 (못 한대요)</button>`;
    } else {
      state_ = `<span class="pill gray">${outcomeText[a.outcome] || "취소"}</span>`;
      buttons = `<button class="btn ghost" data-act="undo-assign" data-id="${a.id}">되돌리기</button>`;
    }
    return `<div class="person-row ${a.status === "canceled" ? "dim" : ""}"><div class="who">${avatar(w)}<div>${head}<div class="status-line">${state_}</div></div></div><div class="btn-row">${buttons}</div></div>`;
  };

  const candidateRow = (c, j, full) => {
    const { w, s, t, near, busy } = c;
    return `<div class="person-row">
      <div class="who">${avatar(w)}<div>
      <div class="name-line"><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>${badge(t)}${near ? `<span class="tag">가까움</span>` : ""}${busy ? `<span class="tag warn">같은 시간 다른 일</span>` : ""}</div>
      <div class="status-line muted">${statLine(s)} · ${s.lastWork ? `마지막 근무 ${esc(dateText(s.lastWork))}` : "근무 기록 없음"}${w.area ? ` · ${esc(w.area)}` : ""}</div></div></div>
      <div class="btn-row">${contactButtons(w, j, offerMsg(j, w), icon("message") + "일 제안")}
        <button class="btn primary" data-act="add-assign" data-v="confirmed" data-worker="${w.id}" data-job="${j.id}" ${full || busy ? "disabled" : ""}>${icon("check")}확정</button>
        <button class="btn" data-act="add-assign" data-v="standby" data-worker="${w.id}" data-job="${j.id}">대기로</button>
      </div></div>`;
  };

  const renderJob = (id) => {
    const j = job(id);
    if (!j) return `<div class="empty">일감을 찾을 수 없어요.</div>`;
    const r = rest(j.restaurantId);
    const need = jobNeed(j);
    const order = { confirmed: 0, standby: 1, asked: 2, canceled: 3 };
    const list = assignsOf(j.id).sort((x, y) => order[x.status] - order[y.status]);
    const standby = list.filter((a) => a.status === "standby");
    const cands = candidatesFor(j);
    const limit = ui.showAll[j.id] ? cands.length : 6;

    let html = `<div class="card">
      <div class="job-when">${esc(dateText(j.date))}</div>
      <div class="job-what" style="font-size:1.3rem"><strong>${esc(restName(j))}</strong><span class="role">${esc(j.role)}</span></div>
      ${groupOf(j).length > 1 ? `<div class="day-tabs" aria-label="연속 근무 날짜">${groupOf(j).map((x, i) => `<button class="day-tab ${x.id === j.id ? "on" : ""}" data-act="open-job" data-id="${x.id}"><small>${i + 1}일째</small>${esc(dateText(x.date).replace(/^(오늘|내일|어제) /, ""))}</button>`).join("")}</div>` : ""}
      <div class="facts">
        <div class="fact"><small>시간</small><strong>${esc(j.start)}~${esc(j.end)}</strong></div>
        <div class="fact"><small>근무${j.breakMin ? ` (휴게 ${hoursText(Number(j.breakMin))})` : ""}</small><strong>${hoursText(workMinutes(j.start, j.end, j.breakMin))}</strong></div>
        ${j.hourly ? `<div class="fact"><small>시급</small><strong>${esc(won(j.hourly))}${hasNightRate(j) ? `<span class="night-rate">밤 ${esc(won(j.nightHourly))}</span>` : ""}</strong></div>` : ""}
        <div class="fact"><small>일당${j.hourly ? " (총)" : ""}</small><strong>${esc(won(j.pay))}</strong></div>
        <div class="fact"><small>필요 인원</small><strong>${esc(j.headcount)}명</strong></div>
        <div class="fact"><small>지역</small><strong>${esc(r?.area || "-")}</strong></div>
      </div>
      ${r?.address ? `<p class="meta-line">${icon("pin")}${esc(fullAddress(r))}</p>` : ""}
      ${r?.way ? `<p class="meta-line">${icon("walk")}${esc(r.way)}</p>` : ""}
      ${mapUrl(r) ? `<a class="map-link" href="${mapUrl(r)}" target="_blank" rel="noopener">${icon("pin")}지도 보기</a>` : ""}
      ${r && !r.address && !r.way ? `<button class="map-link" data-act="edit-rest" data-id="${r.id}">${icon("plus")}주소·오시는 길 넣기</button>` : ""}
      ${j.memo ? `<p class="meta-line">${icon("note")}${esc(j.memo)}</p>` : ""}
      <div class="btn-row">${r?.phone
        ? `<a class="btn" href="${telHref(r.phone)}">${icon("phone")}식당 전화</a><a class="btn" href="${smsHref(r.phone, restJobMsg(j))}">${icon("message")}식당 문자</a>`
        : r ? `<button class="btn" data-act="edit-rest" data-id="${r.id}">${icon("phone")}번호 넣기</button>` : ""}<button class="btn" data-act="edit-job" data-id="${j.id}">${icon("edit")}고치기</button></div>
    </div>`;

    if (need && standby.length) html += `<div class="banner need">대기 중인 분이 ${standby.length}명 있어요. 아래에서 바로 <strong>확정</strong>하세요.</div>`;
    else if (need) html += `<div class="banner need">${need}명 더 필요해요</div>`;
    else html += `<div class="banner ok">${icon("check")}인원이 다 찼어요</div>`;

    if (list.length) html += `<h2>연락한 사람</h2><div class="card">${list.map((a) => assignRow(a, j)).join("")}</div>`;

    html += `<h2>추천 순서 <span class="muted small" style="font-weight:400">약속 잘 지키고 오래 쉰 분 먼저</span></h2>`;
    if (!cands.length) {
      html += `<div class="empty">${esc(j.role)} 가능한 분이 더 없어요.<br><button class="btn" style="margin-top:10px" data-act="new-worker">${icon("plus")}사람 등록</button></div>`;
    } else {
      html += `<div class="card">${cands.slice(0, limit).map((c) => candidateRow(c, j, need === 0)).join("")}</div>`;
      if (cands.length > limit) html += `<button class="btn big" data-act="show-more" data-id="${j.id}">${cands.length - limit}명 더 보기</button>`;
    }
    html += `<div class="danger-zone"><button class="link-btn" data-act="del-job" data-id="${j.id}">이 일감 지우기</button></div>`;
    return html;
  };

  // ---------- 화면: 사람/식당 목록 ----------
  const peopleList = () => {
    const q = ui.peopleQuery.trim().toLowerCase();
    if (ui.peopleMode === "restaurants") {
      const list = state.restaurants
        .filter((r) => !q || `${r.name} ${r.area} ${r.phone} ${r.memo}`.toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name, "ko"));
      return list.length ? list.map((r) => `<button class="worker-card" data-act="edit-rest" data-id="${r.id}">
          <div class="name-line"><strong>${esc(r.name)}</strong>${r.area ? `<span class="tag">${esc(r.area)}</span>` : ""}</div>
          <div class="status-line muted">${esc(r.phone || "전화번호 없음")} · 일감 ${state.jobs.filter((j) => j.restaurantId === r.id).length}건</div></button>`).join("")
        : `<div class="empty">${q ? "찾는 식당이 없어요" : "등록된 식당이 없어요.<br>일감을 받을 때 함께 등록할 수 있어요."}</div>`;
    }
    const list = ranked(state.workers.filter((w) =>
      (!q || `${w.name} ${w.area} ${w.phone} ${w.memo} ${(w.roles || []).join(" ")}`.toLowerCase().includes(q)) &&
      (!ui.peopleRole || (w.roles || []).includes(ui.peopleRole))))
      .sort((x, y) => (Number(x.w.active === false) - Number(y.w.active === false)) || byPriority(x, y));
    return list.length ? list.map(({ w, s, t }) => `<button class="worker-card ${w.active === false ? "hidden-worker" : ""}" data-act="open-worker" data-id="${w.id}"><div class="who">${avatar(w)}<div>
        <div class="name-line"><strong>${esc(w.name)}</strong>${badge(t)}${w.active === false ? `<span class="tag">숨김</span>` : ""}</div>
        <div class="status-line">${(w.roles || []).length ? esc(w.roles.join(" · ")) : `<span class="tag warn">업무 미정</span>`}${w.area ? ` · ${esc(w.area)}` : ""}</div>
        <div class="status-line muted">${statLine(s)} · ${s.lastWork ? `마지막 근무 ${esc(dateText(s.lastWork))}` : "근무 기록 없음"}</div></div></div></button>`).join("")
      : `<div class="empty">${q || ui.peopleRole ? "조건에 맞는 분이 없어요" : "등록된 분이 없어요"}</div>`;
  };
  const renderPeople = () => {
    const isW = ui.peopleMode === "workers";
    return `<div class="segment"><button class="${isW ? "active" : ""}" data-act="people-mode" data-v="workers">구직자 ${state.workers.length}</button><button class="${isW ? "" : "active"}" data-act="people-mode" data-v="restaurants">식당 ${state.restaurants.length}</button></div>
      <button class="btn primary big" data-act="${isW ? "new-worker" : "new-rest"}">${icon("plus")}${isW ? "사람 등록" : "식당 등록"}</button>
      ${isW ? `<button class="btn big" style="margin-top:10px" data-act="import-vcf">${icon("contacts")}연락처 한 번에 불러오기</button>
        <p class="hint" style="margin-top:6px">연락처 앱에서 <strong>내보내기</strong>로 만든 .vcf 파일을 골라요. 자세한 방법은 백업 화면에 있어요.</p>` : ""}
      <input id="people-q" class="search" style="margin-top:14px" type="search" placeholder="${isW ? "이름·지역·전화번호로 찾기" : "식당 이름·지역으로 찾기"}" value="${esc(ui.peopleQuery)}" />
      ${isW ? `<div class="chips filter-chips">${["", ...ROLES].map((r) => `<button class="${ui.peopleRole === r ? "active" : ""}" data-act="role-filter" data-v="${r}">${r || "전체"}</button>`).join("")}</div>` : ""}
      <div id="people-list">${peopleList()}</div>`;
  };

  // ---------- 화면: 구직자 한 명 ----------
  const renderWorker = (id) => {
    const w = worker(id);
    if (!w) return `<div class="empty">찾을 수 없어요.</div>`;
    const s = statsOf(w.id);
    const t = trustOf(s);
    const rows = state.assigns.filter((a) => a.workerId === w.id).map((a) => ({ a, j: job(a.jobId) })).filter((x) => x.j)
      .sort((x, y) => y.j.date.localeCompare(x.j.date));
    const upcoming = rows.filter((x) => x.j.date >= today() && x.a.status === "confirmed" && !x.a.outcome).reverse();
    const past = rows.filter((x) => !upcoming.includes(x)).slice(0, 20);
    const ranks = (w.roles || []).map((role) => ({ role, ...rankIn(role, w.id) })).filter((r) => r.pos > 0);
    const line = ({ a, j }) => `<li><button class="name-link" data-act="open-job" data-id="${j.id}">${esc(dateText(j.date))} ${esc(restName(j))}</button> <span class="muted small">${esc(j.role)}</span><br>
      <span class="small">${a.outcome ? outcomeText[a.outcome] : statusText[a.status]}${a.rehire ? ` · ${icon("heart", "fill")}식당이 또 찾음` : ""}</span></li>`;

    return `<div class="card">
      <div class="who"><button class="avatar-btn" data-act="edit-worker" data-id="${w.id}" aria-label="사진 바꾸기">${avatar(w, "big")}<small>사진 바꾸기</small></button><div>
      <div class="name-line" style="font-size:1.35rem"><strong>${esc(w.name)}</strong>${badge(t)}${w.active === false ? `<span class="tag">숨김</span>` : ""}</div>
      <div class="status-line">${(w.roles || []).length ? esc(w.roles.join(" · ")) : `<span class="tag warn">업무 미정 · 고치기에서 골라 주세요</span>`}${w.area ? ` · ${esc(w.area)}` : ""}</div>
      <div class="status-line muted">${esc(w.phone || "전화번호 없음")}${w.joined ? ` · 가입 ${esc(w.joined)}` : ""}</div></div></div>
      ${w.memo ? `<p class="meta-line" style="margin-top:8px">${icon("note")}${esc(w.memo)}</p>` : ""}
      <div class="btn-row">${w.phone ? `<a class="btn primary" href="${telHref(w.phone)}">${icon("phone")}전화</a><a class="btn" href="${smsHref(w.phone, "")}">${icon("message")}문자</a>` : ""}<button class="btn" data-act="edit-worker" data-id="${w.id}">${icon("edit")}고치기</button></div>
    </div>
    <h2>약속 기록</h2>
    <div class="stat-grid"><div><strong>${s.done}</strong><small>${icon("check")}출근</small></div><div><strong>${s.late}</strong><small>${icon("alert")}직전취소</small></div><div><strong>${s.noshow}</strong><small>${icon("x")}안 나옴</small></div><div><strong>${s.rehire}</strong><small>${icon("heart", "fill")}또 찾음</small></div></div>
    ${ranks.length ? `<div class="card"><p style="margin:0"><strong>지금 대기 순서</strong></p>${ranks.map((r) => `<p class="small" style="margin:4px 0 0">${esc(r.role)}: ${r.total}명 중 <strong>${r.pos}번째</strong></p>`).join("")}<p class="hint">약속 잘 지키고 오래 쉰 분이 앞 순서예요. 재촉 전화가 오면 참고하세요.</p></div>` : ""}
    <h2>예정된 일</h2>${upcoming.length ? `<div class="card"><ul class="history">${upcoming.map(line).join("")}</ul></div>` : `<div class="empty">없어요</div>`}
    <h2>지난 기록</h2>${past.length ? `<div class="card"><ul class="history">${past.map(line).join("")}</ul></div>` : `<div class="empty">없어요</div>`}
    <div class="danger-zone"><button class="btn big" data-act="toggle-active" data-id="${w.id}">${w.active === false ? "명단에 다시 보이기" : "명단에서 숨기기 (기록은 남음)"}</button>
      <button class="link-btn" data-act="del-worker" data-id="${w.id}">이 사람 완전히 지우기</button></div>`;
  };

  // ---------- 화면: 문자 문구 ----------
  const renderScripts = () => `<p class="muted small">누르면 문자 앱이 열리고 내용이 채워져요. 받는 사람만 고르면 돼요.</p>
    ${state.scripts.map((s) => `<div class="card">
      <strong>${esc(s.title)}</strong>${s.kind === "talk" ? `<span class="tag">전화로 말할 때</span>` : ""}
      <p class="script-text">${esc(s.text)}</p>
      <div class="btn-row">${s.kind === "talk" ? "" : `<a class="btn primary" href="${smsHref("", s.text)}">${icon("send")}문자로 보내기</a>`}
        <button class="btn" data-act="copy-script" data-id="${s.id}">${icon("copy")}복사</button>
        <button class="btn ghost" data-act="edit-script" data-id="${s.id}">${icon("edit")}고치기</button></div>
    </div>`).join("")}
    <button class="btn big" data-act="new-script">${icon("plus")}새 문구 만들기</button>`;

  // ---------- 화면: 백업·설정 ----------
  // 메뉴 한 줄: 왼쪽 아이콘 · 제목과 설명 · 오른쪽 화살표
  const menuRow = (act, ic, title, sub, tone = "") => `<button class="menu-row" data-act="${act}">
      <span class="menu-ic ${tone}">${icon(ic)}</span><span class="menu-text"><strong>${title}</strong>${sub ? `<small>${sub}</small>` : ""}</span></button>`;
  const renderMore = () => {
    const hasData = state.workers.length || state.jobs.length;
    const backupSub = state.lastBackup ? `마지막 백업 ${esc(dateText(state.lastBackup))}` : "아직 한 번도 안 했어요";
    return `<h2>구직자 가져오기</h2>
    <div class="menu">${menuRow("import-vcf", "contacts", "연락처 파일 불러오기", "연락처를 한 번에 옮겨요")}</div>
    <details class="howto"><summary>연락처 파일 만드는 방법</summary>
      <ol>
        <li>연락처 앱 → 메뉴(≡) → 연락처 관리 → 연락처 가져오기/내보내기 → <strong>내보내기</strong></li>
        <li>저장 위치를 <strong>휴대폰(내장 저장공간)</strong>으로 고르기</li>
        <li>위 <strong>연락처 파일 불러오기</strong>를 눌러 방금 만든 .vcf 파일 고르기</li>
      </ol>
      <p>이름이 "김○○ 찬모"처럼 저장돼 있으면 업무도 자동으로 골라져요. 연락처는 이 휴대폰 안에서만 읽고, 다 가져온 뒤엔 .vcf 파일을 '내 파일'에서 지워 주세요.</p>
    </details>
    <h2>백업</h2>
    <div class="menu">
      ${menuRow("backup", "download", "백업 파일 만들기", backupSub, state.lastBackup && daysBetween(state.lastBackup, today()) < 7 ? "" : "warn")}
      ${menuRow("import", "folder", "백업 파일 불러오기", "휴대폰을 바꿨을 때 자료를 되살려요")}
    </div>
    <p class="hint" style="margin:0 4px 0">자료는 이 휴대폰 안에만 있어요. 백업 파일은 '내 파일 → 다운로드'에 저장되고, 카카오톡 '나와의 채팅'에 보내 두면 더 안전해요.</p>
    <h2>설정</h2>
    <div class="card fee-card">
      <span class="menu-ic">${icon("percent")}</span>
      <label class="fee-label" for="fee-rate"><strong>수수료</strong><small>일당의 몇 %인지</small></label>
      <div class="fee-input"><input id="fee-rate" type="number" inputmode="numeric" min="0" max="100" value="${esc(state.feeRate)}" /><span>%</span></div>
      <button class="btn primary" data-act="save-fee">저장</button>
    </div>
    <details class="howto"><summary>홈 화면에 앱 아이콘 만들기</summary>
      <p><strong>크롬:</strong> 오른쪽 위 ⋮ 메뉴 → '홈 화면에 추가'</p>
      <p><strong>삼성 인터넷:</strong> 아래 ≡ 메뉴 → '현재 페이지 추가' → '홈 화면'</p>
      <p><strong>아이폰 사파리:</strong> 아래 공유 버튼 → '홈 화면에 추가'</p>
    </details>
    <h2>연습</h2>
    ${hasData
      ? `<p class="hint" style="margin:0 4px">연습이 끝나면 아래 '모든 자료 지우기'로 지우고 실제로 쓰시면 돼요.</p>`
      : `<div class="menu">${menuRow("seed", "play", "연습용 예시 자료 넣기", "가짜 구직자·일감으로 눌러 볼 수 있어요")}</div>`}
    <div class="danger-zone"><button class="link-btn" data-act="wipe">모든 자료 지우기</button></div>
    <p class="app-version">앱 버전 ${APP_VERSION}</p>`;
  };

  // ---------- 그리기 ----------
  const TITLES = { home: "다원 소개소", jobs: "일감", people: "사람", scripts: "문자 문구", more: "백업·설정" };
  const screens = { home: renderHome, jobs: renderJobs, people: renderPeople, scripts: renderScripts, more: renderMore, job: renderJob, worker: renderWorker };
  const render = () => {
    const tab = { job: "jobs", worker: "people" }[route.name] || route.name;
    document.querySelectorAll(".tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    const detail = isDetail(route);
    $("#back").hidden = !detail;
    $("#title").textContent = route.name === "job" ? "일감 보기" : route.name === "worker" ? (worker(route.id)?.name || "사람") : TITLES[route.name];
    const scr = $("#screen");
    scr.innerHTML = (screens[route.name] || renderHome)(route.id);
    // 화면을 옮겼을 때만 움직임 (버튼 누를 때마다 다시 그려도 흔들리지 않게)
    const dir = navDir;
    navDir = "";
    // 버튼을 눌러 다시 그릴 때는 목록이 다시 올라오지 않게 차례 효과를 뗌
    if (!dir) { scr.classList.remove("enter-tab"); return; }
    if (reduceMotion) return;
    scr.classList.remove("enter-forward", "enter-back", "enter-tab");
    void scr.offsetWidth; // 애니메이션을 처음부터 다시 시작하게 함
    scr.classList.add(`enter-${dir}`);
    if (dir === "tab") [...scr.children].slice(0, 10).forEach((el, i) => el.style.setProperty("--i", i));
    countUp(scr);
  };
  // 숫자가 0부터 빠르게 올라가는 효과 (예: 수수료 12,000원)
  const countUp = (root) => root.querySelectorAll("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    if (!to) return;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / 650);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(to * eased).toLocaleString("ko-KR")}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  const refresh = () => { save(); render(); };

  // ---------- 입력창들 ----------
  const roleChips = (name, selected, multi) => `<div class="chips">${ROLES.map((r) => `<label class="chip"><input type="${multi ? "checkbox" : "radio"}" name="${name}" value="${r}" ${selected.includes(r) ? "checked" : ""} ${multi ? "" : "required"} /><span>${r}</span></label>`).join("")}</div>`;
  const val = (fd, k) => String(fd.get(k) ?? "").trim();

  // 일감 받기 / 고치기
  // 시간 고르기: [시 ▾] [분 ▾] 두 칸 (분은 10분 단위). 실제 값은 숨은 칸(name)에 "09:30"처럼 들어감
  const HOURS = [...Array(24).keys()].map((n) => (n + 5) % 24); // 새벽 5시부터 시작하는 순서
  const hourLabel = (h) => `${h === 0 ? "밤" : h < 6 ? "새벽" : h < 12 ? "오전" : h === 12 ? "낮" : h < 18 ? "오후" : h < 22 ? "저녁" : "밤"} ${h % 12 || 12}시`;
  const timePicker = (name, value) => {
    const [h, m] = value ? value.split(":").map(Number) : [null, null];
    const mins = [0, 10, 20, 30, 40, 50];
    if (m !== null && !mins.includes(m)) mins.push(m); // 예전에 1분 단위로 넣은 값도 보이게
    return `<div class="time-pick" data-time="${name}">
      <select aria-label="시" data-part="h"><option value="">시</option>${HOURS.map((x) => `<option value="${x}" ${x === h ? "selected" : ""}>${hourLabel(x)}</option>`).join("")}</select>
      <select aria-label="분" data-part="m">${mins.sort((a, b) => a - b).map((x) => `<option value="${x}" ${x === (m ?? 0) ? "selected" : ""}>${String(x).padStart(2, "0")}분</option>`).join("")}</select>
      <input type="hidden" name="${name}" value="${esc(value || "")}" />
    </div>`;
  };
  const BREAKS = [[0, "없음"], [30, "30분"], [60, "1시간"], [90, "1시간 30분"]];
  const MAX_DAYS = 14;

  const jobForm = (existing) => {
    const j = existing || { date: today(), start: "", end: "", hourly: "", nightHourly: "", breakMin: 0, pay: "", headcount: 1, role: "", memo: "", restaurantId: "" };
    // 최근에 일감을 준 식당이 위로
    const lastUse = (r) => state.jobs.filter((x) => x.restaurantId === r.id).map((x) => x.date).sort().pop() || "";
    const rests = [...state.restaurants].sort((a, b) => lastUse(b).localeCompare(lastUse(a)) || a.name.localeCompare(b.name, "ko"));
    const quick = ["오늘", "내일", "모레"].map((label, n) => `<label class="chip"><input type="radio" name="dateQuick" value="${today(n)}" ${j.date === today(n) ? "checked" : ""} /><span>${label}</span></label>`).join("");
    const body = `
      <label class="field">식당
        <select name="restaurantId" required>
          <option value="">식당을 고르세요</option>
          ${rests.map((r) => `<option value="${r.id}" ${r.id === j.restaurantId ? "selected" : ""}>${esc(r.name)}${r.area ? ` (${esc(r.area)})` : ""}</option>`).join("")}
          <option value="__new" ${rests.length ? "" : "selected"}>+ 새 식당 등록</option>
        </select></label>
      <div class="new-rest" ${rests.length ? "hidden" : ""}>
        ${placeNameField("r")}
        <div class="two"><label class="field">지역<input name="rArea" placeholder="예: 종로" /></label><label class="field">전화<input name="rPhone" type="tel" inputmode="tel" /></label></div>
        ${addressFields("r")}
        <label class="field">오시는 길<input name="rWay" placeholder="예: 종로3가역 5번 출구, 파리바게뜨 골목 2층" /></label>
      </div>
      <fieldset class="field"><legend>업무</legend>${roleChips("role", [j.role], false)}</fieldset>
      <fieldset class="field"><legend>날짜</legend>
        <div class="chips">${quick}${existing ? "" : `<label class="chip"><input type="radio" name="dateQuick" value="multi" /><span>여러 날</span></label>`}</div>
        <div class="date-range">
          <input type="date" name="date" value="${esc(j.date)}" required />
          <span class="range-to" hidden>~</span>
          <input type="date" name="dateEnd" hidden />
        </div>
        <span class="hint" id="days-hint"></span>
      </fieldset>
      <div class="field">시작${timePicker("start", j.start)}</div>
      <div class="field">끝${timePicker("end", j.end)}</div>
      <fieldset class="field"><legend>휴게시간 <span class="hint" style="display:inline">시급 계산에서 빠져요</span></legend>
        <div class="chips">${BREAKS.map(([v, label]) => `<label class="chip"><input type="radio" name="breakMin" value="${v}" ${Number(j.breakMin || 0) === v ? "checked" : ""} /><span>${label}</span></label>`).join("")}</div>
      </fieldset>
      <label class="field">시급 (원)<input name="hourly" inputmode="numeric" placeholder="예: 11000" value="${esc(j.hourly || "")}" /></label>
      <div class="field night-field" hidden>밤 시급 (밤 10시~아침 6시)
        <span class="name-search"><input name="nightHourly" inputmode="numeric" placeholder="비워 두면 낮 시급과 같아요" value="${esc(j.nightHourly || "")}" /><button type="button" class="name-search-btn" data-night-x="1.5">1.5배</button></span>
      </div>
      <span class="pay-calc" id="pay-calc"></span>
      <div class="field">필요 인원<div class="stepper"><button type="button" data-step="-1" aria-label="줄이기">${icon("minus")}</button><input name="headcount" type="number" min="1" max="20" value="${esc(j.headcount)}" /><button type="button" data-step="1" aria-label="늘리기">${icon("plus")}</button></div></div>
      <label class="field">메모<textarea name="memo" rows="2" placeholder="예: 앞치마 지참">${esc(j.memo)}</textarea></label>`;

    // 날짜 목록: 여러 날이면 시작~끝의 모든 날짜
    const datesOf = (form) => {
      const from = form.elements.date.value;
      if (!form.querySelector("input[name=dateQuick][value=multi]")?.checked) return from ? [from] : [];
      const to = form.elements.dateEnd.value;
      if (!from || !to || to < from) return [];
      const out = [];
      const d = new Date(`${from}T00:00:00`);
      while (ymd(d) <= to && out.length <= MAX_DAYS) { out.push(ymd(d)); d.setDate(d.getDate() + 1); }
      return out;
    };

    openSheet({
      title: existing ? "일감 고치기" : "일감 받기",
      body,
      submit: existing ? "저장" : "저장하고 사람 찾기",
      onReady: (form) => {
        const select = form.elements.restaurantId;
        const box = form.querySelector(".new-rest");
        bindAddress(form, "r", form.elements.rArea);
        bindPlace(form, "r");
        // 시간 칸: 시·분을 고르면 숨은 칸에 "HH:MM"으로 넣음
        form.querySelectorAll(".time-pick").forEach((wrap) => wrap.addEventListener("change", () => {
          const h = wrap.querySelector('[data-part="h"]').value;
          const m = wrap.querySelector('[data-part="m"]').value;
          form.elements[wrap.dataset.time].value = h === "" ? "" : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          calc();
        }));
        // 시급 × 근무시간 = 일당 계산해서 바로 보여줌
        const num = (el) => Number(String(el.value).replace(/[^0-9]/g, ""));
        const calc = () => {
          const hourly = num(form.elements.hourly);
          const night = num(form.elements.nightHourly);
          const start = form.elements.start.value;
          const end = form.elements.end.value;
          const brk = form.querySelector("input[name=breakMin]:checked")?.value;
          const min = workMinutes(start, end, brk);
          // 밤 시간이 들어간 근무일 때만 밤 시급 칸을 보여줌
          form.querySelector(".night-field").hidden = !nightMinutes(start, end);
          const out = $("#pay-calc", form);
          if (hourly && min) {
            const b = payBreakdown(start, end, brk, hourly, night);
            const parts = b.nightMin
              ? `${b.dayMin ? `낮 ${hoursText(b.dayMin)} × ${won(hourly)} + ` : ""}밤 ${hoursText(b.nightMin)} × ${won(b.nightRate)}`
              : `${won(hourly)} × ${hoursText(b.dayMin)}`;
            out.innerHTML = `${parts} = <strong>일당 ${won(b.pay)}</strong><small>수수료 ${won(Math.round(b.pay * state.feeRate / 100))}</small>`;
          } else if (existing?.pay && !existing.hourly && !hourly) {
            out.innerHTML = `예전에 넣은 일당: <strong>${won(existing.pay)}</strong><small>시급을 넣으면 다시 계산돼요</small>`;
          } else out.innerHTML = min ? `근무 ${hoursText(min)} · 시급을 넣으면 일당이 계산돼요` : "";
        };
        // 날짜: 오늘·내일·모레 / 여러 날
        const multi = form.querySelector("input[name=dateQuick][value=multi]");
        const syncDates = () => {
          const isMulti = Boolean(multi?.checked);
          form.querySelector(".range-to").hidden = !isMulti;
          form.querySelector(".date-range").classList.toggle("multi", isMulti);
          form.elements.dateEnd.hidden = !isMulti;
          form.elements.dateEnd.required = isMulti;
          if (isMulti && !form.elements.dateEnd.value) {
            const d = new Date(`${form.elements.date.value || today()}T00:00:00`);
            d.setDate(d.getDate() + 2);
            form.elements.dateEnd.value = ymd(d);
          }
          const n = datesOf(form).length;
          $("#days-hint", form).textContent = isMulti ? (n ? `${n}일 연속 · 날짜마다 일감이 하나씩 만들어져요` : "끝 날짜를 시작 날짜 뒤로 골라 주세요") : "";
        };
        form.querySelectorAll("input[name=dateQuick]").forEach((i) => i.addEventListener("change", () => {
          if (i.value !== "multi") form.elements.date.value = i.value;
          syncDates();
        }));
        form.elements.date.addEventListener("change", () => {
          if (!multi?.checked) form.querySelectorAll("input[name=dateQuick]").forEach((i) => { i.checked = i.value === form.elements.date.value; });
          syncDates();
        });
        form.elements.dateEnd.addEventListener("change", syncDates);
        form.querySelectorAll("input[name=breakMin]").forEach((i) => i.addEventListener("change", calc));
        form.elements.hourly.addEventListener("input", calc);
        form.elements.nightHourly.addEventListener("input", calc);
        // [1.5배]: 낮 시급 × 1.5를 밤 시급 칸에 넣음
        form.querySelector("[data-night-x]").addEventListener("click", () => {
          const h = num(form.elements.hourly);
          if (!h) { toast("낮 시급을 먼저 넣어 주세요"); form.elements.hourly.focus(); return; }
          form.elements.nightHourly.value = Math.round(h * 1.5);
          calc();
        });
        const syncNew = () => {
          const isNew = select.value === "__new";
          box.hidden = !isNew;
          form.elements.rName.required = isNew;
        };
        select.addEventListener("change", syncNew);
        syncNew();
        syncDates();
        calc();
      },
      onSubmit: (fd, form) => {
        const start = val(fd, "start");
        const end = val(fd, "end");
        if (!start || !end) { toast("시작·끝 시간을 골라 주세요"); form.querySelector(".time-pick").scrollIntoView({ block: "center" }); return false; }
        const dates = datesOf(form);
        if (!dates.length) { toast("날짜를 확인해 주세요"); return false; }
        if (dates.length > MAX_DAYS) { toast(`한 번에 ${MAX_DAYS}일까지 넣을 수 있어요`); return false; }
        let restaurantId = val(fd, "restaurantId");
        if (restaurantId === "__new") {
          const r = { id: uid(), name: val(fd, "rName"), area: val(fd, "rArea"), phone: val(fd, "rPhone"), address: val(fd, "rAddress"), addrDetail: val(fd, "rAddrDetail"), way: val(fd, "rWay"), memo: "" };
          state.restaurants.push(r);
          restaurantId = r.id;
        }
        const hourly = Number(val(fd, "hourly").replace(/[^0-9]/g, "")) || 0;
        // 밤 근무가 없으면 밤 시급은 저장하지 않음
        const nightHourly = nightMinutes(start, end) ? Number(val(fd, "nightHourly").replace(/[^0-9]/g, "")) || 0 : 0;
        const breakMin = Number(val(fd, "breakMin")) || 0;
        // 일당: 시급이 있으면 낮·밤 나눠 계산, 없으면 예전 일당 그대로
        const pay = hourly ? payBreakdown(start, end, breakMin, hourly, nightHourly).pay : Number(existing?.pay) || 0;
        const data = {
          restaurantId,
          role: val(fd, "role"),
          start,
          end,
          breakMin,
          hourly,
          nightHourly,
          pay,
          headcount: Math.max(1, Number(val(fd, "headcount")) || 1),
          memo: val(fd, "memo"),
        };
        if (existing) {
          Object.assign(existing, data, { date: dates[0] });
          // 일당이 바뀌면 이미 출근한 분 수수료도 다시 계산
          assignsOf(existing.id).filter((a) => a.outcome === "done").forEach((a) => { a.fee = Math.round(data.pay * state.feeRate / 100); });
          refresh();
          toast("고쳤어요");
        } else {
          // 여러 날이면 날짜마다 일감을 하나씩 만들고 같은 묶음 번호(group)를 붙임
          const group = dates.length > 1 ? uid() : "";
          const made = dates.map((date) => ({ id: uid(), ...data, date, ...(group ? { group } : {}), created: today() }));
          state.jobs.push(...made);
          save();
          go({ name: "job", id: made[0].id });
          toast(made.length > 1 ? `${made.length}일치 일감을 만들었어요. 확정할 때 남은 날도 한 번에 할 수 있어요` : "일감을 저장했어요. 추천 순서대로 연락해 보세요.");
        }
      },
    });
  };

  // 사람 등록 / 고치기
  const workerForm = (existing) => {
    const w = existing || { name: "", phone: "", roles: [], area: "", memo: "", joined: today() };
    // photoChange: 저장할 때 반영할 사진 변경 (undefined = 그대로, "" = 지우기, 그 밖 = 새 사진)
    let photoChange;
    const hasPhoto = Boolean(existing && photos.get(existing.id));
    // 중복 확인: 같은 번호인 사람 (자기 자신은 빼고), 같은 이름인 사람
    let allowDupId = ""; // "그래도 새로 등록"을 누른 상대 번호
    const others = () => state.workers.filter((x) => x.id !== existing?.id);
    const findPhoneDup = (phone) => others().find((x) => samePhone(x.phone, phone));
    const findNameDup = (name) => name ? others().find((x) => x.name.trim() === name.trim()) : null;
    openSheet({
      title: existing ? "사람 정보 고치기" : "사람 등록",
      body: `${canPickContacts
          ? `<button type="button" class="btn big" data-pick-contact style="margin-bottom:16px">${icon("contacts")}연락처에서 고르기</button>`
          : `<label class="btn big" style="margin-bottom:6px">${icon("contacts")}연락처 파일로 불러오기<input type="file" accept=".vcf,text/vcard,text/x-vcard,text/directory" data-vcf-one hidden /></label>
             <p class="hint" style="margin:0 0 16px">연락처 앱에서 한 사람을 골라 <strong>공유 → 파일로 저장</strong>한 뒤, 이 버튼으로 그 파일을 고르세요.</p>`}
        <div class="photo-edit">
          <span id="photo-preview">${existing ? avatar(existing, "big") : `<span class="avatar big" aria-hidden="true">${icon("camera")}</span>`}</span>
          <div class="photo-buttons">
            <label class="btn">${icon("camera")}사진 찍기<input type="file" accept="image/*" capture="environment" data-photo-input hidden /></label>
            <label class="btn">${icon("image")}사진 불러오기<input type="file" accept="image/*" data-photo-input hidden /></label>
            <button type="button" class="btn ghost" data-photo-clear ${hasPhoto ? "" : "hidden"}>사진 지우기</button>
          </div>
        </div>
        <label class="field">이름<input name="name" required autocomplete="off" value="${esc(w.name)}" /></label>
        <label class="field">전화번호<input name="phone" type="tel" inputmode="tel" placeholder="010-0000-0000" value="${esc(w.phone)}" /></label>
        <div id="dup-box"></div>
        <fieldset class="field"><legend>할 수 있는 일 <span class="hint" style="display:inline">여러 개 · 나중에 골라도 돼요</span></legend>${roleChips("roles", w.roles || [], true)}</fieldset>
        <label class="field">사는 곳 / 가능 지역<input name="area" placeholder="예: 종로" value="${esc(w.area)}" /></label>
        <label class="field">가입일<input name="joined" type="date" value="${esc(w.joined || "")}" /></label>
        <label class="field">메모<textarea name="memo" rows="3" placeholder="예: 오전만 가능, 한식 경력 10년">${esc(w.memo)}</textarea></label>`,
      onReady: (form) => {
        const preview = $("#photo-preview", form);
        const clearBtn = form.querySelector("[data-photo-clear]");
        // 미리보기 사진 바꾸기 (저장 전까지는 실제로 바뀌지 않음)
        const showPhoto = (url) => {
          preview.innerHTML = url ? `<img class="avatar big" src="${url}" alt="" />` : `<span class="avatar big" aria-hidden="true">${icon("camera")}</span>`;
          clearBtn.hidden = !url;
        };
        form.querySelectorAll("[data-photo-input]").forEach((input) => input.addEventListener("change", async () => {
          const file = input.files[0];
          input.value = "";
          if (!file) return;
          const url = URL.createObjectURL(file);
          const small = await shrinkImage(url);
          URL.revokeObjectURL(url);
          if (!small) { toast("이 사진은 열 수 없어요. 다른 사진을 골라 주세요."); return; }
          photoChange = small;
          showPhoto(small);
          toast("사진을 넣었어요. 저장을 눌러 주세요.");
        }));
        clearBtn.addEventListener("click", () => { photoChange = ""; showPhoto(""); });

        // 중복 알림 카드: 번호가 같으면 크게 알리고 그분 정보로 안내, 이름만 같으면 작게 알림
        const dupBox = $("#dup-box", form);
        const checkDup = () => {
          const phoneVal = form.elements.phone.value;
          const nameVal = form.elements.name.value.trim();
          // 고치기에서 번호·이름을 그대로 두면 확인하지 않음 (예전에 '그래도 새로 등록'한 분도 막히지 않게)
          const samePhoneAsBefore = existing && (samePhone(phoneVal, existing.phone) || (!digits(phoneVal) && !digits(existing.phone)));
          const d = samePhoneAsBefore ? null : findPhoneDup(phoneVal);
          const n = d || (existing && nameVal === existing.name.trim()) ? null : findNameDup(nameVal);
          if (d) {
            dupBox.innerHTML = `<div class="dup-card">
              <div class="dup-head">${icon("alert")}이미 등록된 분이에요</div>
              <div class="who">${avatar(d)}<div><strong>${esc(d.name)}</strong><div class="status-line">${esc([(d.roles || []).join("·") || "업무 미정", d.phone].filter(Boolean).join(" · "))}</div></div></div>
              <button type="button" class="btn primary" data-open-dup="${d.id}">${icon("users")}그분 정보 보기</button>
              ${allowDupId === d.id ? `<p class="hint" style="text-align:center">같은 번호지만 새로 등록하도록 표시했어요</p>` : `<button type="button" class="link-btn" data-allow-dup="${d.id}">그래도 새로 등록</button>`}
            </div>`;
          } else if (n) {
            dupBox.innerHTML = `<div class="dup-soft">같은 이름이 있어요: <strong>${esc(n.name)}</strong>${n.phone ? ` (${esc(n.phone)})` : ""} <button type="button" class="link-btn" data-open-dup="${n.id}">보기</button></div>`;
          } else dupBox.innerHTML = "";
          return d;
        };
        form.elements.phone.addEventListener("input", checkDup);
        form.elements.name.addEventListener("input", checkDup);
        form.querySelector(".sheet-body").addEventListener("click", (e) => {
          const open = e.target.closest("[data-open-dup]");
          if (open) { sheet.close(); go({ name: "worker", id: open.dataset.openDup }); return; }
          const allow = e.target.closest("[data-allow-dup]");
          if (allow) { allowDupId = allow.dataset.allowDup; checkDup(); }
        });
        form._checkDup = checkDup; // 저장할 때도 씀
        checkDup();

        // fillFromContact: 연락처 내용(이름 "김○○ 찬모", 번호, 사진)을 입력 칸에 채움. 두 가지 방법이 같이 씀
        const fillFromContact = async (fullName, phone, photoSrc) => {
          const parsed = parseContactName(fullName);
          form.elements.name.value = parsed.name;
          if (phone) form.elements.phone.value = normPhone(phone);
          form.querySelectorAll("input[name=roles]").forEach((i) => { if (parsed.roles.includes(i.value)) i.checked = true; });
          if (parsed.extra && !form.elements.memo.value) form.elements.memo.value = parsed.extra;
          let gotPhoto = false;
          if (photoSrc) {
            const small = await shrinkImage(photoSrc);
            if (small) { photoChange = small; showPhoto(small); gotPhoto = true; }
          }
          // 이미 등록된 분이면 알림 카드를 띄우고 그쪽으로 화면을 옮김 (두 번 등록 방지)
          const dup = checkDup();
          if (dup) { dupBox.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); toast(`이미 등록된 분이에요: ${dup.name}님`); }
          else toast(gotPhoto ? "연락처 정보와 사진을 넣었어요" : "연락처 정보를 넣었어요");
        };

        // 방법 1: 크롬 연락처 선택 창 (안드로이드)
        form.querySelector("[data-pick-contact]")?.addEventListener("click", async () => {
          try {
            const supported = await navigator.contacts.getProperties();
            const props = ["name", "tel", ...(supported.includes("icon") ? ["icon"] : [])];
            const [c] = await navigator.contacts.select(props, { multiple: false });
            if (!c) return;
            const icon = c.icon?.[0];
            const url = icon ? URL.createObjectURL(icon) : "";
            await fillFromContact((c.name || [])[0] || "", c.tel?.[0] || "", url);
            if (url) URL.revokeObjectURL(url);
          } catch (_) {
            toast("연락처를 가져오지 못했어요. 직접 입력해 주세요.");
          }
        });

        // 방법 2: 연락처 파일(.vcf) 한 개 고르기 (아이폰 등)
        form.querySelector("[data-vcf-one]")?.addEventListener("change", async (e) => {
          const file = e.target.files[0];
          e.target.value = "";
          if (!file) return;
          try {
            const list = parseVcf(await file.text());
            if (!list.length) { toast("전화번호가 있는 연락처를 찾지 못했어요."); return; }
            await fillFromContact(list[0].full, list[0].phone, list[0].photo);
            if (list.length > 1) toast(`파일에 ${list.length}명이 있어서 첫 번째 분만 넣었어요. 여러 명은 백업 화면에서 불러오세요.`);
          } catch (_) {
            toast("연락처 파일을 읽지 못했어요.");
          }
        });
      },
      onSubmit: (fd, form) => {
        // 같은 번호가 이미 있으면 저장을 막고 알림 카드로 안내 ("그래도 새로 등록"을 눌렀으면 통과)
        const dup = form._checkDup();
        if (dup && allowDupId !== dup.id) {
          const card = form.querySelector(".dup-card");
          card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
          card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash");
          toast(`이미 등록된 분이에요. '그분 정보 보기'를 눌러 주세요`);
          return false;
        }
        // 업무는 골라도 되고 안 골라도 됨 (안 고르면 "업무 미정", 추천 순서에는 안 나옴)
        const roles = fd.getAll("roles").map(String);
        const data = { name: val(fd, "name"), phone: val(fd, "phone"), roles, area: val(fd, "area"), joined: val(fd, "joined"), memo: val(fd, "memo") };
        const later = roles.length ? "" : " · 업무를 고르면 추천 순서에 나와요";
        let id;
        if (existing) { Object.assign(existing, data); id = existing.id; toast(`고쳤어요${later}`); }
        else { id = uid(); state.workers.push({ id, active: true, ...data }); toast(`${data.name}님을 등록했어요${later}`); }
        if (photoChange === "") removePhoto(id);
        else if (photoChange) setPhoto(id, photoChange).then(render);
        refresh();
      },
    });
  };

  // ---------- 주소 검색 (카카오 우편번호 서비스: 가입·키 필요 없음) ----------
  const POSTCODE_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  let postcodeLoading = null;
  // 주소 검색 기능은 처음 쓸 때만 인터넷에서 불러옴
  const loadPostcode = () => (postcodeLoading ||= new Promise((resolve, reject) => {
    if (window.daum?.Postcode) { resolve(); return; }
    const s = document.createElement("script");
    s.src = POSTCODE_SRC;
    s.onload = () => resolve();
    s.onerror = () => { postcodeLoading = null; s.remove(); reject(new Error("load")); };
    document.head.append(s);
  }));
  // 주소 칸 이름 (p가 "r"이면 rAddress·rAddrDetail, 없으면 address·addrDetail)
  const addrName = (p, k) => (p ? p + k[0].toUpperCase() + k.slice(1) : k);
  // 주소 칸 묶음: 누르면 검색이 열리는 주소 칸 + 상세 주소 칸 + 직접 입력
  const addressFields = (p, r = {}) => `<div class="field addr-field">주소
      <input name="${addrName(p, "address")}" class="addr-input" readonly placeholder="동·도로명·건물 이름으로 찾기" value="${esc(r.address || "")}" />
      <input name="${addrName(p, "addrDetail")}" placeholder="상세 주소 (예: 2층, ○○빌딩 3층)" value="${esc(r.addrDetail || "")}" />
      <span class="hint">확정 문자에 주소와 지도 링크로 들어가요 · <button type="button" class="link-inline" data-addr-manual>주소 직접 입력</button></span>
    </div>`;
  // 주소 칸에 검색 연결 (areaInput: 비어 있으면 '시·구'를 자동으로 채울 지역 칸)
  const bindAddress = (form, p, areaInput) => {
    const addr = form.elements[addrName(p, "address")];
    const detail = form.elements[addrName(p, "addrDetail")];
    const open = async () => {
      if (!addr.readOnly) return; // 직접 입력 중이면 검색 안 띄움
      if (!navigator.onLine) { toast("주소 검색은 인터넷이 필요해요. '주소 직접 입력'을 눌러 주세요."); return; }
      const panel = document.createElement("div");
      panel.className = "addr-search";
      panel.innerHTML = `<div class="addr-head"><button type="button" class="back" aria-label="뒤로">‹</button><h2>주소 검색</h2></div>
        <div class="addr-body"><p class="addr-tip">불러오는 중…</p></div>`;
      form.classList.add("searching");
      form.append(panel);
      const close = () => { panel.remove(); form.classList.remove("searching"); };
      panel.querySelector(".back").addEventListener("click", close);
      try { await loadPostcode(); }
      catch (_) { close(); toast("주소 검색을 불러오지 못했어요. '주소 직접 입력'을 눌러 주세요."); return; }
      if (!panel.isConnected) return; // 불러오는 사이에 닫았으면 그만
      const body = panel.querySelector(".addr-body");
      body.innerHTML = "";
      new window.daum.Postcode({
        width: "100%",
        height: "100%",
        oncomplete: (d) => {
          // 도로명 주소 + (법정동, 아파트 이름) — 예: 경상북도 구미시 낙동강변로 889 (신평동)
          const base = d.roadAddress || d.jibunAddress || d.address;
          const extra = [/[동로가]$/.test(d.bname || "") ? d.bname : "", d.apartment === "Y" ? d.buildingName : ""].filter(Boolean).join(", ");
          addr.value = extra ? `${base} (${extra})` : base;
          if (areaInput && !areaInput.value.trim()) areaInput.value = d.sigungu || d.sido || "";
          close();
          detail.focus();
          toast("주소를 넣었어요. 상세 주소(층·호)를 적어 주세요");
        },
      }).embed(body, { autoClose: false });
    };
    addr.addEventListener("click", open);
    form.querySelector("[data-addr-manual]").addEventListener("click", () => {
      addr.readOnly = false;
      addr.placeholder = "예: 서울 종로구 종로 123";
      addr.focus();
    });
  };
  // ---------- 식당 이름 검색 (카카오맵 장소 검색: 자바스크립트 키 필요) ----------
  // KAKAO_JS_KEY: 카카오 개발자 사이트에서 받은 'JavaScript 키'. 비어 있으면 이름 검색 버튼을 숨김
  // (이 키는 웹페이지에 넣도록 만들어진 키이고, 등록한 사이트 주소에서만 쓸 수 있음)
  const KAKAO_JS_KEY = "";
  let kakaoLoading = null;
  const loadKakaoPlaces = () => (kakaoLoading ||= new Promise((resolve, reject) => {
    const ready = () => window.kakao?.maps?.services;
    if (ready()) { resolve(); return; }
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`;
    s.onload = () => {
      if (!window.kakao?.maps?.load) { kakaoLoading = null; reject(new Error("sdk")); return; }
      window.kakao.maps.load(() => (ready() ? resolve() : reject(new Error("services"))));
    };
    s.onerror = () => { kakaoLoading = null; s.remove(); reject(new Error("load")); };
    document.head.append(s);
  }));
  // 식당 이름 칸 옆에 검색 버튼을 붙이고, 고르면 이름·주소·전화·지역을 채움 (p: "r"이면 rName 등)
  const bindPlace = (form, p) => {
    const btn = form.querySelector(`[data-place-search="${p}"]`);
    if (!btn) return;
    const el = (k) => form.elements[addrName(p, k)];
    btn.addEventListener("click", async () => {
      if (!navigator.onLine) { toast("이름 검색은 인터넷이 필요해요"); return; }
      const panel = document.createElement("div");
      panel.className = "addr-search place-search";
      panel.innerHTML = `<div class="addr-head"><button type="button" class="back" aria-label="뒤로">‹</button><h2>식당 이름으로 찾기</h2></div>
        <div class="place-q"><input type="search" enterkeyhint="search" placeholder="예: 구미 신평 국밥" value="${esc(el("name").value)}" /><button type="button" class="btn primary">검색</button></div>
        <p class="addr-tip">지역 이름을 같이 쓰면 더 잘 찾아요 (예: 구미 ○○식당)</p>
        <div class="place-list"></div>`;
      form.classList.add("searching");
      form.append(panel);
      const close = () => { panel.remove(); form.classList.remove("searching"); };
      panel.querySelector(".back").addEventListener("click", close);
      const q = panel.querySelector(".place-q input");
      const list = panel.querySelector(".place-list");
      let results = [];
      let timer;
      const search = async () => {
        const text = q.value.trim();
        if (!text) { list.innerHTML = ""; return; }
        list.innerHTML = `<p class="addr-tip">찾는 중…</p>`;
        try { await loadKakaoPlaces(); }
        catch (_) { list.innerHTML = `<p class="addr-tip">검색을 불러오지 못했어요. 주소 검색이나 직접 입력을 써 주세요.</p>`; return; }
        const { services } = window.kakao.maps;
        new services.Places().keywordSearch(text, (data, status) => {
          if (q.value.trim() !== text || !panel.isConnected) return; // 그사이 글자가 바뀌었으면 무시
          if (status === services.Status.ZERO_RESULT) { list.innerHTML = `<p class="addr-tip">찾는 식당이 없어요. 지역 이름을 붙이거나 주소 검색을 써 보세요.</p>`; return; }
          if (status !== services.Status.OK) { list.innerHTML = `<p class="addr-tip">검색이 잠시 안 돼요. 주소 검색이나 직접 입력을 써 주세요.</p>`; return; }
          results = data;
          list.innerHTML = data.map((d, i) => `<button type="button" class="place-row" data-i="${i}">
            <span class="place-name">${esc(d.place_name)}<small>${esc((d.category_name || "").split(" > ").pop())}</small></span>
            <span class="place-meta">${esc(d.road_address_name || d.address_name)}</span>
            ${d.phone ? `<span class="place-meta">${icon("phone")}${esc(d.phone)}</span>` : ""}</button>`).join("");
        }, { size: 15 });
      };
      q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(search, 400); });
      q.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); clearTimeout(timer); search(); } });
      panel.querySelector(".place-q .btn").addEventListener("click", () => { clearTimeout(timer); search(); });
      list.addEventListener("click", (e) => {
        const row = e.target.closest(".place-row");
        if (!row) return;
        const d = results[Number(row.dataset.i)];
        el("name").value = d.place_name;
        el("address").value = d.road_address_name || d.address_name;
        el("address").readOnly = true;
        el("addrDetail").value = "";
        if (d.phone) el("phone").value = d.phone;
        // 지역: 비어 있으면 주소의 시·군·구 (예: 경북 구미시 … → 구미시)
        if (!el("area").value.trim()) el("area").value = (d.address_name || "").split(" ")[1] || "";
        close();
        el("addrDetail").focus();
        toast("이름·주소·전화를 넣었어요. 상세 주소(층·호)가 있으면 적어 주세요");
      });
      q.focus();
      if (q.value.trim()) search();
    });
  };
  // 식당 이름 칸 (키가 있으면 오른쪽에 검색 버튼)
  const placeNameField = (p, value = "", required = false) => `<label class="field">식당 이름
      <span class="name-search"><input name="${addrName(p, "name")}" autocomplete="off" ${required ? "required" : ""} value="${esc(value)}" />${KAKAO_JS_KEY ? `<button type="button" class="name-search-btn" data-place-search="${p}" aria-label="식당 이름으로 찾기">${icon("search")}찾기</button>` : ""}</span>
      ${KAKAO_JS_KEY ? `<span class="hint">찾기를 누르면 주소·전화가 자동으로 들어가요</span>` : ""}</label>`;

  // 주소 + 상세 주소를 한 줄로 (예: 경상북도 구미시 낙동강변로 889 (신평동), 2층)
  const fullAddress = (r) => [r?.address, r?.addrDetail].filter(Boolean).join(", ");

  // 식당 등록 / 고치기
  const restForm = (existing) => {
    const r = existing || { name: "", area: "", phone: "", address: "", addrDetail: "", way: "", memo: "" };
    openSheet({
      title: existing ? "식당 정보" : "식당 등록",
      body: `${existing?.phone ? `<div class="btn-row" style="margin:0 0 16px"><a class="btn" href="${telHref(existing.phone)}">${icon("phone")}전화하기</a><a class="btn" href="${smsHref(existing.phone, "")}">${icon("message")}문자하기</a></div>` : ""}
        ${placeNameField("", r.name, true)}
        <div class="two"><label class="field">지역<input name="area" placeholder="예: 종로" value="${esc(r.area)}" /></label><label class="field">전화<input name="phone" type="tel" inputmode="tel" value="${esc(r.phone)}" /></label></div>
        ${addressFields("", r)}
        <label class="field">오시는 길<textarea name="way" rows="2" placeholder="예: 종로3가역 5번 출구로 나와서 파리바게뜨 끼고 골목 50m, 2층">${esc(r.way || "")}</textarea><span class="hint">구직자에게 보내는 확정 문자에 함께 들어가요</span></label>
        ${existing && mapUrl(existing) ? `<a class="btn" style="width:100%;margin:-4px 0 18px" href="${mapUrl(existing)}" target="_blank" rel="noopener">${icon("pin")}지도에서 위치 확인</a>` : ""}
        <label class="field">메모<textarea name="memo" rows="2" placeholder="예: 사장님이 조용한 분 선호">${esc(r.memo)}</textarea></label>
        ${existing ? `<button type="button" class="link-btn" data-act="del-rest" data-id="${existing.id}">이 식당 지우기</button>` : ""}`,
      onReady: (form) => { bindAddress(form, "", form.elements.area); bindPlace(form, ""); },
      onSubmit: (fd) => {
        const data = { name: val(fd, "name"), area: val(fd, "area"), phone: val(fd, "phone"), address: val(fd, "address"), addrDetail: val(fd, "addrDetail"), way: val(fd, "way"), memo: val(fd, "memo") };
        if (existing) Object.assign(existing, data);
        else state.restaurants.push({ id: uid(), ...data });
        refresh();
        toast("저장했어요");
      },
    });
  };

  // 문자 문구 만들기 / 고치기
  const scriptForm = (existing) => {
    const s = existing || { title: "", kind: "sms", text: "" };
    openSheet({
      title: existing ? "문구 고치기" : "새 문구",
      body: `<label class="field">제목<input name="title" required value="${esc(s.title)}" placeholder="예: 비 오는 날 안내" /></label>
        <fieldset class="field"><legend>어디에 쓰나요?</legend><div class="chips">
          <label class="chip"><input type="radio" name="kind" value="sms" ${s.kind !== "talk" ? "checked" : ""} /><span>문자</span></label>
          <label class="chip"><input type="radio" name="kind" value="talk" ${s.kind === "talk" ? "checked" : ""} /><span>전화로 말할 때</span></label></div></fieldset>
        <label class="field">내용<textarea name="text" rows="6" required>${esc(s.text)}</textarea></label>
        ${existing ? `<button type="button" class="link-btn" data-act="del-script" data-id="${existing.id}">이 문구 지우기</button>` : ""}`,
      onSubmit: (fd) => {
        const data = { title: val(fd, "title"), kind: val(fd, "kind") || "sms", text: val(fd, "text") };
        if (existing) Object.assign(existing, data);
        else state.scripts.push({ id: uid(), ...data });
        refresh();
        toast("저장했어요");
      },
    });
  };

  // 확정한 분이 못 간다고 할 때
  const cancelAsk = (a) => {
    const w = worker(a.workerId);
    openSheet({
      title: `${w?.name || ""}님 취소`,
      body: `<p>언제 알려왔나요?</p><div class="choice-list">
        <label class="choice"><input type="radio" name="kind" value="cancel_ok" required /><span><strong>미리 알려줬어요</strong><small>하루 전 이상 · 기록에 불이익 없음</small></span></label>
        <label class="choice"><input type="radio" name="kind" value="late" /><span><strong>직전에 취소했어요</strong><small>약속 기록에 '직전 취소'로 남아요</small></span></label></div>`,
      submit: "취소로 기록",
      onSubmit: (fd) => {
        setOutcome(a, val(fd, "kind"));
        const j = job(a.jobId);
        const sb = assignsOf(j.id).find((x) => x.status === "standby");
        if (route.name !== "job") go({ name: "job", id: j.id }); else refresh();
        toast(sb ? `대기 중인 ${worker(sb.workerId)?.name}님을 확정해 보세요` : "취소로 기록했어요. 다른 분을 찾아보세요.");
      },
    });
  };

  // 출근 결과 기록
  const setOutcome = (a, v) => {
    const j = job(a.jobId);
    if (v === "done") { a.status = "confirmed"; a.outcome = "done"; a.fee = Math.round((Number(j?.pay) || 0) * state.feeRate / 100); }
    else { a.status = "canceled"; a.outcome = v; a.fee = 0; a.rehire = false; }
    save();
  };

  // 연락 기록 추가 (전화·문자 버튼을 누르면 자동으로 "연락함"에 들어감)
  const addAssign = (workerId, jobId, status, quiet = false) => {
    const j = job(jobId);
    if (!j) return false;
    let a = state.assigns.find((x) => x.workerId === workerId && x.jobId === jobId);
    if (status === "confirmed" && jobNeed(j) === 0 && a?.status !== "confirmed") { if (!quiet) toast("인원이 이미 다 찼어요"); return false; }
    if (status === "confirmed" && busyFor(workerId, j)) { if (!quiet) toast("같은 시간에 다른 일이 확정된 분이에요"); return false; }
    if (!a) { a = { id: uid(), jobId, workerId, status, outcome: "", fee: 0, rehire: false }; state.assigns.push(a); }
    else a.status = status;
    if (status !== "canceled") a.outcome = "";
    save();
    return true;
  };

  // 확정: 여러 날 일감이면 "남은 날 모두 / 이 날만"을 물어봄
  const confirmFlow = (workerId, jobId) => {
    const j = job(jobId);
    const w = worker(workerId);
    if (!j || !w) return;
    const later = groupOf(j).filter((x) => x.date > j.date);
    if (!later.length) {
      buzz();
      if (addAssign(workerId, jobId, "confirmed")) toast("확정했어요. 확정 문자를 보내 주세요.");
      render();
      return;
    }
    const short = (x) => dateText(x.date).replace(/^(오늘|내일|어제) /, "");
    openSheet({
      title: `${w.name}님 확정`,
      body: `<p>${groupOf(j).length}일 연속 일감이에요. 어떻게 확정할까요?</p><div class="choice-list">
        <label class="choice"><input type="radio" name="scope" value="all" checked /><span><strong>남은 날 모두 확정</strong><small>${[j, ...later].map(short).join(", ")} (${later.length + 1}일)</small></span></label>
        <label class="choice"><input type="radio" name="scope" value="one" /><span><strong>이 날만 확정</strong><small>${short(j)}</small></span></label></div>`,
      submit: "확정",
      onSubmit: (fd) => {
        buzz();
        const targets = val(fd, "scope") === "all" ? [j, ...later] : [j];
        const ok = [];
        const fail = [];
        targets.forEach((x) => (addAssign(workerId, x.id, "confirmed", true) ? ok : fail).push(x));
        render();
        toast(fail.length
          ? `${ok.length}일 확정했어요. ${fail.map(short).join(", ")}은 인원이 찼거나 시간이 겹쳐서 뺐어요`
          : `${ok.length > 1 ? `${ok.length}일 모두 ` : ""}확정했어요. 확정 문자를 보내 주세요.`);
      },
    });
  };

  // ---------- 백업 ----------
  const doBackup = () => {
    state.lastBackup = today(); // 파일 안에도 백업 날짜가 들어가도록 먼저 적음
    const blob = new Blob([JSON.stringify({ ...state, photos: Object.fromEntries(photos) })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dawon-backup-${today()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    refresh();
    toast("백업 파일을 만들었어요 (다운로드 폴더)");
  };
  $("#import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!isValidData(data)) throw new Error("bad");
      if (!confirm(`백업 파일을 불러오면 지금 휴대폰의 자료가 백업 내용으로 바뀌어요.\n(구직자 ${data.workers.length}명, 일감 ${data.jobs.length}건)\n계속할까요?`)) return;
      const { photos: savedPhotos = {}, ...rest } = data;
      state = { ...blank(), ...rest };
      photos.clear();
      await photoDb.clear().catch(() => {});
      for (const [id, url] of Object.entries(savedPhotos)) await setPhoto(id, url);
      refresh();
      toast("백업을 불러왔어요");
    } catch (_) {
      toast("다원 백업 파일이 아니에요. 파일을 확인해 주세요.");
    }
  });

  // ---------- 연락처 파일(.vcf) 한 번에 가져오기 ----------
  const importContacts = (list) => {
    const rows = list.map((c, i) => {
      const dup = state.workers.find((w) => samePhone(w.phone, c.phone));
      return { ...c, i, dup };
    }).sort((a, b) => (Number(Boolean(a.dup)) - Number(Boolean(b.dup))) || (b.roles.length - a.roles.length) || a.name.localeCompare(b.name, "ko"));
    const withRole = rows.filter((r) => r.roles.length && !r.dup).length;
    const dupCount = rows.filter((r) => r.dup).length;
    openSheet({
      title: "연락처 가져오기",
      submit: "가져오기",
      body: `<p>연락처 <strong>${rows.length}개</strong>를 찾았어요. 이름에 업무(찬모·서빙·설거지)가 적힌 <strong>${withRole}명</strong>을 미리 골라 뒀어요.${dupCount ? ` 이미 등록된 ${dupCount}명은 건너뛰어요 (앱에 사진이 없으면 사진만 채워요).` : ""}</p>
        <p class="hint">구직자가 아닌 분(가족, 식당 등)은 체크를 풀어 주세요.</p>
        <input class="search" id="import-q" type="search" placeholder="이름·번호로 찾기" style="margin-top:10px" />
        <div class="btn-row" style="margin:0 0 12px"><button type="button" class="btn" data-pick="roles">업무 적힌 사람만</button><button type="button" class="btn" data-pick="none">모두 해제</button></div>
        <div id="import-list">${rows.map((r) => `<label class="pick-row" data-text="${esc(`${r.full} ${r.phone}`)}">
          <input type="checkbox" name="pick" value="${r.i}" ${r.roles.length && !r.dup ? "checked" : ""} ${r.dup ? "disabled" : ""} />
          ${r.photo ? `<img class="avatar" src="${esc(r.photo)}" alt="" />` : `<span class="avatar">${esc(r.name.slice(0, 1))}</span>`}
          <span><strong>${esc(r.name)}</strong> ${r.roles.length ? `<span class="tag">${esc(r.roles.join("·"))}</span>` : `<span class="tag warn">업무 없음</span>`}${r.dup ? `<span class="tag">이미 등록됨</span>` : ""}
          <small class="muted" style="display:block">${esc(r.phone)}${r.extra ? ` · ${esc(r.extra)}` : ""}</small></span></label>`).join("")}</div>`,
      onReady: (form) => {
        form.querySelector("#import-q").addEventListener("input", (e) => {
          const q = e.target.value.trim();
          form.querySelectorAll(".pick-row").forEach((row) => { row.hidden = Boolean(q) && !row.dataset.text.includes(q); });
        });
        form.querySelector(".sheet-body").addEventListener("click", (e) => {
          const b = e.target.closest("[data-pick]");
          if (!b) return;
          form.querySelectorAll("input[name=pick]:not(:disabled)").forEach((box) => {
            box.checked = b.dataset.pick === "roles" ? list[box.value].roles.length > 0 : false;
          });
        });
      },
      onSubmit: (fd) => {
        const picked = fd.getAll("pick").map((v) => list[Number(v)]);
        const dups = rows.filter((r) => r.dup && r.photo && !photos.get(r.dup.id));
        if (!picked.length && !dups.length) { toast("가져올 사람을 골라 주세요"); return false; }
        toast("가져오는 중이에요…");
        (async () => {
          for (const c of picked) {
            const id = uid();
            state.workers.push({ id, active: true, name: c.name, phone: c.phone, roles: c.roles, area: "", joined: "", memo: c.extra });
            if (c.photo) await setPhoto(id, await shrinkImage(c.photo));
          }
          for (const r of dups) await setPhoto(r.dup.id, await shrinkImage(r.photo));
          save();
          ui.peopleMode = "workers";
          go({ name: "people" });
          const noRole = picked.filter((c) => !c.roles.length).length;
          toast(`${picked.length}명을 가져왔어요${noRole ? `. 업무 미정 ${noRole}명은 업무를 골라 주세요` : ""}`);
        })();
      },
    });
  };
  $("#vcf-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const list = parseVcf(await file.text());
      if (!list.length) { toast("전화번호가 있는 연락처를 찾지 못했어요. 파일을 확인해 주세요."); return; }
      importContacts(list);
    } catch (_) {
      toast("연락처 파일을 읽지 못했어요.");
    }
  });

  // ---------- 연습용 예시 자료 ----------
  const seed = () => {
    const R = [
      { id: uid(), name: "예시 한식당", area: "종로", phone: "", address: "예시 주소 1", memo: "" },
      { id: uid(), name: "예시 국밥집", area: "마포", phone: "", address: "예시 주소 2", memo: "" },
      { id: uid(), name: "예시 고깃집", area: "종로", phone: "", address: "", memo: "" },
    ];
    const names = ["예시 김", "예시 이", "예시 박", "예시 최", "예시 정", "예시 강"];
    const roleSets = [["찬모", "설거지"], ["서빙"], ["서빙", "설거지"], ["찬모"], ["찬모", "서빙"], ["설거지"]];
    const areas = ["종로", "마포", "종로", "마포", "종로", "마포"];
    const W = names.map((n, i) => ({ id: uid(), name: n, phone: "", roles: roleSets[i], area: areas[i], memo: "", joined: today(-60), active: true }));
    const J = [];
    const A = [];
    // 지난 기록: 사람마다 다른 약속 기록이 생기도록
    const history = [["done", "done", "done", "done"], ["done", "late"], ["done", "done", "done"], ["noshow", "done", "noshow"], ["done"], []];
    W.forEach((w, i) => history[i].forEach((o, k) => {
      const j = { id: uid(), restaurantId: R[(i + k) % 3].id, role: w.roles[0], date: today(-(k * 3 + i + 2)), start: "10:00", end: "18:00", pay: 120000, headcount: 1, memo: "" };
      J.push(j);
      A.push({ id: uid(), jobId: j.id, workerId: w.id, status: o === "done" ? "confirmed" : "canceled", outcome: o, fee: o === "done" ? 12000 : 0, rehire: o === "done" && k === 0 });
    }));
    J.push({ id: uid(), restaurantId: R[0].id, role: "찬모", date: today(), start: "10:00", end: "18:00", pay: 130000, headcount: 1, memo: "점심·저녁 준비" });
    J.push({ id: uid(), restaurantId: R[1].id, role: "서빙", date: today(1), start: "11:00", end: "16:00", pay: 85000, headcount: 2, memo: "" });
    J.push({ id: uid(), restaurantId: R[2].id, role: "설거지", date: today(1), start: "17:00", end: "22:00", pay: 80000, headcount: 1, memo: "" });
    // 어제 확정했는데 출근 체크를 안 한 예시
    const y = { id: uid(), restaurantId: R[0].id, role: "서빙", date: today(-1), start: "11:00", end: "15:00", pay: 70000, headcount: 1, memo: "" };
    J.push(y);
    A.push({ id: uid(), jobId: y.id, workerId: W[2].id, status: "confirmed", outcome: "", fee: 0, rehire: false });
    state.restaurants.push(...R);
    state.workers.push(...W);
    state.jobs.push(...J);
    state.assigns.push(...A);
    refresh();
    toast("연습용 자료를 넣었어요. 홈에서 시작해 보세요.");
  };

  // ---------- 버튼 누름 처리 ----------
  const actions = {
    "new-job": () => jobForm(),
    "edit-job": (el) => jobForm(job(el.dataset.id)),
    "open-job": (el) => { if (sheet.open) sheet.close(); go({ name: "job", id: el.dataset.id }); },
    "del-job": (el) => {
      const j = job(el.dataset.id);
      if (!j || !confirm(`${dateText(j.date)} ${restName(j)} 일감과 연락 기록을 지울까요?`)) return;
      state.jobs = state.jobs.filter((x) => x.id !== j.id);
      state.assigns = state.assigns.filter((a) => a.jobId !== j.id);
      save();
      history.back();
      toast("지웠어요");
    },
    "new-worker": () => workerForm(),
    "edit-worker": (el) => workerForm(worker(el.dataset.id)),
    "open-worker": (el) => go({ name: "worker", id: el.dataset.id }),
    "toggle-active": (el) => { const w = worker(el.dataset.id); w.active = w.active === false; refresh(); toast(w.active ? "명단에 다시 보여요" : "명단에서 숨겼어요 (추천에 안 나와요)"); },
    "del-worker": (el) => {
      const w = worker(el.dataset.id);
      if (!w || !confirm(`${w.name}님과 이 분의 모든 기록을 지울까요?\n되돌릴 수 없어요. 숨기기를 먼저 고려해 주세요.`)) return;
      state.workers = state.workers.filter((x) => x.id !== w.id);
      state.assigns = state.assigns.filter((a) => a.workerId !== w.id);
      removePhoto(w.id);
      save();
      history.back();
      toast("지웠어요");
    },
    "new-rest": () => restForm(),
    "edit-rest": (el) => restForm(rest(el.dataset.id)),
    "del-rest": (el) => {
      const r = rest(el.dataset.id);
      if (state.jobs.some((j) => j.restaurantId === r.id)) { toast("일감 기록이 있는 식당은 지울 수 없어요"); return; }
      if (!confirm(`${r.name}을(를) 지울까요?`)) return;
      state.restaurants = state.restaurants.filter((x) => x.id !== r.id);
      sheet.close();
      refresh();
    },
    "add-assign": (el) => {
      if (el.dataset.v === "confirmed") { confirmFlow(el.dataset.worker, el.dataset.job); return; }
      addAssign(el.dataset.worker, el.dataset.job, el.dataset.v); render(); toast("대기로 넣었어요");
    },
    "contacted": (el) => {
      // 전화/문자 앱이 열린 뒤에 기록 (링크 동작을 막지 않음)
      const { worker: wId, job: jId } = el.dataset;
      if (!state.assigns.some((a) => a.workerId === wId && a.jobId === jId)) setTimeout(() => { addAssign(wId, jId, "asked"); render(); }, 400);
    },
    "set-status": (el) => {
      const a = assign(el.dataset.id);
      if (el.dataset.v === "confirmed") { confirmFlow(a.workerId, a.jobId); return; }
      addAssign(a.workerId, a.jobId, el.dataset.v); render();
    },
    "remove-assign": (el) => { state.assigns = state.assigns.filter((a) => a.id !== el.dataset.id); refresh(); },
    "outcome": (el) => { buzz(); setOutcome(assign(el.dataset.id), el.dataset.v); render(); toast(el.dataset.v === "done" ? "출근으로 기록했어요" : "안 나옴으로 기록했어요"); },
    "cancel-ask": (el) => cancelAsk(assign(el.dataset.id)),
    "undo-assign": (el) => { const a = assign(el.dataset.id); a.status = "confirmed"; a.outcome = ""; a.fee = 0; a.rehire = false; refresh(); toast("확정 상태로 되돌렸어요"); },
    "toggle-rehire": (el) => { const a = assign(el.dataset.id); a.rehire = !a.rehire; refresh(); },
    "copy-rest-msg": (el) => { const a = assign(el.dataset.id); copyText(restMsg(job(a.jobId), worker(a.workerId))); },
    "show-more": (el) => { ui.showAll[el.dataset.id] = true; render(); },
    "jobs-mode": (el) => { ui.jobsMode = el.dataset.v; render(); },
    "people-mode": (el) => { ui.peopleMode = el.dataset.v; ui.peopleQuery = ""; render(); },
    "role-filter": (el) => { ui.peopleRole = el.dataset.v; render(); },
    "copy-script": (el) => copyText(state.scripts.find((s) => s.id === el.dataset.id)?.text || ""),
    "edit-script": (el) => scriptForm(state.scripts.find((s) => s.id === el.dataset.id)),
    "new-script": () => scriptForm(),
    "del-script": (el) => { if (!confirm("이 문구를 지울까요?")) return; state.scripts = state.scripts.filter((s) => s.id !== el.dataset.id); sheet.close(); refresh(); },
    "backup": doBackup,
    "import": () => $("#import-file").click(),
    "import-vcf": () => $("#vcf-file").click(),
    "save-fee": () => { const n = Number($("#fee-rate").value); if (!(n >= 0 && n <= 100)) { toast("0~100 사이로 적어 주세요"); return; } state.feeRate = n; refresh(); toast("저장했어요"); },
    "seed": seed,
    "wipe": () => {
      if (!confirm("정말 모든 자료를 지울까요? 백업 파일이 없으면 되돌릴 수 없어요.")) return;
      if (!confirm("한 번 더 확인할게요. 모두 지울까요?")) return;
      state = blank();
      photos.clear();
      photoDb.clear().catch(() => {});
      refresh();
      toast("모두 지웠어요");
    },
  };
  document.addEventListener("click", (e) => {
    const tab = e.target.closest(".tabbar [data-tab]");
    if (tab) { if (route.name !== tab.dataset.tab) go({ name: tab.dataset.tab }); return; }
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    actions[el.dataset.act]?.(el, e);
  });
  // 검색 칸: 글자를 칠 때마다 목록만 다시 그림 (입력 중인 칸은 그대로)
  document.addEventListener("input", (e) => {
    if (e.target.id !== "people-q") return;
    ui.peopleQuery = e.target.value;
    $("#people-list").innerHTML = peopleList();
  });
  $("#back").addEventListener("click", () => history.back());

  // 인터넷이 없어도 열리도록 준비 (웹 주소로 열었을 때만 동작)
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    // updateViaCache: "none" → 새 버전이 있는지 확인할 때 기억해 둔 옛 파일을 쓰지 않음
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).catch(() => {});
  }

  // 사진을 먼저 불러온 뒤 첫 화면을 그림 (0.8초 안에 안 되면 먼저 그리고, 사진이 오면 다시 그림)
  let photosLoaded = false;
  const photosReady = photoDb.all()
    .then((list) => list.forEach(([id, url]) => photos.set(id, url)))
    .catch(() => {})
    .finally(() => { photosLoaded = true; });
  Promise.race([photosReady, new Promise((r) => setTimeout(r, 800))]).then(() => {
    const late = !photosLoaded;
    render();
    // 사진이 늦게 왔을 때만 한 번 더 그림 (제때 왔으면 다시 그리지 않아 첫 움직임이 끊기지 않음)
    if (late) photosReady.then(() => { if (photos.size) render(); });
  });
})();
