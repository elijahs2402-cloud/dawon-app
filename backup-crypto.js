// 백업 암호는 서버로 보내지 않으며, 이 휴대폰에는 추출 불가능한 CryptoKey만 보관한다.
(() => {
  "use strict";
  const ITERATIONS = 600000;
  const MAX_BYTES = 25 * 1024 * 1024;
  const enc = new TextEncoder();
  const base64 = (bytes) => {
    let text = "";
    for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(text);
  };
  const unbase64 = (text) => {
    if (typeof text !== "string" || text.length > MAX_BYTES * 2) throw new Error("백업 파일 형식이 올바르지 않아요.");
    return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  };
  const validate = (data) => {
    if (!data || data.version !== 1 || !["workers", "restaurants", "jobs", "assigns"].every((k) => Array.isArray(data[k]))) throw new Error("다원 백업 자료가 아니에요.");
    if (["workers", "restaurants", "jobs", "assigns"].some((k) => data[k].some((r) => !r || typeof r !== "object" || typeof r.id !== "string" || !r.id))) throw new Error("백업 자료의 항목이 손상됐어요.");
    if (data.photos && (typeof data.photos !== "object" || Array.isArray(data.photos) || Object.values(data.photos).some((v) => typeof v !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(v)))) throw new Error("사진 자료 형식이 올바르지 않아요.");
    return data;
  };
  const derive = async (password, salt) => {
    const raw = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: unbase64(salt), iterations: ITERATIONS, hash: "SHA-256" }, raw, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  };
  const pack = async (data, key, salt) => {
    validate(data);
    let bytes = enc.encode(JSON.stringify(data));
    if (bytes.length > MAX_BYTES) throw new Error("자료가 25MB를 넘어요. 사진을 줄인 뒤 다시 백업해 주세요.");
    const compressed = typeof CompressionStream !== "undefined";
    if (compressed) bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const meta = { format: "dawon-encrypted", version: 1, iterations: ITERATIONS, salt, iv: base64(iv), compression: compressed ? "gzip" : "none" };
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(JSON.stringify(meta)) }, key, bytes);
    const blob = new Blob([JSON.stringify({ ...meta, ciphertext: base64(new Uint8Array(cipher)) })], { type: "application/json" });
    if (blob.size > MAX_BYTES) throw new Error("암호화한 백업이 25MB를 넘어요. 사진을 줄여 주세요.");
    return blob;
  };
  const unpack = async (envelope, key) => {
    if (!envelope || envelope.format !== "dawon-encrypted" || envelope.version !== 1 || envelope.iterations !== ITERATIONS || !["none", "gzip"].includes(envelope.compression)) throw new Error("지원하지 않는 백업 형식이에요.");
    const { format, version, iterations, salt, iv, compression } = envelope;
    if (unbase64(salt).length !== 16 || unbase64(iv).length !== 12) throw new Error("백업 파일이 손상됐어요.");
    let plain;
    try {
      plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unbase64(iv), additionalData: enc.encode(JSON.stringify({ format, version, iterations, salt, iv, compression })) }, key, unbase64(envelope.ciphertext));
    } catch (_) { throw new Error("복구 암호가 다르거나 백업 파일이 손상됐어요. 암호를 확인해 주세요."); }
    let stream = new Blob([plain]).stream();
    if (compression === "gzip") {
      if (typeof DecompressionStream === "undefined") throw new Error("이 브라우저는 압축 백업을 열 수 없어요. 최신 크롬이나 사파리로 열어 주세요.");
      stream = stream.pipeThrough(new DecompressionStream("gzip"));
    }
    const reader = stream.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) { await reader.cancel(); throw new Error("복원할 자료가 너무 커요."); }
      chunks.push(value);
    }
    return validate(JSON.parse(await new Blob(chunks).text()));
  };
  globalThis.DawonBackupCrypto = { derive, pack, unpack, validate, base64, salt: () => base64(crypto.getRandomValues(new Uint8Array(16))), hash: async (data) => base64(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(JSON.stringify(data))))) };
})();
