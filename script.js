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

let unsubscribeRoom = null;
let unsubscribeParticipants = null;
let unsubscribeSelf = null;

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

function makeUserId(name, role) {
  return `${role}-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
}

async function joinRoom() {
  try {
    const name = document.getElementById("nameInput").value.trim();
    const role = document.getElementById("roleInput").value;
    const roomKey = document.getElementById("roomInput").value;
    const adminKey = document.getElementById("adminKeyInput")?.value.trim();

    if (!name) {
      alert("দয়া করে আপনার নাম লিখুন");
      return;
    }

    if (role === "admin" && adminKey !== ADMIN_SECRET_KEY) {
      alert("Invalid Admin Key ❌");
      return;
    }

    const roomId = roomIds[roomKey];
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnap = await roomRef.get();

    if (roomSnap.exists && roomSnap.data().locked && role !== "admin") {
      alert("Room locked আছে। Admin unlock করলে join করা যাবে।");
      return;
    }

    if (!roomSnap.exists) {
      await roomRef.set({
        name: roomNames[roomKey],
        online: 0,
        locked: false
      });
    }

    allowedToSpeak = role === "admin";
    micOn = role === "admin";
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
      joinedAt: new Date().toISOString()
    };

    await roomRef.collection("participants").doc(currentUser.id).set(currentUser, { merge: true });

    document.getElementById("roomPanel").classList.remove("hidden");
    document.getElementById("roomTitle").innerText = roomNames[roomKey];
    document.getElementById("roleBadge").innerText = role === "admin" ? "👑 Admin" : "👤 Member";
    document.getElementById("adminPanel").classList.toggle("hidden", role !== "admin");

    listenRoom(roomRef);
    listenParticipants(roomRef);
    listenSelf(roomRef);

    await connectLiveKit(roomId, name, role);
    updateMicUI();

  } catch (error) {
    console.error("Join error:", error);
    alert("Join error: " + error.message);
  }
}

async function connectLiveKit(roomName, participantName, role) {
  try {
    if (!window.LivekitClient) {
      throw new Error("LiveKit client not loaded. index.html script tag check করুন।");
    }

    const res = await fetch(TOKEN_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        roomName,
        participantName,
        role
      })
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      throw new Error(data.error || data.details || "Token not received");
    }

    const RoomClass = window.LivekitClient.Room;
    const RoomEvent = window.LivekitClient.RoomEvent;

    lkRoom = new RoomClass({
      adaptiveStream: true,
      dynacast: true
    });

    lkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === "audio") {
        const audioEl = track.attach();
        audioEl.autoplay = true;
        audioEl.playsInline = true;
        audioEl.style.display = "none";
        document.body.appendChild(audioEl);
      }
    });

    lkRoom.on(RoomEvent.Disconnected, () => {
      console.log("LiveKit disconnected");
    });

    await lkRoom.connect(LIVEKIT_URL, data.token);

    if (role === "admin") {
      micOn = true;
      await lkRoom.localParticipant.setMicrophoneEnabled(true);
    } else {
      micOn = false;
      await lkRoom.localParticipant.setMicrophoneEnabled(false);
    }

    await db.collection("rooms")
      .doc(roomName)
      .collection("participants")
      .doc(currentUser.id)
      .update({ micOn });

    updateMicUI();
    alert("Audio room connected ✅");

  } catch (err) {
    console.error("Audio connect error:", err);
    alert("Audio connect error: " + err.message);
  }
}

function listenRoom(roomRef) {
  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = roomRef.onSnapshot((doc) => {
    if (!doc.exists || !currentUser) return;

    const data = doc.data();

    const status = document.getElementById("userStatus");
    if (status) {
      status.innerText =
        `${currentUser.name} joined as ${currentUser.role}. ` +
        `Mic: ${micOn ? "ON 🎙️" : "Muted 🔇"}. ` +
        `Hand: ${handRaised ? "Raised ✋" : "Down"}. ` +
        `Online: ${data.online || 0}. ` +
        `${data.locked ? "Room Locked 🔒" : "Room Open 🔓"}`;
    }
  });
}

function listenSelf(roomRef) {
  if (unsubscribeSelf) unsubscribeSelf();

  unsubscribeSelf = roomRef.collection("participants").doc(currentUser.id)
    .onSnapshot(async (doc) => {
      if (!doc.exists || !currentUser) return;

      const data = doc.data();

      allowedToSpeak = data.allowedToSpeak === true || currentUser.role === "admin";
      micOn = data.micOn === true;
      handRaised = data.handRaised === true;

      if (lkRoom && lkRoom.localParticipant) {
        try {
          await lkRoom.localParticipant.setMicrophoneEnabled(micOn);
        } catch (e) {
          console.warn("Mic update failed:", e);
        }
      }

      updateMicUI();
    });
}

function listenParticipants(roomRef) {
  if (unsubscribeParticipants) unsubscribeParticipants();

  unsubscribeParticipants = roomRef.collection("participants")
    .orderBy("name")
    .onSnapshot(async (snapshot) => {
      const participantsList = document.getElementById("participantsList");
      const raisedHandsList = document.getElementById("raisedHandsList");

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
              ${currentUser?.role === "admin" ? `<button onclick="allowSpeakerById('${doc.id}')">Allow Speak</button>` : ""}
            </div>
          `;
        }
      });

      if (snapshot.size === 0) participantsList.innerHTML = "No participants yet";
      if (raisedCount === 0) raisedHandsList.innerHTML = "No raised hands";
    });
}

async function raiseHand() {
  if (!currentUser) {
    alert("আগে Prayer Room-এ Join করুন");
    return;
  }

  handRaised = !handRaised;

  await db.collection("rooms")
    .doc(currentUser.roomId)
    .collection("participants")
    .doc(currentUser.id)
    .update({ handRaised });

  alert(handRaised ? "আপনার হাত Raise হয়েছে ✋" : "হাত নামানো হয়েছে");
}

async function toggleMic() {
  if (!currentUser) {
    alert("আগে Prayer Room-এ Join করুন");
    return;
  }

  if (!allowedToSpeak) {
    alert("Admin অনুমতি না দিলে Mic চালু হবে না");
    return;
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

function updateMicUI() {
  const micCircle = document.querySelector(".mic-circle");
  if (!micCircle) return;

  micCircle.classList.toggle("muted", !micOn);
  micCircle.innerText = micOn ? "🎙️" : "🔇";
}

async function leaveRoom() {
  if (!currentUser) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);

  await roomRef.collection("participants").doc(currentUser.id).delete();

  if (lkRoom) {
    lkRoom.disconnect();
    lkRoom = null;
  }

  if (unsubscribeRoom) unsubscribeRoom();
  if (unsubscribeParticipants) unsubscribeParticipants();
  if (unsubscribeSelf) unsubscribeSelf();

  currentUser = null;
  micOn = false;
  handRaised = false;
  allowedToSpeak = false;

  document.getElementById("roomPanel").classList.add("hidden");
  document.getElementById("adminPanel").classList.add("hidden");
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
  alert("সবাইকে mute করা হয়েছে 🔇");
}

async function allowSpeakerById(participantId) {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    batch.update(doc.ref, {
      micOn: doc.id === participantId,
      allowedToSpeak: doc.id === participantId || doc.id === currentUser.id,
      handRaised: false
    });
  });

  await batch.commit();
  alert("Speaker অনুমতি দেওয়া হয়েছে 🎤");
}

function allowSpeaker() {
  alert("Raised Hands list থেকে Allow Speak চাপুন।");
}

async function lockRoom() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snap = await roomRef.get();
  const locked = snap.data().locked || false;

  await roomRef.update({ locked: !locked });

  alert(!locked ? "Room locked হয়েছে 🔒" : "Room unlocked হয়েছে 🔓");
}

async function cleanOldEntries() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    if (doc.id !== currentUser.id) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();
  alert("Old duplicate entries পরিষ্কার হয়েছে ✅");
}

function isAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    alert("এই control শুধুমাত্র Admin-এর জন্য।");
    return false;
  }
  return true;
}
