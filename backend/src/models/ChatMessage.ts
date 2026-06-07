/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  senderId: string;
  senderName: string;
  senderRole: "student" | "tutor" | "parent";
  receiverId: string;
  receiverName: string;
  receiverRole: "student" | "tutor" | "parent";
  text: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
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

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
