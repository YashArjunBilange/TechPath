/**
 * Saved Resumes Management
 */

window.openSavedResumesModal = async function() {
  if (!window.currentUser || !window.currentUser.token) {
    alert("❌ Please login first to view saved resumes");
    return;
  }

  const modal = document.getElementById("saved-resumes-modal");
  if (!modal) {
    alert("❌ Modal not found. Please reload the page.");
    return;
  }

  // Show loading state
  const listDiv = document.getElementById("saved-resumes-list");
  if (listDiv) {
    listDiv.innerHTML = "<p style='text-align: center; color: #666; padding: 20px;'>⏳ Loading resumes...</p>";
  }

  modal.style.display = "flex";
  await loadResumes();
};

async function loadResumes() {
  if (!window.currentUser || !window.currentUser.token) {
    console.error("❌ No authentication token");
    return;
  }

  const listDiv = document.getElementById("saved-resumes-list");
  if (!listDiv) {
    console.error("❌ saved-resumes-list div not found");
    return;
  }

  try {
    const data = await apiRequest('/resumes', {
      method: "GET",
      headers: {
        "Authorization": window.currentUser.token
      }
    });

    if (!Array.isArray(data) || data.length === 0) {
      listDiv.innerHTML = "<p style='text-align: center; color: #999; padding: 40px 20px;'>📋 No saved resumes yet. Create one to get started!</p>";
      return;
    }

    listDiv.innerHTML = data.map(r => `
      <div style="border: 1px solid #ddd; padding: 12px; margin: 8px 0; border-radius: 6px; background: #f9f9f9;">
        <h3 style="margin: 0 0 8px 0; color: #333;">${escapeHtml(r.resumeName || 'Untitled Resume')}</h3>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">👤 ${escapeHtml(r.name || 'N/A')} | 📧 ${escapeHtml(r.email || 'N/A')}</p>
        <div style="display: flex; gap: 8px;">
          <button onclick="window.editResume('${r._id}')" style="background: #3b82f6; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">✏️ Edit</button>
          <button onclick="window.deleteResume('${r._id}')" style="background: #ef4444; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️ Delete</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading resumes:", err);
    listDiv.innerHTML = `<p style='color: #dc2626; padding: 20px;'>❌ Error: ${escapeHtml(err.message)}</p>`;
  }
}

// Helper function to escape HTML characters
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.saveResumeToDB = async function() {
  if (!window.currentUser || !window.currentUser.token) {
    alert("❌ Please login to save resumes");
    return;
  }

  if (!window.currentResumeData) {
    alert("❌ Please generate a preview first");
    return;
  }

  const resumeName = prompt("Enter a name for this resume:", `Resume ${new Date().toLocaleDateString()}`);
  if (!resumeName) return;

  try {
    const url = window.editingResumeId
      ? `${API_BASE_URL}/resume/${window.editingResumeId}`
      : `${API_BASE_URL}/save-resume`;

    const method = window.editingResumeId ? "PUT" : "POST";

    await apiRequest(url.replace(API_BASE_URL, ""), {
      method,
      headers: {
        "Authorization": window.currentUser.token
      },
      body: JSON.stringify({
        resumeName,
        name: window.currentResumeData.fullName,
        email: window.currentResumeData.email,
        phone: window.currentResumeData.phone,
        linkedin: window.currentResumeData.linkedin,
        summary: window.currentResumeData.summary,
        education: window.currentResumeData.education,
        skills: window.currentResumeData.skills,
        projects: window.currentResumeData.projects,
        certifications: window.currentResumeData.certifications,
        achievements: window.currentResumeData.achievements,
        atsScore: 75
      })
    });

    alert(`✅ Resume ${window.editingResumeId ? 'updated' : 'saved'} successfully!`);
    window.editingResumeId = null;
  } catch (err) {
    console.error("Error saving resume:", err);
    alert("❌ Error saving resume: " + err.message);
  }
};

window.editResume = async function(id) {
  if (!window.currentUser || !window.currentUser.token) {
    alert("❌ Please login first");
    return;
  }

  try {
    const r = await apiRequest(`/resume/${id}`, {
      headers: { Authorization: window.currentUser.token }
    });

    // Check if form fields exist
    const fields = ["full-name", "email", "phone", "linkedin", "summary", "education", "skills", "projects", "certifications", "achievements"];
    const missingFields = fields.filter(fieldId => !document.getElementById(fieldId));

    if (missingFields.length > 0) {
      alert("❌ Form fields not found. Please close resume modal and try again.");
      return;
    }

    // Load all 10 fields
    document.getElementById("full-name").value = r.name || '';
    document.getElementById("email").value = r.email || '';
    document.getElementById("phone").value = r.phone || '';
    document.getElementById("linkedin").value = r.linkedin || '';
    document.getElementById("summary").value = r.summary || '';
    document.getElementById("education").value = r.education || '';
    document.getElementById("skills").value = r.skills || '';
    document.getElementById("projects").value = r.projects || '';
    document.getElementById("certifications").value = r.certifications || '';
    document.getElementById("achievements").value = r.achievements || '';

    // Update all counters
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      const counter = document.getElementById(fieldId + "-counter");
      if (field && counter) {
        const maxVal = fieldId === "phone" ? 20 : (["full-name", "email", "linkedin"].includes(fieldId) ? 100 : 500);
        counter.innerText = `${field.value.length}/${maxVal}`;
      }
    });

    window.editingResumeId = id;

    // Close saved resumes modal and open resume modal
    const savedModal = document.getElementById("saved-resumes-modal");
    if (savedModal) savedModal.style.display = "none";

    const resumeModal = document.getElementById("resume-modal");
    if (resumeModal) resumeModal.style.display = "flex";

    alert("✏️ Edit mode enabled - modify and save to update");
  } catch (err) {
    console.error("Error editing resume:", err);
    alert("❌ Error loading resume: " + err.message);
  }
};

window.deleteResume = async function(id) {
  if (!window.currentUser || !window.currentUser.token) {
    alert("❌ Please login first");
    return;
  }

  if (!confirm("⚠️ Are you sure you want to delete this resume? This action cannot be undone.")) {
    return;
  }

  try {
    await apiRequest(`/resume/${id}`, {
      method: "DELETE",
      headers: { Authorization: window.currentUser.token }
    });

    alert("✅ Resume deleted successfully");
    await loadResumes();
  } catch (err) {
    console.error("Error deleting resume:", err);
    alert("❌ Error deleting resume: " + err.message);
  }
};