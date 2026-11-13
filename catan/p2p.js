"use strict";
// Static-hosting mode: the player who founds a realm hosts it in their own browser tab.
// The host tab runs the Python rules engine (Pyodide) and plays the role of server.py;
// other players connect to it peer-to-peer through PeerJS. The host saves the game
// to localStorage after every move, so refreshing the host tab resumes it.

const PEER_PREFIX = "serfs-lords-";
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const GAME_FILES = ["__init__.py", "board.py", "bot.py", "common.py", "engine.py", "knights.py",
  "mapgen.py", "progress.py", "seafaring.py"];
const SAVE_KEY = "sl-host";
const TRADE_PATIENCE = 20000;
// Fallback transport: public MQTT brokers over secure websockets. Used when a direct
// WebRTC link can't be made (strict NATs, campus Wi-Fi, hotspots); it works anywhere
// normal https does. The host listens on all of them; a guest uses the first that answers.
const RELAYS = ["wss://broker.emqx.io:8084/mqtt", "wss://broker.hivemq.com:8884/mqtt"];
const MQTT_URL = "https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js";
const DIRECT_GRACE = 5000;      // how long a guest tries a direct link before also trying relays
const FIND_TIMEOUT = 20000;     // give up looking for a realm that never answers
const FORCE_RELAY = new URLSearchParams(location.search).has("relay");   // debugging aid
const HEARTBEAT = 4000;         // host pings guests this often
const HOST_SILENCE = 12000;     // guests reconnect after this long without hearing from the host
const BOT_DELAY = { respond_trade: 1400, roll: 1100, end_turn: 900, discard: 1000, pick: 1000 };
// real lords and ladies of the middle ages, for computer players
const LORD_NAMES = [
  "William the Conqueror", "Eleanor of Aquitaine", "Richard the Lionheart", "Charlemagne",
  "Robert the Bruce", "Joan of Arc", "El Cid", "Frederick Barbarossa", "Matilda of Tuscany",
  "Alfred the Great", "Saladin", "Edward Longshanks", "Isabella of Castile", "Hugh Capet",
  "Godfrey of Bouillon", "Llywelyn the Great", "Brian Boru", "Æthelflæd", "Philip Augustus",
  "Harald Hardrada", "Rollo of Normandy", "Bolesław the Brave", "Owain Glyndŵr", "Empress Matilda",
  "Otto the Great", "William Wallace", "Blanche of Castile", "Simon de Montfort", "Henry the Lion",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const peerId = (code) => PEER_PREFIX + code.toLowerCase();
const topicBase = (code) => `serfs-lords/v1/${code.toLowerCase()}`;

let mqttReady = null;
function loadMqtt() {
  mqttReady = mqttReady || loadScript(MQTT_URL).catch((e) => { mqttReady = null; throw e; });
  return mqttReady;
}

function busy(text) {
  let el = $("busy");
  if (!el) {
    el = document.createElement("div");
    el.id = "busy";
    document.body.appendChild(el);
  }
  el.textContent = text || "";
  el.classList.toggle("hidden", !text);
}

function loadScript(src) {
  return new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = ok;
    s.onerror = () => fail(new Error(`couldn't load ${src}`));
    document.head.appendChild(s);
  });
}

let pyModule = null;
async function loadPython() {
  if (pyModule) return pyModule;
  busy("Preparing the realm… (the first time takes a few seconds)");
  await loadScript(PYODIDE_URL + "pyodide.js");
  const py = await loadPyodide({ indexURL: PYODIDE_URL });
  py.FS.mkdirTree("/home/pyodide/game");
  const v = window.BUILD_ID || "";
  for (const f of GAME_FILES) {
    py.FS.writeFile(`/home/pyodide/game/${f}`, await (await fetch(`py/game/${f}?v=${v}`)).text());
  }
  py.FS.writeFile("/home/pyodide/host_glue.py", await (await fetch(`py/host_glue.py?v=${v}`)).text());
  pyModule = py.pyimport("host_glue");
  busy("");
  return pyModule;
}

// ---------------------------------------------------------------- the host's room (port of server.py)
class HostRoom {
  constructor(code, py, saved) {
    this.code = code;
    this.py = py;
    this.seats = [];   // {token, name, vid, bot, client}
    this.options = { size: "small", shape: "classic", seafaring: false, knights: false, vp_target: null };
    this.chat = [];
    this.chatId = 0;
    this.voice = [];
    this.started = false;
    this.botRunning = false;
    this.tradeSince = 0;
    if (saved) {
      this.seats = saved.seats.map((s) => ({ ...s, client: null }));
      this.options = saved.options;
      this.chat = saved.chat || [];
      this.chatId = saved.chatId || 0;
      this.started = saved.started;
      py.load(saved.game || "");
    }
  }

  maxPlayers() { return this.py.max_players(JSON.stringify(this.options)); }
  host() { const i = this.seats.findIndex((s) => !s.bot); return i < 0 ? null : i; }
  seatOf(client) { const i = this.seats.findIndex((s) => s.client === client); return i < 0 ? null : i; }
  bots() { const b = {}; this.seats.forEach((s, i) => { if (s.bot) b[i] = s.bot; }); return b; }
  online() { return this.seats.map((s) => !!s.bot || !!s.client); }

  lobbyMsg(i) {
    return {
      type: "lobby", room: this.code, you: i, host: this.host(), options: this.options,
      resolved: JSON.parse(this.py.resolve(JSON.stringify(this.options))), max_players: this.maxPlayers(),
      styles: JSON.parse(this.py.styles()),
      players: this.seats.map((s) => ({ name: s.name, online: !!s.client, bot: s.bot || null })),
    };
  }

  voiceMsg() {
    const names = Object.fromEntries(this.seats.map((s) => [s.vid, s.name]));
    return { type: "voice_members", members: this.voice.map((v) => ({ id: v, name: names[v] || "?" })) };
  }

  sendAll(msg) { for (const s of this.seats) s.client?.send(msg); }

  broadcast(kick = true) {
    this.seats.forEach((s, i) => {
      if (!s.client) return;
      if (this.started) {
        s.client.send({ type: "state", room: this.code, state: JSON.parse(this.py.view(i)), online: this.online(), bots: this.bots() });
      } else {
        s.client.send(this.lobbyMsg(i));
      }
    });
    this.save();
    if (kick) this.kickBots();
  }

  save() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          code: this.code, options: this.options, chat: this.chat.slice(-50), chatId: this.chatId, started: this.started,
          seats: this.seats.map(({ token, name, vid, bot }) => ({ token, name, vid, bot })),
          game: this.started ? this.py.save() : "",
        }));
      } catch (e) { console.warn("save failed", e); }
    }, 300);
  }

  addBot(style) {
    const used = new Set(this.seats.map((s) => s.name));
    const styles = JSON.parse(this.py.styles());
    this.seats.push({ token: null, name: pick(LORD_NAMES.filter((n) => !used.has(n))), vid: hex(4), bot: styles.includes(style) ? style : pick(styles), client: null });
  }

  kickBots() {
    if (this.started && Object.keys(this.bots()).length && !this.botRunning) this.runBots();
  }

  async runBots() {
    this.botRunning = true;
    let fails = 0;
    try {
      while (this.started) {
        const got = JSON.parse(this.py.bot_step(JSON.stringify(this.bots())));
        if (!got) return;
        let [pid, action] = got;
        if (action === null) {
          if (Date.now() - this.tradeSince < TRADE_PATIENCE) { await sleep(1000); continue; }
          action = { type: "cancel_trade" };
        }
        await sleep(BOT_DELAY[action.type] || 800);
        const err = this.py.apply(pid, JSON.stringify(action));
        if (err) {
          // the state moved on while we waited, or the bot misjudged; recover
          fails++;
          const v = JSON.parse(this.py.view(pid));
          if (fails >= 3 && v.current === pid && v.phase === "main") this.py.apply(pid, JSON.stringify({ type: "end_turn" }));
          else if (fails >= 3 && v.current === pid && v.phase === "place") this.py.apply(pid, JSON.stringify({ type: "place_done" }));
          else if (fails > 20) return;
          continue;
        }
        fails = 0;
        if (action.type === "offer_trade") this.tradeSince = Date.now();
        this.broadcast(false);
      }
    } finally {
      this.botRunning = false;
    }
  }

  join(client, data) {
    const name = String(data.name || "").trim().slice(0, 20) || "Lord";
    const code = String(data.room || "").trim().toUpperCase();
    const token = String(data.token || "");
    if (code !== this.code) { client.send({ type: "error", msg: "That realm isn't hosted here." }); return; }
    let seat = this.seats.findIndex((s) => token && s.token === token);
    if (seat >= 0) {
      const old = this.seats[seat].client;
      this.seats[seat].client = client;
      if (old && old !== client) old.close?.();
    } else if (this.started) {
      client.send({ type: "error", msg: "That game has already started." }); return;
    } else if (this.seats.length >= this.maxPlayers()) {
      client.send({ type: "error", msg: "That room is full." }); return;
    } else {
      this.seats.push({ token: hex(16), name, vid: hex(4), bot: null, client });
      seat = this.seats.length - 1;
    }
    client.send({ type: "joined", room: this.code, token: this.seats[seat].token, seat, vid: this.seats[seat].vid });
    client.send(this.voiceMsg());
    for (const c of this.chat.slice(-30)) client.send({ ...c, history: true });
    this.broadcast();
  }

  handle(client, data) {
    if (!data || typeof data !== "object") return;
    if (data.type === "join") return this.join(client, data);
    const seat = this.seatOf(client);
    if (seat === null) return;
    const err = (msg) => client.send({ type: "error", msg });
    switch (data.type) {
      case "start":
        if (this.started) return;
        if (seat !== this.host()) return err("Only the host can start.");
        if (this.seats.length < 2) return err("Need at least 2 players.");
        if (this.seats.length > this.maxPlayers()) return err("Too many players for this map size.");
        // turn order (and setup order) is drawn by lot
        for (let i = this.seats.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.seats[i], this.seats[j]] = [this.seats[j], this.seats[i]];
        }
        this.py.new_game(JSON.stringify(this.seats.map((s) => s.name)), JSON.stringify(this.options));
        this.started = true;
        return this.broadcast();
      case "add_bot":
      case "remove_bot":
        if (this.started || seat !== this.host()) return;
        if (data.type === "add_bot") {
          if (this.seats.length >= this.maxPlayers()) err("The table is full for this map size.");
          else this.addBot(data.style);
        } else if (Number.isInteger(data.seat) && this.seats[data.seat]?.bot) {
          this.seats.splice(data.seat, 1);
        }
        return this.broadcast();
      case "settings": {
        if (this.started || seat !== this.host()) return;
        const o = data.options || {};
        const next = {
          size: o.size, shape: o.shape, seafaring: !!o.seafaring, knights: !!o.knights,
          vp_target: Number.isInteger(o.vp_target) ? o.vp_target : null,
        };
        if (this.py.max_players(JSON.stringify(next)) < this.seats.length) err("That map is too small for everyone already here.");
        else this.options = next;
        return this.broadcast();
      }
      case "action": {
        if (!this.started) return;
        const msg = this.py.apply(seat, JSON.stringify(data.action || {}));
        if (msg) return err(msg);
        return this.broadcast();
      }
      case "voice": {
        const vid = this.seats[seat].vid;
        this.voice = this.voice.filter((v) => v !== vid);
        if (data.on) this.voice.push(vid);
        return this.sendAll(this.voiceMsg());
      }
      case "rtc": {
        const target = this.seats.find((s) => s.vid === data.to && s.client);
        if (target && this.voice.includes(this.seats[seat].vid)) target.client.send({ type: "rtc", from: this.seats[seat].vid, data: data.data });
        return;
      }
      case "chat": {
        const text = String(data.text || "").trim().slice(0, 300);
        if (!text) return;
        const c = { type: "chat", id: ++this.chatId, from: this.seats[seat].name, text };
        this.chat.push(c);
        this.chat = this.chat.slice(-100);
        this.sendAll(c);
        return this.save();
      }
    }
  }

  disconnect(client) {
    const seat = this.seatOf(client);
    if (seat === null) return;
    const vid = this.seats[seat].vid;
    if (this.voice.includes(vid)) {
      this.voice = this.voice.filter((v) => v !== vid);
      this.sendAll(this.voiceMsg());
    }
    if (this.started) this.seats[seat].client = null;
    else this.seats.splice(seat, 1);
    this.broadcast();
  }
}

// ---------------------------------------------------------------- transport
const P2P = {
  room: null,     // HostRoom when this tab hosts
  local: null,    // the host's own client (loopback)
  peer: null,
  conn: null,     // a guest's connection to the host
  code: null,

  start() {
    const urlRoom = (new URLSearchParams(location.search).get("room") || "").toUpperCase();
    const s = ui.session;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch {}
    if (s?.host && s.room && saved?.code === s.room && (!urlRoom || urlRoom === s.room)) {
      this.becomeHost(s.room, saved)
        .then(() => this.send({ type: "join", room: s.room, name: s.name, token: s.token }))
        .catch((e) => { busy(""); toast(e.message); show("join"); });
    } else if (s?.room && !s.host && (!urlRoom || urlRoom === s.room)) {
      this.connectTo(s.room, () => this.send({ type: "join", room: s.room, name: s.name, token: s.token }));
    } else {
      show("join");
    }
  },

  async enter(code, name) {
    if (code) {
      ui.session = { room: code, name, token: "" };
      this.connectTo(code, () => this.send({ type: "join", room: code, name, token: ui.session?.token || "" }));
      return;
    }
    try {
      for (let attempt = 0; ; attempt++) {
        code = Array.from({ length: 4 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]).join("");
        try { await this.becomeHost(code, null); break; } catch (e) { if (attempt > 3 || e.type !== "unavailable-id") throw e; }
      }
    } catch (e) {
      busy("");
      toast(`Couldn't start hosting: ${e.message}`);
      return;
    }
    localStorage.removeItem(SAVE_KEY);
    saveSession({ room: code, name, token: "", host: true });
    this.send({ type: "join", room: code, name, token: "" });
  },

  send(m) {
    if (this.room) this.room.handle(this.local, m);
    else if (this.conn) this.conn.send(m);
  },

  leave() {
    if (this.room) localStorage.removeItem(SAVE_KEY);
    this.conn?.close();
    this.peer?.destroy();
  },

  async becomeHost(code, saved) {
    const py = await loadPython();
    busy(saved ? "Reopening your realm…" : "Opening your realm to visitors…");
    try {
      this.peer = await openPeer(peerId(code), saved ? 15 : 1);
    } catch (e) {
      if (e.type === "unavailable-id" && !saved) throw e;   // code clash: caller picks another code
      console.warn("direct connections unavailable, relays only:", e.message);
      this.peer = null;
    }
    busy("");
    this.code = code;
    const room = this.room = new HostRoom(code, py, saved);
    this.local = { send: (m) => setTimeout(() => onMessage(structuredClone(m)), 0) };
    this.startRelays(room);
    this.peer?.on("connection", (c) => {
      const client = { send: (m) => { try { if (c.open) c.send(m); } catch {} }, close: () => c.close() };
      c.on("data", (d) => room.handle(client, d));
      c.on("close", () => room.disconnect(client));
      c.on("error", () => room.disconnect(client));
    });
    this.peer?.on("disconnected", () => { if (!this.peer.destroyed) this.peer.reconnect(); });
    // a closed host tab isn't always reported to guests, so keep them posted
    setInterval(() => room.seats.forEach((s) => { if (s.client && s.client !== this.local) s.client.send({ type: "ping" }); }), HEARTBEAT);
    window.addEventListener("beforeunload", (e) => {
      if (room.started && room.seats.some((s, i) => s.client && s.client !== this.local)) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  },

  async startRelays(room) {
    try { await loadMqtt(); } catch { console.warn("relay library failed to load"); return; }
    const base = topicBase(this.code);
    for (const url of RELAYS) {
      const c = mqtt.connect(url, { reconnectPeriod: 3000, connectTimeout: 8000 });
      const guests = new Map();   // guest id -> {client, seen}
      c.on("connect", () => c.subscribe(`${base}/up/+`));
      c.on("message", (topic, payload) => {
        let d;
        try { d = JSON.parse(payload.toString()); } catch { return; }
        const gid = topic.slice(topic.lastIndexOf("/") + 1);
        let g = guests.get(gid);
        const known = !!g;
        if (!g) {
          g = { client: { send: (m) => c.publish(`${base}/down/${gid}`, JSON.stringify(m)), close: () => {} }, seen: 0 };
          guests.set(gid, g);
        }
        g.seen = Date.now();
        if (d.type === "hello") return g.client.send({ type: "ping" });
        // a guest we don't know is still pinging: we reloaded, so ask them to rejoin now
        if (d.type === "ping") return known ? undefined : g.client.send({ type: "who" });
        if (d.type === "bye") { guests.delete(gid); return room.disconnect(g.client); }
        room.handle(g.client, d);
      });
      setInterval(() => {
        for (const [gid, g] of guests) {
          if (Date.now() - g.seen > HOST_SILENCE + 8000) { guests.delete(gid); room.disconnect(g.client); }
        }
      }, 5000);
    }
  },

  // Guest: try a direct WebRTC link and (after a grace period) the relays; use whichever answers first.
  connectTo(code, onOpen) {
    this.code = code;
    const attempt = this.attempt = {};   // a newer call to connectTo supersedes this one
    const rejoin = () => this.connectTo(code, () => this.send({ type: "join", room: code, name: ui.session?.name, token: ui.session?.token }));
    let chosen = null, heard = Date.now();
    const links = [];
    const use = (link) => {
      if (chosen || this.attempt !== attempt) return link.close();
      chosen = this.conn = link;
      heard = Date.now();
      for (const l of links) if (l !== link) l.close();
      busy("");
      onOpen();
    };
    const data = (link, m) => {
      if (link !== chosen) return;
      heard = Date.now();
      if (m?.type === "who") return onOpen();   // the host reloaded and forgot us: rejoin
      if (m?.type !== "ping") onMessage(m);
    };
    const lost = (link) => {
      if (link !== chosen || this.conn !== link) return;
      this.conn = null;
      clearInterval(watch);
      link.close();
      toast("Lost the host's connection, reconnecting…");
      setTimeout(rejoin, 1500);
    };
    const watch = setInterval(() => {
      if (this.attempt !== attempt) return clearInterval(watch);
      if (chosen && Date.now() - heard > HOST_SILENCE) lost(chosen);
    }, 2000);
    const startRelay = () => { if (!chosen && !attempt.relay) { attempt.relay = true; this.relayLink(code, links, use, data, lost); } };

    busy(`Looking for realm ${code}…`);
    if (!FORCE_RELAY) this.directLink(code, links, use, data, lost, startRelay);
    setTimeout(startRelay, FORCE_RELAY ? 0 : DIRECT_GRACE);
    setTimeout(() => { if (!chosen && this.attempt === attempt) busy(`Looking for realm ${code}… (trying another route)`); }, DIRECT_GRACE + 1000);
    setTimeout(() => {
      if (chosen || this.attempt !== attempt) return;
      for (const l of links) l.close();
      if (ui.st || !$("lobby").classList.contains("hidden")) {
        busy("Can't reach the host right now. Is their tab still open? Retrying…");
        rejoin();
      } else {
        busy("");
        toast(`Can't find realm ${code}. Check the code, and make sure the host's tab is open.`);
        saveSession(null);
        show("join");
      }
    }, FIND_TIMEOUT);
  },

  directLink(code, links, use, data, lost, giveUp) {
    const open = () => {
      const conn = this.peer.connect(peerId(code), { reliable: true });
      const link = { kind: "direct", send: (m) => conn.open && conn.send(m), close: () => conn.close() };
      links.push(link);
      conn.on("open", () => use(link));
      conn.on("data", (m) => data(link, m));
      conn.on("close", () => lost(link));
      conn.on("error", () => lost(link));
    };
    if (this.peer && !this.peer.destroyed && this.peer.open) return open();
    try {
      this.peer = new Peer();
    } catch {
      return giveUp();
    }
    this.peer.on("open", open);
    this.peer.on("disconnected", () => { if (!this.peer.destroyed) this.peer.reconnect(); });
    this.peer.on("error", () => giveUp());   // host not on the direct network, or signaling down: lean on relays
  },

  async relayLink(code, links, use, data, lost) {
    try { await loadMqtt(); } catch { return; }
    const base = topicBase(code);
    const gid = hex(8);
    for (const url of RELAYS) {
      const c = mqtt.connect(url, { reconnectPeriod: 0, connectTimeout: 8000 });
      let opened = false, hello = null, ping = null;
      const link = {
        kind: "relay",
        send: (m) => c.publish(`${base}/up/${gid}`, JSON.stringify(m)),
        close: () => { clearInterval(hello); clearInterval(ping); try { if (opened) c.publish(`${base}/up/${gid}`, '{"type":"bye"}'); } catch {} c.end(); },
      };
      links.push(link);
      c.on("connect", () => {
        c.subscribe(`${base}/down/${gid}`);
        const say = () => c.publish(`${base}/up/${gid}`, '{"type":"hello"}');
        say();
        hello = setInterval(say, 2000);
      });
      c.on("message", (topic, payload) => {
        let m;
        try { m = JSON.parse(payload.toString()); } catch { return; }
        if (!opened) {
          opened = true;
          clearInterval(hello);
          ping = setInterval(() => c.publish(`${base}/up/${gid}`, '{"type":"ping"}'), HEARTBEAT);
          use(link);
        }
        data(link, m);
      });
      c.on("close", () => { if (opened) lost(link); });
      c.on("error", () => {});
    }
  },
};

function openPeer(id, tries) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const peer = new Peer(id);
      peer.on("open", () => resolve(peer));
      peer.on("error", (e) => {
        if (peer.open) return;   // later errors are handled by the caller's listeners
        peer.destroy();
        // after a reload the old id can stay reserved for a few seconds
        if (e.type === "unavailable-id" && n + 1 < tries) setTimeout(() => attempt(n + 1), 2000);
        else reject(Object.assign(new Error(e.type === "network" ? "can't reach the matchmaking server" : e.type), { type: e.type }));
      });
    };
    attempt(0);
  });
}

window.P2P = P2P;   // app.js checks window.P2P to pick this transport
