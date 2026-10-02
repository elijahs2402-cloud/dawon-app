(() => {
  "use strict";

  // 저장소 이름(KEY): 휴대폰 브라우저 안에 자료를 저장할 때 쓰는 이름
  const KEY = "dawon-mobile-v1";
  // 업무 종류(ROLES)
  const ROLES = ["찬모", "서빙", "설거지", "기타"];

  // ---------- 작은 도구들 ----------
  const $ = (selector, root = document) => root.querySelector(selector);
  // esc: 화면에 글자를 안전하게 넣기 위한 변환
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
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
  const statLine = (s) => `✔${s.done} ⚠${s.late} ✖${s.noshow}${s.rehire ? ` ♥${s.rehire}` : ""}`;
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
      .map((x) => ({ ...x, near: Boolean(r?.area && x.w.area && r.area.trim() === x.w.area.trim()), busy: busyFor(x.w.id, j) }))
      .sort((x, y) => (x.busy - y.busy) || (x.t.level - y.t.level) || (Number(y.near) - Number(x.near)) || byPriority(x, y));
  };
  // 업무별 대기 순서에서 몇 번째인지 (재촉 전화 받을 때 확인용)
  const rankIn = (role, workerId) => {
    const list = ranked(state.workers.filter((w) => w.active !== false && (w.roles || []).includes(role))).sort(byPriority);
    return { pos: list.findIndex((x) => x.w.id === workerId) + 1, total: list.length };
  };

  // ---------- 문자 내용 ----------
  const offerMsg = (j, w) => { const r = rest(j.restaurantId); return `[다원] ${w.name}님~ ${dateText(j.date)} ${j.start}~${j.end} ${r?.name || ""}${r?.area ? `(${r.area})` : ""} ${j.role} 일 있어요. 일당 ${won(j.pay)}. 가능하시면 연락 주세요 😊`; };
  const confirmMsg = (j, w) => { const r = rest(j.restaurantId); return `[다원] ${w.name}님 확정됐어요! ${dateText(j.date)} ${j.start}까지 ${r?.name || ""} 가시면 돼요.${r?.address ? ` 주소: ${r.address}.` : ""}${r?.phone ? ` 식당 전화: ${r.phone}.` : ""} 혹시 못 가시게 되면 꼭 미리 알려주세요 🙏`; };
  const restMsg = (j, w) => `[다원] 사장님, ${dateText(j.date)} ${j.role} ${w.name}님 보내드려요. ${j.start} 출근입니다.${w.phone ? ` 연락처: ${w.phone}` : ""}`;
  const standbyMsg = (j, w) => `[다원] ${w.name}님, ${dateText(j.date)} ${restName(j)} ${j.role} 대기 부탁드려요. 빈자리 생기면 바로 연락드릴게요. 대기해 주시면 다음 일 먼저 챙겨드려요 😊`;

  // ---------- 알림(토스트) ----------
  let toastTimer;
  const toast = (msg) => {
    const box = $("#toast");
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
  const openSheet = ({ title, body, submit = "저장", onSubmit, onReady }) => {
    sheetForm.innerHTML = `<div class="sheet-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="닫기">✕</button></div>
      <div class="sheet-body">${body}</div>
      <div class="sheet-foot"><button type="button" class="btn ghost" data-close>닫기</button>${onSubmit ? `<button type="submit" class="btn primary">${esc(submit)}</button>` : ""}</div>`;
    sheetSubmit = onSubmit || null;
    sheet.showModal();
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
  // 바깥 어두운 부분을 누르면 닫기
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });

  // ---------- 화면 이동 ----------
  let route = { name: "home" };
  const ui = { peopleMode: "workers", peopleQuery: "", peopleRole: "", jobsMode: "upcoming", showAll: {} };
  const go = (next) => {
    route = next;
    history.pushState(next, "");
    render();
    window.scrollTo(0, 0);
  };
  window.addEventListener("popstate", (e) => {
    route = e.state || { name: "home" };
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
    return `<button class="job-card ${need ? "need" : "full"} ${past ? "past" : ""}" data-act="open-job" data-id="${j.id}">
      <div class="job-when">${esc(dateText(j.date))} · ${esc(j.start)}~${esc(j.end)}</div>
      <div class="job-what"><strong>${esc(restName(j))}</strong><span class="role">${esc(j.role)}</span></div>
      <div class="job-state">${need ? `<span class="pill need">${need}명 더 필요</span>` : `<span class="pill ok">인원 다 참</span>`}
      <span class="muted">확정 ${conf}/${esc(j.headcount)}명${sb ? ` · 대기 ${sb}명` : ""}</span></div></button>`;
  };
  const sortJobs = (a, b) => a.date.localeCompare(b.date) || (a.start || "").localeCompare(b.start || "");

  // 근무 날이 지났는데 출근 여부를 아직 안 적은 사람들
  const pendingChecks = () => state.assigns
    .filter((a) => a.status === "confirmed" && !a.outcome)
    .map((a) => ({ a, j: job(a.jobId), w: worker(a.workerId) }))
    .filter((x) => x.j && x.w && x.j.date <= today())
    .sort((x, y) => sortJobs(x.j, y.j));

  const checkRow = ({ a, j, w }) => `<div class="check-row">
      <div><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>
      <span class="muted small">${esc(dateText(j.date))} · ${esc(restName(j))} ${esc(j.role)}</span></div>
      <div class="btn-row three">
        <button class="btn ok" data-act="outcome" data-id="${a.id}" data-v="done">✔ 출근함</button>
        <button class="btn warn" data-act="cancel-ask" data-id="${a.id}">⚠ 취소</button>
        <button class="btn bad" data-act="outcome" data-id="${a.id}" data-v="noshow">✖ 안 나옴</button>
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

    let html = `<div class="big-actions">
        <button class="btn primary big" data-act="new-job">＋ 일감 받기</button>
        <button class="btn big" data-act="new-worker">＋ 사람 등록</button>
      </div>`;

    if (!hasData) {
      html += `<h2>처음 오셨네요 😊</h2><div class="card"><p>1. <strong>＋ 사람 등록</strong>으로 구직자를 적어 주세요.</p><p>2. 식당에서 전화가 오면 <strong>＋ 일감 받기</strong>를 누르세요.</p><p>3. 일감 화면에서 추천 순서대로 연락하고 <strong>확정</strong>을 누르면 끝이에요.</p>
        <p class="muted small">먼저 연습해 보고 싶으면 아래 '백업' 메뉴에서 연습용 예시 자료를 넣을 수 있어요.</p></div>`;
      return html;
    }
    if (backupDays === null || backupDays >= 7) {
      html += `<div class="banner warn" style="margin-top:14px">💾 ${backupDays === null ? "아직 백업을 한 번도 안 했어요." : `마지막 백업이 ${backupDays}일 전이에요.`}<br>휴대폰을 잃어버려도 괜찮도록 백업해 두세요.<button class="btn" data-act="backup">지금 백업하기</button></div>`;
    }
    html += `<h2>사람이 필요해요 <span class="count">${needJobs.length}</span></h2>`;
    html += needJobs.length ? needJobs.map(jobCard).join("") : `<div class="empty">빈자리가 없어요 👍</div>`;
    if (checks.length) {
      html += `<h2>출근했는지 체크해 주세요 <span class="count">${checks.length}</span></h2><div class="card">${checks.map(checkRow).join("")}</div>`;
    }
    html += `<h2>오늘·내일 확정된 일</h2>`;
    html += fullJobs.length ? fullJobs.map(jobCard).join("") : `<div class="empty">아직 없어요</div>`;
    html += `<h2>이번 달</h2><div class="month"><div><small>출근 완료</small><strong>${doneThisMonth.length}건</strong></div><div><small>수수료 (${esc(state.feeRate)}%)</small><strong>${feeSum.toLocaleString("ko-KR")}원</strong></div></div>`;
    return html;
  };

  // ---------- 화면: 일감 목록 ----------
  const renderJobs = () => {
    const upcoming = ui.jobsMode === "upcoming";
    const list = state.jobs.filter((j) => (upcoming ? j.date >= today() : j.date < today())).sort(sortJobs);
    if (!upcoming) list.reverse();
    return `<button class="btn primary big" data-act="new-job">＋ 일감 받기</button>
      <div class="segment" style="margin-top:14px"><button class="${upcoming ? "active" : ""}" data-act="jobs-mode" data-v="upcoming">오늘부터</button><button class="${upcoming ? "" : "active"}" data-act="jobs-mode" data-v="past">지난 일감</button></div>
      ${list.length ? list.map(jobCard).join("") : `<div class="empty">${upcoming ? "예정된 일감이 없어요" : "지난 일감이 없어요"}</div>`}`;
  };

  // ---------- 화면: 일감 하나 ----------
  const statusText = { asked: "연락함", standby: "대기 중", confirmed: "확정", canceled: "취소" };
  const outcomeText = { done: "✔ 출근함", late: "⚠ 직전 취소", noshow: "✖ 안 나옴", cancel_ok: "미리 알리고 취소" };

  const contactButtons = (w, j, msg, msgLabel = "💬 문자") => w.phone
    ? `<a class="btn" href="${telHref(w.phone)}" data-act="contacted" data-worker="${w.id}" data-job="${j.id}">📞 전화</a>
       <a class="btn" href="${smsHref(w.phone, msg)}" data-act="contacted" data-worker="${w.id}" data-job="${j.id}">${msgLabel}</a>`
    : `<button class="btn" data-act="edit-worker" data-id="${w.id}">전화번호 넣기</button>`;

  const assignRow = (a, j) => {
    const w = worker(a.workerId);
    if (!w) return "";
    const s = statsOf(w.id);
    const head = `<div class="name-line"><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>${badge(trustOf(s))}</div>`;
    const started = j.date <= today();
    let state_ = "";
    let buttons = "";
    if (a.status === "confirmed" && a.outcome === "done") {
      state_ = `<span class="pill ok">✔ 출근함</span> <span class="muted small">수수료 ${won(a.fee)}</span>`;
      buttons = `<button class="btn ${a.rehire ? "on" : ""}" data-act="toggle-rehire" data-id="${a.id}">${a.rehire ? "♥ 식당이 또 찾음" : "♡ 식당이 또 찾나요?"}</button>
        <button class="btn ghost" data-act="undo-assign" data-id="${a.id}">되돌리기</button>`;
    } else if (a.status === "confirmed") {
      state_ = `<span class="pill ok">확정</span>`;
      buttons = started
        ? `<button class="btn ok" data-act="outcome" data-id="${a.id}" data-v="done">✔ 출근함</button>
           <button class="btn bad" data-act="outcome" data-id="${a.id}" data-v="noshow">✖ 안 나옴</button>
           <button class="btn warn" data-act="cancel-ask" data-id="${a.id}">⚠ 취소 연락옴</button>
           ${w.phone ? `<a class="btn" href="${telHref(w.phone)}">📞 전화</a>` : ""}`
        : `${contactButtons(w, j, confirmMsg(j, w), "💬 확정 문자")}
           ${rest(j.restaurantId)?.phone ? `<a class="btn" href="${smsHref(rest(j.restaurantId).phone, restMsg(j, w))}">💬 식당에 알림</a>` : `<button class="btn" data-act="copy-rest-msg" data-id="${a.id}">식당 문자 복사</button>`}
           <button class="btn warn" data-act="cancel-ask" data-id="${a.id}">⚠ 취소 연락옴</button>`;
    } else if (a.status === "standby") {
      state_ = `<span class="pill gray">대기 중</span>`;
      buttons = `${contactButtons(w, j, standbyMsg(j, w))}
        <button class="btn primary" data-act="set-status" data-id="${a.id}" data-v="confirmed">✓ 확정</button>
        <button class="btn ghost" data-act="remove-assign" data-id="${a.id}">빼기</button>`;
    } else if (a.status === "asked") {
      state_ = `<span class="pill gray">연락함 · 답 기다리는 중</span>`;
      buttons = `${contactButtons(w, j, offerMsg(j, w))}
        <button class="btn primary" data-act="set-status" data-id="${a.id}" data-v="confirmed">✓ 확정</button>
        <button class="btn" data-act="set-status" data-id="${a.id}" data-v="standby">대기로</button>
        <button class="btn ghost" data-act="remove-assign" data-id="${a.id}">빼기 (못 한대요)</button>`;
    } else {
      state_ = `<span class="pill gray">${outcomeText[a.outcome] || "취소"}</span>`;
      buttons = `<button class="btn ghost" data-act="undo-assign" data-id="${a.id}">되돌리기</button>`;
    }
    return `<div class="person-row ${a.status === "canceled" ? "dim" : ""}">${head}<div class="status-line">${state_}</div><div class="btn-row">${buttons}</div></div>`;
  };

  const candidateRow = (c, j, full) => {
    const { w, s, t, near, busy } = c;
    return `<div class="person-row">
      <div class="name-line"><button class="name-link" data-act="open-worker" data-id="${w.id}">${esc(w.name)}</button>${badge(t)}${near ? `<span class="tag">가까움</span>` : ""}${busy ? `<span class="tag warn">같은 시간 다른 일</span>` : ""}</div>
      <div class="status-line muted">${statLine(s)} · ${s.lastWork ? `마지막 근무 ${esc(dateText(s.lastWork))}` : "근무 기록 없음"}${w.area ? ` · ${esc(w.area)}` : ""}</div>
      <div class="btn-row">${contactButtons(w, j, offerMsg(j, w), "💬 일 제안")}
        <button class="btn primary" data-act="add-assign" data-v="confirmed" data-worker="${w.id}" data-job="${j.id}" ${full || busy ? "disabled" : ""}>✓ 확정</button>
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
      <div class="facts">
        <div class="fact"><small>시간</small><strong>${esc(j.start)}~${esc(j.end)}</strong></div>
        <div class="fact"><small>일당</small><strong>${esc(won(j.pay))}</strong></div>
        <div class="fact"><small>필요 인원</small><strong>${esc(j.headcount)}명</strong></div>
        <div class="fact"><small>지역</small><strong>${esc(r?.area || "-")}</strong></div>
      </div>
      ${r?.address ? `<p class="small">📍 ${esc(r.address)}</p>` : ""}
      ${j.memo ? `<p class="small">📝 ${esc(j.memo)}</p>` : ""}
      <div class="btn-row">${r?.phone ? `<a class="btn" href="${telHref(r.phone)}">📞 식당 전화</a>` : ""}<button class="btn" data-act="edit-job" data-id="${j.id}">고치기</button></div>
    </div>`;

    if (need && standby.length) html += `<div class="banner need">대기 중인 분이 ${standby.length}명 있어요. 아래에서 바로 <strong>확정</strong>하세요.</div>`;
    else if (need) html += `<div class="banner need">${need}명 더 필요해요</div>`;
    else html += `<div class="banner ok">✅ 인원이 다 찼어요</div>`;

    if (list.length) html += `<h2>연락한 사람</h2><div class="card">${list.map((a) => assignRow(a, j)).join("")}</div>`;

    html += `<h2>추천 순서 <span class="muted small" style="font-weight:400">약속 잘 지키고 오래 쉰 분 먼저</span></h2>`;
    if (!cands.length) {
      html += `<div class="empty">${esc(j.role)} 가능한 분이 더 없어요.<br><button class="btn" style="margin-top:10px" data-act="new-worker">＋ 사람 등록</button></div>`;
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
    return list.length ? list.map(({ w, s, t }) => `<button class="worker-card ${w.active === false ? "hidden-worker" : ""}" data-act="open-worker" data-id="${w.id}">
        <div class="name-line"><strong>${esc(w.name)}</strong>${badge(t)}${w.active === false ? `<span class="tag">숨김</span>` : ""}</div>
        <div class="status-line">${esc((w.roles || []).join(" · "))}${w.area ? ` · ${esc(w.area)}` : ""}</div>
        <div class="status-line muted">${statLine(s)} · ${s.lastWork ? `마지막 근무 ${esc(dateText(s.lastWork))}` : "근무 기록 없음"}</div></button>`).join("")
      : `<div class="empty">${q || ui.peopleRole ? "조건에 맞는 분이 없어요" : "등록된 분이 없어요"}</div>`;
  };
  const renderPeople = () => {
    const isW = ui.peopleMode === "workers";
    return `<div class="segment"><button class="${isW ? "active" : ""}" data-act="people-mode" data-v="workers">구직자 ${state.workers.length}</button><button class="${isW ? "" : "active"}" data-act="people-mode" data-v="restaurants">식당 ${state.restaurants.length}</button></div>
      <button class="btn primary big" data-act="${isW ? "new-worker" : "new-rest"}">＋ ${isW ? "사람 등록" : "식당 등록"}</button>
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
      <span class="small">${a.outcome ? outcomeText[a.outcome] : statusText[a.status]}${a.rehire ? " · ♥ 식당이 또 찾음" : ""}</span></li>`;

    return `<div class="card">
      <div class="name-line" style="font-size:1.35rem"><strong>${esc(w.name)}</strong>${badge(t)}${w.active === false ? `<span class="tag">숨김</span>` : ""}</div>
      <div class="status-line">${esc((w.roles || []).join(" · "))}${w.area ? ` · ${esc(w.area)}` : ""}</div>
      <div class="status-line muted">${esc(w.phone || "전화번호 없음")}${w.joined ? ` · 가입 ${esc(w.joined)}` : ""}</div>
      ${w.memo ? `<p class="small" style="margin-top:8px">📝 ${esc(w.memo)}</p>` : ""}
      <div class="btn-row">${w.phone ? `<a class="btn primary" href="${telHref(w.phone)}">📞 전화</a><a class="btn" href="${smsHref(w.phone, "")}">💬 문자</a>` : ""}<button class="btn" data-act="edit-worker" data-id="${w.id}">고치기</button></div>
    </div>
    <h2>약속 기록</h2>
    <div class="stat-grid"><div><strong>${s.done}</strong><small>✔ 출근</small></div><div><strong>${s.late}</strong><small>⚠ 직전취소</small></div><div><strong>${s.noshow}</strong><small>✖ 안 나옴</small></div><div><strong>${s.rehire}</strong><small>♥ 또 찾음</small></div></div>
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
      <div class="btn-row">${s.kind === "talk" ? "" : `<a class="btn primary" href="${smsHref("", s.text)}">💬 문자로 보내기</a>`}
        <button class="btn" data-act="copy-script" data-id="${s.id}">복사</button>
        <button class="btn ghost" data-act="edit-script" data-id="${s.id}">고치기</button></div>
    </div>`).join("")}
    <button class="btn big" data-act="new-script">＋ 새 문구 만들기</button>`;

  // ---------- 화면: 백업·설정 ----------
  const renderMore = () => `<h2>백업</h2>
    <div class="card">
      <p>자료는 <strong>이 휴대폰 안에만</strong> 저장돼요. 휴대폰을 바꾸거나 잃어버릴 때를 대비해 일주일에 한 번은 백업 파일을 만들어 두세요.</p>
      <p class="muted small">마지막 백업: ${state.lastBackup ? esc(dateText(state.lastBackup)) : "없음"}</p>
      <button class="btn primary big" data-act="backup">💾 백업 파일 만들기</button>
      <p class="hint">'내 파일 → 다운로드' 폴더에 저장돼요. 카카오톡 '나와의 채팅'에 보내 두면 더 안전해요.</p>
      <button class="btn big" style="margin-top:12px" data-act="import">📂 백업 파일 불러오기</button>
    </div>
    <h2>수수료</h2>
    <div class="card"><label class="field">일당의 몇 %인가요?<input id="fee-rate" type="number" inputmode="numeric" min="0" max="100" value="${esc(state.feeRate)}" /></label>
      <button class="btn" data-act="save-fee">저장</button></div>
    <h2>홈 화면에 앱 아이콘 만들기</h2>
    <div class="card small"><p><strong>삼성 인터넷:</strong> 아래 ≡ 메뉴 → '현재 페이지 추가' → '홈 화면'</p><p style="margin:0"><strong>크롬:</strong> 오른쪽 위 ⋮ 메뉴 → '홈 화면에 추가'</p></div>
    <h2>연습</h2>
    <div class="card">
      ${state.workers.length || state.jobs.length ? `<p class="small">연습이 끝나면 아래 '모든 자료 지우기'로 지우고 실제로 쓰시면 돼요.</p>` : `<button class="btn big" data-act="seed">연습용 예시 자료 넣기</button>`}
    </div>
    <div class="danger-zone"><button class="link-btn" data-act="wipe">모든 자료 지우기</button></div>`;

  // ---------- 그리기 ----------
  const TITLES = { home: "다원 소개소", jobs: "일감", people: "사람", scripts: "문자 문구", more: "백업·설정" };
  const screens = { home: renderHome, jobs: renderJobs, people: renderPeople, scripts: renderScripts, more: renderMore, job: renderJob, worker: renderWorker };
  const render = () => {
    const tab = { job: "jobs", worker: "people" }[route.name] || route.name;
    document.querySelectorAll(".tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    const isDetail = route.name === "job" || route.name === "worker";
    $("#back").hidden = !isDetail;
    $("#title").textContent = route.name === "job" ? "일감 보기" : route.name === "worker" ? (worker(route.id)?.name || "사람") : TITLES[route.name];
    $("#screen").innerHTML = (screens[route.name] || renderHome)(route.id);
  };
  const refresh = () => { save(); render(); };

  // ---------- 입력창들 ----------
  const roleChips = (name, selected, multi) => `<div class="chips">${ROLES.map((r) => `<label class="chip"><input type="${multi ? "checkbox" : "radio"}" name="${name}" value="${r}" ${selected.includes(r) ? "checked" : ""} ${multi ? "" : "required"} /><span>${r}</span></label>`).join("")}</div>`;
  const val = (fd, k) => String(fd.get(k) ?? "").trim();

  // 일감 받기 / 고치기
  const jobForm = (existing) => {
    const j = existing || { date: today(), start: "", end: "", pay: "", headcount: 1, role: "", memo: "", restaurantId: "" };
    // 최근에 일감을 준 식당이 위로
    const lastUse = (r) => state.jobs.filter((x) => x.restaurantId === r.id).map((x) => x.date).sort().pop() || "";
    const rests = [...state.restaurants].sort((a, b) => lastUse(b).localeCompare(lastUse(a)) || a.name.localeCompare(b.name, "ko"));
    const body = `
      <label class="field">식당
        <select name="restaurantId" required>
          <option value="">식당을 고르세요</option>
          ${rests.map((r) => `<option value="${r.id}" ${r.id === j.restaurantId ? "selected" : ""}>${esc(r.name)}${r.area ? ` (${esc(r.area)})` : ""}</option>`).join("")}
          <option value="__new" ${rests.length ? "" : "selected"}>＋ 새 식당 등록</option>
        </select></label>
      <div class="new-rest" ${rests.length ? "hidden" : ""}>
        <label class="field">식당 이름<input name="rName" autocomplete="off" /></label>
        <div class="two"><label class="field">지역<input name="rArea" placeholder="예: 종로" /></label><label class="field">전화<input name="rPhone" type="tel" inputmode="tel" /></label></div>
        <label class="field">주소<input name="rAddress" /></label>
      </div>
      <fieldset class="field"><legend>업무</legend>${roleChips("role", [j.role], false)}</fieldset>
      <fieldset class="field"><legend>날짜</legend>
        <div class="chips">${["오늘", "내일", "모레"].map((label, n) => `<label class="chip"><input type="radio" name="dateQuick" value="${today(n)}" ${j.date === today(n) ? "checked" : ""} /><span>${label}</span></label>`).join("")}</div>
        <input type="date" name="date" value="${esc(j.date)}" required />
      </fieldset>
      <div class="two"><label class="field">시작<input type="time" name="start" value="${esc(j.start)}" required /></label><label class="field">끝<input type="time" name="end" value="${esc(j.end)}" required /></label></div>
      <label class="field">일당 (원)<input name="pay" inputmode="numeric" placeholder="예: 130000" value="${esc(j.pay || "")}" /><span class="hint" id="pay-hint"></span></label>
      <div class="field">필요 인원<div class="stepper"><button type="button" data-step="-1" aria-label="줄이기">−</button><input name="headcount" type="number" min="1" max="20" value="${esc(j.headcount)}" /><button type="button" data-step="1" aria-label="늘리기">＋</button></div></div>
      <label class="field">메모<textarea name="memo" rows="2" placeholder="예: 앞치마 지참">${esc(j.memo)}</textarea></label>`;

    openSheet({
      title: existing ? "일감 고치기" : "일감 받기",
      body,
      submit: existing ? "저장" : "저장하고 사람 찾기",
      onReady: (form) => {
        const select = form.elements.restaurantId;
        const box = form.querySelector(".new-rest");
        const payHint = () => { const n = Number(String(form.elements.pay.value).replace(/[^0-9]/g, "")); $("#pay-hint", form).textContent = n ? `${n.toLocaleString("ko-KR")}원 · 수수료 ${Math.round(n * state.feeRate / 100).toLocaleString("ko-KR")}원` : ""; };
        const syncNew = () => {
          const isNew = select.value === "__new";
          box.hidden = !isNew;
          form.elements.rName.required = isNew;
        };
        select.addEventListener("change", () => {
          syncNew();
          // 새 일감이면 그 식당의 지난번 조건을 자동으로 채움
          if (existing || select.value === "__new") return;
          const last = state.jobs.filter((x) => x.restaurantId === select.value).sort(sortJobs).pop();
          if (!last) return;
          form.querySelectorAll("input[name=role]").forEach((i) => { i.checked = i.value === last.role; });
          form.elements.start.value = last.start;
          form.elements.end.value = last.end;
          if (last.pay) form.elements.pay.value = last.pay;
          payHint();
          toast("지난번 조건을 채워 넣었어요");
        });
        form.querySelectorAll("input[name=dateQuick]").forEach((i) => i.addEventListener("change", () => { form.elements.date.value = i.value; }));
        form.elements.date.addEventListener("change", () => form.querySelectorAll("input[name=dateQuick]").forEach((i) => { i.checked = i.value === form.elements.date.value; }));
        form.elements.pay.addEventListener("input", payHint);
        syncNew();
        payHint();
      },
      onSubmit: (fd) => {
        let restaurantId = val(fd, "restaurantId");
        if (restaurantId === "__new") {
          const r = { id: uid(), name: val(fd, "rName"), area: val(fd, "rArea"), phone: val(fd, "rPhone"), address: val(fd, "rAddress"), memo: "" };
          state.restaurants.push(r);
          restaurantId = r.id;
        }
        const data = {
          restaurantId,
          role: val(fd, "role"),
          date: val(fd, "date"),
          start: val(fd, "start"),
          end: val(fd, "end"),
          pay: Number(val(fd, "pay").replace(/[^0-9]/g, "")) || 0,
          headcount: Math.max(1, Number(val(fd, "headcount")) || 1),
          memo: val(fd, "memo"),
        };
        if (existing) {
          Object.assign(existing, data);
          // 일당이 바뀌면 이미 출근한 분 수수료도 다시 계산
          assignsOf(existing.id).filter((a) => a.outcome === "done").forEach((a) => { a.fee = Math.round(data.pay * state.feeRate / 100); });
          refresh();
          toast("고쳤어요");
        } else {
          const j2 = { id: uid(), ...data, created: today() };
          state.jobs.push(j2);
          save();
          go({ name: "job", id: j2.id });
          toast("일감을 저장했어요. 추천 순서대로 연락해 보세요.");
        }
      },
    });
  };

  // 사람 등록 / 고치기
  const workerForm = (existing) => {
    const w = existing || { name: "", phone: "", roles: [], area: "", memo: "", joined: today() };
    openSheet({
      title: existing ? "사람 정보 고치기" : "사람 등록",
      body: `<label class="field">이름<input name="name" required autocomplete="off" value="${esc(w.name)}" /></label>
        <label class="field">전화번호<input name="phone" type="tel" inputmode="tel" placeholder="010-0000-0000" value="${esc(w.phone)}" /></label>
        <fieldset class="field"><legend>할 수 있는 일 (여러 개 고를 수 있어요)</legend>${roleChips("roles", w.roles || [], true)}</fieldset>
        <label class="field">사는 곳 / 가능 지역<input name="area" placeholder="예: 종로" value="${esc(w.area)}" /></label>
        <label class="field">가입일<input name="joined" type="date" value="${esc(w.joined || "")}" /></label>
        <label class="field">메모<textarea name="memo" rows="3" placeholder="예: 오전만 가능, 한식 경력 10년">${esc(w.memo)}</textarea></label>`,
      onSubmit: (fd) => {
        const roles = fd.getAll("roles").map(String);
        if (!roles.length) { toast("할 수 있는 일을 하나 이상 골라 주세요"); return false; }
        const data = { name: val(fd, "name"), phone: val(fd, "phone"), roles, area: val(fd, "area"), joined: val(fd, "joined"), memo: val(fd, "memo") };
        if (existing) { Object.assign(existing, data); toast("고쳤어요"); }
        else { state.workers.push({ id: uid(), active: true, ...data }); toast(`${data.name}님을 등록했어요`); }
        refresh();
      },
    });
  };

  // 식당 등록 / 고치기
  const restForm = (existing) => {
    const r = existing || { name: "", area: "", phone: "", address: "", memo: "" };
    openSheet({
      title: existing ? "식당 정보" : "식당 등록",
      body: `${existing?.phone ? `<a class="btn big" style="margin-bottom:16px" href="${telHref(existing.phone)}">📞 ${esc(existing.phone)} 전화하기</a>` : ""}
        <label class="field">식당 이름<input name="name" required value="${esc(r.name)}" /></label>
        <div class="two"><label class="field">지역<input name="area" placeholder="예: 종로" value="${esc(r.area)}" /></label><label class="field">전화<input name="phone" type="tel" inputmode="tel" value="${esc(r.phone)}" /></label></div>
        <label class="field">주소<input name="address" value="${esc(r.address)}" /></label>
        <label class="field">메모<textarea name="memo" rows="2" placeholder="예: 사장님이 조용한 분 선호">${esc(r.memo)}</textarea></label>
        ${existing ? `<button type="button" class="link-btn" data-act="del-rest" data-id="${existing.id}">이 식당 지우기</button>` : ""}`,
      onSubmit: (fd) => {
        const data = { name: val(fd, "name"), area: val(fd, "area"), phone: val(fd, "phone"), address: val(fd, "address"), memo: val(fd, "memo") };
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
        <label class="choice"><input type="radio" name="kind" value="late" /><span><strong>직전에 취소했어요</strong><small>약속 기록에 ⚠ 표시가 남아요</small></span></label></div>`,
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
  const addAssign = (workerId, jobId, status) => {
    const j = job(jobId);
    if (!j) return;
    let a = state.assigns.find((x) => x.workerId === workerId && x.jobId === jobId);
    if (status === "confirmed" && jobNeed(j) === 0 && a?.status !== "confirmed") { toast("인원이 이미 다 찼어요"); return; }
    if (status === "confirmed" && busyFor(workerId, j)) { toast("같은 시간에 다른 일이 확정된 분이에요"); return; }
    if (!a) { a = { id: uid(), jobId, workerId, status, outcome: "", fee: 0, rehire: false }; state.assigns.push(a); }
    else a.status = status;
    if (status !== "canceled") a.outcome = "";
    save();
  };

  // ---------- 백업 ----------
  const doBackup = () => {
    state.lastBackup = today(); // 파일 안에도 백업 날짜가 들어가도록 먼저 적음
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
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
      state = { ...blank(), ...data };
      refresh();
      toast("백업을 불러왔어요");
    } catch (_) {
      toast("다원 백업 파일이 아니에요. 파일을 확인해 주세요.");
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
    "add-assign": (el) => { addAssign(el.dataset.worker, el.dataset.job, el.dataset.v); render(); toast(el.dataset.v === "confirmed" ? "확정했어요. 확정 문자를 보내 주세요." : "대기로 넣었어요"); },
    "contacted": (el) => {
      // 전화/문자 앱이 열린 뒤에 기록 (링크 동작을 막지 않음)
      const { worker: wId, job: jId } = el.dataset;
      if (!state.assigns.some((a) => a.workerId === wId && a.jobId === jId)) setTimeout(() => { addAssign(wId, jId, "asked"); render(); }, 400);
    },
    "set-status": (el) => { const a = assign(el.dataset.id); addAssign(a.workerId, a.jobId, el.dataset.v); render(); if (el.dataset.v === "confirmed" && assign(el.dataset.id).status === "confirmed") toast("확정했어요. 확정 문자를 보내 주세요."); },
    "remove-assign": (el) => { state.assigns = state.assigns.filter((a) => a.id !== el.dataset.id); refresh(); },
    "outcome": (el) => { setOutcome(assign(el.dataset.id), el.dataset.v); render(); toast(el.dataset.v === "done" ? "출근으로 기록했어요 ✔" : "안 나옴으로 기록했어요"); },
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
    "save-fee": () => { const n = Number($("#fee-rate").value); if (!(n >= 0 && n <= 100)) { toast("0~100 사이로 적어 주세요"); return; } state.feeRate = n; refresh(); toast("저장했어요"); },
    "seed": seed,
    "wipe": () => {
      if (!confirm("정말 모든 자료를 지울까요? 백업 파일이 없으면 되돌릴 수 없어요.")) return;
      if (!confirm("한 번 더 확인할게요. 모두 지울까요?")) return;
      state = blank();
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
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  render();
})();
