(() => {
  "use strict";

  // 앱 버전(APP_VERSION): 설정 화면 맨 아래에 표시. sw.js의 CACHE 이름과 같이 올림
  const APP_VERSION = "v86";
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
  // 공휴일 (토·일은 따로 계산). 2026·2027년: 설·추석·대체공휴일·임시공휴일(지방선거) 포함, 2026년부터 노동절·제헌절 포함
  const HOLIDAYS = new Set([
    "2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-03-01", "2026-03-02", "2026-05-01", "2026-05-05",
    "2026-05-24", "2026-05-25", "2026-06-03", "2026-06-06", "2026-07-17", "2026-08-15", "2026-08-17", "2026-09-24",
    "2026-09-25", "2026-09-26", "2026-10-03", "2026-10-05", "2026-10-09", "2026-12-25",
    "2027-01-01", "2027-02-06", "2027-02-07", "2027-02-08", "2027-02-09", "2027-03-01", "2027-05-01", "2027-05-03",
    "2027-05-05", "2027-05-13", "2027-06-06", "2027-07-17", "2027-07-19", "2027-08-15", "2027-08-16", "2027-09-14",
    "2027-09-15", "2027-09-16", "2027-10-03", "2027-10-04", "2027-10-09", "2027-10-11", "2027-12-25",
  ]);
  // isHolidayDate: 토·일 또는 공휴일인 날 ("2026-10-10" → true)
  const isHolidayDate = (d) => {
    if (!d) return false;
    const day = new Date(`${d}T00:00:00`).getDay();
    return day === 0 || day === 6 || HOLIDAYS.has(d);
  };
  // allDay: 주말·공휴일 일감이면 근무 전체를 밤 시급으로 (밤·주말·공휴일 시급이 같음)
  const payBreakdown = (start, end, breakMin, hourly, nightHourly, allDay = false) => {
    const total = workMinutes(start, end, 0);
    const nightAll = allDay ? total : nightMinutes(start, end);
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
  const hasNightRate = (j) => Boolean(j.nightHourly && Number(j.nightHourly) !== Number(j.hourly) && (j.holiday || nightMinutes(j.start, j.end)));
  // 문자·화면용 급여 글: "시급 11,000원(밤 16,500원) · 일당 110,000원"
  const payText = (j) => (j.hourly
    ? `${j.holiday ? `시급 ${won(Number(j.nightHourly) || j.hourly)}(주말·공휴일)` : `시급 ${won(j.hourly)}${hasNightRate(j) ? `(밤 ${won(j.nightHourly)})` : ""}`} · 일당 ${won(j.pay)}`
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
  // 이모티콘 없이, 문단 사이는 한 줄 띄움
  const defaultScripts = () => [
    { id: "s1", title: "밤늦게 온 연락 답장", kind: "sms", text: "늦은 시간까지 연락 주셔서 고마워요.\n\n지금은 바로 통화가 어려워서요, 내일 아침 7시에 제가 먼저 전화드릴게요.\n\n급한 일이면 한 번 더 걸어주세요." },
    { id: "s2", title: "일 언제 주냐는 연락", kind: "sms", text: "연락 주셔서 고마워요.\n\n요즘 약속 잘 지켜주시는 분들께 먼저 연락드리고 있어요.\n자리 나면 꼭 챙겨드릴게요." },
    { id: "s3", title: "술 드시고 온 전화 (말로 할 때)", kind: "talk", text: "오늘은 늦었으니까 내일 맑은 정신으로 얘기해요. 제가 내일 꼭 전화드릴게요. 푹 쉬세요." },
    { id: "s4", title: "직전 취소 연락 받았을 때", kind: "sms", text: "알려주셔서 고마워요.\n\n다음부터는 하루 전까지만 알려주시면 식당에 미리 말씀드릴 수 있어요.\n\n몸 잘 챙기세요." },
    { id: "s6", title: "처음 가입한 분 안내", kind: "sms", text: "[다원] 가입해 주셔서 고마워요.\n\n[일 순서]\n약속 잘 지켜주시는 분들께 먼저 연락드려요.\n\n[취소할 때]\n못 가시게 되면 꼭 하루 전까지 알려주세요.\n\n[밤에 연락할 때]\n문자 남겨주시면 아침에 연락드릴게요." },
  ];
  // 예전(이모티콘 있던) 기본 문구: 엄마가 고치지 않고 그대로 쓰는 문구만 새 문구로 바꿔 줌
  const OLD_SCRIPT_TEXT = {
    s1: "늦은 시간까지 연락 주셔서 고마워요 😊 지금은 바로 통화가 어려워서요, 내일 아침 7시에 제가 먼저 전화드릴게요. 급한 일이면 한 번 더 걸어주세요~",
    s2: "연락 주셔서 고마워요~ 요즘 약속 잘 지켜주시는 분들께 먼저 연락드리고 있어요. 자리 나면 꼭 챙겨드릴게요 😊",
    s3: "오늘은 늦었으니까 내일 맑은 정신으로 얘기해요. 제가 내일 꼭 전화드릴게요. 푹 쉬세요~",
    s4: "알려주셔서 고마워요. 다음부터는 하루 전까지만 알려주시면 식당에 미리 말씀드릴 수 있어요. 몸 잘 챙기세요 🙏",
    s5: "혹시 내일 빈자리가 생기면 바로 나가실 수 있을까요? 대기해 주시면 다음 일 먼저 챙겨드릴게요 😊",
    s6: "[다원] 가입해 주셔서 고마워요 😊 일은 약속 잘 지켜주시는 분들께 먼저 연락드려요. 못 가시게 되면 꼭 하루 전까지 알려주세요. 밤에는 문자 남겨주시면 아침에 연락드릴게요~",
  };
  // 빼기로 한 '대기 부탁' 문구 (엄마가 고치지 않은 그대로일 때만 지움)
  const STANDBY_TEXTS = [OLD_SCRIPT_TEXT.s5, "혹시 내일 빈자리가 생기면 바로 나가실 수 있을까요?\n\n대기해 주시면 다음 일 먼저 챙겨드릴게요."];
  const refreshOldScripts = (scripts) => {
    const fresh = Object.fromEntries(defaultScripts().map((x) => [x.id, x.text]));
    return (scripts || []).map((x) => (OLD_SCRIPT_TEXT[x.id] && x.text === OLD_SCRIPT_TEXT[x.id] ? { ...x, text: fresh[x.id] } : x));
  };

  // ---------- 자료 저장/불러오기 ----------
  // account: 수수료 받을 계좌 (예: 농협 123-4567-8901 김다원) / feeTrack: 수수료 받음 표시 기능을 쓰기 시작했는지
  const blank = () => ({ version: 1, restaurants: [], workers: [], jobs: [], assigns: [], scripts: defaultScripts(), feeRate: 10, rate: { day: 12000, night: 0 }, account: "", feeTrack: true, lastBackup: "" });
  // 수수료 받음 표시가 생기기 전의 출근 기록은 모두 '받음'으로 봄 (한 번만)
  const startFeeTrack = (st) => {
    if (st.feeTrack) return;
    st.assigns.forEach((a) => { if (a.outcome === "done") a.paid = true; });
    st.feeTrack = true;
  };
  const isValidData = (s) => s && Array.isArray(s.workers) && Array.isArray(s.jobs) && Array.isArray(s.assigns) && Array.isArray(s.restaurants);
  let localLoadError = false;
  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (isValidData(saved)) {
        const st = { ...blank(), feeTrack: false, ...saved };
        startFeeTrack(st);
        st.scripts = refreshOldScripts((st.scripts || []).filter((x) => !(x.id === "s5" && STANDBY_TEXTS.includes(x.text))));
        // 대기 기능을 뺐으므로 '대기 중'이던 분은 '연락함'으로 바꿈
        st.assigns.forEach((a) => { if (a.status === "standby") a.status = "asked"; });
        return st;
      }
      if (saved !== null) localLoadError = true;
    } catch (_) { localLoadError = true; }
    return blank();
  };
  let state = load();
  const save = () => {
    if (localLoadError) { showError("기존 자료를 읽지 못해 저장을 멈췄어요. 백업에서 복원해 주세요."); return; }
    try { localStorage.setItem(KEY, JSON.stringify(state)); window.DawonBackup?.changed(); }
    catch (_) { showError("휴대폰에 저장하지 못했어요. 저장 공간을 확인하고 ‘백업 파일 만들기’를 눌러 주세요."); }
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
      all: async () => {
        const db = await open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("photos", "readonly"); const store = tx.objectStore("photos");
          const keys = store.getAllKeys(), values = store.getAll();
          tx.oncomplete = () => resolve(keys.result.map((k, i) => [k, values.result[i]]));
          tx.onabort = tx.onerror = () => reject(tx.error);
        });
      },
      put: (id, url) => run("readwrite", (s) => s.put(url, id)),
      del: (id) => run("readwrite", (s) => s.delete(id)),
      clear: () => run("readwrite", (s) => s.clear()),
      replace: async (entries) => {
        const db = await open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("photos", "readwrite"); const store = tx.objectStore("photos");
          store.clear(); Object.entries(entries).forEach(([id, url]) => store.put(url, id));
          tx.oncomplete = resolve; tx.onabort = tx.onerror = () => reject(tx.error);
        });
      },
    };
  })();
  const setPhoto = async (id, url) => {
    if (!url) return;
    photos.set(id, url);
    try { await photoDb.put(id, url); window.DawonBackup?.changed(); } catch (_) { showError("사진을 저장하지 못했어요. 휴대폰 저장 공간을 확인해 주세요."); }
  };
  const removePhoto = (id) => { photos.delete(id); photoDb.del(id).then(() => window.DawonBackup?.changed()).catch(() => showError("사진을 지우지 못했어요. 저장 공간을 확인해 주세요.")); };
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
  const jobNeed = (j) => (j.canceled ? 0 : Math.max(0, Number(j.headcount || 1) - confirmedOf(j).length));
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
  // autoTrust: 기록을 보고 "믿음직 / 보통 / 신규 / 주의"로 나눔
  const autoTrust = (s) => {
    if (s.recentNoshow >= 2 || s.recentMiss >= 3) return { level: 2, label: "주의", cls: "bad" };
    if (s.recentMiss >= 1) return { level: 1, label: "보통", cls: "mid" };
    if (s.done >= 3) return { level: 0, label: "믿음직", cls: "good" };
    if (s.done >= 1) return { level: 1, label: "보통", cls: "mid" };
    return { level: 1, label: "신규", cls: "new" };
  };
  // 엄마가 직접 고른 표시 (w.trust: good·mid·bad). 고르지 않았으면 기록으로 자동
  const MANUAL_TRUST = { good: { level: 0, label: "믿음직", cls: "good" }, mid: { level: 1, label: "보통", cls: "mid" }, bad: { level: 2, label: "주의", cls: "bad" } };
  // 마지막 글자에 받침이 있는지 (으로/로, 이에요/예요 고르기)
  const hasBatchim = (word) => { const c = word.charCodeAt(word.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
  const trustOf = (s, w) => (w?.trust && MANUAL_TRUST[w.trust] ? { ...MANUAL_TRUST[w.trust], manual: true } : autoTrust(s));
  const badge = (t) => `<span class="badge ${t.cls}">${t.label}</span>`;
  // 순서 정하기: 믿음직 → 보통 → 주의, 같으면 오래 쉰 사람 먼저
  const byPriority = (x, y) => (x.t.level - y.t.level) || (x.s.lastWork || "").localeCompare(y.s.lastWork || "") || x.w.name.localeCompare(y.w.name, "ko");
  const ranked = (list) => list.map((w) => { const s = statsOf(w.id); return { w, s, t: trustOf(s, w) }; });

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
  // 업무별 추천 순서에서 몇 번째인지 (재촉 전화 받을 때 확인용)
  const rankIn = (role, workerId) => {
    const list = ranked(state.workers.filter((w) => w.active !== false && (w.roles || []).includes(role))).sort(byPriority);
    return { pos: list.findIndex((x) => x.w.id === workerId) + 1, total: list.length };
  };

  // ---------- 문자 내용 ----------
  // ---------- 보내는 문자 ----------
  // 문자 모양: 이모티콘 없이 [제목] 아래에 내용, 문단 사이는 한 줄 띄움
  const section = (title, ...lines) => {
    const body = lines.filter(Boolean);
    return body.length ? `[${title}]\n${body.join("\n")}` : "";
  };
  const letter = (...blocks) => blocks.filter(Boolean).join("\n\n");
  const shortDate = (d) => dateText(d).replace(/^(오늘|내일|어제) /, "");
  // 시간 줄: 구직자 문자도 식당 문자와 같은 "오전 6시 ~ 오후 3시(9시간)" 모양 (근무시간은 휴게를 뺀 시간)
  const timeLine = (j) => korRange(j);

  // 일 제안 문자
  const offerMsg = (j, w) => {
    const r = rest(j.restaurantId);
    const g = groupOf(j);
    return letter(
      `[다원] ${w.name}님, 일자리 안내드려요.`,
      section("근무", `${dateText(j.date)} ${timeLine(j)}`, `${r?.name || ""}${r?.area ? `(${r.area})` : ""} ${j.role}`),
      g.length > 1 ? section("기간", periodText(g)) : "",
      section("급여", payText(j)),
      "가능하시면 연락 주세요.",
    );
  };
  // mapUrl: 네이버 지도 검색 주소 (주소가 없으면 식당 이름+지역으로 찾음). 누르면 지도 앱이나 지도 웹이 열림
  const mapUrl = (r) => {
    const q = (r?.address ? r.address.replace(/\s*\([^)]*\)\s*$/, "") : `${r?.name || ""} ${r?.area || ""}`).trim();
    return q ? `https://map.naver.com/p/search/${encodeURIComponent(q)}` : "";
  };
  // 확정 문자: 근무·급여·주소·오시는 길·식당 전화를 문단별로
  const confirmMsg = (j, w) => {
    const r = rest(j.restaurantId);
    // 주소: 휴대폰이 알아보기 쉽게 괄호 속 동 이름을 빼고, 상세 주소는 다음 줄로 (누르면 지도가 열리도록)
    const road = (r?.address || "").replace(/\s*\([^)]*\)\s*$/, "");
    // 여러 날 연속으로 확정됐으면 근무일을 모두 적음
    const days = groupOf(j).filter((x) => state.assigns.some((a) => a.jobId === x.id && a.workerId === w.id && a.status === "confirmed"));
    return letter(
      `[다원] ${w.name}님 확정됐어요!`,
      section("근무", `${dateText(j.date)} ${timeLine(j)}`, `${r?.name || ""} ${j.role}`, `${korTime(j.start)}까지 가시면 돼요.`),
      days.length > 1 ? section("근무일", `${days.map((x) => shortDate(x.date)).join(", ")} (${days.length}일)`) : "",
      section("급여", payText(j)),
      road ? section("주소", road, r.addrDetail) : "",
      r?.way ? section("오시는 길", r.way) : "",
      r?.phone ? section("식당 전화", normPhone(r.phone)) : "",
      "혹시 못 가시게 되면 꼭 미리 알려주세요.",
    );
  };
  // 시간을 "오전 6시", "오후 3시 30분"처럼
  const korTime = (t) => {
    const [h, m] = String(t || "").split(":").map(Number);
    const part = h === 0 ? "밤" : h < 12 ? "오전" : "오후";
    return `${part} ${h % 12 || 12}시${m ? ` ${m}분` : ""}`;
  };
  // 근무시간: "오전 6시 ~ 오후 3시(9시간)", 휴게가 있으면 "(8시간 30분, 휴게 30분)"
  const korRange = (j) => `${korTime(j.start)} ~ ${korTime(j.end)}(${hoursText(workMinutes(j.start, j.end, j.breakMin))}${j.breakMin ? `, 휴게 ${hoursText(Number(j.breakMin))}` : ""})`;
  // 식당에 보내는 문자: 같은 요청의 업무를 모아 한 통으로 (확정된 사람·근무시간·연락처·남은 인원)
  const restJobMsg = (j) => {
    const jobs = reqOf(j);
    const sent = [];
    const left = [];
    jobs.forEach((x) => {
      // 확정된 분마다: 업무 이름님 / 근무시간 / 연락처
      confirmedOf(x).map((a) => worker(a.workerId)).filter(Boolean)
        .forEach((w) => sent.push(`${x.role} ${w.name}님\n${korRange(x)}${w.phone ? `\n\n${normPhone(w.phone)}` : ""}`));
      if (jobNeed(x)) left.push(`${x.role} ${jobNeed(x)}명`);
    });
    if (!sent.length) {
      return letter(
        `[다원] 사장님, ${dateText(j.date)} 요청 잘 받았어요.`,
        section("요청", jobs.map((x) => `${x.role} ${x.headcount}명\n${korRange(x)}`).join("\n\n")),
        "사람 구해지면 바로 연락드릴게요.",
      );
    }
    return letter(
      `[다원] 사장님, ${dateText(j.date)} 보내드릴 분 안내드려요.`,
      section("출근", sent.join("\n\n")),
      left.length ? section("남은 인원", left.join(" · ")) : "",
      left.length ? "남은 인원도 구해지면 바로 연락드릴게요." : "",
    );
  };
  // 사람 줄의 '식당에 알림'도 일감 화면의 '식당 문자'와 같은 내용
  const restMsg = (j) => restJobMsg(j);

  // ---------- 수수료 받기 ----------
  // 출근했고 수수료가 있는데 아직 '받음' 표시가 없는 기록
  const isUnpaid = (a) => a.outcome === "done" && !a.paid && (Number(a.fee) || 0) > 0;
  // 안 받은 수수료 목록 (오래된 일부터). workerId를 주면 그 사람 것만
  const unpaidList = (workerId) => state.assigns
    .filter((a) => isUnpaid(a) && (!workerId || a.workerId === workerId))
    .map((a) => ({ a, j: job(a.jobId), w: worker(a.workerId) }))
    .filter((x) => x.j && x.w)
    .sort((x, y) => x.j.date.localeCompare(y.j.date));
  const feeSumOf = (list) => list.reduce((sum, x) => sum + (Number(x.a.fee) || 0), 0);
  // 일한 날부터 며칠 지났는지 (일한 날 받는 게 원칙이라 다음 날부터 '지남')
  const overdueText = (j) => { const d = daysBetween(j.date, today()); return d <= 0 ? "오늘 일" : `${d}일 지남`; };
  // 수수료 안내 문자: 날짜별 금액, 합계, 입금 계좌
  const feeMsg = (w, list) => letter(
    `[다원] ${w.name}님, 수수료 안내드려요.`,
    section("수수료", ...list.map(({ a, j }) => `${shortDate(j.date)} ${restName(j)} ${j.role} ${won(a.fee)}`), list.length > 1 ? `합계 ${won(feeSumOf(list))}` : ""),
    state.account ? section("입금 계좌", state.account, "입금자명은 본인 이름으로 해 주세요.") : "",
    "확인 부탁드려요. 고맙습니다.",
  );
  // ---------- 알림(토스트) ----------
  let toastTimer, lastToast = "";
  const showError = (message) => {
    const box = $("#app-error");
    box.querySelector("span").textContent = message;
    box.hidden = false;
  };
  $("#app-error button").addEventListener("click", () => { $("#app-error").hidden = true; });
  // 입력 오류 안내: 칸이 정해진 오류는 그 항목 바로 '위'에만 (위쪽 요약과 겹쳐 두 번 보이지 않게) + 그 항목으로 스크롤,
  // 칸이 없는 오류만 입력창 맨 위 요약 상자에
  const formError = (message, target) => {
    $("#sheet-error", sheetForm)?.remove();
    $("#sheet-field-error", sheetForm)?.remove();
    if (target?.matches("input, select, textarea")) {
      const note = document.createElement("p"); note.className = "error-note field-error";
      note.id = "sheet-field-error"; note.setAttribute("role", "alert"); note.textContent = message;
      // 항목 묶음(식당·날짜·업무와 인원 등 .field) 바로 위에. 묶음이 없으면 선택지 목록·이름표 위에
      const anchor = target.closest(".field") || target.closest(".chips, .choice-list") || target.closest("label") || target;
      anchor.before(note);
      target.setAttribute("aria-invalid", "true");
      target.setAttribute("aria-describedby", [...new Set([...(target.getAttribute("aria-describedby") || "").split(" ").filter(Boolean), "sheet-field-error"])].join(" "));
      target.focus({ preventScroll: true });
      note.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    const summary = document.createElement("div"); summary.id = "sheet-error";
    summary.className = "error-note"; summary.setAttribute("role", "alert"); summary.tabIndex = -1;
    summary.textContent = message;
    $(".sheet-body", sheetForm).prepend(summary);
    summary.focus();
    summary.scrollIntoView({ block: "nearest" });
  };
  // 오류가 난 칸을 고르거나 적어서 올바르게 되면 오류 문구를 바로 지움 (라디오는 같은 이름 묶음 기준)
  const clearFormError = (e) => {
    const el = e.target;
    if (!el.matches?.("input, select, textarea") || !($("#sheet-error", sheetForm) || $("#sheet-field-error", sheetForm))) return;
    // 칸이 정해지지 않은 위쪽 안내(예: 업무를 골라 주세요)는 무엇이든 고르거나 적으면 바로 지움
    if ($("#sheet-error", sheetForm) && !$("#sheet-field-error", sheetForm)) { $("#sheet-error", sheetForm).remove(); return; }
    const kind = el.type === "radio" || el.type === "checkbox" ? el.type : "";
    const group = kind && el.name ? [...sheetForm.querySelectorAll(`input[type=${kind}][name="${el.name}"]`)] : [el];
    const ok = kind === "checkbox" ? group.some((x) => x.checked) : group.every((x) => x.validity.valid);
    if (!group.some((x) => x.getAttribute("aria-invalid") === "true") || !ok) return;
    $("#sheet-error", sheetForm)?.remove();
    $("#sheet-field-error", sheetForm)?.remove();
    group.forEach((x) => {
      x.removeAttribute("aria-invalid");
      const ids = (x.getAttribute("aria-describedby") || "").split(" ").filter((id) => id && id !== "sheet-error" && id !== "sheet-field-error");
      if (ids.length) x.setAttribute("aria-describedby", ids.join(" ")); else x.removeAttribute("aria-describedby");
    });
  };
  const toast = (msg) => {
    lastToast = msg;
    if (/못했|없어요|먼저|골라 주세요|확인해 주세요|같아요|이미 다 찼|확정된 분|사이로|하나 이상/.test(msg)) {
      // 입력창이 열려 있으면 입력창 안 빨간 상자로만 알림 (아래 검은 말풍선까지 띄우면 같은 말이 두 번 보임)
      if ($("#sheet").open) { formError(msg); $("#toast").classList.remove("show"); return; }
      showError(msg);
    }
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

  // ---------- 앱 스타일 확인 창 ----------
  // 브라우저 기본 확인 창(주소가 붙고 버튼이 '확인/취소'뿐) 대신, 버튼에 하는 일 이름을 붙인 창
  // 사용: if (!(await ask({ title, text, ok: "지우기", danger: true }))) return;
  const askBox = document.createElement("dialog");
  askBox.className = "ask";
  askBox.setAttribute("aria-labelledby", "ask-title");
  document.body.append(askBox);
  const ask = ({ title, text = "", ok = "확인", cancel = "그대로 두기", danger = false }) => new Promise((resolve) => {
    askBox.innerHTML = `<div class="ask-card"><h3 id="ask-title">${esc(title)}</h3>${text ? `<p>${esc(text).replace(/\n/g, "<br>")}</p>` : ""}
      <div class="ask-btns"><button type="button" class="btn" data-ask="0">${esc(cancel)}</button><button type="button" class="btn ${danger ? "danger" : "primary"}" data-ask="1">${esc(ok)}</button></div></div>`;
    const done = (v) => { askBox.onclick = null; askBox.oncancel = null; askBox.close(); resolve(v); };
    askBox.onclick = (e) => { const b = e.target.closest("[data-ask]"); if (b) done(b.dataset.ask === "1"); else if (e.target === askBox) done(false); };
    askBox.oncancel = (e) => { e.preventDefault(); done(false); };
    askBox.showModal();
  });

  // ---------- 아래에서 올라오는 입력창(시트) ----------
  const sheet = $("#sheet");
  const sheetForm = $("#sheet-form");
  sheet.setAttribute("aria-labelledby", "sheet-title"); // 화면 읽기 기능이 팝업 제목을 읽어 줌
  sheetForm.addEventListener("input", (e) => clearFormError(e));
  sheetForm.addEventListener("change", (e) => clearFormError(e));
  let sheetSubmit = null, sheetRevision = 0;
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
  // 손잡이(제목 줄)를 아래로 끌어 닫기: 충분히 내리거나 빠르게 튕기면 닫히고, 아니면 제자리로
  let drag = null;
  sheetForm.addEventListener("pointerdown", (e) => {
    const head = e.target.closest(".sheet-head");
    if (!head || e.target.closest("button") || closeTimer) return;
    drag = { y: e.clientY, t: performance.now(), dy: 0, id: e.pointerId };
    head.setPointerCapture(e.pointerId);
    sheet.style.transition = "none"; // translate는 올라오는·내려가는 움직임(transform)과 따로 움직여서 서로 안 겹침
  });
  sheetForm.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dy = Math.max(0, e.clientY - drag.y);
    sheet.style.translate = `0 ${drag.dy}px`;
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { dy, t } = drag;
    drag = null;
    const fast = dy / Math.max(1, performance.now() - t) > 0.6; // 빠르게 튕겨 내림 (1초에 600px 이상)
    sheet.style.transition = "translate .2s cubic-bezier(.4, 0, 1, 1)";
    if (dy > 110 || (fast && dy > 30)) {
      sheet.style.translate = "0 100%";
      closeTimer = setTimeout(() => {
        closeTimer = null;
        nativeClose.call(sheet);
        sheet.style.translate = sheet.style.transition = "";
      }, 200);
    } else {
      sheet.style.translate = "";
      setTimeout(() => { sheet.style.transition = ""; }, 200);
    }
  };
  sheetForm.addEventListener("pointerup", endDrag);
  sheetForm.addEventListener("pointercancel", endDrag);
  const openSheet = ({ title, body, submit = "저장", onSubmit, onReady }) => {
    sheetRevision++;
    // 닫히는 중에 새 창을 열면 닫기를 취소하고 내용만 바꿈
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; sheet.classList.remove("closing"); }
    sheetForm.innerHTML = `<div class="sheet-head"><h2 id="sheet-title">${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="닫기">${icon("x")}</button></div>
      <div class="sheet-body">${body}</div>
      <div class="sheet-foot"><button type="button" class="btn ghost" data-close>닫기</button>${onSubmit ? `<button type="submit" class="btn primary">${esc(submit)}</button>` : ""}</div>`;
    sheetSubmit = onSubmit || null;
    if (!sheet.open) sheet.showModal();
    sheetForm.querySelector(".sheet-body").scrollTop = 0;
    onReady?.(sheetForm);
  };
  sheetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!sheetSubmit) return;
    $("#sheet-error", sheetForm)?.remove();
    $("#sheet-field-error", sheetForm)?.remove();
    sheetForm.querySelectorAll("[aria-invalid]").forEach((el) => {
      el.removeAttribute("aria-invalid");
      const ids = (el.getAttribute("aria-describedby") || "").split(" ").filter((id) => id && id !== "sheet-error" && id !== "sheet-field-error");
      if (ids.length) el.setAttribute("aria-describedby", ids.join(" ")); else el.removeAttribute("aria-describedby");
    });
    const invalid = [...sheetForm.elements].find((el) => el.validity && !el.validity.valid);
    if (invalid) { formError(invalid.dataset.error || invalid.validationMessage, invalid); return; }
    lastToast = "";
    const submittedRevision = sheetRevision;
    if (sheetSubmit(new FormData(sheetForm), sheetForm) !== false) sheet.close();
    else if (lastToast && submittedRevision === sheetRevision) formError(lastToast, document.activeElement);
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
  // 뒤로가기 기록 규칙 (토스 방식)
  // - 홈이 맨 아래(depth 0), 하단 탭 화면은 그 바로 위(depth 1) 한 칸만 씀 → 휴대폰 뒤로가기: 탭 → 홈 → 앱 나가기
  // - 일감 보기·사람 보기는 그 위로 한 칸씩 쌓임
  // - 같은 화면을 다시 열거나 1·2·3일째, 업무 탭처럼 옆 화면으로 바꿀 때는 쌓지 않고 바꿔치기(replace)
  const depthOf = () => history.state?.depth || 0;
  const sameRoute = (a, b) => a.name === b.name && (a.id || "") === (b.id || "");
  let pendingTab = null; // 여러 칸 뒤로 간 다음 바꿔 넣을 탭 화면
  const go = (next, { replace = false } = {}) => {
    if (sameRoute(route, next)) { render(); return; }
    navDir = replace ? "" : isDetail(next) ? "forward" : "tab";
    if (replace) {
      route = { ...next, depth: depthOf() };
      history.replaceState(route, "");
    } else {
      route = { ...next, depth: depthOf() + 1 };
      history.pushState(route, "");
      window.scrollTo(0, 0);
    }
    render();
  };
  // 하단 탭 누름: 쌓인 화면을 정리하고 홈 바로 위 한 칸에만 놓음
  const goTab = (name) => {
    if (sheet.open) sheet.close();
    const depth = depthOf();
    if (name === "home") { if (depth > 0) history.go(-depth); else render(); return; }
    if (depth === 0) { go({ name }); return; }
    if (depth === 1) { navDir = "tab"; route = { name, depth: 1 }; history.replaceState(route, ""); render(); window.scrollTo(0, 0); return; }
    pendingTab = name;
    history.go(-(depth - 1));
  };
  // 지운 일감·사람 화면이면 건너뜀
  const missing = (r) => (r.name === "job" && !job(r.id)) || (r.name === "worker" && !worker(r.id));
  window.addEventListener("popstate", (e) => {
    const prev = route;
    if (sheet.open) sheet.close();
    if (pendingTab) {
      route = { name: pendingTab, depth: 1 };
      pendingTab = null;
      history.replaceState(route, "");
      navDir = "tab";
      render();
      window.scrollTo(0, 0);
      return;
    }
    const next = e.state || { name: "home", depth: 0 };
    if (missing(next) && (next.depth || 0) > 0) { route = next; history.back(); return; }
    route = next;
    navDir = isDetail(prev) ? "back" : "tab";
    render();
  });
  route = { ...route, depth: 0 };
  history.replaceState(route, "");

  // ---------- 화면: 홈 ----------
  // noDate: 날짜 제목 아래에 놓일 때는 카드 안 날짜를 빼고 시간만
  const jobCard = (j, noDate = false) => {
    const need = jobNeed(j);
    const conf = confirmedOf(j).length;
    const past = j.date < today();
    const g = groupOf(j);
    return `<button class="job-card ${j.canceled ? "canceled" : need ? "need" : "full"} ${past || j.canceled ? "past" : ""}" data-act="open-job" data-id="${j.id}">
      <div class="job-when">${noDate ? "" : `${esc(dateText(j.date))} · `}${esc(j.start)}~${esc(j.end)}${g.length > 1 ? ` <span class="pill gray">${g.length}일${isRun(g) ? " 연속" : ""} · ${g.indexOf(j) + 1}일째</span>` : ""}</div>
      <div class="job-what"><strong>${esc(restName(j))}</strong><span class="role">${esc(j.role)}</span></div>
      <div class="job-state">${j.canceled ? `<span class="pill gray">식당 취소</span>` : need ? `<span class="pill need">${need}명 더 필요</span>` : `<span class="pill ok">인원 다 참</span>`}
      ${j.canceled ? "" : `<span class="muted">확정 ${conf}/${esc(j.headcount)}명</span>`}</div></button>`;
  };
  const sortJobs = (a, b) => a.date.localeCompare(b.date) || (a.start || "").localeCompare(b.start || "");
  // 여러 날 일감 묶음: 같은 group 번호를 가진 일감들 (날짜순). 묶음이 아니면 자기 하나
  const groupOf = (j) => (j?.group ? state.jobs.filter((x) => x.group === j.group).sort(sortJobs) : [j]);
  // 같은 날 같은 요청(찬모·서빙 함께 부른 것). 아니면 자기 하나
  const reqOf = (j) => (j?.req ? state.jobs.filter((x) => x.req === j.req && x.date === j.date).sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role)) : [j]);
  // 묶음 날짜가 하루도 빠짐없이 이어지는지 (10/7·10/8·10/9 → 연속, 10/7·10/9 → 띄엄띄엄)
  const isRun = (g) => g.every((x, i) => i === 0 || daysBetween(g[i - 1].date, x.date) === 1);
  // 기간 글: 이어지면 "10/7~10/9 3일 연속", 띄엄띄엄이면 "10/7, 10/9 (2일)"
  const periodText = (g) => (isRun(g) ? `${shortDate(g[0].date)}~${shortDate(g[g.length - 1].date)} ${g.length}일 연속` : `${g.map((x) => shortDate(x.date)).join(", ")} (${g.length}일)`);

  // 근무 시간 (시작·끝 시각). 끝이 시작보다 이르면 다음 날 끝나는 밤 근무
  const shiftOf = (j) => {
    const s = new Date(`${j.date}T${j.start || "00:00"}:00`);
    const e = new Date(`${j.date}T${j.end || "00:00"}:00`);
    if (e <= s) e.setDate(e.getDate() + 1);
    return { s, e };
  };
  // 실제 근무 시간: 사람마다 약속보다 더/덜 일했으면 a.actStart·a.actEnd에 적어 둠 (없으면 약속 시간)
  const effJob = (a, j) => (j && (a.actStart || a.actEnd) ? { ...j, start: a.actStart || j.start, end: a.actEnd || j.end } : j);
  // 그 사람의 일당: 실제 시간이 있으면 시급 × 실제 시간으로 다시 계산
  const payOf = (a, j) => {
    const e = effJob(a, j);
    if (e === j || !j.hourly) return Number(j.pay) || 0;
    return payBreakdown(e.start, e.end, j.breakMin, j.hourly, j.nightHourly || 0, j.holiday).pay;
  };
  const feeOf = (a, j) => Math.round(payOf(a, j) * state.feeRate / 100);
  // 약속보다 얼마나 더/덜 일했는지 (분, 더 일하면 +)
  const extraMin = (a, j) => { const e = effJob(a, j); return e === j ? 0 : workMinutes(e.start, e.end, j.breakMin) - workMinutes(j.start, j.end, j.breakMin); };
  // 지금 일하는 중인지: '출근함'을 눌렀고 지금이 (실제) 근무 시간 안 (홈·사람·일감 화면 모두 이 기준)
  const isWorking = (a, j) => {
    if (a.status !== "confirmed" || a.outcome !== "done" || !j) return false;
    const { s, e } = shiftOf(effJob(a, j));
    const now = new Date();
    return now >= s && now < e;
  };
  // 지금 일하는 중인 사람들 (어제 시작한 밤 근무 포함). j는 실제 근무 시간이 반영된 일감
  const workingNow = () => {
    const now = new Date();
    return state.assigns
      .filter((a) => a.status === "confirmed" && a.outcome === "done")
      .map((a) => ({ a, j: effJob(a, job(a.jobId)), w: worker(a.workerId) }))
      .filter((x) => x.j && x.w && (x.j.date === today() || x.j.date === today(-1)))
      .filter((x) => { const { s, e } = shiftOf(x.j); return now >= s && now < e; })
      .sort((x, y) => shiftOf(x.j).e - shiftOf(y.j).e); // 곧 끝나는 사람부터
  };
  // 근무 진행 막대 + "오전 9시 시작 · 3시간 남음" (홈과 사람 화면에서 같이 씀)
  const workBar = (j) => {
    const { s, e } = shiftOf(j);
    const pct = Math.max(0, Math.min(100, Math.round(((Date.now() - s) / (e - s)) * 100)));
    const left = Math.max(1, Math.round((e - Date.now()) / 60000));
    // data-s·data-e: 시작·끝 시각(ms) → 10초마다 막대와 남은 시간만 고침 (tickBars)
    return `<div class="progress" role="progressbar" data-s="${+s}" data-e="${+e}" aria-label="근무 진행" aria-valuetext="${esc(hoursText(left))} 남음" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
      <div class="work-time small"><span>${esc(korTime(j.start))} 시작</span><strong class="left">${esc(hoursText(left))} 남음</strong></div>`;
  };
  // 오늘 출근한 사람들: 일하는 중(곧 끝나는 사람부터) → 일 끝난 사람(늦게 끝난 사람부터). 오늘 하루 동안 홈에 남음
  const todayAttended = () => {
    const now = new Date();
    const working = workingNow();
    const rest = state.assigns
      .filter((a) => a.status === "confirmed" && a.outcome === "done")
      .map((a) => ({ a, j: effJob(a, job(a.jobId)), w: worker(a.workerId) }))
      .filter((x) => x.j && x.w && x.j.date === today() && !working.some((y) => y.a.id === x.a.id))
      .sort((x, y) => shiftOf(y.j).e - shiftOf(x.j).e);
    return [...working, ...rest.filter((x) => shiftOf(x.j).s > now), ...rest.filter((x) => shiftOf(x.j).s <= now)];
  };
  // 출근한 사람의 근무 상태 (홈 '오늘 출근'과 일감 보기에서 같이 씀). j는 실제 근무 시간이 반영된 일감
  // 일하는 중 → 진행 막대 / 끝남 → '✓ 퇴근함 · 오후 6시'(홈) 또는 '✓ 오후 6시 퇴근'(일감 보기, 위에 '퇴근함'이 이미 있음) / 시작 전 → '✓ 출근함 · 오전 10시 시작'
  const workState = (j, { beforeStart = true, short = false } = {}) => {
    const { s, e } = shiftOf(j);
    const now = new Date();
    if (now >= s && now < e) return workBar(j);
    if (now >= e) return `<div class="work-done small">${icon("check")}${short ? `${esc(korTime(j.end))} 퇴근` : `퇴근함 · ${esc(korTime(j.end))}`}</div>`;
    return beforeStart ? `<div class="work-done small">${icon("check")}출근함 · ${esc(korTime(j.start))} 시작</div>` : "";
  };
  // 오늘 끝난 근무인지 (일감 보기에서 퇴근 시각 줄은 오늘 끝난 일에만 보여줌. 지난 일은 오른쪽 '퇴근함'으로 충분)
  const endedToday = (j) => { const { e } = shiftOf(j); return e <= new Date() && ymd(e) === today(); };
  const workRow = ({ j, w }) => `<div class="check-row work-row">
      <div class="who"><button class="avatar-link" data-act="open-worker" data-id="${w.id}" aria-label="${esc(w.name)} 보기">${avatar(w)}</button><div><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>
      <div class="muted small">${esc(restName(j))} ${esc(j.role)}</div></div></div>
      ${workState(j)}</div>`;

  // 근무 시작 시각이 지났는데 출근 여부를 아직 안 적은 사람들 (출근함을 누르면 '오늘 출근'으로 옮겨감)
  const pendingChecks = () => {
    const now = new Date();
    return state.assigns
      .filter((a) => a.status === "confirmed" && !a.outcome)
      .map((a) => ({ a, j: job(a.jobId), w: worker(a.workerId) }))
      .filter((x) => x.j && x.w && x.j.date <= today() && shiftOf(x.j).s <= now)
      .sort((x, y) => sortJobs(x.j, y.j));
  };

  const checkRow = ({ a, j, w }) => `<div class="check-row">
      <div class="who"><button class="avatar-link" data-act="open-worker" data-id="${w.id}" aria-label="${esc(w.name)} 보기">${avatar(w)}</button><div><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>
      <div class="muted small">${esc(dateText(j.date))} · ${esc(restName(j))} ${esc(j.role)}</div></div></div>
      <div class="btn-row">
        <button class="btn" data-act="outcome" data-id="${a.id}" data-v="done">${icon("check")}출근함</button>
        <button class="btn warn" data-act="cancel-ask" data-id="${a.id}">${icon("x")}확정 취소</button>
      </div></div>`;

  // 받을 수수료: 사람별로 묶어서 (가장 오래 밀린 사람부터)
  const unpaidByWorker = () => {
    const map = new Map();
    unpaidList().forEach((x) => { if (!map.has(x.w.id)) map.set(x.w.id, []); map.get(x.w.id).push(x); });
    return [...map.values()];
  };
  const feeRow = (list) => {
    const { w, j } = list[0]; // 가장 오래된 일
    const late = daysBetween(j.date, today()) > 0;
    return `<div class="check-row">
      <div class="who"><button class="avatar-link" data-act="open-worker" data-id="${w.id}" aria-label="${esc(w.name)} 보기">${avatar(w)}</button><div><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>
      <div class="small"><strong>${won(feeSumOf(list))}</strong> <span class="muted">· ${list.length}건</span> · <span class="${late ? "overdue" : "muted"}">${late ? `${icon("alert")}${overdueText(j)}` : "오늘 일"}</span></div></div></div>
      <div class="btn-row">
        ${w.phone ? `<a class="btn" href="${smsHref(w.phone, feeMsg(w, list))}">${icon("message")}수수료 안내</a>` : ""}
        <button class="btn" data-act="pay-all" data-id="${w.id}">${icon("check")}${list.length > 1 ? "모두 받음" : "받음"}</button>
      </div></div>`;
  };

  const renderHome = () => {
    const hasData = state.workers.length || state.jobs.length;
    const needJobs = state.jobs.filter((j) => !j.canceled && j.date >= today() && jobNeed(j) > 0).sort(sortJobs);
    const fullJobs = state.jobs.filter((j) => !j.canceled && (j.date === today() || j.date === today(1)) && jobNeed(j) === 0).sort(sortJobs);
    const checks = pendingChecks();
    const month = today().slice(0, 7);
    const doneThisMonth = state.assigns.filter((a) => a.outcome === "done" && job(a.jobId)?.date.startsWith(month));
    const feeSum = doneThisMonth.reduce((sum, a) => sum + (Number(a.fee) || 0), 0);
    const backupDays = state.lastBackup ? daysBetween(state.lastBackup, today()) : null;

    const working = workingNow();
    // 맨 위 큰 요약 (오늘 날짜 + 사람이 필요한 일 건수)
    const now = new Date();
    const todayNeed = needJobs.filter((j) => j.date === today()).length;
    let html = `<section class="hero">
        <p class="hero-date">${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEK[now.getDay()]}요일</p>
        <p class="hero-title">${!hasData ? "반가워요,<br>다원 어머니회예요" : needJobs.length ? `사람이 필요한 일<br><span class="num" data-count="${needJobs.length}" data-suffix="건">${needJobs.length}건</span>` : "빈자리 없이<br>다 채웠어요"}</p>
        ${hasData && (todayNeed || checks.length || working.length) ? `<p class="hero-sub">${[todayNeed ? `오늘 ${todayNeed}건` : "", working.length ? `일하는 중 ${working.length}명` : "", checks.length ? `출근 체크 ${checks.length}명` : ""].filter(Boolean).join(" · ")}</p>` : ""}
      </section>
      <div class="big-actions">
        <button class="btn primary big" data-act="new-job">${icon("plus")}일감 받기</button>
        <button class="btn big" data-act="new-worker">${icon("plus")}사람 등록</button>
      </div>`;
    if (window.DawonBackup?.enabled()) html += `<p class="hint" data-backup-summary role="status" aria-live="polite">${esc(window.DawonBackup.summary())}</p>`;

    if (!hasData) {
      html += `<h2>처음 오셨네요</h2><div class="card"><p>1. <strong>사람 등록</strong>으로 일할 분을 적어 주세요.</p><p>2. 식당에서 전화가 오면 <strong>일감 받기</strong>를 누르세요.</p><p>3. 일감 화면에서 추천 순서대로 연락하고 <strong>확정</strong>을 누르면 끝이에요.</p>
        <p class="muted small">먼저 연습해 보고 싶으면 아래 '설정' 메뉴에서 연습용 예시 자료를 넣을 수 있어요.</p></div>`;
      return html;
    }
    // 받을 수수료 요약: 맨 위에 한 줄 (누르면 아래 목록으로 내려감)
    const owed = unpaidByWorker();
    if (owed.length) {
      html += `<button class="fee-line" data-act="go-fee"><span>받을 수수료 <strong>${won(feeSumOf(owed.flat()))}</strong> · ${owed.length}명</span><span class="go">보기</span></button>`;
    }
    // 백업 안내: 한 줄로 작게
    if (!window.DawonBackup?.enabled() && (backupDays === null || backupDays >= 7)) {
      html += `<button class="backup-line" data-act="backup">${icon("download")}<span>${backupDays === null ? "아직 백업을 안 했어요" : `백업한 지 ${backupDays}일 지났어요`}</span><strong>백업하기</strong></button>`;
    }
    // 지금 바로 처리할 것부터: 출근 체크 → 일하는 중
    if (checks.length) {
      html += `<h2>출근했는지 체크해 주세요 <span class="count">${checks.length}</span></h2><div class="card">${checks.map(checkRow).join("")}</div>`;
    }
    // 오늘 출근: 출근함을 누른 사람은 일이 끝나도 오늘 하루 동안 여기 남음
    const attended = todayAttended();
    if (attended.length) {
      html += `<h2>오늘 출근 <span class="count">${attended.length}</span></h2><div class="card">${attended.map(workRow).join("")}</div>`;
    }
    // 다가오는 일: 사람이 필요한 일 + 오늘·내일 인원이 다 찬 일을 모두 보여줌 (접기 없음)
    // 날짜순, 같은 날에서는 사람이 필요한 일 먼저 → 시간순. 날짜가 바뀔 때마다 날짜 제목
    const upcoming = [...needJobs, ...fullJobs].sort((a, b) => a.date.localeCompare(b.date) || (jobNeed(a) ? 0 : 1) - (jobNeed(b) ? 0 : 1) || (a.start || "").localeCompare(b.start || ""));
    html += `<h2>다가오는 일 <span class="count">${upcoming.length}</span></h2>`;
    if (upcoming.length) {
      let lastDate = "";
      upcoming.forEach((j) => {
        if (j.date !== lastDate) { html += `<div class="day-head">${esc(dateText(j.date))}</div>`; lastDate = j.date; }
        html += jobCard(j, true);
      });
    } else html += `<div class="empty">다가오는 일이 없어요. 식당에서 연락이 오면 [일감 받기]를 누르세요.</div>`;
    // 받을 수수료 (아직 입금 확인 안 된 것)
    if (owed.length) {
      html += `<h2 id="fee-sec">받을 수수료 <span class="count">${won(feeSumOf(owed.flat()))}</span></h2><div class="card">${owed.map(feeRow).join("")}
        ${state.account ? "" : `<p class="hint" style="margin-top:12px">설정에 계좌번호를 적어 두면 수수료 안내 문자에 같이 들어가요.</p>`}</div>`;
    }
    // 이번 달: 출근 완료 / 받은 수수료 / 받을 수수료
    const paidSum = doneThisMonth.filter((a) => a.paid).reduce((sum, a) => sum + (Number(a.fee) || 0), 0);
    const owedSum = feeSum - paidSum;
    html += `<h2>이번 달</h2><div class="month">
      <div class="wide"><small>출근 완료</small><strong data-count="${doneThisMonth.length}" data-suffix="건">${doneThisMonth.length}건</strong></div>
      <div><small>받은 수수료</small><strong data-count="${paidSum}" data-suffix="원">${paidSum.toLocaleString("ko-KR")}원</strong></div>
      <div><small>받을 수수료</small><strong class="${owedSum ? "overdue" : ""}" data-count="${owedSum}" data-suffix="원">${owedSum.toLocaleString("ko-KR")}원</strong></div></div>`;
    return html;
  };

  // ---------- 화면: 일감 목록 ----------
  const renderJobs = () => {
    const upcoming = ui.jobsMode === "upcoming";
    const list = state.jobs.filter((j) => (upcoming ? j.date >= today() : j.date < today())).sort(sortJobs);
    if (!upcoming) list.reverse();
    return `<button class="btn primary big" data-act="new-job">${icon("plus")}일감 받기</button>
      <div class="segment" style="margin-top:14px"><button class="${upcoming ? "active" : ""}" data-act="jobs-mode" data-v="upcoming">오늘부터</button><button class="${upcoming ? "" : "active"}" data-act="jobs-mode" data-v="past">지난 일감</button></div>
      ${list.length ? list.map((j) => jobCard(j)).join("") : `<div class="empty">${upcoming ? "예정된 일감이 없어요" : "지난 일감이 없어요"}</div>`}`;
  };

  // ---------- 화면: 일감 하나 ----------
  const statusText = { asked: "연락함", standby: "연락함", confirmed: "확정", canceled: "취소" };
  const outcomeText = { done: icon("check") + "출근함", late: icon("alert") + "직전 취소", noshow: icon("x") + "안 나옴", cancel_ok: "미리 알리고 취소", rest_cancel: "식당 사정 취소" };

  const contactButtons = (w, j, msg, msgLabel = icon("message") + "문자") => w.phone
    ? `<a class="btn" href="${telHref(w.phone)}" data-act="contacted" data-worker="${w.id}" data-job="${j.id}">${icon("phone")}전화</a>
       <a class="btn" href="${smsHref(w.phone, msg)}" data-act="contacted" data-worker="${w.id}" data-job="${j.id}">${msgLabel}</a>`
    : `<button class="btn" data-act="edit-worker" data-id="${w.id}">${icon("phone")}전화번호 넣기</button>`;

  // 확정된 분 카드의 버튼: main = 지금 할 일 2개, more = [⋯]에 넣을 나머지 { label, ic, act/href, tone }
  const rowActions = (a, j, w) => {
    const r = rest(j.restaurantId);
    const btn = (act, ic, label, extra = "") => `<button class="btn" data-act="${act}" data-id="${a.id}" ${extra}>${icon(ic)}${label}</button>`;
    const link = (href, ic, label) => `<a class="btn" href="${href}">${icon(ic)}${label}</a>`;
    const call = w.phone ? link(telHref(w.phone), "phone", "전화") : "";
    const restItem = r?.phone ? { href: smsHref(r.phone, restMsg(j, w)), ic: "message", label: "식당에 알림" } : { act: "copy-rest-msg", ic: "copy", label: "식당 문자 복사" };
    const cancelItem = { act: "cancel-ask", ic: "x", label: "확정 취소", tone: "warn" };
    const fee = Number(a.fee) || 0;
    if (a.outcome === "done") {
      const rehireItem = { act: "toggle-rehire", ic: "heart", label: a.rehire ? "'식당이 또 찾음' 지우기" : "식당이 또 찾음" };
      const undoItem = { act: "undo-assign", ic: "x", label: "출근 취소" };
      const timeItem = { act: "actual-time", ic: "edit", label: "실제 근무 시간 고치기" };
      if (fee && !a.paid) return {
        main: [btn("toggle-paid", "check", "수수료 받음"), w.phone ? link(smsHref(w.phone, feeMsg(w, [{ a, j }])), "message", "수수료 안내") : ""].filter(Boolean),
        more: [timeItem, rehireItem, undoItem],
      };
      return {
        main: [`<button class="btn ${a.rehire ? "on" : ""}" data-act="toggle-rehire" data-id="${a.id}">${icon("heart", a.rehire ? "fill" : "")}${a.rehire ? "또 찾음" : "또 찾나요?"}</button>`, call].filter(Boolean),
        more: [timeItem, ...(fee ? [{ act: "toggle-paid", ic: "x", label: "수수료 받음 취소" }] : []), undoItem],
      };
    }
    const confirmItem = w.phone ? { href: smsHref(w.phone, confirmMsg(j, w)), ic: "message", label: "확정 문자" } : null;
    // 오늘·지난 일: 출근함이 먼저 / 앞으로의 일: 전화·확정 문자
    if (j.date <= today()) return {
      main: [btn("outcome", "check", "출근함", 'data-v="done"'), call].filter(Boolean),
      more: [confirmItem, restItem, cancelItem].filter(Boolean),
    };
    return {
      main: [call, confirmItem ? link(confirmItem.href, "message", "확정 문자") : ""].filter(Boolean),
      more: [restItem, cancelItem],
    };
  };
  // 더보기 목록 한 줄 (누르면 목록이 닫히고 그 일을 함)
  const moreItem = (a) => ({ act, href, ic, label, tone }) => href
    ? `<a class="menu-row" href="${href}" data-close><span class="menu-ic ${tone || ""}">${icon(ic)}</span><span class="menu-text"><strong>${label}</strong></span></a>`
    : `<button type="button" class="menu-row" data-act="${act}" data-id="${a.id}" data-close><span class="menu-ic ${tone || ""}">${icon(ic)}</span><span class="menu-text"><strong>${label}</strong></span></button>`;

  const assignRow = (a, j) => {
    const w = worker(a.workerId);
    if (!w) return "";
    const s = statsOf(w.id);
    const head = `<div class="name-line"><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>${badge(trustOf(s, w))}</div>`;
    let state_ = "";
    let buttons = "";
    let side = ""; // 이름 줄 오른쪽 상태 글자 (토스식: 확정=파랑, 출근함=초록)
    if (a.status === "confirmed") {
      // 확정된 분: 지금 할 일 2개만 크게, 나머지는 [⋯] 더보기 안으로
      const fee = Number(a.fee) || 0;
      if (a.outcome === "done") {
        // 출근함을 눌렀고 (실제) 근무가 끝났으면 '퇴근함'
        side = `<strong class="row-state ok">${shiftOf(effJob(a, j)).e <= new Date() ? "퇴근함" : "출근함"}</strong>`;
        // 약속과 다르게 일했으면 "실제 오전 9시 ~ 오후 7시(10시간) · 1시간 연장"
        const ex = extraMin(a, j);
        const actual = effJob(a, j) !== j ? `<span class="small actual-line">실제 ${esc(korTime(effJob(a, j).start))} ~ ${esc(korTime(effJob(a, j).end))}${ex ? ` · <span class="overdue nowrap">${hoursText(Math.abs(ex))} ${ex > 0 ? "연장" : "줄어듦"}</span>` : ""}</span><br>` : "";
        state_ = `${actual}${fee ? `<span class="small">수수료 ${won(fee)} · ${a.paid ? `<span class="paid">받음</span>` : `<span class="overdue">미수</span>`}</span>` : ""}`;
      } else side = `<strong class="row-state">확정</strong>`;
      const { main, more } = rowActions(a, j, w);
      buttons = `${main.join("")}${more.length ? `<button class="btn more-btn" data-act="more-actions" data-id="${a.id}" aria-label="더보기">⋯</button>` : ""}`;
      // 출근함 + 근무 시간 안이면 진행 막대 (홈의 '지금 일하는 중'과 같은 기준)
      // 출근함 + 일하는 중이면 진행 막대, 오늘 일이 끝났으면 '오후 6시 퇴근' (홈 '오늘 출근'과 같은 기준)
      const bar = isWorking(a, j) || (a.outcome === "done" && endedToday(effJob(a, j))) ? `<div class="work-row">${workState(effJob(a, j), { beforeStart: false, short: true })}</div>` : "";
      return `<div class="person-row"><div class="who"><button class="avatar-link" data-act="open-worker" data-id="${w.id}" aria-label="${esc(w.name)} 보기">${avatar(w)}</button><div>${head}${state_ ? `<div class="status-line">${state_}</div>` : ""}</div>${side}</div>${bar}<div class="btn-row act-row">${buttons}</div></div>`;
    } else if (a.status === "asked") {
      state_ = `<span class="pill gray">연락함 · 답 기다리는 중</span>`;
      buttons = `${contactButtons(w, j, offerMsg(j, w))}
        <button class="btn primary" data-act="set-status" data-id="${a.id}" data-v="confirmed">${icon("check")}확정</button>
        <button class="btn ghost" data-act="remove-assign" data-id="${a.id}">빼기 (못 한대요)</button>`;
    } else {
      state_ = `<span class="pill gray">${outcomeText[a.outcome] || "취소"}</span>`;
      buttons = `<button class="btn ghost" data-act="undo-assign" data-id="${a.id}">되돌리기</button>`;
    }
    return `<div class="person-row ${a.status === "canceled" ? "dim" : ""}"><div class="who"><button class="avatar-link" data-act="open-worker" data-id="${w.id}" aria-label="${esc(w.name)} 보기">${avatar(w)}</button><div>${head}${state_ ? `<div class="status-line">${state_}</div>` : ""}</div>${side}</div><div class="btn-row">${buttons}</div></div>`;
  };

  const candidateRow = (c, j, full) => {
    const { w, t, near, busy } = c;
    return `<div class="person-row">
      <div class="who"><button class="avatar-link" data-act="open-worker" data-id="${w.id}" aria-label="${esc(w.name)} 보기">${avatar(w)}</button><div>
      <div class="name-line"><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>${badge(t)}${near ? `<span class="tag">가까움</span>` : ""}${busy ? `<span class="tag warn">같은 시간 다른 일</span>` : ""}</div></div></div>
      <div class="btn-row">${contactButtons(w, j, offerMsg(j, w), icon("message") + "일 제안")}
        <button class="btn soft" data-act="add-assign" data-v="confirmed" data-worker="${w.id}" data-job="${j.id}" ${full || busy ? "disabled" : ""}>${icon("check")}확정</button>
      </div></div>`;
  };

  const renderJob = (id) => {
    const j = job(id);
    if (!j) return `<div class="empty">일감을 찾을 수 없어요.</div>`;
    const r = rest(j.restaurantId);
    const need = jobNeed(j);
    const order = { confirmed: 0, asked: 1, canceled: 2 };
    const list = assignsOf(j.id).sort((x, y) => order[x.status] - order[y.status]);
    const cands = candidatesFor(j);
    const limit = ui.showAll[j.id] ? cands.length : 6;

    let html = `<div class="card">
      <div class="job-when">${esc(dateText(j.date))}</div>
      <div class="job-what" style="font-size:1.3rem"><strong>${esc(restName(j))}</strong><span class="role">${esc(j.role)}</span></div>
      ${groupOf(j).length > 1 ? `<div class="day-tabs" aria-label="연속 근무 날짜">${groupOf(j).map((x, i) => `<button class="day-tab ${x.id === j.id ? "on" : ""}" data-act="open-job" data-id="${x.id}"><small>${i + 1}일째</small>${esc(dateText(x.date).replace(/^(오늘|내일|어제) /, ""))}</button>`).join("")}</div>` : ""}
      ${reqOf(j).length > 1 ? `<div class="day-tabs role-tabs" aria-label="같은 요청 업무">${reqOf(j).map((x) => `<button class="day-tab ${x.id === j.id ? "on" : ""}" data-act="open-job" data-id="${x.id}"><small>${x.start}~</small>${esc(x.role)} ${x.headcount}명</button>`).join("")}</div>` : ""}
      <div class="facts">
        <div class="fact"><small>시간</small><strong>${esc(j.start)}~<wbr>${esc(j.end)}</strong><span class="fact-sub">근무 ${hoursText(workMinutes(j.start, j.end, j.breakMin))}</span>${j.breakMin ? `<span class="fact-sub">휴게 ${hoursText(Number(j.breakMin))}</span>` : ""}</div>
        <div class="fact"><small>일당${j.hourly ? " (총)" : ""}</small><strong>${esc(won(j.pay))}</strong>${j.hourly ? `<span class="fact-sub">${j.holiday ? `휴일 시급 ${esc(won(Number(j.nightHourly) || j.hourly))}` : `시급 ${esc(won(j.hourly))}${hasNightRate(j) ? ` · 밤 ${esc(won(j.nightHourly))}` : ""}`}</span>` : ""}</div>
      </div>
      ${r?.address || r?.area ? `<p class="meta-line">${icon("pin")}${r?.address ? esc(fullAddress(r)) : esc(r.area)}</p>` : ""}
      ${r?.way ? `<p class="meta-line">${icon("walk")}${esc(r.way)}</p>` : ""}
      ${mapUrl(r) ? `<a class="map-link" href="${mapUrl(r)}" target="_blank" rel="noopener">${icon("pin")}지도 보기</a>` : ""}
      ${r && !r.address && !r.way ? `<button class="map-link" data-act="edit-rest" data-id="${r.id}">${icon("plus")}주소·오시는 길 넣기</button>` : ""}
      ${j.memo ? `<p class="meta-line">${icon("note")}${esc(j.memo)}</p>` : ""}
      <div class="btn-row act-row">${r?.phone
        ? `<a class="btn" href="${telHref(r.phone)}">${icon("phone")}식당 전화</a><a class="btn" href="${smsHref(r.phone, restJobMsg(j))}">${icon("message")}식당 문자</a>`
        : r ? `<button class="btn" data-act="edit-rest" data-id="${r.id}">${icon("phone")}번호 넣기</button>` : ""}<button class="btn more-btn" data-act="job-more" data-id="${j.id}" aria-label="일감 고치기·업무 추가">⋯</button></div>
    </div>`;

    if (j.canceled) {
      // 식당이 취소한 일감: 취소된 분들에게 안내 문자 보내기
      const hit = assignsOf(j.id).filter((a) => a.outcome === "rest_cancel").map((a) => worker(a.workerId)).filter(Boolean);
      html += `<div class="banner warn">${icon("alert")}식당 사정으로 취소된 일감이에요${j.canceledAt ? ` (${esc(shortDate(j.canceledAt))} 취소)` : ""}</div>`;
      html += hit.length
        ? `<h2>취소 안내 보내기 <span class="count">${hit.length}</span></h2><div class="card">${hit.map((w) => cancelRow(w, [j])).join("")}</div>`
        : `<div class="empty">확정·연락했던 분이 없어서 안내할 사람이 없어요.</div>`;
      html += `<div class="danger-zone"><button class="link-btn" data-act="del-job" data-id="${j.id}">이 일감 지우기</button></div>`;
      return html;
    }
    if (need) html += `<div class="banner need">${need}명 더 필요해요</div>`;
    else html += `<div class="banner ok">${icon("check")}인원이 다 찼어요</div>`;

    // 확정된 분은 따로 묶어 맨 위에, 나머지(연락함·취소)는 그 아래
    const confList = list.filter((a) => a.status === "confirmed");
    const restList = list.filter((a) => a.status !== "confirmed");
    // 카드 맨 위: "2/3명 확정" + 진행 막대 (토스식)
    const pct = Math.min(100, Math.round((confList.length / (Number(j.headcount) || 1)) * 100));
    // 진행 막대 카드와 이름 카드를 따로 나눔
    if (confList.length) html += `<h2>확정된 분</h2><div class="card progress-card">
      <div class="progress-head"><strong>${confList.length}/${esc(j.headcount)}명 확정</strong><span class="${need ? "need" : "full"}">${need ? `${need}명 더 필요` : "인원 다 찼어요"}</span></div>
      <div class="progress" role="progressbar" aria-label="확정 인원" aria-valuetext="${confList.length}/${esc(j.headcount)}명 확정" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div></div>
      <div class="card confirmed-card">${confList.map((a) => assignRow(a, j)).join("")}</div>`;
    if (restList.length) html += `<h2>연락한 사람</h2><div class="card">${restList.map((a) => assignRow(a, j)).join("")}</div>`;

    html += `<h2>추천 순서 <span class="muted small" style="font-weight:400">약속 잘 지키고 오래 쉰 분 먼저</span></h2>`;
    if (!cands.length) {
      html += `<div class="empty">${esc(j.role)} 가능한 분이 더 없어요.<br><button class="btn" style="margin-top:10px" data-act="new-worker">${icon("plus")}사람 등록</button></div>`;
    } else {
      html += `<div class="card">${cands.slice(0, limit).map((c) => candidateRow(c, j, need === 0)).join("")}</div>`;
      if (cands.length > limit) html += `<button class="btn big" data-act="show-more" data-id="${j.id}">${cands.length - limit}명 더 보기</button>`;
    }
    html += `<div class="danger-zone"><button class="btn big warn" data-act="rest-cancel" data-id="${j.id}">${icon("x")}식당이 취소했어요</button>
      <button class="link-btn" data-act="del-job" data-id="${j.id}">이 일감 지우기</button></div>`;
    return html;
  };
  // 식당 취소 안내 문자: 취소된 날짜들을 한 통에
  const cancelNoticeMsg = (w, jobs) => letter(
    `[다원] ${w.name}님, 죄송해요.`,
    section("취소된 일", ...jobs.map((j) => `${shortDate(j.date)} ${restName(j)} ${j.role}\n${korRange(j)}`)),
    "식당 사정으로 일이 취소됐어요.\n다음 일 먼저 챙겨드릴게요.",
  );
  // 취소 안내 한 줄: 사진·이름 + [취소 안내 문자]
  const cancelRow = (w, jobs) => `<div class="check-row">
      <div class="who"><button class="avatar-link" data-act="open-worker" data-id="${w.id}" aria-label="${esc(w.name)} 보기">${avatar(w)}</button><div><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>
      <div class="muted small">${jobs.map((j) => esc(shortDate(j.date))).join(", ")} 취소</div></div></div>
      <div class="btn-row">${w.phone ? `<a class="btn" href="${smsHref(w.phone, cancelNoticeMsg(w, jobs))}">${icon("message")}취소 안내 문자</a><a class="btn" href="${telHref(w.phone)}">${icon("phone")}전화</a>` : `<button class="btn" data-act="edit-worker" data-id="${w.id}">${icon("phone")}전화번호 넣기</button>`}</div></div>`;

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
        <div class="status-line muted">${s.lastWork ? `마지막 근무 ${esc(dateText(s.lastWork))}` : "근무 기록 없음"}</div></div></div></button>`).join("")
      : `<div class="empty">${q || ui.peopleRole ? "조건에 맞는 분이 없어요" : "등록된 분이 없어요"}</div>`;
  };
  const renderPeople = () => {
    const isW = ui.peopleMode === "workers";
    return `<div class="segment"><button class="${isW ? "active" : ""}" data-act="people-mode" data-v="workers">사람 ${state.workers.length}</button><button class="${isW ? "" : "active"}" data-act="people-mode" data-v="restaurants">식당 ${state.restaurants.length}</button></div>
      <button class="btn primary big" data-act="${isW ? "new-worker" : "new-rest"}">${icon("plus")}${isW ? "사람 등록" : "식당 등록"}</button>
      <input id="people-q" class="search" style="margin-top:14px" type="search" aria-label="${isW ? "사람 찾기" : "식당 찾기"}" placeholder="${isW ? "이름·지역·전화번호로 찾기" : "식당 이름·지역으로 찾기"}" value="${esc(ui.peopleQuery)}" />
      ${isW ? `<div class="chips filter-chips">${["", ...ROLES].map((r) => `<button class="${ui.peopleRole === r ? "active" : ""}" data-act="role-filter" data-v="${r}">${r || "전체"}</button>`).join("")}</div>` : ""}
      <div id="people-list">${peopleList()}</div>`;
  };

  // ---------- 화면: 구직자 한 명 ----------
  const renderWorker = (id) => {
    const w = worker(id);
    if (!w) return `<div class="empty">찾을 수 없어요.</div>`;
    const s = statsOf(w.id);
    const t = trustOf(s, w);
    const rows = state.assigns.filter((a) => a.workerId === w.id).map((a) => ({ a, j: job(a.jobId) })).filter((x) => x.j)
      .sort((x, y) => y.j.date.localeCompare(x.j.date));
    const upcoming = rows.filter((x) => x.j.date >= today() && x.a.status === "confirmed" && !x.a.outcome).reverse();
    const past = rows.filter((x) => !upcoming.includes(x)).slice(0, 20);
    const ranks = (w.roles || []).map((role) => ({ role, ...rankIn(role, w.id) })).filter((r) => r.pos > 0);
    const line = ({ a, j }) => `<li><button class="name-link" data-act="open-job" data-id="${j.id}">${esc(dateText(j.date))} ${esc(restName(j))}</button> <span class="muted small">${esc(j.role)}</span><br>
      <span class="small">${a.outcome ? outcomeText[a.outcome] : statusText[a.status]}${a.rehire ? ` · ${icon("heart", "fill")}식당이 또 찾음` : ""}${a.outcome === "done" && Number(a.fee) ? ` · 수수료 ${a.paid ? "받음" : `<span class="overdue">미수</span>`}` : ""}</span></li>`;
    // 이 분의 받을 수수료
    const owed = unpaidList(w.id);
    // 받을 수수료: 예정된 일과 별개인 칸이라 제목을 따로 달아 띄움 (홈의 받을 수수료와 같은 모양)
    const owedCard = owed.length ? `<h2>받을 수수료 <span class="count">${won(feeSumOf(owed))}</span> <span class="muted small" style="font-weight:400">${owed.length}건</span></h2><div class="card fee-owed">
      <ul class="history">${owed.map(({ a, j }) => `<li>${esc(shortDate(j.date))} ${esc(restName(j))} ${esc(j.role)} · <strong>${won(a.fee)}</strong> <span class="small ${daysBetween(j.date, today()) > 0 ? "overdue" : "muted"}">${overdueText(j)}</span></li>`).join("")}</ul>
      <div class="btn-row">${w.phone ? `<a class="btn" href="${smsHref(w.phone, feeMsg(w, owed))}">${icon("message")}수수료 안내</a>` : ""}<button class="btn" data-act="pay-all" data-id="${w.id}">${icon("check")}${owed.length > 1 ? "모두 받음" : "받음"}</button></div></div>` : "";

    return `<div class="card">
      <div class="who"><button class="avatar-btn" data-act="edit-worker" data-id="${w.id}" aria-label="사진 바꾸기">${avatar(w, "big")}<small>사진 바꾸기</small></button><div>
      <div class="name-line" style="font-size:1.35rem"><strong>${esc(w.name)}</strong>${badge(t)}${w.active === false ? `<span class="tag">숨김</span>` : ""}</div>
      <div class="status-line">${(w.roles || []).length ? esc(w.roles.join(" · ")) : `<span class="tag warn">업무 미정 · 고치기에서 골라 주세요</span>`}${w.area ? ` · ${esc(w.area)}` : ""}</div>
      <div class="status-line muted">${esc(w.phone || "전화번호 없음")}${w.joined ? ` · 가입 ${esc(w.joined)}` : ""}</div></div></div>
      ${w.memo ? `<p class="meta-line" style="margin-top:8px">${icon("note")}${esc(w.memo)}</p>` : ""}
      <div class="btn-row">${w.phone ? `<a class="btn primary" href="${telHref(w.phone)}">${icon("phone")}전화</a><a class="btn" href="${smsHref(w.phone, "")}">${icon("message")}문자</a>` : ""}<button class="btn" data-act="edit-worker" data-id="${w.id}">${icon("edit")}고치기</button></div>
    </div>
    ${workingNow().filter((x) => x.w.id === w.id).map(({ j }) => `<div class="card work-row work-card">
      <div class="progress-head"><strong>지금 일하는 중</strong><button class="name-link small" data-act="open-job" data-id="${j.id}">${esc(restName(j))} ${esc(j.role)}</button></div>
      ${workBar(j)}</div>`).join("")}
    <h2>예정된 일</h2>${upcoming.length ? `<div class="card"><ul class="history">${upcoming.map(line).join("")}</ul></div>` : `<div class="empty">예정된 일이 없어요. 일감에서 확정하면 여기에 나와요.</div>`}
    ${owedCard}
    <h2>신뢰 표시</h2>
    <div class="trust-card">
      <div class="segment seg4">${[["", "자동"], ["good", "믿음직"], ["mid", "보통"], ["bad", "주의"]].map(([v, label]) => `<button class="${(w.trust || "") === v ? "active" : ""}" data-act="set-trust" data-id="${w.id}" data-v="${v}">${label}</button>`).join("")}</div>
      <p class="hint" style="margin:0">${w.trust ? `엄마가 직접 정했어요. 추천 순서도 이 표시를 따라요. (기록으로 보면 '${autoTrust(s).label}')` : `출근·취소 기록을 보고 앱이 정해요. 지금은 '${autoTrust(s).label}'${hasBatchim(autoTrust(s).label) ? "이에요" : "예요"}.`}</p>
    </div>
    <h2>약속 기록</h2>
    <div class="stat-grid"><div><strong>${s.done}</strong><small>${icon("check")}출근</small></div><div><strong>${s.late}</strong><small>${icon("alert")}직전취소</small></div><div><strong>${s.noshow}</strong><small>${icon("x")}안 나옴</small></div><div><strong>${s.rehire}</strong><small>${icon("heart", "fill")}또 찾음</small></div></div>
    ${ranks.length ? `<div class="card"><p style="margin:0"><strong>지금 추천 순서</strong></p>${ranks.map((r) => `<p class="small" style="margin:4px 0 0">${esc(r.role)}: ${r.total}명 중 <strong>${r.pos}번째</strong></p>`).join("")}<p class="hint">약속 잘 지키고 오래 쉰 분이 앞 순서예요. 재촉 전화가 오면 참고하세요.</p></div>` : ""}
    <h2>지난 기록</h2>${past.length ? `<div class="card"><ul class="history">${past.map(line).join("")}</ul></div>` : `<div class="empty">아직 기록이 없어요.</div>`}
    <div class="danger-zone"><button class="btn big" data-act="toggle-active" data-id="${w.id}">${w.active === false ? "명단에 다시 보이기" : "명단에서 숨기기 (기록은 남음)"}</button>
      <button class="link-btn" data-act="del-worker" data-id="${w.id}">이 사람 완전히 지우기</button></div>`;
  };

  // ---------- 화면: 문자 문구 ----------
  const renderScripts = () => `<p class="muted small">누르면 문자 앱이 열리고 내용이 채워져요. 받는 사람만 고르면 돼요.</p>
    ${state.scripts.map((s) => `<div class="card">
      <strong>${esc(s.title)}</strong>${s.kind === "talk" ? `<span class="tag">전화로 말할 때</span>` : ""}
      <p class="script-text">${esc(s.text)}</p>
      <div class="btn-row">${s.kind === "talk" ? "" : `<a class="btn primary" href="${smsHref("", s.text)}">${icon("send")}문자 보내기</a>`}
        <button class="btn" data-act="copy-script" data-id="${s.id}">${icon("copy")}복사</button>
        <button class="btn ghost" data-act="edit-script" data-id="${s.id}">${icon("edit")}고치기</button></div>
    </div>`).join("")}
    <button class="btn big" data-act="new-script">${icon("plus")}새 문구 만들기</button>`;

  // ---------- 화면: 설정·백업 ----------
  // 메뉴 한 줄: 왼쪽 아이콘 · 제목과 설명 · 오른쪽 화살표
  const menuRow = (act, ic, title, sub, tone = "") => `<button class="menu-row" data-act="${act}">
      <span class="menu-ic ${tone}">${icon(ic)}</span><span class="menu-text"><strong>${title}</strong>${sub ? `<small>${sub}</small>` : ""}</span></button>`;
  const renderMore = () => {
    const hasData = state.workers.length || state.jobs.length;
    const backupSub = state.lastBackup ? `마지막 백업 ${esc(dateText(state.lastBackup))}` : "아직 한 번도 안 했어요";
    return `<h2>사람 가져오기</h2>
    <div class="menu">${menuRow("import-vcf", "contacts", "연락처 파일 불러오기", "연락처를 한 번에 옮겨요")}</div>
    <details class="howto"><summary>연락처 파일 만드는 방법</summary>
      <ol>
        <li>연락처 앱 → 메뉴(≡) → 연락처 관리 → 연락처 가져오기/내보내기 → <strong>내보내기</strong></li>
        <li>저장 위치를 <strong>휴대폰(내장 저장공간)</strong>으로 고르기</li>
        <li>위 <strong>연락처 파일 불러오기</strong>를 눌러 방금 만든 .vcf 파일 고르기</li>
      </ol>
      <p>이름이 "김○○ 찬모"처럼 저장돼 있으면 업무도 자동으로 골라져요. 연락처는 이 휴대폰 안에서만 읽고, 다 가져온 뒤엔 .vcf 파일을 '내 파일'에서 지워 주세요.</p>
    </details>
    <h2>설정</h2>
    <div class="card fee-card">
      <span class="menu-ic">${icon("percent")}</span>
      <label class="fee-label" for="fee-rate"><strong>수수료</strong><small>일당의 몇 %인지</small></label>
      <div class="fee-input"><input id="fee-rate" type="number" inputmode="numeric" min="0" max="100" value="${esc(state.feeRate)}" /><span>%</span></div>
      <button class="btn primary" data-act="save-fee">저장</button>
    </div>
    <div class="card rate-card">
      <div class="rate-title"><span class="menu-ic">${icon("download")}</span><div><strong>수수료 받을 계좌</strong><small>수수료 안내 문자에 같이 들어가요</small></div></div>
      <label class="field">은행 · 계좌번호 · 이름<input id="fee-account" placeholder="예: 농협 123-4567-8901 김다원" value="${esc(state.account || "")}" /></label>
      <button class="btn primary big" data-act="save-account">계좌 저장</button>
    </div>
    <div class="card rate-card">
      <div class="rate-title"><span class="menu-ic">${icon("edit")}</span><div><strong>기본 시급</strong><small>모든 업무에 같이 쓰고, 일감 받기에서 자동으로 들어가요</small></div></div>
      <label class="field">낮 시급 (원)<input id="rate-d" inputmode="numeric" placeholder="예: 12000" value="${esc(state.rate?.day || "")}" /></label>
      <div class="field">밤·주말·공휴일 시급 <span class="hint" style="display:inline">밤 10시~아침 6시, 토·일·공휴일 하루 종일</span>
        <span class="name-search"><input id="rate-n" inputmode="numeric" aria-label="밤·주말·공휴일 시급 (원)" placeholder="비워 두면 낮 시급과 같아요" value="${esc(state.rate?.night || "")}" /><button type="button" class="name-search-btn" data-act="rate-x">1.5배</button></span>
      </div>
      <button class="btn primary big" data-act="save-rates">기본 시급 저장</button>
      <p class="hint" style="margin-top:8px">이미 만든 일감의 시급은 바뀌지 않아요. 식당마다 다르면 일감 받기에서 그 칸만 고치면 돼요.</p>
    </div>
    <details class="howto"><summary>홈 화면에 앱 아이콘 만들기</summary>
      <p><strong>크롬:</strong> 오른쪽 위 ⋮ 메뉴 → '홈 화면에 추가'</p>
      <p><strong>삼성 인터넷:</strong> 아래 ≡ 메뉴 → '현재 페이지 추가' → '홈 화면'</p>
      <p><strong>아이폰 사파리:</strong> 아래 공유 버튼 → '홈 화면에 추가'</p>
    </details>
    <h2>백업</h2>
    <section id="cloud-backup" class="card cloud-backup"></section>
    <div class="menu">
      ${menuRow("backup", "download", "백업 파일 만들기", backupSub, state.lastBackup && daysBetween(state.lastBackup, today()) < 7 ? "" : "warn")}
      ${menuRow("import", "folder", "백업 파일 불러오기", "휴대폰을 바꿨을 때 자료를 되살려요")}
    </div>
    <p class="hint" style="margin:0 4px 0">수동 백업 파일은 암호화되지 않아요. ‘내 파일 → 다운로드’에 저장되므로 안전한 곳에 보관해 주세요.</p>
    <h2>연습</h2>
    <div class="menu">
      ${menuRow("seed", "play", "연습용 예시 자료 넣기", hasData ? "지금 자료는 그대로 두고 사람 20명·식당 20곳을 더해요" : "가짜 사람·식당·일감으로 눌러 볼 수 있어요")}
      ${demoCount().total ? menuRow("clear-demo", "trash", "연습용 자료만 지우기", `사람 ${demoCount().workers}명 · 식당 ${demoCount().restaurants}곳 · 실제 자료는 그대로`, "warn") : ""}
    </div>
    <div class="danger-zone"><button class="link-btn" data-act="wipe">모든 자료 지우기</button></div>
    <p class="app-version">앱 버전 ${APP_VERSION}</p>`;
  };

  // ---------- 그리기 ----------
  const TITLES = { home: "다원 어머니회", jobs: "일감", people: "사람", scripts: "문자 문구", more: "설정·백업" };
  const screens = { home: renderHome, jobs: renderJobs, people: renderPeople, scripts: renderScripts, more: renderMore, job: renderJob, worker: renderWorker };
  // 색으로만 보이는 '선택됨'을 화면 읽기 기능에도 알림 (사람·식당 칸, 업무 고르기, 1일째·2일째 칸)
  const markSelected = (root) => root.querySelectorAll(".segment button, .filter-chips button, .day-tab").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.classList.contains("active") || b.classList.contains("on")));
  });
  const render = () => {
    const tab = { job: "jobs", worker: "people" }[route.name] || route.name;
    document.querySelectorAll(".tabbar button").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tab);
      // 화면 읽기 기능(톡백)이 "현재 페이지"라고 읽어 줌
      if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    const detail = isDetail(route);
    $("#back").hidden = !detail;
    $("#title").textContent = route.name === "job" ? "일감 보기" : route.name === "worker" ? (worker(route.id)?.name || "사람") : TITLES[route.name];
    const scr = $("#screen");
    scr.innerHTML = (screens[route.name] || renderHome)(route.id);
    if (route.name === "more") window.DawonBackup?.mount($("#cloud-backup"));
    markSelected(scr);
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
  // 홈·사람·일감 화면을 보고 있으면 1분마다 다시 그려서 '일하는 중' 막대가 차오르게 함 (입력창이 열려 있으면 건너뜀)
  const liveRefresh = () => {
    if (!["home", "worker", "job"].includes(route.name) || sheet.open || document.hidden) return;
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
  };
  setInterval(liveRefresh, 60000);
  // 진행 막대·남은 시간: 10초마다 그 부분만 고침 (화면 전체를 다시 그리지 않아 깜빡이지 않음)
  // 근무가 끝난 막대가 있으면 화면을 다시 그려 '퇴근함'으로 바꿈
  const tickBars = () => {
    if (document.hidden) return;
    const now = Date.now();
    let ended = false;
    document.querySelectorAll("#screen .progress[data-e]").forEach((bar) => {
      const s = Number(bar.dataset.s);
      const e = Number(bar.dataset.e);
      if (now >= e) { ended = true; return; }
      const pct = Math.max(0, Math.min(100, ((now - s) / (e - s)) * 100));
      bar.firstElementChild.style.width = `${pct.toFixed(1)}%`;
      bar.setAttribute("aria-valuenow", String(Math.round(pct)));
      const left = hoursText(Math.max(1, Math.round((e - now) / 60000)));
      bar.setAttribute("aria-valuetext", `${left} 남음`);
      const label = bar.nextElementSibling?.querySelector(".left");
      if (label && label.textContent !== `${left} 남음`) label.textContent = `${left} 남음`;
    });
    if (ended) liveRefresh();
  };
  setInterval(tickBars, 10000);
  // 다른 앱을 보다 돌아오거나 화면을 다시 켜면 바로 새로 그림
  const onBack = () => { if (!document.hidden) liveRefresh(); };
  document.addEventListener("visibilitychange", onBack);
  window.addEventListener("pageshow", onBack);
  window.addEventListener("focus", onBack);

  // ---------- 입력창들 ----------
  const roleChips = (name, selected, multi) => `<div class="chips">${ROLES.map((r) => `<label class="chip"><input type="${multi ? "checkbox" : "radio"}" name="${name}" value="${r}" ${selected.includes(r) ? "checked" : ""} ${multi ? "" : 'required data-error="업무를 골라 주세요"'} /><span>${r}</span></label>`).join("")}</div>`;
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

  // existing: 고칠 일감 (없으면 새로 받기)
  // preset: '같은 식당·날짜로 업무 추가'에서 넘겨주는 값 { restaurantId, dates, start, end, breakMin, req }
  // scope: 여러 날 일감을 고칠 때 "one"(이 날만) / "all"(이 날부터 남은 날 모두)
  const jobForm = (existing, preset = null, scope = "one") => {
    // 고칠 대상: 이 일감 + (남은 날 모두면) 같은 묶음의 이후 날짜들 (식당 취소된 날 제외)
    const targets = existing ? (scope === "all" ? groupOf(existing).filter((x) => !x.canceled && x.date >= existing.date) : [existing]) : [];
    // 같이 부른 다른 업무(같은 날 같은 요청)에 이미 있는 업무는 고를 수 없게
    const taken = new Set(targets.flatMap((t) => reqOf(t).filter((x) => x.id !== t.id).map((x) => x.role)));
    const j = existing || { date: preset?.dates?.[0] || today(), start: preset?.start || "", end: preset?.end || "", breakMin: preset?.breakMin || 0, role: "", memo: "", restaurantId: preset?.restaurantId || "" };
    const presetMulti = !existing && preset?.dates?.length > 1;
    // 최근에 일감을 준 식당이 위로
    const lastUse = (r) => state.jobs.filter((x) => x.restaurantId === r.id).map((x) => x.date).sort().pop() || "";
    const rests = [...state.restaurants].sort((a, b) => lastUse(b).localeCompare(lastUse(a)) || a.name.localeCompare(b.name, "ko"));
    const quick = ["오늘", "내일", "모레"].map((label, n) => `<label class="chip"><input type="radio" name="dateQuick" value="${today(n)}" ${!presetMulti && j.date === today(n) ? "checked" : ""} /><span>${label}</span></label>`).join("");
    // 업무 고르기: 받기·고치기 모두 켜고 끄기(체크). 고칠 때 다른 업무를 켜면 같은 요청으로 새 일감이 추가됨
    const roleType = "checkbox";
    const curIdx = existing ? ROLES.indexOf(existing.role) : -1;
    const roleChipsHtml = ROLES.map((r, i) => {
      const blocked = existing && taken.has(r) && j.role !== r;
      return `<label class="chip ${blocked ? "taken" : ""}"><input type="${roleType}" name="roles" value="${i}" ${j.role === r ? "checked" : ""} ${blocked ? "disabled" : ""} /><span>${r}${blocked ? " · 이미 있음" : ""}</span></label>`;
    }).join("");
    // 시급 칸: 12000 → "12,000" (저장할 때는 num()이 쉼표를 빼고 읽음)
    const money = (v) => (Number(v) ? Number(v).toLocaleString("ko-KR") : "");
    // 업무 한 줄: 인원 + 시급 + (밤 근무면) 밤 시급 + 계산
    const roleRow = (i) => {
      // 고칠 때는 그 일감 값, 새로 받을 때는 설정의 기본 시급
      const rate = state.rate || {};
      const mine = existing && existing.role === ROLES[i] ? existing : { hourly: rate.day || "", nightHourly: rate.night || "" };
      return `<div class="role-row" data-i="${i}">
        <div class="role-row-head"><strong>${ROLES[i]}<span class="row-new" hidden> (새로 추가)</span></strong>
          <div class="stepper small"><button type="button" data-step="-1" aria-label="줄이기">${icon("minus")}</button><input name="hc_${i}" aria-label="${ROLES[i]} 인원 (명)" type="number" min="1" max="20" value="${esc(mine.headcount || 1)}" /><button type="button" data-step="1" aria-label="늘리기">${icon("plus")}</button></div>
        </div>
        <label class="mini-label">시급 (원)<input name="hr_${i}" aria-label="${ROLES[i]} 시급 (원)" class="role-in money" inputmode="numeric" placeholder="예: 12,000" value="${esc(money(mine.hourly))}" /></label>
        <div class="night-wrap" hidden><label class="mini-label" for="nh-in-${i}">밤·주말·공휴일 시급 (원)</label>
          <div class="night-in"><input id="nh-in-${i}" name="nh_${i}" aria-label="${ROLES[i]} 밤·주말·공휴일 시급 (원)" class="role-in money" inputmode="numeric" placeholder="비우면 낮 시급과 같아요" value="${esc(money(mine.nightHourly))}" /><button type="button" class="name-search-btn" data-night-x="${i}">1.5배</button></div></div>
        <div class="row-calc"></div>
      </div>`;
    };
    const body = `
      <label class="field">식당
        <select name="restaurantId" required data-error="식당을 골라 주세요">
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
      <fieldset class="field"><legend>날짜</legend>
        <div class="chips">${quick}${existing ? "" : `<label class="chip"><input type="radio" name="dateQuick" value="multi" ${presetMulti ? "checked" : ""} /><span>여러 날</span></label>`}</div>
        <div class="date-range">
          <input type="date" name="date" aria-label="날짜 (시작일)" value="${esc(j.date)}" required data-error="날짜를 골라 주세요" />
          <span class="range-to" hidden>~</span>
          <input type="date" name="dateEnd" aria-label="끝나는 날짜" value="${presetMulti ? esc(preset.dates[preset.dates.length - 1]) : ""}" hidden />
        </div>
        <span class="hint" id="days-hint"></span>
        <label class="check-line" id="holiday-line"><input type="checkbox" name="holiday" ${(existing ? existing.holiday ?? isHolidayDate(j.date) : isHolidayDate(j.date)) ? "checked" : ""} /><span><strong>휴일 시급</strong><small>토·일·공휴일은 하루 종일 밤 시급으로 계산해요</small></span></label>
      </fieldset>
      <div class="field">시작${timePicker("start", j.start)}</div>
      <div class="field">끝${timePicker("end", j.end)}</div>
      <fieldset class="field"><legend>휴게시간 <span class="hint" style="display:inline">시급 계산에서 빠져요</span></legend>
        <div class="chips">${BREAKS.map(([v, label]) => `<label class="chip"><input type="radio" name="breakMin" value="${v}" ${Number(j.breakMin || 0) === v ? "checked" : ""} /><span>${label}</span></label>`).join("")}</div>
      </fieldset>
      <fieldset class="field"><legend>업무와 인원 <span class="hint" style="display:inline">${existing ? "다른 업무를 켜면 같이 추가돼요" : "여러 개 고를 수 있어요 (예: 찬모 1·서빙 1)"}</span></legend>
        <div class="chips">${roleChipsHtml}</div>
        <div class="role-rows"></div>
        <span class="hint" id="night-hint"></span>
      </fieldset>
      ${existing ? "" : `<fieldset class="field day-plan" hidden><legend>날마다 필요한 업무</legend>
        <span class="hint" style="margin:0 0 10px">필요 없는 칸만 눌러서 빼세요</span>
        <div class="day-plan-rows"></div>
      </fieldset>`}
      <label class="field">메모<textarea name="memo" rows="2" placeholder="예: 앞치마 지참">${esc(j.memo)}</textarea></label>`;
    // 날짜별 업무 체크표: "날짜|업무번호" → 체크 여부. 처음엔 모두 체크
    // (업무 추가에서 넘어온 날짜 묶음이 띄엄띄엄이면, 묶음에 없는 날은 처음부터 빼 둠)
    const planPick = new Map();
    const presetDays = preset?.dates?.length > 1 ? new Set(preset.dates) : null;
    const planOn = (d, i) => (planPick.has(`${d}|${i}`) ? planPick.get(`${d}|${i}`) : !presetDays || presetDays.has(d));

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
    const num = (v) => Number(String(v ?? "").replace(/[^0-9]/g, ""));

    openSheet({
      title: existing ? (targets.length > 1 ? `일감 고치기 (남은 ${targets.length}일 모두)` : "일감 고치기") : preset ? "업무 추가" : "일감 받기",
      body,
      submit: existing ? "저장" : "저장하고 사람 찾기",
      onReady: (form) => {
        const select = form.elements.restaurantId;
        const box = form.querySelector(".new-rest");
        const rowsBox = form.querySelector(".role-rows");
        bindAddress(form, "r", form.elements.rArea);
        bindPlace(form, "r");
        // 시간 칸: 시·분을 고르면 숨은 칸에 "HH:MM"으로 넣음
        form.querySelectorAll(".time-pick").forEach((wrap) => wrap.addEventListener("change", () => {
          const h = wrap.querySelector('[data-part="h"]').value;
          const m = wrap.querySelector('[data-part="m"]').value;
          form.elements[wrap.dataset.time].value = h === "" ? "" : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          calc();
        }));
        // 날짜별 업무 체크표: 여러 날 + 업무를 골랐을 때만 보임
        const planBox = form.querySelector(".day-plan");
        const syncPlan = () => {
          if (!planBox) return;
          const dates = datesOf(form);
          const picked = [...form.querySelectorAll("input[name=roles]:checked")].map((x) => Number(x.value));
          planBox.hidden = !(dates.length > 1 && picked.length);
          if (planBox.hidden) return;
          planBox.querySelector(".day-plan-rows").innerHTML = dates.map((d) => `<div class="plan-row">
            <span class="plan-date">${esc(shortDate(d))}</span>
            <div class="chips">${picked.map((i) => `<label class="chip"><input type="checkbox" data-plan="${d}|${i}" ${planOn(d, i) ? "checked" : ""} /><span>${ROLES[i]}</span></label>`).join("")}</div>
          </div>`).join("");
        };
        planBox?.addEventListener("change", (e) => {
          const key = e.target.dataset.plan;
          if (key) planPick.set(key, e.target.checked);
        });
        // 업무 줄 맞추기: 고른 업무만 줄로 보여줌 (이미 적은 값은 그대로 둠)
        // held: 고치기에서 지금 업무를 끄면 그 줄의 인원·시급을 기억 → 다른 업무를 켜면(업무 바꾸기) 그 줄로 옮김
        let held = null;
        let lastMain = curIdx;
        const syncRows = () => {
          const picked = [...form.querySelectorAll("input[name=roles]:checked")].map((x) => Number(x.value));
          // 고치기: '이 일감'이 될 업무 = 지금 업무가 켜져 있으면 그것, 꺼졌으면 켜진 것 중 첫째 (업무 바꾸기)
          const mainIdx = existing ? (picked.includes(curIdx) ? curIdx : picked[0]) : -1;
          rowsBox.querySelectorAll(".role-row").forEach((row) => {
            if (picked.includes(Number(row.dataset.i))) return;
            const k = row.dataset.i;
            if (existing && Number(k) === curIdx) held = { hc: form.elements[`hc_${k}`].value, hr: form.elements[`hr_${k}`].value, nh: form.elements[`nh_${k}`].value };
            row.remove();
          });
          picked.forEach((i) => {
            if (!rowsBox.querySelector(`.role-row[data-i="${i}"]`)) rowsBox.insertAdjacentHTML("beforeend", roleRow(i));
          });
          // 지금 업무가 꺼진 채 '이 일감'이 될 업무가 새로 정해지면 기억해 둔 값을 옮김
          if (held && mainIdx !== undefined && mainIdx !== curIdx && mainIdx !== lastMain) { form.elements[`hc_${mainIdx}`].value = held.hc; form.elements[`hr_${mainIdx}`].value = held.hr; form.elements[`nh_${mainIdx}`].value = held.nh; }
          lastMain = mainIdx;
          if (existing) rowsBox.querySelectorAll(".role-row").forEach((row) => { row.querySelector(".row-new").hidden = Number(row.dataset.i) === mainIdx; });
          // 업무 순서대로 정렬
          [...rowsBox.children].sort((a, b) => a.dataset.i - b.dataset.i).forEach((el) => rowsBox.append(el));
          calc();
          syncPlan();
        };
        // 지금 고른 날짜들의 휴일 여부: 하루짜리는 '휴일 시급' 칸, 여러 날은 날짜마다 자동
        const holidayFlags = () => {
          const ds = datesOf(form);
          return ds.length > 1 ? ds.map(isHolidayDate) : [Boolean(form.elements.holiday?.checked)];
        };
        // 업무마다 시급 × 근무시간 = 일당 계산
        const calc = () => {
          const start = form.elements.start.value;
          const end = form.elements.end.value;
          const brk = form.querySelector("input[name=breakMin]:checked")?.value;
          const min = workMinutes(start, end, brk);
          const hasNight = nightMinutes(start, end) > 0;
          const flags = holidayFlags();
          const anyHoliday = flags.includes(true);
          const kinds = [...new Set(flags)]; // [false], [true], 또는 둘 다 (여러 날에 평일·휴일 섞임)
          $("#night-hint", form).textContent = anyHoliday
            ? "주말·공휴일은 하루 종일 밤·주말·공휴일 시급이에요. 칸을 채우거나 [1.5배]를 눌러 주세요"
            : hasNight ? "밤 10시~아침 6시가 들어간 근무예요. 밤 시급을 넣거나 [1.5배]를 눌러 주세요" : "";
          rowsBox.querySelectorAll(".role-row").forEach((row) => {
            const i = row.dataset.i;
            row.querySelector(".night-wrap").hidden = !hasNight && !anyHoliday;
            const hourly = num(form.elements[`hr_${i}`].value);
            const night = num(form.elements[`nh_${i}`].value);
            const out = row.querySelector(".row-calc");
            if (hourly && min) {
              out.innerHTML = kinds.map((h) => {
                const b = payBreakdown(start, end, brk, hourly, hasNight || h ? night : 0, h);
                const parts = h
                  ? `${hoursText(b.nightMin)} × ${won(b.nightRate)}`
                  : b.nightMin
                    ? `${b.dayMin ? `낮 ${hoursText(b.dayMin)} × ${won(hourly)} + ` : ""}밤 ${hoursText(b.nightMin)} × ${won(b.nightRate)}`
                    : `${won(hourly)} × ${hoursText(b.dayMin)}`;
                const label = kinds.length > 1 ? (h ? "주말·공휴일 " : "평일 ") : h ? "휴일 " : "";
                return `${label}${parts} = <strong>일당 ${won(b.pay)}</strong>`;
              }).join("<br>") + ((hasNight || anyHoliday) && !night ? `<br><span class="calc-note">밤·주말·공휴일 시급이 비어 있어 낮 시급으로 계산했어요</span>` : "");
            } else if (existing?.pay && !existing.hourly && !hourly) {
              out.innerHTML = `예전에 넣은 일당 <strong>${won(existing.pay)}</strong> · 시급을 넣으면 다시 계산돼요`;
            } else out.innerHTML = min ? `근무 ${hoursText(min)} · 시급을 넣으면 일당이 계산돼요` : "";
          });
        };
        rowsBox.addEventListener("input", (e) => {
          if (e.target.classList.contains("money")) {
            const n = num(e.target.value);
            const shown = n ? n.toLocaleString("ko-KR") : "";
            if (e.target.value !== shown) e.target.value = shown;
          }
          calc();
        });
        // [1.5배]: 그 업무의 낮 시급 × 1.5를 밤 시급 칸에
        rowsBox.addEventListener("click", (e) => {
          const b = e.target.closest("[data-night-x]");
          if (!b) return;
          const i = b.dataset.nightX;
          const h = num(form.elements[`hr_${i}`].value);
          if (!h) { toast("낮 시급을 먼저 넣어 주세요"); form.elements[`hr_${i}`].focus(); return; }
          form.elements[`nh_${i}`].value = Math.round(h * 1.5).toLocaleString("ko-KR");
          calc();
        });
        form.querySelectorAll("input[name=roles]").forEach((x) => x.addEventListener("change", syncRows));
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
          const hol = datesOf(form).filter(isHolidayDate);
          $("#days-hint", form).textContent = isMulti ? (n ? `${n}일 · 날마다 필요한 업무는 아래에서 고를 수 있어요${hol.length ? ` · 주말·공휴일 ${hol.map(shortDate).join(", ")}은 휴일 시급` : ""}` : "끝 날짜를 시작 날짜 뒤로 골라 주세요") : "";
          form.querySelector("#holiday-line").hidden = isMulti;
          syncPlan();
          calc();
        };
        form.querySelectorAll("input[name=dateQuick]").forEach((i) => i.addEventListener("change", () => {
          if (i.value !== "multi") { form.elements.date.value = i.value; form.elements.holiday.checked = isHolidayDate(i.value); }
          syncDates();
        }));
        form.elements.date.addEventListener("change", () => {
          if (!multi?.checked) form.querySelectorAll("input[name=dateQuick]").forEach((i) => { i.checked = i.value === form.elements.date.value; });
          form.elements.holiday.checked = isHolidayDate(form.elements.date.value); // 날짜를 바꾸면 휴일 칸을 다시 자동으로
          syncDates();
        });
        form.elements.holiday.addEventListener("change", calc);
        form.elements.dateEnd.addEventListener("change", syncDates);
        form.querySelectorAll("input[name=breakMin]").forEach((i) => i.addEventListener("change", calc));
        const syncNew = () => {
          const isNew = select.value === "__new";
          box.hidden = !isNew;
          form.elements.rName.required = isNew;
        };
        select.addEventListener("change", syncNew);
        syncNew();
        syncDates();
        syncRows();
      },
      onSubmit: (fd, form) => {
        const roleIdx = fd.getAll("roles").map(Number);
        if (!roleIdx.length) { formError("업무를 골라 주세요 (여러 개 가능)", form.querySelector("input[name=roles]:not(:disabled)")); return false; }
        const start = val(fd, "start");
        const end = val(fd, "end");
        const hourOf = (name) => form.querySelector(`.time-pick[data-time="${name}"] [data-part="h"]`);
        if (!start || !end) { formError("시작·끝 시간을 골라 주세요", hourOf(start ? "end" : "start")); return false; }
        if (start === end) { formError("시작과 끝 시간이 같아요. 끝 시간을 다시 골라 주세요", hourOf("end")); return false; }
        const dates = datesOf(form);
        if (!dates.length) { formError("날짜를 확인해 주세요", form.elements.date); return false; }
        if (dates.length > MAX_DAYS) { toast(`한 번에 ${MAX_DAYS}일까지 넣을 수 있어요`); return false; }
        let restaurantId = val(fd, "restaurantId");
        if (restaurantId === "__new") {
          const r = { id: uid(), name: val(fd, "rName"), area: val(fd, "rArea"), phone: val(fd, "rPhone"), address: val(fd, "rAddress"), addrDetail: val(fd, "rAddrDetail"), way: val(fd, "rWay"), memo: "" };
          state.restaurants.push(r);
          restaurantId = r.id;
        }
        const breakMin = Number(val(fd, "breakMin")) || 0;
        // 휴일 여부: 하루짜리는 '휴일 시급' 칸, 여러 날은 날짜마다 자동 (토·일·공휴일)
        const holidayOf = (date) => (dates.length > 1 ? isHolidayDate(date) : Boolean(fd.get("holiday")));
        const night = nightMinutes(start, end) > 0 || dates.some(holidayOf);
        // 업무마다 인원·시급·일당
        const perRole = roleIdx.map((i) => {
          const hourly = num(val(fd, `hr_${i}`));
          const nightHourly = night || existing ? num(val(fd, `nh_${i}`)) : 0;
          const keepOld = existing && !hourly ? Number(existing.pay) || 0 : 0; // 예전 일당만 있던 일감
          return {
            role: ROLES[i],
            headcount: Math.max(1, num(val(fd, `hc_${i}`)) || 1),
            hourly,
            nightHourly,
            pay: hourly ? payBreakdown(start, end, breakMin, hourly, nightHourly, holidayOf(dates[0])).pay : keepOld,
          };
        });
        // 날짜에 맞춘 휴일 표시·일당 (여러 날이면 날마다 다를 수 있음)
        const forDate = (p, date) => ({ holiday: holidayOf(date), ...(p.hourly ? { pay: payBreakdown(start, end, breakMin, p.hourly, p.nightHourly, holidayOf(date)).pay } : {}) });
        const common = { restaurantId, start, end, breakMin, memo: val(fd, "memo") };
        if (existing) {
          const mainK = roleIdx.includes(curIdx) ? roleIdx.indexOf(curIdx) : 0;
          const mainP = perRole[mainK];
          const extras = perRole.filter((_, k) => k !== mainK); // 새로 추가할 업무
          // 바꾼 칸만 골라냄 → 남은 날에는 바꾼 칸만 똑같이 적용 (손대지 않은 칸은 날마다 원래 값 그대로)
          const KEYS = ["restaurantId", "start", "end", "breakMin", "memo", "role", "headcount", "hourly", "nightHourly"];
          const after = { ...common, ...mainP };
          const changed = KEYS.filter((k) => String(existing[k] ?? "") !== String(after[k] ?? ""));
          const oldRest = existing.restaurantId;
          const oldDate = existing.date;
          // 같이 부른 다른 업무(같은 날 같은 요청): 바꾸기 전에 찾아 둠
          const siblings = targets.flatMap((t) => reqOf(t).filter((x) => x.id !== t.id && !targets.includes(x)));
          Object.assign(existing, after, { date: dates[0] }, forDate(mainP, dates[0]));
          targets.filter((t) => t !== existing).forEach((t) => {
            changed.forEach((k) => { t[k] = after[k]; });
            const h = t.holiday ?? isHolidayDate(t.date);
            t.holiday = h;
            if (t.hourly) t.pay = payBreakdown(t.start, t.end, t.breakMin, t.hourly, t.nightHourly, h).pay;
          });
          // 일당이 바뀌면 이미 출근한 분 수수료도 다시 계산
          targets.forEach((t) => assignsOf(t.id).filter((a) => a.outcome === "done").forEach((a) => { a.fee = feeOf(a, t); }));
          // 새로 켠 업무: 고친 날(남은 날 모두면 그 날들)마다 새 일감. 같은 날 요청(req)으로 묶고, 여러 날이면 업무별로 묶음(group)
          const added = [];
          extras.forEach((p) => {
            const group = targets.length > 1 ? uid() : "";
            targets.forEach((t) => {
              if (!t.req) t.req = uid();
              const h = t === existing ? holidayOf(t.date) : t.holiday ?? isHolidayDate(t.date);
              added.push({ id: uid(), restaurantId: t.restaurantId, start: t.start, end: t.end, breakMin: t.breakMin, memo: t.memo, ...p, date: t.date, holiday: h,
                ...(p.hourly ? { pay: payBreakdown(t.start, t.end, t.breakMin, p.hourly, p.nightHourly, h).pay } : {}),
                req: t.req, ...(group ? { group } : {}), created: today() });
            });
          });
          if (added.length) state.jobs.push(...added);
          refresh();
          const addText = extras.map((p) => `${p.role} ${p.headcount}명`).join("·");
          toast(`${targets.length > 1 ? `남은 ${targets.length}일을 모두 고쳤어요` : "고쳤어요"}${addText ? ` · ${addText} 추가` : ""}`);
          // 식당이나 날짜를 바꿨으면, 같이 부른 업무도 옮길지 물어봄 (시간은 업무마다 다를 수 있어 그대로 둠)
          const moved = restaurantId !== oldRest || dates[0] !== oldDate;
          if (moved && siblings.length) {
            const what = [restaurantId !== oldRest ? `식당 → ${restName(existing)}` : "", dates[0] !== oldDate ? `날짜 → ${shortDate(dates[0])}` : ""].filter(Boolean).join(", ");
            const roles = [...new Set(siblings.map((x) => x.role))].join("·");
            setTimeout(async () => {
              if (!(await ask({ title: `같이 부른 ${roles}도 옮길까요?`, text: `${what}\n같은 요청으로 받은 ${roles} 일감도 똑같이 바꿔요.`, ok: "같이 옮기기", cancel: "이 업무만" }))) return;
              siblings.forEach((x) => {
                if (restaurantId !== oldRest) x.restaurantId = restaurantId;
                if (dates[0] !== oldDate && x.date === oldDate) {
                  x.date = dates[0];
                  x.holiday = isHolidayDate(x.date);
                  if (x.hourly) x.pay = payBreakdown(x.start, x.end, x.breakMin, x.hourly, x.nightHourly, x.holiday).pay;
                }
                assignsOf(x.id).filter((a) => a.outcome === "done").forEach((a) => { a.fee = feeOf(a, x); });
              });
              refresh();
              toast(`${roles}도 옮겼어요`);
            }, 250);
          }
          return;
        }
        // 날짜마다 체크표에서 남겨 둔 업무만 (하루짜리면 고른 업무 모두)
        const plan = dates
          .map((date) => ({ date, roles: perRole.filter((p, k) => dates.length < 2 || planOn(date, roleIdx[k])) }))
          .filter((x) => x.roles.length);
        if (!plan.length) { formError("날마다 필요한 업무를 하나 이상 남겨 주세요", form.querySelector(".day-plan input")); return false; }
        // group: 같은 업무의 여러 날 묶음 / req: 같은 날 같은 요청(찬모·서빙 함께)
        const groups = Object.fromEntries(perRole.map((p) => [p.role, plan.filter((x) => x.roles.includes(p)).length > 1 ? uid() : ""]));
        const reqs = Object.fromEntries(plan.map((x) => [x.date, preset?.reqByDate?.[x.date] || (x.roles.length > 1 ? uid() : "")]));
        const made = [];
        plan.forEach(({ date, roles }) => roles.forEach((p) => {
          made.push({ id: uid(), ...common, ...p, ...forDate(p, date), date, ...(groups[p.role] ? { group: groups[p.role] } : {}), ...(reqs[date] ? { req: reqs[date] } : {}), created: today() });
        }));
        state.jobs.push(...made);
        save();
        // '같은 식당·날짜로 업무 추가'(일감 보기에서 만듦)는 쌓지 않고 바꿔치기 → 뒤로가기 한 번에 목록으로
        go({ name: "job", id: made[0].id }, { replace: Boolean(preset) && route.name === "job" });
        const roleText = perRole.map((p) => `${p.role} ${p.headcount}명`).join("·");
        toast(made.length > 1 ? (plan.length > 1 ? `${plan.length}일 동안 일감 ${made.length}개를 만들었어요` : `${roleText} 일감을 만들었어요`) : "일감을 저장했어요. 추천 순서대로 연락해 보세요.");
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
        <label class="field">이름<input name="name" required data-error="이름을 적어 주세요" autocomplete="off" value="${esc(w.name)}" /></label>
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
            if (list.length > 1) toast(`파일에 ${list.length}명이 있어서 첫 번째 분만 넣었어요. 여러 명은 설정 화면에서 불러오세요.`);
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
      <span class="name-search"><input name="${addrName(p, "name")}" autocomplete="off" data-error="식당 이름을 적어 주세요" ${required ? "required" : ""} value="${esc(value)}" />${KAKAO_JS_KEY ? `<button type="button" class="name-search-btn" data-place-search="${p}" aria-label="식당 이름으로 찾기">${icon("search")}찾기</button>` : ""}</span>
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
        <label class="field">오시는 길<textarea name="way" rows="2" placeholder="예: 종로3가역 5번 출구로 나와서 파리바게뜨 끼고 골목 50m, 2층">${esc(r.way || "")}</textarea><span class="hint">일하러 가는 분에게 보내는 확정 문자에 함께 들어가요</span></label>
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
      body: `<label class="field">제목<input name="title" required data-error="제목을 적어 주세요" value="${esc(s.title)}" placeholder="예: 비 오는 날 안내" /></label>
        <fieldset class="field"><legend>어디에 쓰나요?</legend><div class="chips">
          <label class="chip"><input type="radio" name="kind" value="sms" ${s.kind !== "talk" ? "checked" : ""} /><span>문자</span></label>
          <label class="chip"><input type="radio" name="kind" value="talk" ${s.kind === "talk" ? "checked" : ""} /><span>전화로 말할 때</span></label></div></fieldset>
        <label class="field">내용<textarea name="text" rows="6" required data-error="내용을 적어 주세요">${esc(s.text)}</textarea></label>
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
      title: `${w?.name || ""}님 확정 취소`,
      body: `<p>왜 취소하나요?</p><div class="choice-list">
        <label class="choice"><input type="radio" name="kind" value="mistake" required data-error="왜 취소하는지 골라 주세요" /><span><strong>잘못 눌렀어요</strong><small>명단에서 빼고 추천 순서로 돌려요 · 기록에 안 남아요</small></span></label>
        <label class="choice"><input type="radio" name="kind" value="rest_cancel" /><span><strong>식당 사정으로 취소</strong><small>그 사람 기록에 불이익 없음</small></span></label>
        <label class="choice"><input type="radio" name="kind" value="cancel_ok" /><span><strong>본인이 미리 알려줬어요</strong><small>하루 전 이상 · 기록에 불이익 없음</small></span></label>
        <label class="choice"><input type="radio" name="kind" value="late" /><span><strong>본인이 직전에 취소했어요</strong><small>약속 기록에 '직전 취소'로 남아요</small></span></label>
        <label class="choice"><input type="radio" name="kind" value="noshow" /><span><strong>연락 없이 안 나왔어요</strong><small>약속 기록에 '안 나옴'으로 남아요</small></span></label></div>`,
      submit: "확정 취소",
      onSubmit: (fd) => {
        const kind = val(fd, "kind");
        const j = job(a.jobId);
        // 잘못 누른 경우: 취소 기록 없이 명단에서만 뺌 (추천 순서에 다시 나옴)
        if (kind === "mistake") {
          state.assigns = state.assigns.filter((x) => x.id !== a.id); save();
          if (route.name !== "job") go({ name: "job", id: j.id }); else refresh();
          toast("확정을 취소했어요. 기록에는 안 남아요");
          return;
        }
        setOutcome(a, kind);
        if (route.name !== "job") go({ name: "job", id: j.id }); else refresh();
        toast(`${kind === "noshow" ? "안 나옴으로" : "취소로"} 기록했어요. 다른 분을 찾아보세요.`);
      },
    });
  };

  // 출근 결과 기록
  const setOutcome = (a, v) => {
    const j = job(a.jobId);
    if (v === "done") { a.status = "confirmed"; a.outcome = "done"; a.fee = j ? feeOf(a, j) : 0; a.paid = false; a.paidAt = ""; }
    else { a.status = "canceled"; a.outcome = v; a.fee = 0; a.rehire = false; a.paid = false; }
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
      body: `<p>${groupOf(j).length}일${isRun(groupOf(j)) ? " 연속" : "짜리"} 일감이에요. 어떻게 확정할까요?</p><div class="choice-list">
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
  const restoreData = async (data) => {
    await photosReady.catch(() => {});
    window.DawonBackupCrypto.validate(data);
    const { photos: savedPhotos = {}, ...rest } = data;
    const next = { ...blank(), feeTrack: false, ...rest };
    startFeeTrack(next);
    next.assigns.forEach((a) => { if (a.status === "standby") a.status = "asked"; });
    const previousPhotos = Object.fromEntries(photos);
    await photoDb.replace(savedPhotos);
    try { localStorage.setItem(KEY, JSON.stringify(next)); }
    catch (error) { await photoDb.replace(previousPhotos); throw new Error("휴대폰 저장 공간이 부족해 복원하지 못했어요. 기존 자료를 유지했어요."); }
    state = next; localLoadError = false; photosReadError = false;
    photos.clear(); Object.entries(savedPhotos).forEach(([id, url]) => photos.set(id, url));
    window.DawonBackup?.changed(); render();
  };
  $("#import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!isValidData(data)) throw new Error("bad");
      if (!(await ask({ title: "백업 파일을 불러올까요?", text: `지금 휴대폰의 자료가 백업 내용으로 바뀌어요.\n(사람 ${data.workers.length}명, 일감 ${data.jobs.length}건)`, ok: "불러오기", danger: true }))) return;
      doBackup();
      await restoreData(data);
      toast("백업을 불러왔어요");
    } catch (error) {
      showError(error.message === "bad" || error instanceof SyntaxError ? "다원 백업 파일이 아니에요. 파일을 확인해 주세요." : error.message || "백업을 불러오지 못했어요. 저장 공간을 확인해 주세요.");
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
          goTab("people");
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
  // 연습용인지 알아보기: demo 표시가 있거나, 예전 버전에서 넣은 예시 이름("(예시)", "예시 ")
  const isDemoWorker = (w) => Boolean(w.demo || /\(예시\)$/.test(w.name || "") || (w.name || "").startsWith("예시 "));
  const isDemoRest = (r) => Boolean(r.demo || (r.name || "").startsWith("예시 "));
  const demoRestIds = () => new Set(state.restaurants.filter(isDemoRest).map((r) => r.id));
  const isDemoJob = (j, restIds = demoRestIds()) => Boolean(j.demo || restIds.has(j.restaurantId));
  const demoCount = () => {
    const ids = demoRestIds();
    const workers = state.workers.filter(isDemoWorker).length;
    const restaurants = ids.size;
    const jobs = state.jobs.filter((j) => isDemoJob(j, ids)).length;
    return { workers, restaurants, jobs, total: workers + restaurants + jobs };
  };
  // 연습용 자료만 지우기: 연습 구직자·식당·일감과 그에 딸린 연락 기록만 지우고 실제 자료는 남김
  const clearDemo = () => {
    const restIds = demoRestIds();
    const jobIds = new Set(state.jobs.filter((j) => isDemoJob(j, restIds)).map((j) => j.id));
    const workerIds = new Set(state.workers.filter(isDemoWorker).map((w) => w.id));
    state.assigns = state.assigns.filter((a) => !jobIds.has(a.jobId) && !workerIds.has(a.workerId));
    state.jobs = state.jobs.filter((j) => !jobIds.has(j.id));
    workerIds.forEach((id) => removePhoto(id));
    state.workers = state.workers.filter((w) => !workerIds.has(w.id));
    // 실제 일감이 걸려 있는 식당은 남겨 둠 (실수로 예시 식당에 실제 일감을 넣은 경우)
    const used = new Set(state.jobs.map((j) => j.restaurantId));
    state.restaurants = state.restaurants.filter((r) => !restIds.has(r.id) || used.has(r.id));
  };

  // 연습용 예시 자료: 구직자 20명, 식당 20곳, 지난 기록과 앞으로의 일감 몇 개
  // (이름에 '(예시)'를 붙이고, 전화번호는 쓰지 않는 번호 모양 010-0000-00xx / 02-0000-00xx)
  const seed = () => {
    const pad = (n) => String(n).padStart(2, "0");
    const RESTS = [
      ["예시 한식당", "종로", "서울 종로구 종로 1"], ["예시 국밥집", "마포", "서울 마포구 양화로 45"],
      ["예시 고깃집", "강남", "서울 강남구 테헤란로 10"], ["예시 분식집", "종로", "서울 종로구 삼일대로 300"],
      ["예시 칼국수", "마포", "서울 마포구 월드컵로 20"], ["예시 백반집", "강남", "서울 강남구 강남대로 400"],
      ["예시 횟집", "송파", "서울 송파구 올림픽로 50"], ["예시 중식당", "송파", "서울 송파구 송파대로 100"],
      ["예시 일식당", "강남", "서울 강남구 논현로 80"], ["예시 감자탕", "영등포", "서울 영등포구 여의대로 10"],
      ["예시 순대국", "영등포", "서울 영등포구 영중로 30"], ["예시 냉면집", "종로", "서울 종로구 율곡로 50"],
      ["예시 닭갈비", "마포", "서울 마포구 와우산로 30"], ["예시 보쌈집", "송파", "서울 송파구 백제고분로 70"],
      ["예시 해장국", "구미", "경북 구미시 송정대로 55"], ["예시 삼계탕", "구미", "경북 구미시 신비로 19"],
      ["예시 쌈밥집", "구미", "경북 구미시 낙동강변로 889"], ["예시 뷔페", "분당", "경기 성남시 분당구 판교역로 166"],
      ["예시 구내식당", "분당", "경기 성남시 분당구 황새울로 300"], ["예시 돈가스", "분당", "경기 성남시 분당구 정자일로 95"],
    ];
    const R = RESTS.map(([name, area, address], i) => ({ id: uid(), name, area, phone: `02-0000-00${pad(i + 1)}`, address, addrDetail: i % 3 === 0 ? `${(i % 4) + 1}층` : "", way: "", memo: "", demo: true }));
    const PEOPLE = [
      ["김영희", ["찬모"], "종로"], ["이순자", ["서빙"], "마포"], ["박말순", ["설거지"], "강남"], ["최정숙", ["찬모", "설거지"], "송파"],
      ["정미자", ["서빙", "설거지"], "영등포"], ["강옥순", ["찬모"], "구미"], ["조영자", ["서빙"], "분당"], ["윤복희", ["설거지", "기타"], "종로"],
      ["장경자", ["찬모", "서빙"], "마포"], ["임순이", ["서빙"], "강남"], ["한정희", ["찬모"], "송파"], ["오금순", ["설거지"], "영등포"],
      ["서명숙", ["서빙", "설거지"], "구미"], ["신옥자", ["찬모"], "분당"], ["권혜숙", ["기타"], "종로"], ["황점순", ["서빙"], "마포"],
      ["안미경", ["찬모", "설거지"], "강남"], ["송순덕", ["설거지"], "송파"], ["전영순", ["서빙", "기타"], "구미"], ["홍정자", ["찬모", "서빙"], "분당"],
    ];
    const W = PEOPLE.map(([name, roles, area], i) => ({ id: uid(), name: `${name}(예시)`, phone: `010-0000-00${pad(i + 1)}`, roles, area, memo: i % 5 === 0 ? "오전만 가능" : "", joined: today(-30 - i * 3), active: true, demo: true }));
    const J = [];
    const A = [];
    const job = (o) => ({ id: uid(), demo: true, start: "10:00", end: "18:00", breakMin: 60, hourly: 12000, nightHourly: 0, headcount: 1, memo: "", ...o, pay: payBreakdown(o.start || "10:00", o.end || "18:00", o.breakMin ?? 60, o.hourly || 12000, 0).pay });
    // 지난 기록: 사람마다 다른 약속 기록 (출근·직전 취소·안 나옴·식당이 또 찾음)
    const HIST = [
      ["done", "done", "done", "done"], ["done", "late"], ["done", "done", "done"], ["noshow", "done", "noshow"], ["done"],
      [], ["done", "done"], ["late", "late", "done"], ["done", "done", "done", "done", "done"], ["done"],
      ["noshow"], ["done", "done", "late"], [], ["done", "done", "done"], ["done", "noshow"],
      ["done"], ["done", "done", "done", "done"], [], ["late"], ["done", "done"],
    ];
    W.forEach((w, i) => HIST[i].forEach((o, k) => {
      const j = job({ restaurantId: R[(i + k) % R.length].id, role: w.roles[0], date: today(-(k * 4 + (i % 4) + 2)) });
      J.push(j);
      A.push({ id: uid(), demo: true, jobId: j.id, workerId: w.id, status: o === "done" ? "confirmed" : "canceled", outcome: o, fee: o === "done" ? Math.round(j.pay * state.feeRate / 100) : 0, rehire: o === "done" && k === 0 && i % 2 === 0, paid: o === "done" && !((k === 0 && i % 4 === 1) || (k === 1 && i === 8)) });
    }));
    // 앞으로의 일감: 오늘·내일, 같은 요청(찬모+서빙), 밤 근무, 여러 날 연속
    J.push(job({ restaurantId: R[0].id, role: "찬모", date: today(), memo: "점심·저녁 준비" }));
    const req = uid();
    J.push(job({ restaurantId: R[2].id, role: "찬모", date: today(1), start: "09:00", end: "18:00", req }));
    J.push(job({ restaurantId: R[2].id, role: "서빙", date: today(1), start: "11:00", end: "16:00", breakMin: 0, headcount: 2, req }));
    J.push(job({ restaurantId: R[6].id, role: "설거지", date: today(1), start: "18:00", end: "23:00", breakMin: 0 }));
    const g = uid();
    [1, 2, 3].forEach((n) => J.push(job({ restaurantId: R[14].id, role: "서빙", date: today(n), start: "07:00", end: "15:00", group: g })));
    // 어제 확정했는데 출근 체크를 안 한 예시
    const y = job({ restaurantId: R[1].id, role: "서빙", date: today(-1), start: "11:00", end: "15:00", breakMin: 0 });
    J.push(y);
    A.push({ id: uid(), demo: true, jobId: y.id, workerId: W[1].id, status: "confirmed", outcome: "", fee: 0, rehire: false });
    state.restaurants.push(...R);
    state.workers.push(...W);
    state.jobs.push(...J);
    state.assigns.push(...A);
    refresh();
    toast("연습용 자료를 넣었어요 (사람 20명, 식당 20곳)");
    // 연습용 프로필 사진 (AI로 만든 가상 인물, demo-photos 폴더) — 받아지는 대로 넣고 다시 그림
    Promise.all(W.map(async (w, i) => {
      try {
        const res = await fetch(`demo-photos/p${pad(i + 1)}.jpg`);
        if (!res.ok) return;
        const blob = await res.blob();
        const url = await new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = no; fr.readAsDataURL(blob); });
        await setPhoto(w.id, url);
      } catch (_) {}
    })).then(() => render());
  };

  // ---------- 버튼 누름 처리 ----------
  const actions = {
    "new-job": () => jobForm(),
    "add-role": (el) => {
      const j = job(el.dataset.id);
      if (!j) return;
      // 고른 날짜들에 같은 요청 번호를 붙이고 업무 추가 창을 엶
      const openFor = (days) => {
        const reqByDate = {};
        days.forEach((x) => { if (!x.req) x.req = uid(); reqByDate[x.date] = x.req; });
        save();
        jobForm(null, { restaurantId: j.restaurantId, dates: days.map((x) => x.date), start: j.start, end: j.end, breakMin: j.breakMin, reqByDate });
      };
      const days = groupOf(j);
      if (days.length < 2) { openFor([j]); return; }
      // 여러 날 일감이면 먼저 "이 날만 / 모든 날"을 물어봄
      openSheet({
        title: "업무 추가",
        body: `<p>어느 날에 업무를 더할까요?</p><div class="choice-list">
          <label class="choice"><input type="radio" name="scope" value="one" checked /><span><strong>이 날만</strong><small>${esc(shortDate(j.date))}</small></span></label>
          <label class="choice"><input type="radio" name="scope" value="all" /><span><strong>모든 날</strong><small>${days.map((x) => esc(shortDate(x.date))).join(", ")} (${days.length}일)</small></span></label></div>`,
        submit: "다음",
        onSubmit: (fd) => { openFor(val(fd, "scope") === "all" ? days : [j]); return false; },
      });
    },
    "edit-job": (el) => {
      const j = job(el.dataset.id);
      if (!j) return;
      const later = groupOf(j).filter((x) => !x.canceled && x.date >= j.date);
      if (later.length < 2) { jobForm(j); return; }
      // 여러 날 일감: 식당 취소와 같은 방식으로 먼저 물어봄
      openSheet({
        title: "일감 고치기",
        body: `<p>어느 날을 고칠까요?</p><div class="choice-list">
          <label class="choice"><input type="radio" name="scope" value="one" checked /><span><strong>이 날만</strong><small>${esc(shortDate(j.date))}</small></span></label>
          <label class="choice"><input type="radio" name="scope" value="all" /><span><strong>남은 날 모두</strong><small>${later.map((x) => esc(shortDate(x.date))).join(", ")} (${later.length}일) · 바꾼 칸만 똑같이 바뀌어요</small></span></label></div>`,
        submit: "다음",
        onSubmit: (fd) => { jobForm(j, null, val(fd, "scope") === "all" ? "all" : "one"); return false; },
      });
    },
    "open-job": (el) => {
      if (sheet.open) sheet.close();
      // 1·2·3일째, 업무 탭(같은 묶음)끼리는 쌓지 않고 바꿔치기
      const cur = route.name === "job" ? job(route.id) : null;
      const sibling = cur && [...groupOf(cur), ...reqOf(cur)].some((x) => x.id === el.dataset.id);
      go({ name: "job", id: el.dataset.id }, { replace: Boolean(sibling) });
    },
    "del-job": async (el) => {
      const j = job(el.dataset.id);
      if (!j || !(await ask({ title: "이 일감을 지울까요?", text: `${dateText(j.date)} ${restName(j)} ${j.role}\n연락·확정 기록도 함께 지워져요.`, ok: "지우기", danger: true }))) return;
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
    "del-worker": async (el) => {
      const w = worker(el.dataset.id);
      if (!w || !(await ask({ title: `${w.name}님을 완전히 지울까요?`, text: "출근·수수료 기록까지 모두 지워지고 되돌릴 수 없어요.\n기록을 남기려면 '명단에서 숨기기'를 쓰세요.", ok: "완전히 지우기", danger: true }))) return;
      state.workers = state.workers.filter((x) => x.id !== w.id);
      state.assigns = state.assigns.filter((a) => a.workerId !== w.id);
      removePhoto(w.id);
      save();
      history.back();
      toast("지웠어요");
    },
    "new-rest": () => restForm(),
    "edit-rest": (el) => restForm(rest(el.dataset.id)),
    "del-rest": async (el) => {
      const r = rest(el.dataset.id);
      if (state.jobs.some((j) => j.restaurantId === r.id)) { toast("일감 기록이 있는 식당은 지울 수 없어요"); return; }
      if (!(await ask({ title: `${r.name}${hasBatchim(r.name) ? "을" : "를"} 지울까요?`, ok: "지우기", danger: true }))) return;
      state.restaurants = state.restaurants.filter((x) => x.id !== r.id);
      sheet.close();
      refresh();
    },
    "add-assign": (el) => {
      if (el.dataset.v === "confirmed") { confirmFlow(el.dataset.worker, el.dataset.job); return; }
      addAssign(el.dataset.worker, el.dataset.job, el.dataset.v); render();
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
    "undo-assign": (el) => { const a = assign(el.dataset.id); a.status = "confirmed"; a.outcome = ""; a.fee = 0; a.rehire = false; a.paid = false; a.actStart = ""; a.actEnd = ""; refresh(); toast("확정 상태로 되돌렸어요"); },
    // 수수료 받음 표시 / 취소
    "toggle-paid": (el) => {
      const a = assign(el.dataset.id);
      a.paid = !a.paid;
      a.paidAt = a.paid ? today() : "";
      refresh();
      toast(a.paid ? `수수료 ${won(a.fee)} 받음으로 표시했어요` : "받음 표시를 취소했어요");
    },
    // 이 사람의 안 받은 수수료를 모두 받음으로
    "pay-all": async (el) => {
      const list = unpaidList(el.dataset.id);
      if (!list.length) return;
      if (list.length > 1 && !(await ask({ title: `${list[0].w.name}님 수수료를 모두 받았나요?`, text: `${list.length}건 · ${won(feeSumOf(list))}`, ok: "모두 받음", cancel: "아니요" }))) return;
      list.forEach(({ a }) => { a.paid = true; a.paidAt = today(); });
      refresh();
      toast(`${won(feeSumOf(list))} 받음으로 표시했어요`);
    },
    // 신뢰 표시 직접 고르기 ("" = 자동)
    "set-trust": (el) => {
      const w = worker(el.dataset.id);
      w.trust = el.dataset.v;
      refresh();
      toast(w.trust ? `'${MANUAL_TRUST[w.trust].label}'${hasBatchim(MANUAL_TRUST[w.trust].label) ? "으로" : "로"} 정했어요` : "기록을 보고 자동으로 정해요");
    },
    "save-account": () => { state.account = $("#fee-account").value.trim(); refresh(); toast(state.account ? "계좌를 저장했어요" : "계좌를 지웠어요"); },
    "toggle-rehire": (el) => { const a = assign(el.dataset.id); a.rehire = !a.rehire; refresh(); },
    // 실제 근무 시간 고치기: 약속보다 더/덜 일했을 때 그 사람만 일당·수수료 다시 계산
    "actual-time": (el) => {
      const a = assign(el.dataset.id);
      const j = a && job(a.jobId);
      const w = a && worker(a.workerId);
      if (!j || !w) return;
      const cur = effJob(a, j);
      openSheet({
        title: `${w.name}님 실제 근무 시간`,
        body: `<p class="hint" style="margin:0 0 16px">약속: ${esc(korRange(j))}</p>
          <div class="field">시작${timePicker("start", cur.start)}</div>
          <div class="field">끝${timePicker("end", cur.end)}</div>
          <div class="pay-calc" id="act-calc"></div>
          ${a.actStart || a.actEnd ? `<button type="button" class="link-btn" style="margin-top:14px" data-act="actual-reset" data-id="${a.id}">약속 시간으로 되돌리기</button>` : ""}`,
        submit: "저장",
        onReady: (form) => {
          const calc = () => {
            const start = form.elements.start.value;
            const end = form.elements.end.value;
            const box = $("#act-calc", form);
            if (!start || !end) { box.textContent = ""; return; }
            if (start === end) { box.innerHTML = `<span class="overdue">시작과 끝 시간이 같아요. 끝 시간을 다시 골라 주세요.</span>`; return; }
            const min = workMinutes(start, end, j.breakMin);
            // 16시간이 넘으면 끝 시간을 잘못 고른 경우가 많아서 확인 안내 (밤을 넘긴 근무는 그대로 계산)
            const longNote = min > 16 * 60 ? `<br><span class="overdue">${hoursText(min)} 근무예요. 끝 시간이 맞는지 확인해 주세요.</span>` : "";
            const diff = min - workMinutes(j.start, j.end, j.breakMin);
            const diffText = diff ? ` (약속보다 ${hoursText(Math.abs(diff))} ${diff > 0 ? "더" : "덜"})` : "";
            if (!j.hourly) { box.innerHTML = `근무 ${hoursText(min)}${diffText} · 시급이 없어서 일당은 그대로예요${longNote}`; return; }
            const pay = payBreakdown(start, end, j.breakMin, j.hourly, j.nightHourly || 0, j.holiday).pay;
            // 비교 기준: 저장된 일당이 아니라 '약속 시간 × 시급'으로 다시 계산한 값 (시간을 안 바꾸면 차이 0)
            const base = payBreakdown(j.start, j.end, j.breakMin, j.hourly, j.nightHourly || 0, j.holiday).pay;
            const gap = pay - base;
            box.innerHTML = `${won(j.hourly)} × ${hoursText(min)}${diffText}<br><strong>일당 ${won(pay)}</strong>${gap ? ` · 약속보다 ${gap > 0 ? "+" : "−"}${won(Math.abs(gap))}` : ""}${longNote}`;
          };
          // 시·분을 고르면 숨은 칸에 "HH:MM"으로 넣음
          form.querySelectorAll(".time-pick").forEach((wrap) => wrap.addEventListener("change", () => {
            const h = wrap.querySelector('[data-part="h"]').value;
            const m = wrap.querySelector('[data-part="m"]').value;
            form.elements[wrap.dataset.time].value = h === "" ? "" : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            calc();
          }));
          calc();
        },
        onSubmit: (fd) => {
          const start = val(fd, "start");
          const end = val(fd, "end");
          if (!start || !end) { toast("시작·끝 시간을 골라 주세요"); return false; }
          if (start === end) { toast("시작과 끝 시간이 같아요. 끝 시간을 다시 골라 주세요"); return false; }
          a.actStart = start !== j.start ? start : "";
          a.actEnd = end !== j.end ? end : "";
          if (a.outcome === "done") a.fee = feeOf(a, j);
          refresh();
          const ex = extraMin(a, j);
          toast(ex ? `${hoursText(Math.abs(ex))} ${ex > 0 ? "연장" : "줄어듦"}으로 고쳤어요${a.outcome === "done" ? ` · 수수료 ${won(a.fee)}` : ""}` : "약속 시간 그대로예요");
        },
      });
    },
    "actual-reset": (el) => {
      const a = assign(el.dataset.id);
      const j = a && job(a.jobId);
      if (!j) return;
      a.actStart = ""; a.actEnd = "";
      if (a.outcome === "done") a.fee = feeOf(a, j);
      sheet.close();
      refresh();
      toast("약속 시간으로 되돌렸어요");
    },
    // 식당이 취소했어요: 이 날만 / 남은 날 모두 → 확정·연락한 분을 한 번에 '식당 사정 취소' → 취소 안내 문자
    "rest-cancel": async (el) => {
      const j = job(el.dataset.id);
      if (!j) return;
      // 고를 수 있는 날: 아직 취소 안 된 날 중 오늘 이후 (지금 연 날은 항상 포함)
      const days = groupOf(j).filter((x) => !x.canceled && (x.date >= today() || x.id === j.id));
      const doCancel = (targets) => {
        const hit = new Map(); // 사람별 취소된 일감들
        targets.forEach((x) => {
          x.canceled = true;
          x.canceledAt = today();
          assignsOf(x.id).filter((a) => a.status === "confirmed" || a.status === "asked").forEach((a) => {
            setOutcome(a, "rest_cancel");
            const w = worker(a.workerId);
            if (w) { if (!hit.has(w.id)) hit.set(w.id, { w, jobs: [] }); hit.get(w.id).jobs.push(x); }
          });
        });
        refresh();
        // 바로 안내 문자를 보낼 수 있게 목록을 띄움
        const list = [...hit.values()];
        openSheet({
          title: "식당 취소로 표시했어요",
          body: list.length
            ? `<p>취소된 분들에게 안내 문자를 보내 주세요. 기록에 불이익은 없어요.</p><div class="card" style="padding:16px">${list.map(({ w, jobs }) => cancelRow(w, jobs)).join("")}</div>`
            : `<p>확정·연락했던 분이 없어서 안내할 사람이 없어요.</p>`,
        });
      };
      if (days.length > 1) {
        // 날짜마다 체크: 지금 연 날만 미리 체크, [모두 선택]으로 한 번에
        const dayInfo = (x) => {
          const names = confirmedOf(x).map((a) => worker(a.workerId)?.name).filter(Boolean);
          return `${esc(x.role)} · ${names.length ? esc(names.join(", ")) : "확정된 분 없음"}`;
        };
        openSheet({
          title: "식당이 취소했어요",
          body: `<div class="pick-all-row"><p>취소할 날을 모두 골라 주세요.</p><button type="button" class="btn" data-cancel-all>모두 선택</button></div>
            <div class="choice-list">${days.map((x) => `<label class="choice"><input type="checkbox" name="day" value="${x.id}" ${x.id === j.id ? "checked" : ""} /><span><strong>${groupOf(j).indexOf(x) + 1}일째 · ${esc(shortDate(x.date))}</strong><small>${dayInfo(x)}</small></span></label>`).join("")}</div>`,
          submit: "취소로 표시",
          onReady: (form) => {
            const allBtn = form.querySelector("[data-cancel-all]");
            const boxes = [...form.querySelectorAll("input[name=day]")];
            const sync = () => { allBtn.textContent = boxes.every((b) => b.checked) ? "모두 해제" : "모두 선택"; };
            allBtn.addEventListener("click", () => { const on = !boxes.every((b) => b.checked); boxes.forEach((b) => { b.checked = on; }); sync(); });
            boxes.forEach((b) => b.addEventListener("change", sync));
          },
          onSubmit: (fd) => {
            const picked = fd.getAll("day").map(String);
            if (!picked.length) { toast("취소할 날을 골라 주세요"); return false; }
            doCancel(days.filter((x) => picked.includes(x.id)));
            return false;
          },
        });
        return;
      }
      if (!(await ask({ title: "식당이 취소했나요?", text: `${shortDate(j.date)} ${restName(j)} ${j.role}\n확정·연락한 분들은 '식당 사정 취소'로 바뀌고, 기록에 불이익은 없어요.`, ok: "취소로 표시", danger: true }))) return;
      doCancel([j]);
    },
    // 확정된 분 카드의 [⋯] 더보기: 가끔 쓰는 일을 아래에서 올라오는 목록으로
    "more-actions": (el) => {
      const a = assign(el.dataset.id);
      const j = a && job(a.jobId);
      const w = a && worker(a.workerId);
      if (!j || !w) return;
      const { more } = rowActions(a, j, w);
      openSheet({ title: `${w.name}님`, body: `<div class="menu more-menu">${more.map(moreItem(a)).join("")}</div>` });
    },
    "copy-rest-msg": (el) => { const a = assign(el.dataset.id); copyText(restMsg(job(a.jobId), worker(a.workerId))); },
    "show-more": (el) => { ui.showAll[el.dataset.id] = true; render(); },
    "jobs-mode": (el) => { ui.jobsMode = el.dataset.v; render(); },
    "people-mode": (el) => { ui.peopleMode = el.dataset.v; ui.peopleQuery = ""; render(); },
    "role-filter": (el) => { ui.peopleRole = el.dataset.v; render(); },
    "copy-script": (el) => copyText(state.scripts.find((s) => s.id === el.dataset.id)?.text || ""),
    "edit-script": (el) => scriptForm(state.scripts.find((s) => s.id === el.dataset.id)),
    "new-script": () => scriptForm(),
    "del-script": async (el) => { if (!(await ask({ title: "이 문구를 지울까요?", ok: "지우기", danger: true }))) return; state.scripts = state.scripts.filter((s) => s.id !== el.dataset.id); sheet.close(); refresh(); },
    "backup": doBackup,
    // 일감 카드의 [⋯]: 가끔 쓰는 고치기·업무 추가
    "job-more": (el) => {
      const id = el.dataset.id;
      const row = (act, ic, label) => `<button type="button" class="menu-row" data-act="${act}" data-id="${id}" data-close><span class="menu-ic">${icon(ic)}</span><span class="menu-text"><strong>${label}</strong></span></button>`;
      openSheet({ title: "일감", body: `<div class="menu more-menu">${row("edit-job", "edit", "일감 고치기")}${row("add-role", "plus", "같은 식당·날짜로 업무 추가")}</div>` });
    },
    // 홈 맨 위 수수료 줄 → 아래 '받을 수수료' 목록으로 내려가기
    "go-fee": () => document.getElementById("fee-sec")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }),
    "import": () => $("#import-file").click(),
    "import-vcf": () => $("#vcf-file").click(),
    "save-rates": () => {
      const n = (id) => Number(String($(`#${id}`)?.value || "").replace(/[^0-9]/g, "")) || 0;
      state.rate = { day: n("rate-d"), night: n("rate-n") };
      refresh();
      toast("기본 시급을 저장했어요. 다음 일감부터 자동으로 들어가요");
    },
    "rate-x": (el) => {
      const day = Number(String($("#rate-d").value).replace(/[^0-9]/g, ""));
      if (!day) { toast("낮 시급을 먼저 넣어 주세요"); $("#rate-d").focus(); return; }
      $("#rate-n").value = Math.round(day * 1.5);
    },
    "save-fee": () => { const n = Number($("#fee-rate").value); if (!(n >= 0 && n <= 100)) { toast("0~100 사이로 적어 주세요"); return; } state.feeRate = n; refresh(); toast("저장했어요"); },
    "seed": async () => {
      const hasData = state.workers.length || state.jobs.length;
      if (hasData && !(await ask({ title: "연습용 자료를 넣을까요?", text: "지금 자료에 연습용 사람 20명·식당 20곳이 더해져요.\n이름에 (예시)가 붙고, 나중에 '연습용 자료만 지우기'로 지울 수 있어요.", ok: "넣기", cancel: "안 넣기" }))) return;
      seed();
    },
    "clear-demo": async () => {
      const c = demoCount();
      if (!c.total) { toast("지울 연습용 자료가 없어요"); return; }
      if (!(await ask({ title: "연습용 자료만 지울까요?", text: `사람 ${c.workers}명, 식당 ${c.restaurants}곳, 일감 ${c.jobs}건\n실제로 넣은 자료는 그대로 남아요.`, ok: "지우기", danger: true }))) return;
      clearDemo();
      refresh();
      toast("연습용 자료만 지웠어요");
    },
    "wipe": async () => {
      if (!(await ask({ title: "모든 자료를 지울까요?", text: "사람·식당·일감·수수료 기록이 모두 사라져요.\n백업 파일이 없으면 되돌릴 수 없어요.", ok: "모두 지우기", danger: true }))) return;
      if (!(await ask({ title: "한 번 더 확인할게요", text: "정말 모두 지울까요?", ok: "모두 지우기", danger: true }))) return;
      state = blank();
      photos.clear();
      photoDb.clear().catch(() => {});
      refresh();
      toast("모두 지웠어요");
    },
  };
  document.addEventListener("click", (e) => {
    const tab = e.target.closest(".tabbar [data-tab]");
    if (tab) { if (route.name !== tab.dataset.tab) goTab(tab.dataset.tab); return; }
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
  let photosLoaded = false, photosReadError = false;
  const photosReady = photoDb.all()
    .then((list) => list.forEach(([id, url]) => photos.set(id, url)))
    .catch(() => { photosReadError = true; throw new Error("사진 저장소를 읽지 못했어요. 백업을 멈췄으니 휴대폰 저장 공간을 확인해 주세요."); })
    .finally(() => { photosLoaded = true; });
  window.DawonBackup?.init({
    snapshot: async () => {
      await photosReady.catch(() => {});
      if (photosReadError) throw new Error("사진 저장소를 읽지 못해 자동 백업을 멈췄어요. 저장 공간을 확인해 주세요.");
      if (localLoadError) throw new Error("휴대폰 자료를 읽지 못해 자동 백업을 멈췄어요. 기존 백업에서 복원해 주세요.");
      return structuredClone({ ...state, photos: Object.fromEntries(photos) });
    },
    restore: restoreData,
    checkpoint: async () => { await photosReady.catch(() => {}); return { data: structuredClone({ ...state, photos: Object.fromEntries(photos) }), rawState: localStorage.getItem(KEY), unreadable: localLoadError || photosReadError }; },
    confirm: (data) => ask({ title: "백업 자료로 바꿀까요?", text: `사람 ${data.workers.length}명 · 일감 ${data.jobs.length}건으로 바뀌어요. 복원 전 자료는 휴대폰에 따로 남겨 둡니다.`, ok: "복원", danger: true }),
  });
  Promise.race([photosReady.catch((e) => showError(e.message)), new Promise((r) => setTimeout(r, 800))]).then(() => {
    const late = !photosLoaded;
    render();
    // 사진이 늦게 왔을 때만 한 번 더 그림 (제때 왔으면 다시 그리지 않아 첫 움직임이 끊기지 않음)
    if (late) photosReady.then(() => { if (photos.size) render(); }).catch((e) => showError(e.message));
    if (localLoadError) showError("저장된 자료를 읽지 못했어요. 백업에서 복원하기 전까지 새 자료 입력을 멈춰 주세요.");
  });
})();
