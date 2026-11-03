"use strict";

const RES = ["timber", "clay", "wool", "grain", "iron"];
const COM = ["cloth", "parchment", "steel"];
const ICON = {
  timber: "🪵", clay: "🧱", wool: "🐑", grain: "🌾", iron: "⛏️",
  cloth: "🧵", parchment: "📃", steel: "⚙️",
};
const TERRAIN = {
  forest:  { color: "#2f6b3a", icon: "🌲" },
  claypit: { color: "#b5562f", icon: "🧱" },
  pasture: { color: "#8fc35a", icon: "🐑" },
  fields:  { color: "#e3c04a", icon: "🌾" },
  hills:   { color: "#7d7f86", icon: "⛰️" },
  moor:    { color: "#b9a77c", icon: "🪨" },
  gold:    { color: "#d9b23a", icon: "💰" },
  sea:     { color: "#3a77a0", icon: "" },
};
const TRACKS = {
  commerce: { name: "Commerce", icon: "⚖️", com: "cloth", color: "#c9971a", l3: "2:1 trades for commodities" },
  faith:    { name: "Faith",    icon: "⛪", com: "parchment", color: "#3f6fb5", l3: "1 free resource on rolls that pay you nothing" },
  arms:     { name: "Arms",     icon: "⚔️", com: "steel", color: "#3f8f4a", l3: "knights can be promoted to level 3" },
};
const EVENT_ICON = { raiders: "⛵", commerce: "⚖️", faith: "⛪", arms: "⚔️" };
const SIZE_LABEL = { small: "Small", medium: "Medium", large: "Large", huge: "Huge" };
const SIZE_MAX = { small: 4, medium: 5, large: 6, huge: 6 };
const STYLE = { builder: "🏗️ Builder", merchant: "💰 Merchant", warlord: "⚔️ Warlord" };
const SCALE = 60;
const HOUSE = [[-9, 10], [-9, -2], [0, -11], [9, -2], [9, 10]];
const CASTLE = [[-13, 12], [-13, -10], [-8, -10], [-8, -5], [-3, -5], [-3, -14], [3, -14], [3, -5], [8, -5], [8, -10], [13, -10], [13, 12]];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ui = {
  ws: null,
  session: loadSession(),
  st: null,          // latest game state
  mode: null,        // build/action mode while choosing a spot on the board
  sel: null,         // selected knight/ship when moving
  give: {}, get: {}, // trade builder
  bankGive: "timber", bankGet: "grain",
  modal: null,       // {kind, card, ...} for card parameter dialogs
  discardSel: {}, pickSel: {},
  view: null, boardKey: null, dragged: false,
};

function loadSession() {
  try { return JSON.parse(localStorage.getItem("sl-session")) || null; } catch { return null; }
}
function saveSession(s) {
  ui.session = s;
  try { s ? localStorage.setItem("sl-session", JSON.stringify(s)) : localStorage.removeItem("sl-session"); } catch {}
}

// ---------------------------------------------------------------- network
// Transport: a WebSocket to server.py, or (on static hosting) peer-to-peer via p2p.js
function connect() {
  if (window.P2P) { P2P.start(); return; }
  const proto = location.protocol === "https:" ? "wss" : "ws";
  ui.ws = new WebSocket(`${proto}://${location.host}/ws`);
  ui.ws.onopen = () => {
    const urlRoom = new URLSearchParams(location.search).get("room");
    const s = ui.session;
    if (s && s.room && (!urlRoom || urlRoom.toUpperCase() === s.room)) {
      send({ type: "join", room: s.room, name: s.name, token: s.token });
    } else {
      show("join");
    }
  };
  ui.ws.onmessage = (ev) => onMessage(JSON.parse(ev.data));
  ui.ws.onclose = () => { toast("Connection lost, reconnecting…"); setTimeout(connect, 1500); };
}
function send(m) {
  if (window.P2P) P2P.send(m);
  else if (ui.ws && ui.ws.readyState === 1) ui.ws.send(JSON.stringify(m));
}
function act(action) { send({ type: "action", action }); }

function onMessage(m) {
  if (m.type === "joined") {
    voice.me = m.vid;
    saveSession({ ...ui.session, room: m.room, token: m.token, name: ui.session?.name || $("name").value });
    history.replaceState(null, "", `${location.pathname}?room=${m.room}`);
  } else if (m.type === "lobby") {
    renderLobby(m);
  } else if (m.type === "state") {
    ui.fx = diffStates(ui.st, m.state);
    ui.st = m.state;
    ui.online = m.online;
    ui.bots = m.bots || {};
    renderGame();
    playEffects(ui.st, ui.fx);
    ui.fx = null;   // local re-renders (mode toggles etc.) shouldn't replay animations
  } else if (m.type === "chat") {
    addChat(m);
  } else if (m.type === "voice_members") {
    onVoiceMembers(m);
  } else if (m.type === "rtc") {
    onRtc(m);
  } else if (m.type === "error") {
    toast(m.msg);
    if (!ui.st && $("lobby").classList.contains("hidden")) { saveSession(null); show("join"); }
  }
}

function show(screen) {
  for (const s of ["join", "lobby", "game"]) $(s).classList.toggle("hidden", s !== screen);
  $("chatwin").classList.toggle("hidden", screen === "join");
}
let toastTimer;
function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.add("hidden"), 3000);
}

// ---------------------------------------------------------------- join / lobby
function joinRoom(code) {
  const name = $("name").value.trim();
  if (!name) { toast("Enter your name first."); return; }
  saveSession({ room: code, name, token: "" });
  if (window.P2P) P2P.enter(code, name);
  else send({ type: "join", room: code, name, token: "" });
}
$("create").onclick = () => joinRoom("");
$("joinbtn").onclick = () => { const c = $("code").value.trim().toUpperCase(); if (c) joinRoom(c); else toast("Enter a room code."); };
$("code").value = new URLSearchParams(location.search).get("room") || "";
$("name").value = ui.session?.name || "";
$("copy").onclick = () => { $("invite").select(); navigator.clipboard?.writeText($("invite").value); toast("Link copied."); };
$("start").onclick = () => send({ type: "start" });
$("lobby-players").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b?.dataset.addbot) send({ type: "add_bot", style: b.dataset.addbot });
  if (b?.dataset.unbot) send({ type: "remove_bot", seat: Number(b.dataset.unbot) });
});
const leave = () => { saveSession(null); window.P2P?.leave(); location.href = location.pathname; };
$("leave1").onclick = leave;
$("leave2").onclick = () => { if (confirm("Leave this game? Your seat will be left empty and you won't be able to rejoin.")) leave(); };

function optionsSummary(o) {
  const parts = [`${SIZE_LABEL[o.size]} map`, { classic: "classic shape", continent: "random continent", islands: "islands" }[o.shape]];
  if (o.seafaring) parts.push("Ships & Islands");
  if (o.knights) parts.push("Knights & Raiders");
  parts.push(`play to ${o.vp_target}★`);
  return parts.join(" · ");
}

function renderLobby(m) {
  show("lobby");
  ui.lobby = m;
  $("lobby-code").textContent = m.room;
  $("invite").value = `${location.origin}${location.pathname}?room=${m.room}`;
  const host = m.you === m.host;
  $("lobby-players").innerHTML = m.players.map((p, i) =>
    `<li>${i === m.host ? "👑" : p.bot ? "🤖" : "🛡️"} ${esc(p.name)}${i === m.you ? " <i>(you)</i>" : ""}
      ${p.bot ? `<span class="botstyle">${STYLE[p.bot]}</span>${host ? `<button class="link-btn" data-unbot="${i}">remove</button>` : ""}` : ""}</li>`).join("")
    + `<li class="cap">${m.players.length} / ${m.max_players} lords</li>`
    + (host && m.players.length < m.max_players ? `<li class="addbot">Add a computer lord:
        ${m.styles.map((s) => `<button data-addbot="${s}">${STYLE[s]}</button>`).join("")}</li>` : "");
  const o = m.options, r = m.resolved;
  if (host) {
    $("settings").innerHTML = `
      <label>Map size <select id="opt-size">${Object.keys(SIZE_LABEL).map((s) =>
        `<option value="${s}" ${s === o.size ? "selected" : ""} ${SIZE_MAX[s] < m.players.length ? "disabled" : ""}>${SIZE_LABEL[s]} (up to ${SIZE_MAX[s]})</option>`).join("")}</select></label>
      <label>Map shape <select id="opt-shape">
        <option value="classic" ${o.shape === "classic" ? "selected" : ""}>Classic</option>
        <option value="continent" ${o.shape === "continent" ? "selected" : ""}>Random continent</option>
        <option value="islands" ${o.shape === "islands" ? "selected" : ""}>Islands (needs ships)</option></select></label>
      <label class="chk"><input type="checkbox" id="opt-sea" ${r.seafaring ? "checked" : ""} ${o.shape === "islands" ? "disabled" : ""}> ⛵ Ships &amp; Islands</label>
      <label class="chk"><input type="checkbox" id="opt-knights" ${o.knights ? "checked" : ""}> ⚔️ Knights &amp; Raiders</label>
      <label>Victory points <input id="opt-vp" type="number" min="5" max="30" placeholder="auto (${r.vp_target})" value="${o.vp_target ?? ""}"></label>`;
    const sendOpts = () => send({ type: "settings", options: {
      size: $("opt-size").value, shape: $("opt-shape").value,
      seafaring: $("opt-sea").checked, knights: $("opt-knights").checked,
      vp_target: $("opt-vp").value ? Number($("opt-vp").value) : null,
    } });
    for (const id of ["opt-size", "opt-shape", "opt-sea", "opt-knights", "opt-vp"]) $(id).onchange = sendOpts;
  } else {
    $("settings").innerHTML = `<p class="sub">${esc(optionsSummary(r))}</p>`;
  }
  $("start").classList.toggle("hidden", !host);
  $("start").disabled = m.players.length < 2;
  $("start").textContent = m.players.length < 2 ? "Need at least 2 players" : "Begin the game";
  $("lobby-wait").classList.toggle("hidden", host);
}

// ---------------------------------------------------------------- animations
// Compare the previous and new state to find what just happened.
function diffStates(a, b) {
  const fx = { fresh: new Set(), bandit: false, pirate: false, roll: false, gains: {}, myTurn: false };
  if (!a || a.board.hexes.length !== b.board.hexes.length || a.board.hexes[0].x !== b.board.hexes[0].x) return fx;
  const had = new Set([
    ...a.buildings.map(([v, , k]) => `b${v}:${k}`), ...a.roads.map(([e]) => `r${e}`), ...a.ships.map(([e]) => `s${e}`),
    ...(a.knights || []).map(([v, , l]) => `k${v}:${l}`), ...(a.walls || []).map((v) => `w${v}`),
  ]);
  for (const [v, , k] of b.buildings) if (!had.has(`b${v}:${k}`)) fx.fresh.add(`b${v}`);
  for (const [e] of b.roads) if (!had.has(`r${e}`)) fx.fresh.add(`r${e}`);
  for (const [e] of b.ships) if (!had.has(`s${e}`)) fx.fresh.add(`s${e}`);
  for (const [v, , l] of b.knights || []) if (!had.has(`k${v}:${l}`)) fx.fresh.add(`k${v}`);
  for (const v of b.walls || []) if (!had.has(`w${v}`)) fx.fresh.add(`w${v}`);
  fx.bandit = a.bandit !== b.bandit;
  fx.pirate = a.pirate !== b.pirate && b.pirate !== null;
  fx.roll = !!b.dice && (!a.dice || a.phase === "roll");
  for (const r of b.cards) {
    const d = b.hand[r] - (a.hand[r] || 0);
    if (d > 0) fx.gains[r] = d;
  }
  fx.myTurn = b.current === b.you && a.current !== b.current && b.phase !== "over";
  return fx;
}

const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function dieFace(n, cls) {
  return `<div class="bigdie ${cls}">${[...Array(9)].map((_, i) => `<i class="${PIPS[n].includes(i) ? "p" : ""}"></i>`).join("")}</div>`;
}

let diceTimer = null;
function rollDice(st) {
  const el = $("dice-roll");
  const K = st.options.knights;
  const [d1, d2] = st.dice;
  const faces = (a, b, ev, cls) => dieFace(a, `${K ? "red" : ""} ${cls}`) + dieFace(b, `${K ? "yellow" : ""} ${cls}`)
    + (K && ev ? `<div class="bigdie event ${cls}">${EVENT_ICON[ev]}</div>` : "");
  const rnd = () => 1 + Math.floor(Math.random() * 6);
  const evs = Object.keys(EVENT_ICON);
  clearInterval(diceTimer);
  el.className = "show";
  let t = 0;
  diceTimer = setInterval(() => {
    if (++t < 10) {
      el.innerHTML = `<div class="dice-row">${faces(rnd(), rnd(), evs[t % evs.length], "tumble")}</div>`;
      return;
    }
    clearInterval(diceTimer);
    el.innerHTML = `<div class="dice-row">${faces(d1, d2, st.event, "landed")}</div><div class="dice-sum ${d1 + d2 === 7 ? "seven" : ""}">${d1 + d2}</div>`;
    diceTimer = setTimeout(() => { el.className = "show fade"; diceTimer = setTimeout(() => (el.className = ""), 600); }, 1300);
  }, 70);
}

function playEffects(st, fx) {
  if (!fx) return;
  if (fx.roll) rollDice(st);
  if (fx.myTurn) {
    const b = $("turn-banner");
    b.textContent = st.phase.startsWith("setup") ? "Your turn to place!" : "Your turn!";
    b.className = "";
    void b.offsetWidth;   // restart the animation
    b.className = "show";
  }
}

function pop(on, svg, cls = "pop") { return on ? `<g class="${cls}">${svg}</g>` : svg; }

// ---------------------------------------------------------------- board
function pt(v) { return [v.x * SCALE, v.y * SCALE]; }
function poly(shape, x, y) { return shape.map(([a, b]) => `${x + a},${y + b}`).join(" "); }

function fitView(st) {
  const xs = [], ys = [];
  for (const h of st.board.hexes) {
    if (h.terrain === "sea") continue;
    xs.push(h.x * SCALE); ys.push(h.y * SCALE);
  }
  const pad = SCALE * 1.9;
  return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + 2 * pad, h: Math.max(...ys) - Math.min(...ys) + 2 * pad };
}

function applyView() {
  const v = ui.view;
  $("board").setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
}

function boardSvg(st) {
  const b = st.board;
  const V = b.vertices.map(pt);
  const key = `${b.hexes.length}:${b.hexes[0].x}:${b.hexes[0].terrain}`;
  if (ui.boardKey !== key) { ui.boardKey = key; ui.view = fitView(st); }
  applyView();
  const hexPts = (hx) => hx.vertices.map((v) => V[v].join(",")).join(" ");
  const fx = ui.fx;
  const fresh = (k) => !!fx?.fresh.has(k);
  const edgeLine = (e, attrs) => {
    const [a, c] = b.edges[e];
    return `<line x1="${V[a][0]}" y1="${V[a][1]}" x2="${V[c][0]}" y2="${V[c][1]}" ${attrs}/>`;
  };

  const xs = V.map((p) => p[0]), ys = V.map((p) => p[1]);
  const big = 4000;
  let out = `<rect x="${Math.min(...xs) - big}" y="${Math.min(...ys) - big}" width="${Math.max(...xs) - Math.min(...xs) + 2 * big}" height="${Math.max(...ys) - Math.min(...ys) + 2 * big}" fill="#24506e"/>`;

  // sea first, then harbors, then land
  b.hexes.forEach((hx) => {
    if (hx.terrain === "sea") out += `<polygon points="${hexPts(hx)}" fill="${TERRAIN.sea.color}" stroke="#4d8ab3" stroke-width="1.5"/>`;
  });
  for (const hb of b.harbors) {
    const [x, y] = [hb.x * SCALE, hb.y * SCALE];
    const [a, c] = b.edges[hb.edge];
    for (const v of [a, c]) out += `<line x1="${x}" y1="${y}" x2="${V[v][0]}" y2="${V[v][1]}" stroke="#d9c7a0" stroke-width="3" stroke-dasharray="3 3"/>`;
    out += `<circle cx="${x}" cy="${y}" r="17" fill="#f3e7c9" stroke="#6b5236" stroke-width="2"/>`;
    out += `<text x="${x}" y="${y + (hb.type === "any" ? 4 : -1)}" text-anchor="middle" font-size="11" font-weight="bold" fill="#3b2a1a">${hb.type === "any" ? "3:1" : "2:1"}</text>`;
    if (hb.type !== "any") out += `<text x="${x}" y="${y + 13}" text-anchor="middle" font-size="11">${ICON[hb.type]}</text>`;
  }
  b.hexes.forEach((hx, i) => {
    if (hx.terrain === "sea") {
      if (i === st.pirate) out += pop(fx?.pirate, pirateSvg(hx.x * SCALE, hx.y * SCALE), "drop");
      return;
    }
    const t = TERRAIN[hx.terrain];
    const [cx, cy] = [hx.x * SCALE, hx.y * SCALE];
    out += `<polygon points="${hexPts(hx)}" fill="${t.color}" stroke="#e9dcb8" stroke-width="3"/>`;
    out += `<text x="${cx}" y="${cy - 20}" text-anchor="middle" font-size="18">${t.icon}</text>`;
    if (hx.number) {
      const hot = hx.number === 6 || hx.number === 8;
      const pips = 6 - Math.abs(7 - hx.number);
      const ink = hot ? "#a31515" : "#2b1d10";
      out += `<circle cx="${cx}" cy="${cy + 6}" r="16" fill="#f8efd6" stroke="#6b5236" stroke-width="1.5"/>`;
      out += `<text x="${cx}" y="${cy + 11}" text-anchor="middle" font-size="15" font-weight="bold" fill="${ink}">${hx.number}</text>`;
      for (let p = 0; p < pips; p++) out += `<circle cx="${cx + (p - (pips - 1) / 2) * 4}" cy="${cy + 16}" r="1.3" fill="${ink}"/>`;
    }
    if (fx?.roll && hx.number === st.dice[0] + st.dice[1] && i !== st.bandit) out += `<polygon class="hit" points="${hexPts(hx)}"/>`;
    if (i === st.bandit) {
      out += pop(fx?.bandit, `<g transform="translate(${cx + 22},${cy - 4})"><ellipse cx="0" cy="14" rx="10" ry="3" fill="rgba(0,0,0,.35)"/>`
        + `<path d="M-8,13 L-5,-2 L5,-2 L8,13 Z" fill="#1d1d1d" stroke="#000"/><circle cx="0" cy="-7" r="6" fill="#1d1d1d" stroke="#000"/>`
        + `<rect x="-4" y="-9" width="8" height="2" fill="#c33"/></g>`, "drop");
    }
  });

  // roads + ships
  for (const [e, owner] of st.roads) {
    const col = st.players[owner].color;
    out += pop(fresh(`r${e}`), edgeLine(e, `stroke="#1a1208" stroke-width="10" stroke-linecap="round"`)
      + edgeLine(e, `stroke="${col}" stroke-width="6" stroke-linecap="round"`));
  }
  for (const [e, owner] of st.ships) {
    const [a, c] = b.edges[e];
    out += pop(fresh(`s${e}`), shipSvg((V[a][0] + V[c][0]) / 2, (V[a][1] + V[c][1]) / 2,
      Math.atan2(V[c][1] - V[a][1], V[c][0] - V[a][0]) * 180 / Math.PI, st.players[owner].color, ui.sel === e && ui.mode === "move_ship"));
  }
  // walls, buildings, capitals
  const walls = new Set(st.walls || []);
  const capitalAt = {};
  for (const [t, [pid, v]] of Object.entries(st.capitals || {})) capitalAt[v] = t;
  for (const [v, owner, kind] of st.buildings) {
    const [x, y] = V[v];
    let piece = "";
    if (walls.has(v)) out += pop(fresh(`w${v}`), `<rect x="${x - 17}" y="${y - 4}" width="34" height="18" rx="3" fill="#8e8a80" stroke="#3d3a33" stroke-width="2" stroke-dasharray="5 2"/>`);
    piece += `<polygon points="${poly(kind === "city" ? CASTLE : HOUSE, x, y)}" fill="${st.players[owner].color}" stroke="#1a1208" stroke-width="2" stroke-linejoin="round"/>`;
    if (kind === "city") piece += `<rect x="${x - 3}" y="${y + 4}" width="6" height="8" fill="#1a1208"/>`;
    else piece += `<rect x="${x - 2.5}" y="${y + 3}" width="5" height="7" fill="#1a1208"/>`;
    out += pop(fresh(`b${v}`), piece);
    if (capitalAt[v]) out += `<circle cx="${x}" cy="${y - 20}" r="8" fill="${TRACKS[capitalAt[v]].color}" stroke="#1a1208"/><text x="${x}" y="${y - 16}" text-anchor="middle" font-size="10">👑</text>`;
  }
  for (const [v, owner, level, active] of st.knights || []) out += pop(fresh(`k${v}`), knightSvg(V[v][0], V[v][1], st.players[owner].color, level, active, ui.sel === v && ui.mode === "move_knight"));

  out += spotsSvg(st, V, edgeLine);
  $("board").innerHTML = out;
}

function shipSvg(x, y, angle, color, selected) {
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  return `<g transform="translate(${x},${y}) rotate(${angle})">`
    + (selected ? `<circle r="16" fill="none" stroke="#ffd84a" stroke-width="3"/>` : "")
    + `<path d="M-12,1 L12,1 L8,8 L-8,8 Z" fill="#5a3b1c" stroke="#1a1208" stroke-width="1.5"/>`
    + `<line x1="0" y1="1" x2="0" y2="-13" stroke="#1a1208" stroke-width="1.5"/>`
    + `<path d="M1,-12 L10,-2 L1,-2 Z" fill="${color}" stroke="#1a1208" stroke-width="1"/>`
    + `<path d="M-1,-10 L-8,-2 L-1,-2 Z" fill="${color}" stroke="#1a1208" stroke-width="1"/></g>`;
}

function pirateSvg(x, y) {
  return `<g transform="translate(${x},${y}) scale(1.5)">`
    + `<path d="M-12,1 L12,1 L8,8 L-8,8 Z" fill="#111" stroke="#000"/>`
    + `<line x1="0" y1="1" x2="0" y2="-14" stroke="#000" stroke-width="1.5"/>`
    + `<path d="M1,-13 L11,-3 L1,-3 Z" fill="#222" stroke="#000"/><path d="M-1,-11 L-9,-3 L-1,-3 Z" fill="#222" stroke="#000"/>`
    + `<text x="5" y="-4" text-anchor="middle" font-size="6">☠️</text></g>`;
}

function knightSvg(x, y, color, level, active, selected) {
  const fill = active ? color : "#f5efe0";
  const ink = active ? "#fff" : color;
  return `<g transform="translate(${x},${y})">`
    + (selected ? `<circle r="17" fill="none" stroke="#ffd84a" stroke-width="3"/>` : "")
    + `<path d="M-10,-11 L10,-11 L10,1 Q10,10 0,14 Q-10,10 -10,1 Z" fill="${fill}" stroke="${active ? "#1a1208" : color}" stroke-width="${active ? 2 : 3}"/>`
    + `<text x="0" y="4" text-anchor="middle" font-size="10" font-weight="bold" fill="${ink}">${"I".repeat(level)}</text></g>`;
}

function spotsSvg(st, V, edgeLine) {
  if (st.current !== st.you || st.phase === "over") return "";
  const L = st.legal || {};
  const edges = [], verts = [], hexes = [];
  const e = (list, act, what) => (list || []).forEach((x) => edges.push({ at: x, act, what }));
  const v = (list, act, what, big) => (list || []).forEach((x) => verts.push({ at: x, act, what, big }));
  if (st.phase === "setup_village") v(L.villages, "build", st.setup_kind);
  else if (st.phase === "setup_road") { e(L.roads, "build", "road"); e(L.ships, "build", "ship"); }
  else if (st.phase === "place") {
    for (const [what, spots] of Object.entries(L.place || {})) {
      if (["road", "ship", "remove_road"].includes(what)) e(spots, "place", what);
      else v(spots, "place", what, what !== "knight");
    }
  } else if (st.phase === "bandit") {
    st.board.hexes.forEach((hx, i) => {
      if (hx.terrain === "sea" ? (st.options.seafaring && st.robber_kind === "any" && i !== st.pirate) : i !== st.bandit) hexes.push(i);
    });
  } else if (st.phase === "main") {
    const m = ui.mode;
    if (m === "road") e(L.roads, "build", "road");
    if (m === "ship") e(L.ships, "build", "ship");
    if (m === "village") v(L.villages, "build", "village");
    if (m === "city") v(L.cities, "build", "city", true);
    if (m === "knight") v(L.knights, "build", "knight");
    if (m === "wall") v(L.walls, "build", "wall", true);
    if (m === "promote") v(L.promote, "promote_knight", null, true);
    if (m === "activate") v(L.activate, "activate_knight", null, true);
    if (m === "chase") v(L.chase, "chase_bandit", null, true);
    if (m === "move_knight") {
      if (ui.sel === null) v(Object.keys(L.knight_moves || {}).map(Number), "sel", null, true);
      else v((L.knight_moves || {})[ui.sel], "move_knight", null);
    }
    if (m === "move_ship") {
      if (ui.sel === null) e(Object.keys(L.ship_moves || {}).map(Number), "sel");
      else e((L.ship_moves || {})[ui.sel], "move_ship");
    }
  }
  let out = "";
  for (const s of edges) {
    out += edgeLine(s.at, `class="spot spot-e ${s.what === "remove_road" ? "spot-bad" : ""}" data-act="${s.act}" data-what="${s.what || ""}" data-at="${s.at}"`);
  }
  for (const s of verts) {
    out += `<circle class="spot spot-v" data-act="${s.act}" data-what="${s.what || ""}" data-at="${s.at}" cx="${V[s.at][0]}" cy="${V[s.at][1]}" r="${s.big ? 17 : 9}" ${s.big ? 'fill-opacity=".3"' : ""}/>`;
  }
  for (const i of hexes) {
    const pts = st.board.hexes[i].vertices.map((x) => V[x].join(",")).join(" ");
    out += `<polygon class="spot spot-h" data-act="bandit" data-at="${i}" points="${pts}"/>`;
  }
  return out;
}

$("board").addEventListener("click", (e) => {
  if (ui.dragged) { ui.dragged = false; return; }
  const t = e.target.closest("[data-act]");
  if (!t) return;
  const at = Number(t.dataset.at);
  const what = t.dataset.what;
  switch (t.dataset.act) {
    case "build": act({ type: "build", what, at }); ui.mode = null; break;
    case "place": act({ type: "place", what, at }); break;
    case "bandit": act({ type: "move_bandit", hex: at }); break;
    case "promote_knight": case "activate_knight": case "chase_bandit":
      act({ type: t.dataset.act, at }); ui.mode = null; break;
    case "sel": ui.sel = at; renderGame(); break;
    case "move_knight": case "move_ship":
      act({ type: t.dataset.act, from: ui.sel, to: at }); ui.mode = null; ui.sel = null; break;
  }
});

// zoom + pan
function svgPoint(evt) {
  const svg = $("board");
  const p = svg.createSVGPoint();
  p.x = evt.clientX; p.y = evt.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}
function zoom(factor, center) {
  const v = ui.view;
  if (!v) return;
  const c = center || { x: v.x + v.w / 2, y: v.y + v.h / 2 };
  const nw = Math.min(Math.max(v.w * factor, 300), 6000);
  const f = nw / v.w;
  ui.view = { x: c.x - (c.x - v.x) * f, y: c.y - (c.y - v.y) * f, w: v.w * f, h: v.h * f };
  applyView();
}
$("board").addEventListener("wheel", (e) => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12, svgPoint(e)); }, { passive: false });
let drag = null;
$("board").addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, view: { ...ui.view }, moved: false }; });
window.addEventListener("pointermove", (e) => {
  if (!drag || !ui.view) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 6) return;
  drag.moved = true;
  const svg = $("board");
  const s = Math.max(drag.view.w / svg.clientWidth, drag.view.h / svg.clientHeight);
  ui.view = { ...drag.view, x: drag.view.x - dx * s, y: drag.view.y - dy * s };
  applyView();
});
window.addEventListener("pointerup", () => { if (drag?.moved) ui.dragged = true; drag = null; setTimeout(() => (ui.dragged = false), 0); });
$("zoom-in").onclick = () => zoom(1 / 1.25);
$("zoom-out").onclick = () => zoom(1.25);
$("zoom-fit").onclick = () => { if (ui.st) { ui.view = fitView(ui.st); applyView(); } };

// ---------------------------------------------------------------- panel
const fmtRes = (o) => Object.entries(o).map(([r, n]) => `${n}${ICON[r]}`).join(" ");
const costTxt = (c) => Object.entries(c).map(([r, n]) => ICON[r].repeat(n)).join("");

function promptText(st) {
  const cur = esc(st.players[st.current].name);
  const mine = st.current === st.you;
  if (st.phase === "over") return `<div class="win">👑 ${esc(st.players[st.winner].name)} rules the realm!</div>`;
  const modeTxt = {
    road: "Choose where to build your <b>road</b>.", ship: "Choose where to build your <b>ship</b>.",
    village: "Choose where to build your <b>village</b>.", city: "Choose a village to upgrade to a <b>city</b>.",
    knight: "Choose where to place your <b>knight</b>.", wall: "Choose a city to <b>wall</b>.",
    promote: "Choose a knight to <b>promote</b>.", activate: "Choose a knight to <b>activate</b> (🌾).",
    chase: "Choose a knight to <b>chase the bandits</b>.",
    move_knight: ui.sel === null ? "Choose a <b>knight</b> to move." : "Choose where it goes. A stronger knight can push a weaker one off.",
    move_ship: ui.sel === null ? "Choose an <b>open-ended ship</b> to move." : "Choose its new spot.",
  };
  const placeTxt = { road: "free road/ship", knight: "free knight", promote: "free promotion", wall: "free city wall", remove_road: "road to tear up" };
  const msgs = {
    setup_village: mine ? (st.setup_kind === "city" ? "Place your <b>city</b> on a glowing corner." : "Place a <b>village</b> on a glowing corner.") : `${cur} is placing.`,
    setup_road: mine ? `Place a <b>road</b>${st.options.seafaring ? " or <b>ship</b>" : ""} beside it.` : `${cur} is placing a road.`,
    roll: mine ? "Your turn. <b>Roll the dice</b>." : `${cur} is about to roll.`,
    main: mine ? (ui.mode ? modeTxt[ui.mode] : "Trade, build, or end your turn.") : `${cur} is taking their turn.`,
    discard: st.discard ? "<b>Bandits!</b> Discard half your cards." : `Waiting for ${st.waiting_discard.map((i) => esc(st.players[i].name)).join(", ")} to discard.`,
    pick: st.pick ? `Choose <b>${st.pick}</b> resource(s).` : `Waiting for ${st.waiting_pick.map((i) => esc(st.players[i].name)).join(", ")} to choose.`,
    bandit: mine ? (st.options.seafaring && st.robber_kind === "any" ? "Click a land tile for the <b>bandits</b> or a sea tile for the <b>pirate</b>." : "Move the <b>bandits</b> to a new tile.") : `${cur} is moving the ${st.options.seafaring ? "bandits or pirate" : "bandits"}.`,
    steal: mine ? "Choose someone to <b>rob</b>:" : `${cur} is choosing whom to rob.`,
    place: mine ? `Place your <b>${placeTxt[st.placing?.kind] || "piece"}</b> (${st.placing?.left} left).` : `${cur} is placing.`,
  };
  return msgs[st.phase] || st.phase;
}

function diceHtml(st) {
  if (!st.dice) return "";
  const k = st.options.knights;
  let h = `<span class="dice">`;
  st.dice.forEach((d, i) => (h += `<span class="die ${k ? (i ? "yellow" : "red") : ""}">${d}</span>`));
  if (k && st.event) h += `<span class="die event" title="event die: ${st.event}">${EVENT_ICON[st.event]}</span>`;
  return h + `</span>`;
}

function raidersHtml(st) {
  if (!st.options.knights) return "";
  const strength = st.buildings.filter(([, , k]) => k === "city").length;
  const defense = st.players.reduce((s, p) => s + p.knight_strength, 0);
  let cells = "";
  for (let i = 0; i < st.raid_track; i++) cells += `<span class="cell ${i === st.raiders ? "here" : ""} ${i === st.raid_track - 1 ? "land" : ""}">${i === st.raiders ? "⛵" : i === st.raid_track - 1 ? "🏰" : ""}</span>`;
  return `<div class="box"><h3>Raiders</h3><div class="track">${cells}</div>
    <div class="cost">Raider strength <b>${strength}</b> (cities) vs. active knights <b>${defense}</b>${st.raided ? "" : " · bandits sleep until the first raid"}</div></div>`;
}

function renderGame() {
  const st = ui.st;
  show("game");
  if (st.phase !== "main" || st.current !== st.you) { ui.mode = null; ui.sel = null; }
  boardSvg(st);

  const K = st.options.knights, S = st.options.seafaring;
  const me = st.players[st.you];
  const mine = st.current === st.you && st.phase !== "over";
  const main = mine && st.phase === "main";
  const L = st.legal || {};
  const can = (cost) => Object.entries(cost).every(([r, n]) => st.hand[r] >= n);
  let h = "";

  // status
  h += `<div class="box status">${promptText(st)}${diceHtml(st)}`;
  if (mine && st.phase === "steal") {
    h += `<div class="pick" style="margin-top:6px">${st.steal_candidates.map((i) => `<button data-steal="${i}">${esc(st.players[i].name)}</button>`).join("")}</div>`;
  }
  if (mine && st.phase === "place") h += `<div style="margin-top:6px"><button data-act="place_done">Done</button></div>`;
  if (main && ui.mode) h += `<div style="margin-top:6px"><button data-mode="${ui.mode}">Cancel</button></div>`;
  h += `</div>`;
  h += offerHtml(st);
  h += raidersHtml(st);

  // players
  h += `<div class="box"><h3>Lords of the realm <span class="cost">first to ${st.vp_target}★</span></h3><div class="players">`;
  for (const p of st.players) {
    const off = ui.online && !ui.online[p.id] ? ` <span class="off">(away)</span>` : "";
    const caps = Object.entries(st.capitals || {}).filter(([, [o]]) => o === p.id).map(([t]) => `<span class="badge" style="background:${TRACKS[t].color};color:#fff">${TRACKS[t].name} capital</span>`).join("");
    const stats = [`🂠${p.cards}`];
    if (K) stats.push(`📜${p.progress}`, `🛡️${p.knight_strength}`); else stats.push(`📜${p.decrees}`, `⚔️${p.soldiers}`);
    stats.push(`🛤️${p.road_length}`);
    h += `<div class="pl ${p.id === st.current ? "turn" : ""}">
      <span class="sw" style="background:${p.color}"></span>
      <span class="nm">${esc(p.name)}${p.id === st.you ? " (you)" : ""}${off}
        ${ui.bots?.[p.id] ? `<span class="badge bot" title="computer lord">🤖 ${STYLE[ui.bots[p.id]].split(" ")[1]}</span>` : ""}
        ${st.longest_road === p.id ? '<span class="badge">Longest Road</span>' : ""}
        ${st.largest_army === p.id ? '<span class="badge">Largest Army</span>' : ""}
        ${p.defender ? `<span class="badge">Defender ×${p.defender}</span>` : ""}${caps}
        ${p.advancements.length ? `<span class="badge" title="${esc(p.advancements.join(", "))}">⭐×${p.advancements.length}</span>` : ""}
        ${p.islands ? `<span class="badge">🏝️×${p.islands}</span>` : ""}</span>
      <span class="st" title="cards · ${K ? "progress cards · active knights" : "decrees · soldiers"} · road">${stats.join(" ")}</span>
      <span class="vp" title="victory points">${p.vp}★</span></div>`;
  }
  h += `</div></div>`;

  // hand
  const held = st.cards.reduce((s, r) => s + st.hand[r], 0);
  h += `<div class="box"><h3>Your hand <span class="cost">${held} card${held === 1 ? "" : "s"} · limit ${me.hand_limit}</span></h3>${handFan(st, ui.fx?.gains || {})}`;
  h += `<div class="hand-counts">${st.cards.map((r) => `<span class="${st.hand[r] ? "" : "zero"}">${ICON[r]}${st.hand[r]}</span>`).join("")}</div></div>`;

  // actions
  const btn = (mode, label, cost, ok) => `<button data-mode="${mode}" class="${ui.mode === mode ? "on" : ""}" ${main && ok ? "" : "disabled"}>${label}${cost ? `<span class="cost">${costTxt(cost)}</span>` : ""}</button>`;
  h += `<div class="box"><h3>Actions</h3><div class="actions">`;
  h += `<button class="wide" data-act="roll" ${mine && st.phase === "roll" ? "" : "disabled"}>🎲 Roll dice</button>`;
  h += btn("road", "Road", st.costs.road, can(st.costs.road) && L.roads?.length);
  if (S) h += btn("ship", "⛵ Ship", st.costs.ship, can(st.costs.ship) && L.ships?.length);
  h += btn("village", "🏠 Village", st.costs.village, can(st.costs.village) && L.villages?.length);
  h += btn("city", "🏰 City", st.costs.city, can(st.costs.city) && L.cities?.length);
  if (!K) h += `<button data-act="buy_decree" ${main && can(st.costs.decree) && st.deck_left ? "" : "disabled"}>📜 Decree<span class="cost">${costTxt(st.costs.decree)} · ${st.deck_left} left</span></button>`;
  if (K) {
    h += btn("knight", "🛡️ Knight", st.costs.knight, can(st.costs.knight) && L.knights?.length);
    h += btn("promote", "⬆️ Promote", st.costs.promote, can(st.costs.promote) && L.promote?.length);
    h += btn("activate", "✊ Activate", st.costs.activate, can(st.costs.activate) && L.activate?.length);
    h += btn("wall", "🧱 City wall", st.costs.wall, can(st.costs.wall) && L.walls?.length);
    h += btn("move_knight", "🐎 Move knight", null, Object.keys(L.knight_moves || {}).length);
    h += btn("chase", "🏹 Chase bandits", null, L.chase?.length);
  }
  if (S) h += btn("move_ship", "↪️ Move ship", null, Object.keys(L.ship_moves || {}).length);
  h += `<button class="wide" data-act="end_turn" ${main ? "" : "disabled"}>End turn</button>`;
  const pieces = [`${me.pieces.road} roads`, S ? `${me.pieces.ship} ships` : "", `${me.pieces.village} villages`, `${me.pieces.city} cities`,
    K ? `knights ${me.knight_pieces[1]}/${me.knight_pieces[2]}/${me.knight_pieces[3]}` : ""].filter(Boolean).join(" · ");
  h += `</div><div class="cost" style="margin-top:4px">Pieces left: ${pieces}</div></div>`;

  // city improvements
  if (K) {
    h += `<div class="box"><h3>City improvements</h3>`;
    for (const [t, info] of Object.entries(TRACKS)) {
      const lvl = me.levels[t];
      const next = L.improve?.[t];
      const cap = st.capitals?.[t];
      let pips = "";
      for (let i = 1; i <= 5; i++) pips += `<span class="pip ${i <= lvl ? "on" : ""}" style="${i <= lvl ? `background:${info.color}` : ""}">${i}</span>`;
      h += `<div class="track-row"><span class="tname" style="color:${info.color}">${info.icon} ${info.name}</span>${pips}
        <button data-improve="${t}" ${main && next ? "" : "disabled"}>${lvl >= 5 ? "Max" : `+1 · ${lvl + 1}${ICON[info.com]}`}</button></div>
        <div class="cost">${lvl >= 3 ? "✅" : "Level 3:"} ${info.l3}${cap ? ` · capital: ${esc(st.players[cap[0]].name)}` : " · level 4 founds the capital (+2★)"}</div>`;
    }
    h += `</div>`;
  }

  // cards
  if (!K && st.my_decrees.length) {
    h += `<div class="box"><h3>Royal decrees</h3>`;
    for (const d of st.my_decrees) {
      const adv = d.card.startsWith("adv:");
      const playable = mine && (st.phase === "roll" || st.phase === "main") && !d.new && !adv && !st.played_decree;
      h += `<div class="decree"><span class="dn">${adv ? "⭐ " : ""}${esc(d.name)}${adv ? ' <span class="new">Important Advancement (+1★)</span>' : ""}${d.new ? ' <span class="new">(new; playable next turn)</span>' : ""}</span>`;
      if (!adv) h += `<button data-play="${d.card}" ${playable ? "" : "disabled"}>Play</button>`;
      h += `</div>`;
    }
    h += `</div>`;
  }
  if (K) {
    h += `<div class="box"><h3>Progress cards <span class="cost">${st.my_progress.length}/4</span></h3>`;
    if (!st.my_progress.length) h += `<div class="cost">Raise a city improvement to draw cards when the event die shows its color.</div>`;
    for (const c of st.my_progress) {
      const ok = mine && (L.progress_playable || []).includes(c.card);
      h += `<div class="decree"><span class="dn"><span style="color:${TRACKS[c.track].color}">${TRACKS[c.track].icon}</span> <b>${esc(c.name)}</b><br><span class="new">${esc(c.desc)}</span></span>
        <button data-progress="${c.card}" ${ok ? "" : "disabled"}>Play</button></div>`;
    }
    h += `</div>`;
  }

  // trade
  h += tradeHtml(st, main);

  $("panel-main").innerHTML = h;
  const bg = $("bank-give"), bt = $("bank-get");
  if (bg) { bg.onchange = () => (ui.bankGive = bg.value); bt.onchange = () => (ui.bankGet = bt.value); }
  $("log").innerHTML = st.log.map((l) => `<div>${esc(l)}</div>`).join("");
  $("log").scrollTop = 1e9;
  renderModal();
}

function offerHtml(st) {
  const t = st.trade;
  let h = "";
  if (t) {
    const from = esc(st.players[t.from].name);
    if (t.from === st.you) {
      h += `<div class="offer">You offer ${fmtRes(t.give)} for ${fmtRes(t.get)}<div class="btns">`;
      for (const pid of t.accepted) h += `<button data-complete="${pid}">Trade with ${esc(st.players[pid].name)}</button>`;
      const others = st.players.filter((p) => p.id !== st.you);
      h += `</div><div class="cost">${others.map((p) => `${esc(p.name)}: ${t.accepted.includes(p.id) ? "✅ accepted" : t.declined.includes(p.id) ? "❌ declined" : "⏳ thinking"}`).join(" · ")}</div>`;
      h += `<div class="btns"><button data-act="cancel_trade">Withdraw offer</button></div></div>`;
    } else if (t.declined.includes(st.you)) {
      h += `<div class="offer declined">You declined ${from}'s offer. <button data-respond="undo" class="link-btn">Undo</button></div>`;
    } else {
      const missing = Object.entries(t.get).filter(([r, n]) => st.hand[r] < n).map(([r, n]) => `${n - st.hand[r]}${ICON[r]}`);
      const accepted = t.accepted.includes(st.you);
      h += `<div class="offer"><b>${from}</b> wants to trade:<div class="you-trade">You give <b>${fmtRes(t.get)}</b> · You get <b>${fmtRes(t.give)}</b></div><div class="btns">`;
      if (accepted) h += `<span>✅ Accepted, waiting for ${from}…</span>`;
      else h += `<button data-respond="1" ${missing.length ? "disabled" : ""}>Accept</button>`;
      h += `<button data-respond="0">Decline</button></div>`;
      if (missing.length && !accepted) h += `<div class="cost">You need ${missing.join(" ")} more to accept.</div>`;
      h += `</div>`;
    }
  }
  return h;
}

// your cards, fanned out like a real hand; newly gained cards are dealt in
function handFan(st, gains) {
  const cards = [];
  for (const r of st.cards) for (let i = 0; i < st.hand[r]; i++) cards.push(r);
  const n = cards.length;
  if (!n) return `<div class="fan empty">Your hand is empty.</div>`;
  const spread = Math.min(30, 250 / n), tilt = Math.min(7, 56 / n);
  const left = { ...gains };
  const dealt = cards.map(() => false);
  for (let i = n - 1; i >= 0; i--) if (left[cards[i]] > 0) { dealt[i] = true; left[cards[i]]--; }
  return `<div class="fan">${cards.map((r, i) => {
    const o = i - (n - 1) / 2;
    return `<div class="hcard c-${r} ${dealt[i] ? "dealt" : ""}" title="${r}"
      style="left:calc(50% + ${o * spread}px);--rot:${o * tilt}deg;--lift:${(o * o * 0.4).toFixed(1)}px;z-index:${i};animation-delay:${dealt[i] ? (i % 6) * 60 : 0}ms">
      <span class="ci">${ICON[r]}</span><span class="cn">${r}</span></div>`;
  }).join("")}</div>`;
}

function tradeHtml(st, main) {
  let h = `<div class="box"><h3>Trade</h3>`;
  const t = st.trade;
  if (main) {
    const cards = st.cards;
    h += `<div class="steppers" style="grid-template-columns:auto repeat(${cards.length},1fr)"><span></span>${cards.map((r) => `<span class="h">${ICON[r]}</span>`).join("")}`;
    for (const side of ["give", "get"]) {
      h += `<span>${side === "give" ? "Give" : "Get"}</span>`;
      for (const r of cards) h += `<div class="stp"><button data-step="${side}:${r}:1">+</button><span>${ui[side][r] || 0}</span><button data-step="${side}:${r}:-1">−</button></div>`;
    }
    h += `</div><button data-act="offer" style="margin-top:6px;width:100%">Offer to other lords</button>`;
    if (!cards.includes(ui.bankGive)) ui.bankGive = "timber";
    h += `<div class="bank-row">Bank: give <select id="bank-give">${cards.map((r) => `<option value="${r}" ${r === ui.bankGive ? "selected" : ""}>${st.rates[r]} ${r}</option>`).join("")}</select>
      for 1 <select id="bank-get">${cards.map((r) => `<option value="${r}" ${r === ui.bankGet ? "selected" : ""}>${r}</option>`).join("")}</select>
      <button data-act="bank">Trade</button></div>`;
    if (st.trade_charter) h += `<div class="cost">📜 Trade Charter: everything trades 2:1 this turn.</div>`;
  } else if (!t) {
    h += `<div class="cost">You can trade during your turn after rolling.</div>`;
  }
  return h + `</div>`;
}

$("panel-main").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b || b.disabled) return;
  const d = b.dataset;
  if (d.act === "roll") act({ type: "roll" });
  else if (d.act === "buy_decree") act({ type: "buy_decree" });
  else if (d.act === "end_turn") { ui.mode = null; act({ type: "end_turn" }); }
  else if (d.act === "cancel_trade") act({ type: "cancel_trade" });
  else if (d.act === "place_done") act({ type: "place_done" });
  else if (d.act === "offer") {
    act({ type: "offer_trade", give: ui.give, get: ui.get });
    ui.give = {}; ui.get = {};
  } else if (d.act === "bank") act({ type: "bank_trade", give: ui.bankGive, get: ui.bankGet });
  else if (d.mode) { ui.mode = ui.mode === d.mode ? null : d.mode; ui.sel = null; renderGame(); }
  else if (d.improve) act({ type: "improve", track: d.improve });
  else if (d.steal) act({ type: "steal", target: Number(d.steal) });
  else if (d.complete) act({ type: "complete_trade", with: Number(d.complete) });
  else if (d.respond) act({ type: "respond_trade", accept: d.respond === "undo" ? null : d.respond === "1" });
  else if (d.step) {
    const [side, r, n] = d.step.split(":");
    ui[side][r] = Math.max(0, (ui[side][r] || 0) + Number(n));
    renderGame();
  } else if (d.play) {
    if (d.play === "harvest") openModal({ kind: "decree", card: "harvest", param: "resources2" });
    else if (d.play === "monopoly") openModal({ kind: "decree", card: "monopoly", param: "resource" });
    else act({ type: "play_decree", card: d.play });
  } else if (d.progress) {
    const c = ui.st.my_progress.find((x) => x.card === d.progress);
    if (c.param) openModal({ kind: "progress", card: c.card, param: c.param, name: c.name, desc: c.desc });
    else act({ type: "play_progress", card: c.card });
  }
});

// ---------------------------------------------------------------- modals
function openModal(m) { ui.modal = { ...m, picks: [], dice: [null, null] }; renderModal(); }

function counterModal(title, text, need, sel, pool, have, confirmAttr) {
  const total = Object.values(sel).reduce((a, b) => a + b, 0);
  let h = `<h3>${title}</h3><p>${text} (${total} / ${need} chosen)</p><div class="hand">`;
  for (const r of pool) {
    const n = sel[r] || 0;
    const max = have ? have[r] : Infinity;
    h += `<div class="res"><span class="ic">${ICON[r]}</span><span class="n">${n}${have ? ` / ${have[r]}` : ""}</span>
      <div class="stp"><button data-cstep="${r}:1" ${n >= max || total >= need ? "disabled" : ""}>+</button><button data-cstep="${r}:-1" ${n ? "" : "disabled"}>−</button></div></div>`;
  }
  return h + `</div><button class="big" ${confirmAttr} ${total === need ? "" : "disabled"}>Confirm</button>`;
}

function renderModal() {
  const st = ui.st;
  let h = "";
  const m = ui.modal;
  if (st && st.phase === "discard" && st.discard) {
    ui.counter = ui.discardSel;
    h = counterModal("The bandits raid your stores!", `Discard ${st.discard} cards`, st.discard, ui.discardSel, st.cards, st.hand, "data-dconfirm");
  } else if (st && st.phase === "pick" && st.pick) {
    ui.counter = ui.pickSel;
    h = counterModal("Choose your resources", `Take ${st.pick} from the bank`, st.pick, ui.pickSel, RES, null, "data-pconfirm");
  } else if (m) {
    const title = m.kind === "decree" ? (m.card === "harvest" ? "Bountiful Harvest" : "Resource Monopoly") : esc(m.name);
    h = `<h3>${title}</h3>${m.desc ? `<p>${esc(m.desc)}</p>` : ""}`;
    const pickBtns = (pool, attr, disabled) => `<div class="pick">${pool.map((r) => `<button data-${attr}="${r}" ${disabled ? "disabled" : ""}>${ICON[r]} ${r}</button>`).join("")}</div>`;
    let ready = false;
    if (m.param === "resources2" || m.param === "commodities2") {
      const pool = m.param === "resources2" ? RES : COM;
      h += `<p>Chosen: ${m.picks.map((r) => ICON[r]).join(" ") || "…"}</p>` + pickBtns(pool, "mpick", m.picks.length >= 2);
      ready = m.picks.length === 2;
    } else if (m.param === "resource" || m.param === "commodity") {
      h += pickBtns(m.param === "resource" ? RES : COM, "mone", false);
    } else if (m.param === "resource_commodity") {
      h += `<p>Resource: ${m.res ? ICON[m.res] : "…"} · Commodity: ${m.com ? ICON[m.com] : "…"}</p>` + pickBtns(RES, "mres", false) + pickBtns(COM, "mcom", false);
      ready = m.res && m.com;
    } else if (m.param === "number") {
      h += `<div class="pick">${[2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((n) => `<button data-mnum="${n}">${n}</button>`).join("")}</div>`;
    } else if (m.param === "dice") {
      for (const [i, label] of [[0, "Red"], [1, "Yellow"]]) {
        h += `<p>${label} die:</p><div class="pick">${[1, 2, 3, 4, 5, 6].map((n) => `<button data-mdie="${i}:${n}" class="${m.dice[i] === n ? "on" : ""}">${n}</button>`).join("")}</div>`;
      }
      ready = m.dice[0] && m.dice[1];
    }
    if (!["resource", "commodity", "number"].includes(m.param)) h += `<button class="big" data-mconfirm ${ready ? "" : "disabled"}>Play</button>`;
    h += `<button data-close>Cancel</button>`;
  } else {
    ui.discardSel = {};
    ui.pickSel = {};
  }
  $("modal").classList.toggle("hidden", !h);
  $("modal-body").innerHTML = h;
}

function playModal(extra) {
  const m = ui.modal;
  if (m.kind === "decree") act({ type: "play_decree", card: m.card, ...extra });
  else act({ type: "play_progress", card: m.card, ...extra });
  ui.modal = null;
}

$("modal-body").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b || b.disabled) return;
  const d = b.dataset;
  const m = ui.modal;
  if (d.cstep) {
    const [r, n] = d.cstep.split(":");
    ui.counter[r] = (ui.counter[r] || 0) + Number(n);
  } else if ("dconfirm" in d) { act({ type: "discard", resources: ui.discardSel }); ui.discardSel = {}; }
  else if ("pconfirm" in d) { act({ type: "pick", resources: ui.pickSel }); ui.pickSel = {}; }
  else if (d.mpick) m.picks.push(d.mpick);
  else if (d.mone) playModal({ resource: d.mone });
  else if (d.mres) m.res = d.mres;
  else if (d.mcom) m.com = d.mcom;
  else if (d.mnum) playModal({ number: Number(d.mnum) });
  else if (d.mdie) { const [i, n] = d.mdie.split(":").map(Number); m.dice[i] = n; }
  else if ("mconfirm" in d) {
    if (m.param === "dice") playModal({ dice: m.dice });
    else if (m.param === "resource_commodity") playModal({ resource: m.res, commodity: m.com });
    else playModal({ resources: m.picks });
  } else if ("close" in d) ui.modal = null;
  renderModal();
});

// ---------------------------------------------------------------- chat
let unread = 0;
const seenChat = new Set();
function addChat(m) {
  // the server replays recent history on every (re)join; skip lines we already show
  if (m.id !== undefined && seenChat.has(m.id)) return;
  seenChat.add(m.id);
  const d = document.createElement("div");
  d.innerHTML = `<b>${esc(m.from)}:</b> ${esc(m.text)}`;
  $("chat").appendChild(d);
  $("chat").scrollTop = 1e9;
  const mineMsg = ui.session && m.from === ui.session.name;
  if ($("chatwin").classList.contains("collapsed") && !m.history && !mineMsg) {
    unread++;
    $("chat-badge").textContent = unread;
    $("chat-badge").classList.remove("hidden");
    toast(`💬 ${m.from}: ${m.text}`);
  }
}
function setChatOpen(open) {
  $("chatwin").classList.toggle("collapsed", !open);
  try { localStorage.setItem("sl-chat-open", open ? "1" : "0"); } catch {}
  if (open) {
    unread = 0;
    $("chat-badge").classList.add("hidden");
    $("chat").scrollTop = 1e9;
  }
}
setChatOpen((() => { try { return localStorage.getItem("sl-chat-open") !== "0"; } catch { return true; } })());
$("chat-head").onclick = () => setChatOpen($("chatwin").classList.contains("collapsed"));
$("chat-form").onsubmit = (e) => {
  e.preventDefault();
  const text = $("chat-input").value.trim();
  if (text) send({ type: "chat", text });
  $("chat-input").value = "";
};
// press Enter anywhere to jump into chat
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || $("chatwin").classList.contains("hidden")) return;
  if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(document.activeElement?.tagName)) return;
  e.preventDefault();
  setChatOpen(true);
  $("chat-input").focus();
});

window.addEventListener("load", connect);
