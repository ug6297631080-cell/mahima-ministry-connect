const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

app.get("/", (req, res) => {
  res.send("Mahima Ministry LiveKit Token Server is running ✅");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    apiKeyLoaded: Boolean(LIVEKIT_API_KEY),
    apiSecretLoaded: Boolean(LIVEKIT_API_SECRET)
  });
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
        error: "LiveKit API Key or Secret missing in Render Environment"
      });
    }

    const safeName = participantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const identity = `${safeName || "participant"}-${Date.now()}`;

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name: participantName,
      ttl: "6h"
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canSubscribe: true,
      canPublish: true,
      canPublishData: true
    });

    const token = await at.toJwt();

    res.json({
      token,
      identity,
      roomName,
      role: role || "member"
    });

  } catch (error) {
    console.error("TOKEN_ERROR:", error);
    res.status(500).json({
      error: "Failed to create LiveKit token",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Mahima token server running on port ${PORT}`);
});
