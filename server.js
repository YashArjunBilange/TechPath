const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = "yash_secret_key"; // change later

// 🔗 MongoDB
// For local development, MongoDB must be running on localhost:27017
// Or update this with your MongoDB Atlas connection string
mongoose.connect("mongodb+srv://yashbilange_db_user:tLL8HuTNevLwjPRV@cluster0.75ukee7.mongodb.net/?appName=Cluster0")
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

// ================= AUTH =================

// 🔐 Register
app.post("/register", async (req, res) => {
  const { email, username, password, yearOfStudy } = req.body;

  // Validate input
  if (!email || !username || !password || !yearOfStudy) {
    return res.status(400).json({ message: "All fields required" });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ message: "Email or username already exists" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashed, yearOfStudy });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// 🔐 Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token, username: user.username, yearOfStudy: user.yearOfStudy, userId: user._id });
});

// 🔒 Middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ================= RESUME =================

// 💾 Save
app.post("/save-resume", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    const resume = new Resume({
      ...req.body,
      userId: req.userId,
      username: user.username
    });

    const savedResume = await resume.save();
    res.json({ message: "Resume saved", resumeId: savedResume._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to save resume" });
  }
});

// 📂 Get all
app.get("/resumes", auth, async (req, res) => {
  try {
    const data = await Resume.find({ userId: req.userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
});

// 📂 Get single
app.get("/resume/:id", auth, async (req, res) => {
  try {
    const data = await Resume.findById(req.params.id);
    if (!data || data.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch resume" });
  }
});

// ✏️ Update
app.put("/resume/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume || resume.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

await Resume.findByIdAndUpdate(
  req.params.id,
  { ...req.body, updatedAt: new Date() },
  { new: true }
);
    res.json({ message: "Resume updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update resume" });
  }
});

// ❌ Delete
app.delete("/resume/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume || resume.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.json({ message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete resume" });
  }
});

// 🚀 Start
app.listen(5000, () => console.log("Server running on 5000"));