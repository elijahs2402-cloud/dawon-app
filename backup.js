(() => {
  "use strict";
  const URL = "https://aesajrenvhkttnnkysrx.supabase.co";
  const API_KEY = "sb_publishable_Vyds8x4w77h5PYGZ110ulg_suaAVocO";
  const BUCKET = "dawon-backups";
  const SESSION = "dawon-backup-session-v1";
  const C = globalThis.DawonBackupCrypto;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  let session, cached, hooks, host, timer, busy = false, refreshPromise;
  let message = "자동 백업을 켜면 자료와 사진을 암호화해 보관해요.", error = false, dirty = true;
  let opening;
  const db = () => opening ||= new Promise((resolve, reject) => {
    const r = indexedDB.open("dawon-backup-device", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("settings");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => { opening = null; reject(new Error("휴대폰의 백업 설정을 저장하지 못했어요.")); };
  });
  const setting = async (id, value, remove = false) => {
    const database = await db();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("settings", value === undefined && !remove ? "readonly" : "readwrite");
      const s = tx.objectStore("settings");
      const r = remove ? s.delete(id) : value === undefined ? s.get(id) : s.put(value, id);
      tx.oncomplete = () => resolve(r.result);
      tx.onabort = tx.onerror = () => reject(new Error("휴대폰의 백업 설정을 저장하지 못했어요."));
    });
  };
  const status = (text, bad = false) => {
    message = text; error = bad;
    const box = host?.querySelector("[data-cloud-status]");
    if (box) { box.textContent = text; box.classList.toggle("error-note", bad); box.setAttribute("role", bad ? "alert" : "status"); }
    document.querySelectorAll("[data-backup-summary]").forEach((el) => { el.textContent = text; el.classList.toggle("error-note", bad); });
  };
  const fieldError = (input, message) => {
    input.setAttribute("aria-invalid", "true");
    let note = input.closest("label").nextElementSibling;
    if (!note?.hasAttribute("data-cloud-field-error")) {
      note = document.createElement("p"); note.setAttribute("data-cloud-field-error", "");
      note.className = "error-note"; note.id = `cloud-error-${input.name}`;
      input.closest("label").after(note);
    }
    note.textContent = message;
    input.setAttribute("aria-describedby", [input.name === "recovery" ? "recovery-help" : "", note.id].filter(Boolean).join(" "));
    status(message, true); input.focus();
  };
  const friendly = (data, code) => {
    const kind = data?.error_code || data?.code;
    if (kind === "invalid_credentials") return "이메일 또는 로그인 비밀번호가 달라요. 다시 확인해 주세요.";
    if (kind === "email_not_confirmed") return "이메일의 가입 확인 링크를 먼저 눌러 주세요.";
    if (code === 401) return "로그인이 만료됐어요. 다시 로그인해 주세요.";
    if (code === 429 || /rate_limit/.test(kind || "")) return "요청이 많아 잠시 쉬고 있어요. 잠시 뒤 다시 눌러 주세요.";
    if (code === 413) return "백업 용량이 너무 커요. 사진을 줄여 주세요.";
    if (code === 403) return "백업 접근 권한을 확인해야 해요. 관리자에게 알려 주세요.";
    if (code === 400 && /email/.test(data?.msg || data?.message || "")) return "이메일 전송 설정을 확인해야 해요. Supabase에서 백업용 사용자를 만들어 주세요.";
    return "서버에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요. 휴대폰 자료는 남아 있어요.";
  };
  const request = async (path, { method = "GET", body, auth = true, blob = false } = {}) => {
    if (!navigator.onLine) throw new Error("인터넷이 끊겼어요. 휴대폰에 저장하고 연결되면 다시 백업해요.");
    if (auth) await token();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(URL + path, {
        method, signal: controller.signal, cache: "no-store", credentials: "omit",
        headers: { apikey: API_KEY, ...(auth ? { Authorization: `Bearer ${session.access_token}` } : {}), ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
        ...(body !== undefined ? { body: body instanceof Blob ? body : JSON.stringify(body) } : {})
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        const expired = (auth && res.status === 401) || (path.includes("grant_type=refresh_token") && [400, 401].includes(res.status));
        if (expired) {
          clearTimeout(timer); localStorage.removeItem(SESSION); session = cached = null;
          draw(); throw new Error("로그인이 만료됐어요. 백업용 계정으로 다시 로그인해 주세요.");
        }
        throw new Error(friendly(detail, res.status));
      }
      return blob ? res.blob() : res.status === 204 ? null : res.json();
    } catch (e) {
      if (e.name === "AbortError" || e instanceof TypeError) throw new Error("백업 서버 응답이 늦어요. 인터넷을 확인하고 다시 눌러 주세요.");
      throw e;
    } finally { clearTimeout(timeout); }
  };
  const saveSession = (data) => {
    if (!data?.access_token || !data?.refresh_token || !data?.user?.id) throw new Error("로그인 정보를 확인하지 못했어요.");
    const next = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + data.expires_in * 1000, user: { id: data.user.id, email: data.user.email } };
    localStorage.setItem(SESSION, JSON.stringify(next));
    session = next;
  };
  const token = async () => {
    if (!session) throw new Error("백업용 계정으로 먼저 로그인해 주세요.");
    if (Date.now() < session.expires_at - 60000) return;
    if (!refreshPromise) refreshPromise = request("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: session.refresh_token }, auth: false }).then(saveSession).finally(() => { refreshPromise = null; });
    await refreshPromise;
  };
  const list = async () => {
    const data = await request(`/storage/v1/object/list/${BUCKET}`, { method: "POST", body: { prefix: session.user.id, limit: 100, sortBy: { column: "name", order: "desc" } } });
    return data.filter((r) => /^\d{13}-[a-f0-9-]+\.json$/.test(r.name));
  };
  const download = async (name) => {
    if (!/^\d{13}-[a-f0-9-]+\.json$/.test(name)) throw new Error("백업 파일을 다시 골라 주세요.");
    const blob = await request(`/storage/v1/object/authenticated/${BUCKET}/${session.user.id}/${name}`, { blob: true });
    if (blob.size > 25 * 1024 * 1024) throw new Error("백업 파일이 너무 커요.");
    return JSON.parse(await blob.text());
  };
  const changed = () => { dirty = true; schedule(); };
  const schedule = () => {
    clearTimeout(timer);
    if (!cached?.enabled || !session || busy || !dirty) return;
    const wait = Math.max(30000, (cached.lastAttempt || 0) + 300000 - Date.now());
    timer = setTimeout(() => run(() => backup(false)), wait);
  };
  const backup = async (force) => {
    if (!cached?.key) throw new Error("복구 암호를 먼저 설정해 주세요.");
    const data = await hooks.snapshot();
    const hash = await C.hash(data);
    if (!force && hash === cached.lastHash) { dirty = false; status(lastText()); return; }
    cached.lastAttempt = Date.now();
    status("암호화해서 백업하는 중이에요…");
    const blob = await C.pack(data, cached.key, cached.salt);
    const name = `${Date.now()}-${crypto.randomUUID()}.json`;
    await request(`/storage/v1/object/${BUCKET}/${session.user.id}/${name}`, { method: "POST", body: blob });
    cached.lastBackup = Date.now(); cached.lastHash = hash;
    await setting(session.user.id, cached);
    dirty = hash !== await C.hash(await hooks.snapshot());
    status(lastText());
    // 새 백업 업로드가 성공한 다음에만 오래된 파일을 정리한다.
    try {
      const old = (await list()).slice(7);
      if (old.length) await request(`/storage/v1/object/${BUCKET}`, { method: "DELETE", body: { prefixes: old.map((r) => `${session.user.id}/${r.name}`) } });
    } catch (_) { status(`${lastText()} 이전 백업 정리는 다음에 다시 시도해요.`); }
  };
  const lastText = () => cached?.lastBackup ? `마지막 백업: ${new Date(cached.lastBackup).toLocaleString("ko-KR")}${cached.enabled ? " · 자동 백업 켜짐" : " · 자동 백업 꺼짐"}` : "아직 원격 백업이 없어요.";
  const run = async (work) => {
    if (busy) return;
    busy = true;
    host?.querySelectorAll("button").forEach((b) => b.disabled = true);
    try { await work(); } catch (e) { status(e.message || "백업을 처리하지 못했어요.", true); }
    finally { busy = false; host?.querySelectorAll("button").forEach((b) => b.disabled = false); if (dirty) schedule(); }
  };
  const draw = () => {
    if (!host?.isConnected) return;
    host.innerHTML = `<h3>암호화 자동 백업</h3><p data-cloud-status role="${error ? "alert" : "status"}" class="${error ? "error-note" : "hint"}" aria-live="polite">${esc(message)}</p>
      <p class="hint">자료와 사진을 암호화해 최근 백업 7개를 보관해요. 앱을 열어 둔 동안, 변경 후 30초부터 백업하며 연속 변경은 5분 간격으로 모아요.</p>
      ${!session ? `<form data-cloud-login novalidate><p class="hint">백업용 계정으로 로그인해 주세요. Supabase 관리 화면의 로그인과 별도예요.</p><label class="field">이메일<input name="email" type="email" autocomplete="username" required /></label><label class="field">로그인 비밀번호<input name="password" type="password" autocomplete="current-password" minlength="8" required /></label><button class="btn primary" type="submit">로그인</button><button class="btn" type="submit" name="signup" value="yes">처음 가입하기</button></form>` : `<p class="hint">${esc(session.user.email)}</p>
      ${!cached?.key ? `<form data-cloud-unlock novalidate><label class="field">복구 암호<input name="recovery" type="password" autocomplete="off" minlength="12" required aria-describedby="recovery-help" /></label><p id="recovery-help" class="hint">처음이면 12자 이상 새 암호를 정하세요. 다른 휴대폰에서 되살릴 때도 같은 암호가 필요해요. 따로 적어 안전하게 보관해 주세요. 잊으면 서버에서도 복구할 수 없어요.</p><label class="field">복구 암호 다시 입력<input name="repeat" type="password" autocomplete="off" required /></label><button class="btn primary" type="submit">암호 확인하고 백업 켜기</button></form>` : `<div class="cloud-actions"><button class="btn primary" data-cloud-action="backup">지금 백업</button><button class="btn" data-cloud-action="list">백업에서 복원</button><button class="btn" data-cloud-action="toggle">자동 백업 ${cached.enabled ? "끄기" : "켜기"}</button></div>`}
      <div data-cloud-versions></div><button class="btn ghost" data-cloud-action="logout">로그아웃</button>`}
      <button class="btn ghost" data-cloud-action="undo">복원 전 휴대폰 자료 되돌리기</button>`;
    host.querySelectorAll("form").forEach((form) => form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.querySelectorAll("[data-cloud-field-error]").forEach((el) => el.remove());
      form.querySelectorAll("input").forEach((el) => { el.removeAttribute("aria-invalid"); if (el.name !== "recovery") el.removeAttribute("aria-describedby"); else el.setAttribute("aria-describedby", "recovery-help"); });
      const invalid = [...form.elements].find((el) => el.validity && !el.validity.valid);
      if (invalid) {
        const name = { email: "이메일", password: "로그인 비밀번호", recovery: "복구 암호", repeat: "복구 암호 확인" }[invalid.name];
        const particle = ["email", "repeat"].includes(invalid.name) ? "을" : "를";
        fieldError(invalid, invalid.validity.valueMissing ? `${name}${particle} 입력해 주세요.` : invalid.validity.typeMismatch ? "이메일 주소 형식을 확인해 주세요." : invalid.validationMessage); return;
      }
      const data = new FormData(form);
      const signup = e.submitter?.name === "signup";
      run(async () => {
        if (form.hasAttribute("data-cloud-login")) {
          status(signup ? "가입 확인 메일을 요청하는 중이에요…" : "로그인하는 중이에요…");
          const result = await request(signup ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password", { method: "POST", auth: false, body: { email: data.get("email").trim(), password: data.get("password") } });
          if (!result.access_token) { status("가입 확인 메일의 링크를 누른 뒤 여기로 돌아와 로그인해 주세요. 메일이 오지 않으면 관리자에게 백업용 사용자 생성을 요청해 주세요."); form.elements.password.value = ""; return; }
          saveSession(result);
          cached = await setting(session.user.id);
          status(cached?.key ? lastText() : "로그인했어요. 복구 암호를 설정해 주세요.");
          draw();
        } else {
          if (data.get("recovery") !== data.get("repeat")) { fieldError(form.elements.repeat, "복구 암호 두 칸이 달라요. 다시 입력해 주세요."); return; }
          status("복구 암호를 확인하는 중이에요…");
          const versions = await list();
          const envelope = versions.length ? await download(versions[0].name) : null;
          const salt = envelope?.salt || C.salt();
          const key = await C.derive(data.get("recovery"), salt);
          if (envelope) await C.unpack(envelope, key);
          cached = { key, salt, enabled: true, lastBackup: envelope ? Number(versions[0].name.slice(0, 13)) : 0 };
          await setting(session.user.id, cached);
          status(envelope ? "암호를 확인했어요. 이전 자료가 필요하면 먼저 ‘백업에서 복원’을 눌러 주세요." : "자동 백업을 켰어요. 곧 첫 백업을 만들어요.");
          draw();
          // 새 휴대폰의 빈 자료가 기존 백업을 밀어내지 않도록 기존 백업이 있으면 변경을 기다린다.
          dirty = !envelope;
        }
      });
    }));
    host.querySelectorAll("[data-cloud-action]").forEach((b) => b.addEventListener("click", () => run(async () => {
      const action = b.dataset.cloudAction;
      if (action === "backup") await backup(true);
      if (action === "toggle") { cached.enabled = !cached.enabled; await setting(session.user.id, cached); status(lastText()); draw(); }
      if (action === "logout") {
        clearTimeout(timer);
        try { await request("/auth/v1/logout", { method: "POST" }); } catch (_) { /* 기기에서 즉시 로그아웃한다. */ }
        if (session) await setting(session.user.id, undefined, true);
        localStorage.removeItem(SESSION); session = cached = null;
        status("로그아웃했어요. 자동 백업이 꺼졌어요."); draw();
      }
      if (action === "list") {
        status("백업 목록을 불러오는 중이에요…");
        const versions = await list();
        const target = host.querySelector("[data-cloud-versions]");
        target.innerHTML = versions.length ? `<label class="field">복원할 백업<select data-cloud-choice>${versions.map((v) => `<option value="${esc(v.name)}">${esc(new Date(Number(v.name.slice(0, 13))).toLocaleString("ko-KR"))}</option>`).join("")}</select></label><button class="btn" data-cloud-restore>선택한 백업 복원</button>` : "<p>아직 백업이 없어요. ‘지금 백업’을 눌러 주세요.</p>";
        target.querySelector("button")?.addEventListener("click", () => run(async () => {
          const data = await C.unpack(await download(target.querySelector("select").value), cached.key);
          if (!await hooks.confirm(data)) return;
          await setting("before-restore", { ...await hooks.checkpoint(), createdAt: Date.now() });
          await hooks.restore(data);
          cached.lastHash = undefined; dirty = true;
          status("자료를 복원했어요. 복원 전 자료도 이 휴대폰에 남겨 뒀어요.");
        }));
        status(lastText());
      }
      if (action === "undo") {
        const previous = await setting("before-restore");
        if (!previous) throw new Error("이 휴대폰에 복원 전 자료가 없어요.");
        if (previous.unreadable) throw new Error("복원 전 자료가 손상돼 자동으로 되돌릴 수 없어요. 원본은 이 휴대폰에 보관돼 있으니 관리자에게 알려 주세요.");
        if (!await hooks.confirm(previous.data)) return;
        await hooks.restore(previous.data); dirty = true; status("복원 전 휴대폰 자료로 되돌렸어요.");
      }
    })));
  };
  const init = async (callbacks) => {
    hooks = callbacks;
    if (!globalThis.crypto?.subtle) { status("안전한 연결이 필요해요. 앱을 HTTPS 주소나 localhost에서 열어 주세요.", true); draw(); return; }
    try {
      session = JSON.parse(localStorage.getItem(SESSION));
      if (!session?.user?.id || !session.refresh_token) session = null;
      cached = session ? await setting(session.user.id) : null;
      if (cached) status(lastText());
      schedule();
    } catch (_) { status("백업 설정을 읽지 못했어요. 다시 로그인해 주세요.", true); }
    draw();
  };
  window.addEventListener("online", () => { if (dirty) schedule(); });
  window.addEventListener("offline", () => { if (cached?.enabled) status("인터넷이 끊겼어요. 연결되면 다시 백업해요.", true); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && dirty) schedule(); });
  globalThis.DawonBackup = { init, changed, enabled: () => Boolean(cached?.enabled), mount: (element) => { host = element; draw(); }, summary: () => message };
})();
