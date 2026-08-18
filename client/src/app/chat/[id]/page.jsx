"use client";
import React, { use } from "react";
import ChatCanvas from "../../../features/chat/components/ChatCanvas";

export default function ActiveChatPage({ params }) {
  const { id } = use(params);
  return <ChatCanvas chatId={id} />;
}
