const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

const app = express();

app.use(cors());
app.use(express.json());

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

app.get("/", (req, res) => {
  res.send("Mahima Ministry LiveKit Token Server is running");
});

app.post("/get-token", async (req, res) => {
  try {
    const { roomName, participantName, role } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        error: "roomName and participantName are required"
      });
    }

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return res.status(500).json({
        error: "LiveKit API Key or Secret missing"
      });
    }

    const participantIdentity =
      participantName.toLowerCase().replace(/[^a-z0-9]/g, "-") +
      "-" +
      Date.now();

    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity: participantIdentity,
        name: participantName
      }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canSubscribe: true,
      canPublish: role === "admin",
      canPublishData: true
    });

    const jwt = await token.toJwt();

    res.json({
      token: jwt,
      identity: participantIdentity
    });

  } catch (error) {
    console.error("Token error:", error);
    res.status(500).json({
      error: "Failed to create token"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Mahima token server running on port ${PORT}`);
});
