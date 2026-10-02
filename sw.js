// 서비스 워커(service worker): 인터넷이 없어도 앱 화면이 열리도록 파일을 저장해 두는 역할
// 앱 파일을 고치면 아래 버전(CACHE) 이름과 app.js의 APP_VERSION을 함께 올려야 함
const CACHE = "dawon-v8";
const FILES = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  // cache: "reload" → 브라우저가 기억해 둔 옛 파일 말고 서버에서 새로 받아 저장
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// 인터넷이 되면 항상 서버의 최신 파일을 먼저 받고, 안 되면 저장해 둔 파일을 보여줌
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // 페이지 이동 요청은 그대로 다시 만들 수 없어서 주소로 새 요청을 만듦
  const fresh = e.request.mode === "navigate"
    ? new Request(e.request.url, { cache: "no-cache" })
    : new Request(e.request, { cache: "no-cache" });
  e.respondWith(
    fetch(fresh)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match("./")))
  );
});
