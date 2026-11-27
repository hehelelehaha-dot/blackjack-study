/* Blackjack 学习app service worker.
   Shell is precached. Videos and Fish Audio mp3s are cached on first request.
   Range requests are answered from the cached full file so iOS can seek. */
const VERSION = "bj-v4";
const SHELL = "bj-shell-" + VERSION;
const MEDIA = "bj-media-" + VERSION;

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
  "./assets/handouts/card-values.jpg",
  "./assets/handouts/whiteboard.jpg",
  "./assets/handouts/splits.jpg",
  "./assets/handouts/payouts.jpg",
  "./assets/handouts/insurance.jpg",
  "./assets/handouts/rundown.jpg",
  "./assets/handouts/breaking.jpg",
  "./assets/handouts/terminology.jpg",
  "./assets/handouts/match.jpg",
  "./assets/handouts/kings.jpg",
  "./assets/handouts/policies.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== SHELL && key !== MEDIA).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

const buffers = new Map();
const fullLoads = new Map();

function isMedia(pathname) {
  return /\.(mp4|m4v|webm|mp3|m4a)$/i.test(pathname);
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
  const cached = await cache.match(url);
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
  const cache = await caches.open(SHELL);
  const cached = await cache.match(event.request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const fresh = await fetch(event.request);
    if (fresh && fresh.ok) {
      const copy = fresh.clone();
      event.waitUntil(cache.put(event.request, copy));
    }
    return fresh;
  } catch (err) {
    if (event.request.mode === "navigate") {
      return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
    }
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (isMedia(url.pathname)) {
    event.respondWith(handleMedia(event, url));
    return;
  }
  event.respondWith(handleShell(event));
});
