/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { Router } = require("express");
const { ChatMessage } = require("../models/ChatMessage");

const router = Router();

// Send a message
router.post("/send", async (req, res) => {
  const { senderId, senderName, senderRole, receiverId, receiverName, receiverRole, text } = req.body;

  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ message: "senderId, receiverId, and text are required." });
  }

  const message = await ChatMessage.create({
    senderId,
    senderName: senderName || "Unknown",
    senderRole: senderRole || "student",
    receiverId,
    receiverName: receiverName || "Unknown",
    receiverRole: receiverRole || "tutor",
    text,
  });

  return res.status(201).json(message);
});

// Get conversation between two users
router.get("/conversation/:userId1/:userId2", async (req, res) => {
  const { userId1, userId2 } = req.params;

  const messages = await ChatMessage.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  }).sort({ createdAt: 1 });

  return res.status(200).json(messages);
});

// Get all messages for a user (inbox)
router.get("/inbox/:userId", async (req, res) => {
  const { userId } = req.params;

  const messages = await ChatMessage.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  }).sort({ createdAt: -1 });

  return res.status(200).json(messages);
});

// Mark messages as read
router.put("/read/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;

  await ChatMessage.updateMany(
    { senderId, receiverId, read: false },
    { read: true }
  );

  return res.status(200).json({ message: "Messages marked as read." });
});

module.exports = router;
