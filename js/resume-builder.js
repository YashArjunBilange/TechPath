/**
 * Resume Builder - Complete Implementation
 */

(function () {
  const preview = document.getElementById("preview-content");
  const SUGGESTION_TARGET_FIELDS = ["summary", "skills", "projects", "achievements"];

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

  // ---------- AI Suggestion Module ----------
  const ResumeAISuggestions = (function () {
    let styleInjected = false;
    const debounceTimers = new Map();
    const fieldState = new Map();

    function injectStyles() {
      if (styleInjected) return;
      styleInjected = true;
      const style = document.createElement("style");
      style.textContent = `
        .ai-suggest-wrap {
          margin: 6px 0 12px;
          padding: 10px;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          background: #f8fbff;
        }
        .ai-suggest-title {
          font-size: 12px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .ai-suggest-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .ai-suggest-btn {
          border: none;
          background: #2563eb;
          color: #fff;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }
        .ai-suggest-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .ai-suggest-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #bfdbfe;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: ai-spin 1s linear infinite;
          display: none;
        }
        .ai-suggest-message {
          font-size: 12px;
          color: #475569;
        }
        .ai-suggest-message.error {
          color: #b91c1c;
        }
        .ai-suggestion-list {
          display: grid;
          gap: 8px;
        }
        .ai-suggestion-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          justify-content: space-between;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          padding: 8px 10px;
          background: #fff;
        }
        .ai-suggestion-text {
          color: #0f172a;
          font-size: 13px;
          line-height: 1.35;
          flex: 1;
        }
        .ai-insert-btn {
          border: 1px solid #065f46;
          background: #10b981;
          color: #ffffff;
          border-radius: 6px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }
        @keyframes ai-spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    function debounceByField(fieldId, fn, delay = 700) {
      return (...args) => {
        if (debounceTimers.has(fieldId)) {
          clearTimeout(debounceTimers.get(fieldId));
        }
        const timer = setTimeout(() => fn(...args), delay);
        debounceTimers.set(fieldId, timer);
      };
    }

    function getFieldLabel(field) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      return label ? label.textContent.trim() : field.id;
    }

    function gatherContext(field) {
      const summary = document.getElementById("summary");
      const skills = document.getElementById("skills");
      const projects = document.getElementById("projects");
      const achievements = document.getElementById("achievements");
      const summaryText = summary ? summary.value.trim() : "";
      const skillsText = skills ? skills.value.trim() : "";
      const projectsText = projects ? projects.value.trim() : "";
      const achievementsText = achievements ? achievements.value.trim() : "";

      if (field.id === "summary") {
        return {
          targetField: "summary",
          role: "Professional Summary",
          title: "Professional Summary",
          description: "Rewrite this as a concise professional summary. Do not format as project bullets.",
          skills: skillsText,
          sourceText: field.value.trim()
        };
      }

      if (field.id === "skills") {
        return {
          targetField: "skills",
          role: "Skills",
          title: "Skills Section",
          description: "Rewrite and organize these skills for ATS readability.",
          skills: skillsText,
          sourceText: field.value.trim()
        };
      }

      if (field.id === "projects") {
        return {
          targetField: "projects",
          role: "Projects",
          title: "Project Experience",
          description: "Rewrite as impact-focused project bullets.",
          skills: skillsText,
          sourceText: field.value.trim()
        };
      }

      return {
        targetField: "achievements",
        role: summaryText.split("\n")[0] || "AI Engineer",
        title: "Achievements",
        description: achievementsText || projectsText,
        skills: skillsText,
        sourceText: field.value.trim()
      };
    }

    function validateContext(payload) {
      const sourceText = (payload.sourceText || "").trim();
      if (sourceText.length < 8) {
        return "Please write more in this field, then use Suggest with AI to improve it.";
      }
      return "";
    }

    async function fetchSuggestions(payload) {
      const response = await fetch(`${API_BASE_URL}/api/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const contentType = response.headers.get("content-type") || "";
      const rawBody = await response.text();
      let data = {};

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(rawBody || "{}");
        } catch {
          throw new Error("Suggestion API returned invalid JSON.");
        }
      } else {
        if (rawBody.trim().startsWith("<!DOCTYPE") || rawBody.trim().startsWith("<html")) {
          throw new Error("Suggestion API route not found. Restart backend or use correct API_BASE_URL.");
        }
        throw new Error("Suggestion API returned non-JSON response.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate suggestions");
      }
      return Array.isArray(data.suggestions) ? data.suggestions : [];
    }

    function insertSuggestion(field, text) {
      const cleanText = text.replace(/^\s*[-*•]\s*/, "").trim();
      if (!cleanText) return;
      const separator = field.value.trim() ? "\n" : "";
      field.value = `${field.value.trim()}${separator}${cleanText}`.trim();
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function createSuggestionUI(field) {
      const wrapper = document.createElement("div");
      wrapper.className = "ai-suggest-wrap";
      wrapper.style.display = "none";
      const fieldLabel = getFieldLabel(field);
      wrapper.innerHTML = `
        <div class="ai-suggest-title">AI Suggestions for ${fieldLabel}</div>
        <div class="ai-suggest-actions">
          <button type="button" class="ai-suggest-btn">Improve with AI</button>
          <div class="ai-suggest-spinner"></div>
          <span class="ai-suggest-message"></span>
        </div>
        <div class="ai-suggestion-list"></div>
      `;

      const suggestBtn = wrapper.querySelector(".ai-suggest-btn");
      const spinner = wrapper.querySelector(".ai-suggest-spinner");
      const messageEl = wrapper.querySelector(".ai-suggest-message");
      const listEl = wrapper.querySelector(".ai-suggestion-list");

      function setLoading(isLoading) {
        suggestBtn.disabled = isLoading;
        spinner.style.display = isLoading ? "inline-block" : "none";
        if (isLoading) {
          messageEl.classList.remove("error");
          messageEl.textContent = "Generating suggestions...";
        }
      }

      function renderSuggestions(suggestions) {
        listEl.innerHTML = "";
        if (!suggestions.length) {
          messageEl.classList.add("error");
          messageEl.textContent = "No suggestions generated. Try adding more context.";
          return;
        }
        messageEl.classList.remove("error");
        messageEl.textContent = "Click Insert to add a bullet point.";

        suggestions.forEach((item) => {
          const row = document.createElement("div");
          row.className = "ai-suggestion-item";
          row.innerHTML = `
            <div class="ai-suggestion-text">${item}</div>
            <button type="button" class="ai-insert-btn">Insert</button>
          `;
          const insertBtn = row.querySelector(".ai-insert-btn");
          insertBtn.addEventListener("click", () => insertSuggestion(field, item));
          listEl.appendChild(row);
        });
      }

      const triggerSuggest = debounceByField(field.id, async () => {
        const payload = gatherContext(field);
        const validationError = validateContext(payload);
        if (validationError) {
          messageEl.classList.add("error");
          messageEl.textContent = validationError;
          return;
        }

        setLoading(true);
        try {
          const suggestions = await fetchSuggestions(payload);
          renderSuggestions(suggestions);
        } catch (error) {
          messageEl.classList.add("error");
          messageEl.textContent = error.message || "Failed to generate suggestions.";
        } finally {
          setLoading(false);
        }
      }, 650);

      suggestBtn.addEventListener("click", triggerSuggest);
      fieldState.set(field.id, { wrapper, messageEl, listEl });
      return wrapper;
    }

    function bindField(fieldId) {
      const field = document.getElementById(fieldId);
      if (!field || fieldState.has(fieldId)) return;

      const ui = createSuggestionUI(field);
      const counter = document.getElementById(`${fieldId}-counter`);
      if (counter && counter.parentNode) {
        counter.parentNode.insertBefore(ui, counter.nextSibling);
      } else if (field.parentNode) {
        field.parentNode.insertBefore(ui, field.nextSibling);
      }

      const showIfRelevant = () => {
        const state = fieldState.get(fieldId);
        if (!state) return;
        state.wrapper.style.display = "block";
        if (!field.value.trim()) {
          state.listEl.innerHTML = "";
          state.messageEl.classList.remove("error");
          state.messageEl.textContent = "Add context, then click Improve with AI.";
        }
      };

      field.addEventListener("focus", showIfRelevant);
      field.addEventListener("input", showIfRelevant);
    }

    function init() {
      injectStyles();
      SUGGESTION_TARGET_FIELDS.forEach(bindField);
    }

    return { init };
  })();

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

  ResumeAISuggestions.init();
})();