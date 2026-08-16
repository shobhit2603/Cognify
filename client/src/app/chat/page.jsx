"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import { useAuth } from "../../features/auth/hooks/useAuth";

// Chat Components
import ChatSidebar from "../../features/chat/components/ChatSidebar";
import ChatHeader from "../../features/chat/components/ChatHeader";
import ChatEmptyState from "../../features/chat/components/ChatEmptyState";
import ChatMessageFeed from "../../features/chat/components/ChatMessageFeed";
import ChatInputArea from "../../features/chat/components/ChatInputArea";

// API Service
import * as chatService from "../../features/chat/services/chat.service";

// ─── LocalStorage key for persisting the active chat across reloads ────────────
const ACTIVE_CHAT_KEY = "cognify_active_chat_id";
// Sentinel stored when the user is intentionally on the "new chat" page.
// Distinguishes "explicit new chat" from "no preference saved yet" (first visit).
const NEW_CHAT_SENTINEL = "__new__";

export default function ChatPage() {
  const { user } = useAuth();

  // Chat Data State
  const [conversations, setConversations] = useState([]);
  // Lazy initializer reads from localStorage once on first render — no extra render,
  // no effect needed. This is the recommended React pattern for external-store init.
  const [activeChatId, setActiveChatId] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(ACTIVE_CHAT_KEY);
    // Sentinel means: user was intentionally on new chat — restore that state.
    return stored && stored !== NEW_CHAT_SENTINEL ? stored : null;
  });
  const [messages, setMessages] = useState([]);

  // UI & Input State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [input, setInput] = useState("");
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

  // ─── Persist activeChatId across reloads ────────────────────────────────────
  // Write-only effect: syncs activeChatId → localStorage whenever it changes.
  // null (new chat) is stored as the sentinel so reload stays on new chat.
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
    } else {
      // Store sentinel instead of removing — removal loses the "new chat" intent.
      localStorage.setItem(ACTIVE_CHAT_KEY, NEW_CHAT_SENTINEL);
    }
  }, [activeChatId]);

  // ─── Initialize: Fetch Chats ─────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    chatService
      .getChats(1, 100)
      .then((data) => {
        if (!data?.chats) return;
        setConversations(data.chats);

        // After fetching chats, ensure the persisted activeChatId actually
        // exists in the user's chat list. If not, fall back to the first chat.
        setActiveChatId((prev) => {
          // prev is already validated/set by the lazy initializer.
          // Keep it if it's a real chat that exists in the list.
          if (prev && data.chats.some((c) => c._id === prev)) return prev;
          // prev is null — check what localStorage says:
          // if the sentinel is there the user intentionally navigated to new chat,
          // so stay there. Only fall back to the first chat on a genuine first visit
          // (no key stored at all).
          const stored = localStorage.getItem(ACTIVE_CHAT_KEY);
          if (stored === NEW_CHAT_SENTINEL || !stored) return null;
          // stored is a chatId that no longer exists — fall back to first chat.
          return data.chats.length > 0 ? data.chats[0]._id : null;
        });
      })
      .catch(console.error);
  }, [user]);

  // ─── Fetch Messages on Chat Switch ──────────────────────────────────────────
  // Guard: skip if a stream is active to avoid overwriting optimistic state.

  useEffect(() => {
    if (!activeChatId) {
      if (!isStreamingRef.current) setMessages([]);
      return;
    }
    if (isStreamingRef.current) return;

    chatService
      .getMessages(activeChatId, 1, 100)
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
  }, [activeChatId]);

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

  // ─── Chat Title Refresh ──────────────────────────────────────────────────────
  // After a new chat's first response completes, the backend will have
  // asynchronously generated a title. We poll once after a short delay to
  // pick it up and update the sidebar.

  const refreshChatTitle = useCallback(async (chatId) => {
    // Give the server ~2 s to finish title generation
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const data = await chatService.getChatById(chatId);
      if (!data?.chat) return;
      const newTitle = data.chat.title;
      if (
        newTitle &&
        newTitle !== "New Chat" &&
        newTitle !== "New Conversation"
      ) {
        setConversations((prev) =>
          prev.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c)),
        );
      }
    } catch (err) {
      console.warn("[Title refresh] failed:", err);
    }
  }, []);

  // ─── SEND & STREAM ───────────────────────────────────────────────────────────

  const handleSend = async (customPrompt) => {
    const textToSend = typeof customPrompt === "string" ? customPrompt : input;
    if (!textToSend.trim() || isGenerating) return;

    // Capture whether this is a brand-new chat (no chatId yet)
    const isNewChat = !activeChatId;

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
    setInput("");
    setAttachedFiles([]);
    setIsGenerating(true);
    setStreamingMessageId(assistantId);
    isStreamingRef.current = true;
    isUserScrolledUpRef.current = false;

    // Fresh AbortController per stream
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Track the chatId used for this stream (needed for title refresh)
    let streamChatId = activeChatId;

    // ── 2. Start SSE stream ──────────────────────────────────────────────────
    await chatService.streamMessage(
      textToSend.trim(),
      activeChatId,
      {
        onConnected: (payload) => {
          if (isNewChat && payload.chat) {
            // New chat created by backend — sync to state
            const newChatId = payload.chat._id;
            streamChatId = newChatId;
            setActiveChatId(newChatId);
            setConversations((prev) => [payload.chat, ...prev]);
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
    setActiveChatId(null);
    setMessages([]);
    setAttachedFiles([]);
    setInput("");
  };

  const handleSelectChat = (id) => {
    if (id === activeChatId) return;
    abortControllerRef.current?.abort();
    isStreamingRef.current = false;
    setStreamingMessageId(null);
    setIsGenerating(false);
    setActiveChatId(id);
  };

  const togglePinChat = async (id, e) => {
    e.stopPropagation();
    const chat = conversations.find((c) => c._id === id);
    if (!chat) return;
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, pinned: !c.pinned } : c)),
    );
    try {
      await chatService.updateChat(id, { pinned: !chat.pinned });
    } catch (err) {
      console.error(err);
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, pinned: chat.pinned } : c)),
      );
    }
  };

  const deleteChatHandler = async (id, e) => {
    e.stopPropagation();
    try {
      await chatService.deleteChat(id);
      const remaining = conversations.filter((c) => c._id !== id);
      setConversations(remaining);
      if (activeChatId === id) {
        if (remaining.length > 0) {
          setActiveChatId(remaining[0]._id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startRenameChat = (id, currentTitle, e) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitle(currentTitle);
  };

  const saveRenameChat = async (id, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    const oldTitle = conversations.find((c) => c._id === id)?.title;
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, title: editTitle.trim() } : c)),
    );
    setEditingChatId(null);
    try {
      await chatService.updateChat(id, { title: editTitle.trim() });
    } catch (err) {
      console.error(err);
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, title: oldTitle } : c)),
      );
    }
  };

  const cancelRenameChat = (e) => {
    e?.stopPropagation();
    setEditingChatId(null);
    setEditTitle("");
  };

  // ─── Derived / Filtered Lists ─────────────────────────────────────────────────

  const filteredConversations = conversations.filter((c) =>
    c.title?.toLowerCase().includes(searchFilter.toLowerCase()),
  );
  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const unpinnedConversations = filteredConversations.filter((c) => !c.pinned);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute>
      <div className="-mt-24 flex h-screen w-full bg-[#FBFBFA] text-brand-black overflow-hidden relative selection:bg-brand-orange selection:text-white">
        {/* SIDEBAR — AnimatePresence drives mount/unmount so exit animation fires */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <ChatSidebar
              isSidebarOpen={isSidebarOpen}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              pinnedConversations={pinnedConversations.map((c) => ({
                id: c._id,
                title: c.title,
                date: c.createdAt,
                isPinned: c.pinned,
              }))}
              unpinnedConversations={unpinnedConversations.map((c) => ({
                id: c._id,
                title: c.title,
                date: c.createdAt,
                isPinned: c.pinned,
              }))}
              activeChatId={activeChatId}
              editingChatId={editingChatId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
              onStartRename={startRenameChat}
              onSaveRename={saveRenameChat}
              onCancelRename={cancelRenameChat}
              onTogglePin={togglePinChat}
              onDelete={deleteChatHandler}
            />
          )}
        </AnimatePresence>

        {/* MAIN CHAT CANVAS */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FBFBFA] relative">
          <ChatHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onClearCanvas={() => setMessages([])}
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
                  onEditPrompt={(text) => setInput(text)}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* INPUT AREA */}
          <ChatInputArea
            input={input}
            setInput={setInput}
            isGenerating={isGenerating}
            onSend={handleSend}
            onStop={handleStop}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
            isListening={isListening}
            onToggleMic={handleToggleMic}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
