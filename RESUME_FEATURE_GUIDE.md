# Saved Resumes Feature - Complete Guide

## Overview
This document explains how the **Saved Resumes** feature works end-to-end.

## Features Implemented

### 1. **View Saved Resumes**
- Click the "📄 Saved Resumes" button on the Resume Builder modal
- A modal will open showing a list of all your saved resumes
- Each resume card displays:
  - Resume name
  - Full name and email
  - Edit and Delete buttons

### 2. **Edit Resume**
- Click the "✏️ Edit" button on any resume
- The resume data will load into the Resume Builder form
- You can modify any field
- Click "💾 Save Resume" to update your changes
- A confirmation dialog will appear asking for the resume name

### 3. **Delete Resume**
- Click the "🗑️ Delete" button on any resume
- A confirmation dialog will ask if you're sure (this cannot be undone)
- After confirmation, the resume will be deleted from the database
- The list will refresh automatically

## Database Endpoints

### GET `/resumes`
Fetches all resumes for the logged-in user.
- **Auth Required**: Yes (Token in Authorization header)
- **Returns**: Array of resume objects

### GET `/resume/:id`
Fetches a single resume by ID.
- **Auth Required**: Yes
- **Returns**: Single resume object

### POST `/save-resume`
Creates a new resume.
- **Auth Required**: Yes
- **Body**: Resume data object
- **Returns**: Success message with resume ID

### PUT `/resume/:id`
Updates an existing resume.
- **Auth Required**: Yes
- **Body**: Updated resume data
- **Returns**: Success message

### DELETE `/resume/:id`
Deletes a resume.
- **Auth Required**: Yes
- **Returns**: Success message

## How to Use

### First Time Users
1. Make sure you're logged in
2. Go to Resume Builder (click "Resume Builder" from sidebar or main menu)
3. Fill in your resume information
4. Click "Generate Preview" to see your resume
5. Click "💾 Save Resume" to save it to the database
6. You'll be asked for a resume name (default: current date)
7. Your resume will be saved!

### Editing Existing Resumes
1. Click "📄 Saved Resumes" button
2. Find the resume you want to edit
3. Click "✏️ Edit"
4. The form will populate with your resume data
5. Make changes you want
6. Click "💾 Save Resume"
7. This will UPDATE the existing resume (same ID)

### Downloading PDF
1. Generate a preview of your resume
2. Click "📥 Download PDF"
3. A print dialog will appear
4. You can save as PDF or print directly

## Troubleshooting

### Button Not Responding
1. Make sure you're logged in
2. Check browser console (F12) for errors
3. Refresh the page and try again

### No Resumes Appearing
1. You may not have any saved resumes yet - create one first
2. Check your internet connection
3. Make sure the backend server is running on port 5000

### Edit Not Working
1. Check that form fields are visible
2. Ensure you're logged in
3. Check browser console for error messages

### Save Not Working
1. Make sure you've generated a preview first
2. Check that you're logged in
3. Ensure the resume name is not empty

## File Structure

- **HTML Modal**: `index.html` - Contains modal structure
- **JavaScript**: `js/saved-resumes.js` - All resume management functions
- **CSS**: `css/style.css` - Modal styling and animations
- **Form**: `index.html` - Resume builder form elements

## Technical Details

### Scripts Loaded in Order
1. `js/auth.js` - Authentication system
2. `js/saved-resumes.js` - Resume management functions
3. `js/main.js` - Global interactions
4. `js/counter.js` - Character counters
5. `js/certificates.js` - Certificates functionality
6. `js/resume-builder.js` - Event listeners for Resume Builder buttons

### Key Variables
- `window.currentUser` - Current logged-in user
- `window.editingResumeId` - Tracks which resume is being edited (null if new)
- `window.currentResumeData` - Current resume data in the preview

### Functions Available
- `window.openSavedResumesModal()` - Opens the saved resumes modal
- `window.editResume(id)` - Loads a resume for editing
- `window.deleteResume(id)` - Deletes a resume
- `window.saveResumeToDB()` - Saves new or updates existing resume

## Future Improvements
- Add search functionality for resumes
- Add date created/modified display
- Add duplicate resume feature
- Add template selection
- Add cloud sync across devices
