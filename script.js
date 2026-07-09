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
