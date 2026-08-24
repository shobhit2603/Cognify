"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

// Chat Components
import ChatHeader from "./ChatHeader";
import ChatEmptyState from "./ChatEmptyState";
import ChatMessageFeed from "./ChatMessageFeed";
import ChatInputArea from "./ChatInputArea";

// API Service
import * as chatService from "../services/chat.service";
import { useChatContext } from "../context/ChatContext";

export default function ChatCanvas({ chatId: propChatId }) {
  const router = useRouter();
  const params = useParams();
  const chatId = propChatId !== undefined ? propChatId : (params?.id || null);
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    refreshChatTitle,
    conversations,
    setConversations,
    isTemporaryChat,
    newChatTrigger,
  } = useChatContext();

  const [messages, setMessages] = useState([]);
  const [editPromptText, setEditPromptText] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Streaming UI state
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  // Micro-interactions
  const [copiedId, setCopiedId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isUserScrolledUpRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const previousMessagesLength = useRef(0);

  // Ref that is true whenever a stream is in-flight
  const isStreamingRef = useRef(false);

  // AbortController ref
  const abortControllerRef = useRef(null);
  const streamChatIdRef = useRef(null);
  const recognitionRef = useRef(null);

  // Current active conversation meta
  const currentChat = conversations.find((c) => c._id === chatId);
  const activeChatTitle = currentChat ? currentChat.title : "New Conversation";

  // ─── Fetch Messages on Chat Switch ──────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const timerId = setTimeout(() => {
      if (!active) return;

      // 1. If we switch away from currently streaming chat to another
      if (isStreamingRef.current && streamChatIdRef.current !== chatId) {
        abortControllerRef.current?.abort();
        isStreamingRef.current = false;
        setIsGenerating(false);
        setStreamingMessageId(null);
      }

      // 2. If navigating to New Chat
      if (!chatId) {
        setMessages([]);
        return;
      }

      // 3. If navigating to the chat that is currently streaming
      if (isStreamingRef.current && streamChatIdRef.current === chatId) {
        return;
      }

      // 4. Safe to clear and load the new chat history
      setMessages([]);

      chatService
        .getMessages(chatId, 1, 100)
        .then((data) => {
          if (!active) return;
          if (!data?.messages) return;
          const formatted = data.messages.map((m) => ({
            id: m._id,
            role: m.role,
            content: m.content,
          }));
          setMessages(formatted);
        })
        .catch((err) => {
          if (!active) return;
          console.error(err);
        });
    }, 0);

    return () => {
      active = false;
      clearTimeout(timerId);
    };
  }, [chatId]);

  // ─── Handle New Chat Trigger ──────────────────────────────────────────────────
  useEffect(() => {
    if (newChatTrigger > 0 && !chatId) {
      if (isStreamingRef.current) {
        abortControllerRef.current?.abort();
        isStreamingRef.current = false;
        setIsGenerating(false);
        setStreamingMessageId(null);
      }
      setMessages([]);
      setEditPromptText(null);
    }
  }, [newChatTrigger, chatId]);

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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
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

  // ─── Speech Recognition (Mic) ────────────────────────────────────────────────
  const handleToggleMic = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setEditPromptText({ text: transcript, nonce: Date.now() });
          }
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.warn("[SpeechRecognition] error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  // ─── Send & Stream Message ───────────────────────────────────────────────────
  const handleSend = async (submittedText) => {
    const textToSend = typeof submittedText === "string" ? submittedText : "";
    if (!textToSend.trim() || isGenerating) return;

    const isNewChat = !chatId;

    const userMessageId = `user-${Date.now()}`;
    const assistantId = `assistant-${Date.now() + 1}`;

    setMessages((prev) => {
      // capture history before adding new messages, to send to backend if temporary
      const historyToSend = prev.map((m) => ({ role: m.role, content: m.content }));
      
      const newMessages = [
        ...prev,
        {
          id: userMessageId,
          role: "user",
          content: textToSend.trim(),
        },
        { id: assistantId, role: "assistant", content: "" },
      ];
      
      return newMessages;
    });

    setEditPromptText(null);
    setIsGenerating(true);
    setStreamingMessageId(assistantId);
    isStreamingRef.current = true;
    isUserScrolledUpRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let streamChatId = chatId;
    streamChatIdRef.current = chatId;

    try {
      // Capture the current history to send if it's a temporary chat
      const historyToSend = messages.map(m => ({ role: m.role, content: m.content }));
      
      await chatService.streamMessage(
        textToSend.trim(),
        chatId,
        {
          onConnected: (payload) => {
            if (isNewChat && payload.chat && !isTemporaryChat) {
              const newChatId = payload.chat._id;
              streamChatId = newChatId;
              streamChatIdRef.current = newChatId;
              setConversations((prev) => {
                if (prev.some((c) => c._id === payload.chat._id)) return prev;
                return [payload.chat, ...prev];
              });
              router.push(`/chat/${newChatId}`);
            }
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
            if (payload?.message) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, id: payload.message._id }
                    : msg,
                ),
              );
            }
            if (isNewChat && streamChatId && !isTemporaryChat) {
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
                        "Sorry, something went wrong while reasoning. Please try again.",
                    }
                  : msg,
              ),
            );
          },
        },
        controller.signal,
        {
          isTemporary: isTemporaryChat,
          history: isTemporaryChat ? historyToSend : [],
        }
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("[Stream] Promise rejected:", err);
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
      }
    } finally {
      isStreamingRef.current = false;
      setStreamingMessageId(null);
      setIsGenerating(false);
    }
  };

  // ─── Auto-fire pending prompt from Dashboard quick-send ──────────────────────
  useEffect(() => {
    // Only auto-send when we're on a fresh /chat (no existing chatId)
    if (chatId) return;
    if (typeof window === "undefined") return;

    let pending;
    try {
      pending = sessionStorage.getItem("cognify_pending_prompt");
    } catch (e) {
      console.warn("Failed to read from session storage", e);
      return;
    }
    if (!pending?.trim()) return;

    // Small delay so the canvas is fully mounted before streaming starts
    const timer = setTimeout(() => {
      // Clear immediately before firing so it doesn't re-fire on future renders
      try {
        sessionStorage.removeItem("cognify_pending_prompt");
      } catch (e) {
        console.warn("Failed to remove pending prompt from session storage", e);
        return;
      }
      handleSend(pending.trim());
    }, 150);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // ─── Stop Generation ─────────────────────────────────────────────────────────
  const handleStop = () => {
    abortControllerRef.current?.abort();
    isStreamingRef.current = false;
    setStreamingMessageId(null);
    setIsGenerating(false);
  };

  return (
    <div className="flex-1 h-full min-h-0 bg-[#151414] text-white rounded-2xl flex flex-col overflow-hidden relative select-none shadow-2xl">
      {/* Top Header */}
      <ChatHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeChatTitle={activeChatTitle}
        hasMessages={messages.length > 0}
      />

      {/* Scrollable Message History Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-10 lg:px-16 py-6 pb-36 select-text"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {messages.length === 0 ? (
            <ChatEmptyState />
          ) : (
            <ChatMessageFeed
              messages={messages}
              streamingMessageId={streamingMessageId}
              copiedId={copiedId}
              playingVoiceId={playingVoiceId}
              handleCopy={handleCopy}
              handleToggleVoice={handleToggleVoice}
              onEditPrompt={(text) =>
                setEditPromptText({ text, nonce: Date.now() })
              }
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Bottom Input Capsule */}
      <ChatInputArea
        editPromptText={editPromptText}
        isGenerating={isGenerating}
        onSend={handleSend}
        onStop={handleStop}
        isListening={isListening}
        onToggleMic={handleToggleMic}
      />
    </div>
  );
}
