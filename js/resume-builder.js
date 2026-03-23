/**
 * Resume Builder - Complete Implementation
 */

(function () {
  const preview = document.getElementById("preview-content");

  const fields = [
    "full-name","email","phone","linkedin",
    "summary","education","skills","projects",
    "certifications","achievements"
  ];

  // Setup counters with correct max values
  setupCounter("full-name", 100);
  setupCounter("email", 100);
  setupCounter("phone", 20);
  setupCounter("linkedin", 100);
  setupCounter("summary", 500);
  setupCounter("education", 500);
  setupCounter("skills", 500);
  setupCounter("projects", 500);
  setupCounter("certifications", 500);
  setupCounter("achievements", 500);

  function setupCounter(fieldId, max) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(fieldId + "-counter");

    if (!field || !counter) return;

    counter.innerText = `${field.value.length}/${max}`;

    field.addEventListener("input", () => {
      if (field.value.length > max) {
        field.value = field.value.substring(0, max);
      }
      counter.innerText = `${field.value.length}/${max}`;
    });
  }

  function formatLines(text) {
    return text
      .split("\n")
      .filter(l => l.trim())
      .map(l => `• ${l}`)
      .join("<br>");
  }

  function calculateATS(data) {
    let score = 0;
    const text = (data.skills + data.projects + data.certifications).toLowerCase();

    ["python","machine learning","sql","ai","api"].forEach(k => {
      if (text.includes(k)) score += 5;
    });

    if (/\d+%/.test(text)) score += 20;
    if (data.projects.length > 50) score += 10;
    if (data.certifications.length > 20) score += 10;
    if (data.email.includes("@")) score += 10;
    if (data.fullName) score += 10;

    return Math.min(score, 100);
  }

  function generateResume() {
    if (!preview) return;

    // Get all form fields with null checks
    const fullNameEl = document.getElementById("full-name");
    const emailEl = document.getElementById("email");
    const phoneEl = document.getElementById("phone");
    const linkedinEl = document.getElementById("linkedin");
    const summaryEl = document.getElementById("summary");
    const educationEl = document.getElementById("education");
    const skillsEl = document.getElementById("skills");
    const projectsEl = document.getElementById("projects");
    const certificationsEl = document.getElementById("certifications");
    const achievementsEl = document.getElementById("achievements");

    if (!fullNameEl || !emailEl) {
      alert("❌ Form elements not found. Please close and reopen the modal.");
      return;
    }

    const data = {
      fullName: fullNameEl.value.trim(),
      email: emailEl.value.trim(),
      phone: phoneEl ? phoneEl.value.trim() : '',
      linkedin: linkedinEl ? linkedinEl.value.trim() : '',
      summary: summaryEl ? summaryEl.value.trim() : '',
      education: educationEl ? educationEl.value.trim() : '',
      skills: skillsEl ? skillsEl.value.trim() : '',
      projects: projectsEl ? projectsEl.value.trim() : '',
      certifications: certificationsEl ? certificationsEl.value.trim() : '',
      achievements: achievementsEl ? achievementsEl.value.trim() : ''
    };

    if (!data.fullName || !data.email) {
      alert("❌ Name and Email required");
      return;
    }

    window.currentResumeData = data;
    const score = calculateATS(data);
    const yearOfStudy = window.currentUser?.yearOfStudy || '';
    const currentYear = new Date().getFullYear();

    preview.innerHTML = `
      <div class="resume">
        <div class="header">
          <h1>${data.fullName}</h1>
          <p>${data.email} | ${data.phone} | ${data.linkedin}</p>
          ${yearOfStudy ? `<p style="font-size: 0.9rem; color: #666;">Year ${yearOfStudy} | ${currentYear}</p>` : `<p style="font-size: 0.9rem; color: #666;">${currentYear}</p>`}
        </div>

        ${data.summary ? `<section><h2>Summary</h2><p>${data.summary}</p></section>` : ""}
        ${data.education ? `<section><h2>Education</h2><p>${formatLines(data.education)}</p></section>` : ""}
        ${data.skills ? `<section><h2>Skills</h2><ul>${data.skills.split(",").map(s=>`<li>${s.trim()}</li>`).join("")}</ul></section>` : ""}
        ${data.projects ? `<section><h2>Projects</h2><p>${formatLines(data.projects)}</p></section>` : ""}
        ${data.certifications ? `<section><h2>Certifications</h2><p>${formatLines(data.certifications)}</p></section>` : ""}
        ${data.achievements ? `<section><h2>Achievements</h2><p>${formatLines(data.achievements)}</p></section>` : ""}

        <div class="ats">
          <strong>ATS Score: ${score}/100</strong>
        </div>
      </div>
    `;
  }

  function downloadPDF() {
    if (!preview || !preview.innerHTML) {
      alert("❌ Generate preview first");
      return;
    }
    const win = window.open("", "", "width=900,height=1000");
    win.document.write(`<html><head><style>body{font-family:Arial;padding:20px;}</style></head><body>${preview.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  }

  function clearForm() {
    document.getElementById("resume-form").reset();
    preview.innerHTML = "";
    fields.forEach(id => {
      const counter = document.getElementById(id + "-counter");
      if (counter) counter.innerText = `0/${id === "phone" ? 20 : (["full-name", "email", "linkedin"].includes(id) ? 100 : 500)}`;
    });
  }

  // Event Listeners
  const generateBtn = document.getElementById("generate-resume");
  const saveBtn = document.getElementById("save-resume-btn");
  const downloadBtn = document.getElementById("download-pdf");
  const clearBtn = document.getElementById("clear-form");
  const viewBtn = document.getElementById("view-resumes");

  if (generateBtn) generateBtn.addEventListener("click", generateResume);
  if (downloadBtn) downloadBtn.addEventListener("click", downloadPDF);
  if (clearBtn) clearBtn.addEventListener("click", clearForm);

  if (saveBtn) {
    saveBtn.addEventListener("click", window.saveResumeToDB);
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.openSavedResumesModal) window.openSavedResumesModal();
    });
  }
})();