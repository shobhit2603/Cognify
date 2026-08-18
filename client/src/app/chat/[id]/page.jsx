"use client";
import React from "react";
import ChatCanvas from "../../../features/chat/components/ChatCanvas";

export default function ActiveChatPage({ params }) {
  const { id } = params;
  return <ChatCanvas chatId={id} />;
}
