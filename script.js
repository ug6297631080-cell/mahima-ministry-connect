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
