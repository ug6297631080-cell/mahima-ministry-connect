let currentUser = null;
let micOn = false;
let handRaised = false;
let roomJoined = false;

const roomNames = {
  "morning-prayer": "Morning Prayer Room",
  "sunday-service": "Sunday Service Room",
  "bible-study": "Bible Study Room"
};

function joinRoom() {
  const name = document.getElementById("nameInput").value.trim();
  const role = document.getElementById("roleInput").value;
  const room = document.getElementById("roomInput").value;

  if (!name) {
    alert("দয়া করে আপনার নাম লিখুন");
    return;
  }

  currentUser = { name, role, room };
  roomJoined = true;
  micOn = role === "admin";
  handRaised = false;

  document.getElementById("roomPanel").classList.remove("hidden");
  document.getElementById("roomTitle").innerText = roomNames[room];
  document.getElementById("userStatus").innerText =
    `${name} joined as ${role}. Mic is ${micOn ? "ON" : "Muted"}.`;

  if (role === "admin") {
    document.getElementById("adminPanel").classList.remove("hidden");
  } else {
    document.getElementById("adminPanel").classList.add("hidden");
  }
}

function raiseHand() {
  if (!roomJoined) {
    alert("আগে Prayer Room-এ Join করুন");
    return;
  }

  handRaised = !handRaised;

  document.getElementById("userStatus").innerText =
    `${currentUser.name} joined as ${currentUser.role}. Hand is ${
      handRaised ? "Raised ✋" : "Down"
    }. Mic is ${micOn ? "ON" : "Muted"}.`;
}

function toggleMic() {
  if (!roomJoined) {
    alert("আগে Prayer Room-এ Join করুন");
    return;
  }

  if (currentUser.role !== "admin") {
    alert("Member-এর Mic Admin permission ছাড়া চালু হবে না");
    return;
  }

  micOn = !micOn;

  document.getElementById("userStatus").innerText =
    `${currentUser.name} joined as ${currentUser.role}. Mic is ${
      micOn ? "ON" : "Muted"
    }.`;
}

function leaveRoom() {
  currentUser = null;
  micOn = false;
  handRaised = false;
  roomJoined = false;

  document.getElementById("roomPanel").classList.add("hidden");
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("userStatus").innerText = "Not connected";
}
