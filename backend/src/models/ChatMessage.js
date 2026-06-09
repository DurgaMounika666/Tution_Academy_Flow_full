/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChatMessageSchema = new Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["student", "tutor", "parent"], required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true },
    receiverRole: { type: String, enum: ["student", "tutor", "parent"], required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);

module.exports = { ChatMessage };
