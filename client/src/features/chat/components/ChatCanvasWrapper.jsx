"use client";
import React from "react";
import { useParams } from "next/navigation";
import ChatCanvas from "./ChatCanvas";

export default function ChatCanvasWrapper() {
  const params = useParams();
  const chatId = params?.id || null;
  
  return <ChatCanvas chatId={chatId} />;
}
