/* ===============================
   Mahima Ministry Connect V2
   Part 1/4
   Firebase + Global Config
================================ */

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

function showMessage(message) {
  alert(message);
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

  if (currentUser.role === "admin") {
    badge.innerText = "👑 Admin";
  } else {
    badge.innerText = "👤 Member";
  }
}

function updateRoomTitle() {
  if (!currentUser) return;

  const title = getEl("roomTitle");
  if (title) {
    title.innerText = roomNames[currentUser.roomKey] || "Prayer Room";
  }
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

  unsubscribeRoom = null;
  unsubscribeParticipants = null;
  unsubscribeSelf = null;
}
/* ===============================
   Mahima Ministry Connect V2
   Part 2/4
   Join Room + Firebase Sync
================================ */

async function joinRoom() {
  try {
    const name = getEl("nameInput").value.trim();
    const role = getEl("roleInput").value;
    const roomKey = getEl("roomInput").value;
    const adminKey = getEl("adminKeyInput")?.value.trim();

    if (!name) {
      showMessage("দয়া করে আপনার নাম লিখুন");
      return;
    }

    if (role === "admin" && adminKey !== ADMIN_SECRET_KEY) {
      showMessage("Invalid Admin Key ❌");
      return;
    }

    const roomId = roomIds[roomKey];
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnap = await roomRef.get();

    if (roomSnap.exists) {
      roomLocked = roomSnap.data().locked === true;

      if (roomLocked && role !== "admin") {
        showMessage("Room locked আছে। Admin unlock করলে join করা যাবে।");
        return;
      }
    } else {
      await roomRef.set({
        name: roomNames[roomKey],
        online: 0,
        locked: false,
        createdAt: new Date().toISOString()
      });
      roomLocked = false;
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

    await roomRef
      .collection("participants")
      .doc(currentUser.id)
      .set(currentUser, { merge: true });

    getEl("roomPanel").classList.remove("hidden");
    getEl("adminPanel").classList.toggle("hidden", role !== "admin");

    updateRoomTitle();
    updateRoleBadge();
    updateMicUI();
    updateUserStatus();

    listenRoom(roomRef);
    listenSelf(roomRef);
    listenParticipants(roomRef);

    await connectLiveKit(roomId, name, role);

  } catch (error) {
    console.error("Join room error:", error);
    showMessage("Join error: " + error.message);
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

  unsubscribeSelf = roomRef
    .collection("participants")
    .doc(currentUser.id)
    .onSnapshot(async (doc) => {
      if (!doc.exists || !currentUser) return;

      const data = doc.data();

      micOn = data.micOn === true;
      handRaised = data.handRaised === true;
      allowedToSpeak = data.allowedToSpeak === true || currentUser.role === "admin";

      if (lkRoom && lkRoom.localParticipant) {
        try {
          await lkRoom.localParticipant.setMicrophoneEnabled(micOn);
        } catch (error) {
          console.warn("Mic sync failed:", error);
        }
      }

      updateMicUI();
      updateRoleBadge();
    });
}

function listenParticipants(roomRef) {
  if (unsubscribeParticipants) unsubscribeParticipants();

  unsubscribeParticipants = roomRef
    .collection("participants")
    .orderBy("name")
    .onSnapshot(async (snapshot) => {
      const participantsList = getEl("participantsList");
      const raisedHandsList = getEl("raisedHandsList");

      await roomRef.update({
        online: snapshot.size
      });

      if (!participantsList || !raisedHandsList) return;

      participantsList.innerHTML = "";
      raisedHandsList.innerHTML = "";

      let raisedCount = 0;

      snapshot.forEach((doc) => {
        const user = doc.data();

        participantsList.innerHTML += `
          <div class="participant-item">
            ${user.role === "admin" ? "👑" : "👤"} ${user.name}
            <span>
              Mic: ${user.micOn ? "ON 🎙️" : "Muted 🔇"} |
              Hand: ${user.handRaised ? "Raised ✋" : "Down"}
            </span>
          </div>
        `;

        if (user.handRaised) {
          raisedCount++;

          raisedHandsList.innerHTML += `
            <div class="participant-item">
              ✋ ${user.name}
              <span>Wants to speak</span>
              ${
                currentUser?.role === "admin"
                  ? `<button onclick="allowSpeakerById('${doc.id}')">🎤 Allow Speak</button>`
                  : ""
              }
            </div>
          `;
        }
      });

      if (snapshot.size === 0) {
        participantsList.innerHTML = "No participants yet";
      }

      if (raisedCount === 0) {
        raisedHandsList.innerHTML = "No raised hands";
      }

      updateUserStatus(snapshot.size);
    });
}
/* ===============================
   Mahima Ministry Connect V2
   Part 3/4
   LiveKit Audio Connection
================================ */

async function connectLiveKit(roomName, participantName, role) {
  try {
    if (!window.LivekitClient) {
      throw new Error("LiveKit client load হয়নি। index.html-এ LiveKit script আছে কিনা দেখুন।");
    }

    const response = await fetch(TOKEN_SERVER_URL, {
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
      track.detach().forEach((element) => element.remove());
    });

    lkRoom.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log("Participant connected:", participant.identity);
    });

    lkRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log("Participant disconnected:", participant.identity);
    });

    lkRoom.on(RoomEvent.Disconnected, () => {
      console.log("LiveKit room disconnected");
    });

    await lkRoom.connect(LIVEKIT_URL, data.token);

    if (role === "admin") {
      micOn = true;
      allowedToSpeak = true;
      await lkRoom.localParticipant.setMicrophoneEnabled(true);
    } else {
      micOn = false;
      allowedToSpeak = false;
      await lkRoom.localParticipant.setMicrophoneEnabled(false);
    }

    await db.collection("rooms")
      .doc(roomName)
      .collection("participants")
      .doc(currentUser.id)
      .update({
        micOn,
        allowedToSpeak
      });

    updateMicUI();
    showMessage("Audio room connected ✅");

  } catch (error) {
    console.error("Audio connect error:", error);
    showMessage("Audio connect error: " + error.message);
  }
}

async function setLocalMic(enabled) {
  try {
    if (!lkRoom || !lkRoom.localParticipant) return;

    await lkRoom.localParticipant.setMicrophoneEnabled(enabled);
  } catch (error) {
    console.warn("setLocalMic error:", error);
  }
}

async function toggleMic() {
  if (!currentUser) {
    showMessage("আগে Prayer Room-এ Join করুন");
    return;
  }

  if (!allowedToSpeak) {
    showMessage("Admin অনুমতি না দিলে Mic চালু হবে না");
    return;
  }

  micOn = !micOn;

  await db.collection("rooms")
    .doc(currentUser.roomId)
    .collection("participants")
    .doc(currentUser.id)
    .update({
      micOn
    });

  await setLocalMic(micOn);
  updateMicUI();
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
    showMessage("Room থেকে বেরিয়ে গেছেন");

  } catch (error) {
    console.error("Leave error:", error);
    showMessage("Leave error: " + error.message);
  }
}
