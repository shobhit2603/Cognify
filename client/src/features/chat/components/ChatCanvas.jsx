"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

// Chat Components
import ChatHeader from "./ChatHeader";
import ChatEmptyState from "./ChatEmptyState";
import ChatMessageFeed from "./ChatMessageFeed";
import ChatInputArea from "./ChatInputArea";

// API Service
import * as chatService from "../services/chat.service";
import { useChatContext } from "../context/ChatContext";

/**
 * Detects query intent synchronously to render immediate dynamic Stage 1 feedback.
 */
function detectChatStage(text = "", options = {}) {
  if (options.hasAttachedFile) {
    return { step: 1, stage: "docs", message: "Scanning document context..." };
  }

  const cleanText = text.toLowerCase();

  const isWeb =
    /latest|current|today|todays|now|recent|news|price|gold|silver|weather|stock|market|trending|score|who won|when did|what is .* (in \d{4}|right now|currently|today)|how much|how many|who is|who are/i.test(
      cleanText,
    );
  const isDoc =
    /document|pdf|file|upload|internship|resume|cv|report|according to|in the (doc|file|pdf)|what (does the|is in the)/i.test(
      cleanText,
    );
  const isCode =
    /code|function|bug|algorithm|implement|python|javascript|typescript|react|nextjs|sql|database|api|endpoint|debug|class|def |const |let /i.test(
      cleanText,
    );

  if (isDoc) {
    return { step: 1, stage: "docs", message: "Scanning document context..." };
  }
  if (isWeb) {
    return { step: 1, stage: "web", message: "Searching the live web..." };
  }
  if (isCode) {
    return { step: 1, stage: "code", message: "Analyzing logic & structure..." };
  }
  return { step: 1, stage: "reasoning", message: "Analyzing query & context..." };
}

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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editPromptText, setEditPromptText] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Streaming UI & Two-Stage Indication state
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const stageTimerRef = useRef(null);

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
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
        setActiveStage(null);
        isStreamingRef.current = false;
        setIsGenerating(false);
        setStreamingMessageId(null);
      }

      // 2. If navigating to New Chat
      if (!chatId) {
        setMessages([]);
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
        setActiveStage(null);
        return;
      }

      // 3. If navigating to the chat that is currently streaming
      if (isStreamingRef.current && streamChatIdRef.current === chatId) {
        return;
      }

      // 4. Safe to clear and load the new chat history
      setMessages([]);
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      setActiveStage(null);

      chatService
        .getMessages(chatId, 1, 100)
        .then((data) => {
          if (!active) return;
          if (!data?.messages) return;
          const formatted = data.messages.map((m) => ({
            id: m._id,
            clientKey: m._id,
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
      }
      
      // Delay state updates to avoid synchronous setState inside effect warning
      setTimeout(() => {
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
        setActiveStage(null);
        setIsGenerating(false);
        setStreamingMessageId(null);
        setMessages([]);
        setEditPromptText(null);
      }, 0);
    }
  }, [newChatTrigger, chatId]);

  // ─── Check for Pending Chat Prompt from Cross-Module Bridges (e.g. Notes) ────
  useEffect(() => {
    if (typeof window === "undefined") return;
    let timer = null;
    try {
      const pendingPrompt = sessionStorage.getItem("cognify_pending_chat_prompt");
      if (pendingPrompt && !chatId) {
        timer = setTimeout(() => {
          sessionStorage.removeItem("cognify_pending_chat_prompt");
          setEditPromptText({ text: pendingPrompt, nonce: Date.now() });
        }, 80);
      }
    } catch {
      // ignore
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
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

    if (isNewMessage) {
      scrollToBottom(false, true);
    } else if (isGenerating) {
      scrollToBottom(false, false);
    }
  }, [messages, isGenerating, scrollToBottom]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      abortControllerRef.current?.abort();
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
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
  const handleSend = async (submittedText, attachedFile = null) => {
    const textToSend = typeof submittedText === "string" ? submittedText : "";
    if (!textToSend.trim() || isGenerating) return;

    const isNewChat = !chatId;

    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const assistantId = `assistant-${Date.now() + 1}-${Math.random().toString(36).slice(2, 7)}`;

    // Set immediate dynamic stage indication for instant zero-latency feedback
    const stage = detectChatStage(textToSend, { hasAttachedFile: !!attachedFile });
    setActiveStage(stage);

    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    // Smooth transition to stage 2 if server hasn't sent it yet after 750ms
    stageTimerRef.current = setTimeout(() => {
      setActiveStage((prev) =>
        prev && prev.step === 1
          ? { step: 2, stage: "synthesizing", message: "Synthesizing response..." }
          : prev,
      );
    }, 750);

    setMessages((prev) => {
      return [
        ...prev,
        {
          id: userMessageId,
          clientKey: userMessageId,
          role: "user",
          content: textToSend.trim(),
        },
        {
          id: assistantId,
          clientKey: assistantId,
          role: "assistant",
          content: "",
        },
      ];
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
      const historyToSend = messages.map((m) => ({ role: m.role, content: m.content }));
      
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
              // Quiet URL replacement without jumping page scroll
              router.replace(`/chat/${newChatId}`, { scroll: false });
            }
            if (payload.message) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.clientKey === userMessageId || msg.id === userMessageId
                    ? { ...msg, id: payload.message._id }
                    : msg,
                ),
              );
            }
          },

          onStage: (stagePayload) => {
            if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
            setActiveStage({
              step: stagePayload.step || 2,
              stage: stagePayload.stage || "synthesizing",
              message: stagePayload.message || "Synthesizing response...",
            });
          },

          onChunk: (chunkText) => {
            if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
            setActiveStage(null);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.clientKey === assistantId || msg.id === assistantId
                  ? { ...msg, content: msg.content + chunkText }
                  : msg,
              ),
            );
          },

          onDone: (payload) => {
            if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
            setActiveStage(null);
            if (payload?.message) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.clientKey === assistantId || msg.id === assistantId
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
            if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
            setActiveStage(null);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.clientKey === assistantId || msg.id === assistantId
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
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
        setActiveStage(null);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.clientKey === assistantId || msg.id === assistantId
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
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      setActiveStage(null);
      isStreamingRef.current = false;
      setStreamingMessageId(null);
      setIsGenerating(false);
    }
  };

  // ─── Edit & Stream Message ───────────────────────────────────────────────────
  const handleEditSubmit = async (messageIdToEdit, newContent) => {
    const trimmed = typeof newContent === "string" ? newContent.trim() : "";
    if (!trimmed || isGenerating) return;

    // 1. Truncate local state to remove the edited message and all subsequent ones
    const editIndex = messages.findIndex((m) => m.id === messageIdToEdit);
    if (editIndex === -1) return;

    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const assistantId = `assistant-${Date.now() + 1}-${Math.random().toString(36).slice(2, 7)}`;

    const stage = detectChatStage(trimmed);
    setActiveStage(stage);

    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    stageTimerRef.current = setTimeout(() => {
      setActiveStage((prev) =>
        prev && prev.step === 1
          ? { step: 2, stage: "synthesizing", message: "Synthesizing response..." }
          : prev,
      );
    }, 750);

    setMessages((prev) => {
      const truncated = prev.slice(0, editIndex);
      return [
        ...truncated,
        {
          id: userMessageId,
          clientKey: userMessageId,
          role: "user",
          content: trimmed,
        },
        {
          id: assistantId,
          clientKey: assistantId,
          role: "assistant",
          content: "",
        },
      ];
    });

    setEditingMessageId(null);
    setIsGenerating(true);
    setStreamingMessageId(assistantId);
    isStreamingRef.current = true;
    isUserScrolledUpRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await chatService.streamEditMessage(
        messageIdToEdit,
        trimmed,
        {
          onConnected: (payload) => {
            if (payload.message) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.clientKey === userMessageId || msg.id === userMessageId
                    ? { ...msg, id: payload.message._id }
                    : msg,
                ),
              );
            }
          },
          onStage: (stagePayload) => {
            if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
            setActiveStage({
              step: stagePayload.step || 2,
              stage: stagePayload.stage || "synthesizing",
              message: stagePayload.message || "Synthesizing response...",
            });
          },
          onChunk: (chunkText) => {
            if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
            setActiveStage(null);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.clientKey === assistantId || msg.id === assistantId
                  ? { ...msg, content: msg.content + chunkText }
                  : msg,
              ),
            );
          },
          onDone: (payload) => {
            if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
            setActiveStage(null);
            if (payload?.message) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.clientKey === assistantId || msg.id === assistantId
                    ? { ...msg, id: payload.message._id }
                    : msg,
                ),
              );
            }
          },
          onError: (err) => {
            console.error("[Stream Edit] Error:", err);
            if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
            setActiveStage(null);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.clientKey === assistantId || msg.id === assistantId
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
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("[Stream Edit] Promise rejected:", err);
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
        setActiveStage(null);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.clientKey === assistantId || msg.id === assistantId
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
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      setActiveStage(null);
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
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    setActiveStage(null);
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
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <ChatEmptyState />
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <ChatMessageFeed
                  messages={messages}
                  activeStage={activeStage}
                  streamingMessageId={streamingMessageId}
                  copiedId={copiedId}
                  playingVoiceId={playingVoiceId}
                  handleCopy={handleCopy}
                  handleToggleVoice={handleToggleVoice}
                  editingMessageId={editingMessageId}
                  onStartEdit={(msgId) => setEditingMessageId(msgId)}
                  onCancelEdit={() => setEditingMessageId(null)}
                  onSubmitEdit={handleEditSubmit}
                  onEditPrompt={(text) =>
                    setEditPromptText({ text, nonce: Date.now() })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

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
