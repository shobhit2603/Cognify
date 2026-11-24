import * as chatRepository from "../repositories/chat.repository.js";
import * as documentRepository from "../repositories/document.repository.js";
import * as noteRepository from "../repositories/note.repository.js";
import * as resumeRepository from "../repositories/resume.repository.js";

const normalizeChat = (chat) => ({
  id: chat._id.toString(),
  categoryCode: "01",
  categoryLabel: "AI Chat",
  subLabel: "AI Chat",
  title: chat.title || "Untitled Conversation",
  updatedAt: chat.updatedAt || chat.createdAt,
  href: `/chat/${chat._id}`,
});

const normalizeDocument = (doc) => ({
  id: doc._id.toString(),
  categoryCode: "02",
  categoryLabel: "Document Analysis",
  subLabel: "Documents",
  title: doc.originalName || "Untitled Document",
  updatedAt: doc.updatedAt || doc.createdAt,
  href: `/documents/${doc._id}`,
});

const normalizeResume = (resume) => ({
  id: resume._id.toString(),
  categoryCode: "03",
  categoryLabel: "Resume Studio",
  subLabel: "Resumes",
  title: resume.title || resume.originalName || "Untitled Resume",
  updatedAt: resume.updatedAt || resume.createdAt,
  href: `/resume?id=${resume._id}`,
});

const normalizeNote = (note) => ({
  id: note._id.toString(),
  categoryCode: "05",
  categoryLabel: "Notes Enhancer",
  subLabel: "Notes",
  title: note.title || "Untitled Note",
  updatedAt: note.updatedAt || note.createdAt,
  href: `/notes?id=${note._id}`,
});

export const getRecentActivity = async (userId, category = "all", limit = 8) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 10);

  // 01: AI Chat
  if (category === "01") {
    const [chats, totalCount] = await Promise.all([
      chatRepository.findRecentChats(userId, safeLimit),
      chatRepository.countChatsByUserId(userId),
    ]);
    return {
      items: chats.map(normalizeChat),
      totalCount,
    };
  }

  // 02: Document Analysis
  if (category === "02") {
    const [docs, totalCount] = await Promise.all([
      documentRepository.findRecentDocuments(userId, safeLimit),
      documentRepository.countDocumentsByUserId(userId),
    ]);
    return {
      items: docs.map(normalizeDocument),
      totalCount,
    };
  }

  // 03: Resume Studio
  if (category === "03") {
    const [resumes, totalCount] = await Promise.all([
      resumeRepository.findRecentResumes(userId, safeLimit),
      resumeRepository.countResumesByUserId(userId),
    ]);
    return {
      items: resumes.map(normalizeResume),
      totalCount,
    };
  }

  // 04: AI Writing (Not yet persisted, return clean empty array)
  if (category === "04") {
    return {
      items: [],
      totalCount: 0,
    };
  }

  // 05: Notes Enhancer
  if (category === "05") {
    const [notes, totalCount] = await Promise.all([
      noteRepository.findRecentNotes(userId, safeLimit),
      noteRepository.countNotesByUserId(userId),
    ]);
    return {
      items: notes.map(normalizeNote),
      totalCount,
    };
  }

  // category === "all": Query all implemented repositories in parallel
  const [chats, chatCount, docs, docCount, notes, noteCount, resumes, resumeCount] = await Promise.all([
    chatRepository.findRecentChats(userId, safeLimit),
    chatRepository.countChatsByUserId(userId),
    documentRepository.findRecentDocuments(userId, safeLimit),
    documentRepository.countDocumentsByUserId(userId),
    noteRepository.findRecentNotes(userId, safeLimit),
    noteRepository.countNotesByUserId(userId),
    resumeRepository.findRecentResumes(userId, safeLimit),
    resumeRepository.countResumesByUserId(userId),
  ]);

  const allItems = [
    ...chats.map(normalizeChat),
    ...docs.map(normalizeDocument),
    ...notes.map(normalizeNote),
    ...resumes.map(normalizeResume),
  ];

  // Sort descending by latest timestamp
  allItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return {
    items: allItems.slice(0, safeLimit),
    totalCount: (chatCount || 0) + (docCount || 0) + (noteCount || 0),
  };
};
