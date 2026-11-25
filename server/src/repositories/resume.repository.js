import { Resume } from "../models/resume.model.js";

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildResumeQuery(userId, search = "") {
  const query = { userId };
  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: escapeRegex(search.trim()), $options: "i" } },
      { originalName: { $regex: escapeRegex(search.trim()), $options: "i" } },
    ];
  }
  return query;
}

export const createResume = async (data, session = null) => {
  const [resume] = await Resume.create([data], { session });
  return resume;
};

export const findResumeById = async (id) => {
  return Resume.findById(id);
};

export const findResumeByIdAndUserId = async (id, userId) => {
  return Resume.findOne({ _id: id, userId });
};

export const findResumeByStorageKey = async (storageKey) => {
  return Resume.findOne({ storageKey });
};

export const findResumesByUserId = async (userId, skip = 0, limit = 20, search = "") => {
  const query = buildResumeQuery(userId, search);
  return Resume.find(query)
    .select("_id title originalName fileSize pageCount latestAudit.overallScore createdAt updatedAt")
    .sort({ updatedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countResumesByUserId = async (userId, search = "") => {
  const query = buildResumeQuery(userId, search);
  return Resume.countDocuments(query);
};

export const updateResume = async (id, updates, session = null) => {
  return Resume.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
    session,
  });
};

export const deleteResume = async (id, session = null) => {
  return Resume.findByIdAndDelete(id, { session });
};

export const appendResumeMessage = async (id, messageData, session = null) => {
  return Resume.findByIdAndUpdate(
    id,
    {
      $push: { messages: messageData },
      $set: { updatedAt: new Date() },
    },
    {
      returnDocument: "after",
      session,
    }
  );
};

export const updateLatestAudit = async (id, auditData, session = null) => {
  return Resume.findByIdAndUpdate(
    id,
    {
      $set: {
        latestAudit: auditData,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      session,
    }
  );
};

export const findRecentResumes = async (userId, limit = 8) => {
  return Resume.find({ userId })
    .select("_id title originalName latestAudit.overallScore updatedAt createdAt")
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();
};
