const firebaseConfig = {
  apiKey: "AIzaSyClk4lBtDAUP5s1OTXhMlAFD8gvMUOXRt4",
  authDomain: "mahima-ministry-48485.firebaseapp.com",
  projectId: "mahima-ministry-48485",
  storageBucket: "mahima-ministry-48485.firebasestorage.app",
  messagingSenderId: "679867569021",
  appId: "1:679867569021:web:357b244a6da94e0cad3214"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const TOKEN_SERVER_URL = "https://mahima-audio-server.onrender.com/get-token";
const LIVEKIT_URL = "wss://mahima-ministry-connect-k9runwnt.livekit.cloud";
const ADMIN_SECRET_KEY = "MCT2026@Prayer";

let currentUser = null;
let lkRoom = null;
let micOn = false;
let handRaised = false;
let allowedToSpeak = false;
let roomLocked = false;

let unsubscribeRoom = null;
let unsubscribeParticipants = null;
let unsubscribeSelf = null;
let unsubscribeMessages = null;

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

function getEl(id) {
  return document.getElementById(id);
}

function makeUserId(name, role) {
  return `${role}-${name.toLowerCase().trim().replace(/[^a-z0-9]/g, "-")}`;
}

function showMessage(msg) {
  alert(msg);
}

function updateMicUI() {
  const micCircle = document.querySelector(".mic-circle");
  if (!micCircle) return;
  micCircle.classList.toggle("muted", !micOn);
  micCircle.innerText = micOn ? "🎙️" : "🔇";
}

function updateRoleBadge() {
  const badge = getEl("roleBadge");
  if (!badge || !currentUser) return;
  badge.innerText = currentUser.role === "admin" ? "👑 Admin" : "👤 Member";
}

function updateRoomTitle() {
  const title = getEl("roomTitle");
  if (title && currentUser) title.innerText = roomNames[currentUser.roomKey] || "Prayer Room";
}

function updateUserStatus(onlineCount = 0) {
  const status = getEl("userStatus");
  if (!status || !currentUser) return;

  status.innerText =
    `${currentUser.name} joined as ${currentUser.role}. ` +
    `Mic: ${micOn ? "ON 🎙️" : "Muted 🔇"}. ` +
    `Hand: ${handRaised ? "Raised ✋" : "Down"}. ` +
    `Online: ${onlineCount}. ` +
    `${roomLocked ? "Room Locked 🔒" : "Room Open 🔓"}`;
}

function stopListeners() {
  if (unsubscribeRoom) unsubscribeRoom();
  if (unsubscribeParticipants) unsubscribeParticipants();
  if (unsubscribeSelf) unsubscribeSelf();
  if (unsubscribeMessages) unsubscribeMessages();

  unsubscribeRoom = null;
  unsubscribeParticipants = null;
  unsubscribeSelf = null;
  unsubscribeMessages = null;
}

async function joinRoom() {
  try {
    const name = getEl("nameInput").value.trim();
    const role = getEl("roleInput").value;
    const roomKey = getEl("roomInput").value;
    const adminKey = getEl("adminKeyInput")?.value.trim();

    if (!name) return showMessage("দয়া করে আপনার নাম লিখুন");

    if (role === "admin" && adminKey !== ADMIN_SECRET_KEY) {
      return showMessage("Invalid Admin Key ❌");
    }

    const roomId = roomIds[roomKey];
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnap = await roomRef.get();

    if (roomSnap.exists) {
      roomLocked = roomSnap.data().locked === true;
      if (roomLocked && role !== "admin") {
        return showMessage("Room locked আছে। Admin unlock করলে join করা যাবে।");
      }
    } else {
      await roomRef.set({
        name: roomNames[roomKey],
        online: 0,
        locked: false,
        createdAt: new Date().toISOString()
      });
    }

    micOn = role === "admin";
    allowedToSpeak = role === "admin";
    handRaised = false;

    currentUser = {
      id: makeUserId(name, role),
      name,
      role,
      roomKey,
      roomId,
      micOn,
      handRaised,
      allowedToSpeak,
      online: true,
      joinedAt: new Date().toISOString()
    };

    const oldParticipants = await roomRef
      .collection("participants")
      .where("name", "==", name)
      .where("role", "==", role)
      .get();

    const cleanBatch = db.batch();
    oldParticipants.forEach((doc) => cleanBatch.delete(doc.ref));
    await cleanBatch.commit();

    await roomRef.collection("participants").doc(currentUser.id).set(currentUser, { merge: true });

    getEl("roomPanel").classList.remove("hidden");
    getEl("adminPanel").classList.toggle("hidden", role !== "admin");

    setupChatUI();
    updateRoomTitle();
    updateRoleBadge();
    updateMicUI();
    updateUserStatus();

    listenRoom(roomRef);
    listenParticipants(roomRef);
    listenSelf(roomRef);
    listenMessages(roomRef);

    await connectLiveKit(roomId, name, role);

  } catch (err) {
    console.error(err);
    showMessage("Join error: " + err.message);
  }
}

async function connectLiveKit(roomName, participantName, role) {
  try {
    if (!window.LivekitClient) {
      throw new Error("LiveKit client load হয়নি। index.html check করুন।");
    }

    const response = await fetch(TOKEN_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, participantName, role })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(data.error || data.details || "Token পাওয়া যায়নি");
    }

    const Room = window.LivekitClient.Room;
    const RoomEvent = window.LivekitClient.RoomEvent;

    lkRoom = new Room({
      adaptiveStream: true,
      dynacast: true
    });

    lkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === "audio") {
        const audioElement = track.attach();
        audioElement.autoplay = true;
        audioElement.playsInline = true;
        audioElement.style.display = "none";
        document.body.appendChild(audioElement);
      }
    });

    lkRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach().forEach((el) => el.remove());
    });

    await lkRoom.connect(LIVEKIT_URL, data.token);

    if (role === "admin") {
      micOn = true;
      allowedToSpeak = true;
    } else {
      micOn = false;
      allowedToSpeak = false;
    }

    await lkRoom.localParticipant.setMicrophoneEnabled(micOn);

    await db.collection("rooms")
      .doc(roomName)
      .collection("participants")
      .doc(currentUser.id)
      .update({ micOn, allowedToSpeak });

    updateMicUI();
    showMessage("Audio room connected ✅");

  } catch (err) {
    console.error("Audio connect error:", err);
    showMessage("Audio connect error: " + err.message);
  }
}

function listenRoom(roomRef) {
  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = roomRef.onSnapshot((doc) => {
    if (!doc.exists || !currentUser) return;
    const data = doc.data();
    roomLocked = data.locked === true;
    updateUserStatus(data.online || 0);
  });
}

function listenSelf(roomRef) {
  if (unsubscribeSelf) unsubscribeSelf();

  unsubscribeSelf = roomRef.collection("participants").doc(currentUser.id)
    .onSnapshot(async (doc) => {
      if (!doc.exists || !currentUser) return;

      const data = doc.data();

      handRaised = data.handRaised === true;
      allowedToSpeak = data.allowedToSpeak === true || currentUser.role === "admin";

      const shouldMicBeOn = data.micOn === true && allowedToSpeak;
      micOn = shouldMicBeOn;

      if (lkRoom && lkRoom.localParticipant) {
        try {
          await lkRoom.localParticipant.setMicrophoneEnabled(shouldMicBeOn);
        } catch (err) {
          console.error("Mic permission problem:", err);
          showMessage("Mic permission Allow করুন, তারপর আবার চেষ্টা করুন।");
        }
      }

      updateMicUI();
      updateRoleBadge();
    });
}

function listenParticipants(roomRef) {
  if (unsubscribeParticipants) unsubscribeParticipants();

  unsubscribeParticipants = roomRef.collection("participants")
    .orderBy("name")
    .onSnapshot(async (snapshot) => {
      const participantsList = getEl("participantsList");
      const raisedHandsList = getEl("raisedHandsList");

      await roomRef.update({ online: snapshot.size });

      if (!participantsList || !raisedHandsList) return;

      participantsList.innerHTML = "";
      raisedHandsList.innerHTML = "";

      let raisedCount = 0;

      snapshot.forEach((doc) => {
        const user = doc.data();

        participantsList.innerHTML += `
          <div class="participant-item">
            ${user.role === "admin" ? "👑" : "👤"} ${user.name}
            <span>Mic: ${user.micOn ? "ON 🎙️" : "Muted 🔇"} | Hand: ${user.handRaised ? "Raised ✋" : "Down"}</span>
          </div>
        `;

        if (user.handRaised) {
          raisedCount++;
          raisedHandsList.innerHTML += `
            <div class="participant-item">
              ✋ ${user.name}
              <span>Wants to speak</span>
              ${currentUser?.role === "admin" ? `<button onclick="allowSpeakerById('${doc.id}')">🎤 Allow Speak</button>` : ""}
            </div>
          `;
        }
      });

      if (snapshot.size === 0) participantsList.innerHTML = "No participants yet";
      if (raisedCount === 0) raisedHandsList.innerHTML = "No raised hands";

      updateUserStatus(snapshot.size);
    });
}

async function raiseHand() {
  if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন");

  handRaised = !handRaised;

  await db.collection("rooms")
    .doc(currentUser.roomId)
    .collection("participants")
    .doc(currentUser.id)
    .update({ handRaised });

  showMessage(handRaised ? "আপনার হাত Raise হয়েছে ✋" : "হাত নামানো হয়েছে");
}

async function toggleMic() {
  if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন");

  if (!allowedToSpeak) {
    return showMessage("Admin অনুমতি না দিলে Mic চালু হবে না");
  }

  micOn = !micOn;

  await db.collection("rooms")
    .doc(currentUser.roomId)
    .collection("participants")
    .doc(currentUser.id)
    .update({ micOn });

  if (lkRoom && lkRoom.localParticipant) {
    await lkRoom.localParticipant.setMicrophoneEnabled(micOn);
  }

  updateMicUI();
}

async function allowSpeakerById(participantId) {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    const isSpeaker = doc.id === participantId;
    const isAdminUser = doc.id === currentUser.id;

    batch.update(doc.ref, {
      allowedToSpeak: isSpeaker || isAdminUser,
      micOn: isSpeaker || isAdminUser,
      handRaised: false
    });
  });

  await batch.commit();
  showMessage("Speaker permission দেওয়া হয়েছে 🎤");
}

function allowSpeaker() {
  showMessage("Raised Hands list থেকে Allow Speak চাপুন।");
}

async function muteAll() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    batch.update(doc.ref, {
      micOn: false,
      allowedToSpeak: doc.id === currentUser.id
    });
  });

  await batch.commit();

  micOn = true;

  if (lkRoom && lkRoom.localParticipant) {
    await lkRoom.localParticipant.setMicrophoneEnabled(true);
  }

  updateMicUI();
  showMessage("সবাইকে mute করা হয়েছে 🔇");
}

async function lockRoom() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snap = await roomRef.get();
  const locked = snap.exists && snap.data().locked === true;

  await roomRef.update({ locked: !locked });
  roomLocked = !locked;

  showMessage(!locked ? "Room locked হয়েছে 🔒" : "Room unlocked হয়েছে 🔓");
}

async function cleanOldEntries() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    if (doc.id !== currentUser.id) batch.delete(doc.ref);
  });

  await batch.commit();
  showMessage("Old duplicate entries পরিষ্কার হয়েছে ✅");
}

async function leaveRoom() {
  if (!currentUser) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);

  try {
    await roomRef.collection("participants").doc(currentUser.id).delete();

    if (lkRoom) {
      lkRoom.disconnect();
      lkRoom = null;
    }

    stopListeners();

    currentUser = null;
    micOn = false;
    handRaised = false;
    allowedToSpeak = false;
    roomLocked = false;

    getEl("roomPanel").classList.add("hidden");
    getEl("adminPanel").classList.add("hidden");

    updateMicUI();

  } catch (err) {
    console.error(err);
    showMessage("Leave error: " + err.message);
  }
}

function isAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    showMessage("এই control শুধুমাত্র Admin-এর জন্য।");
    return false;
  }
  return true;
}

/* ===============================
   Messaging System
================================ */

function setupChatUI() {
  if (getEl("chatBox")) return;

  const roomPanel = getEl("roomPanel");

  const chatHTML = `
    <div id="chatBox" class="list-box" style="margin-top:16px;">
      <h3>💬 Live Messages</h3>
      <div id="messagesList" style="max-height:220px; overflow-y:auto; margin-bottom:12px;">No messages yet</div>
      <div style="display:flex; gap:8px;">
        <input id="messageInput" placeholder="Message লিখুন..." style="margin:0; flex:1;" />
        <button onclick="sendMessage()" style="width:90px;">Send</button>
      </div>
    </div>
  `;

  roomPanel.insertAdjacentHTML("beforeend", chatHTML);
}

function listenMessages(roomRef) {
  if (unsubscribeMessages) unsubscribeMessages();

  unsubscribeMessages = roomRef.collection("messages")
    .orderBy("createdAt")
    .limit(50)
    .onSnapshot((snapshot) => {
      const messagesList = getEl("messagesList");
      if (!messagesList) return;

      messagesList.innerHTML = "";

      if (snapshot.empty) {
        messagesList.innerHTML = "No messages yet";
        return;
      }

      snapshot.forEach((doc) => {
        const msg = doc.data();

        messagesList.innerHTML += `
          <div class="participant-item">
            ${msg.role === "admin" ? "👑" : "👤"} <b>${msg.name}</b>
            <span>${msg.text}</span>
          </div>
        `;
      });

      messagesList.scrollTop = messagesList.scrollHeight;
    });
}

async function sendMessage() {
  if (!currentUser) return showMessage("আগে Join করুন");

  const input = getEl("messageInput");
  const text = input.value.trim();

  if (!text) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);

  await roomRef.collection("messages").add({
    name: currentUser.name,
    role: currentUser.role,
    text,
    createdAt: new Date().toISOString()
  });

  input.value = "";
}

window.addEventListener("beforeunload", async () => {
  try {
    if (!currentUser) return;

    await db.collection("rooms")
      .doc(currentUser.roomId)
      .collection("participants")
      .doc(currentUser.id)
      .delete();

    if (lkRoom) lkRoom.disconnect();
  } catch (err) {
    console.warn("Cleanup failed:", err);
  }
});

window.joinRoom = joinRoom;
window.raiseHand = raiseHand;
window.toggleMic = toggleMic;
window.leaveRoom = leaveRoom;
window.muteAll = muteAll;
window.allowSpeaker = allowSpeaker;
window.allowSpeakerById = allowSpeakerById;
window.lockRoom = lockRoom;
window.cleanOldEntries = cleanOldEntries;
window.sendMessage = sendMessage;
