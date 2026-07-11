
Sunday 5:57 PM
Sunday 10:18 PM
এইটা আসছে 

হয়েছে?

দেখো হয়েছে কি না 


Monday 4:58 AM


এটা ওয়েবসাইট এর জন্য বানিয়েছিলাম

Screenshot_2026-07-06-05-26-26-65_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
Screenshot_2026-07-06-05-26-30-38_40deb401b9ffe8e1df2f1cc5ba480b12.jpg



Monday 7:53 AM

Monday 11:25 AM

হয়ে গেছে 

Monday 2:31 PM
Generated image: Mahima Ministry prayer platform UI mockup
Generated image: Mahima Ministry prayer platform UI mockup
Generated image: Mahima Ministry prayer platform UI mockup


Generated image: Mahima Ministry prayer platform home screen
Generated image: Mahima Ministry prayer platform home screen
Generated image: Mahima Ministry prayer platform home screen


এটা মহিমা মিনিষ্টির অরজিনাল লোগো এই লোগোর সাথে সামঞ্জস্যপূর্ণভাবে ইউ আই ডিজাইন কর

Generated image: Mahima Ministry app interface design
Generated image: Mahima Ministry app interface design
Generated image: Mahima Ministry app interface design




Generated image: Mahima Ministry audio prayer platform mock-up
Generated image: Mahima Ministry audio prayer platform mock-up

Thought for 1m 44s
Done.


Generated image: Mahima Ministry audio prayer platform design
Generated image: Mahima Ministry audio prayer platform design
Generated image: Mahima Ministry audio prayer platform design


Monday 4:57 PM
হয়েছে কি 

কোথা থেকে কি করব বুঝতে পারছি না বলে দাও।





Monday 8:49 PM


Tuesday 8:23 AM



Screenshot_2026-07-07-09-30-17-60_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
Screenshot_2026-07-07-09-30-25-30_40deb401b9ffe8e1df2f1cc5ba480b12.jpg

Screenshot_2026-07-07-10-12-08-57_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
Screenshot_2026-07-07-10-12-14-18_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
Screenshot_2026-07-07-10-12-18-94_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
Screenshot_2026-07-07-10-12-22-89_40deb401b9ffe8e1df2f1cc5ba480b12.jpg

এইখানটাতে কি করব বুঝতে পারছিনা বলে দাও।

Tuesday 1:17 PM


Tuesday 10:00 PM

number নেই তো 


Raise hand হয়েছে। এরপর কি করতে হবে ? আর বলছি যে এখানে কি তাহলে যে কেউ চাইলেই এডমিন হিসেবে জয়েন করতে পারবে

Wednesday 4:42 AM




Wednesday 7:47 AM



Value টা তো আসছে না 

Screenshot_2026-07-08-08-35-37-73_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
Screenshot_2026-07-08-08-35-27-46_40deb401b9ffe8e1df2f1cc5ba480b12.jpg

Done

Server.js open হচ্ছে না 

করে দিয়েছি দেখো, ৫১ নাম্বার লাইনে



Pasted text.txt
Document



Pasted text(1).txt
Document
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mahima Ministry Connect</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

<div class="app">

  <header class="top-header">
    <div class="logo-circle">
      <div class="cross">✝</div>
      <div class="grace">GRACE</div>
    </div>

    <h1>MAHIMA MINISTRY</h1>
    <p>Audio Prayer Platform</p>

    <div class="live-badge">● Live Prayer Connect</div>
  </header>

  <section class="join-card">
    <h2>Join Prayer Room</h2>

    <input id="nameInput" placeholder="আপনার নাম লিখুন" />

    <select id="roleInput">
      <option value="member">Member</option>
      <option value="admin">Admin</option>
    </select>

    <input id="adminKeyInput" type="password" placeholder="Admin Secret Key" />

    <select id="roomInput">
      <option value="morning-prayer">Morning Prayer Room</option>
      <option value="sunday-service">Sunday Service Room</option>
      <option value="bible-study">Bible Study Room</option>
      <option value="prayer-request">Prayer Request Room</option>
    </select>

    <button class="primary-btn" onclick="joinRoom()">🎧 Join Prayer Room</button>
  </section>

  <section id="roomPanel" class="live-room hidden">
    <div class="room-top">
      <div>
        <h2 id="roomTitle">Prayer Room</h2>
        <p id="userStatus">Not connected</p>
      </div>
      <span id="roleBadge" class="role-badge">Member</span>
    </div>

    <div class="mic-circle" onclick="toggleMic()">🎙️</div>

    <div class="room-actions">
      <button onclick="raiseHand()">✋ Raise Hand</button>
      <button onclick="toggleMic()">Mic On/Off</button>
      <button class="danger" onclick="leaveRoom()">Leave</button>
    </div>

    <div class="live-lists">
      <div class="list-box">
        <h3>👥 Live Participants</h3>
        <div id="participantsList">No participants yet</div>
      </div>

      <div class="list-box">
        <h3>✋ Raised Hands</h3>
        <div id="raisedHandsList">No raised hands</div>
      </div>
    </div>

    <div id="adminPanel" class="admin-box hidden">
      <h3>👑 Admin Dashboard</h3>
      <button onclick="muteAll()">🔇 Mute All</button>
      <button onclick="allowSpeaker()">🎤 Allow Speaker</button>
      <button onclick="lockRoom()">🔒 Lock Room</button>
      <button onclick="cleanOldEntries()">🧹 Clean Old Entries</button>
    </div>
  </section>

  <section class="rooms">
    <h2>Available Rooms</h2>

    <div class="room-grid">
      <div class="room-card">🙏<span>Morning Prayer</span></div>
      <div class="room-card">⛪<span>Sunday Service</span></div>
      <div class="room-card">📖<span>Bible Study</span></div>
      <div class="room-card">❤️<span>Prayer Request</span></div>
    </div>
  </section>

  <section class="info-card">
    <h2>🔊 Room Info</h2>
    <p>Join our prayer rooms and be blessed.</p>
    <p>Let’s connect in faith and prayer together.</p>
  </section>

  <nav class="bottom-nav">
    <div class="active">🏠<span>Home</span></div>
    <div>👥<span>Rooms</span></div>
    <div>🎧<span>Join</span></div>
    <div>❤️<span>Prayer</span></div>
    <div>👤<span>Profile</span></div>
  </nav>

</div>

<script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore-compat.js"></script>
<script src="script.js"></script>

<script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore-compat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js"></script>
<script src="script.js"></script>
</body>
</html>


Wednesday 6:35 PM

দেখো নতুন কোডটা পেস্ট হয়েছে কিনা



Wednesday 9:45 PM

Pasted text(2).txt
Document

Screenshot_2026-07-08-22-01-34-84_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
Screenshot_2026-07-08-21-59-07-51_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
কোথা থেকে কিভাবে কি করব বুঝতে পারছি না ভালো করে বুঝিয়ে বলে দাও


এবার নিশ্চয়ই ঠিক আছে দেখো



এটা কি হলো? এরকম ভাব কেন আসছে

Thursday 3:24 AM
Thursday 6:53 AM
Thursday 10:24 AM


Screenshot_2026-07-09-11-39-59-77_40deb401b9ffe8e1df2f1cc5ba480b12.jpg
Screenshot_2026-07-09-11-39-54-41_40deb401b9ffe8e1df2f1cc5ba480b12.jpg

Thursday 4:30 PM
Thursday 8:00 PM


Thursday 10:12 PM
Yesterday 3:52 AM
Generated image: Audio prayer meeting dashboard interface
Generated image: Audio prayer meeting dashboard interface
Generated image: Audio prayer meeting dashboard interface


Generated image: Morning prayer dashboard interface
Generated image: Morning prayer dashboard interface
Generated image: Morning prayer dashboard interface


Generated image: Morning prayer room dashboard interface
Generated image: Morning prayer room dashboard interface
Generated image: Morning prayer room dashboard interface



Generated image: Morning prayer room app interface
Generated image: Morning prayer room app interface
Generated image: Morning prayer room app interface

এই মোবাইল UI-টাই ফাইনাল রেফারেন্স ধরব। ✅

এখন আমি mobile-first final code দেব।
পরের ধাপে প্রথমে index.html, তারপর styles.css, তারপর script.js।
logo.png হিসেবে এই লোগোটা GitHub root-এ আপলোড করতে হবে।


Yesterday 7:13 AM
Yesterday 8:17 AM
Yesterday 9:23 AM
Yesterday 12:31 PM
Yesterday 7:22 PM
এটা কি? তুমি এতবড় ভুল কিভাবে করতে পারলে ?

Today 5:53 AM
Today 7:37 AM
দারুণ! 🔥 Part 5A Complete।

আমরা এখন প্রায় ৯০% শেষ।

এবার Part 5B। এটা Part 5A-এর নিচে paste করবে।

/* =====================================================
   FINAL SCRIPT.JS
   PART 5B / 6

   END MEETING
   LEAVE ROOM
   ADMIN LEAVE = EVERYONE LEAVE
===================================================== */


/* =========================
   END MEETING
========================= */

async function endMeeting() {

  if (!isAdmin()) return;

  const ok = confirm(
    "Meeting শেষ করলে সবাই Room থেকে বের হয়ে যাবে। Continue?"
  );

  if (!ok) return;

  try {

    const roomRef = db
      .collection("rooms")
      .doc(currentUser.roomId);

    await roomRef.set({

      roomActive:false,

      locked:true,

      online:0,

      announcement:null,

      endedAt:
      firebase.firestore.FieldValue.serverTimestamp()

    },{merge:true});

    const participants =
      await roomRef
      .collection("participants")
      .get();

    const batch=db.batch();

    participants.forEach(doc=>{
      batch.delete(doc.ref);
    });

    await batch.commit();

    showMessage(
      "Meeting End Successfully."
    );

    await leaveRoom({
      auto:true,
      closeRoom:false,
      deleteParticipant:false
    });

  }

  catch(error){

    console.error(error);

    showMessage(error.message);

  }

}


/* =========================
   LEAVE ROOM
========================= */

async function leaveRoom(options={}){

const{

auto=false,

closeRoom=true,

deleteParticipant=true

}=options;

if(!currentUser)return;

const roomRef=db
.collection("rooms")
.doc(currentUser.roomId);

try{

roomClosing=true;

if(deleteParticipant){

await roomRef
.collection("participants")
.doc(currentUser.id)
.delete()
.catch(()=>{});

}

/* Admin Leave */

if(

currentUser.role==="admin"

&&

closeRoom

){

await roomRef.set({

roomActive:false,

locked:true,

online:0,

endedAt:
firebase.firestore.FieldValue.serverTimestamp()

},{merge:true});

const members=
await roomRef
.collection("participants")
.get();

const batch=db.batch();

members.forEach(doc=>{

batch.delete(doc.ref);

});

await batch.commit();

}


/* LiveKit */

if(lkRoom){

lkRoom.disconnect();

lkRoom=null;

}


/* Listener */

stopListeners();

stopMeetingTimer();


currentUser=null;

micOn=false;

handRaised=false;

allowedToSpeak=false;

roomLocked=false;

roomClosing=false;


/* UI */

getEl("roomPanel")
?.classList.add("hidden");

getEl("adminPanel")
?.classList.add("hidden");

getEl("joinSection")
?.classList.remove("hidden");

getEl("availableRooms")
?.classList.remove("hidden");

updateMicUI();

updateHandUI();

if(!auto){

showMessage(
"Room থেকে বেরিয়ে গেছেন।"
);

}

}

catch(error){

console.error(error);

showMessage(error.message);

}

}


/* =========================
   ADMIN CHECK
========================= */

function isAdmin(){

if(

!currentUser ||

currentUser.role!=="admin"

){

showMessage(
"Only Admin."
);

return false;

}

return true;

}


/* =========================
   PAGE CLOSE
========================= */

window.addEventListener(

"pagehide",

()=>{

if(lkRoom){

lkRoom.disconnect();

}

}

);


/* =========================
   EXPORT FUNCTIONS
========================= */

window.joinRoom=joinRoom;

window.raiseHand=raiseHand;

window.toggleMic=toggleMic;

window.sendMessage=sendMessage;

window.sendAnnouncement=sendAnnouncement;

window.lockRoom=lockRoom;

window.removeParticipant=removeParticipant;

window.cleanOldEntries=cleanOldEntries;

window.muteAll=muteAll;

window.allowSpeaker=allowSpeaker;

window.allowSpeakerById=allowSpeakerById;

window.leaveRoom=leaveRoom;

window.endMeeting=endMeeting;

window.clearAnnouncement=clearAnnouncement;
এরপর
লিখবে:

Part 5B Complete

তারপর আমি Final Part 6 দেব।

🎉 Part 6-এর পর script.js 100% Complete হবে।

তারপর আমরা index.html-এ যাব এবং পুরো অ্যাপ Production Ready করব।


Part 5b complete 

দারুণ! 🎉 Part 5B Complete।

প্রথমে একটা খুব গুরুত্বপূর্ণ কথা বলি।

⚠️ Stop
আমি এখন Part 6 দেব না।

কারণ আমি আমাদের আগের Partগুলো আবার মিলিয়ে দেখলাম। সেখানে কয়েকটা জায়গায় একই function-এর duplicate হওয়ার সম্ভাবনা আছে (যেমন allowSpeaker, leaveRoom, listenMessages ইত্যাদি)। যদি আমরা এভাবে Part 6 যোগ করি, তাহলে পরে JavaScript-এ Duplicate Function, Unexpected Token, বা Already Declared ধরনের error আসতে পারে।

তুমি এত কষ্ট করে project বানাচ্ছ, তাই আমি চাই না শেষ মুহূর্তে একটা ভুলের জন্য পুরো app নষ্ট হয়ে যাক।

আমার সিদ্ধান্ত
এখন থেকে আর Part 6 যোগ করব না।

আমি একটা সম্পূর্ণ Final script.js তৈরি করব যেখানে:

✅ Duplicate থাকবে না

✅ সব function একবারই থাকবে

✅ সব feature একসাথে কাজ করবে

✅ Production Ready হবে

এটা আমি ধাপে ধাপে নয়, সম্পূর্ণ ফাইল হিসেবেই তৈরি করব।

এখন তোমার কাজ
এখন GitHub-এ Commit কোরো না।

কারণ এই script.js এখনো intermediate stage-এ আছে।

এরপর কী হবে
আমরা এভাবে এগোব:

✅ Final script.js (একদম clean)

✅ Final index.html

✅ Firestore Rules

✅ Final Testing

✅ তারপর VPS Deployment

আমি এবার আর তাড়াহুড়ো করে অসম্পূর্ণ কোড দেব না। আমরা এমন একটা Final Version বানাব যেটা Mahima Ministry-এর জন্য সত্যিই ব্যবহারযোগ্য হবে।

এইবার আমি clean Final script.js তৈরি করছি, তারপর সেটাই Replace করবে। এতে পরে আর duplicate বা syntax error নিয়ে ঝামেলা হবে না।


Koro

একদম পরিষ্কার, duplicate-মুক্ত Final script.js তৈরি করেছি।

mahima_final_script.js
mahima_final_script.txt

এখন করো:

GitHub root-এর script.js খোলো

পুরনো সব কোড মুছে দাও

উপরের text version খুলে সব কপি করো

script.js-এ paste করো

Commit changes চাপো

GitHub Pages ১–২ মিনিট পরে refresh করো

এই ফাইলে duplicate function নেই এবং Audio, Chat, Announcement, Daily Reset, Admin Leave, Remove Member, End Meeting—সব একসাথে আছে। 


No file chosen
Library
/
mahima_final_script.txt


/* Mahima Ministry Connect - Final Clean Script */

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
const showMessage = (message) => window.alert(message);

function getIndiaDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = {};
  parts.forEach((part) => {
    if (part.type !== "literal") values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function slugify(value) {
  const result = String(value)
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return result || `user-${Date.now()}`;
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

  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

function isAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    showMessage("এই control শুধুমাত্র Admin-এর জন্য।");
    return false;
  }
  return true;
}

function updateRoleBadge() {
  const badge = getEl("roleBadge");
  if (badge && currentUser) {
    badge.textContent = currentUser.role === "admin" ? "👑 Admin" : "👤 Member";
  }
}

function updateRoomTitle() {
  if (!currentUser) return;

  const roomName = roomNames[currentUser.roomKey] || "Prayer Room";
  const title = getEl("roomTitle");
  const currentRoomName = getEl("currentRoomName");

  if (title) title.textContent = roomName;
  if (currentRoomName) currentRoomName.textContent = roomName;
}

function updateMicUI() {
  const micCircle = document.querySelector(".mic-circle");
  const status = getEl("currentMicStatus");

  if (micCircle) {
    micCircle.classList.toggle("muted", !micOn);
    micCircle.textContent = micOn ? "🎙️" : "🔇";
  }

  if (status) status.textContent = micOn ? "On 🎙️" : "Muted 🔇";
}

function updateHandUI() {
  const status = getEl("currentHandStatus");
  if (status) status.textContent = handRaised ? "Raised ✋" : "Down";
}

function updateLockUI() {
  const status = getEl("roomLockStatus");
  if (status) status.textContent = roomLocked ? "Locked" : "Unlocked";
}

function updateUserStatus(onlineCount = 0) {
  const status = getEl("userStatus");
  const online = getEl("onlineCount");

  if (online) online.textContent = String(onlineCount);

  if (status && currentUser) {
    status.textContent =
      `${currentUser.name} joined as ${currentUser.role}. ` +
      `Mic: ${micOn ? "ON" : "Muted"}. ` +
      `Hand: ${handRaised ? "Raised" : "Down"}. ` +
      `Online: ${onlineCount}. ` +
      `${roomLocked ? "Room Locked" : "Room Open"}.`;
  }
}

function showRoomUI(role) {
  getEl("joinSection")?.classList.add("hidden");
  getEl("availableRooms")?.classList.add("hidden");
  getEl("roomPanel")?.classList.remove("hidden");
  getEl("adminPanel")?.classList.toggle("hidden", role !== "admin");
}

function showHomeUI() {
  getEl("roomPanel")?.classList.add("hidden");
  getEl("adminPanel")?.classList.add("hidden");
  getEl("joinSection")?.classList.remove("hidden");
  getEl("availableRooms")?.classList.remove("hidden");
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

function stopMeetingTimer() {
  if (meetingTimerId) clearInterval(meetingTimerId);
  meetingTimerId = null;
}

function startMeetingTimer(startValue) {
  stopMeetingTimer();
  if (!startValue) return;

  const startDate =
    typeof startValue.toDate === "function"
      ? startValue.toDate()
      : new Date(startValue);

  if (Number.isNaN(startDate.getTime())) return;

  meetingStartedAt = startDate;

  const render = () => {
    const timer = getEl("meetingTimer");
    if (!timer || !meetingStartedAt) return;

    const total = Math.max(
      0,
      Math.floor((Date.now() - meetingStartedAt.getTime()) / 1000)
    );

    const hours = String(Math.floor(total / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");

    timer.textContent = `${hours}:${minutes}:${seconds}`;
  };

  render();
  meetingTimerId = setInterval(render, 1000);
}

async function deleteCollection(query, batchLimit = 400) {
  while (true) {
    const snapshot = await query.limit(batchLimit).get();
    if (snapshot.empty) return;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    if (snapshot.size < batchLimit) return;
  }
}

async function resetRoomForNewDay(roomRef) {
  await Promise.all([
    deleteCollection(
      roomRef
        .collection("participants")
        .orderBy(firebase.firestore.FieldPath.documentId())
    ),
    deleteCollection(
      roomRef
        .collection("messages")
        .orderBy(firebase.firestore.FieldPath.documentId())
    )
  ]);

  await roomRef.set(
    {
      online: 0,
      locked: false,
      roomActive: false,
      announcement: null,
      lastResetDate: getIndiaDateKey(),
      resetAt: firebase.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

async function ensureDailyReset(roomRef) {
  const today = getIndiaDateKey();
  const snapshot = await roomRef.get();
  const data = snapshot.exists ? snapshot.data() : {};

  if (data.lastResetDate !== today) {
    await resetRoomForNewDay(roomRef);
  }
}

async function joinRoom() {
  try {
    if (currentUser) {
      showMessage("আপনি ইতিমধ্যে একটি Room-এ আছেন।");
      return;
    }

    const name = getEl("nameInput")?.value.trim();
    const role = getEl("roleInput")?.value;
    const roomKey = getEl("roomInput")?.value;
    const adminKey = getEl("adminKeyInput")?.value.trim() || "";

    if (!name) return showMessage("দয়া করে আপনার নাম লিখুন।");
    if (!roomIds[roomKey]) return showMessage("সঠিক Prayer Room নির্বাচন করুন।");

    if (role === "admin" && adminKey !== ADMIN_SECRET_KEY) {
      showMessage("Invalid Admin Key ❌");
      return;
    }

    const roomId = roomIds[roomKey];
    const roomRef = db.collection("rooms").doc(roomId);

    const firstSnapshot = await roomRef.get();

    if (!firstSnapshot.exists) {
      await roomRef.set({
        name: roomNames[roomKey],
        online: 0,
        locked: false,
        roomActive: false,
        announcement: null,
        lastResetDate: getIndiaDateKey(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    await ensureDailyReset(roomRef);

    const roomSnapshot = await roomRef.get();
    const roomData = roomSnapshot.data() || {};

    roomLocked = roomData.locked === true;

    if (role !== "admin") {
      if (roomData.roomActive !== true) {
        showMessage("Admin এখনও এই Prayer Room শুরু করেননি।");
        return;
      }

      if (roomLocked) {
        showMessage("Room locked আছে। Admin unlock করলে Join করা যাবে।");
        return;
      }
    }

    if (role === "admin") {
      await roomRef.set(
        {
          roomActive: true,
          locked: false,
          lastResetDate: getIndiaDateKey(),
          startedAt: firebase.firestore.FieldValue.serverTimestamp(),
          endedAt: null
        },
        { merge: true }
      );
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
      roomId
    };

    await roomRef
      .collection("participants")
      .doc(currentUser.id)
      .set(
        {
          name,
          role,
          roomKey,
          roomId,
          micOn,
          handRaised,
          allowedToSpeak,
          online: true,
          joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );

    showRoomUI(role);
    updateRoomTitle();
    updateRoleBadge();
    updateMicUI();
    updateHandUI();
    updateLockUI();
    updateUserStatus(1);

    listenRoom(roomRef);
    listenParticipants(roomRef);
    listenSelf(roomRef);
    listenMessages(roomRef);

    await connectLiveKit(roomId, name, role);
  } catch (error) {
    console.error("Join error:", error);
    showMessage(`Join error: ${error.message}`);
  }
}

async function connectLiveKit(roomName, participantName, role) {
  try {
    if (!window.LivekitClient) {
      throw new Error("LiveKit Client load হয়নি। index.html check করুন।");
    }

    const response = await fetch(TOKEN_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, participantName, role })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(data.details || data.error || "Token পাওয়া যায়নি।");
    }

    const { Room, RoomEvent, Track } = window.LivekitClient;

    lkRoom = new Room({
      adaptiveStream: true,
      dynacast: true
    });

    lkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio || track.kind === "audio") {
        const audio = track.attach();

        audio.autoplay = true;
        audio.playsInline = true;
        audio.dataset.livekitAudio = "true";
        audio.style.display = "none";

        document.body.appendChild(audio);
        audio.play().catch(() => {});
      }
    });

    lkRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach().forEach((element) => element.remove());
    });

    lkRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const identities = new Set(
        speakers.map((participant) => participant.identity)
      );

      document
        .querySelectorAll(".participant-item[data-livekit-identity]")
        .forEach((element) => {
          element.classList.toggle(
            "speaking",
            identities.has(element.dataset.livekitIdentity)
          );
        });
    });

    await lkRoom.connect(LIVEKIT_URL, data.token);
    await lkRoom.startAudio().catch(() => {});
    await lkRoom.localParticipant.setMicrophoneEnabled(micOn);

    await db
      .collection("rooms")
      .doc(roomName)
      .collection("participants")
      .doc(currentUser.id)
      .update({
        micOn,
        allowedToSpeak,
        livekitIdentity: data.identity || ""
      });

    updateMicUI();
    showMessage("Audio Room Connected ✅");
  } catch (error) {
    console.error("Audio connect error:", error);
    showMessage(`Audio connect error: ${error.message}`);
  }
}

function listenRoom(roomRef) {
  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = roomRef.onSnapshot(async (snapshot) => {
    if (!snapshot.exists || !currentUser) return;

    const data = snapshot.data();

    roomLocked = data.locked === true;
    updateLockUI();
    updateUserStatus(data.online || 0);

    const textEl = getEl("announcementText");
    const metaEl = getEl("announcementMeta");

    if (data.announcement?.text) {
      if (textEl) textEl.textContent = data.announcement.text;
      if (metaEl) {
        metaEl.textContent = `— ${data.announcement.author || "Admin"}`;
      }
    } else {
      if (textEl) textEl.textContent = "এখনো কোনো announcement নেই।";
      if (metaEl) metaEl.textContent = "— Admin";
    }

    if (data.startedAt) startMeetingTimer(data.startedAt);

    if (
      data.roomActive === false &&
      currentUser.role !== "admin" &&
      !roomClosing
    ) {
      roomClosing = true;
      showMessage("Admin Room বন্ধ করেছেন। আপনি Room থেকে বেরিয়ে যাচ্ছেন।");

      await leaveRoom({
        auto: true,
        closeRoom: false
      });
    }
  });
}

function listenSelf(roomRef) {
  if (unsubscribeSelf) unsubscribeSelf();

  unsubscribeSelf = roomRef
    .collection("participants")
    .doc(currentUser.id)
    .onSnapshot(async (snapshot) => {
      if (!currentUser) return;

      if (!snapshot.exists) {
        if (!roomClosing) {
          roomClosing = true;
          showMessage("Admin আপনাকে Room থেকে সরিয়ে দিয়েছেন।");

          await leaveRoom({
            auto: true,
            closeRoom: false,
            deleteParticipant: false
          });
        }
        return;
      }

      const data = snapshot.data();

      handRaised = data.handRaised === true;
      allowedToSpeak =
        data.allowedToSpeak === true || currentUser.role === "admin";

      const newMicState = data.micOn === true && allowedToSpeak;

      if (micOn !== newMicState) {
        micOn = newMicState;

        if (lkRoom?.localParticipant) {
          try {
            await lkRoom.localParticipant.setMicrophoneEnabled(micOn);
          } catch (error) {
            console.error(error);
            showMessage("Microphone permission Allow করুন।");
          }
        }
      }

      updateMicUI();
      updateHandUI();
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
      const raisedHandsCount = getEl("raisedHandsCount");

      await roomRef.set({ online: snapshot.size }, { merge: true });

      if (!participantsList || !raisedHandsList) return;

      participantsList.innerHTML = "";
      raisedHandsList.innerHTML = "";

      let raisedCount = 0;

      snapshot.forEach((documentSnapshot) => {
        const participant = documentSnapshot.data();
        const name = escapeHTML(participant.name || "Unknown");
        const roleIcon = participant.role === "admin" ? "👑" : "👤";
        const identity = escapeHTML(participant.livekitIdentity || "");

        const removeButton =
          currentUser?.role === "admin" &&
          documentSnapshot.id !== currentUser.id
            ? `<button type="button" onclick="removeParticipant('${documentSnapshot.id}')">Remove</button>`
            : "";

        participantsList.insertAdjacentHTML(
          "beforeend",
          `
            <div
              class="participant-item"
              data-livekit-identity="${identity}"
            >
              <div>
                <strong>${roleIcon} ${name}</strong>
                <span>
                  Mic: ${participant.micOn ? "ON 🎙️" : "Muted 🔇"} |
                  Hand: ${participant.handRaised ? "Raised ✋" : "Down"}
                </span>
              </div>
              ${removeButton}
            </div>
          `
        );

        if (participant.handRaised) {
          raisedCount += 1;

          const allowButton =
            currentUser?.role === "admin"
              ? `<button type="button" onclick="allowSpeakerById('${documentSnapshot.id}')">🎤 Allow Speak</button>`
              : "";

          raisedHandsList.insertAdjacentHTML(
            "beforeend",
            `
              <div class="participant-item">
                <div>
                  <strong>✋ ${name}</strong>
                  <span>Wants to speak</span>
                </div>
                ${allowButton}
              </div>
            `
          );
        }
      });

      if (snapshot.empty) participantsList.textContent = "No participants yet";
      if (raisedCount === 0) raisedHandsList.textContent = "No raised hands";
      if (raisedHandsCount) raisedHandsCount.textContent = String(raisedCount);

      updateUserStatus(snapshot.size);
    });
}

function listenMessages(roomRef) {
  if (unsubscribeMessages) unsubscribeMessages();

  unsubscribeMessages = roomRef
    .collection("messages")
    .orderBy("createdAt", "asc")
    .limitToLast(100)
    .onSnapshot((snapshot) => {
      const messagesList = getEl("messagesList");
      if (!messagesList) return;

      messagesList.innerHTML = "";

      if (snapshot.empty) {
        messagesList.textContent = "No messages yet";
        return;
      }

      snapshot.forEach((documentSnapshot) => {
        const message = documentSnapshot.data();
        const safeName = escapeHTML(message.name || "Member");
        const safeText = escapeHTML(message.text || "");
        const messageClass =
          message.role === "admin" ? "admin" : "member";
        const roleIcon = message.role === "admin" ? "👑" : "👤";

        messagesList.insertAdjacentHTML(
          "beforeend",
          `
            <div class="message ${messageClass}">
              <strong>${roleIcon} ${safeName}</strong>
              <div>${safeText}</div>
            </div>
          `
        );
      });

      messagesList.scrollTop = messagesList.scrollHeight;
    });
}

async function sendMessage() {
  try {
    if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");

    const input = getEl("messageInput");
    const text = input?.value.trim();

    if (!text) return;
    if (text.length > 500) {
      return showMessage("Message সর্বোচ্চ 500 characters হতে পারবে।");
    }

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("messages")
      .add({
        name: currentUser.name,
        role: currentUser.role,
        text,
        dateKey: getIndiaDateKey(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    input.value = "";
  } catch (error) {
    console.error(error);
    showMessage(`Message পাঠানো যায়নি: ${error.message}`);
  }
}

async function sendAnnouncement() {
  try {
    if (!isAdmin()) return;

    const input = getEl("announcementInput");
    const text = input?.value.trim();

    if (!text) return showMessage("Announcement লিখুন।");
    if (text.length > 500) {
      return showMessage("Announcement সর্বোচ্চ 500 characters হতে পারবে।");
    }

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .set(
        {
          announcement: {
            text,
            author: currentUser.name,
            dateKey: getIndiaDateKey(),
            createdAt: new Date().toISOString()
          }
        },
        { merge: true }
      );

    input.value = "";
    showMessage("Announcement সবার কাছে পাঠানো হয়েছে 📢");
  } catch (error) {
    console.error(error);
    showMessage(`Announcement পাঠানো যায়নি: ${error.message}`);
  }
}

async function clearAnnouncement() {
  if (!isAdmin()) return;

  await db
    .collection("rooms")
    .doc(currentUser.roomId)
    .set({ announcement: null }, { merge: true });
}

async function raiseHand() {
  try {
    if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");

    handRaised = !handRaised;

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("participants")
      .doc(currentUser.id)
      .update({ handRaised });

    updateHandUI();

    showMessage(
      handRaised ? "আপনার হাত Raise হয়েছে ✋" : "হাত নামানো হয়েছে।"
    );
  } catch (error) {
    console.error(error);
    showMessage(error.message);
  }
}

async function toggleMic() {
  try {
    if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");
    if (!allowedToSpeak) {
      return showMessage("Admin অনুমতি না দিলে Mic চালু হবে না।");
    }

    const newState = !micOn;

    if (lkRoom?.localParticipant) {
      await lkRoom.localParticipant.setMicrophoneEnabled(newState);
    }

    micOn = newState;

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("participants")
      .doc(currentUser.id)
      .update({ micOn });

    updateMicUI();
  } catch (error) {
    console.error(error);
    showMessage("Microphone permission Allow করুন।");
  }
}

function allowSpeaker() {
  showMessage("Raised Hands তালিকা থেকে Allow Speak চাপুন।");
}

async function allowSpeakerById(participantId) {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((documentSnapshot) => {
    const isSelected = documentSnapshot.id === participantId;
    const isAdminUser = documentSnapshot.id === currentUser.id;

    batch.update(documentSnapshot.ref, {
      micOn: isSelected || isAdminUser,
      allowedToSpeak: isSelected || isAdminUser,
      handRaised: false
    });
  });

  await batch.commit();
  showMessage("Speaker permission দেওয়া হয়েছে 🎤");
}

async function muteAll() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((documentSnapshot) => {
    const isAdminUser = documentSnapshot.id === currentUser.id;

    batch.update(documentSnapshot.ref, {
      micOn: isAdminUser,
      allowedToSpeak: isAdminUser,
      handRaised: false
    });
  });

  await batch.commit();
  showMessage("Admin ছাড়া সবাইকে mute করা হয়েছে 🔇");
}

async function lockRoom() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.get();
  const newLocked = !(snapshot.data()?.locked === true);

  await roomRef.set({ locked: newLocked }, { merge: true });

  roomLocked = newLocked;
  updateLockUI();

  showMessage(
    newLocked ? "Room locked হয়েছে 🔒" : "Room unlocked হয়েছে 🔓"
  );
}

async function removeParticipant(participantId) {
  if (!isAdmin()) return;
  if (!participantId || participantId === currentUser.id) return;

  const participantRef = db
    .collection("rooms")
    .doc(currentUser.roomId)
    .collection("participants")
    .doc(participantId);

  const snapshot = await participantRef.get();

  if (!snapshot.exists) return showMessage("এই Member আর Room-এ নেই।");

  const name = snapshot.data().name || "Member";

  if (!window.confirm(`${name}-কে Room থেকে Remove করবেন?`)) return;

  await participantRef.delete();
  showMessage(`${name} Room থেকে Remove হয়েছে।`);
}

async function cleanOldEntries() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  let count = 0;

  snapshot.forEach((documentSnapshot) => {
    if (documentSnapshot.id !== currentUser.id) {
      batch.delete(documentSnapshot.ref);
      count += 1;
    }
  });

  if (count === 0) return showMessage("পরিষ্কার করার মতো পুরনো entry নেই।");

  await batch.commit();
  showMessage(`${count}টি entry পরিষ্কার হয়েছে ✅`);
}

async function endMeeting() {
  if (!isAdmin()) return;

  if (
    !window.confirm(
      "Meeting শেষ করলে সবাই Room থেকে বের হয়ে যাবে। নিশ্চিত?"
    )
  ) {
    return;
  }

  const roomRef = db.collection("rooms").doc(currentUser.roomId);

  await roomRef.set(
    {
      roomActive: false,
      locked: true,
      online: 0,
      announcement: null,
      endedAt: firebase.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await deleteCollection(
    roomRef
      .collection("participants")
      .orderBy(firebase.firestore.FieldPath.documentId())
  );

  showMessage("Meeting শেষ হয়েছে।");

  await leaveRoom({
    auto: true,
    closeRoom: false,
    deleteParticipant: false
  });
}

async function leaveRoom(options = {}) {
  const {
    auto = false,
    closeRoom = true,
    deleteParticipant = true
  } = options;

  if (!currentUser) return;

  const leavingUser = { ...currentUser };
  const roomRef = db.collection("rooms").doc(leavingUser.roomId);

  try {
    roomClosing = true;

    if (deleteParticipant) {
      await roomRef
        .collection("participants")
        .doc(leavingUser.id)
        .delete()
        .catch(() => {});
    }

    if (leavingUser.role === "admin" && closeRoom) {
      await roomRef.set(
        {
          roomActive: false,
          locked: true,
          online: 0,
          endedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      await deleteCollection(
        roomRef
          .collection("participants")
          .orderBy(firebase.firestore.FieldPath.documentId())
      );
    }

    if (lkRoom) {
      lkRoom.disconnect();
      lkRoom = null;
    }

    document
      .querySelectorAll("audio[data-livekit-audio='true']")
      .forEach((element) => element.remove());

    stopListeners();
    stopMeetingTimer();

    currentUser = null;
    micOn = false;
    handRaised = false;
    allowedToSpeak = false;
    roomLocked = false;
    roomClosing = false;
    meetingStartedAt = null;

    showHomeUI();
    updateMicUI();
    updateHandUI();

    if (!auto) showMessage("Room থেকে বেরিয়ে গেছেন।");
  } catch (error) {
    console.error(error);
    showMessage(`Leave error: ${error.message}`);
  }
}

document.addEventListener("keydown", (event) => {
  const input = getEl("messageInput");

  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    document.activeElement === input
  ) {
    event.preventDefault();
    sendMessage();
  }
});

window.addEventListener("pagehide", () => {
  if (lkRoom) lkRoom.disconnect();
});

window.joinRoom = joinRoom;
window.sendMessage = sendMessage;
window.sendAnnouncement = sendAnnouncement;
window.clearAnnouncement = clearAnnouncement;
window.raiseHand = raiseHand;
window.toggleMic = toggleMic;
window.allowSpeaker = allowSpeaker;
window.allowSpeakerById = allowSpeakerById;
window.muteAll = muteAll;
window.lockRoom = lockRoom;
window.removeParticipant = removeParticipant;
window.cleanOldEntries = cleanOldEntries;
window.endMeeting = endMeeting;
window.leaveRoom = leaveRoom;
Library
/
mahima_final_script.txt


/* Mahima Ministry Connect - Final Clean Script */

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
const showMessage = (message) => window.alert(message);

function getIndiaDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = {};
  parts.forEach((part) => {
    if (part.type !== "literal") values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function slugify(value) {
  const result = String(value)
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return result || `user-${Date.now()}`;
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

  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

function isAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    showMessage("এই control শুধুমাত্র Admin-এর জন্য।");
    return false;
  }
  return true;
}

function updateRoleBadge() {
  const badge = getEl("roleBadge");
  if (badge && currentUser) {
    badge.textContent = currentUser.role === "admin" ? "👑 Admin" : "👤 Member";
  }
}

function updateRoomTitle() {
  if (!currentUser) return;

  const roomName = roomNames[currentUser.roomKey] || "Prayer Room";
  const title = getEl("roomTitle");
  const currentRoomName = getEl("currentRoomName");

  if (title) title.textContent = roomName;
  if (currentRoomName) currentRoomName.textContent = roomName;
}

function updateMicUI() {
  const micCircle = document.querySelector(".mic-circle");
  const status = getEl("currentMicStatus");

  if (micCircle) {
    micCircle.classList.toggle("muted", !micOn);
    micCircle.textContent = micOn ? "🎙️" : "🔇";
  }

  if (status) status.textContent = micOn ? "On 🎙️" : "Muted 🔇";
}

function updateHandUI() {
  const status = getEl("currentHandStatus");
  if (status) status.textContent = handRaised ? "Raised ✋" : "Down";
}

function updateLockUI() {
  const status = getEl("roomLockStatus");
  if (status) status.textContent = roomLocked ? "Locked" : "Unlocked";
}

function updateUserStatus(onlineCount = 0) {
  const status = getEl("userStatus");
  const online = getEl("onlineCount");

  if (online) online.textContent = String(onlineCount);

  if (status && currentUser) {
    status.textContent =
      `${currentUser.name} joined as ${currentUser.role}. ` +
      `Mic: ${micOn ? "ON" : "Muted"}. ` +
      `Hand: ${handRaised ? "Raised" : "Down"}. ` +
      `Online: ${onlineCount}. ` +
      `${roomLocked ? "Room Locked" : "Room Open"}.`;
  }
}

function showRoomUI(role) {
  getEl("joinSection")?.classList.add("hidden");
  getEl("availableRooms")?.classList.add("hidden");
  getEl("roomPanel")?.classList.remove("hidden");
  getEl("adminPanel")?.classList.toggle("hidden", role !== "admin");
}

function showHomeUI() {
  getEl("roomPanel")?.classList.add("hidden");
  getEl("adminPanel")?.classList.add("hidden");
  getEl("joinSection")?.classList.remove("hidden");
  getEl("availableRooms")?.classList.remove("hidden");
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

function stopMeetingTimer() {
  if (meetingTimerId) clearInterval(meetingTimerId);
  meetingTimerId = null;
}

function startMeetingTimer(startValue) {
  stopMeetingTimer();
  if (!startValue) return;

  const startDate =
    typeof startValue.toDate === "function"
      ? startValue.toDate()
      : new Date(startValue);

  if (Number.isNaN(startDate.getTime())) return;

  meetingStartedAt = startDate;

  const render = () => {
    const timer = getEl("meetingTimer");
    if (!timer || !meetingStartedAt) return;

    const total = Math.max(
      0,
      Math.floor((Date.now() - meetingStartedAt.getTime()) / 1000)
    );

    const hours = String(Math.floor(total / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");

    timer.textContent = `${hours}:${minutes}:${seconds}`;
  };

  render();
  meetingTimerId = setInterval(render, 1000);
}

async function deleteCollection(query, batchLimit = 400) {
  while (true) {
    const snapshot = await query.limit(batchLimit).get();
    if (snapshot.empty) return;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    if (snapshot.size < batchLimit) return;
  }
}

async function resetRoomForNewDay(roomRef) {
  await Promise.all([
    deleteCollection(
      roomRef
        .collection("participants")
        .orderBy(firebase.firestore.FieldPath.documentId())
    ),
    deleteCollection(
      roomRef
        .collection("messages")
        .orderBy(firebase.firestore.FieldPath.documentId())
    )
  ]);

  await roomRef.set(
    {
      online: 0,
      locked: false,
      roomActive: false,
      announcement: null,
      lastResetDate: getIndiaDateKey(),
      resetAt: firebase.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

async function ensureDailyReset(roomRef) {
  const today = getIndiaDateKey();
  const snapshot = await roomRef.get();
  const data = snapshot.exists ? snapshot.data() : {};

  if (data.lastResetDate !== today) {
    await resetRoomForNewDay(roomRef);
  }
}

async function joinRoom() {
  try {
    if (currentUser) {
      showMessage("আপনি ইতিমধ্যে একটি Room-এ আছেন।");
      return;
    }

    const name = getEl("nameInput")?.value.trim();
    const role = getEl("roleInput")?.value;
    const roomKey = getEl("roomInput")?.value;
    const adminKey = getEl("adminKeyInput")?.value.trim() || "";

    if (!name) return showMessage("দয়া করে আপনার নাম লিখুন।");
    if (!roomIds[roomKey]) return showMessage("সঠিক Prayer Room নির্বাচন করুন।");

    if (role === "admin" && adminKey !== ADMIN_SECRET_KEY) {
      showMessage("Invalid Admin Key ❌");
      return;
    }

    const roomId = roomIds[roomKey];
    const roomRef = db.collection("rooms").doc(roomId);

    const firstSnapshot = await roomRef.get();

    if (!firstSnapshot.exists) {
      await roomRef.set({
        name: roomNames[roomKey],
        online: 0,
        locked: false,
        roomActive: false,
        announcement: null,
        lastResetDate: getIndiaDateKey(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    await ensureDailyReset(roomRef);

    const roomSnapshot = await roomRef.get();
    const roomData = roomSnapshot.data() || {};

    roomLocked = roomData.locked === true;

    if (role !== "admin") {
      if (roomData.roomActive !== true) {
        showMessage("Admin এখনও এই Prayer Room শুরু করেননি।");
        return;
      }

      if (roomLocked) {
        showMessage("Room locked আছে। Admin unlock করলে Join করা যাবে।");
        return;
      }
    }

    if (role === "admin") {
      await roomRef.set(
        {
          roomActive: true,
          locked: false,
          lastResetDate: getIndiaDateKey(),
          startedAt: firebase.firestore.FieldValue.serverTimestamp(),
          endedAt: null
        },
        { merge: true }
      );
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
      roomId
    };

    await roomRef
      .collection("participants")
      .doc(currentUser.id)
      .set(
        {
          name,
          role,
          roomKey,
          roomId,
          micOn,
          handRaised,
          allowedToSpeak,
          online: true,
          joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );

    showRoomUI(role);
    updateRoomTitle();
    updateRoleBadge();
    updateMicUI();
    updateHandUI();
    updateLockUI();
    updateUserStatus(1);

    listenRoom(roomRef);
    listenParticipants(roomRef);
    listenSelf(roomRef);
    listenMessages(roomRef);

    await connectLiveKit(roomId, name, role);
  } catch (error) {
    console.error("Join error:", error);
    showMessage(`Join error: ${error.message}`);
  }
}

async function connectLiveKit(roomName, participantName, role) {
  try {
    if (!window.LivekitClient) {
      throw new Error("LiveKit Client load হয়নি। index.html check করুন।");
    }

    const response = await fetch(TOKEN_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, participantName, role })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(data.details || data.error || "Token পাওয়া যায়নি।");
    }

    const { Room, RoomEvent, Track } = window.LivekitClient;

    lkRoom = new Room({
      adaptiveStream: true,
      dynacast: true
    });

    lkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio || track.kind === "audio") {
        const audio = track.attach();

        audio.autoplay = true;
        audio.playsInline = true;
        audio.dataset.livekitAudio = "true";
        audio.style.display = "none";

        document.body.appendChild(audio);
        audio.play().catch(() => {});
      }
    });

    lkRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach().forEach((element) => element.remove());
    });

    lkRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const identities = new Set(
        speakers.map((participant) => participant.identity)
      );

      document
        .querySelectorAll(".participant-item[data-livekit-identity]")
        .forEach((element) => {
          element.classList.toggle(
            "speaking",
            identities.has(element.dataset.livekitIdentity)
          );
        });
    });

    await lkRoom.connect(LIVEKIT_URL, data.token);
    await lkRoom.startAudio().catch(() => {});
    await lkRoom.localParticipant.setMicrophoneEnabled(micOn);

    await db
      .collection("rooms")
      .doc(roomName)
      .collection("participants")
      .doc(currentUser.id)
      .update({
        micOn,
        allowedToSpeak,
        livekitIdentity: data.identity || ""
      });

    updateMicUI();
    showMessage("Audio Room Connected ✅");
  } catch (error) {
    console.error("Audio connect error:", error);
    showMessage(`Audio connect error: ${error.message}`);
  }
}

function listenRoom(roomRef) {
  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = roomRef.onSnapshot(async (snapshot) => {
    if (!snapshot.exists || !currentUser) return;

    const data = snapshot.data();

    roomLocked = data.locked === true;
    updateLockUI();
    updateUserStatus(data.online || 0);

    const textEl = getEl("announcementText");
    const metaEl = getEl("announcementMeta");

    if (data.announcement?.text) {
      if (textEl) textEl.textContent = data.announcement.text;
      if (metaEl) {
        metaEl.textContent = `— ${data.announcement.author || "Admin"}`;
      }
    } else {
      if (textEl) textEl.textContent = "এখনো কোনো announcement নেই।";
      if (metaEl) metaEl.textContent = "— Admin";
    }

    if (data.startedAt) startMeetingTimer(data.startedAt);

    if (
      data.roomActive === false &&
      currentUser.role !== "admin" &&
      !roomClosing
    ) {
      roomClosing = true;
      showMessage("Admin Room বন্ধ করেছেন। আপনি Room থেকে বেরিয়ে যাচ্ছেন।");

      await leaveRoom({
        auto: true,
        closeRoom: false
      });
    }
  });
}

function listenSelf(roomRef) {
  if (unsubscribeSelf) unsubscribeSelf();

  unsubscribeSelf = roomRef
    .collection("participants")
    .doc(currentUser.id)
    .onSnapshot(async (snapshot) => {
      if (!currentUser) return;

      if (!snapshot.exists) {
        if (!roomClosing) {
          roomClosing = true;
          showMessage("Admin আপনাকে Room থেকে সরিয়ে দিয়েছেন।");

          await leaveRoom({
            auto: true,
            closeRoom: false,
            deleteParticipant: false
          });
        }
        return;
      }

      const data = snapshot.data();

      handRaised = data.handRaised === true;
      allowedToSpeak =
        data.allowedToSpeak === true || currentUser.role === "admin";

      const newMicState = data.micOn === true && allowedToSpeak;

      if (micOn !== newMicState) {
        micOn = newMicState;

        if (lkRoom?.localParticipant) {
          try {
            await lkRoom.localParticipant.setMicrophoneEnabled(micOn);
          } catch (error) {
            console.error(error);
            showMessage("Microphone permission Allow করুন।");
          }
        }
      }

      updateMicUI();
      updateHandUI();
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
      const raisedHandsCount = getEl("raisedHandsCount");

      await roomRef.set({ online: snapshot.size }, { merge: true });

      if (!participantsList || !raisedHandsList) return;

      participantsList.innerHTML = "";
      raisedHandsList.innerHTML = "";

      let raisedCount = 0;

      snapshot.forEach((documentSnapshot) => {
        const participant = documentSnapshot.data();
        const name = escapeHTML(participant.name || "Unknown");
        const roleIcon = participant.role === "admin" ? "👑" : "👤";
        const identity = escapeHTML(participant.livekitIdentity || "");

        const removeButton =
          currentUser?.role === "admin" &&
          documentSnapshot.id !== currentUser.id
            ? `<button type="button" onclick="removeParticipant('${documentSnapshot.id}')">Remove</button>`
            : "";

        participantsList.insertAdjacentHTML(
          "beforeend",
          `
            <div
              class="participant-item"
              data-livekit-identity="${identity}"
            >
              <div>
                <strong>${roleIcon} ${name}</strong>
                <span>
                  Mic: ${participant.micOn ? "ON 🎙️" : "Muted 🔇"} |
                  Hand: ${participant.handRaised ? "Raised ✋" : "Down"}
                </span>
              </div>
              ${removeButton}
            </div>
          `
        );

        if (participant.handRaised) {
          raisedCount += 1;

          const allowButton =
            currentUser?.role === "admin"
              ? `<button type="button" onclick="allowSpeakerById('${documentSnapshot.id}')">🎤 Allow Speak</button>`
              : "";

          raisedHandsList.insertAdjacentHTML(
            "beforeend",
            `
              <div class="participant-item">
                <div>
                  <strong>✋ ${name}</strong>
                  <span>Wants to speak</span>
                </div>
                ${allowButton}
              </div>
            `
          );
        }
      });

      if (snapshot.empty) participantsList.textContent = "No participants yet";
      if (raisedCount === 0) raisedHandsList.textContent = "No raised hands";
      if (raisedHandsCount) raisedHandsCount.textContent = String(raisedCount);

      updateUserStatus(snapshot.size);
    });
}

function listenMessages(roomRef) {
  if (unsubscribeMessages) unsubscribeMessages();

  unsubscribeMessages = roomRef
    .collection("messages")
    .orderBy("createdAt", "asc")
    .limitToLast(100)
    .onSnapshot((snapshot) => {
      const messagesList = getEl("messagesList");
      if (!messagesList) return;

      messagesList.innerHTML = "";

      if (snapshot.empty) {
        messagesList.textContent = "No messages yet";
        return;
      }

      snapshot.forEach((documentSnapshot) => {
        const message = documentSnapshot.data();
        const safeName = escapeHTML(message.name || "Member");
        const safeText = escapeHTML(message.text || "");
        const messageClass =
          message.role === "admin" ? "admin" : "member";
        const roleIcon = message.role === "admin" ? "👑" : "👤";

        messagesList.insertAdjacentHTML(
          "beforeend",
          `
            <div class="message ${messageClass}">
              <strong>${roleIcon} ${safeName}</strong>
              <div>${safeText}</div>
            </div>
          `
        );
      });

      messagesList.scrollTop = messagesList.scrollHeight;
    });
}

async function sendMessage() {
  try {
    if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");

    const input = getEl("messageInput");
    const text = input?.value.trim();

    if (!text) return;
    if (text.length > 500) {
      return showMessage("Message সর্বোচ্চ 500 characters হতে পারবে।");
    }

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("messages")
      .add({
        name: currentUser.name,
        role: currentUser.role,
        text,
        dateKey: getIndiaDateKey(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    input.value = "";
  } catch (error) {
    console.error(error);
    showMessage(`Message পাঠানো যায়নি: ${error.message}`);
  }
}

async function sendAnnouncement() {
  try {
    if (!isAdmin()) return;

    const input = getEl("announcementInput");
    const text = input?.value.trim();

    if (!text) return showMessage("Announcement লিখুন।");
    if (text.length > 500) {
      return showMessage("Announcement সর্বোচ্চ 500 characters হতে পারবে।");
    }

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .set(
        {
          announcement: {
            text,
            author: currentUser.name,
            dateKey: getIndiaDateKey(),
            createdAt: new Date().toISOString()
          }
        },
        { merge: true }
      );

    input.value = "";
    showMessage("Announcement সবার কাছে পাঠানো হয়েছে 📢");
  } catch (error) {
    console.error(error);
    showMessage(`Announcement পাঠানো যায়নি: ${error.message}`);
  }
}

async function clearAnnouncement() {
  if (!isAdmin()) return;

  await db
    .collection("rooms")
    .doc(currentUser.roomId)
    .set({ announcement: null }, { merge: true });
}

async function raiseHand() {
  try {
    if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");

    handRaised = !handRaised;

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("participants")
      .doc(currentUser.id)
      .update({ handRaised });

    updateHandUI();

    showMessage(
      handRaised ? "আপনার হাত Raise হয়েছে ✋" : "হাত নামানো হয়েছে।"
    );
  } catch (error) {
    console.error(error);
    showMessage(error.message);
  }
}

async function toggleMic() {
  try {
    if (!currentUser) return showMessage("আগে Prayer Room-এ Join করুন।");
    if (!allowedToSpeak) {
      return showMessage("Admin অনুমতি না দিলে Mic চালু হবে না।");
    }

    const newState = !micOn;

    if (lkRoom?.localParticipant) {
      await lkRoom.localParticipant.setMicrophoneEnabled(newState);
    }

    micOn = newState;

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("participants")
      .doc(currentUser.id)
      .update({ micOn });

    updateMicUI();
  } catch (error) {
    console.error(error);
    showMessage("Microphone permission Allow করুন।");
  }
}

function allowSpeaker() {
  showMessage("Raised Hands তালিকা থেকে Allow Speak চাপুন।");
}

async function allowSpeakerById(participantId) {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((documentSnapshot) => {
    const isSelected = documentSnapshot.id === participantId;
    const isAdminUser = documentSnapshot.id === currentUser.id;

    batch.update(documentSnapshot.ref, {
      micOn: isSelected || isAdminUser,
      allowedToSpeak: isSelected || isAdminUser,
      handRaised: false
    });
  });

  await batch.commit();
  showMessage("Speaker permission দেওয়া হয়েছে 🎤");
}

async function muteAll() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  snapshot.forEach((documentSnapshot) => {
    const isAdminUser = documentSnapshot.id === currentUser.id;

    batch.update(documentSnapshot.ref, {
      micOn: isAdminUser,
      allowedToSpeak: isAdminUser,
      handRaised: false
    });
  });

  await batch.commit();
  showMessage("Admin ছাড়া সবাইকে mute করা হয়েছে 🔇");
}

async function lockRoom() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.get();
  const newLocked = !(snapshot.data()?.locked === true);

  await roomRef.set({ locked: newLocked }, { merge: true });

  roomLocked = newLocked;
  updateLockUI();

  showMessage(
    newLocked ? "Room locked হয়েছে 🔒" : "Room unlocked হয়েছে 🔓"
  );
}

async function removeParticipant(participantId) {
  if (!isAdmin()) return;
  if (!participantId || participantId === currentUser.id) return;

  const participantRef = db
    .collection("rooms")
    .doc(currentUser.roomId)
    .collection("participants")
    .doc(participantId);

  const snapshot = await participantRef.get();

  if (!snapshot.exists) return showMessage("এই Member আর Room-এ নেই।");

  const name = snapshot.data().name || "Member";

  if (!window.confirm(`${name}-কে Room থেকে Remove করবেন?`)) return;

  await participantRef.delete();
  showMessage(`${name} Room থেকে Remove হয়েছে।`);
}

async function cleanOldEntries() {
  if (!isAdmin()) return;

  const roomRef = db.collection("rooms").doc(currentUser.roomId);
  const snapshot = await roomRef.collection("participants").get();
  const batch = db.batch();

  let count = 0;

  snapshot.forEach((documentSnapshot) => {
    if (documentSnapshot.id !== currentUser.id) {
      batch.delete(documentSnapshot.ref);
      count += 1;
    }
  });

  if (count === 0) return showMessage("পরিষ্কার করার মতো পুরনো entry নেই।");

  await batch.commit();
  showMessage(`${count}টি entry পরিষ্কার হয়েছে ✅`);
}

async function endMeeting() {
  if (!isAdmin()) return;

  if (
    !window.confirm(
      "Meeting শেষ করলে সবাই Room থেকে বের হয়ে যাবে। নিশ্চিত?"
    )
  ) {
    return;
  }

  const roomRef = db.collection("rooms").doc(currentUser.roomId);

  await roomRef.set(
    {
      roomActive: false,
      locked: true,
      online: 0,
      announcement: null,
      endedAt: firebase.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await deleteCollection(
    roomRef
      .collection("participants")
      .orderBy(firebase.firestore.FieldPath.documentId())
  );

  showMessage("Meeting শেষ হয়েছে।");

  await leaveRoom({
    auto: true,
    closeRoom: false,
    deleteParticipant: false
  });
}

async function leaveRoom(options = {}) {
  const {
    auto = false,
    closeRoom = true,
    deleteParticipant = true
  } = options;

  if (!currentUser) return;

  const leavingUser = { ...currentUser };
  const roomRef = db.collection("rooms").doc(leavingUser.roomId);

  try {
    roomClosing = true;

    if (deleteParticipant) {
      await roomRef
        .collection("participants")
        .doc(leavingUser.id)
        .delete()
        .catch(() => {});
    }

    if (leavingUser.role === "admin" && closeRoom) {
      await roomRef.set(
        {
          roomActive: false,
          locked: true,
          online: 0,
          endedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      await deleteCollection(
        roomRef
          .collection("participants")
          .orderBy(firebase.firestore.FieldPath.documentId())
      );
    }

    if (lkRoom) {
      lkRoom.disconnect();
      lkRoom = null;
    }

    document
      .querySelectorAll("audio[data-livekit-audio='true']")
      .forEach((element) => element.remove());

    stopListeners();
    stopMeetingTimer();

    currentUser = null;
    micOn = false;
    handRaised = false;
    allowedToSpeak = false;
    roomLocked = false;
    roomClosing = false;
    meetingStartedAt = null;

    showHomeUI();
    updateMicUI();
    updateHandUI();

    if (!auto) showMessage("Room থেকে বেরিয়ে গেছেন।");
  } catch (error) {
    console.error(error);
    showMessage(`Leave error: ${error.message}`);
  }
}

document.addEventListener("keydown", (event) => {
  const input = getEl("messageInput");

  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    document.activeElement === input
  ) {
    event.preventDefault();
    sendMessage();
  }
});

window.addEventListener("pagehide", () => {
  if (lkRoom) lkRoom.disconnect();
});

window.joinRoom = joinRoom;
window.sendMessage = sendMessage;
window.sendAnnouncement = sendAnnouncement;
window.clearAnnouncement = clearAnnouncement;
window.raiseHand = raiseHand;
window.toggleMic = toggleMic;
window.allowSpeaker = allowSpeaker;
window.allowSpeakerById = allowSpeakerById;
window.muteAll = muteAll;
window.lockRoom = lockRoom;
window.removeParticipant = removeParticipant;
window.cleanOldEntries = cleanOldEntries;
window.endMeeting = endMeeting;
window.leaveRoom = leaveRoom;
