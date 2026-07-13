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
}function startMeetingTimer(
  startValue
) {
  stopMeetingTimer();

  if (!startValue) {
    return;
  }

  const startDate =
    typeof startValue.toDate ===
    "function"
      ? startValue.toDate()
      : new Date(startValue);

  if (
    Number.isNaN(
      startDate.getTime()
    )
  ) {
    return;
  }

  meetingStartedAt =
    startDate;

  const render = () => {
    const timer =
      getEl("meetingTimer");

    if (
      !timer ||
      !meetingStartedAt
    ) {
      return;
    }

    const total =
      Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            meetingStartedAt.getTime()
          ) / 1000
        )
      );

    const hours =
      String(
        Math.floor(total / 3600)
      ).padStart(2, "0");

    const minutes =
      String(
        Math.floor(
          (total % 3600) / 60
        )
      ).padStart(2, "0");

    const seconds =
      String(
        total % 60
      ).padStart(2, "0");

    timer.textContent =
      `${hours}:${minutes}:${seconds}`;
  };

  render();

  meetingTimerId =
    setInterval(
      render,
      1000
    );
}

async function deleteCollection(
  query,
  batchLimit = 400
) {
  while (true) {
    const snapshot =
      await query
        .limit(batchLimit)
        .get();

    if (snapshot.empty) {
      return;
    }

    const batch =
      db.batch();

    snapshot.docs.forEach(
      (doc) => {
        batch.delete(doc.ref);
      }
    );

    await batch.commit();

    if (
      snapshot.size <
      batchLimit
    ) {
      return;
    }
  }
}

async function resetRoomForNewDay(
  roomRef
) {
  await Promise.all([
    deleteCollection(
      roomRef
        .collection(
          "participants"
        )
        .orderBy(
          firebase.firestore
            .FieldPath
            .documentId()
        )
    ),

    deleteCollection(
      roomRef
        .collection(
          "messages"
        )
        .orderBy(
          firebase.firestore
            .FieldPath
            .documentId()
        )
    )
  ]);

  await roomRef.set(
    {
      online: 0,

      locked: false,

      roomActive: false,

      announcement: null,

      lastResetDate:
        getIndiaDateKey(),

      resetAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp()
    },
    {
      merge: true
    }
  );
}

async function ensureDailyReset(
  roomRef
) {
  const today =
    getIndiaDateKey();

  const snapshot =
    await roomRef.get();

  const data =
    snapshot.exists
      ? snapshot.data()
      : {};

  if (
    data.lastResetDate !==
    today
  ) {
    await resetRoomForNewDay(
      roomRef
    );
  }
}async function joinRoom() {
  try {
    if (currentUser) {
      showMessage(
        "আপনি ইতিমধ্যে একটি Room-এ আছেন।"
      );const audioDebugLogs = [];

function audioDebug(message, data = null) {
  const time = new Date().toLocaleTimeString();

  const line = data
    ? `[${time}] ${message}: ${JSON.stringify(data)}`
    : `[${time}] ${message}`;

  audioDebugLogs.push(line);

  if (audioDebugLogs.length > 60) {
    audioDebugLogs.shift();
  }

  console.log("[Mahima Audio Debug]", message, data || "");
  renderAudioDebug();
}

function createAudioDebugPanel() {
  if (getEl("audioDebugPanel")) return;

  const panel = document.createElement("section");

  panel.id = "audioDebugPanel";
  panel.className = "glass-card";
  panel.style.margin = "12px";
  panel.style.padding = "14px";
  panel.style.display = "none";

  panel.innerHTML = `
    <h3 style="margin-bottom:10px;">🛠 Audio Debug</h3>

    <div
      id="audioDebugContent"
      style="
        max-height:260px;
        overflow:auto;
        white-space:pre-wrap;
        word-break:break-word;
        font-family:monospace;
        font-size:11px;
        line-height:1.5;
        background:rgba(0,0,0,.35);
        padding:10px;
        border-radius:12px;
      "
    ></div>

    <button
      type="button"
      onclick="copyAudioDebugReport()"
      style="margin-top:10px;width:100%;"
    >
      📋 Copy Debug Report
    </button>
  `;

  getEl("roomPanel")?.appendChild(panel);
}

function renderAudioDebug() {
  const content = getEl("audioDebugContent");

  if (content) {
    content.textContent = audioDebugLogs.join("\n");
    content.scrollTop = content.scrollHeight;
  }
}

function showAudioDebugPanel() {
  createAudioDebugPanel();

  const panel = getEl("audioDebugPanel");

  if (panel) {
    panel.style.display = "block";
    panel.scrollIntoView({ behavior: "smooth" });
  }

  renderAudioDebug();
}

async function copyAudioDebugReport() {
  const report = audioDebugLogs.join("\n");

  try {
    await navigator.clipboard.writeText(report);
    showMessage("Debug report copy হয়েছে ✅");
  } catch {
    showMessage(report);
  }
}
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
}async function connectLiveKit(roomName, participantName, role) {
  createAudioDebugPanel();

  try {
    audioDebug("CONNECT_START", {
      roomName,
      participantName,
      role,
      online: navigator.onLine
    });

    if (!window.LivekitClient) {
      throw new Error("LiveKit Client load হয়নি");
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

    audioDebug("TOKEN_SERVER_RESPONSE", {
      status: response.status,
      ok: response.ok
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(
        data.details || data.error || "Token পাওয়া যায়নি"
      );
    }

    const {
      Room,
      RoomEvent,
      Track
    } = window.LivekitClient;

    lkRoom = new Room({
      adaptiveStream: true,
      dynacast: true
    });

    lkRoom.on(RoomEvent.Connected, () => {
      audioDebug("ROOM_CONNECTED", {
        state: lkRoom.state,
        canPlaybackAudio: lkRoom.canPlaybackAudio
      });
    });

    lkRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
      audioDebug("CONNECTION_STATE", { state });
    });

    lkRoom.on(RoomEvent.SignalConnected, () => {
      audioDebug("SIGNAL_CONNECTED");
    });

    lkRoom.on(RoomEvent.ParticipantConnected, (participant) => {
      audioDebug("REMOTE_PARTICIPANT_CONNECTED", {
        identity: participant.identity,
        name: participant.name
      });
    });

    lkRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
      audioDebug("REMOTE_PARTICIPANT_DISCONNECTED", {
        identity: participant.identity
      });
    });

    lkRoom.on(
      RoomEvent.LocalTrackPublished,
      (publication) => {
        audioDebug("LOCAL_TRACK_PUBLISHED", {
          kind: publication.kind,
          source: publication.source,
          muted: publication.isMuted
        });
      }
    );

    lkRoom.on(
      RoomEvent.TrackPublished,
      (publication, participant) => {
        audioDebug("REMOTE_TRACK_PUBLISHED", {
          participant: participant.identity,
          kind: publication.kind,
          source: publication.source,
          muted: publication.isMuted
        });
      }
    );

    lkRoom.on(
      RoomEvent.TrackSubscribed,
      (track, publication, participant) => {
        audioDebug("TRACK_SUBSCRIBED", {
          participant: participant.identity,
          kind: track.kind,
          source: publication.source
        });

        if (
          track.kind === Track.Kind.Audio ||
          track.kind === "audio"
        ) {
          const audio = track.attach();

          audio.autoplay = true;
          audio.playsInline = true;
          audio.muted = false;
          audio.volume = 1;
          audio.dataset.livekitAudio = "true";
          audio.style.display = "none";

          document.body.appendChild(audio);

          audio
            .play()
            .then(() => {
              audioDebug("REMOTE_AUDIO_PLAYING", {
                participant: participant.identity
              });
            })
            .catch((error) => {
              audioDebug("REMOTE_AUDIO_PLAY_FAILED", {
                name: error.name,
                message: error.message,
                canPlaybackAudio: lkRoom.canPlaybackAudio
              });

              showAudioDebugPanel();
            });
        }
      }
    );

    lkRoom.on(
      RoomEvent.TrackSubscriptionFailed,
      (trackSid, participant) => {
        audioDebug("TRACK_SUBSCRIPTION_FAILED", {
          trackSid,
          participant: participant.identity
        });

        showAudioDebugPanel();
      }
    );

    lkRoom.on(
      RoomEvent.AudioPlaybackStatusChanged,
      () => {
        audioDebug("AUDIO_PLAYBACK_STATUS", {
          canPlaybackAudio: lkRoom.canPlaybackAudio
        });

        if (!lkRoom.canPlaybackAudio) {
          showAudioDebugPanel();
        }
      }
    );

    lkRoom.on(RoomEvent.MediaDevicesError, (error) => {
      audioDebug("MEDIA_DEVICE_ERROR", {
        name: error.name,
        message: error.message
      });

      showAudioDebugPanel();
    });

    lkRoom.on(RoomEvent.LocalAudioSilenceDetected, () => {
      audioDebug("LOCAL_AUDIO_SILENCE_DETECTED");
      showAudioDebugPanel();
    });

    lkRoom.on(RoomEvent.Reconnecting, () => {
      audioDebug("RECONNECTING");
    });

    lkRoom.on(RoomEvent.Reconnected, () => {
      audioDebug("RECONNECTED");
    });

    lkRoom.on(RoomEvent.Disconnected, (reason) => {
      audioDebug("ROOM_DISCONNECTED", {
        reason: String(reason)
      });

      showAudioDebugPanel();
    });

    audioDebug("CONNECTING_TO_LIVEKIT", {
      url: LIVEKIT_URL
    });

    await lkRoom.connect(LIVEKIT_URL, data.token);

    audioDebug("CONNECT_PROMISE_RESOLVED", {
      state: lkRoom.state,
      remoteParticipants: lkRoom.remoteParticipants.size
    });

    try {
      await lkRoom.startAudio();

      audioDebug("START_AUDIO_SUCCESS", {
        canPlaybackAudio: lkRoom.canPlaybackAudio
      });
    } catch (error) {
      audioDebug("START_AUDIO_FAILED", {
        name: error.name,
        message: error.message,
        canPlaybackAudio: lkRoom.canPlaybackAudio
      });

      showAudioDebugPanel();
    }

    audioDebug("SETTING_MIC", {
      enabled: micOn
    });

    await lkRoom.localParticipant.setMicrophoneEnabled(micOn);

    const micPublication =
      lkRoom.localParticipant.getTrackPublication(
        Track.Source.Microphone
      );

    audioDebug("MIC_STATE_AFTER_ENABLE", {
      micOn,
      publicationExists: Boolean(micPublication),
      muted: micPublication?.isMuted ?? null,
      trackSid: micPublication?.trackSid ?? null
    });

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

    audioDebug("CONNECT_COMPLETE", {
      identity: data.identity || "",
      canPlaybackAudio: lkRoom.canPlaybackAudio
    });

    showMessage("Audio Room Connected ✅");
  } catch (error) {
    console.error("Audio connect error:", error);

    audioDebug("CONNECT_FATAL_ERROR", {
      name: error.name,
      message: error.message,
      stack: error.stack || ""
    });

    showAudioDebugPanel();

    showMessage(`Audio connect error: ${error.message}`);
  }
}

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
}function listenRoom(roomRef) {
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
}function listenParticipants(roomRef) {
  if (unsubscribeParticipants) {
    unsubscribeParticipants();
  }

  unsubscribeParticipants =
    roomRef
      .collection("participants")
      .orderBy("name")
      .onSnapshot(
        async (snapshot) => {
          const participantsList =
            getEl("participantsList");

          const raisedHandsList =
            getEl("raisedHandsList");

          const raisedHandsCount =
            getEl("raisedHandsCount");

          await roomRef.set(
            {
              online: snapshot.size
            },
            {
              merge: true
            }
          );

          if (
            !participantsList ||
            !raisedHandsList
          ) {
            return;
          }

          participantsList.innerHTML =
            "";

          raisedHandsList.innerHTML =
            "";

          let raisedCount = 0;

          snapshot.forEach(
            (documentSnapshot) => {
              const participant =
                documentSnapshot.data();

              const name =
                escapeHTML(
                  participant.name ||
                    "Unknown"
                );

              const roleIcon =
                participant.role ===
                "admin"
                  ? "👑"
                  : "👤";

              const identity =
                escapeHTML(
                  participant
                    .livekitIdentity ||
                    ""
                );

              const removeButton =
                currentUser?.role ===
                  "admin" &&
                documentSnapshot.id !==
                  currentUser.id
                  ? `
                    <button
                      type="button"
                      onclick="removeParticipant('${documentSnapshot.id}')"
                    >
                      Remove
                    </button>
                  `
                  : "";

              participantsList
                .insertAdjacentHTML(
                  "beforeend",
                  `
                    <div
                      class="participant-item"
                      data-livekit-identity="${identity}"
                    >
                      <div>
                        <strong>
                          ${roleIcon}
                          ${name}
                        </strong>

                        <span>
                          Mic:
                          ${
                            participant.micOn
                              ? "ON 🎙️"
                              : "Muted 🔇"
                          }
                          |
                          Hand:
                          ${
                            participant
                              .handRaised
                              ? "Raised ✋"
                              : "Down"
                          }
                        </span>
                      </div>

                      ${removeButton}
                    </div>
                  `
                );

              if (
                participant.handRaised
              ) {
                raisedCount += 1;

                const allowButton =
                  currentUser?.role ===
                  "admin"
                    ? `
                      <button
                        type="button"
                        onclick="allowSpeakerById('${documentSnapshot.id}')"
                      >
                        🎤 Allow Speak
                      </button>
                    `
                    : "";

                raisedHandsList
                  .insertAdjacentHTML(
                    "beforeend",
                    `
                      <div class="participant-item">
                        <div>
                          <strong>
                            ✋ ${name}
                          </strong>

                          <span>
                            Wants to speak
                          </span>
                        </div>

                        ${allowButton}
                      </div>
                    `
                  );
              }
            }
          );

          if (snapshot.empty) {
            participantsList.textContent =
              "No participants yet";
          }

          if (raisedCount === 0) {
            raisedHandsList.textContent =
              "No raised hands";
          }

          if (raisedHandsCount) {
            raisedHandsCount.textContent =
              String(raisedCount);
          }

          updateUserStatus(
            snapshot.size
          );
        },

        (error) => {
          console.error(
            "Participants listener error:",
            error
          );
        }
      );
}function listenMessages(roomRef) {
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  unsubscribeMessages =
    roomRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .limitToLast(100)
      .onSnapshot(
        (snapshot) => {
          const messagesList =
            getEl("messagesList");

          if (!messagesList) {
            return;
          }

          messagesList.innerHTML = "";

          if (snapshot.empty) {
            messagesList.textContent =
              "No messages yet";
            return;
          }

          snapshot.forEach(
            (documentSnapshot) => {
              const message =
                documentSnapshot.data();

              const safeName =
                escapeHTML(
                  message.name ||
                    "Member"
                );

              const safeText =
                escapeHTML(
                  message.text ||
                    ""
                );

              const messageClass =
                message.role === "admin"
                  ? "admin"
                  : "member";

              const roleIcon =
                message.role === "admin"
                  ? "👑"
                  : "👤";

              messagesList
                .insertAdjacentHTML(
                  "beforeend",
                  `
                    <div class="message ${messageClass}">
                      <strong>
                        ${roleIcon}
                        ${safeName}
                      </strong>

                      <div>
                        ${safeText}
                      </div>
                    </div>
                  `
                );
            }
          );

          messagesList.scrollTop =
            messagesList.scrollHeight;
        },

        (error) => {
          console.error(
            "Messages listener error:",
            error
          );

          showMessage(
            "Messaging permission error. Firestore Rules check করুন।"
          );
        }
      );
}

async function sendMessage() {
  try {
    if (!currentUser) {
      showMessage(
        "আগে Prayer Room-এ Join করুন।"
      );
      return;
    }

    const input =
      getEl("messageInput");

    const text =
      input?.value.trim();

    if (!text) {
      return;
    }

    if (text.length > 500) {
      showMessage(
        "Message সর্বোচ্চ 500 characters হতে পারবে।"
      );
      return;
    }

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("messages")
      .add({
        name:
          currentUser.name,

        role:
          currentUser.role,

        text,

        dateKey:
          getIndiaDateKey(),

        createdAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      });

    input.value = "";

  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    showMessage(
      `Message পাঠানো যায়নি: ${error.message}`
    );
  }
}

async function sendAnnouncement() {
  try {
    if (!isAdmin()) {
      return;
    }

    const input =
      getEl("announcementInput");

    const text =
      input?.value.trim();

    if (!text) {
      showMessage(
        "Announcement লিখুন।"
      );
      return;
    }

    if (text.length > 500) {
      showMessage(
        "Announcement সর্বোচ্চ 500 characters হতে পারবে।"
      );
      return;
    }

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .set(
        {
          announcement: {
            text,

            author:
              currentUser.name,

            dateKey:
              getIndiaDateKey(),

            createdAt:
              new Date()
                .toISOString()
          }
        },
        {
          merge: true
        }
      );

    input.value = "";

    showMessage(
      "Announcement সবার কাছে পাঠানো হয়েছে 📢"
    );

  } catch (error) {
    console.error(
      "Announcement error:",
      error
    );

    showMessage(
      `Announcement পাঠানো যায়নি: ${error.message}`
    );
  }
}

async function clearAnnouncement() {
  if (!isAdmin()) {
    return;
  }

  try {
    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .set(
        {
          announcement: null
        },
        {
          merge: true
        }
      );

    showMessage(
      "Announcement clear হয়েছে।"
    );

  } catch (error) {
    console.error(
      "Clear announcement error:",
      error
    );

    showMessage(
      error.message
    );
  }
}async function raiseHand() {
  try {
    if (!currentUser) {
      showMessage(
        "আগে Prayer Room-এ Join করুন।"
      );
      return;
    }

    handRaised = !handRaised;

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("participants")
      .doc(currentUser.id)
      .update({
        handRaised
      });

    updateHandUI();

    showMessage(
      handRaised
        ? "আপনার হাত Raise হয়েছে ✋"
        : "হাত নামানো হয়েছে।"
    );

  } catch (error) {
    console.error(
      "Raise hand error:",
      error
    );

    showMessage(
      error.message
    );
  }
}

async function toggleMic() {
  try {
    if (!currentUser) {
      showMessage(
        "আগে Prayer Room-এ Join করুন।"
      );
      return;
    }

    if (!allowedToSpeak) {
      showMessage(
        "Admin অনুমতি না দিলে Mic চালু হবে না।"
      );
      return;
    }

    const newState =
      !micOn;

    if (
      lkRoom &&
      lkRoom.localParticipant
    ) {
      await lkRoom
        .localParticipant
        .setMicrophoneEnabled(
          newState
        );
    }

    micOn = newState;

    await db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("participants")
      .doc(currentUser.id)
      .update({
        micOn
      });

    updateMicUI();

  } catch (error) {
    console.error(
      "Mic error:",
      error
    );

    showMessage(
      "Microphone permission Allow করুন।"
    );
  }
}

function allowSpeaker() {
  showMessage(
    "Raised Hands তালিকা থেকে Allow Speak চাপুন।"
  );
}

async function allowSpeakerById(
  participantId
) {
  if (!isAdmin()) {
    return;
  }

  try {
    const roomRef =
      db
        .collection("rooms")
        .doc(currentUser.roomId);

    const snapshot =
      await roomRef
        .collection("participants")
        .get();

    const batch =
      db.batch();

    snapshot.forEach(
      (documentSnapshot) => {
        const isSelected =
          documentSnapshot.id ===
          participantId;

        const isAdminUser =
          documentSnapshot.id ===
          currentUser.id;

        batch.update(
          documentSnapshot.ref,
          {
            micOn:
              isSelected ||
              isAdminUser,

            allowedToSpeak:
              isSelected ||
              isAdminUser,

            handRaised: false
          }
        );
      }
    );

    await batch.commit();

    showMessage(
      "Speaker permission দেওয়া হয়েছে 🎤"
    );

  } catch (error) {
    console.error(
      "Allow speaker error:",
      error
    );

    showMessage(
      error.message
    );
  }
}

async function muteAll() {
  if (!isAdmin()) {
    return;
  }

  try {
    const roomRef =
      db
        .collection("rooms")
        .doc(currentUser.roomId);

    const snapshot =
      await roomRef
        .collection("participants")
        .get();

    const batch =
      db.batch();

    snapshot.forEach(
      (documentSnapshot) => {
        const isAdminUser =
          documentSnapshot.id ===
          currentUser.id;

        batch.update(
          documentSnapshot.ref,
          {
            micOn:
              isAdminUser,

            allowedToSpeak:
              isAdminUser,

            handRaised: false
          }
        );
      }
    );

    await batch.commit();

    showMessage(
      "Admin ছাড়া সবাইকে mute করা হয়েছে 🔇"
    );

  } catch (error) {
    console.error(
      "Mute all error:",
      error
    );

    showMessage(
      error.message
    );
  }
}async function lockRoom() {
  if (!isAdmin()) {
    return;
  }

  try {
    const roomRef = db
      .collection("rooms")
      .doc(currentUser.roomId);

    const snapshot = await roomRef.get();

    const newLocked =
      !(snapshot.data()?.locked === true);

    await roomRef.set(
      {
        locked: newLocked
      },
      {
        merge: true
      }
    );

    roomLocked = newLocked;

    updateLockUI();

    showMessage(
      newLocked
        ? "Room locked হয়েছে 🔒"
        : "Room unlocked হয়েছে 🔓"
    );

  } catch (error) {
    console.error(
      "Lock room error:",
      error
    );

    showMessage(
      error.message
    );
  }
}

async function removeParticipant(
  participantId
) {
  if (!isAdmin()) {
    return;
  }

  if (
    !participantId ||
    participantId === currentUser.id
  ) {
    return;
  }

  try {
    const participantRef = db
      .collection("rooms")
      .doc(currentUser.roomId)
      .collection("participants")
      .doc(participantId);

    const snapshot =
      await participantRef.get();

    if (!snapshot.exists) {
      showMessage(
        "এই Member আর Room-এ নেই।"
      );
      return;
    }

    const name =
      snapshot.data().name ||
      "Member";

    const confirmed =
      window.confirm(
        `${name}-কে Room থেকে Remove করবেন?`
      );

    if (!confirmed) {
      return;
    }

    await participantRef.delete();

    showMessage(
      `${name} Room থেকে Remove হয়েছে।`
    );

  } catch (error) {
    console.error(
      "Remove participant error:",
      error
    );

    showMessage(
      error.message
    );
  }
}

async function cleanOldEntries() {
  if (!isAdmin()) {
    return;
  }

  try {
    const roomRef = db
      .collection("rooms")
      .doc(currentUser.roomId);

    const snapshot = await roomRef
      .collection("participants")
      .get();

    const batch = db.batch();

    let count = 0;

    snapshot.forEach(
      (documentSnapshot) => {
        if (
          documentSnapshot.id !==
          currentUser.id
        ) {
          batch.delete(
            documentSnapshot.ref
          );

          count += 1;
        }
      }
    );

    if (count === 0) {
      showMessage(
        "পরিষ্কার করার মতো পুরনো entry নেই।"
      );
      return;
    }

    await batch.commit();

    showMessage(
      `${count}টি entry পরিষ্কার হয়েছে ✅`
    );

  } catch (error) {
    console.error(
      "Clean entries error:",
      error
    );

    showMessage(
      error.message
    );
  }
}async function endMeeting() {
  if (!isAdmin()) {
    return;
  }

  const confirmed =
    window.confirm(
      "Meeting শেষ করলে সবাই Room থেকে বের হয়ে যাবে। নিশ্চিত?"
    );

  if (!confirmed) {
    return;
  }

  try {
    const roomRef = db
      .collection("rooms")
      .doc(currentUser.roomId);

    await roomRef.set(
      {
        roomActive: false,
        locked: true,
        online: 0,
        announcement: null,
        endedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      },
      {
        merge: true
      }
    );

    await deleteCollection(
      roomRef
        .collection("participants")
        .orderBy(
          firebase.firestore
            .FieldPath
            .documentId()
        )
    );

    showMessage(
      "Meeting শেষ হয়েছে।"
    );

    await leaveRoom({
      auto: true,
      closeRoom: false,
      deleteParticipant: false
    });

  } catch (error) {
    console.error(
      "End meeting error:",
      error
    );

    showMessage(
      error.message
    );
  }
}

async function leaveRoom(
  options = {}
) {
  const {
    auto = false,
    closeRoom = true,
    deleteParticipant = true
  } = options;

  if (!currentUser) {
    return;
  }

  const leavingUser = {
    ...currentUser
  };

  const roomRef = db
    .collection("rooms")
    .doc(leavingUser.roomId);

  try {
    roomClosing = true;

    if (deleteParticipant) {
      await roomRef
        .collection("participants")
        .doc(leavingUser.id)
        .delete()
        .catch(() => {});
    }

    if (
      leavingUser.role === "admin" &&
      closeRoom
    ) {
      await roomRef.set(
        {
          roomActive: false,
          locked: true,
          online: 0,
          endedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        },
        {
          merge: true
        }
      );

      await deleteCollection(
        roomRef
          .collection("participants")
          .orderBy(
            firebase.firestore
              .FieldPath
              .documentId()
          )
      );
    }

    if (lkRoom) {
      lkRoom.disconnect();
      lkRoom = null;
    }

    document
      .querySelectorAll(
        "audio[data-livekit-audio='true']"
      )
      .forEach(
        (element) =>
          element.remove()
      );

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

    if (!auto) {
      showMessage(
        "Room থেকে বেরিয়ে গেছেন।"
      );
    }

  } catch (error) {
    console.error(
      "Leave room error:",
      error
    );

    showMessage(
      `Leave error: ${error.message}`
    );
  }
}

document.addEventListener(
  "keydown",
  (event) => {
    const input =
      getEl("messageInput");

    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      document.activeElement ===
        input
    ) {
      event.preventDefault();

      sendMessage();
    }
  }
);

window.addEventListener(
  "pagehide",
  () => {
    if (lkRoom) {
      lkRoom.disconnect();
    }
  }
);

window.joinRoom =
  joinRoom;

window.sendMessage =
  sendMessage;

window.sendAnnouncement =
  sendAnnouncement;

window.clearAnnouncement =
  clearAnnouncement;

window.raiseHand =
  raiseHand;

window.toggleMic =
  toggleMic;

window.allowSpeaker =
  allowSpeaker;

window.allowSpeakerById =
  allowSpeakerById;

window.muteAll =
  muteAll;

window.lockRoom =
  lockRoom;

window.removeParticipant =
  removeParticipant;

window.cleanOldEntries =
  cleanOldEntries;

window.endMeeting =
  endMeeting;

window.leaveRoom =
  leaveRoom;
