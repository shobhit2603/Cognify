"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

// Chat Components
import ChatHeader from "./ChatHeader";
import ChatEmptyState from "./ChatEmptyState";
import ChatMessageFeed from "./ChatMessageFeed";
import ChatInputArea from "./ChatInputArea";

// API Service
import * as chatService from "../services/chat.service";

import { useChatContext } from "../context/ChatContext";
import { useRouter } from "next/navigation";

export default function ChatCanvas({ chatId }) {
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen, refreshChatTitle, setConversations } = useChatContext();

  const [messages, setMessages] = useState([]);
  const [editPromptText, setEditPromptText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Streaming UI state — tracks which assistant message bubble is actively streaming
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  // Micro-interactions
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isUserScrolledUpRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const previousMessagesLength = useRef(0);

  // Ref that is true whenever a stream is in-flight — prevents the
  // getMessages effect from overwriting optimistic state mid-stream.
  const isStreamingRef = useRef(false);

  // AbortController ref — a new one is created per stream.
  const abortControllerRef = useRef(null);

  // ─── Fetch Messages on Chat Switch ──────────────────────────────────────────
  // Guard: skip if a stream is active to avoid overwriting optimistic state.

  useEffect(() => {
    if (!chatId) {
      if (!isStreamingRef.current) setMessages([]);
      return;
    }
    if (isStreamingRef.current) return;

    chatService
      .getMessages(chatId, 1, 100)
      .then((data) => {
        if (!data?.messages) return;
        // Backend already sorts { createdAt: 1 } — chronological order.
        // No .reverse() needed.
        const formatted = data.messages.map((m) => ({
          id: m._id,
          role: m.role,
          content: m.content,
        }));
        setMessages(formatted);
      })
      .catch(console.error);
  }, [chatId]);

  // ─── Auto-scroll ────────────────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;

    const isScrollingUp = scrollTop < lastScrollTopRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isScrollingUp && !isAtBottom) {
      isUserScrolledUpRef.current = true;
    } else if (isAtBottom) {
      isUserScrolledUpRef.current = false;
    }
    
    lastScrollTopRef.current = scrollTop;
  }, []);

  const scrollToBottom = useCallback((force = false, smooth = true) => {
    if (force || !isUserScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  useEffect(() => {
    const isNewMessage = messages.length > previousMessagesLength.current;
    previousMessagesLength.current = messages.length;

    // Use smooth scrolling if a brand new message was just added,
    // or if we're not actively generating.
    // During chunk updates (streaming), use 'auto' to prevent flickering.
    const useSmooth = isNewMessage || !isGenerating;
    scrollToBottom(false, useSmooth);
  }, [messages, isGenerating, scrollToBottom]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  // ─── Utility Actions ─────────────────────────────────────────────────────────

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleToggleVoice = (text, msgId) => {
    if (!window.speechSynthesis) return;
    if (playingVoiceId === msgId) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_\[\]()]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      window.speechSynthesis.speak(utterance);
      setPlayingVoiceId(msgId);
    }
  };

  const handleToggleMic = () => {
    setIsListening((prev) => !prev);
  };



  // ─── SEND & STREAM ───────────────────────────────────────────────────────────

  const handleSend = async (submittedText) => {
    const textToSend = typeof submittedText === "string" ? submittedText : "";
    if (!textToSend.trim() || isGenerating) return;

    // Capture whether this is a brand-new chat (no chatId yet)
    const isNewChat = !chatId;

    // ── 1. Optimistic: add user message + assistant placeholder atomically ────
    const userMessageId = `user-${Date.now()}`;
    const assistantId = `assistant-${Date.now() + 1}`;

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: textToSend.trim(),
        files: [...attachedFiles],
      },
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setEditPromptText("");
    setAttachedFiles([]);
    setIsGenerating(true);
    setStreamingMessageId(assistantId);
    isStreamingRef.current = true;
    isUserScrolledUpRef.current = false;

    // Fresh AbortController per stream
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Track the chatId used for this stream (needed for title refresh)
    let streamChatId = chatId;

    // ── 2. Start SSE stream ──────────────────────────────────────────────────
    await chatService.streamMessage(
      textToSend.trim(),
      chatId,
      {
        onConnected: (payload) => {
          if (isNewChat && payload.chat) {
            // New chat created by backend — sync to state
            const newChatId = payload.chat._id;
            streamChatId = newChatId;
            setConversations((prev) => [payload.chat, ...prev]);
            // Redirect to the new chat page
            router.push(`/chat/${newChatId}`);
          }
          // Replace optimistic user-message id with real DB _id
          if (payload.message) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === userMessageId
                  ? { ...msg, id: payload.message._id }
                  : msg,
              ),
            );
          }
        },

        onChunk: (chunkText) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + chunkText }
                : msg,
            ),
          );
        },

        onDone: (payload) => {
          // Replace temp assistant id with real DB _id
          if (payload?.message) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, id: payload.message._id }
                  : msg,
              ),
            );
          }
          isStreamingRef.current = false;
          setStreamingMessageId(null);
          setIsGenerating(false);

          // For new chats: fetch the AI-generated title after a short delay
          // so the sidebar shows the real title instead of "New Chat"
          if (isNewChat && streamChatId) {
            refreshChatTitle(streamChatId);
          }
        },

        onError: (err) => {
          console.error("[Stream] Error:", err);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content:
                      msg.content ||
                      "Sorry, something went wrong. Please try again.",
                  }
                : msg,
            ),
          );
          isStreamingRef.current = false;
          setStreamingMessageId(null);
          setIsGenerating(false);
        },
      },
      controller.signal,
    );
  };

  // ─── Stop Generation ─────────────────────────────────────────────────────────

  const handleStop = () => {
    abortControllerRef.current?.abort();
    isStreamingRef.current = false;
    setStreamingMessageId(null);
    setIsGenerating(false);
  };

  // ─── Chat Management ──────────────────────────────────────────────────────────

  const handleNewChat = () => {
    abortControllerRef.current?.abort();
    isStreamingRef.current = false;
    setStreamingMessageId(null);
    setIsGenerating(false);
    setMessages([]);
    setAttachedFiles([]);
    setEditPromptText("");
    router.push("/chat");
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FBFBFA] relative">
      <ChatHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onClearCanvas={() => handleNewChat()}
      />

          {/* Messages Scroll Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-10 py-8 pb-40"
          >
            <div className="max-w-3xl mx-auto flex flex-col gap-8">
              {messages.length === 0 ? (
                <ChatEmptyState onSendStarter={handleSend} />
              ) : (
                <ChatMessageFeed
                  messages={messages}
                  streamingMessageId={streamingMessageId}
                  copiedId={copiedId}
                  playingVoiceId={playingVoiceId}
                  handleCopy={handleCopy}
                  handleToggleVoice={handleToggleVoice}
                  onEditPrompt={(text) => setEditPromptText(text)}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* INPUT AREA */}
          <ChatInputArea
            editPromptText={editPromptText}
            isGenerating={isGenerating}
            onSend={handleSend}
            onStop={handleStop}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
            isListening={isListening}
            onToggleMic={handleToggleMic}
          />
    </div>
  );
}
