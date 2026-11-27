/* Blackjack 学习app — static PWA. No build step. */
(function () {
  "use strict";

  const KEY = "bj-study-progress-v1";
  const app = document.getElementById("app");

  const state = loadState();
  let DB = null;
  let audioById = {};
  let audioIds = new Set();
  let timingIds = new Set();
  let currentAudio = null;
  let speakingId = null;
  let karaokeWords = null;
  let saveTimer = null;
  let toastTimer = null;
  let mountedVideo = null;
  let loopOn = false;
  let loopStart = 0;
  let loopEnd = 0;
  let quizRun = null;
  let session = null;
  let englishCat = "all";

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.videos = parsed.videos || {};
        parsed.notes = parsed.notes || {};
        parsed.drills = parsed.drills || {};
        parsed.ui = parsed.ui || {};
        parsed.youtube = parsed.youtube || {};
        return parsed;
      }
    } catch (err) {
      /* ignore broken storage */
    }
    return { videos: {}, notes: {}, drills: {}, ui: {}, youtube: {}, last: null };
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 350);
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function vstat(id) {
    if (!state.videos[id]) {
      state.videos[id] = { maxRatio: 0, lastTime: 0, passed: false, best: 0, attempts: 0 };
    }
    return state.videos[id];
  }

  function passLine() { return Number(DB.videos.pass_line) || 0.8; }
  function watchLine() { return Number(DB.videos.watch_line) || 0.8; }
  function neededCorrect(total) { return Math.ceil(total * passLine() - 1e-9); }

  function videosInModule(mid) {
    return DB.videos.videos
      .filter((video) => video.module_id === mid)
      .sort((a, b) => a.order - b.order);
  }

  function videoById(id) {
    return DB.videos.videos.find((video) => video.id === id) || null;
  }

  function moduleById(id) {
    return DB.videos.modules.find((mod) => mod.id === id) || null;
  }

  function isUnlocked(video) {
    const list = videosInModule(video.module_id);
    for (const prev of list) {
      if (prev.id === video.id) return true;
      if (!vstat(prev.id).passed) return false;
    }
    return true;
  }

  function nextInModule(video) {
    const list = videosInModule(video.module_id);
    const index = list.findIndex((item) => item.id === video.id);
    return list[index + 1] || null;
  }

  function lineText(id) {
    return audioById[id] ? audioById[id].text : "";
  }

  function fmt(sec) {
    const whole = Math.max(0, Math.floor(Number(sec) || 0));
    return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
  }

  function srcOf(video) {
    return "./videos/" + video.path;
  }

  function subsMode() {
    const mode = state.ui && state.ui.subs;
    return mode === "en" || mode === "off" ? mode : "both";
  }

  function cueAt(video, time) {
    const cues = video.cues || [];
    let current = null;
    cues.forEach((cue) => {
      if (Number(cue.t) <= time + 0.05) current = cue;
    });
    return current;
  }

  function subsButton(mode, label) {
    const on = subsMode() === mode;
    return `<button type="button" data-subs="${mode}" aria-pressed="${on ? "true" : "false"}" class="${on ? "on" : ""}">${label}</button>`;
  }

  function vttStamp(sec) {
    const ms = Math.max(0, Math.round((Number(sec) || 0) * 1000));
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const milli = ms % 1000;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(milli).padStart(3, "0");
  }

  function vttEscape(text) {
    return String(text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function buildVtt(video, mode) {
    const cues = video.cues || [];
    const limit = Number(video.duration_sec) || 0;
    const body = [
      "WEBVTT",
      "",
      "STYLE",
      "::cue { background: transparent; background-color: transparent; color: #fff; text-shadow: 0 1px 2px #000, 0 0 2px #000, 1px 1px 0 #000, -1px -1px 0 #000; font-size: 16px; }",
      ""
    ];
    cues.forEach((cue, index) => {
      const start = Number(cue.t) || 0;
      let end = cues[index + 1] ? Number(cues[index + 1].t) : (limit || start + 4);
      if (limit && end > limit) end = limit;
      if (!(end > start)) end = start + 0.4;
      if (cues[index + 1] && end - start > 0.12) end -= 0.05;
      const lines = [];
      if (cue.en) lines.push(vttEscape(cue.en));
      if (mode === "both" && cue.zh) lines.push(vttEscape(cue.zh));
      if (!lines.length) return;
      body.push(String(index + 1));
      body.push(vttStamp(start) + " --> " + vttStamp(end) + " line:-1 align:center size:92%");
      body.push(lines.join("\n"));
      body.push("");
    });
    return body.join("\n");
  }

  let subsUrls = [];

  function revokeSubs() {
    subsUrls.forEach((url) => URL.revokeObjectURL(url));
    subsUrls = [];
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function wrapFullscreen() {
    const wrap = document.getElementById("player-wrap");
    return !!(wrap && fullscreenElement() === wrap);
  }

  function nativeVideoFullscreen(player) {
    if (!player) return false;
    if (player.webkitDisplayingFullscreen) return true;
    return fullscreenElement() === player;
  }

  function applyCaptionTracks(player, force) {
    if (!player) return;
    const mode = subsMode();
    const native = force === true || (force !== false && nativeVideoFullscreen(player));
    const show = mode !== "off" && native && !wrapFullscreen();
    const want = mode === "en" ? "en" : "both";
    player.querySelectorAll("track[data-subs]").forEach((el) => {
      if (!el.track) return;
      el.track.mode = show && el.dataset.subs === want ? "showing" : "hidden";
    });
  }

  function mountCaptionTracks(player, video) {
    revokeSubs();
    ["both", "en"].forEach((mode) => {
      const blob = new Blob([buildVtt(video, mode)], { type: "text/vtt" });
      const url = URL.createObjectURL(blob);
      subsUrls.push(url);
      const track = document.createElement("track");
      track.kind = "subtitles";
      track.srclang = mode === "en" ? "en" : "zh";
      track.label = mode === "en" ? "English" : "中英双语";
      track.dataset.subs = mode;
      track.src = url;
      track.addEventListener("load", () => applyCaptionTracks(player));
      player.appendChild(track);
      if (track.track) track.track.mode = "hidden";
    });
  }

  function captionHtml(cue, mode) {
    if (!cue) return "";
    const en = cue.en ? `<span class="sub-en" lang="en">${esc(cue.en)}</span>` : "";
    const zh = mode === "both" && cue.zh ? `<span class="sub-zh">${esc(cue.zh)}</span>` : "";
    return en + zh;
  }

  function paintSubs(time, video) {
    const box = document.getElementById("subs");
    const mode = subsMode();
    if (box) {
      if (mode === "off") {
        box.hidden = true;
        box.innerHTML = "";
      } else {
        box.hidden = false;
        box.innerHTML = captionHtml(cueAt(video, time), mode);
      }
    }
    paintFs(time, video);
  }

  function paintFs(time, video) {
    const box = document.getElementById("fs-subs");
    if (!box) return;
    const mode = subsMode();
    if (!wrapFullscreen() || mode === "off") {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    box.innerHTML = captionHtml(cueAt(video, time), mode);
  }

  function syncFullscreen() {
    const player = document.getElementById("player");
    if (!player) return;
    applyCaptionTracks(player);
    const route = parseRoute();
    if (route.name === "video") {
      const video = videoById(route.id);
      if (video) paintSubs(player.currentTime || 0, video);
    }
  }

  async function toggleWrapFullscreen() {
    const wrap = document.getElementById("player-wrap");
    const player = document.getElementById("player");
    if (!wrap || !player) return;
    if (fullscreenElement()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) {
        try { await exit.call(document); } catch (err) { /* already leaving */ }
      }
      return;
    }
    const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    if (req) {
      try {
        await req.call(wrap);
        return;
      } catch (err) { /* iPhone may only fullscreen the video element */ }
    }
    if (typeof player.webkitEnterFullscreen === "function") {
      applyCaptionTracks(player, true);
      player.webkitEnterFullscreen();
      return;
    }
    toast("这台浏览器不能全屏");
  }

  function markSubsButtons() {
    const mode = subsMode();
    document.querySelectorAll(".subs-toggle [data-subs]").forEach((button) => {
      const on = button.dataset.subs === mode;
      button.classList.toggle("on", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function parseRoute() {
    const parts = (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean);
    if (!parts.length) return { name: "home" };
    if (parts[0] === "class") return { name: "class" };
    if (parts[0] === "m") return { name: "module", id: decodeURIComponent(parts[1] || "") };
    if (parts[0] === "v") {
      const id = decodeURIComponent(parts[1] || "");
      if (parts[2] === "quiz") return { name: "quiz", id: id };
      return { name: "video", id: id, tab: parts[2] || "overview" };
    }
    if (parts[0] === "en") return { name: "english" };
    if (parts[0] === "rules") {
      return parts[1] ? { name: "rule", id: decodeURIComponent(parts[1]) } : { name: "rules" };
    }
    if (parts[0] === "notes") return { name: "notes" };
    if (parts[0] === "practice") {
      return parts[1] ? { name: "drill", id: decodeURIComponent(parts[1]) } : { name: "practice" };
    }
    if (parts[0] === "settings") return { name: "settings" };
    if (parts[0] === "yt") return { name: "youtube", id: decodeURIComponent(parts[1] || "") };
    return { name: "home" };
  }

  function paintNav(name) {
    const map = {
      home: "home",
      class: "class",
      module: "class",
      video: "class",
      quiz: "class",
      locked: "class",
      youtube: "class",
      english: "english",
      rules: "rules",
      rule: "rules",
      notes: "notes",
      practice: "practice",
      drill: "practice",
      settings: "home"
    };
    const key = map[name] || "home";
    document.querySelectorAll("#tabbar a").forEach((link) => {
      if (link.dataset.nav === key) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function toast(message) {
    const el = document.getElementById("toast");
    el.hidden = false;
    el.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  function speakBtn(id) {
    const text = lineText(id);
    if (!text) return "";
    return `<button type="button" class="speak" data-speak="${esc(id)}" aria-label="朗读"><span class="mark" aria-hidden="true">▶</span><span class="speak-text" lang="en" data-karaoke="${esc(id)}">${esc(text)}</span></button>`;
  }

  const LOCK = '<svg class="lock" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V8a3 3 0 0 0-6 0v2z"/></svg>';

  function pill(video) {
    const st = vstat(video.id);
    if (!isUnlocked(video)) {
      return st.passed
        ? '<span class="pill ok">已过关 · 待解锁</span>'
        : '<span class="pill">未解锁</span>';
    }
    if (st.passed) return '<span class="pill ok">已过关</span>';
    if (st.maxRatio >= watchLine()) return '<span class="pill wait">待听懂题</span>';
    if (st.maxRatio > 0.02) return '<span class="pill">在看</span>';
    return '<span class="pill">未看</span>';
  }

  function videoRow(video) {
    const locked = !isUnlocked(video);
    if (locked) {
      const blocker = videosInModule(video.module_id).find((item) => item.order < video.order && !vstat(item.id).passed);
      const msg = blocker ? `先按本模块顺序通过：${blocker.title}` : "还没解锁";
      return `<button type="button" class="vrow is-locked" data-video="${esc(video.id)}" data-locked="true" data-lock-msg="${esc(msg)}">${LOCK}<span class="vmeta"><span lang="en">${esc(video.title)}</span> <span class="muted">${esc(video.duration || "")}</span><br><span class="muted">${esc(video.note)}</span></span>${pill(video)}</button>`;
    }
    return `<a class="vrow" href="#/v/${encodeURIComponent(video.id)}" data-video="${esc(video.id)}" data-locked="false"><span class="vmeta"><span lang="en">${esc(video.title)}</span> <span class="muted">${esc(video.duration || "")}</span><br><span class="muted">${esc(video.note)}</span></span>${pill(video)}</a>`;
  }

  function bar(title, href) {
    return `<header class="bar"><a class="back" href="${href}">返回</a><h1>${esc(title)}</h1></header>`;
  }

  function render() {
    const route = parseRoute();
    if (route.name === "video" && mountedVideo === route.id && document.getElementById("player")) {
      setTab(route.tab || "overview");
      paintNav(route.name);
      return;
    }
    stopYt();
    revokeSubs();
    mountedVideo = route.name === "video" ? route.id : null;
    if (route.name !== "quiz") quizRun = null;
    if (route.name !== "drill") session = null;
    loopOn = false;
    app.innerHTML = view(route);
    app.dataset.ready = "1";
    paintNav(route.name);
    bind(route);
    window.scrollTo(0, 0);
  }

  function view(route) {
    if (route.name === "home") return homeView();
    if (route.name === "class") return classView();
    if (route.name === "module") return moduleView(route.id);
    if (route.name === "video") return videoView(route.id, route.tab || "overview");
    if (route.name === "quiz") return quizView(route.id);
    if (route.name === "english") return englishView();
    if (route.name === "rules") return rulesView();
    if (route.name === "rule") return ruleView(route.id);
    if (route.name === "notes") return notesView();
    if (route.name === "practice") return practiceView();
    if (route.name === "drill") return drillView(route.id);
    if (route.name === "settings") return settingsView();
    if (route.name === "youtube") return youtubeView(route.id);
    return homeView();
  }

  function homeView() {
    const videos = DB.videos.videos;
    const passed = videos.filter((video) => vstat(video.id).passed).length;
    const ratio = videos.length ? Math.round((passed / videos.length) * 100) : 0;
    let cont = "";
    if (state.last && videoById(state.last.videoId)) {
      const video = videoById(state.last.videoId);
      const st = vstat(video.id);
      const pct = Math.round((st.maxRatio || 0) * 100);
      const next = st.passed ? nextInModule(video) : null;
      cont = `<a class="card gold" href="#/v/${encodeURIComponent(video.id)}/${esc(state.last.tab || "overview")}" style="text-decoration:none">
        <div class="muted">继续上次</div>
        <h2 lang="en">${esc(video.title)}</h2>
        <div class="muted">${esc(video.note)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="small">${st.passed ? "听懂题已过关" : "看到 " + pct + "%"}</div>
      </a>${next && isUnlocked(next) ? `<a class="card" href="#/v/${encodeURIComponent(next.id)}" style="text-decoration:none"><div class="muted">同模块下一条已解锁</div><strong lang="en">${esc(next.title)}</strong></a>` : ""}`;
    }
    return `<div data-screen="home">
      <header class="hero">
        <div class="hero-row">
          <div>
            <p class="kicker">BLACKJACK · TRAINING</p>
            <h1>Blackjack 学习app</h1>
          </div>
          <a class="icon-btn" href="#/settings" aria-label="设置">⚙</a>
        </div>
        <input id="q" class="search" type="search" placeholder="搜索视频、喊话、规则" autocomplete="off" enterkeyhint="search">
      </header>
      <div class="page">
        <div id="search-out"></div>
        ${cont}
        <div class="grid">
          <a class="area" href="#/class"><strong>课堂</strong><span>按台面顺序看视频</span></a>
          <a class="area" href="#/en"><strong>荷官英语</strong><span>喊话，点一下听</span></a>
          <a class="area" href="#/rules"><strong>游戏规则</strong><span>以讲义为准</span></a>
          <a class="area" href="#/notes"><strong>学习笔记</strong><span>只存在这台手机</span></a>
          <a class="area wide" href="#/practice"><strong>练习与复习</strong><span>赔付、点数、切筹、听懂题、综合模拟</span></a>
        </div>
        <div class="card" data-privacy-notice="home">
          <p>学习记录只保存在本机，清除浏览器数据会一起清掉。</p>
          <p class="small" lang="en">Study records stay on this device only. Clearing browser data deletes them.</p>
        </div>
        <div class="card">
          <div class="muted">听懂题进度</div>
          <strong>${passed} / ${videos.length} 条已过关</strong>
          <div class="bar-track"><div class="bar-fill" style="width:${ratio}%"></div></div>
          <p class="small muted">过关线 80%。进度保存在这台手机的浏览器里，清网站数据会丢。请加到主屏幕，并用笔记页导出备份。</p>
        </div>
      </div>
    </div>`;
  }

  function ytFor(moduleId) {
    return ((DB.youtube && DB.youtube.picks) || [])
      .filter((pick) => pick.module === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  function ytWatched(id) {
    return !!(state.youtube[id] && state.youtube[id].watched);
  }

  function ytRow(pick) {
    const warn = pick.notice ? '<span class="pill wait">桌规不同</span>' : "";
    const seen = ytWatched(pick.video_id) ? '<span class="pill ok">已看</span>' : '<span class="pill">补充课</span>';
    return `<a class="vrow" href="#/yt/${encodeURIComponent(pick.video_id)}" data-youtube="${esc(pick.video_id)}"><span class="vmeta"><span class="muted">补充课</span> <span lang="en">${esc(pick.title)}</span><br><span class="muted">${esc(pick.note_zh)}</span></span>${warn}${seen}</a>`;
  }

  function extraBlock(moduleId) {
    const picks = ytFor(moduleId);
    if (!picks.length) return "";
    return `<p class="vrow extra-label"><span>补充课</span></p>${picks.map(ytRow).join("")}`;
  }

  function playlistBlock() {
    const lists = (DB.youtube && DB.youtube.playlists) || [];
    if (!lists.length) return "";
    const rows = lists.map((list) => `<a class="hit" href="${esc(list.url)}" target="_blank" rel="noopener noreferrer"><span lang="en">${esc(list.title)}</span><div class="muted">${esc(list.channel)} · ${esc(String(list.video_count))} 集 · 在 YouTube 打开</div><div class="small">${esc(list.note_zh)}</div></a>`).join("");
    return `<h2 class="sec">更多</h2><div class="card">${rows}</div>`;
  }

  function classView() {
    const mods = DB.videos.modules.slice().sort((a, b) => a.order - b.order);
    const blocks = mods.map((mod) => {
      const vids = videosInModule(mod.id);
      const extra = extraBlock(mod.id);
      let rows = "";
      if (vids.length) rows = vids.map(videoRow).join("") + extra;
      else if (extra) rows = extra;
      else rows = '<p class="vrow"><span>视频即将到来</span></p>';
      const extraCount = ytFor(mod.id).length;
      const count = vids.length
        ? `${vids.length} 条视频${extraCount ? " · " + extraCount + " 条补充课" : ""}`
        : (extraCount ? extraCount + " 条补充课" : "还没有视频");
      return `<article class="mod" data-module="${esc(mod.id)}">
        <a class="mod-head" href="#/m/${esc(mod.id)}">
          <strong><span class="ord">${String(mod.order).padStart(2, "0")}</span> ${esc(mod.title_zh)}</strong>
          <div class="muted" lang="en">${esc(mod.title_en)} · ${count}</div>
        </a>
        ${rows}
      </article>`;
    }).join("");
    return `<div data-screen="class">
      ${bar("课堂", "#/")}
      <div class="page">
        <p class="callout">${esc(DB.videos.gate_zh)}</p>
        ${blocks}
        ${playlistBlock()}
      </div>
    </div>`;
  }

  function moduleView(id) {
    const mod = moduleById(id);
    if (!mod) return missing("没有这个模块");
    const cur = (DB.curriculum.modules && DB.curriculum.modules[id]) || {};
    const vids = videosInModule(id);
    const extra = extraBlock(id);
    let videoBlock = "";
    if (vids.length) videoBlock = vids.map(videoRow).join("") + extra;
    else if (extra) videoBlock = `<p class="vrow"><span class="muted">学校视频还没有。下面是补充课，不挡进度。</span></p>${extra}`;
    else videoBlock = '<div class="card"><strong>视频即将到来</strong><p class="muted">这个步骤先按下面的讲义和家中练习走。视频到了会排在这一模块里。</p></div>';
    const sections = (cur.sections || []).map((section) => `<h2 class="sec">${esc(section.h)}</h2><p>${esc(section.body)}</p>`).join("");
    const phrases = (cur.phrase_ids || []).map((pid) => {
      const phrase = DB.english.phrases.find((item) => item.audio_id === pid);
      return `<div class="card">${speakBtn(pid)}<p class="small">${esc(phrase ? phrase.zh : "")}</p><p class="muted small">${esc(phrase ? phrase.when_zh : "")}</p></div>`;
    }).join("");
    const patterns = (cur.pattern_ids || []).map((pid) => {
      const pattern = DB.english.patterns.find((item) => item.id === pid);
      return pattern ? patternCard(pattern) : "";
    }).join("");
    const checks = (cur.checks || []).map((item) => `<div class="card"><p>${esc(item.q)}</p><button type="button" class="btn" data-reveal>看答案</button><p class="answer" hidden><strong>${esc(item.a)}</strong></p></div>`).join("");
    const links = []
      .concat((cur.rule_ids || []).map((rid) => {
        const rule = DB.rules.sections.find((item) => item.id === rid);
        return rule ? `<a class="btn" href="#/rules/${esc(rid)}">${esc(rule.title_zh)}</a>` : "";
      }))
      .concat((cur.drill_ids || []).map((did) => {
        const drill = DB.drills.drills.find((item) => item.id === did);
        return drill ? `<a class="btn" href="#/practice/${esc(did)}">${esc(drill.title_zh)}</a>` : "";
      })).join("");
    return `<div data-screen="module">
      ${bar(mod.title_zh, "#/class")}
      <div class="page">
        <p class="muted" lang="en">${esc(mod.title_en)}</p>
        <p class="callout">${esc(cur.handout_zh || "")}</p>
        <h2 class="sec">视频</h2>
        <div class="mod">${videoBlock}</div>
        <h2 class="sec">学习目标</h2>
        <p>${esc(cur.goal_zh || "")}</p>
        ${sections}
        ${phrases ? `<h2 class="sec">这一步要听懂的英语</h2>${phrases}` : ""}
        ${patterns ? `<h2 class="sec">句型</h2>${patterns}` : ""}
        ${checks ? `<h2 class="sec">自测（不挡视频）</h2>${checks}` : ""}
        ${cur.retell_zh ? `<div class="card"><h3>30 秒复述</h3><p>${esc(cur.retell_zh)}</p><p class="muted small">辅线，不过关也不锁下一条。</p></div>` : ""}
        ${links ? `<h2 class="sec">相关规则和练习</h2><div class="row-btns" style="flex-wrap:wrap">${links}</div>` : ""}
      </div>
    </div>`;
  }

  function patternCard(pattern) {
    const opts = pattern.options.map((opt) => `<button type="button" class="opt" data-speak="${esc(opt.audio_id)}" data-pattern="${esc(pattern.id)}">${esc(opt.label)}</button>`).join("");
    return `<div class="card pattern" data-pattern-card="${esc(pattern.id)}">
      <p class="muted">${esc(pattern.title_zh || "点一个词，听完整句")}</p>
      <p lang="en">${esc(pattern.template)}</p>
      <div class="pattern-opts">${opts}</div>
      <p class="pattern-full muted" lang="en" data-pattern-full="${esc(pattern.id)}"></p>
    </div>`;
  }

  function videoView(id, tab) {
    const video = videoById(id);
    if (!video) return missing("没有这条视频");
    if (!isUnlocked(video)) {
      const prev = videosInModule(video.module_id).filter((item) => item.order < video.order).pop();
      return `<div data-screen="locked">
        ${bar("还没解锁", "#/class")}
        <div class="page">
          <div class="card">
            <h2 lang="en">${esc(video.title)}</h2>
            <p>先通过同模块上一条的听懂题。</p>
            ${prev ? `<p>上一条：<span lang="en">${esc(prev.title)}</span></p><a class="btn primary" href="#/v/${encodeURIComponent(prev.id)}">去上一条</a>` : ""}
          </div>
        </div>
      </div>`;
    }
    state.last = { videoId: video.id, tab: tab };
    saveSoon();
    const tabs = [
      ["overview", "概要"],
      ["transcript", "字幕"],
      ["english", "英语"],
      ["rules", "规则"],
      ["notes", "笔记"]
    ];
    const tabLinks = tabs.map(([key, label]) => `<a href="#/v/${encodeURIComponent(video.id)}/${key}" data-tab="${key}" class="${key === tab ? "on" : ""}">${label}</a>`).join("");
    const hide = `${state.ui.hideZh ? "hide-zh" : ""} ${state.ui.hideEn ? "hide-en" : ""}`;
    return `<div data-screen="video">
      <header class="bar"><a class="back" href="#/m/${esc(video.module_id)}">返回</a><h1 lang="en">${esc(video.title)}</h1></header>
      <div class="stage">
        <div class="player-wrap" id="player-wrap">
          <video id="player" class="player" playsinline webkit-playsinline controls preload="metadata" src="${esc(srcOf(video))}"></video>
          <div id="fs-subs" class="fs-subs" hidden></div>
          <button type="button" id="fs-exit" class="fs-exit">退出全屏</button>
        </div>
        <div id="subs" class="subs" aria-live="polite"></div>
        <div class="subs-toggle" role="group" aria-label="字幕">
          ${subsButton("both", "中英双语")}
          ${subsButton("en", "纯英文")}
          ${subsButton("off", "关")}
        </div>
        <div class="transport">
          <button type="button" data-rate="0.75">0.75×</button>
          <button type="button" data-rate="1" class="on">1×</button>
          <button type="button" data-rate="1.25">1.25×</button>
          <button type="button" id="loop-btn">单句循环</button>
          <button type="button" id="fs-btn">全屏</button>
        </div>
      </div>
      <div class="vtitle">
        <h2 lang="en">${esc(video.title)}</h2>
        <p class="muted">${esc(video.note)}</p>
      </div>
      <div class="tabs" role="tablist">${tabLinks}</div>
      <div id="panels" class="${hide}">
        <section class="panel" data-panel="overview" ${tab === "overview" ? "" : "hidden"}>${overviewPanel(video)}</section>
        <section class="panel" data-panel="transcript" ${tab === "transcript" ? "" : "hidden"}>${transcriptPanel(video)}</section>
        <section class="panel" data-panel="english" ${tab === "english" ? "" : "hidden"}>${englishPanel(video)}</section>
        <section class="panel" data-panel="rules" ${tab === "rules" ? "" : "hidden"}>${rulesPanel(video)}</section>
        <section class="panel" data-panel="notes" ${tab === "notes" ? "" : "hidden"}>${notesPanel(video)}</section>
      </div>
      <div class="quiz-bar">
        <p id="watch-note" class="small muted"></p>
        <a class="btn primary" id="quiz-link" href="#/v/${encodeURIComponent(video.id)}/quiz">做听懂题</a>
      </div>
    </div>`;
  }

  function ytNotice(pick) {
    if (!pick.notice) {
      return pick.house_rule_differences ? `<p class="small muted">${esc(pick.house_rule_differences)}</p>` : "";
    }
    const kind = pick.notice.kind === "skip" ? "skip" : "remind";
    return `<div class="callout ${kind === "remind" ? "felt" : ""}" data-warn="${kind}">${esc(pick.notice.text_zh)}</div>`;
  }

  function youtubeView(id) {
    const pick = ((DB.youtube && DB.youtube.picks) || []).find((item) => item.video_id === id);
    if (!pick) return missing("没有这条补充课");
    const online = navigator.onLine;
    const player = online
      ? `<div class="yt-frame"><div id="yt-mount"></div></div>`
      : `<div class="card" data-offline="youtube"><p>需要联网才能播放这条补充课。</p><p lang="en">needs internet</p></div>`;
    const watched = ytWatched(pick.video_id);
    const level = pick.english_difficulty === "easy" ? "英语 easy" : "英语 medium";
    const notice = ytNotice(pick);
    return `<div data-screen="youtube" data-yt-id="${esc(pick.video_id)}">
      ${bar("补充课", "#/m/" + esc(pick.module))}
      ${notice ? `<div class="page" style="padding-bottom:0">${notice}</div>` : ""}
      ${player}
      <div class="page">
        <p class="muted">补充课 · 不计入过关，也不锁别的视频</p>
        <p class="small" data-yt-subs>中英双语字幕只在学校视频上。补充课请开英文字幕；YouTube 自己的设置里可以自动翻译。</p>
        <h2 lang="en">${esc(pick.title)}</h2>
        <p class="small muted">${esc(pick.channel)} · ${esc(pick.duration)} · ${level}</p>
        <p>${esc(pick.note_zh)}</p>
        ${pick.start ? `<p class="small">这条从 ${fmt(pick.start)} 开始播。前面是另一种发牌，先看鞋台这一段。</p>` : ""}
        <button type="button" class="btn" data-yt-toggle="${esc(pick.video_id)}">${watched ? "取消已看" : "标为已看"}</button>
        <a class="btn" href="${esc(pick.url)}" target="_blank" rel="noopener noreferrer">在 YouTube 打开</a>
      </div>
    </div>`;
  }

  let ytPlayer = null;
  let ytTimer = null;
  let ytApiPromise = null;

  function stopYt() {
    if (ytTimer) clearInterval(ytTimer);
    ytTimer = null;
    if (ytPlayer && ytPlayer.destroy) {
      try { ytPlayer.destroy(); } catch (err) { /* player already gone */ }
    }
    ytPlayer = null;
  }

  function loadYtApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === "function") previous();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => reject(new Error("youtube api"));
      document.head.appendChild(script);
      setTimeout(() => reject(new Error("youtube api timeout")), 8000);
    });
    return ytApiPromise;
  }

  function armSkip(ranges) {
    if (!ranges.length || ytTimer) return;
    ytTimer = setInterval(() => {
      if (!ytPlayer || typeof ytPlayer.getCurrentTime !== "function") return;
      let time = 0;
      try { time = ytPlayer.getCurrentTime(); } catch (err) { return; }
      ranges.forEach((range) => {
        if (time >= range.start && time < range.end - 0.2) {
          try { ytPlayer.seekTo(range.end, true); } catch (err) { /* seek unavailable until play starts */ }
        }
      });
    }, 400);
  }

  function mountYt(pick) {
    if (!navigator.onLine || !document.getElementById("yt-mount")) return;
    const ranges = Array.isArray(pick.skip) ? pick.skip : [];
    loadYtApi().then(() => {
      if (!document.getElementById("yt-mount")) return;
      ytPlayer = new window.YT.Player("yt-mount", {
        videoId: pick.video_id,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: {
          playsinline: 1,
          rel: 0,
          cc_load_policy: 1,
          cc_lang_pref: "en",
          start: pick.start || 0,
          origin: location.origin
        },
        events: {
          onReady: () => armSkip(ranges),
          onStateChange: () => armSkip(ranges)
        }
      });
    }).catch(() => {
      const mount = document.getElementById("yt-mount");
      if (!mount) return;
      const start = pick.start ? "&start=" + Number(pick.start) : "";
      mount.outerHTML = `<iframe title="${esc(pick.title)}" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(pick.video_id)}?playsinline=1&rel=0&cc_load_policy=1&cc_lang_pref=en${start}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    });
  }

  function overviewPanel(video) {
    const ov = video.overview || {};
    const points = (ov.points || []).map((point) => `<button type="button" class="cue" data-seek="${Number(point.t)}"><time>${fmt(point.t)}</time><span>${esc(point.zh)}</span></button>`).join("");
    const mistakes = (ov.mistakes_zh || []).map((item) => `<li>${esc(item)}</li>`).join("");
    return `<p>${esc(ov.summary_zh || "")}</p>
      ${points ? `<h2 class="sec">讲师强调</h2>${points}` : ""}
      ${mistakes ? `<h2 class="sec">易错</h2><ul class="clean">${mistakes}</ul>` : ""}
      ${video.transcript_note ? `<p class="callout">${esc(video.transcript_note)}</p>` : ""}`;
  }

  function transcriptPanel(video) {
    const cues = (video.cues || []).map((cue, index) => `<button type="button" class="cue" data-seek="${Number(cue.t)}" data-cue="${index}"><time>${fmt(cue.t)}</time><span class="en" lang="en">${esc(cue.en)}</span><span class="zh">${esc(cue.zh)}</span></button>`).join("");
    return `<div class="toggles">
        <button type="button" id="hide-en" class="btn">隐藏英文</button>
        <button type="button" id="hide-zh" class="btn">隐藏中文</button>
      </div>
      ${video.transcript_note ? `<p class="callout">${esc(video.transcript_note)}</p>` : ""}
      ${cues}`;
  }

  function englishPanel(video) {
    const gloss = (video.glossary || []).map((item) => `<div class="card">
        <strong lang="en">${esc(item.term_en)}</strong>
        <p>${esc(item.term_zh)}</p>
        <p class="muted small">听到的说法：<span lang="en">${esc(item.heard_as || "")}</span></p>
        ${speakBtn(item.audio_id)}
      </div>`).join("");
    const dict = (video.dictation_lines || []).map((item) => `<div class="card">${speakBtn(item.audio_id)}<p class="zh">${esc(item.zh)}</p></div>`).join("");
    return `${gloss}<h2 class="sec">听写句</h2>${dict}<p class="muted small"><a href="#/en">去荷官英语看全部喊话</a></p>`;
  }

  function rulesPanel(video) {
    const blocks = (video.rules || []).map((rule) => `<div class="card"><div class="muted">${esc(rule.source_zh)}</div><p>${esc(rule.text_zh)}</p></div>`).join("");
    const links = (video.rule_ids || []).map((rid) => {
      const rule = DB.rules.sections.find((item) => item.id === rid);
      return rule ? `<a class="btn" href="#/rules/${esc(rid)}">${esc(rule.title_zh)}</a>` : "";
    }).join("");
    return `${blocks}${links ? `<div class="row-btns" style="flex-wrap:wrap">${links}</div>` : ""}`;
  }

  function notesPanel(video) {
    return `<p class="muted small">写在这台手机上。换浏览器或清除网站数据会丢。</p>
      <textarea class="note-box" id="note-box" placeholder="这一条我要记住…"></textarea>
      <div class="row-btns">
        <button type="button" class="btn" id="copy-note">复制这条笔记</button>
        <a class="btn" href="#/notes">全部笔记</a>
      </div>`;
  }

  function setTab(tab) {
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tab;
    });
    document.querySelectorAll("[data-tab]").forEach((link) => {
      link.classList.toggle("on", link.dataset.tab === tab);
    });
    if (state.last) {
      state.last.tab = tab;
      saveSoon();
    }
  }

  function bindVideo(video) {
    const player = document.getElementById("player");
    if (!player) return;
    player.playsInline = true;
    const st = vstat(video.id);
    const mark = () => {
      if (!player.duration || !isFinite(player.duration)) return;
      const ratio = Math.min(1, player.currentTime / player.duration);
      if (ratio > st.maxRatio) st.maxRatio = ratio;
      st.lastTime = player.currentTime;
      state.last = { videoId: video.id, tab: (parseRoute().tab) || "overview" };
      saveSoon();
      updateWatchUI(video);
      highlightCue(player.currentTime, video);
      paintSubs(player.currentTime, video);
      if (loopOn && loopEnd && player.currentTime >= loopEnd - 0.08) player.currentTime = loopStart;
    };
    player.addEventListener("timeupdate", mark);
    player.addEventListener("seeked", mark);
    player.addEventListener("ended", () => {
      st.maxRatio = 1;
      save();
      updateWatchUI(video);
    });
    player.addEventListener("loadedmetadata", () => {
      if (st.lastTime > 1 && st.lastTime < player.duration - 0.5) player.currentTime = st.lastTime;
      updateWatchUI(video);
      paintSubs(player.currentTime || 0, video);
    });
    player.addEventListener("webkitbeginfullscreen", () => applyCaptionTracks(player, true));
    player.addEventListener("webkitendfullscreen", () => {
      applyCaptionTracks(player, false);
      paintSubs(player.currentTime || 0, video);
    });
    mountCaptionTracks(player, video);
    paintSubs(player.currentTime || 0, video);
    markSubsButtons();
    document.querySelectorAll(".subs-toggle [data-subs]").forEach((button) => {
      button.addEventListener("click", () => {
        state.ui.subs = button.dataset.subs;
        save();
        markSubsButtons();
        paintSubs(player.currentTime || 0, video);
        applyCaptionTracks(player);
      });
    });
    const fsBtn = document.getElementById("fs-btn");
    if (fsBtn) fsBtn.addEventListener("click", () => { toggleWrapFullscreen(); });
    const fsExit = document.getElementById("fs-exit");
    if (fsExit) fsExit.addEventListener("click", () => { toggleWrapFullscreen(); });
    document.querySelectorAll("[data-rate]").forEach((button) => {
      button.addEventListener("click", () => {
        player.playbackRate = Number(button.dataset.rate);
        document.querySelectorAll("[data-rate]").forEach((item) => item.classList.toggle("on", item === button));
      });
    });
    const loopBtn = document.getElementById("loop-btn");
    if (loopBtn) {
      loopBtn.addEventListener("click", () => {
        loopOn = !loopOn;
        loopBtn.classList.toggle("on", loopOn);
        if (loopOn) armLoop(player.currentTime, video);
      });
    }
    const hideEn = document.getElementById("hide-en");
    const hideZh = document.getElementById("hide-zh");
    if (hideEn) hideEn.addEventListener("click", () => toggleHide("hideEn"));
    if (hideZh) hideZh.addEventListener("click", () => toggleHide("hideZh"));
    const box = document.getElementById("note-box");
    if (box) {
      box.value = state.notes[video.id] || "";
      box.addEventListener("input", () => {
        state.notes[video.id] = box.value;
        saveSoon();
      });
    }
    const copy = document.getElementById("copy-note");
    if (copy) copy.addEventListener("click", () => copyText(state.notes[video.id] || ""));
    updateWatchUI(video);
    applyHide();
  }

  function toggleHide(key) {
    state.ui[key] = !state.ui[key];
    saveSoon();
    applyHide();
  }

  function applyHide() {
    const panels = document.getElementById("panels");
    if (!panels) return;
    panels.classList.toggle("hide-zh", !!state.ui.hideZh);
    panels.classList.toggle("hide-en", !!state.ui.hideEn);
  }

  function updateWatchUI(video) {
    const note = document.getElementById("watch-note");
    if (!note) return;
    const st = vstat(video.id);
    const pct = Math.round((st.maxRatio || 0) * 100);
    const need = Math.round(watchLine() * 100);
    note.textContent = st.maxRatio >= watchLine()
      ? `已看到 ${pct}%。可以做听懂题。`
      : `已看到 ${pct}%。看到 ${need}% 之后才能做听懂题。`;
  }

  function highlightCue(time, video) {
    const cues = video.cues || [];
    let active = -1;
    cues.forEach((cue, index) => {
      if (cue.t <= time + 0.05) active = index;
    });
    document.querySelectorAll("[data-cue]").forEach((el) => {
      el.classList.toggle("on", Number(el.dataset.cue) === active);
    });
  }

  function armLoop(time, video) {
    const cues = video.cues || [];
    let index = 0;
    cues.forEach((cue, i) => { if (cue.t <= time + 0.2) index = i; });
    const cue = cues[index];
    if (!cue) return;
    loopStart = cue.t;
    loopEnd = cues[index + 1] ? cues[index + 1].t : cue.t + 5;
  }

  function quizView(id) {
    const video = videoById(id);
    if (!video) return missing("没有这条视频");
    if (!isUnlocked(video)) return videoView(id, "overview");
    const st = vstat(video.id);
    if (st.maxRatio < watchLine()) {
      return `<div data-screen="quiz-locked">${bar("听懂题", `#/v/${encodeURIComponent(id)}`)}
        <div class="page"><div class="card"><p>请先把这条视频看到 ${Math.round(watchLine() * 100)}% 以上，再做听懂题。</p>
        <a class="btn primary" href="#/v/${encodeURIComponent(id)}">回去看视频</a></div></div></div>`;
    }
    quizRun = { id: video.id, i: 0, picks: [], done: false, result: null };
    return `<div data-screen="quiz">${bar("听懂题", `#/v/${encodeURIComponent(id)}`)}<div class="page" id="quiz-body"></div></div>`;
  }

  function paintQuiz() {
    const body = document.getElementById("quiz-body");
    if (!body || !quizRun) return;
    const video = videoById(quizRun.id);
    const questions = video.listening_questions || [];
    if (quizRun.done) {
      body.innerHTML = quizResult(video, questions);
      const again = document.getElementById("quiz-again");
      if (again) again.addEventListener("click", () => {
        quizRun = { id: video.id, i: 0, picks: [], done: false, result: null };
        paintQuiz();
      });
      return;
    }
    const q = questions[quizRun.i];
    const choices = q.choices.map((choice, index) => {
      const on = quizRun.picks[quizRun.i] === index ? " on" : "";
      return `<button type="button" class="choice${on}" data-choice="${index}"><span class="en" lang="en">${esc(choice.en)}</span><span class="zh">${esc(choice.zh)}</span></button>`;
    }).join("");
    const last = quizRun.i === questions.length - 1;
    body.innerHTML = `<p class="muted">第 ${quizRun.i + 1} / ${questions.length} 题 · 通过线 ${Math.round(passLine() * 100)}%（至少 ${neededCorrect(questions.length)} 题）</p>
      <h2>${esc(q.q_zh)}</h2>
      <p lang="en">${esc(q.q_en)}</p>
      ${choices}
      <button type="button" class="btn primary" id="quiz-next">${last ? "提交" : "下一题"}</button>`;
    document.getElementById("quiz-next").addEventListener("click", () => {
      if (quizRun.picks[quizRun.i] == null) {
        toast("先选一个答案");
        return;
      }
      if (quizRun.i < questions.length - 1) {
        quizRun.i += 1;
        paintQuiz();
        return;
      }
      gradeQuiz(video, questions);
      paintQuiz();
    });
  }

  function gradeQuiz(video, questions) {
    let correct = 0;
    const detail = questions.map((q, index) => {
      const pick = quizRun.picks[index];
      const right = q.choices.findIndex((choice) => choice.en === q.answer_en);
      const ok = pick === right;
      if (ok) correct += 1;
      return { ok, pick, right, q };
    });
    const ratio = correct / questions.length;
    const passed = ratio + 1e-9 >= passLine();
    const st = vstat(video.id);
    st.attempts += 1;
    st.best = Math.max(st.best || 0, ratio);
    if (passed) st.passed = true;
    st.lastQuiz = {
      correct: correct,
      total: questions.length,
      ratio: ratio,
      passed: passed,
      wrong: detail.filter((item) => !item.ok).map((item) => ({
        q_zh: item.q.q_zh,
        q_en: item.q.q_en,
        picked_zh: item.q.choices[item.pick] ? item.q.choices[item.pick].zh : "",
        answer_zh: item.q.answer_zh,
        answer_en: item.q.answer_en
      }))
    };
    save();
    quizRun.done = true;
    quizRun.result = { correct, total: questions.length, ratio, passed, detail };
  }

  function quizResult(video, questions) {
    const result = quizRun.result;
    const next = nextInModule(video);
    const lines = result.detail.map((item, index) => {
      if (item.ok) return "";
      return `<div class="card"><p>第 ${index + 1} 题</p><p>${esc(item.q.answer_zh)}</p><p class="muted" lang="en">${esc(item.q.answer_en)}</p></div>`;
    }).join("");
    const nextLink = result.passed && next
      ? `<a class="btn primary" href="#/v/${encodeURIComponent(next.id)}">下一条已解锁</a>`
      : `<a class="btn" href="#/class">返回课堂</a>`;
    return `<p class="pass-mark" data-result="${result.passed ? "pass" : "fail"}">${result.passed ? "过关" : "还没过"}</p>
      <p>${result.correct} / ${result.total} · ${Math.round(result.ratio * 100)}%（通过线 ${Math.round(passLine() * 100)}%）</p>
      ${result.passed ? "<p>同模块的下一条视频已解锁。成绩会留在这台手机上。</p>" : "<p>再看一遍讲师原话，然后重做。已经过关的不会被这次取消。</p>"}
      ${lines}
      <button type="button" class="btn" id="quiz-again">再做一次</button>
      ${nextLink}`;
  }

  function englishView() {
    const cats = [{ id: "all", title_zh: "全部" }].concat(DB.english.categories);
    const chips = cats.map((cat) => `<button type="button" class="opt ${englishCat === cat.id ? "on" : ""}" data-cat="${esc(cat.id)}">${esc(cat.title_zh)}</button>`).join("");
    const phrases = DB.english.phrases.map((phrase) => `<div class="card phrase" data-cat="${esc(phrase.cat)}">
        ${speakBtn(phrase.audio_id)}
        <p>${esc(phrase.zh)}</p>
        <p class="muted small">${esc(phrase.when_zh)}</p>
        <p class="muted small">${esc(phrase.source_zh)}</p>
      </div>`).join("");
    const patterns = DB.english.patterns.map((pattern) => `<div data-cat="${esc(pattern.cat)}" class="phrase">${patternCard(pattern)}</div>`).join("");
    return `<div data-screen="english">${bar("荷官英语", "#/")}
      <div class="page">
        <p class="muted">点一下听。有 mp3 就播录音，没有就暂时用浏览器的美式英语。</p>
        <div class="chips" id="cats">${chips}</div>
        <h2 class="sec">句型</h2>
        ${patterns}
        <h2 class="sec">喊话和短语</h2>
        ${phrases}
      </div>
    </div>`;
  }

  function applyEnglishFilter() {
    document.querySelectorAll("#cats .opt").forEach((button) => {
      button.classList.toggle("on", button.dataset.cat === englishCat);
    });
    document.querySelectorAll(".phrase").forEach((el) => {
      el.hidden = englishCat !== "all" && el.dataset.cat !== englishCat;
    });
  }

  function rulesView() {
    const items = DB.rules.sections.map((section) => `<a class="card" style="text-decoration:none" href="#/rules/${esc(section.id)}">
      <strong>${esc(section.title_zh)}</strong>
      <div class="muted" lang="en">${esc(section.title_en)}</div>
      <div class="small muted">${esc(section.source_zh)}</div>
    </a>`).join("");
    return `<div data-screen="rules">${bar("游戏规则", "#/")}
      <div class="page">
        <p class="callout">数字和程序以这版讲义为准。讲义没写的会标明。Turning Stone 考试日期、笔试还是上桌：没记录。</p>
        <a class="btn primary" id="download-pdf" href="./handouts/Blackjack_Training_Exact.pdf" download="Blackjack_Training_Exact.pdf">下载讲义 PDF</a>
        ${items}
      </div>
    </div>`;
  }

  function ruleView(id) {
    const section = DB.rules.sections.find((item) => item.id === id);
    if (!section) return missing("没有这一节");
    const blocks = (section.blocks || []).map(renderBlock).join("");
    return `<div data-screen="rule">${bar(section.title_zh, "#/rules")}
      <div class="page">
        <p class="muted" lang="en">${esc(section.title_en)}</p>
        <p class="small muted">${esc(section.source_zh)}</p>
        ${blocks}
      </div>
    </div>`;
  }

  function renderBlock(block) {
    if (block.type === "p") return `<p>${esc(block.text)}</p>`;
    if (block.type === "quote") {
      return `<blockquote class="quote" lang="en">${esc(block.en)}</blockquote>${block.zh ? `<p class="muted">${esc(block.zh)}</p>` : ""}`;
    }
    if (block.type === "callout") return `<div class="callout ${esc(block.tone || "")}">${esc(block.text)}</div>`;
    if (block.type === "image") {
      return `<button type="button" class="shot" data-full="${esc(block.src)}"><img src="${esc(block.src)}" alt="${esc(block.alt || "讲义")}">点开看原件</button>`;
    }
    if (block.type === "table") {
      const head = "<tr>" + block.headers.map((cell) => `<th>${esc(cell)}</th>`).join("") + "</tr>";
      const rows = block.rows.map((row) => "<tr>" + row.map((cell) => `<td>${esc(cell)}</td>`).join("") + "</tr>").join("");
      return `<div class="hscroll"><table><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
    }
    if (block.type === "paycards") {
      return block.cards.map((card) => `<div class="paycard"><strong>${esc(card.title)}</strong>${card.lines.map((line) => `<div>${esc(line)}</div>`).join("")}</div>`).join("");
    }
    if (block.type === "calls") return (block.audio_ids || []).map(speakBtn).join("");
    return "";
  }

  function notesView() {
    const cards = DB.videos.videos.map((video) => `<div class="card">
      <h3 lang="en">${esc(video.title)}</h3>
      <textarea class="note-box" data-note="${esc(video.id)}" placeholder="还没有笔记">${esc(state.notes[video.id] || "")}</textarea>
    </div>`).join("");
    return `<div data-screen="notes">${bar("学习笔记", "#/")}
      <div class="page">
        <p class="muted">每条视频一份。保存在这台手机。</p>
        <div class="row-btns">
          <button type="button" class="btn" id="copy-all">复制全部</button>
          <button type="button" class="btn" id="export-notes">导出文本</button>
        </div>
        <pre id="export-preview" class="card" hidden></pre>
        ${cards}
      </div>
    </div>`;
  }

  function notesText() {
    const lines = ["Blackjack 学习app 笔记", ""];
    DB.videos.videos.forEach((video) => {
      lines.push("## " + video.title);
      lines.push((state.notes[video.id] || "").trim() || "（空）");
      lines.push("");
    });
    return lines.join("\n");
  }

  function practiceView() {
    const cards = DB.drills.drills.map((drill) => {
      const stat = state.drills[drill.id];
      const best = stat ? `最好 ${Math.round(stat.best * 100)}%` : "";
      return `<a class="card" style="text-decoration:none" href="#/practice/${esc(drill.id)}">
        <strong>${esc(drill.title_zh)}</strong>
        <div class="muted" lang="en">${esc(drill.title_en || "")}</div>
        <p class="small">${esc(drill.blurb_zh || "")}</p>
        ${best ? `<p class="small muted">${best}</p>` : ""}
      </a>`;
    }).join("");
    return `<div data-screen="practice">${bar("练习与复习", "#/")}<div class="page">${cards}</div></div>`;
  }

  function drillView(id) {
    const drill = DB.drills.drills.find((item) => item.id === id);
    if (!drill) return missing("没有这个练习");
    if (drill.kind === "listening") return listeningView(drill);
    session = {
      id: drill.id,
      i: 0,
      order: drill.questions.map((_, index) => index),
      correct: 0,
      checked: false,
      finished: false
    };
    return `<div data-screen="drill">${bar(drill.title_zh, "#/practice")}<div class="page" id="drill-body"></div></div>`;
  }

  function listeningView(drill) {
    const passed = DB.videos.videos.filter((video) => vstat(video.id).passed);
    const list = passed.length
      ? passed.map((video) => `<a class="hit" href="#/v/${encodeURIComponent(video.id)}/quiz"><span lang="en">${esc(video.title)}</span><div class="muted">再做一遍听懂题</div></a>`).join("")
      : "<p>还没有过关的视频。看完一条并通过听懂题之后，可以在这里重做。</p>";
    return `<div data-screen="drill">${bar(drill.title_zh, "#/practice")}<div class="page"><p>${esc(drill.blurb_zh || "")}</p>${list}</div></div>`;
  }

  function paintDrill() {
    const body = document.getElementById("drill-body");
    if (!body || !session) return;
    const drill = DB.drills.drills.find((item) => item.id === session.id);
    const total = session.order.length;
    if (session.finished) {
      const ratio = total ? session.correct / total : 0;
      const stat = state.drills[drill.id] || { best: 0, last: 0 };
      stat.last = ratio;
      stat.best = Math.max(stat.best || 0, ratio);
      state.drills[drill.id] = stat;
      save();
      body.innerHTML = `<p class="pass-mark" data-drill-result="done">${session.correct} / ${total}</p>
        <p>${Math.round(ratio * 100)}%。这组成绩存在这台手机上。最好 ${Math.round(stat.best * 100)}%。</p>
        <p class="muted">练习不代替听懂题，也不会解锁视频。</p>
        <button type="button" class="btn primary" id="drill-restart">再来一组</button>
        <a class="btn" href="#/practice">返回练习</a>`;
      document.getElementById("drill-restart").addEventListener("click", () => {
        session.i = 0;
        session.correct = 0;
        session.checked = false;
        session.finished = false;
        session.order = session.order.slice().reverse();
        paintDrill();
      });
      return;
    }
    const q = drill.questions[session.order[session.i]];
    body.innerHTML = `<p class="muted">${esc(drill.blurb_zh || "")}</p>
      <p class="small muted">第 ${session.i + 1} / ${total}</p>
      ${questionHTML(q)}
      <div id="explain"></div>
      <button type="button" class="btn primary" id="drill-check">${session.checked ? (session.i === total - 1 ? "看成绩" : "下一题") : "核对"}</button>`;
    const box = document.getElementById("note-box");
    if (box && q.prefill) box.value = "";
    document.getElementById("drill-check").addEventListener("click", () => onDrillCheck(drill, q, total));
    document.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        if (session.checked) return;
        session.pick = Number(button.dataset.choice);
        document.querySelectorAll("[data-choice]").forEach((item) => item.classList.toggle("on", item === button));
      });
    });
    document.querySelectorAll("[data-kind]").forEach((button) => {
      button.addEventListener("click", () => {
        if (session.checked) return;
        session.kind = button.dataset.kind;
        document.querySelectorAll("[data-kind]").forEach((item) => item.classList.toggle("on", item === button));
      });
    });
  }

  function questionHTML(q) {
    const spoken = q.audio_id ? speakBtn(q.audio_id) : "";
    if (q.type === "choice") {
      const choices = q.choices.map((choice, index) => `<button type="button" class="choice" data-choice="${index}">${esc(choice)}</button>`).join("");
      return `<h2>${esc(q.prompt_zh)}</h2>${q.prompt_en ? `<p lang="en">${esc(q.prompt_en)}</p>` : ""}${spoken}${choices}`;
    }
    if (q.type === "hand") {
      return `<h2>这手牌是多少？</h2><p class="pass-mark" lang="en">${esc(q.cards)}</p>${spoken}
        <div class="kinds">
          <button type="button" data-kind="soft">软牌</button>
          <button type="button" data-kind="hard">硬牌</button>
          <button type="button" data-kind="bust">爆牌</button>
        </div>
        <label class="small">总数<input id="total-box" class="field" inputmode="numeric" autocomplete="off"></label>`;
    }
    return `<h2>${esc(q.prompt_zh)}</h2>${q.prompt_en ? `<p lang="en">${esc(q.prompt_en)}</p>` : ""}${spoken}
      <input id="total-box" class="field" inputmode="decimal" autocomplete="off" placeholder="数字">`;
  }

  function onDrillCheck(drill, q, total) {
    if (!session.checked) {
      const verdict = judge(q);
      session.checked = true;
      if (verdict.ok) session.correct += 1;
      const explain = document.getElementById("explain");
      explain.innerHTML = `<div class="callout ${verdict.ok ? "felt" : ""}">${verdict.ok ? "对。" : "不对。"} ${esc(q.explain_zh || "")}</div>`;
      document.getElementById("drill-check").textContent = session.i === total - 1 ? "看成绩" : "下一题";
      return;
    }
    if (session.i === total - 1) {
      session.finished = true;
      paintDrill();
      return;
    }
    session.i += 1;
    session.checked = false;
    session.pick = null;
    session.kind = null;
    paintDrill();
  }

  function judge(q) {
    if (q.type === "choice") return { ok: session.pick === q.answer };
    if (q.type === "hand") {
      const raw = (document.getElementById("total-box") || {}).value || "";
      const total = Number(String(raw).replace(/[^0-9.]/g, ""));
      return { ok: session.kind === q.kind && total === Number(q.total) };
    }
    const raw = (document.getElementById("total-box") || {}).value || "";
    const num = Number(String(raw).replace(/[$,\s]/g, ""));
    return { ok: Number.isFinite(num) && Math.abs(num - Number(q.answer)) < 0.001 };
  }

  function settingsView() {
    const passed = DB.videos.videos.filter((video) => vstat(video.id).passed).length;
    return `<div data-screen="settings">${bar("设置", "#/")}
      <div class="page">
        <div class="card" data-privacy-notice="settings">
          <h2>学习记录</h2>
          <p>学习记录只保存在本机，清除浏览器数据会一起清掉。</p>
          <p class="small" lang="en">Study records stay on this device only. Clearing browser data deletes them.</p>
          <p class="small">已过关 ${passed} / ${DB.videos.videos.length}。进度、听懂题、错题和笔记都只在这台设备上，不会上传。</p>
          <button type="button" class="btn" id="export-records">导出学习记录</button>
          <label class="btn file-btn">导入学习记录
            <input id="import-file" type="file" accept="application/json,.json">
          </label>
        </div>
        <div class="card">
          <h2>朗读</h2>
          <p>正式版用仓库里的 Fish Audio mp3（<span lang="en">audio/&lt;id&gt;.mp3</span>）。把 id 写进 <span lang="en">audio/index.json</span> 才会去播文件。有词时间戳的，再放 <span lang="en">audio/&lt;id&gt;.json</span>，并把 id 写进 timings。文件还没放进来时，点朗读会暂时用浏览器的 en-US 声音，方便先学。</p>
        </div>
        <div class="card">
          <h2>规则从哪来</h2>
          <p>讲义是权威。讲义没写的步骤标成「讲义未写，按常见做法；现场以主管/学校为准」。培训桌毡是 H17：软 17 要补，硬 17 停。只代表那张培训桌，不是已确认的 Turning Stone 实地规则。考试日期和形式：没记录。</p>
        </div>
        <p class="muted small">Blackjack 学习app</p>
        <button type="button" class="quiet" id="reset-progress">重置本机学习记录</button>
      </div>
    </div>`;
  }

  function missing(text) {
    return `<div data-screen="missing">${bar("返回", "#/")}<div class="page"><p>${esc(text)}</p></div></div>`;
  }

  function bind(route) {
    if (route.name === "home") {
      const input = document.getElementById("q");
      if (input) input.addEventListener("input", () => paintSearch(input.value));
    }
    if (route.name === "video") bindVideo(videoById(route.id));
    if (route.name === "quiz") paintQuiz();
    if (route.name === "youtube") {
      const pick = ((DB.youtube && DB.youtube.picks) || []).find((item) => item.video_id === route.id);
      if (pick) mountYt(pick);
    }
    if (route.name === "drill" && session) paintDrill();
    if (route.name === "english") applyEnglishFilter();
    if (route.name === "notes") {
      document.querySelectorAll("[data-note]").forEach((box) => {
        box.addEventListener("input", () => {
          state.notes[box.dataset.note] = box.value;
          saveSoon();
        });
      });
      document.getElementById("copy-all").addEventListener("click", () => copyText(notesText()));
      document.getElementById("export-notes").addEventListener("click", () => {
        const text = notesText();
        download("blackjack-notes.txt", text);
        const pre = document.getElementById("export-preview");
        pre.hidden = false;
        pre.textContent = text;
      });
    }
    if (route.name === "settings") {
      document.getElementById("export-records").addEventListener("click", () => { exportRecords(); });
      document.getElementById("import-file").addEventListener("change", (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = "";
        if (file) importRecords(file);
      });
      document.getElementById("reset-progress").addEventListener("click", () => {
        if (!confirm("确定清除这台手机上的观看进度、听懂题成绩和笔记？不能撤销。")) return;
        localStorage.removeItem(KEY);
        location.hash = "#/";
        location.reload();
      });
    }
  }

  function paintSearch(raw) {
    const out = document.getElementById("search-out");
    if (!out) return;
    const q = raw.trim().toLowerCase();
    if (!q) {
      out.innerHTML = "";
      return;
    }
    const hits = [];
    DB.videos.videos.forEach((video) => {
      const blob = [video.title, video.note, video.transcript_en, video.transcript_zh].join("\n").toLowerCase();
      if (blob.includes(q)) hits.push({ href: "#/v/" + encodeURIComponent(video.id), title: video.title, zh: video.note, locked: !isUnlocked(video) });
    });
    DB.videos.modules.forEach((mod) => {
      if ((mod.title_zh + " " + mod.title_en).toLowerCase().includes(q)) {
        hits.push({ href: "#/m/" + mod.id, title: mod.title_zh, zh: mod.title_en, locked: false });
      }
    });
    DB.english.phrases.forEach((phrase) => {
      const text = lineText(phrase.audio_id);
      if ((text + " " + phrase.zh + " " + phrase.when_zh).toLowerCase().includes(q)) {
        hits.push({ href: "#/en", title: text, zh: phrase.zh, locked: false });
      }
    });
    DB.rules.sections.forEach((section) => {
      if (JSON.stringify(section).toLowerCase().includes(q)) {
        hits.push({ href: "#/rules/" + section.id, title: section.title_zh, zh: section.title_en, locked: false });
      }
    });
    out.innerHTML = hits.slice(0, 24).map((hit) => `<a class="hit" href="${esc(hit.href)}"><span lang="en">${esc(hit.title)}</span>${hit.locked ? " · 未解锁" : ""}<div class="muted">${esc(hit.zh)}</div></a>`).join("") || '<p class="muted">没有匹配。</p>';
  }

  function recordsPayload() {
    return {
      app: "blackjack-study",
      format: 1,
      exportedAt: new Date().toISOString(),
      records: {
        videos: state.videos || {},
        notes: state.notes || {},
        drills: state.drills || {},
        ui: state.ui || {},
        youtube: state.youtube || {},
        last: state.last || null
      }
    };
  }

  function plainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function normalizeRecords(data) {
    if (!plainObject(data)) return null;
    let records = null;
    if (data.format === 1 && plainObject(data.records) && data.app === "blackjack-study") {
      records = data.records;
    } else if (plainObject(data.videos) || plainObject(data.notes)) {
      records = data;
    }
    if (!records) return null;
    const videos = plainObject(records.videos) ? records.videos : {};
    for (const entry of Object.values(videos)) {
      if (!plainObject(entry)) return null;
      if ("passed" in entry && typeof entry.passed !== "boolean") return null;
      if ("maxRatio" in entry && typeof entry.maxRatio !== "number") return null;
      if ("attempts" in entry && typeof entry.attempts !== "number") return null;
    }
    if ("notes" in records && !plainObject(records.notes)) return null;
    if ("drills" in records && !plainObject(records.drills)) return null;
    if ("ui" in records && !plainObject(records.ui)) return null;
    if ("youtube" in records && !plainObject(records.youtube)) return null;
    return {
      videos: videos,
      notes: plainObject(records.notes) ? records.notes : {},
      drills: plainObject(records.drills) ? records.drills : {},
      ui: plainObject(records.ui) ? records.ui : {},
      youtube: plainObject(records.youtube) ? records.youtube : {},
      last: records.last || null
    };
  }

  async function exportRecords() {
    const text = JSON.stringify(recordsPayload(), null, 2);
    const filename = "blackjack-study-records.json";
    const file = new File([text], filename, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Blackjack 学习记录" });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    download(filename, text);
    toast("已开始下载");
  }

  function importRecords(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let data = null;
      try {
        data = JSON.parse(String(reader.result || ""));
      } catch (err) {
        toast("这个文件不是有效的 JSON");
        return;
      }
      const records = normalizeRecords(data);
      if (!records) {
        toast("文件格式不对，没有导入");
        return;
      }
      if (!confirm("用这份记录覆盖这台手机上的进度、听懂题、错题和笔记？不能撤销。")) return;
      state.videos = records.videos;
      state.notes = records.notes;
      state.drills = records.drills;
      state.ui = records.ui;
      state.youtube = records.youtube;
      state.last = records.last;
      save();
      toast("已导入到这台手机");
      render();
    };
    reader.onerror = () => toast("读不到这个文件");
    reader.readAsText(file);
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("已复制");
    } catch (err) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); toast("已复制"); }
      catch (e2) { toast("复制失败，请长按文本"); }
      area.remove();
    }
  }

  function stopSpeak() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (window.speechSynthesis) speechSynthesis.cancel();
    speakingId = null;
    karaokeWords = null;
    document.querySelectorAll(".speak.playing").forEach((el) => el.classList.remove("playing"));
  }

  function clearSpeaking(id) {
    if (speakingId !== id) return;
    speakingId = null;
    document.querySelectorAll(".speak.playing").forEach((el) => el.classList.remove("playing"));
  }

  async function speak(id, host) {
    const item = audioById[id];
    if (!item) return;
    stopSpeak();
    speakingId = id;
    const safeId = (window.CSS && CSS.escape) ? CSS.escape(id) : id;
    document.querySelectorAll('[data-speak="' + safeId + '"]').forEach((el) => el.classList.add("playing"));
    if (audioIds.has(id)) {
      try {
        let words = null;
        if (timingIds.has(id)) {
          const res = await fetch("./audio/" + id + ".json");
          if (res.ok) {
            const data = await res.json();
            words = data.words || null;
          }
        }
        const audio = new Audio("./audio/" + id + ".mp3");
        currentAudio = audio;
        if (words && host) {
          karaokeWords = words;
          host.innerHTML = words.map((word, index) => `<span class="w" data-i="${index}">${esc(word.w)}</span>`).join(" ");
          audio.addEventListener("timeupdate", () => {
            if (!host) return;
            host.querySelectorAll(".w").forEach((span, index) => {
              const word = words[index];
              span.classList.toggle("on", audio.currentTime >= word.start && audio.currentTime < word.end);
            });
          });
        }
        audio.addEventListener("ended", () => clearSpeaking(id));
        await audio.play();
        return;
      } catch (err) {
        /* missing file: fall through to speech */
      }
    }
    speakWeb(item.text, id);
  }

  function speakWeb(text, id) {
    if (!window.speechSynthesis) {
      toast("这台浏览器没有朗读");
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    const voices = speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang === "en-US") || voices.find((item) => /^en/i.test(item.lang));
    if (voice) utter.voice = voice;
    utter.onend = () => clearSpeaking(id);
    utter.onerror = () => clearSpeaking(id);
    window.setTimeout(() => {
      if (speakingId !== id) return;
      speechSynthesis.speak(utter);
    }, 40);
  }

  function onClick(event) {
    const speakEl = event.target.closest("[data-speak]");
    if (speakEl) {
      const host = speakEl.querySelector("[data-karaoke]");
      const pattern = speakEl.dataset.pattern;
      if (pattern) {
        const full = document.querySelector(`[data-pattern-full="${pattern}"]`);
        if (full) full.textContent = lineText(speakEl.dataset.speak);
        speakEl.parentElement.querySelectorAll(".opt").forEach((opt) => opt.classList.toggle("on", opt === speakEl));
      }
      speak(speakEl.dataset.speak, host);
      return;
    }
    const lock = event.target.closest("[data-lock-msg]");
    if (lock) {
      toast(lock.dataset.lockMsg);
      return;
    }
    const seek = event.target.closest("[data-seek]");
    if (seek && document.getElementById("player")) {
      const player = document.getElementById("player");
      const time = Number(seek.dataset.seek);
      player.currentTime = time;
      if (loopOn) {
        const route = parseRoute();
        armLoop(time, videoById(route.id));
      }
      return;
    }
    const reveal = event.target.closest("[data-reveal]");
    if (reveal) {
      const answer = reveal.nextElementSibling;
      if (answer) answer.hidden = !answer.hidden;
      return;
    }
    const cat = event.target.closest("[data-cat]");
    if (cat && document.getElementById("cats")) {
      englishCat = cat.dataset.cat;
      applyEnglishFilter();
      return;
    }
    const choice = event.target.closest("[data-choice]");
    if (choice && quizRun && !quizRun.done && choice.closest("#quiz-body")) {
      quizRun.picks[quizRun.i] = Number(choice.dataset.choice);
      choice.parentElement.querySelectorAll("[data-choice]").forEach((item) => item.classList.toggle("on", item === choice));
      return;
    }
    const toggle = event.target.closest("[data-yt-toggle]");
    if (toggle) {
      const id = toggle.dataset.ytToggle;
      if (!state.youtube[id]) state.youtube[id] = {};
      state.youtube[id].watched = !state.youtube[id].watched;
      save();
      render();
      return;
    }
    const shot = event.target.closest("[data-full]");
    if (shot) {
      const box = document.getElementById("lightbox");
      const img = document.getElementById("light-img");
      img.src = shot.dataset.full;
      img.alt = "讲义原件";
      box.hidden = false;
    }
  }

  async function init() {
    const files = ["videos", "curriculum", "rules", "english", "drills", "audio-lines"];
    const parts = await Promise.all(files.map(async (name) => {
      const res = await fetch("./data/" + name + ".json");
      if (!res.ok) throw new Error(name);
      return res.json();
    }));
    DB = {
      videos: parts[0],
      curriculum: parts[1],
      rules: parts[2],
      english: parts[3],
      drills: parts[4]
    };
    parts[5].forEach((line) => { audioById[line.id] = line; });
    try {
      const yt = await fetch("./data/youtube.json");
      DB.youtube = yt.ok ? await yt.json() : { picks: [], playlists: [] };
    } catch (err) {
      DB.youtube = { picks: [], playlists: [] };
    }
    try {
      const res = await fetch("./audio/index.json");
      if (res.ok) {
        const index = await res.json();
        audioIds = new Set(index.ids || []);
        timingIds = new Set(index.timings || []);
      }
    } catch (err) {
      audioIds = new Set();
      timingIds = new Set();
    }
    if (window.speechSynthesis) speechSynthesis.getVoices();
    document.body.addEventListener("click", onClick);
    document.getElementById("light-close").addEventListener("click", () => {
      document.getElementById("lightbox").hidden = true;
    });
    window.addEventListener("hashchange", render);
    const onFullscreen = () => { syncFullscreen(); };
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("webkitfullscreenchange", onFullscreen);
    window.addEventListener("pagehide", save);
    window.addEventListener("online", () => { if (parseRoute().name === "youtube") render(); });
    window.addEventListener("offline", () => { if (parseRoute().name === "youtube") render(); });
    render();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  init().catch(() => {
    app.innerHTML = '<p class="loading">资料没有载入。连上网络打开一次后再离线使用。</p>';
  });
})();
