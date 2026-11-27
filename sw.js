/* Blackjack 学习app service worker.
   GET only, same origin. Shell is network-first. Videos, audio, captions, and the PDF
   stay in an unversioned media cache. Study records are never sent.
   YouTube stays on youtube-nocookie and is not cached.
   Range requests are answered from the cached full file so iOS can seek. */
const V = "bj-v9";
const SHELL = "bj-shell-" + V;
const MEDIA = "bj-media";

const SHELL_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./data/videos.json",
  "./data/curriculum.json",
  "./data/rules.json",
  "./data/english.json",
  "./data/drills.json",
  "./data/audio-lines.json",
  "./data/youtube.json",
  "./audio/index.json",
  "./assets/cards_clean.png",
  "./meta.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.all(SHELL_URLS.map((url) =>
      fetch(url, { cache: "no-store" }).then((res) => res.ok && cache.put(url, res)).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith("bj-shell-") && key !== SHELL).map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.t === "skip") self.skipWaiting();
});

const buffers = new Map();
const fullLoads = new Map();

function isMedia(pathname) {
  return /\.(mp4|m4v|webm|mp3|m4a|vtt|pdf)$/i.test(pathname);
}

function isMeta(pathname) {
  return /(?:^|\/)meta\.json$/i.test(pathname);
}

async function rememberFull(url, buf, type) {
  const cache = await caches.open(MEDIA);
  if (!(await cache.match(url))) {
    await cache.put(
      url,
      new Response(buf.slice(0), {
        status: 200,
        headers: {
          "Content-Type": type,
          "Content-Length": String(buf.byteLength),
          "Accept-Ranges": "bytes"
        }
      })
    );
  }
  if (buffers.size >= 1 && !buffers.has(url)) buffers.clear();
  buffers.set(url, buf);
  return buf;
}

async function cachedBuffer(url) {
  if (buffers.has(url)) return buffers.get(url);
  const cache = await caches.open(MEDIA);
  let cached = await cache.match(url);
  if (!cached) {
    const keys = await caches.keys();
    for (const key of keys) {
      if (!key.startsWith("bj-media-")) continue;
      const older = await caches.open(key);
      cached = await older.match(url);
      if (cached) break;
    }
  }
  if (!cached) return null;
  return rememberFull(url, await cached.arrayBuffer(), mediaType(url, cached.headers.get("content-type")));
}

function loadFull(url, type) {
  if (fullLoads.has(url)) return fullLoads.get(url);
  const job = (async () => {
    const existing = await cachedBuffer(url);
    if (existing) return existing;
    const res = await fetch(url);
    if (!res || !res.ok || res.status !== 200) throw new Error("full media fetch failed");
    const buf = await res.arrayBuffer();
    return rememberFull(url, buf, mediaType(url, res.headers.get("content-type") || type));
  })().finally(() => fullLoads.delete(url));
  fullLoads.set(url, job);
  return job;
}

function mediaType(pathname, header) {
  if (header) return header;
  if (/\.mp3$/i.test(pathname)) return "audio/mpeg";
  if (/\.m4a$/i.test(pathname)) return "audio/mp4";
  if (/\.pdf$/i.test(pathname)) return "application/pdf";
  if (/\.vtt$/i.test(pathname)) return "text/vtt";
  return "video/mp4";
}

function ranged(buf, range, type) {
  const size = buf.byteLength;
  const match = /bytes=(\d*)-(\d*)/i.exec(range || "");
  if (!match) {
    return new Response(buf.slice(0), {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes"
      }
    });
  }
  let start = match[1] === "" ? NaN : parseInt(match[1], 10);
  let end = match[2] === "" ? size - 1 : parseInt(match[2], 10);
  if (Number.isNaN(start)) start = Math.max(0, size - end);
  if (Number.isNaN(end) || end >= size) end = size - 1;
  if (start < 0 || start >= size || start > end) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": "bytes */" + size }
    });
  }
  const slice = buf.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    headers: {
      "Content-Type": type,
      "Content-Length": String(slice.byteLength),
      "Content-Range": "bytes " + start + "-" + end + "/" + size,
      "Accept-Ranges": "bytes"
    }
  });
}

async function handleMedia(event, url) {
  const range = event.request.headers.get("range");
  const type = mediaType(url.pathname, null);
  const cached = await cachedBuffer(url.href);
  if (cached) return ranged(cached, range, type);

  if (range) {
    const net = await fetch(event.request);
    // GitHub Pages answers Range with 206. A server that ignores Range
    // sends the whole file as 200; slice that so the video can still seek.
    if (net.status === 206) {
      event.waitUntil(loadFull(url.href, net.headers.get("content-type") || type).catch(() => {}));
      return net;
    }
    if (net.ok && net.status === 200) {
      const buf = await net.arrayBuffer();
      await rememberFull(url.href, buf, mediaType(url.pathname, net.headers.get("content-type")));
      return ranged(buf, range, mediaType(url.pathname, net.headers.get("content-type")));
    }
    return net;
  }

  const buf = await loadFull(url.href, type);
  return ranged(buf, null, type);
}

async function handleShell(event) {
  const req = event.request;
  const url = new URL(req.url);
  const cache = await caches.open(SHELL);
  const navigate = req.mode === "navigate";
  const meta = isMeta(url.pathname);
  const cacheKey = navigate ? "./index.html" : req;
  try {
    const fresh = await fetch(navigate ? "./index.html" : req.url, { cache: "no-store" });
    const type = (fresh.headers.get("content-type") || "").toLowerCase();
    if (fresh.ok && !(meta && type.includes("text/html"))) {
      event.waitUntil(cache.put(cacheKey, fresh.clone()));
    }
    if (meta && type.includes("text/html")) return Response.error();
    return fresh;
  } catch (err) {
    if (meta) {
      const hit = await cache.match("./meta.json", { ignoreSearch: true });
      return hit || Response.error();
    }
    const hit = await cache.match(cacheKey, { ignoreSearch: true });
    if (hit) return hit;
    if (navigate) return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/sw.js")) return;
  if (isMedia(url.pathname)) {
    event.respondWith(handleMedia(event, url));
    return;
  }
  event.respondWith(handleShell(event));
});
