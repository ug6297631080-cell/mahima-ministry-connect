
mahima_script_repai

const firebaseConfig = {
  apiKey: "AIzaSyClk4lBtDAUP5s1OTXhMlAFD8gvMUOXRt4",
  authDomain: "mahima-ministry-48485.firebaseapp.com",
  projectId: "mahima-ministry-48485",
  storageBucket: "mahima-ministry-48485.firebasestorage.app",
  messagingSenderId: "679867569021",
  appId: "1:679867569021:web:357b244a6da94e0cad3214"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const TOKEN_SERVER_URL = "https://mahima-audio-server.onrender.com/get-token";
const LIVEKIT_URL = "wss://mahima-ministry-connect-k9runwnt.livekit.cloud";
const ADMIN_SECRET_KEY = "MCT2026@Prayer";

const roomIds = {
  "morning-prayer": "morning-prayer-room",
  "sunday-service": "sunday-service-room",
  "bible-study": "bible-study-room",
  "prayer-request": "prayer-request-room"
};

const roomNames = {
  "morning-prayer": "Morning Prayer Room",
  "sunday-service": "Sunday Service Room",
  "bible-study": "Bible Study Room",
  "prayer-request": "Prayer Request Room"
};

let currentUser = null;
let lkRoom = null;
let micOn = false;
let handRaised = false;
let allowedToSpeak = false;
let roomLocked = false;
let roomClosing = false;
let meetingStartedAt = null;
let meetingTimerId = null;
let unsubscribeRoom = null;
let unsubscribeParticipants = null;
let unsubscribeSelf = null;
let unsubscribeMessages = null;

const getEl = (id) => document.getElementById(id);
const showMessage = (message) => alert(message);

function getIndiaDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = {};
  for (const part of parts) if (part.type !== "literal") values[part.type] = part.value;
  return `${values.year}-${values.month}-${values.day}`;
}

function slugify(value) {
  const cleaned = value.normalize("NFKD").replace(/[^\x00-\x7F]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || `user-${Date.now()}`;
}

function makeUserId(name, role) {
  return `${role}-${slugify(name)}`;
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[ch]);
}

function updateRoleBadge() {
  const badge = getEl("roleBadge");
  if (badge && currentUser) badge.textContent = currentUser.role === "admin" ? "👑 Admin" : "👤 Member";
}

function updateRoomTitle() {
  if (!currentUser) return;
  const roomName = roomNames[currentUser.roomKey] || "Prayer Room";
  if (getEl("roomTitle")) getEl("roomTitle").textContent = roomName;
  if (getEl("currentRoomName")) getEl("currentRoomName").textContent = roomName;
}

function updateMicUI() {
  const micCircle = document.querySelector(".mic-circle");
  if (micCircle) {
    micCircle.classList.toggle("muted", !micOn);
    micCircle.textContent = micOn ? "🎙️" : "🔇";
  }
  if (getEl("currentMicStatus")) getEl("currentMicStatus").textContent = micOn ? "On 🎙️" : "Muted 🔇";
}

function updateHandUI() {
  if (getEl("currentHandStatus")) getEl("currentHandStatus").textContent = handRaised ? "Raised ✋" : "Down";
}

function updateLockUI() {
  if (getEl("roomLockStatus")) getEl("roomLockStatus").textContent = roomLocked ? "Locked" : "Unlocked";
}

function updateUserStatus(online = 0) {
  if (getEl("onlineCount")) getEl("onlineCount").textContent = String(online);
  if (!currentUser || !getEl("userStatus")) return;
  getEl("userStatus").textContent = `${currentUser.name} joined as ${currentUser.role}. Mic: ${micOn ? "ON" : "Muted"}. Hand: ${handRaised ? "Raised" : "Down"}. Online: ${online}. ${roomLocked ? "Room Locked" : "Room Open"}.`;
}

function stopListeners() {
  [unsubscribeRoom, unsubscribeParticipants, unsubscribeSelf, unsubscribeMessages].forEach((fn) => {
    if (typeof fn === "function") fn();
  });
  unsubscribeRoom = unsubscribeParticipants = unsubscribeSelf = unsubscribeMessages = null;
}

function stopMeetingTimer() {
  if (meetingTimerId) clearInterval(meetingTimerId);
  meetingTimerId = null;
}

function startMeetingTimer(value) {
  stopMeetingTimer();
  if (!value) return;
  meetingStartedAt = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  const render = () => {
    const timer = getEl("meetingTimer");
    if (!timer || !meetingStartedAt) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - meetingStartedAt.getTime()) / 1000));
    const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const s = String(elapsed % 60).padStart(2, "0");
    timer.textContent = `${h}:${m}:${s}`;
  };
  render();
  meetingTimerId = setInterval(render, 1000);
}

async function deleteCollection(query, limit = 400) {
  while (true) {
    const snapshot = await query.limit(limit).get();
    if (snapshot.empty) break;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    if (snapshot.size < limit) break;
  }
}

async function resetRoomForNewDay(roomRef) {
  await Promise.all([
    deleteCollection(roomRef.collection("participants").orderBy(firebase.firestore.FieldPath.documentId())),
    deleteCollection(roomRef.collection("messages").orderBy(firebase.firestore.FieldPath.documentId()))
  ]);
  await roomRef.set({
    online: 0,
    locked: false,
    roomActive: false,
    announcement: null,
    lastResetDate: getIndiaDateKey(),
    resetAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function ensureDailyReset(roomRef) {
  const snap = await roomRef.get();
  if ((snap.data() || {}).lastResetDate !== getIndiaDateKey()) await resetRoomForNewDay(roomRef);
}

async function joinRoom() {
  try {
    if (currentUser) return showMessage("আপনি ইতিমধ্যে একটি room-এ আছেন।");
    const name = getEl("nameInput")?.value.trim();
    const role = getEl("roleInput")?.value;
    const roomKey = getEl("roomInput")?.value;
    const adminKey = getEl("adminKeyInput")?.value.trim() || "";
    if (!name) return showMessage("দয়া করে আপনার নাম লিখুন।");
    if (!roomIds[roomKey]) return showMessage("সঠিক Prayer Room নির্বাচন করুন।");
    if (role === "admin" && adminKey !== ADMIN_SECRET_KEY) return showMessage("Invalid Admin Key ❌");

    const roomId = roomIds[roomKey];
    const roomRef = db.collection("rooms").doc(roomId);
    await roomRef.set({ name: roomNames[roomKey] }, { merge: true });
    await ensureDailyReset(roomRef);

    let data = (await roomRef.get()).data() || {};
    roomLocked = data.locked === true;
    if (role !== "admin") {
      if (data.roomActive !== true) return showMessage("Admin এখনও এই Prayer Room শুরু করেননি।");
      if (roomLocked) return showMessage("Room locked আছে। Admin unlock করলে Join করা যাবে।");
    }

    if (role === "admin") {
      await roomRef.set({
        name: roomNames[roomKey], roomActive: true, locked: false,
        lastResetDate: getIndiaDateKey(),
        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
        endedAt: null
      }, { merge: true });
      roomLocked = false;
    }

    micOn = role === "admin";
    allowedToSpeak = role === "admin";
    handRaised = false;
    roomClosing = false;

    currentUser = {
      id: makeUserId(name, role),
      name,
      role,
      roomKey,
      roomId,
      livekitIdentity: `${slugify(name)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      micOn,
      handRaised,
      allowedToSpeak,
      online: true,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    };

    await roomRef.collection("participants").doc(currentUser.id).set(currentUser, { merge: true });

    getEl("roomPanel")?.classList.remove("hidden");
    getEl("joinSection")?.classList.add("hidden");
    getEl("availableRooms")?.classList.add("hidden");
    getEl("adminPanel")?.classList.toggle("hidden", role !== "admin");

    updateRoomTitle(); updateRoleBadge(); updateMicUI(); updateHandUI(); updateLockUI(); updateUserStatus(1);
    listenRoom(roomRef); listenParticipants(roomRef); listenSelf(roomRef); listenMessages(roomRef);
    await connectLiveKit(roomId, currentUser.livekitIdentity, role);
  } catch (error) {
    console.error("Join error:", error);

    if (currentUser) {
      const failedUser = { ...currentUser };
      await db.collection("rooms")
        .doc(failedUser.roomId)
        .collection("participants")
        .doc(failedUser.id)
        .delete()
        .catch(() => {});
    }

    if (lkRoom) {
      lkRoom.disconnect();
      lkRoom = null;
    }

    stopListeners();
    stopMeetingTimer();

    currentUser = null;
    micOn = false;
    handRaised = false;
    allowedToSpeak = false;
    roomLocked = false;
    roomClosing = false;

    getEl("roomPanel")?.classList.add("hidden");
    getEl("adminPanel")?.classList.add("hidden");
    getEl("joinSection")?.classList.remove("hidden");
    getEl("availableRooms")?.classList.remove("hidden");

    showMessage(`Join error: ${error.message}`);
  }
}

async function connectLiveKit(roomName, participantIdentity, role) {
  try {
    if (!window.LivekitClient) throw new Error("LiveKit Client load হয়নি।");
    const response = await fetch(TOKEN_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, participantName: participantIdentity, role })
    });
    const payload = await response.json();
    if (!response.ok || !payload.token) throw new Error(payload.details || payload.error || "Token পাওয়া যায়নি।");

    const { Room, RoomEvent, Track } = window.LivekitClient;
    lkRoom = new Room({ adaptiveStream: true, dynacast: true });

    lkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio || track.kind === "audio") {
        const el = track.attach();
        el.autoplay = true; el.playsInline = true; el.dataset.livekitAudio = "true"; el.style.display = "none";
        document.body.appendChild(el);
        el.play().catch(() => {});
      }
    });

    lkRoom.on(RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((el) => el.remove()));
    lkRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const identities = new Set(speakers.map((p) => p.identity));
      document.querySelectorAll(".participant-item[data-livekit-identity]").forEach((el) => {
        el.classList.toggle("speaking", identities.has(el.dataset.livekitIdentity));
      });
    });

    await lkRoom.connect(LIVEKIT_URL, payload.token);
    await lkRoom.startAudio().catch(() => {});
    await lkRoom.localParticipant.setMicrophoneEnabled(micOn);

    await db.collection("rooms").doc(roomName).collection("participants").doc(currentUser.id).update({
      micOn, allowedToSpeak, livekitIdentity: payload.identity || participantIdentity
    });

    updateMicUI();
    showMessage("Audio room connected ✅");
  } catch (error) {
    console.error("Audio connect error:", error);
    showMessage(`Audio connect error: ${error.message}`);
  }
}

function listenRoom(roomRef) {
  if (unsubscribeRoom) unsubscribeRoom();
  unsubscribeRoom = roomRef.onSnapshot(async (snap) => {
    if (!snap.exists || !currentUser) return;
    const data = snap.data();
    roomLocked = data.locked === true;
    updateLockUI(); updateUserStatus(data.online || 0);

    if (getEl("announcementText")) getEl("announcementText").textContent = data.announcement?.text || "এখনো কোনো announcement নেই।";
    if (getEl("announcementMeta")) getEl("announcementMeta").textContent = `— ${data.announcement?.author || "Admin"}`;
    if (data.startedAt) startMeetingTimer(data.startedAt);

    if (data.roomActive === false && currentUser.role !== "admin" && !roomClosing) {
      roomClosing = true;
      showMessage("Admin room বন্ধ করেছেন। আপনি room থেকে বেরিয়ে যাচ্ছেন।");
      await leaveRoom({ auto: true, closeRoom: false });
    }
  });
}

function listenSelf(roomRef) {
  if (unsubscribeSelf) unsubscribeSelf();
  unsubscribeSelf = roomRef.collection("participants").doc(currentUser.id).onSnapshot(async (snap) => {
    if (!currentUser) return;
    if (!snap.exists) {
      if (!roomClosing) {
        roomClosing = true;
        showMessage("Admin আপনাকে room থেকে সরিয়ে দিয়েছেন।");
        await leaveRoom({ auto: true, closeRoom: false, deleteParticipant: false });
      }
      return;
    }

    const data = snap.data();
    handRaised = data.handRaised === true;
    allowedToSpeak = data.allowedToSpeak === true || currentUser.role === "admin";
    const shouldMicBeOn = data.micOn === true && allowedToSpeak;

    if (micOn !== shouldMicBeOn) {
      micOn = shouldMicBeOn;
      if (lkRoom?.localParticipant) {
        try { await lkRoom.localParticipant.setMicrophoneEnabled(micOn); }
        catch { showMessage("Microphone permission Allow করুন।"); }
      }
    }
    updateMicUI(); updateHandUI(); updateRoleBadge();
  });
}

function listenParticipants(roomRef) {
  if (unsubscribeParticipants) unsubscribeParticipants();
  unsubscribeParticipants = roomRef.collection("participants").orderBy("name").onSnapshot(async (snapshot) => {
    const list = getEl("participantsList");
    const raisedList = getEl("raisedHandsList");
    const raisedCountEl = getEl("raisedHandsCount");
    await roomRef.set({ online: snapshot.size }, { merge: true });
    if (!list || !raisedList) return;
    list.innerHTML = ""; raisedList.innerHTML = "";
    let raisedCount = 0;

    snapshot.forEach((doc) => {
      const p = doc.data();
      const name = escapeHTML(p.name || "Unknown");
      const remove = currentUser?.role === "admin" && doc.id !== currentUser.id
        ? `<button type="button" onclick="removeParticipant('${doc.id}')">Remove</button>` : "";
      list.insertAdjacentHTML("beforeend", `
        <div class="participant-item" data-livekit-identity="${escapeHTML(p.livekitIdentity || "")}">
          <div><strong>${p.role === "admin" ? "👑" : "👤"} ${name}</strong>
          <span>Mic: ${p.micOn ? "ON 🎙️" : "Muted 🔇"} | Hand: ${p.handRaised ? "Raised ✋" : "Down"}</span></div>
          ${remove}
        </div>`);

      if (p.handRaised) {
        raisedCount++;
        const allow = currentUser?.role === "admin"
          ? `<button type="button" onclick="allowSpeakerById('${doc.id}')">🎤 Allow Speak</button>` : "";
        raisedList.insertAdjacentHTML("beforeend", `
          <div class="participant-item"><div><strong>✋ ${name}</strong><span>Wants to speak</span></div>${allow}</div>`);
      }
    });

    if (snapshot.empty) list.textContent = "No participants yet";
    if (!raisedCount) raisedList.textContent = "No raised hands";
    if (raisedCountEl) raisedCountEl.textContent = String(raisedCount);
    updateUserStatus(snapshot.size);
  });
}

function listenMessages(roomRef) {
  if (unsubscribeMessages) unsubscribeMessages();
  unsubscribeMessages = roomRef.collection("messages").orderBy("createdAt", "asc").limitToLast(100)
    .onSnapshot((snapshot) => {
      const list = getEl("messagesList");
      if (!list) return;
      list.innerHTML = "";
      if (snapshot.empty) return void (list.textContent = "No messages yet");
      snapshot.forEach((doc) => {
        const msg = doc.data();
        list.insertAdjacentHTML("beforeend", `
          <div class="message ${msg.role === "admin" ? "admin" : "member"}">
            <strong>${msg.role === "admin" ? "👑" : "👤"} ${escapeHTML(msg.name || "Member")}</strong>
            <div>${escapeHTML(msg.text || "")}</div>
          </div>`);
      });
      list.scrollTop = list.scrollHeight;
    }, () => showMessage("Messaging permission error. Firestore Rules check করুন।"));
}

async function sendMessage() {
  if (!currentUser) return showMessage("আগে Join করুন।");
  const input = getEl("messageInput");
  const text = input?.value.trim();
  if (!text) return;
  await db.collection("rooms").doc(currentUser.roomId).collection("messages").add({
    name: currentUser.name, role: currentUser.role, text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(), dateKey: getIndiaDateKey()
  });
  input.value = "";
}

async function sendAnnouncement() {
  if (!isAdmin()) return;
  const input = getEl("announcementInput");
  const text = input?.value.trim();
  if (!text) return showMessage("Announcement লিখুন।");
  await db.collection("rooms").doc(currentUser.roomId).set({
    announcement: { text, author: currentUser.name, createdAt: new Date().toISOString() }
  }, { merge: true });
  input.value = "";
  showMessage("Announcement সবার কাছে পাঠানো হয়েছে 📢");
}

async function raiseHand() {
  if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");
  handRaised = !handRaised;
  await db.collection("rooms").doc(currentUser.roomId).collection("participants").doc(currentUser.id).update({ handRaised });
  updateHandUI();
}

async function toggleMic() {
  if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");
  if (!allowedToSpeak) return showMessage("Admin অনুমতি না দিলে Mic চালু হবে না।");
  const next = !micOn;
  if (lkRoom?.localParticipant) await lkRoom.localParticipant.setMicrophoneEnabled(next);
  micOn = next;
  await db.collection("rooms").doc(currentUser.roomId).collection("participants").doc(currentUser.id).update({ micOn });
  updateMicUI();
}

async function muteAll() {
  if (!isAdmin()) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();
  snapshot.forEach((doc) => {
    const isAdmin = doc.id === currentUser.id;
    batch.update(doc.ref, { micOn: isAdmin, allowedToSpeak: isAdmin, handRaised: false });
  });
  await batch.commit();
}

async function allowSpeakerById(participantId) {
  if (!isAdmin()) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();
  snapshot.forEach((doc) => {
    const selected = doc.id === participantId;
    const admin = doc.id === currentUser.id;
    batch.update(doc.ref, { micOn: selected || admin, allowedToSpeak: selected || admin, handRaised: false });
  });
  await batch.commit();
}

function allowSpeaker() {
  showMessage("Raised Hands তালিকা থেকে Allow Speak চাপুন।");
}

async function lockRoom() {
  if (!isAdmin()) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snap = await roomRef.get();
  roomLocked = !(snap.data()?.locked === true);
  await roomRef.set({ locked: roomLocked }, { merge: true });
  updateLockUI();
}

async function removeParticipant(participantId) {
  if (!isAdmin() || participantId === currentUser.id) return;
  await db.collection("rooms").doc(currentUser.roomId).collection("participants").doc(participantId).delete();
}

async function cleanOldEntries() {
  if (!isAdmin()) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();
  snapshot.forEach((doc) => { if (doc.id !== currentUser.id) batch.delete(doc.ref); });
  await batch.commit();
}

async function endMeeting() {
  if (!isAdmin()) return;
  if (!confirm("Meeting শেষ করলে সবাই Room থেকে বের হয়ে যাবে। নিশ্চিত?")) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  await roomRef.set({
    roomActive: false, locked: true, online: 0, announcement: null,
    endedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  await deleteCollection(roomRef.collection("participants").orderBy(firebase.firestore.FieldPath.documentId()));
  await leaveRoom({ auto: true, closeRoom: false, deleteParticipant: false });
}

async function leaveRoom(options = {}) {
  const { auto = false, closeRoom = true, deleteParticipant = true } = options;
  if (!currentUser) return;
  const leavingUser = { ...currentUser };
  const roomRef = db.collection("rooms").doc(leavingUser.roomId);
  roomClosing = true;

  if (deleteParticipant) await roomRef.collection("participants").doc(leavingUser.id).delete().catch(() => {});
  if (leavingUser.role === "admin" && closeRoom) {
    await roomRef.set({ roomActive: false, locked: true, online: 0, endedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    const snap = await roomRef.collection("participants").get();
    const batch = db.batch();
    snap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  if (lkRoom) { lkRoom.disconnect(); lkRoom = null; }
  document.querySelectorAll("audio[data-livekit-audio='true']").forEach((el) => el.remove());
  stopListeners(); stopMeetingTimer();
  currentUser = null; micOn = false; handRaised = false; allowedToSpeak = false; roomLocked = false; roomClosing = false;
  getEl("roomPanel")?.classList.add("hidden");
  getEl("adminPanel")?.classList.add("hidden");
  getEl("joinSection")?.classList.remove("hidden");
  getEl("availableRooms")?.classList.remove("hidden");
  updateMicUI(); updateHandUI();
  if (!auto) showMessage("Room থেকে বেরিয়ে গেছেন।");
}

function isAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    showMessage("এই control শুধুমাত্র Admin-এর জন্য।");
    return false;
  }
  return true;
}

window.addEventListener("pagehide", () => { if (lkRoom) lkRoom.disconnect(); });

Object.assign(window, {
  joinRoom, sendMessage, sendAnnouncement, raiseHand, toggleMic, muteAll,
  allowSpeaker, allowSpeakerById, lockRoom, removeParticipant,
  cleanOldEntries, endMeeting, leaveRoom
});
Library
/
mahima_script_repaired_code_only.txt


const firebaseConfig = {
  apiKey: "AIzaSyClk4lBtDAUP5s1OTXhMlAFD8gvMUOXRt4",
  authDomain: "mahima-ministry-48485.firebaseapp.com",
  projectId: "mahima-ministry-48485",
  storageBucket: "mahima-ministry-48485.firebasestorage.app",
  messagingSenderId: "679867569021",
  appId: "1:679867569021:web:357b244a6da94e0cad3214"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const TOKEN_SERVER_URL = "https://mahima-audio-server.onrender.com/get-token";
const LIVEKIT_URL = "wss://mahima-ministry-connect-k9runwnt.livekit.cloud";
const ADMIN_SECRET_KEY = "MCT2026@Prayer";

const roomIds = {
  "morning-prayer": "morning-prayer-room",
  "sunday-service": "sunday-service-room",
  "bible-study": "bible-study-room",
  "prayer-request": "prayer-request-room"
};

const roomNames = {
  "morning-prayer": "Morning Prayer Room",
  "sunday-service": "Sunday Service Room",
  "bible-study": "Bible Study Room",
  "prayer-request": "Prayer Request Room"
};

let currentUser = null;
let lkRoom = null;
let micOn = false;
let handRaised = false;
let allowedToSpeak = false;
let roomLocked = false;
let roomClosing = false;
let meetingStartedAt = null;
let meetingTimerId = null;
let unsubscribeRoom = null;
let unsubscribeParticipants = null;
let unsubscribeSelf = null;
let unsubscribeMessages = null;

const getEl = (id) => document.getElementById(id);
const showMessage = (message) => alert(message);

function getIndiaDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = {};
  for (const part of parts) if (part.type !== "literal") values[part.type] = part.value;
  return `${values.year}-${values.month}-${values.day}`;
}

function slugify(value) {
  const cleaned = value.normalize("NFKD").replace(/[^\x00-\x7F]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || `user-${Date.now()}`;
}

function makeUserId(name, role) {
  return `${role}-${slugify(name)}`;
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[ch]);
}

function updateRoleBadge() {
  const badge = getEl("roleBadge");
  if (badge && currentUser) badge.textContent = currentUser.role === "admin" ? "👑 Admin" : "👤 Member";
}

function updateRoomTitle() {
  if (!currentUser) return;
  const roomName = roomNames[currentUser.roomKey] || "Prayer Room";
  if (getEl("roomTitle")) getEl("roomTitle").textContent = roomName;
  if (getEl("currentRoomName")) getEl("currentRoomName").textContent = roomName;
}

function updateMicUI() {
  const micCircle = document.querySelector(".mic-circle");
  if (micCircle) {
    micCircle.classList.toggle("muted", !micOn);
    micCircle.textContent = micOn ? "🎙️" : "🔇";
  }
  if (getEl("currentMicStatus")) getEl("currentMicStatus").textContent = micOn ? "On 🎙️" : "Muted 🔇";
}

function updateHandUI() {
  if (getEl("currentHandStatus")) getEl("currentHandStatus").textContent = handRaised ? "Raised ✋" : "Down";
}

function updateLockUI() {
  if (getEl("roomLockStatus")) getEl("roomLockStatus").textContent = roomLocked ? "Locked" : "Unlocked";
}

function updateUserStatus(online = 0) {
  if (getEl("onlineCount")) getEl("onlineCount").textContent = String(online);
  if (!currentUser || !getEl("userStatus")) return;
  getEl("userStatus").textContent = `${currentUser.name} joined as ${currentUser.role}. Mic: ${micOn ? "ON" : "Muted"}. Hand: ${handRaised ? "Raised" : "Down"}. Online: ${online}. ${roomLocked ? "Room Locked" : "Room Open"}.`;
}

function stopListeners() {
  [unsubscribeRoom, unsubscribeParticipants, unsubscribeSelf, unsubscribeMessages].forEach((fn) => {
    if (typeof fn === "function") fn();
  });
  unsubscribeRoom = unsubscribeParticipants = unsubscribeSelf = unsubscribeMessages = null;
}

function stopMeetingTimer() {
  if (meetingTimerId) clearInterval(meetingTimerId);
  meetingTimerId = null;
}

function startMeetingTimer(value) {
  stopMeetingTimer();
  if (!value) return;
  meetingStartedAt = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  const render = () => {
    const timer = getEl("meetingTimer");
    if (!timer || !meetingStartedAt) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - meetingStartedAt.getTime()) / 1000));
    const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const s = String(elapsed % 60).padStart(2, "0");
    timer.textContent = `${h}:${m}:${s}`;
  };
  render();
  meetingTimerId = setInterval(render, 1000);
}

async function deleteCollection(query, limit = 400) {
  while (true) {
    const snapshot = await query.limit(limit).get();
    if (snapshot.empty) break;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    if (snapshot.size < limit) break;
  }
}

async function resetRoomForNewDay(roomRef) {
  await Promise.all([
    deleteCollection(roomRef.collection("participants").orderBy(firebase.firestore.FieldPath.documentId())),
    deleteCollection(roomRef.collection("messages").orderBy(firebase.firestore.FieldPath.documentId()))
  ]);
  await roomRef.set({
    online: 0,
    locked: false,
    roomActive: false,
    announcement: null,
    lastResetDate: getIndiaDateKey(),
    resetAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function ensureDailyReset(roomRef) {
  const snap = await roomRef.get();
  if ((snap.data() || {}).lastResetDate !== getIndiaDateKey()) await resetRoomForNewDay(roomRef);
}

async function joinRoom() {
  try {
    if (currentUser) return showMessage("আপনি ইতিমধ্যে একটি room-এ আছেন।");
    const name = getEl("nameInput")?.value.trim();
    const role = getEl("roleInput")?.value;
    const roomKey = getEl("roomInput")?.value;
    const adminKey = getEl("adminKeyInput")?.value.trim() || "";
    if (!name) return showMessage("দয়া করে আপনার নাম লিখুন।");
    if (!roomIds[roomKey]) return showMessage("সঠিক Prayer Room নির্বাচন করুন।");
    if (role === "admin" && adminKey !== ADMIN_SECRET_KEY) return showMessage("Invalid Admin Key ❌");

    const roomId = roomIds[roomKey];
    const roomRef = db.collection("rooms").doc(roomId);
    await roomRef.set({ name: roomNames[roomKey] }, { merge: true });
    await ensureDailyReset(roomRef);

    let data = (await roomRef.get()).data() || {};
    roomLocked = data.locked === true;
    if (role !== "admin") {
      if (data.roomActive !== true) return showMessage("Admin এখনও এই Prayer Room শুরু করেননি।");
      if (roomLocked) return showMessage("Room locked আছে। Admin unlock করলে Join করা যাবে।");
    }

    if (role === "admin") {
      await roomRef.set({
        name: roomNames[roomKey], roomActive: true, locked: false,
        lastResetDate: getIndiaDateKey(),
        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
        endedAt: null
      }, { merge: true });
      roomLocked = false;
    }

    micOn = role === "admin";
    allowedToSpeak = role === "admin";
    handRaised = false;
    roomClosing = false;

    currentUser = {
      id: makeUserId(name, role),
      name,
      role,
      roomKey,
      roomId,
      livekitIdentity: `${slugify(name)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      micOn,
      handRaised,
      allowedToSpeak,
      online: true,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    };

    await roomRef.collection("participants").doc(currentUser.id).set(currentUser, { merge: true });

    getEl("roomPanel")?.classList.remove("hidden");
    getEl("joinSection")?.classList.add("hidden");
    getEl("availableRooms")?.classList.add("hidden");
    getEl("adminPanel")?.classList.toggle("hidden", role !== "admin");

    updateRoomTitle(); updateRoleBadge(); updateMicUI(); updateHandUI(); updateLockUI(); updateUserStatus(1);
    listenRoom(roomRef); listenParticipants(roomRef); listenSelf(roomRef); listenMessages(roomRef);
    await connectLiveKit(roomId, currentUser.livekitIdentity, role);
  } catch (error) {
    console.error("Join error:", error);

    if (currentUser) {
      const failedUser = { ...currentUser };
      await db.collection("rooms")
        .doc(failedUser.roomId)
        .collection("participants")
        .doc(failedUser.id)
        .delete()
        .catch(() => {});
    }

    if (lkRoom) {
      lkRoom.disconnect();
      lkRoom = null;
    }

    stopListeners();
    stopMeetingTimer();

    currentUser = null;
    micOn = false;
    handRaised = false;
    allowedToSpeak = false;
    roomLocked = false;
    roomClosing = false;

    getEl("roomPanel")?.classList.add("hidden");
    getEl("adminPanel")?.classList.add("hidden");
    getEl("joinSection")?.classList.remove("hidden");
    getEl("availableRooms")?.classList.remove("hidden");

    showMessage(`Join error: ${error.message}`);
  }
}

async function connectLiveKit(roomName, participantIdentity, role) {
  try {
    if (!window.LivekitClient) throw new Error("LiveKit Client load হয়নি।");
    const response = await fetch(TOKEN_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, participantName: participantIdentity, role })
    });
    const payload = await response.json();
    if (!response.ok || !payload.token) throw new Error(payload.details || payload.error || "Token পাওয়া যায়নি।");

    const { Room, RoomEvent, Track } = window.LivekitClient;
    lkRoom = new Room({ adaptiveStream: true, dynacast: true });

    lkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio || track.kind === "audio") {
        const el = track.attach();
        el.autoplay = true; el.playsInline = true; el.dataset.livekitAudio = "true"; el.style.display = "none";
        document.body.appendChild(el);
        el.play().catch(() => {});
      }
    });

    lkRoom.on(RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((el) => el.remove()));
    lkRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const identities = new Set(speakers.map((p) => p.identity));
      document.querySelectorAll(".participant-item[data-livekit-identity]").forEach((el) => {
        el.classList.toggle("speaking", identities.has(el.dataset.livekitIdentity));
      });
    });

    await lkRoom.connect(LIVEKIT_URL, payload.token);
    await lkRoom.startAudio().catch(() => {});
    await lkRoom.localParticipant.setMicrophoneEnabled(micOn);

    await db.collection("rooms").doc(roomName).collection("participants").doc(currentUser.id).update({
      micOn, allowedToSpeak, livekitIdentity: payload.identity || participantIdentity
    });

    updateMicUI();
    showMessage("Audio room connected ✅");
  } catch (error) {
    console.error("Audio connect error:", error);
    showMessage(`Audio connect error: ${error.message}`);
  }
}

function listenRoom(roomRef) {
  if (unsubscribeRoom) unsubscribeRoom();
  unsubscribeRoom = roomRef.onSnapshot(async (snap) => {
    if (!snap.exists || !currentUser) return;
    const data = snap.data();
    roomLocked = data.locked === true;
    updateLockUI(); updateUserStatus(data.online || 0);

    if (getEl("announcementText")) getEl("announcementText").textContent = data.announcement?.text || "এখনো কোনো announcement নেই।";
    if (getEl("announcementMeta")) getEl("announcementMeta").textContent = `— ${data.announcement?.author || "Admin"}`;
    if (data.startedAt) startMeetingTimer(data.startedAt);

    if (data.roomActive === false && currentUser.role !== "admin" && !roomClosing) {
      roomClosing = true;
      showMessage("Admin room বন্ধ করেছেন। আপনি room থেকে বেরিয়ে যাচ্ছেন।");
      await leaveRoom({ auto: true, closeRoom: false });
    }
  });
}

function listenSelf(roomRef) {
  if (unsubscribeSelf) unsubscribeSelf();
  unsubscribeSelf = roomRef.collection("participants").doc(currentUser.id).onSnapshot(async (snap) => {
    if (!currentUser) return;
    if (!snap.exists) {
      if (!roomClosing) {
        roomClosing = true;
        showMessage("Admin আপনাকে room থেকে সরিয়ে দিয়েছেন।");
        await leaveRoom({ auto: true, closeRoom: false, deleteParticipant: false });
      }
      return;
    }

    const data = snap.data();
    handRaised = data.handRaised === true;
    allowedToSpeak = data.allowedToSpeak === true || currentUser.role === "admin";
    const shouldMicBeOn = data.micOn === true && allowedToSpeak;

    if (micOn !== shouldMicBeOn) {
      micOn = shouldMicBeOn;
      if (lkRoom?.localParticipant) {
        try { await lkRoom.localParticipant.setMicrophoneEnabled(micOn); }
        catch { showMessage("Microphone permission Allow করুন।"); }
      }
    }
    updateMicUI(); updateHandUI(); updateRoleBadge();
  });
}

function listenParticipants(roomRef) {
  if (unsubscribeParticipants) unsubscribeParticipants();
  unsubscribeParticipants = roomRef.collection("participants").orderBy("name").onSnapshot(async (snapshot) => {
    const list = getEl("participantsList");
    const raisedList = getEl("raisedHandsList");
    const raisedCountEl = getEl("raisedHandsCount");
    await roomRef.set({ online: snapshot.size }, { merge: true });
    if (!list || !raisedList) return;
    list.innerHTML = ""; raisedList.innerHTML = "";
    let raisedCount = 0;

    snapshot.forEach((doc) => {
      const p = doc.data();
      const name = escapeHTML(p.name || "Unknown");
      const remove = currentUser?.role === "admin" && doc.id !== currentUser.id
        ? `<button type="button" onclick="removeParticipant('${doc.id}')">Remove</button>` : "";
      list.insertAdjacentHTML("beforeend", `
        <div class="participant-item" data-livekit-identity="${escapeHTML(p.livekitIdentity || "")}">
          <div><strong>${p.role === "admin" ? "👑" : "👤"} ${name}</strong>
          <span>Mic: ${p.micOn ? "ON 🎙️" : "Muted 🔇"} | Hand: ${p.handRaised ? "Raised ✋" : "Down"}</span></div>
          ${remove}
        </div>`);

      if (p.handRaised) {
        raisedCount++;
        const allow = currentUser?.role === "admin"
          ? `<button type="button" onclick="allowSpeakerById('${doc.id}')">🎤 Allow Speak</button>` : "";
        raisedList.insertAdjacentHTML("beforeend", `
          <div class="participant-item"><div><strong>✋ ${name}</strong><span>Wants to speak</span></div>${allow}</div>`);
      }
    });

    if (snapshot.empty) list.textContent = "No participants yet";
    if (!raisedCount) raisedList.textContent = "No raised hands";
    if (raisedCountEl) raisedCountEl.textContent = String(raisedCount);
    updateUserStatus(snapshot.size);
  });
}

function listenMessages(roomRef) {
  if (unsubscribeMessages) unsubscribeMessages();
  unsubscribeMessages = roomRef.collection("messages").orderBy("createdAt", "asc").limitToLast(100)
    .onSnapshot((snapshot) => {
      const list = getEl("messagesList");
      if (!list) return;
      list.innerHTML = "";
      if (snapshot.empty) return void (list.textContent = "No messages yet");
      snapshot.forEach((doc) => {
        const msg = doc.data();
        list.insertAdjacentHTML("beforeend", `
          <div class="message ${msg.role === "admin" ? "admin" : "member"}">
            <strong>${msg.role === "admin" ? "👑" : "👤"} ${escapeHTML(msg.name || "Member")}</strong>
            <div>${escapeHTML(msg.text || "")}</div>
          </div>`);
      });
      list.scrollTop = list.scrollHeight;
    }, () => showMessage("Messaging permission error. Firestore Rules check করুন।"));
}

async function sendMessage() {
  if (!currentUser) return showMessage("আগে Join করুন।");
  const input = getEl("messageInput");
  const text = input?.value.trim();
  if (!text) return;
  await db.collection("rooms").doc(currentUser.roomId).collection("messages").add({
    name: currentUser.name, role: currentUser.role, text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(), dateKey: getIndiaDateKey()
  });
  input.value = "";
}

async function sendAnnouncement() {
  if (!isAdmin()) return;
  const input = getEl("announcementInput");
  const text = input?.value.trim();
  if (!text) return showMessage("Announcement লিখুন।");
  await db.collection("rooms").doc(currentUser.roomId).set({
    announcement: { text, author: currentUser.name, createdAt: new Date().toISOString() }
  }, { merge: true });
  input.value = "";
  showMessage("Announcement সবার কাছে পাঠানো হয়েছে 📢");
}

async function raiseHand() {
  if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");
  handRaised = !handRaised;
  await db.collection("rooms").doc(currentUser.roomId).collection("participants").doc(currentUser.id).update({ handRaised });
  updateHandUI();
}

async function toggleMic() {
  if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");
  if (!allowedToSpeak) return showMessage("Admin অনুমতি না দিলে Mic চালু হবে না।");
  const next = !micOn;
  if (lkRoom?.localParticipant) await lkRoom.localParticipant.setMicrophoneEnabled(next);
  micOn = next;
  await db.collection("rooms").doc(currentUser.roomId).collection("participants").doc(currentUser.id).update({ micOn });
  updateMicUI();
}

async function muteAll() {
  if (!isAdmin()) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();
  snapshot.forEach((doc) => {
    const isAdmin = doc.id === currentUser.id;
    batch.update(doc.ref, { micOn: isAdmin, allowedToSpeak: isAdmin, handRaised: false });
  });
  await batch.commit();
}

async function allowSpeakerById(participantId) {
  if (!isAdmin()) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();
  snapshot.forEach((doc) => {
    const selected = doc.id === participantId;
    const admin = doc.id === currentUser.id;
    batch.update(doc.ref, { micOn: selected || admin, allowedToSpeak: selected || admin, handRaised: false });
  });
  await batch.commit();
}

function allowSpeaker() {
  showMessage("Raised Hands তালিকা থেকে Allow Speak চাপুন।");
}

async function lockRoom() {
  if (!isAdmin()) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snap = await roomRef.get();
  roomLocked = !(snap.data()?.locked === true);
  await roomRef.set({ locked: roomLocked }, { merge: true });
  updateLockUI();
}

async function removeParticipant(participantId) {
  if (!isAdmin() || participantId === currentUser.id) return;
  await db.collection("rooms").doc(currentUser.roomId).collection("participants").doc(participantId).delete();
}

async function cleanOldEntries() {
  if (!isAdmin()) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();
  snapshot.forEach((doc) => { if (doc.id !== currentUser.id) batch.delete(doc.ref); });
  await batch.commit();
}

async function endMeeting() {
  if (!isAdmin()) return;
  if (!confirm("Meeting শেষ করলে সবাই Room থেকে বের হয়ে যাবে। নিশ্চিত?")) return;
  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  await roomRef.set({
    roomActive: false, locked: true, online: 0, announcement: null,
    endedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  await deleteCollection(roomRef.collection("participants").orderBy(firebase.firestore.FieldPath.documentId()));
  await leaveRoom({ auto: true, closeRoom: false, deleteParticipant: false });
}

async function leaveRoom(options = {}) {
  const { auto = false, closeRoom = true, deleteParticipant = true } = options;
  if (!currentUser) return;
  const leavingUser = { ...currentUser };
  const roomRef = db.collection("rooms").doc(leavingUser.roomId);
  roomClosing = true;

  if (deleteParticipant) await roomRef.collection("participants").doc(leavingUser.id).delete().catch(() => {});
  if (leavingUser.role === "admin" && closeRoom) {
    await roomRef.set({ roomActive: false, locked: true, online: 0, endedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    const snap = await roomRef.collection("participants").get();
    const batch = db.batch();
    snap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  if (lkRoom) { lkRoom.disconnect(); lkRoom = null; }
  document.querySelectorAll("audio[data-livekit-audio='true']").forEach((el) => el.remove());
  stopListeners(); stopMeetingTimer();
  currentUser = null; micOn = false; handRaised = false; allowedToSpeak = false; roomLocked = false; roomClosing = false;
  getEl("roomPanel")?.classList.add("hidden");
  getEl("adminPanel")?.classList.add("hidden");
  getEl("joinSection")?.classList.remove("hidden");
  getEl("availableRooms")?.classList.remove("hidden");
  updateMicUI(); updateHandUI();
  if (!auto) showMessage("Room থেকে বেরিয়ে গেছেন।");
}

function isAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    showMessage("এই control শুধুমাত্র Admin-এর জন্য।");
    return false;
  }
  return true;
}

window.addEventListener("pagehide", () => { if (lkRoom) lkRoom.disconnect(); });

Object.assign(window, {
  joinRoom, sendMessage, sendAnnouncement, raiseHand, toggleMic, muteAll,
  allowSpeaker, allowSpeakerById, lockRoom, removeParticipant,
  cleanOldEntries, endMeeting, leaveRoom
});
