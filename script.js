/* Mahima Ministry Connect - Final Clean Script */

const firebaseConfig = {
  apiKey: "AIzaSyClk4lBtDAUP5s1OTXhMlAFD8gvMUOXRt4",
  authDomain: "mahima-ministry-48485.firebaseapp.com",
  projectId: "mahima-ministry-48485",
  storageBucket: "mahima-ministry-48485.firebasestorage.app",
  messagingSenderId: "679867569021",
  appId: "1:679867569021:web:357b244a6da94e0cad3214"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

const TOKEN_SERVER_URL =
  "https://mahima-audio-server.onrender.com/get-token";

const LIVEKIT_URL =
  "wss://mahima-ministry-connect-k9runwnt.livekit.cloud";

const ADMIN_SECRET_KEY =
  "MCT2026@Prayer";

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

const getEl = (id) =>
  document.getElementById(id);

const showMessage = (message) =>
  window.alert(message);

function getIndiaDateKey() {
  const parts =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] =
        part.value;
    }
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function slugify(value) {
  const result =
    String(value)
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return (
    result ||
    `user-${Date.now()}`
  );
}

function makeUserId(name, role) {
  return `${role}-${slugify(name)}`;
}

function escapeHTML(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };

  return String(text).replace(
    /[&<>"']/g,
    (char) => map[char]
  );
}

function isAdmin() {
  if (
    !currentUser ||
    currentUser.role !== "admin"
  ) {
    showMessage(
      "এই control শুধুমাত্র Admin-এর জন্য।"
    );

    return false;
  }

  return true;
}

function updateRoleBadge() {
  const badge =
    getEl("roleBadge");

  if (
    badge &&
    currentUser
  ) {
    badge.textContent =
      currentUser.role === "admin"
        ? "👑 Admin"
        : "👤 Member";
  }
}

function updateRoomTitle() {
  if (!currentUser) {
    return;
  }

  const roomName =
    roomNames[currentUser.roomKey] ||
    "Prayer Room";

  const title =
    getEl("roomTitle");

  const currentRoomName =
    getEl("currentRoomName");

  if (title) {
    title.textContent =
      roomName;
  }

  if (currentRoomName) {
    currentRoomName.textContent =
      roomName;
  }
}

function updateMicUI() {
  const micCircle =
    document.querySelector(
      ".mic-circle"
    );

  const status =
    getEl("currentMicStatus");

  if (micCircle) {
    micCircle.classList.toggle(
      "muted",
      !micOn
    );

    micCircle.textContent =
      micOn ? "🎙️" : "🔇";
  }

  if (status) {
    status.textContent =
      micOn
        ? "On 🎙️"
        : "Muted 🔇";
  }
}

function updateHandUI() {
  const status =
    getEl("currentHandStatus");

  if (status) {
    status.textContent =
      handRaised
        ? "Raised ✋"
        : "Down";
  }
}

function updateLockUI() {
  const status =
    getEl("roomLockStatus");

  if (status) {
    status.textContent =
      roomLocked
        ? "Locked"
        : "Unlocked";
  }
}

function updateUserStatus(
  onlineCount = 0
) {
  const status =
    getEl("userStatus");

  const online =
    getEl("onlineCount");

  if (online) {
    online.textContent =
      String(onlineCount);
  }

  if (
    status &&
    currentUser
  ) {
    status.textContent =
      `${currentUser.name} joined as ${currentUser.role}. ` +
      `Mic: ${
        micOn ? "ON" : "Muted"
      }. ` +
      `Hand: ${
        handRaised
          ? "Raised"
          : "Down"
      }. ` +
      `Online: ${onlineCount}. ` +
      `${
        roomLocked
          ? "Room Locked"
          : "Room Open"
      }.`;
  }
}

function showRoomUI(role) {
  getEl("joinSection")
    ?.classList.add("hidden");

  getEl("availableRooms")
    ?.classList.add("hidden");

  getEl("roomPanel")
    ?.classList.remove("hidden");

  getEl("adminPanel")
    ?.classList.toggle(
      "hidden",
      role !== "admin"
    );
}

function showHomeUI() {
  getEl("roomPanel")
    ?.classList.add("hidden");

  getEl("adminPanel")
    ?.classList.add("hidden");

  getEl("joinSection")
    ?.classList.remove("hidden");

  getEl("availableRooms")
    ?.classList.remove("hidden");
}

function stopListeners() {
  if (unsubscribeRoom) {
    unsubscribeRoom();
  }

  if (unsubscribeParticipants) {
    unsubscribeParticipants();
  }

  if (unsubscribeSelf) {
    unsubscribeSelf();
  }

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  unsubscribeRoom = null;
  unsubscribeParticipants = null;
  unsubscribeSelf = null;
  unsubscribeMessages = null;
}

function stopMeetingTimer() {
  if (meetingTimerId) {
    clearInterval(
      meetingTimerId
    );
  }

  meetingTimerId = null;
}/* Mahima Ministry Connect - Final Clean Script */

const firebaseConfig = {
  apiKey: "AIzaSyClk4lBtDAUP5s1OTXhMlAFD8gvMUOXRt4",
  authDomain: "mahima-ministry-48485.firebaseapp.com",
  projectId: "mahima-ministry-48485",
  storageBucket: "mahima-ministry-48485.firebasestorage.app",
  messagingSenderId: "679867569021",
  appId: "1:679867569021:web:357b244a6da94e0cad3214"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

const TOKEN_SERVER_URL =
  "https://mahima-audio-server.onrender.com/get-token";

const LIVEKIT_URL =
  "wss://mahima-ministry-connect-k9runwnt.livekit.cloud";

const ADMIN_SECRET_KEY =
  "MCT2026@Prayer";

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

const getEl = (id) =>
  document.getElementById(id);

const showMessage = (message) =>
  window.alert(message);

function getIndiaDateKey() {
  const parts =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] =
        part.value;
    }
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function slugify(value) {
  const result =
    String(value)
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return (
    result ||
    `user-${Date.now()}`
  );
}

function makeUserId(name, role) {
  return `${role}-${slugify(name)}`;
}

function escapeHTML(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };

  return String(text).replace(
    /[&<>"']/g,
    (char) => map[char]
  );
}

function isAdmin() {
  if (
    !currentUser ||
    currentUser.role !== "admin"
  ) {
    showMessage(
      "এই control শুধুমাত্র Admin-এর জন্য।"
    );

    return false;
  }

  return true;
}

function updateRoleBadge() {
  const badge =
    getEl("roleBadge");

  if (
    badge &&
    currentUser
  ) {
    badge.textContent =
      currentUser.role === "admin"
        ? "👑 Admin"
        : "👤 Member";
  }
}

function updateRoomTitle() {
  if (!currentUser) {
    return;
  }

  const roomName =
    roomNames[currentUser.roomKey] ||
    "Prayer Room";

  const title =
    getEl("roomTitle");

  const currentRoomName =
    getEl("currentRoomName");

  if (title) {
    title.textContent =
      roomName;
  }

  if (currentRoomName) {
    currentRoomName.textContent =
      roomName;
  }
}

function updateMicUI() {
  const micCircle =
    document.querySelector(
      ".mic-circle"
    );

  const status =
    getEl("currentMicStatus");

  if (micCircle) {
    micCircle.classList.toggle(
      "muted",
      !micOn
    );

    micCircle.textContent =
      micOn ? "🎙️" : "🔇";
  }

  if (status) {
    status.textContent =
      micOn
        ? "On 🎙️"
        : "Muted 🔇";
  }
}

function updateHandUI() {
  const status =
    getEl("currentHandStatus");

  if (status) {
    status.textContent =
      handRaised
        ? "Raised ✋"
        : "Down";
  }
}

function updateLockUI() {
  const status =
    getEl("roomLockStatus");

  if (status) {
    status.textContent =
      roomLocked
        ? "Locked"
        : "Unlocked";
  }
}

function updateUserStatus(
  onlineCount = 0
) {
  const status =
    getEl("userStatus");

  const online =
    getEl("onlineCount");

  if (online) {
    online.textContent =
      String(onlineCount);
  }

  if (
    status &&
    currentUser
  ) {
    status.textContent =
      `${currentUser.name} joined as ${currentUser.role}. ` +
      `Mic: ${
        micOn ? "ON" : "Muted"
      }. ` +
      `Hand: ${
        handRaised
          ? "Raised"
          : "Down"
      }. ` +
      `Online: ${onlineCount}. ` +
      `${
        roomLocked
          ? "Room Locked"
          : "Room Open"
      }.`;
  }
}

function showRoomUI(role) {
  getEl("joinSection")
    ?.classList.add("hidden");

  getEl("availableRooms")
    ?.classList.add("hidden");

  getEl("roomPanel")
    ?.classList.remove("hidden");

  getEl("adminPanel")
    ?.classList.toggle(
      "hidden",
      role !== "admin"
    );
}

function showHomeUI() {
  getEl("roomPanel")
    ?.classList.add("hidden");

  getEl("adminPanel")
    ?.classList.add("hidden");

  getEl("joinSection")
    ?.classList.remove("hidden");

  getEl("availableRooms")
    ?.classList.remove("hidden");
}

function stopListeners() {
  if (unsubscribeRoom) {
    unsubscribeRoom();
  }

  if (unsubscribeParticipants) {
    unsubscribeParticipants();
  }

  if (unsubscribeSelf) {
    unsubscribeSelf();
  }

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  unsubscribeRoom = null;
  unsubscribeParticipants = null;
  unsubscribeSelf = null;
  unsubscribeMessages = null;
}

function stopMeetingTimer() {
  if (meetingTimerId) {
    clearInterval(
      meetingTimerId
    );
  }

  meetingTimerId = null;
}
