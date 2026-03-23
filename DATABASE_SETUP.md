# 📚 TechPath Enhanced Login & Resume System - Complete Setup Guide

## 🆕 What's New - Recent Updates

### 1. **Enhanced Authentication**
- ✅ Username field added to registration
- ✅ Year of Study selection during registration
- ✅ Auto-redirect to selected year page after login
- ✅ Username displayed in navbar (not email)
- ✅ Logout functionality with session clearing

### 2. **Resume Management Backend**
- ✅ Save resumes to database
- ✅ View saved resumes
- ✅ Update saved resumes
- ✅ Delete saved resumes
- ✅ Associate resumes with user account

### 3. **Fixed Issues**
- ✅ Year navbar links no longer redirect to resume builder
- ✅ Login seamlessly redirects to user's selected year
- ✅ Username persists across sessions

---

## 💾 Database Setup Guide

### **MongoDB Connection**

#### Option 1: **Local MongoDB**
```bash
# Install MongoDB Community Edition
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
# Windows: mongod
# Mac/Linux: brew services start mongodb-community

# Connection string in server.js:
mongoose.connect("mongodb://localhost:27017/techpath_portal")
```

#### Option 2: **MongoDB Atlas (Cloud)** - Recommended for Production
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a project and cluster
4. Add IP address to whitelist (or 0.0.0.0 for testing)
5. Create database user
6. Copy connection string

Connection string format:
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/techpath_portal?retryWrites=true&w=majority

Add to server.js:
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/techpath_portal")
```

### **Database Schema Structure**

#### **User Collection**
```javascript
{
  _id: ObjectId,
  email: String,              // Unique email
  username: String,           // Unique username
  password: String,           // Bcrypt hashed
  yearOfStudy: Number,        // 1, 2, 3, or 4
  createdAt: Date,            // Registration date
}
```

#### **Resume Collection**
```javascript
{
  _id: ObjectId,
  userId: String,             // Reference to User._id
  username: String,           // For easy lookup
  resumeName: String,         // "My Resume 1" etc
  name: String,               // Full name
  email: String,              // Email address
  phone: String,              // Phone number
  linkedin: String,           // LinkedIn profile
  summary: String,            // Professional summary
  education: String,          // Education details
  skills: String,             // Skills (comma separated)
  projects: String,           // Projects description
  certifications: String,     // Certifications
  achievements: String,       // Achievements
  atsScore: Number,           // ATS compatibility score
  createdAt: Date,            // When resume was created
  updatedAt: Date,            // When resume was last updated
}
```

### **Indexes for Performance**

```javascript
// In server.js, add after schema definition:

// User indexes
User.collection.createIndex({ email: 1 }, { unique: true });
User.collection.createIndex({ username: 1 }, { unique: true });

// Resume indexes
Resume.collection.createIndex({ userId: 1 });
Resume.collection.createIndex({ userId: 1, createdAt: -1 });
```

---

## 🔑 Environment Variables Setup

Create a `.env` file in project root:

```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/techpath_portal

# JWT Secret - Use a strong, random string
JWT_SECRET=your_super_secret_random_key_min_32_chars_xxxxx

# Server
PORT=5000
NODE_ENV=production

# Frontend API
REACT_APP_API_URL=http://localhost:5000
```

Update server.js to use environment variables:

```javascript
const SECRET = process.env.JWT_SECRET || "yash_secret_key";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/techpath_portal";
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
```

---

## 📋 User Registration & Login Flow

### **Registration Process**
```
1. User fills registration form
   - Email (validated format)
   - Username (3+ characters, unique)
   - Year of Study (1-4 dropdown)
   - Password (6+ characters)
   - Confirm Password (must match)

2. Frontend validation
   - Email regex check
   - Username length check
   - Password matching check

3. Backend validation
   - Email uniqueness check
   - Username uniqueness check
   - Password hashing (bcrypt)

4. Database storage
   - New user created in User collection
   - Password hashed with 10 rounds salt

5. Response to frontend
   - Success message
   - Auto-switch to login form
```

### **Login Process**
```
1. User enters email & password

2. Backend validation
   - Find user by email
   - Compare password with hash (bcrypt)

3. JWT token generation
   - Token includes user ID
   - No expiration (or set custom)

4. Response with data
   - JWT token
   - Username
   - Year of Study
   - User ID

5. Frontend storage
   - localStorage.setItem('authToken', token)
   - localStorage.setItem('username', username)
   - localStorage.setItem('yearOfStudy', year)
   - localStorage.setItem('userId', userId)

6. Page redirect
   - Auto-redirect to user's year page
   - Example: login as Year 2 → redirects to second-year.html
   - Navbar shows username instead of login button
```

---

## 📝 Resume Management API

### **Save Resume**
```http
POST /save-resume
Authorization: eyJhbGci...
Content-Type: application/json

{
  "resumeName": "My Resume",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "linkedin": "linkedin.com/in/johndoe",
  "summary": "Passionate AI engineer...",
  "education": "B.Tech AI, XYZ University",
  "skills": "Python, TensorFlow, DSA",
  "projects": "1. AI Chatbot...",
  "certifications": "TensorFlow Certification",
  "achievements": "Published paper on AI",
  "atsScore": 85
}

Response:
{
  "message": "Resume saved",
  "resumeId": "507f1f77bcf86cd799439011"
}
```

### **Get All Resumes**
```http
GET /resumes
Authorization: eyJhbGci...

Response:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "resumeName": "My Resume",
    "name": "John Doe",
    "createdAt": "2026-03-22T10:30:00Z",
    "updatedAt": "2026-03-22T10:30:00Z"
  },
  ...
]
```

### **Update Resume**
```http
PUT /resume/{resumeId}
Authorization: eyJhbGci...
Content-Type: application/json

{ ...updated fields... }
```

### **Delete Resume**
```http
DELETE /resume/{resumeId}
Authorization: eyJhbGci...

Response:
{
  "message": "Resume deleted"
}
```

---

## 🛠️ Implementation in Frontend

### **Save Resume After Generation**
```javascript
// In resume-builder.js or your resume module:

async function saveResumeToDatabase() {
  const resumeData = {
    resumeName: `Resume - ${new Date().toLocaleDateString()}`,
    name: document.getElementById('full-name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    linkedin: document.getElementById('linkedin').value,
    summary: document.getElementById('summary').value,
    education: document.getElementById('education').value,
    skills: document.getElementById('skills').value,
    projects: document.getElementById('projects').value,
    certifications: document.getElementById('certifications').value,
    achievements: document.getElementById('achievements').value,
    atsScore: calculateATS(resumeData)
  };

  const result = await saveResume(resumeData);
  if (result) {
    alert('Resume saved to your account!');
  }
}
```

### **View Saved Resumes**
```javascript
// In user profile or resumes page:

async function displayUserResumes() {
  const resumes = await loadSavedResumes();
  
  if (!resumes || resumes.length === 0) {
    document.getElementById('resumes-list').innerHTML = 
      '<p>No saved resumes yet. Create one in Resume Builder!</p>';
    return;
  }

  const html = resumes.map(resume => `
    <div class="resume-card">
      <h3>${resume.resumeName}</h3>
      <p>${resume.name}</p>
      <small>Created: ${new Date(resume.createdAt).toLocaleDateString()}</small>
      <button onclick="loadResume('${resume._id}')">Edit</button>
      <button onclick="deleteResume('${resume._id}')">Delete</button>
    </div>
  `).join('');

  document.getElementById('resumes-list').innerHTML = html;
}
```

---

## 📊 Database Backup & Migration

### **Backup MongoDB**

**Local MongoDB:**
```bash
# Backup all databases
mongodump --out ./backups

# Backup specific database
mongodump -d techpath_portal -o ./backups/techpath
```

**MongoDB Atlas (Cloud):**
1. Go to Atlas → Clusters → Backup
2. Enable continuous backup
3. Create snapshot manually
4. Download backup when needed

### **Restore MongoDB**

```bash
# Restore from backup
mongorestore ./backups

# Restore specific database
mongorestore -d techpath_portal ./backups/techpath
```

---

## 🔒 Security Best Practices

### **In Production:**
1. **Use HTTPS** - All API calls encrypted
2. **Set secure JWT secret** - Long, random string (32+ chars)
3. **Use MongoDB Atlas** - Away from production code
4. **Set proper CORS** - Restrict to your domain
5. **Rate limiting** - Prevent brute force attacks
6. **Request validation** - Validate all inputs
7. **Error handling** - Don't expose internal errors

### **server.js Security Updates:**
```javascript
// Add helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// CORS with specific origin
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/register', limiter);
app.use('/login', limiter);
```

---

## ✅ Testing Checklist

### **User Authentication**
- [ ] Register new user with all fields
- [ ] Verify username is unique
- [ ] Verify email is unique
- [ ] Test year selection dropdown
- [ ] Verify password hashing works
- [ ] Login redirects to correct year page
- [ ] Username displays in navbar after login
- [ ] Logout clears session
- [ ] Session persists on page refresh

### **Resume Management**
- [ ] Save resume to database
- [ ] Load all user's resumes
- [ ] Edit existing resume
- [ ] Delete resume with confirmation
- [ ] Verify only owner can access their resumes
- [ ] Test resume name customization
- [ ] Verify ATS score calculation

### **Database**
- [ ] MongoDB connection works
- [ ] Users collection created
- [ ] Resumes collection created
- [ ] Indexes are working
- [ ] Backup/restore works
- [ ] No duplicate users
- [ ] Password properly hashed

---

## 🚀 Deployment Checklist

### **Before Going Live:**
1. [ ] Update all environment variables
2. [ ] Set JWT_SECRET to strong value
3. [ ] Configure MongoDB Atlas IP whitelist
4. [ ] Enable CORS for production domain
5. [ ] Setup HTTPS certificate
6. [ ] Test all API endpoints
7. [ ] Test user registration & login
8. [ ] Test resume saving & loading
9. [ ] Setup database backup schedule
10. [ ] Monitor error logs
11. [ ] Setup email verification (optional)
12. [ ] Add password reset functionality (optional)

---

## 📞 API Base URL Configuration

**Development:**
```javascript
const API_URL = "http://localhost:5000";
```

**Production:**
```javascript
const API_URL = "https://api.yourdomain.com";
```

---

## 🎯 Next Steps (Recommendations)

1. **Email Verification**
   - Send verification email on signup
   - Verify email before account activation

2. **Password Reset**
   - Generate reset token
   - Email reset link
   - Update password with validation

3. **User Profile Page**
   - Edit username, email, year
   - View saved resumes
   - Download resume as PDF
   - Social links

4. **Resume Templates**
   - Multiple template designs
   - ATS-optimized templates
   - Custom template builder

5. **Analytics Dashboard**
   - Track resume views (if sharing enabled)
   - Resume performance metrics
   - User engagement stats

6. **Search & Filter**
   - Search resumes by name
   - Filter by creation date
   - Sort by ATS score

7. **Resume Sharing**
   - Generate public link
   - Share via email
   - QR code generation

---

**Database Updated**: March 2026  
**Version**: 2.0  
**Status**: ✅ Production Ready
