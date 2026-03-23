/**
 * Saved Resumes Management
 */

window.openSavedResumesModal = async function() {
  if (!window.currentUser) {
    alert("❌ Please login first");
    return;
  }
  
  const modal = document.getElementById("saved-resumes-modal");
  if (!modal) return;
  
  modal.style.display = "flex";
  await loadResumes();
};

async function loadResumes() {
  if (!window.currentUser || !window.currentUser.token) return;

  try {
    const res = await fetch("http://localhost:5000/resumes", {
      headers: { Authorization: window.currentUser.token }
    });

    if (!res.ok) {
      alert("❌ Error loading resumes");
      return;
    }

    const data = await res.json();

    document.getElementById("saved-resumes-list").innerHTML = data.length === 0
      ? "<p>No saved resumes yet</p>"
      : data.map(r => `
        <div style="border: 1px solid #ddd; padding: 12px; margin: 8px 0; border-radius: 6px; background: #f9f9f9;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${r.resumeName}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">👤 ${r.name} | 📧 ${r.email}</p>
          <div style="display: flex; gap: 8px;">
            <button onclick="editResume('${r._id}')" style="background: #3b82f6; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">✏️ Edit</button>
            <button onclick="deleteResume('${r._id}')" style="background: #ef4444; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️ Delete</button>
          </div>
        </div>
      `).join("");
  } catch (err) {
    console.error("Error loading resumes:", err);
    alert("❌ Error loading resumes");
  }
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
      ? `http://localhost:5000/resume/${window.editingResumeId}`
      : "http://localhost:5000/save-resume";

    const method = window.editingResumeId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
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

    const data = await res.json();
    
    if (!res.ok) {
      alert("❌ Error: " + (data.message || "Failed to save resume"));
      return;
    }

    alert("✅ Resume saved successfully!");
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
    const res = await fetch(`http://localhost:5000/resume/${id}`, {
      headers: { Authorization: window.currentUser.token }
    });

    if (!res.ok) {
      alert("❌ Error loading resume");
      return;
    }

    const r = await res.json();

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
    ['full-name', 'email', 'phone', 'linkedin', 'summary', 'education', 'skills', 'projects', 'certifications', 'achievements'].forEach(fieldId => {
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
    
    alert("✏️ Edit mode enabled - modify and save");
  } catch (err) {
    console.error("Error editing resume:", err);
    alert("❌ Error loading resume");
  }
};

window.deleteResume = async function(id) {
  if (!window.currentUser || !window.currentUser.token) {
    alert("❌ Please login first");
    return;
  }

  if (!confirm("⚠️ Are you sure you want to delete this resume? This cannot be undone.")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/resume/${id}`, {
      method: "DELETE",
      headers: { Authorization: window.currentUser.token }
    });

    if (!res.ok) {
      alert("❌ Error deleting resume");
      return;
    }

    alert("✅ Resume deleted");
    await loadResumes();
  } catch (err) {
    console.error("Error deleting resume:", err);
    alert("❌ Error deleting resume");
  }
};