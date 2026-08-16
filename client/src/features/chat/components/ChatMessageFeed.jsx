import React from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Sparkle, FilePdf, Check, Copy, PencilSimple, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

export default function ChatMessageFeed({
  messages,
  streamingMessageId,
  copiedId,
  playingVoiceId,
  handleCopy,
  handleToggleVoice,
  onEditPrompt
}) {
  return (
    <>
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex flex-col w-full ${msg.role === "user" ? "items-end" : "items-start"}`}
        >
          <div className={`flex gap-4 ${msg.role === "user" ? "max-w-[85%] sm:max-w-[78%]" : "w-full"}`}>
            
            {/* Assistant Brand Avatar */}
            {msg.role === "assistant" && (
              <div className="w-8 h-8 shrink-0 rounded-xl bg-brand-black text-brand-orange flex items-center justify-center shadow-xs border border-black/10 mt-1">
                <Sparkle size={16} weight="fill" />
              </div>
            )}

            {/* Message Bubble Container */}
            <div className={`flex flex-col gap-2 min-w-0 flex-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              
              {/* Attached files badge if uploaded with user message */}
              {msg.files && msg.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {msg.files.map((file) => (
                    <div key={file.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-black/10 rounded-lg text-xs font-medium text-gray-700 shadow-2xs">
                      <FilePdf size={14} className="text-brand-orange" weight="fill" />
                      <span className="truncate max-w-37.5">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* User vs Assistant Content with High-Legibility Typography */}
              {msg.role === "user" ? (
                <div className="bg-brand-black text-brand-white rounded-2xl rounded-tr-xs px-5 py-3.5 shadow-md shadow-black/5">
                  <p className="whitespace-pre-wrap text-[16px] leading-[1.6] font-sans font-normal">{msg.content}</p>
                </div>
              ) : (
                <div className="w-full text-[#1e1e1b] pt-1">
                  <div className="prose prose-base max-w-none text-[#1e1e1b] leading-[1.8] font-sans prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-brand-black prose-p:my-3 prose-p:text-[16px] prose-p:leading-[1.8] prose-a:text-brand-orange prose-a:underline-offset-4 prose-strong:font-bold prose-strong:text-brand-black prose-blockquote:border-l-2 prose-blockquote:border-brand-orange prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-ul:my-3 prose-li:my-1 marker:text-brand-orange">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeContent = String(children).replace(/\n$/, "");
                          // Unique key: message id + language + content length avoids
                          // collisions between blocks that share the same opening chars.
                          const blockKey = `${msg.id}-${match?.[1] ?? ""}-${codeContent.length}`;
                          return match ? (
                            <div className="rounded-xl overflow-hidden my-4 border border-black/15 bg-brand-black shadow-lg">
                              <div className="flex items-center justify-between px-4 py-2.5 bg-white/4 border-b border-white/10 text-gray-400">
                                <span className="text-xs font-mono font-medium text-gray-300">{match[1]}</span>
                                <button
                                  onClick={() => handleCopy(codeContent, blockKey)}
                                  className="flex items-center gap-1.5 text-xs hover:text-white transition-colors cursor-pointer"
                                >
                                  {copiedId === blockKey ? (
                                    <>
                                      <Check size={14} className="text-emerald-400" />
                                      <span className="text-emerald-400 font-sans">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={14} />
                                      <span className="font-sans">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                {...props}
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="m-0! p-4! bg-transparent! text-xs sm:text-sm font-mono leading-relaxed"
                              >
                                {codeContent}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code {...props} className="bg-black/5 px-1.5 py-0.5 rounded text-brand-orange font-mono text-[14px] font-medium border border-black/5">
                              {children}
                            </code>
                          );
                        },
                        table({ children }) {
                          return (
                            <div className="overflow-x-auto my-4 rounded-xl border border-black/10">
                              <table className="min-w-full divide-y divide-black/10 text-sm">
                                {children}
                              </table>
                            </div>
                          );
                        },
                        th({ children }) {
                          return (
                            <th className="px-4 py-2.5 bg-black/5 text-left font-display font-bold text-xs uppercase tracking-wider text-brand-black">
                              {children}
                            </th>
                          );
                        },
                        td({ children }) {
                          return (
                            <td className="px-4 py-2 border-t border-black/5 text-sm text-gray-700">
                              {children}
                            </td>
                          );
                        }
                      }}
                    >
                      {msg.content || ""}
                    </ReactMarkdown>
                    {/* Blinking cursor: visible the entire time this message is streaming */}
                    {msg.id === streamingMessageId && (
                      <span className="inline-block w-0.75 h-[1.1em] bg-brand-orange rounded-sm animate-pulse align-middle ml-0.5" />
                    )}
                  </div>
                </div>
              )}

              {/* Interactive Micro-Action Bar */}
              <div className={`flex items-center gap-1 text-gray-400 pt-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <button
                  onClick={() => handleCopy(msg.content, msg.id)}
                  className="p-1.5 hover:text-brand-black hover:bg-black/5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                  title="Copy text"
                >
                  {copiedId === msg.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>

                {msg.role === "user" && (
                  <button
                    onClick={() => onEditPrompt(msg.content)}
                    className="p-1.5 hover:text-brand-black hover:bg-black/5 rounded-lg transition-colors cursor-pointer text-xs"
                    title="Edit prompt into bar"
                  >
                    <PencilSimple size={14} />
                  </button>
                )}

                {msg.role === "assistant" && msg.content && (
                  <button
                    onClick={() => handleToggleVoice(msg.content, msg.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      playingVoiceId === msg.id ? "text-brand-orange bg-brand-orange/10 animate-pulse" : "hover:text-brand-black hover:bg-black/5"
                    }`}
                    title={playingVoiceId === msg.id ? "Stop voice audio" : "Read response aloud"}
                  >
                    {playingVoiceId === msg.id ? <SpeakerSlash size={15} weight="fill" /> : <SpeakerHigh size={15} />}
                  </button>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      ))}
    </>
  );
}
