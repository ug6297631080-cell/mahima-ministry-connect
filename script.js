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
}async function joinRoom() {
  try {
    if (currentUser) {
      showMessage(
        "আপনি ইতিমধ্যে একটি Room-এ আছেন।"
      );
      return;
    }

    const name =
      getEl("nameInput")
        ?.value
        .trim();

    const role =
      getEl("roleInput")
        ?.value;

    const roomKey =
      getEl("roomInput")
        ?.value;

    const adminKey =
      getEl("adminKeyInput")
        ?.value
        .trim() || "";

    if (!name) {
      showMessage(
        "দয়া করে আপনার নাম লিখুন।"
      );
      return;
    }

    if (!roomIds[roomKey]) {
      showMessage(
        "সঠিক Prayer Room নির্বাচন করুন।"
      );
      return;
    }

    if (
      role === "admin" &&
      adminKey !==
        ADMIN_SECRET_KEY
    ) {
      showMessage(
        "Invalid Admin Key ❌"
      );
      return;
    }

    const roomId =
      roomIds[roomKey];

    const roomRef =
      db
        .collection("rooms")
        .doc(roomId);

    const firstSnapshot =
      await roomRef.get();

    if (!firstSnapshot.exists) {
      await roomRef.set({
        name:
          roomNames[roomKey],

        online: 0,

        locked: false,

        roomActive: false,

        announcement: null,

        lastResetDate:
          getIndiaDateKey(),

        createdAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      });
    }

    await ensureDailyReset(
      roomRef
    );

    const roomSnapshot =
      await roomRef.get();

    const roomData =
      roomSnapshot.data() || {};

    roomLocked =
      roomData.locked === true;

    if (role !== "admin") {
      if (
        roomData.roomActive !==
        true
      ) {
        showMessage(
          "Admin এখনও এই Prayer Room শুরু করেননি।"
        );
        return;
      }

      if (roomLocked) {
        showMessage(
          "Room locked আছে। Admin unlock করলে Join করা যাবে।"
        );
        return;
      }
    }

    if (role === "admin") {
      await roomRef.set(
        {
          roomActive: true,

          locked: false,

          lastResetDate:
            getIndiaDateKey(),

          startedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp(),

          endedAt: null
        },
        {
          merge: true
        }
      );

      roomLocked = false;
    }

    micOn =
      role === "admin";

    allowedToSpeak =
      role === "admin";

    handRaised = false;

    roomClosing = false;

    currentUser = {
      id:
        makeUserId(
          name,
          role
        ),

      name,

      role,

      roomKey,

      roomId
    };

    await roomRef
      .collection(
        "participants"
      )
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

          joinedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        },
        {
          merge: true
        }
      );

    showRoomUI(role);

    updateRoomTitle();

    updateRoleBadge();

    updateMicUI();

    updateHandUI();

    updateLockUI();

    updateUserStatus(1);

    listenRoom(roomRef);

    listenParticipants(
      roomRef
    );

    listenSelf(roomRef);

    listenMessages(roomRef);

    await connectLiveKit(
      roomId,
      name,
      role
    );

  } catch (error) {
    console.error(
      "Join error:",
      error
    );

    showMessage(
      `Join error: ${error.message}`
    );
  }
}async function connectLiveKit(
  roomName,
  participantName,
  role
) {
  try {
    if (!window.LivekitClient) {
      throw new Error(
        "LiveKit Client load হয়নি। index.html check করুন।"
      );
    }

    const response =
      await fetch(
        TOKEN_SERVER_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            roomName,
            participantName,
            role
          })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.token
    ) {
      throw new Error(
        data.details ||
        data.error ||
        "Token পাওয়া যায়নি।"
      );
    }

    const {
      Room,
      RoomEvent,
      Track
    } = window.LivekitClient;

    lkRoom =
      new Room({
        adaptiveStream: true,
        dynacast: true
      });

    lkRoom.on(
      RoomEvent.TrackSubscribed,
      (track) => {
        if (
          track.kind ===
            Track.Kind.Audio ||
          track.kind ===
            "audio"
        ) {
          const audio =
            track.attach();

          audio.autoplay = true;

          audio.playsInline = true;

          audio.dataset.livekitAudio =
            "true";

          audio.style.display =
            "none";

          document.body
            .appendChild(audio);

          audio.play()
            .catch(() => {});
        }
      }
    );

    lkRoom.on(
      RoomEvent.TrackUnsubscribed,
      (track) => {
        track
          .detach()
          .forEach(
            (element) =>
              element.remove()
          );
      }
    );

    lkRoom.on(
      RoomEvent
        .ActiveSpeakersChanged,
      (speakers) => {
        const identities =
          new Set(
            speakers.map(
              (participant) =>
                participant.identity
            )
          );

        document
          .querySelectorAll(
            ".participant-item[data-livekit-identity]"
          )
          .forEach(
            (element) => {
              element
                .classList
                .toggle(
                  "speaking",
                  identities.has(
                    element.dataset
                      .livekitIdentity
                  )
                );
            }
          );
      }
    );

    lkRoom.on(
      RoomEvent.Disconnected,
      () => {
        console.log(
          "LiveKit disconnected."
        );
      }
    );

    await lkRoom.connect(
      LIVEKIT_URL,
      data.token
    );

    await lkRoom
      .startAudio()
      .catch(() => {});

    await lkRoom
      .localParticipant
      .setMicrophoneEnabled(
        micOn
      );

    await db
      .collection("rooms")
      .doc(roomName)
      .collection(
        "participants"
      )
      .doc(currentUser.id)
      .update({
        micOn,

        allowedToSpeak,

        livekitIdentity:
          data.identity || ""
      });

    updateMicUI();

    showMessage(
      "Audio Room Connected ✅"
    );

  } catch (error) {
    console.error(
      "Audio connect error:",
      error
    );

    showMessage(
      `Audio connect error: ${error.message}`
    );
  }
}
function listenRoom(roomRef) {
  if (unsubscribeRoom) {
    unsubscribeRoom();
  }

  unsubscribeRoom =
    roomRef.onSnapshot(
      async (snapshot) => {
        if (
          !snapshot.exists ||
          !currentUser
        ) {
          return;
        }

        const data =
          snapshot.data();

        roomLocked =
          data.locked === true;

        updateLockUI();

        updateUserStatus(
          data.online || 0
        );

        const announcementText =
          getEl(
            "announcementText"
          );

        const announcementMeta =
          getEl(
            "announcementMeta"
          );

        if (
          data.announcement?.text
        ) {
          if (
            announcementText
          ) {
            announcementText
              .textContent =
              data.announcement.text;
          }

          if (
            announcementMeta
          ) {
            announcementMeta
              .textContent =
              `— ${
                data.announcement
                  .author ||
                "Admin"
              }`;
          }
        } else {
          if (
            announcementText
          ) {
            announcementText
              .textContent =
              "এখনো কোনো announcement নেই।";
          }

          if (
            announcementMeta
          ) {
            announcementMeta
              .textContent =
              "— Admin";
          }
        }

        if (data.startedAt) {
          startMeetingTimer(
            data.startedAt
          );
        }

        if (
          data.roomActive ===
            false &&
          currentUser.role !==
            "admin" &&
          !roomClosing
        ) {
          roomClosing = true;

          showMessage(
            "Admin Room বন্ধ করেছেন। আপনি Room থেকে বেরিয়ে যাচ্ছেন।"
          );

          await leaveRoom({
            auto: true,
            closeRoom: false
          });
        }
      },

      (error) => {
        console.error(
          "Room listener error:",
          error
        );
      }
    );
}

function listenSelf(roomRef) {
  if (unsubscribeSelf) {
    unsubscribeSelf();
  }

  unsubscribeSelf =
    roomRef
      .collection(
        "participants"
      )
      .doc(currentUser.id)
      .onSnapshot(
        async (snapshot) => {
          if (!currentUser) {
            return;
          }

          if (
            !snapshot.exists
          ) {
            if (!roomClosing) {
              roomClosing = true;

              showMessage(
                "Admin আপনাকে Room থেকে সরিয়ে দিয়েছেন।"
              );

              await leaveRoom({
                auto: true,
                closeRoom: false,
                deleteParticipant:
                  false
              });
            }

            return;
          }

          const data =
            snapshot.data();

          handRaised =
            data.handRaised ===
            true;

          allowedToSpeak =
            data.allowedToSpeak ===
              true ||
            currentUser.role ===
              "admin";

          const newMicState =
            data.micOn === true &&
            allowedToSpeak;

          if (
            micOn !==
            newMicState
          ) {
            micOn =
              newMicState;

            if (
              lkRoom
                ?.localParticipant
            ) {
              try {
                await lkRoom
                  .localParticipant
                  .setMicrophoneEnabled(
                    micOn
                  );
              } catch (error) {
                console.error(
                  "Mic sync error:",
                  error
                );

                showMessage(
                  "Microphone permission Allow করুন।"
                );
              }
            }
          }

          updateMicUI();

          updateHandUI();

          updateRoleBadge();
        },

        (error) => {
          console.error(
            "Self listener error:",
            error
          );
        }
      );
}
