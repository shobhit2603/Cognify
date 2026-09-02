"use client";
import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Check,
  Copy,
  PencilSimple,
  SpeakerHigh,
  SpeakerSlash,
  X,
  PaperPlaneRight,
} from "@phosphor-icons/react";

export default function ChatMessageFeed({
  messages,
  streamingMessageId,
  copiedId,
  playingVoiceId,
  handleCopy,
  handleToggleVoice,
  editingMessageId,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onEditPrompt,
}) {
  const [editText, setEditText] = React.useState("");
  const [prevEditingId, setPrevEditingId] = React.useState(null);

  if (editingMessageId !== prevEditingId) {
    setPrevEditingId(editingMessageId);
    if (editingMessageId) {
      const msg = messages.find((m) => m.id === editingMessageId);
      if (msg) setEditText(msg.content);
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex flex-col w-full ${
            msg.role === "user" ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`flex gap-3.5 sm:gap-4 ${
              msg.role === "user"
                ? editingMessageId === msg.id
                  ? "w-full"
                  : "max-w-[88%] sm:max-w-[82%]"
                : "w-full"
            }`}
          >
            {/* Assistant Avatar: Cognify Logo */}
            {msg.role === "assistant" && (
              <div className="relative w-8 h-8 shrink-0 flex items-center justify-center p-1">
                <Image
                  src="/Cognify-Logo.png"
                  alt="Cognify AI"
                  fill
                  sizes="32px"
                  className="object-contain p-1"
                />
              </div>
            )}

            {/* Message Bubble & Content */}
            <div
              className={`flex flex-col gap-2 min-w-0 flex-1 ${
                msg.role === "user"
                  ? editingMessageId === msg.id
                    ? "items-stretch"
                    : "items-end"
                  : "items-start"
              }`}
            >
              {msg.role === "user" ? (
                /* User Bubble */
                <div
                  className={`text-white rounded-3xl rounded-tr-lg shadow-md ${editingMessageId === msg.id ? "bg-[#151414] border border-white/10 w-full p-4" : "bg-[#242121] px-5 py-3.5"}`}
                >
                  {editingMessageId === msg.id ? (
                    <div className="flex flex-col gap-3 w-full">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-transparent text-white/95 text-[16px] sm:text-[17px] leading-relaxed font-normal outline-none resize-none min-h-20"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={onCancelEdit}
                          className="px-4 py-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium flex items-center gap-1.5"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => onSubmitEdit(msg.id, editText)}
                          disabled={
                            !editText.trim() || editText === msg.content
                          }
                          className="px-4 py-2 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors font-medium flex items-center gap-1.5"
                        >
                          Save & Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-[16px] sm:text-[17px] leading-relaxed font-normal text-white/95">
                      {msg.content}
                    </p>
                  )}
                </div>
              ) : (
                /* Assistant Content with Modern ChatGPT-style Markdown */
                <div className="w-full text-white/90 pt-0.5">
                  <div className="text-white/90 leading-relaxed font-sans select-text">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1({ children }) {
                          return (
                            <h1 className="text-2xl font-medium tracking-tight text-white mt-8 mb-3 first:mt-0">
                              {children}
                            </h1>
                          );
                        },
                        h2({ children }) {
                          return (
                            <h2 className="text-xl font-medium tracking-tight text-white mt-7 mb-2.5 first:mt-0">
                              {children}
                            </h2>
                          );
                        },
                        h3({ children }) {
                          return (
                            <h3 className="text-lg font-medium tracking-tight text-white/95 mt-6 mb-2 first:mt-0">
                              {children}
                            </h3>
                          );
                        },
                        h4({ children }) {
                          return (
                            <h4 className="text-base font-medium text-white/90 mt-5 mb-1.5 first:mt-0">
                              {children}
                            </h4>
                          );
                        },
                        p({ children }) {
                          return (
                            <p className="text-[16px] sm:text-[17px] leading-[1.8] text-white/90 font-normal my-3 first:mt-0 last:mb-0">
                              {children}
                            </p>
                          );
                        },
                        ul({ children }) {
                          return (
                            <ul className="space-y-2.5 my-3.5 pl-6 list-disc marker:text-white/40 text-[16px] sm:text-[17px] leading-[1.8] text-white/90">
                              {children}
                            </ul>
                          );
                        },
                        ol({ children }) {
                          return (
                            <ol className="space-y-2.5 my-3.5 pl-6 list-decimal marker:text-white/40 text-[16px] sm:text-[17px] leading-[1.8] text-white/90">
                              {children}
                            </ol>
                          );
                        },
                        li({ children }) {
                          return (
                            <li className="text-[16px] sm:text-[17px] leading-[1.8] text-white/90 pl-1">
                              {children}
                            </li>
                          );
                        },
                        strong({ children }) {
                          return (
                            <strong className="font-semibold text-white">
                              {children}
                            </strong>
                          );
                        },
                        em({ children }) {
                          return (
                            <em className="italic text-white/90">{children}</em>
                          );
                        },
                        hr() {
                          return (
                            <div className="my-7 w-full h-px bg-white/10" />
                          );
                        },
                        blockquote({ children }) {
                          return (
                            <blockquote className="border-l-2 border-white/25 pl-4 py-1 my-4 italic text-white/70 text-[16px] sm:text-[17px] leading-relaxed">
                              {children}
                            </blockquote>
                          );
                        },
                        a({ href, children }) {
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-osmo-lime hover:underline underline-offset-4 transition-colors"
                            >
                              {children}
                            </a>
                          );
                        },
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeContent = String(children).replace(
                            /\n$/,
                            "",
                          );
                          const blockKey = `${msg.id}-${match?.[1] ?? ""}-${codeContent.length}`;

                          return match ? (
                            /* ChatGPT-style Code Block */
                            <div className="rounded-2xl overflow-hidden my-5 bg-[#0d0c0c] shadow-xl">
                              {/* Header Bar */}
                              <div className="flex items-center justify-between px-4.5 py-2.5 bg-white/4 text-white/60">
                                <span className="text-xs font-mono font-medium uppercase tracking-wider text-white/60">
                                  {match[1]}
                                </span>
                                <button
                                  onClick={() =>
                                    handleCopy(codeContent, blockKey)
                                  }
                                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                                >
                                  {copiedId === blockKey ? (
                                    <>
                                      <Check
                                        size={13}
                                        className="text-osmo-lime"
                                        weight="bold"
                                      />
                                      <span className="text-osmo-lime font-medium text-xs">
                                        Copied
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={13} />
                                      <span className="font-normal text-xs">
                                        Copy
                                      </span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                {...props}
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="m-0! p-5! bg-transparent! text-sm sm:text-[15px] font-mono leading-relaxed"
                              >
                                {codeContent}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            /* Inline Code */
                            <code
                              {...props}
                              className="bg-white/8 text-white px-2 py-0.5 rounded-md font-mono text-[13.5px] font-normal"
                            >
                              {children}
                            </code>
                          );
                        },
                        /* Modern ChatGPT-style Table Redesign */
                        table({ children }) {
                          return (
                            <div className="overflow-x-auto my-5 rounded-2xl bg-[#121111] shadow-lg">
                              <table className="min-w-full text-left text-sm sm:text-base border-collapse">
                                {children}
                              </table>
                            </div>
                          );
                        },
                        thead({ children }) {
                          return (
                            <thead className="bg-white/5 text-white/90">
                              {children}
                            </thead>
                          );
                        },
                        tbody({ children }) {
                          return (
                            <tbody className="divide-y divide-white/5">
                              {children}
                            </tbody>
                          );
                        },
                        tr({ children }) {
                          return (
                            <tr className="hover:bg-white/2 transition-colors">
                              {children}
                            </tr>
                          );
                        },
                        th({ children }) {
                          return (
                            <th className="px-5 py-3.5 text-left font-medium text-xs sm:text-sm uppercase tracking-wider text-white/80 border-b border-white/8">
                              {children}
                            </th>
                          );
                        },
                        td({ children }) {
                          return (
                            <td className="px-5 py-3 text-sm sm:text-base text-white/85 leading-relaxed align-top">
                              {children}
                            </td>
                          );
                        },
                      }}
                    >
                      {msg.content || ""}
                    </ReactMarkdown>

                    {/* Realtime blinking cursor when streaming */}
                    {msg.id === streamingMessageId && (
                      <span className="inline-block w-1.5 h-4.5 bg-osmo-lime/90 animate-pulse align-middle ml-1.5 rounded-xs" />
                    )}
                  </div>
                </div>
              )}

              {/* Message Action Bar */}
              <div
                className={`flex items-center gap-1.5 text-white/40 pt-1 select-none ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <button
                  onClick={() => handleCopy(msg.content, msg.id)}
                  className="p-1.5 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-sm flex items-center gap-1"
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check size={15} className="text-osmo-lime" weight="bold" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>

                {msg.role === "user" &&
                  onStartEdit &&
                  editingMessageId !== msg.id && (
                    <button
                      onClick={() => onStartEdit(msg.id)}
                      className="p-1.5 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-sm"
                      title="Edit prompt"
                    >
                      <PencilSimple size={15} />
                    </button>
                  )}

                {msg.role === "assistant" && msg.content && (
                  <button
                    onClick={() => handleToggleVoice(msg.content, msg.id)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer text-sm ${
                      playingVoiceId === msg.id
                        ? "text-osmo-lime bg-osmo-lime/10 animate-pulse"
                        : "hover:text-white hover:bg-white/5"
                    }`}
                    title={
                      playingVoiceId === msg.id
                        ? "Stop speech audio"
                        : "Read response aloud"
                    }
                  >
                    {playingVoiceId === msg.id ? (
                      <SpeakerSlash size={16} weight="fill" />
                    ) : (
                      <SpeakerHigh size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
