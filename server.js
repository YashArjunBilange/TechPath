if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();
app.use(cors());
app.use(compression());
app.use(bodyParser.json({ limit: "30mb" }));
app.use(express.static('.'));

// Root health route for Render uptime checks
app.get('/', (req, res) => {
  res.send("TechPath backend is running");
});

const SECRET = process.env.SECRET || "your-fallback-secret-key";

// 🔗 MongoDB
// For local development, MongoDB must be running on localhost:27017
// Or update this with your MongoDB Atlas connection string

// Fix DNS resolution for MongoDB Atlas
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://yashbilange_db_user:Y2a0s0h7@cluster0.75ukee7.mongodb.net/?appName=Cluster0"; 
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.log("❌ MongoDB Connection Error:");
    console.log(err.message);
    process.exit(1);
  });

// 👤 USER SCHEMA
const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  yearOfStudy: { type: Number, min: 1, max: 4 },
  createdAt: { type: Date, default: Date.now }
}));

// 📄 RESUME SCHEMA
const Resume = mongoose.model("Resume", new mongoose.Schema({
  userId: String,
  username: String,
  resumeName: { type: String, default: "Untitled Resume" },
  name: String,
  email: String,
  phone: String,
  linkedin: String,
  summary: String,
  education: String,
  skills: String,
  projects: String,
  certifications: String,
  achievements: String,
  atsScore: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const cache = Object.create(null);

function getFromCache(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    delete cache[key];
    return null;
  }
  return entry.value;
}

function setCache(key, value, ttlMs = 300000) {
  cache[key] = {
    value,
    expiresAt: Date.now() + ttlMs
  };
}

function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// ================= AUTH =================

// 🔐 Register
app.post("/register", asyncHandler(async (req, res) => {
  const { email, username, password, yearOfStudy } = req.body;

  // Validate input
  if (!email || !username || !password || !yearOfStudy) {
    return res.status(400).json({ message: "All fields required" });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ message: "Email or username already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = new User({ email, username, password: hashed, yearOfStudy });
  await newUser.save();
  return res.json({ message: "User registered successfully" });
}));

// 🔐 Login
app.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, SECRET);
  return res.json({ token, username: user.username, yearOfStudy: user.yearOfStudy, userId: user._id });
}));

// 🔒 Middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });
  
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id.toString(); // Convert to string for consistency
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
app.post("/save-resume", auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(400).json({ message: "User not found" });

  const resume = new Resume({
    ...req.body,
    userId: req.userId,
    username: user.username
  });

  const savedResume = await resume.save();
  return res.json({ message: "Resume saved", resumeId: savedResume._id });
}));

// 📂 Get all
app.get("/resumes", auth, asyncHandler(async (req, res) => {
  const data = await Resume.find({ userId: req.userId });
  return res.json(data);
}));

// 📂 Get single
app.get("/resume/:id", auth, asyncHandler(async (req, res) => {
  const data = await Resume.findById(req.params.id);
  if (!data || data.userId !== req.userId) {
    return res.status(403).json({ message: "Access denied" });
  }
  return res.json(data);
}));

// ✏️ Update
app.put("/resume/:id", auth, asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume || resume.userId !== req.userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  await Resume.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true }
  );
  return res.json({ message: "Resume updated" });
}));

// ❌ Delete
app.delete("/resume/:id", auth, asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume || resume.userId !== req.userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  await Resume.findByIdAndDelete(req.params.id);
  return res.json({ message: "Resume deleted" });
}));

// ================= DASHBOARD (COMBINED + CACHED) =================
app.get("/api/dashboard", auth, asyncHandler(async (req, res) => {
  const cacheKey = `dashboard:${req.userId}`;
  const cachedDashboard = getFromCache(cacheKey);
  if (cachedDashboard) {
    return res.json(cachedDashboard);
  }

  const [user, resumes] = await Promise.all([
    User.findById(req.userId).select("username email yearOfStudy createdAt"),
    Resume.find({ userId: req.userId })
      .select("resumeName atsScore updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .limit(20)
  ]);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const payload = {
    user: {
      username: user.username,
      email: user.email,
      yearOfStudy: user.yearOfStudy,
      joinedAt: user.createdAt
    },
    stats: {
      totalResumes: resumes.length,
      avgAtsScore: resumes.length
        ? Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length)
        : 0
    },
    resumes
  };

  setCache(cacheKey, payload, 300000);
  return res.json(payload);
}));

// ================= CHATBOT (GROQ) =================
function truncateText(text, maxLen = 7000) {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}\n...[truncated]`;
}

async function extractAttachmentContext(attachment) {
  try {
    if (!attachment || typeof attachment !== "object") return "";
    const { type = "", name = "", mime = "", dataUrl = "" } = attachment;
    if (typeof dataUrl !== "string" || !dataUrl.includes(",")) return "";

    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) return "";
    const buffer = Buffer.from(base64Data, "base64");

    if (type === "doc") {
      const lowerName = String(name).toLowerCase();
      const lowerMime = String(mime).toLowerCase();

      if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
        const parsed = await pdfParse(buffer);
        const pdfText = truncateText((parsed.text || "").replace(/\s+\n/g, "\n").trim());
        return pdfText ? `Document (${name}) content:\n${pdfText}` : "";
      }

      if (
        lowerMime.includes("wordprocessingml.document") ||
        lowerName.endsWith(".docx")
      ) {
        const extracted = await mammoth.extractRawText({ buffer });
        const docxText = truncateText((extracted.value || "").trim());
        return docxText ? `Document (${name}) content:\n${docxText}` : "";
      }

      if (
        lowerMime.startsWith("text/") ||
        lowerName.endsWith(".txt") ||
        lowerName.endsWith(".md")
      ) {
        const plainText = truncateText(buffer.toString("utf8").trim());
        return plainText ? `Document (${name}) content:\n${plainText}` : "";
      }

      return `Document attached: ${name}. The file format cannot be fully parsed by the server.`;
    }

    if (type === "video") {
      return `Video attached: ${name}. The server can preview this video in UI, but cannot transcribe or analyze full video content yet. Ask user for a short description to help answer accurately.`;
    }

    return "";
  } catch {
    return "Attachment was uploaded, but content extraction failed. Proceed based on user prompt.";
  }
}

app.post("/api/chatbot", asyncHandler(async (req, res) => {
  const { message, history = [], imageDataUrl = "", attachment = null } = req.body || {};
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return res.status(500).json({ message: "Server is missing GROQ_API_KEY" });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  const shortMessage = message.trim().slice(0, 2000);
  const systemPrompt = "You are TechPath Assistant for AI students. Give concise, practical, step-by-step guidance for roadmap, projects, resume, interview, and career questions.";
  const hasImage = typeof imageDataUrl === "string" && /^data:image\/[a-zA-Z]+;base64,/.test(imageDataUrl);
  const attachmentContext = await extractAttachmentContext(attachment);
  const userTextWithAttachment = attachmentContext
    ? `${shortMessage}\n\n${attachmentContext.slice(0, 4000)}`
    : shortMessage;
  const safeHistory = Array.isArray(history)
    ? history
        .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant") && typeof entry.content === "string")
        .slice(-8)
    : [];

  const groqResponse = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: hasImage ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.1-8b-instant",
      temperature: 0.4,
      max_tokens: 350,
      messages: [
        { role: "system", content: systemPrompt },
        ...safeHistory,
        hasImage
          ? {
              role: "user",
              content: [
                  { type: "text", text: shortMessage },
                { type: "image_url", image_url: { url: imageDataUrl } }
              ]
            }
          : { role: "user", content: userTextWithAttachment }
      ]
    },
    {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`
      }
    }
  );

  const data = groqResponse.data;
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    return res.status(502).json({ message: "Groq returned an empty response" });
  }

  return res.json({ reply });
}));

// ================= RESUME AI SUGGESTIONS (GROQ) =================
app.post("/api/suggest", asyncHandler(async (req, res) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  const { role = "", title = "", description = "", skills = "", targetField = "projects", sourceText = "" } = req.body || {};

  if (!groqApiKey) {
    return res.status(500).json({ message: "Server is missing GROQ_API_KEY" });
  }

  const hasMinimumContext = typeof sourceText === "string" && sourceText.trim().length >= 8;

  if (!hasMinimumContext) {
    return res.status(400).json({ message: "Please provide more details for suggestions." });
  }

  const fieldInstructionMap = {
    summary: "Return 2-4 concise professional summary lines about profile, strengths, domain focus, and value proposition. Do not mention project names unless already present in source text. Do not format as project achievements.",
    skills: "Generate ATS-friendly skills bullets grouped by capability (languages, frameworks, tools, platforms).",
    projects: "Generate impact-focused project bullet points with action verbs and measurable outcomes.",
    achievements: "Generate achievement bullet points highlighting awards, rankings, impact, and recognition."
  };
  const fieldInstruction = fieldInstructionMap[targetField] || fieldInstructionMap.projects;

  const outputFormatMap = {
    summary: "Return plain concise lines suitable for a Summary section (no generic project-style bullets).",
    skills: "Return short ATS-friendly skill lines.",
    projects: "Return bullet-style project impact lines.",
    achievements: "Return bullet-style achievement lines."
  };
  const outputFormatRule = outputFormatMap[targetField] || outputFormatMap.projects;

  const basePrompt = `You are an expert resume editor. Rewrite ONLY the user's provided text for resume quality.

Rules:
- Keep the same core meaning and facts from the source text
- Improve grammar, clarity, impact, and ATS language
- Do NOT invent new projects, skills, achievements, or numbers
- Match output style to target section exactly
- Return 3-5 improved lines max
- Target section: ${targetField}
- Section rule: ${fieldInstruction}
- Output style: ${outputFormatRule}

User Input:
Role: ${String(role).trim()}
Company/Project: ${String(title).trim()}
Description: ${String(description).trim()}
Skills: ${String(skills).trim()}
Source Text: ${String(sourceText).trim()}

Output format:
- Improved line 1
- Improved line 2
- Improved line 3
- Improved line 4`;

  function parseSuggestions(content) {
    return (content || "")
      .split("\n")
      .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 5);
  }

  function isProjectLikeSummary(lines) {
    if (!Array.isArray(lines) || lines.length === 0) return true;
    const merged = lines.join(" ").toLowerCase();
    const projectSignals = [
      "developed ",
      "built ",
      "implemented ",
      "deployed ",
      "designed ",
      "optimized ",
      "project",
      "application",
      "api",
      "model",
      "dataset"
    ];
    const signalCount = projectSignals.reduce((count, signal) => {
      return count + (merged.includes(signal) ? 1 : 0);
    }, 0);
    return signalCount >= 3;
  }

  async function runSuggestPrompt(promptText) {
    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 300,
        messages: [{ role: "user", content: promptText }]
      },
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
        }
      }
    );

    const data = groqResponse.data;
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    return parseSuggestions(content);
  }

  let suggestions = await runSuggestPrompt(basePrompt);

  // Retry once for summary if model drifts into project-like wording.
  if (targetField === "summary" && isProjectLikeSummary(suggestions)) {
    const retryPrompt = `${basePrompt}

Critical retry rule for Summary:
- Avoid project implementation verbs like Developed, Built, Implemented, Deployed.
- Focus on candidate profile, strengths, domains, and career objective tone.
- Do not mention specific project deliverables unless explicitly present in source text.`;
    suggestions = await runSuggestPrompt(retryPrompt);
  }

  if (suggestions.length === 0) {
    return res.status(502).json({ message: "No suggestions generated" });
  }

  return res.json({ suggestions });
}));

app.use((err, req, res, next) => {
  console.error("API Error:", err && err.message ? err.message : err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ message: "Internal server error" });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// 🚀 Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));