"use strict";
// Voice chat: a WebRTC mesh. The game server only relays signaling messages;
// audio goes directly between browsers. Whoever joins voice calls everyone
// already there, so two peers never both start a call to each other.

// PeerJS (static-hosting mode) ships public STUN + TURN servers; TURN relays audio when direct paths fail
const ICE = window.peerjs?.util?.defaultConfig?.iceServers
  || [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];

const voice = {
  me: null,          // my voice id (from the server's "joined" message)
  on: false,
  muted: false,
  stream: null,      // my microphone
  peers: new Map(),  // voice id -> {pc, audio, pending ICE, level}
  members: [],       // [{id, name}]
  ctx: null,
  levels: new Map(), // voice id (or "me") -> analyser
};

function voiceAvailable() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection);
}

async function voiceJoin() {
  if (!voiceAvailable()) {
    toast(location.protocol === "http:" && location.hostname !== "localhost"
      ? "Voice needs the https link (the cloudflared tunnel) or localhost."
      : "This browser doesn't support voice chat.");
    return;
  }
  try {
    voice.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch (e) {
    toast("Microphone permission was denied.");
    return;
  }
  voice.on = true;
  voice.muted = false;
  voice.ctx = voice.ctx || new (window.AudioContext || window.webkitAudioContext)();
  watchLevel("me", voice.stream);
  voice.joining = true;
  send({ type: "voice", on: true });
  renderVoice();
}

function voiceLeave() {
  send({ type: "voice", on: false });
  for (const id of [...voice.peers.keys()]) dropPeer(id);
  voice.stream?.getTracks().forEach((t) => t.stop());
  voice.stream = null;
  voice.on = false;
  voice.levels.clear();
  renderVoice();
}

function voiceMute() {
  voice.muted = !voice.muted;
  voice.stream?.getAudioTracks().forEach((t) => (t.enabled = !voice.muted));
  renderVoice();
}

function makePeer(id) {
  dropPeer(id);
  const pc = new RTCPeerConnection({ iceServers: ICE });
  const peer = { pc, audio: null, pending: [] };
  voice.peers.set(id, peer);
  voice.stream.getTracks().forEach((t) => pc.addTrack(t, voice.stream));
  // toJSON(): browser RTC objects must become plain data to cross every transport
  pc.onicecandidate = (e) => { if (e.candidate) send({ type: "rtc", to: id, data: { candidate: e.candidate.toJSON() } }); };
  pc.ontrack = (e) => {
    if (!peer.audio) {
      peer.audio = new Audio();
      peer.audio.autoplay = true;
      document.body.appendChild(peer.audio);
    }
    peer.audio.srcObject = e.streams[0];
    peer.audio.play().catch(() => {});
    watchLevel(id, e.streams[0]);
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed") toast("Voice couldn't connect to one player (their network may block it).");
    renderVoice();
  };
  return peer;
}

function dropPeer(id) {
  const p = voice.peers.get(id);
  if (!p) return;
  p.pc.close();
  if (p.audio) { p.audio.srcObject = null; p.audio.remove(); }
  voice.peers.delete(id);
  voice.levels.delete(id);
}

async function callPeer(id) {
  const peer = makePeer(id);
  const offer = await peer.pc.createOffer();
  await peer.pc.setLocalDescription(offer);
  send({ type: "rtc", to: id, data: { sdp: peer.pc.localDescription.toJSON() } });
}

async function onRtc(m) {
  if (!voice.on) return;
  const { sdp, candidate } = m.data || {};
  let peer = voice.peers.get(m.from);
  if (sdp && sdp.type === "offer") {
    peer = makePeer(m.from);   // a (re)joining member is calling us
    await peer.pc.setRemoteDescription(sdp);
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    send({ type: "rtc", to: m.from, data: { sdp: peer.pc.localDescription.toJSON() } });
    for (const c of peer.pending.splice(0)) await peer.pc.addIceCandidate(c).catch(() => {});
  } else if (sdp && sdp.type === "answer" && peer) {
    await peer.pc.setRemoteDescription(sdp);
    for (const c of peer.pending.splice(0)) await peer.pc.addIceCandidate(c).catch(() => {});
  } else if (candidate && peer) {
    if (peer.pc.remoteDescription) await peer.pc.addIceCandidate(candidate).catch(() => {});
    else peer.pending.push(candidate);
  }
}

function onVoiceMembers(m) {
  voice.members = m.members;
  const ids = new Set(m.members.map((x) => x.id));
  if (voice.on) {
    if (!ids.has(voice.me)) {
      // the server dropped us (e.g. after a reconnect); rejoin with the mic we already have
      voice.joining = true;
      send({ type: "voice", on: true });
    } else if (voice.joining) {
      voice.joining = false;
      for (const x of m.members) if (x.id !== voice.me) callPeer(x.id);
    }
    for (const id of [...voice.peers.keys()]) if (!ids.has(id)) dropPeer(id);
  }
  renderVoice();
}

function watchLevel(id, stream) {
  try {
    const src = voice.ctx.createMediaStreamSource(stream);
    const an = voice.ctx.createAnalyser();
    an.fftSize = 512;
    src.connect(an);
    voice.levels.set(id, an);
  } catch {}
}

function speaking(id) {
  const an = voice.levels.get(id);
  if (!an) return false;
  const buf = new Uint8Array(an.fftSize);
  an.getByteTimeDomainData(buf);
  let sum = 0;
  for (const v of buf) sum += (v - 128) * (v - 128);
  return Math.sqrt(sum / buf.length) > 6;
}

function renderVoice() {
  const box = $("voice");
  if (!box) return;
  const list = voice.members.map((x) => {
    const me = x.id === voice.me;
    const st = me ? (voice.muted ? "🔇" : "🎙️") : voice.peers.get(x.id)?.pc.connectionState === "connected" ? "🔊" : "…";
    return `<span class="vm" data-vid="${x.id}">${st} ${esc(x.name)}${me ? " (you)" : ""}</span>`;
  }).join("");
  box.innerHTML = `<div class="vbtns">${voice.on
    ? `<button id="v-mute">${voice.muted ? "🔇 Unmute" : "🎙️ Mute"}</button><button id="v-leave">Leave voice</button>`
    : `<button id="v-join">🎧 Join voice</button>`}</div><div class="vlist">${list || '<span class="cost">Nobody is in voice yet.</span>'}</div>`;
  $("v-join") && ($("v-join").onclick = voiceJoin);
  $("v-leave") && ($("v-leave").onclick = voiceLeave);
  $("v-mute") && ($("v-mute").onclick = voiceMute);
}

// light up whoever is talking
setInterval(() => {
  if (!voice.on) return;
  for (const el of document.querySelectorAll(".vm")) {
    const id = el.dataset.vid === voice.me ? "me" : el.dataset.vid;
    el.classList.toggle("talking", !(id === "me" && voice.muted) && speaking(id));
  }
}, 150);

renderVoice();
