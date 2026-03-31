/**
 * auth.js – Authentication system for TechPath
 * Handles login, registration, logout, and session management
 */

const API_URL = API_BASE_URL;

// ============================================
// AUTH STATE & INITIALIZATION
// ============================================

let currentUser = null;

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  const yearOfStudy = localStorage.getItem('yearOfStudy');
  const userId = localStorage.getItem('userId');
  
  if (token && username) {
    currentUser = { username, email, yearOfStudy, userId, token };
    window.currentUser = { token, username, email, yearOfStudy, userId };
    updateAuthUI();
  }
});

// ============================================
// REGISTRATION
// ============================================

async function register() {
  // Get form elements from REGISTER form specifically to avoid ID conflicts
  const registerForm = document.getElementById('register-form');
  
  if (!registerForm) {
    console.error('Register form not found');
    showAuthMessage('Form error: Please reload the page', 'error');
    return;
  }
  
  const emailEl = registerForm.querySelector('#auth-email');
  const usernameEl = registerForm.querySelector('#auth-username');
  const passwordEl = registerForm.querySelector('#auth-password');
  const confirmPasswordEl = registerForm.querySelector('#auth-confirm-password');
  const yearEl = registerForm.querySelector('#auth-year');
  
  // Check if elements exist
  if (!emailEl || !usernameEl || !passwordEl || !confirmPasswordEl || !yearEl) {
    console.error('Form elements not found in register form');
    showAuthMessage('Form error: Please reload the page', 'error');
    return;
  }
  
  // Read values
  const email = emailEl.value.trim();
  const username = usernameEl.value.trim();
  const password = passwordEl.value.trim();
  const confirmPassword = confirmPasswordEl.value.trim();
  const yearOfStudy = yearEl.value.trim();

  // Detailed validation
  if (!email) {
    showAuthMessage('Email is required', 'error');
    return;
  }
  if (!username) {
    showAuthMessage('Username is required', 'error');
    return;
  }
  if (!password) {
    showAuthMessage('Password is required', 'error');
    return;
  }
  if (!confirmPassword) {
    showAuthMessage('Please confirm your password', 'error');
    return;
  }
  if (!yearOfStudy) {
    showAuthMessage('Please select your year of study', 'error');
    return;
  }

  if (username.length < 3) {
    showAuthMessage('Username must be at least 3 characters', 'error');
    return;
  }

  if (password.length < 6) {
    showAuthMessage('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAuthMessage('Passwords do not match', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAuthMessage('Please enter a valid email', 'error');
    return;
  }

  try {
    showAuthMessage('Registering...', 'info');
    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, yearOfStudy: parseInt(yearOfStudy) })
    });

    const data = await response.json();

    if (!response.ok) {
      showAuthMessage(data.message || 'Registration failed', 'error');
      return;
    }

    showAuthMessage('✓ Registration successful! Please login.', 'success');
    
    // Reset form and switch to login
    clearAuthForm();
    
    setTimeout(() => {
      switchAuthMode('login');
    }, 1500);

  } catch (error) {
    console.error('Registration error:', error);
    showAuthMessage('Network error. Please try again.', 'error');
  }
}

// ============================================
// LOGIN
// ============================================

async function login() {
  const loginForm = document.getElementById('login-form');
  const emailEl = loginForm ? loginForm.querySelector('#auth-email') : document.getElementById('auth-email');
  const passwordEl = loginForm ? loginForm.querySelector('#auth-password') : document.getElementById('auth-password');
  
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (!email || !password) {
    showAuthMessage('Please fill in all fields', 'error');
    return;
  }

  try {
    showAuthMessage('Logging in...', 'info');
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showAuthMessage(data.message || 'Login failed', 'error');
      return;
    }

    if (!data.token || !data.username) {
      showAuthMessage('Invalid response from server', 'error');
      return;
    }

    // Store auth data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('email', data.email);
    localStorage.setItem('yearOfStudy', data.yearOfStudy);
    localStorage.setItem('userId', data.userId);
    
    currentUser = { 
      username: data.username,
      email: data.email,
      yearOfStudy: data.yearOfStudy,
      userId: data.userId,
      token: data.token
    };
    
    showAuthMessage('✓ Login successful!', 'success');
    
    window.currentUser = {
      token: data.token,
      username: data.username,
      email: data.email,
      yearOfStudy: data.yearOfStudy,
      userId: data.userId
    };
    // Close modal and update UI
    setTimeout(() => {
      closeAuthModal();
      updateAuthUI();
      
      // Redirect to selected year page
      const yearFile = getYearFile(data.yearOfStudy);
      window.location.href = yearFile;
    }, 1000);

  } catch (error) {
    console.error('Login error:', error);
    showAuthMessage('Network error. Please try again.', 'error');
  }
}

// ============================================
// LOGOUT
// ============================================

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('yearOfStudy');
  localStorage.removeItem('userId');
  currentUser = null;
  updateAuthUI();
  window.location.href = 'index.html';
}

// ============================================
// RESUME MANAGEMENT
// ============================================

async function loadSavedResumes() {
  if (!currentUser || !currentUser.token) {
    showAuthMessage('Please login to view resumes', 'error');
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/resumes`, {
      method: 'GET',
      headers: {
        'Authorization': currentUser.token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load resumes');
    }

    const resumes = await response.json();
    return resumes;
  } catch (error) {
    console.error('Error loading resumes:', error);
    return [];
  }
}

async function saveResume(resumeData) {
  if (!currentUser || !currentUser.token) {
    showAuthMessage('Please login to save resumes', 'error');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/save-resume`, {
      method: 'POST',
      headers: {
        'Authorization': currentUser.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resumeData)
    });

    if (!response.ok) {
      const error = await response.json();
      showAuthMessage(error.message || 'Failed to save resume', 'error');
      return false;
    }

    const data = await response.json();
    showAuthMessage('✓ Resume saved successfully!', 'success');
    return true;
  } catch (error) {
    console.error('Error saving resume:', error);
    showAuthMessage('Network error. Please try again.', 'error');
    return false;
  }
}

async function deleteResume(resumeId) {
  if (!currentUser || !currentUser.token) {
    showAuthMessage('Please login', 'error');
    return false;
  }

  if (!confirm('Are you sure you want to delete this resume?')) return false;

  try {
    const response = await fetch(`${API_URL}/resume/${resumeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': currentUser.token
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }

    showAuthMessage('✓ Resume deleted', 'success');
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    showAuthMessage('Failed to delete resume', 'error');
    return false;
  }
}

// Load resume for editing from Student Profile modal
async function loadResumeForEditing(resumeId) {
  try {
    if (!currentUser || !currentUser.token) {
      showAuthMessage('Please login', 'error');
      return;
    }

    const response = await fetch(`${API_URL}/resume/${resumeId}`, {
      headers: {
        'Authorization': currentUser.token
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load resume');
    }

    const resume = await response.json();
    
    // Load the resume data into the form fields (using hyphenated IDs)
    document.getElementById('full-name').value = resume.fullName || '';
    document.getElementById('email').value = resume.email || '';
    document.getElementById('phone').value = resume.phone || '';
    document.getElementById('linkedin').value = resume.linkedin || '';
    document.getElementById('summary').value = resume.summary || '';
    document.getElementById('education').value = resume.education || '';
    document.getElementById('skills').value = resume.skills || '';
    document.getElementById('projects').value = resume.projects || '';
    document.getElementById('certifications').value = resume.certifications || '';
    document.getElementById('achievements').value = resume.achievements || '';
    
    // Trigger input event on all fields to update counters
    const fields = ['full-name', 'email', 'phone', 'linkedin', 'summary', 'education', 'skills', 'projects', 'certifications', 'achievements'];
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // Set editing mode
    window.editingResumeId = resumeId;
    
    // Close student details modal
    const modal = document.getElementById('student-details-modal');
    if (modal) modal.style.display = 'none';
    
    // Open resume builder modal
    const resumeModal = document.getElementById('resume-modal');
    if (resumeModal) {
      resumeModal.style.display = 'flex';
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    showAuthMessage('✓ Resume loaded for editing', 'success');
  } catch (error) {
    console.error('Error loading resume:', error);
    showAuthMessage('Failed to load resume', 'error');
  }
}

// Delete resume with confirmation from Student Profile modal
async function deleteResumeConfirm(resumeId) {
  if (!confirm('Are you sure you want to delete this resume?')) {
    return;
  }
  
  try {
    if (!currentUser || !currentUser.token) {
      showAuthMessage('Please login', 'error');
      return;
    }

    const response = await fetch(`${API_URL}/resume/${resumeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': currentUser.token
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }

    showAuthMessage('✓ Resume deleted', 'success');
    
    // Reload student resumes after deletion
    setTimeout(() => {
      loadStudentResumes();
    }, 500);
  } catch (error) {
    console.error('Error deleting resume:', error);
    showAuthMessage('Failed to delete resume', 'error');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getYearFile(year) {
  const yearMap = {
    1: 'first-year.html',
    2: 'second-year.html',
    3: 'third-year.html',
    4: 'fourth-year.html'
  };
  return yearMap[year] || 'index.html';
}

// ============================================
// STUDENT DETAILS & RESUME MODAL
// ============================================

function showStudentDetails(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (!currentUser) {
    showAuthMessage('Please login first', 'error');
    return;
  }

  // Create or get modal
  let modal = document.getElementById('student-details-modal');
  if (!modal) {
    const yearNames = { 1: 'First Year', 2: 'Second Year', 3: 'Third Year', 4: 'Fourth Year' };
    modal = document.createElement('div');
    modal.id = 'student-details-modal';
    modal.className = 'modal auth-modal';
    modal.style.cssText = 'display: flex;';
    modal.innerHTML = `
      <div class="modal-content auth-modal-content" style="max-width: 600px;">
        <button class="auth-close-btn" onclick="document.getElementById('student-details-modal').style.display='none'">&times;</button>
        <div class="auth-modal-header">
          <h2>👤 Student Profile</h2>
        </div>
        
        <div style="padding: 20px; background: #f9fafb; border-radius: 12px; margin-bottom: 20px;">
          <div style="display: grid; gap: 12px;">
            <div>
              <label style="font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Username</label>
              <p style="margin: 4px 0; font-size: 16px; color: #333;">${currentUser.username}</p>
            </div>
            <div>
              <label style="font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Email</label>
              <p style="margin: 4px 0; font-size: 16px; color: #333;">${currentUser.email || 'N/A'}</p>
            </div>
            <div>
              <label style="font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Year of Study</label>
              <p style="margin: 4px 0; font-size: 16px; color: #333;">${yearNames[currentUser.yearOfStudy] || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 style="margin: 20px 0 12px 0; color: #333;">📄 Saved Resumes</h3>
          <div id="student-resumes-list" style="background: #f9fafb; border-radius: 12px; padding: 16px; max-height: 300px; overflow-y: auto;">
            <p style="text-align: center; color: #999;"><i class="fas fa-spinner fa-spin"></i> Loading...</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Load student's resumes
  loadStudentResumes();
  modal.style.display = 'flex';
}

async function loadStudentResumes() {
  const resumesList = document.getElementById('student-resumes-list');
  
  if (!resumesList) return;
  
  try {
    const resumes = await loadSavedResumes();
    
    if (!resumes || resumes.length === 0) {
      resumesList.innerHTML = '<p style="text-align: center; color: #999;">No saved resumes yet</p>';
      return;
    }

    let html = '';
    resumes.forEach(resume => {
      const createdDate = new Date(resume.createdAt).toLocaleDateString();
      html += `
        <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #3b82f6;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <p style="margin: 0; font-weight: 600; color: #333;">${resume.resumeName || 'Unnamed Resume'}</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                <i class="fas fa-calendar"></i> ${createdDate}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                <i class="fas fa-bolt"></i> ATS Score: ${resume.atsScore || 0}/100
              </p>
            </div>
            <div style="display: flex; gap: 6px;">
              <button onclick="deleteResumeConfirm('${resume._id}')" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>
            </div>
          </div>
        </div>
      `;
    });
    
    resumesList.innerHTML = html;
  } catch (error) {
    console.error('Error loading resumes:', error);
    resumesList.innerHTML = '<p style="color: #ef4444; text-align: center;">Error loading resumes</p>';
  }
}

// ============================================
// UI HELPERS
// ============================================

function switchAuthMode(mode) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authTitle = document.querySelector('.auth-modal-header h2');
  const switchModeBtn = document.getElementById('switch-auth-mode');

  if (mode === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    if (authTitle) authTitle.textContent = 'Login';
    if (switchModeBtn) switchModeBtn.textContent = "Don't have an account? Sign up";
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    if (authTitle) authTitle.textContent = 'Sign Up';
    if (switchModeBtn) switchModeBtn.textContent = 'Already have an account? Login';
  }
}

function showAuthMessage(message, type) {
  const messageDiv = document.getElementById('auth-message');
  if (!messageDiv) return;

  messageDiv.textContent = message;
  messageDiv.className = `auth-message ${type}`;
  messageDiv.style.display = 'block';

  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }
}

function openAuthModal() {
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.style.display = 'flex';
    switchAuthMode('login');
    clearAuthForm();
  }
}

function closeAuthModal() {
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.style.display = 'none';
    clearAuthForm();
  }
}

function clearAuthForm() {
  // Clear both login and register forms to avoid conflicts
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm) {
    const emailEl = loginForm.querySelector('#auth-email');
    const passwordEl = loginForm.querySelector('#auth-password');
    if (emailEl) emailEl.value = '';
    if (passwordEl) passwordEl.value = '';
  }
  
  if (registerForm) {
    const emailEl = registerForm.querySelector('#auth-email');
    const usernameEl = registerForm.querySelector('#auth-username');
    const passwordEl = registerForm.querySelector('#auth-password');
    const confirmPasswordEl = registerForm.querySelector('#auth-confirm-password');
    const yearEl = registerForm.querySelector('#auth-year');
    
    if (emailEl) emailEl.value = '';
    if (usernameEl) usernameEl.value = '';
    if (passwordEl) passwordEl.value = '';
    if (confirmPasswordEl) confirmPasswordEl.value = '';
    if (yearEl) yearEl.value = '';
  }
  
  const messageDiv = document.getElementById('auth-message');
  if (messageDiv) messageDiv.style.display = 'none';
}

function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userMenu = document.getElementById('user-dropdown');

  if (currentUser) {
    // User is logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenuBtn) {
      userMenuBtn.style.display = 'block';
      userMenuBtn.textContent = `👤 ${currentUser.username}`;
    }
  } else {
    // User is logged out
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (userMenuBtn) userMenuBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'none';
  }
}

function toggleUserDropdown() {
  const userMenu = document.getElementById('user-dropdown');
  if (userMenu) {
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
  }
}

// Show student profile when clicking profile button
function openStudentProfile(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  toggleUserDropdown();
  // Commented out to allow dropdown menu. Click menu item to see details
  // showStudentDetails();
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userMenu = document.getElementById('user-dropdown');
  
  if (userMenu && !userMenu.contains(e.target) && !userMenuBtn?.contains(e.target)) {
    userMenu.style.display = 'none';
  }
});

// ============================================
// MODAL EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Login button in navbar
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal();
    });
  }

  // Close auth modal
  const closeAuthModalBtn = document.querySelector('.auth-close-btn');
  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', closeAuthModal);
  }

  // Switch between login and register
  const switchModeBtn = document.getElementById('switch-auth-mode');
  if (switchModeBtn) {
    switchModeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const loginForm = document.getElementById('login-form');
      if (loginForm.style.display === 'none') {
        switchAuthMode('login');
      } else {
        switchAuthMode('register');
      }
    });
  }

  // Login form submit
  const loginFormEl = document.getElementById('login-form');
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      login();
    });
  }

  // Register form submit
  const registerFormEl = document.getElementById('register-form');
  if (registerFormEl) {
    registerFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      register();
    });
  }

  // User menu button
  const userMenuBtn = document.getElementById('user-menu-btn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', toggleUserDropdown);
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Close modal when clicking outside
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }
});
