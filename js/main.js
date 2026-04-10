/**
 * main.js – Global interactions, mobile menu, modal, canvas bg, smooth scroll, active nav
 * AI Engineering Roadmap EdTech SaaS
 */

(function() {
  'use strict';
  async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await apiRequest('/register', {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  alert("Registered!");
}
  
  async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const data = await apiRequest('/login', {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  localStorage.setItem("token", data.token);

  alert("Login successful");
}

  async function saveResumeToDB(data) {
  const token = localStorage.getItem("token");

  await apiRequest('/save-resume', {
    method: "POST",
    headers: {
      "Authorization": token
    },
    body: JSON.stringify(data)
  });

  alert("Saved!");
}  

  // ---------- MOBILE HAMBURGER TOGGLE ----------
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');
  
  if (hamburger && navbar) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      const expanded = hamburger.getAttribute('aria-expanded') === 'true' ? false : true;
      hamburger.setAttribute('aria-expanded', expanded);
      navbar.classList.toggle('active');
      
      const bars = hamburger.querySelectorAll('.bar');
      bars.forEach(bar => bar.classList.toggle('active'));
    });
    
    document.addEventListener('click', function(event) {
      if (!navbar.contains(event.target) && !hamburger.contains(event.target)) {
        navbar.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- SMOOTH SCROLL FOR INTERNAL LINKS ----------
  // Exclude resume-trigger links from smooth scroll
  const smoothLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]):not([id*="resume"])');
  smoothLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---------- ACTIVE NAVIGATION HIGHLIGHT ----------
  function applyTheme(theme) {
    const root = document.body;
    if (!root) return;
    if (theme === 'dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }

  function initThemeToggle() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    const savedTheme = localStorage.getItem('techpath-theme') || 'light';
    applyTheme(savedTheme);

    if (document.getElementById('theme-toggle')) return;

    const switchItem = document.createElement('li');
    switchItem.className = 'theme-switch-item';
    switchItem.innerHTML = `
      <div class="theme-switch-wrap" title="Toggle night mode">
        <i class="fas fa-moon" aria-hidden="true"></i>
        <label class="theme-switch" for="theme-toggle" aria-label="Night mode switch">
          <input type="checkbox" id="theme-toggle" />
          <span class="theme-slider"></span>
        </label>
      </div>
    `;

    navMenu.insertBefore(switchItem, navMenu.firstElementChild);

    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    themeToggle.checked = savedTheme === 'dark';
    themeToggle.addEventListener('change', () => {
      const nextTheme = themeToggle.checked ? 'dark' : 'light';
      applyTheme(nextTheme);
      localStorage.setItem('techpath-theme', nextTheme);
    });
  }

  initThemeToggle();

  const navLinks = document.querySelectorAll('a.nav-link');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Don't highlight resume-trigger links
    if (href && href !== '#') {
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });

  // ---------- RESUME BUILDER MODAL OPEN/CLOSE ----------
  const resumeTriggers = document.querySelectorAll('#resume-trigger');
  const resumeModal = document.getElementById('resume-modal');
  const closeModalBtn = document.querySelector('.close-modal');
  
  if (resumeModal) {
    function openModal(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      resumeModal.style.display = 'flex';
    }
    
    function closeModal(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      resumeModal.style.display = 'none';
    }
    
    resumeTriggers.forEach(trigger => {
      if (trigger) {
        trigger.addEventListener('click', openModal);
      }
    });
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking on backdrop
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeModal(e);
      }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resumeModal.style.display === 'flex') {
        closeModal();
      }
    });
  }

  // ---------- NEURAL NETWORK CANVAS BACKGROUND ----------
  const canvas = document.getElementById('neural-canvas');
  if (canvas) {
    let ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    const NODE_COUNT = 40;
    
    function initCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 2
        });
      }
    }
    
    function drawNodes() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#3b82f6';
        ctx.fill();
        
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > width) node.vx *= -0.9;
        if (node.y < 0 || node.y > height) node.vy *= -0.9;
        
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
      });
      
      requestAnimationFrame(drawNodes);
    }
    
    window.addEventListener('resize', () => {
      initCanvas();
    });
    
    initCanvas();
    drawNodes();
  }

  // ---------- NEWSLETTER PLACEHOLDER ----------
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('📬 Thanks for subscribing! You will receive weekly AI roadmap updates.');
      this.reset();
    });
  }

  // ---------- TECHPATH CHATBOT (GROQ API) ----------
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function initChatbot() {
    if (!document.body || document.getElementById('techpath-chatbot-root')) return;

    const chatbotStyle = document.createElement('style');
    chatbotStyle.textContent = `
      .tp-chatbot-toggle {
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 56px;
        height: 56px;
        border: none;
        border-radius: 50%;
        background: linear-gradient(145deg, #2563eb, #7c3aed);
        color: #fff;
        box-shadow: 0 12px 30px rgba(37, 99, 235, 0.45);
        cursor: pointer;
        z-index: 1200;
        font-size: 22px;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        animation: tpBotPulse 2.4s ease-in-out infinite;
      }
      .tp-chatbot-toggle:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 16px 36px rgba(37, 99, 235, 0.5);
      }
      .tp-chatbot-panel {
        position: fixed;
        right: 20px;
        bottom: 88px;
        width: min(560px, calc(100vw - 24px));
        height: min(720px, calc(100vh - 90px));
        background: linear-gradient(180deg, #ffffff, #f8fbff);
        border: 1px solid #dbeafe;
        border-radius: 18px;
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
        display: none;
        flex-direction: column;
        z-index: 1200;
        overflow: hidden;
      }
      .tp-chatbot-panel::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(circle at 15% 10%, rgba(59,130,246,0.18), transparent 40%),
                    radial-gradient(circle at 85% 92%, rgba(139,92,246,0.16), transparent 40%);
      }
      .tp-chatbot-panel.active { display: flex; }
      .tp-chatbot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        background: linear-gradient(90deg, #1e40af, #2563eb 55%, #7c3aed);
        color: #fff;
        font-weight: 600;
        position: relative;
        z-index: 1;
      }
      .tp-chatbot-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.2px;
        text-shadow: 0 1px 8px rgba(15, 23, 42, 0.24);
      }
      .tp-chatbot-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
        border: 1px solid rgba(255, 255, 255, 0.26);
      }
      .tp-bot-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #34d399;
        box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
        animation: tpOnlinePulse 1.6s infinite;
      }
      .tp-chatbot-header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .tp-chatbot-close {
        border: none;
        background: transparent;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
      }
      .tp-chatbot-mute {
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        border-radius: 8px;
        font-size: 12px;
        padding: 6px 8px;
        cursor: pointer;
      }
      .tp-chatbot-dictate {
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: rgba(15, 23, 42, 0.18);
        color: #e2e8f0;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.2px;
        padding: 6px 12px;
        cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      }
      .tp-chatbot-dictate:hover {
        transform: translateY(-1px);
      }
      .tp-chatbot-dictate.on {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(52, 211, 153, 0.6);
        color: #d1fae5;
      }
      .tp-chatbot-dictate.off {
        background: rgba(30, 41, 59, 0.28);
        border-color: rgba(148, 163, 184, 0.45);
        color: #cbd5e1;
      }
      .tp-chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
        background: linear-gradient(180deg, #eff6ff, #eef2ff);
        position: relative;
        z-index: 1;
      }
      .tp-chat-preview {
        margin: 0 0 10px 0;
        padding: 8px;
        border: 1px solid #bfdbfe;
        border-radius: 10px;
        background: #fff;
      }
      .tp-chat-preview img,
      .tp-chat-preview video,
      .tp-chat-preview iframe {
        width: 100%;
        max-height: 180px;
        object-fit: contain;
        border-radius: 8px;
      }
      .tp-chat-preview p {
        margin: 0;
        font-size: 12px;
        color: #1e3a8a;
      }
      .tp-chat-msg {
        margin-bottom: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        line-height: 1.45;
        white-space: pre-wrap;
        font-size: 14px;
        animation: tpMsgIn 0.28s ease;
      }
      .tp-chat-msg.user {
        background: linear-gradient(180deg, #dbeafe, #bfdbfe);
        border: 1px solid #93c5fd;
        margin-left: 24px;
      }
      .tp-chat-msg.assistant {
        background: #ffffff;
        border: 1px solid #dbeafe;
        margin-right: 24px;
      }
      .tp-chat-msg.greeting {
        margin: 8px auto 16px;
        text-align: center;
        font-size: 26px;
        font-weight: 700;
        line-height: 1.25;
        border-radius: 16px;
        padding: 16px 22px;
        max-width: calc(100% - 48px);
        color: #1e3a8a;
        background: linear-gradient(135deg, #dbeafe, #ede9fe);
        border: 1px solid #bfdbfe;
      }
      .tp-chat-msg.typing {
        width: fit-content;
        min-width: 62px;
      }
      .tp-typing-dots {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .tp-typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #93c5fd;
        animation: tpDotBounce 1.2s infinite ease-in-out;
      }
      .tp-typing-dots span:nth-child(2) { animation-delay: 0.15s; }
      .tp-typing-dots span:nth-child(3) { animation-delay: 0.3s; }
      .tp-chatbot-form {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        padding: 10px;
        border-top: 1px solid #e2e8f0;
        background: #fff;
        position: relative;
        z-index: 1;
      }
      .tp-chatbot-row {
        display: flex;
        gap: 8px;
        grid-column: 1 / 3;
      }
      .tp-chatbot-input {
        flex: 1;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 10px;
        font-size: 14px;
      }
      .tp-chatbot-tools {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .tp-chatbot-tool-btn,
      .tp-chatbot-file-btn {
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        border-radius: 8px;
        padding: 8px 10px;
        min-height: 40px;
        cursor: pointer;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #1e293b;
        font-weight: 600;
        transition: transform 0.18s ease, background 0.2s ease, border-color 0.2s ease;
      }
      .tp-chatbot-tool-btn.icon-only {
        width: 40px;
        min-width: 40px;
        justify-content: center;
        padding: 8px;
      }
      .tp-chatbot-tool-btn:hover,
      .tp-chatbot-file-btn:hover {
        transform: translateY(-1px);
        border-color: #93c5fd;
        background: #eff6ff;
      }
      .tp-chatbot-file-btn i,
      .tp-chatbot-tool-btn i {
        font-size: 14px;
      }
      .tp-chatbot-image-name {
        grid-column: 1 / 3;
        font-size: 12px;
        color: #334155;
      }
      .tp-chatbot-help {
        grid-column: 1 / 3;
        font-size: 11px;
        color: #64748b;
      }
      .tp-chatbot-send {
        border: none;
        background: linear-gradient(145deg, #2563eb, #7c3aed);
        color: #fff;
        border-radius: 8px;
        padding: 0 16px;
        font-weight: 600;
        cursor: pointer;
        height: 40px;
        transition: transform 0.2s ease, filter 0.2s ease;
      }
      .tp-chatbot-send:hover {
        transform: translateY(-1px);
        filter: brightness(1.08);
      }
      .tp-chatbot-send:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .tp-chatbot-locked .tp-chatbot-input,
      .tp-chatbot-locked .tp-chatbot-tool-btn,
      .tp-chatbot-locked .tp-chatbot-image-btn,
      .tp-chatbot-locked .tp-chatbot-send {
        opacity: 0.5;
        pointer-events: none;
      }
      body.dark-mode .tp-chatbot-panel {
        background: linear-gradient(180deg, #0f172a, #111827);
        border-color: #334155;
      }
      body.dark-mode .tp-chatbot-messages {
        background: #0b1220;
      }
      body.dark-mode .tp-chat-msg.assistant {
        background: #111827;
        border-color: #334155;
        color: #e2e8f0;
      }
      body.dark-mode .tp-chat-msg.user {
        background: linear-gradient(180deg, #1e3a8a, #1d4ed8);
        border-color: #2563eb;
        color: #e0f2fe;
      }
      body.dark-mode .tp-chatbot-form {
        background: #0f172a;
        border-top-color: #334155;
      }
      body.dark-mode .tp-chatbot-input,
      body.dark-mode .tp-chatbot-tool-btn,
      body.dark-mode .tp-chatbot-file-btn {
        background: #111827;
        border-color: #334155;
        color: #e2e8f0;
      }
      body.dark-mode .tp-chat-msg.greeting {
        color: #dbeafe;
        background: linear-gradient(135deg, rgba(30,58,138,0.45), rgba(91,33,182,0.45));
        border-color: #334155;
      }
      body.dark-mode .tp-chatbot-help,
      body.dark-mode .tp-chatbot-image-name {
        color: #94a3b8;
      }
      body.dark-mode .tp-chatbot-title {
        background: rgba(30, 41, 59, 0.55);
        border-color: rgba(148, 163, 184, 0.34);
      }
      body.dark-mode .tp-chatbot-dictate.off {
        background: rgba(15, 23, 42, 0.72);
        border-color: #475569;
      }
      body.dark-mode .tp-chatbot-dictate.on {
        background: rgba(5, 150, 105, 0.28);
        border-color: rgba(52, 211, 153, 0.45);
      }
      @keyframes tpBotPulse {
        0%, 100% { box-shadow: 0 12px 30px rgba(37, 99, 235, 0.45); }
        50% { box-shadow: 0 16px 36px rgba(124, 58, 237, 0.48); }
      }
      @keyframes tpOnlinePulse {
        0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.65); }
        70% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
        100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
      }
      @keyframes tpMsgIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes tpDotBounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
        40% { transform: translateY(-4px); opacity: 1; }
      }
    `;
    document.head.appendChild(chatbotStyle);

    const root = document.createElement('div');
    root.id = 'techpath-chatbot-root';
    root.innerHTML = `
      <button type="button" class="tp-chatbot-toggle" id="tp-chatbot-toggle" aria-label="Open chatbot">🤖</button>
      <section class="tp-chatbot-panel" id="tp-chatbot-panel" aria-label="TechPath chatbot">
        <header class="tp-chatbot-header">
          <span class="tp-chatbot-brand"><span class="tp-bot-dot"></span><span class="tp-chatbot-title">🤖 TechPath AI Assistant</span></span>
          <div class="tp-chatbot-header-actions">
            <button type="button" class="tp-chatbot-dictate on" id="tp-chatbot-dictate" aria-label="Repeat last answer">🔁 Dictate On</button>
            <button type="button" class="tp-chatbot-close" id="tp-chatbot-close" aria-label="Close chatbot">&times;</button>
          </div>
        </header>
        <div class="tp-chatbot-messages" id="tp-chatbot-messages"></div>
        <form class="tp-chatbot-form" id="tp-chatbot-form">
          <div class="tp-chatbot-row">
            <input class="tp-chatbot-input" id="tp-chatbot-input" type="text" placeholder="Ask anything about roadmap, projects, resumes..." />
            <div class="tp-chatbot-tools">
              <label class="tp-chatbot-file-btn" for="tp-chatbot-image" title="Attach image"><i class="fas fa-image"></i> Images</label>
              <input id="tp-chatbot-image" type="file" accept="image/*" hidden />
              <label class="tp-chatbot-file-btn" for="tp-chatbot-doc" title="Attach document"><i class="fas fa-file-alt"></i> Docs</label>
              <input id="tp-chatbot-doc" type="file" accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx" hidden />
              <label class="tp-chatbot-file-btn" for="tp-chatbot-video" title="Attach video"><i class="fas fa-video"></i> Videos</label>
              <input id="tp-chatbot-video" type="file" accept="video/*" hidden />
              <button class="tp-chatbot-tool-btn icon-only" id="tp-chatbot-mic" type="button" title="Voice input" aria-label="Voice input"><i class="fas fa-microphone"></i></button>
              <button class="tp-chatbot-send" id="tp-chatbot-send" type="submit">Send</button>
            </div>
          </div>
          <div class="tp-chatbot-image-name" id="tp-chatbot-image-name"></div>
          <div class="tp-chatbot-help">You can attach image, document, or video. Dictate mode repeats the latest answer.</div>
        </form>
      </section>
    `;
    document.body.appendChild(root);

    const toggleBtn = document.getElementById('tp-chatbot-toggle');
    const closeBtn = document.getElementById('tp-chatbot-close');
    const panel = document.getElementById('tp-chatbot-panel');
    const form = document.getElementById('tp-chatbot-form');
    const input = document.getElementById('tp-chatbot-input');
    const sendBtn = document.getElementById('tp-chatbot-send');
    const messagesEl = document.getElementById('tp-chatbot-messages');
    const micBtn = document.getElementById('tp-chatbot-mic');
    const imageInput = document.getElementById('tp-chatbot-image');
    const docInput = document.getElementById('tp-chatbot-doc');
    const videoInput = document.getElementById('tp-chatbot-video');
    const imageNameEl = document.getElementById('tp-chatbot-image-name');
    const dictateBtn = document.getElementById('tp-chatbot-dictate');
    const chatHistory = [];
    let selectedImage = '';
    let selectedAttachment = null;
    let isMuted = false;
    let dictateLoopEnabled = true;
    let lastAssistantReply = '';
    let authSnapshot = '';
    const canUseSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const canUseSpeechSynthesis = !!window.speechSynthesis;

    function addMessage(role, content) {
      if (!messagesEl) return;
      const msg = document.createElement('div');
      msg.className = `tp-chat-msg ${role}`;
      msg.innerHTML = escapeHtml(content);
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTypingIndicator() {
      if (!messagesEl) return null;
      const typing = document.createElement('div');
      typing.className = 'tp-chat-msg assistant typing';
      typing.innerHTML = '<span class="tp-typing-dots"><span></span><span></span><span></span></span>';
      messagesEl.appendChild(typing);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return typing;
    }

    function addAttachmentPreview(attachment) {
      if (!messagesEl || !attachment) return;
      const wrap = document.createElement('div');
      wrap.className = 'tp-chat-preview';

      if (attachment.type === 'image') {
        wrap.innerHTML = `<img src="${escapeHtml(attachment.dataUrl)}" alt="${escapeHtml(attachment.name)}" />`;
      } else if (attachment.type === 'video') {
        wrap.innerHTML = `<video controls src="${escapeHtml(attachment.dataUrl)}"></video>`;
      } else if (attachment.type === 'doc') {
        if (attachment.mime === 'application/pdf') {
          wrap.innerHTML = `<iframe src="${escapeHtml(attachment.dataUrl)}" title="${escapeHtml(attachment.name)}"></iframe>`;
        } else {
          wrap.innerHTML = `<p>📄 ${escapeHtml(attachment.name)}</p>`;
        }
      }

      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setSendingState(isSending) {
      if (sendBtn) sendBtn.disabled = isSending;
      if (input) input.disabled = isSending;
      if (micBtn) micBtn.disabled = isSending;
      if (imageInput) imageInput.disabled = isSending;
      if (docInput) docInput.disabled = isSending;
      if (videoInput) videoInput.disabled = isSending;
    }

    function speakReply(text) {
      if (!canUseSpeechSynthesis || !text || isMuted) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = function() {
        if (dictateLoopEnabled && !isMuted) {
          speakReply(text);
        }
      };
      window.speechSynthesis.speak(utterance);
    }

    function getAuthState() {
      const token = localStorage.getItem('authToken');
      const username = localStorage.getItem('username');
      return {
        isLoggedIn: !!(token && username),
        username: username || 'Student'
      };
    }

    function ensureLockMessage() {
      if (!messagesEl) return;
      if (messagesEl.children.length === 0) {
        addMessage('assistant', 'Log in to Ask');
      }
    }

    function updateChatbotAuthUI(forceGreet) {
      const { isLoggedIn, username } = getAuthState();
      const snapshot = `${isLoggedIn ? '1' : '0'}:${username}`;
      if (!forceGreet && snapshot === authSnapshot) return;
      authSnapshot = snapshot;

      if (panel) {
        panel.classList.toggle('tp-chatbot-locked', !isLoggedIn);
      }
      if (input) input.disabled = !isLoggedIn;
      if (sendBtn) sendBtn.disabled = !isLoggedIn;
      if (micBtn) micBtn.disabled = !isLoggedIn || !canUseSpeechRecognition;
      if (imageInput) imageInput.disabled = !isLoggedIn;
      if (docInput) docInput.disabled = !isLoggedIn;
      if (videoInput) videoInput.disabled = !isLoggedIn;

      if (!messagesEl) return;

      if (!isLoggedIn) {
        messagesEl.innerHTML = '';
        ensureLockMessage();
        return;
      }

      if (forceGreet || messagesEl.children.length === 0) {
        messagesEl.innerHTML = '';
        const greet = document.createElement('div');
        greet.className = 'tp-chat-msg assistant greeting';
        greet.textContent = `Hi, ${username}`;
        messagesEl.appendChild(greet);
      }
    }

    function clearSelectedImage() {
      selectedImage = '';
      selectedAttachment = null;
      if (imageInput) imageInput.value = '';
      if (docInput) docInput.value = '';
      if (videoInput) videoInput.value = '';
      if (imageNameEl) imageNameEl.textContent = '';
    }

    async function sendMessage(text, imageDataUrl, attachment) {
      const prompt = text.trim();
      if (!prompt && !imageDataUrl && !attachment) return;

      const preview = prompt || 'Please analyze the uploaded file.';
      let attachmentNote = '';
      if (attachment) {
        attachmentNote = `[${attachment.type.toUpperCase()} attached: ${attachment.name}]`;
      } else if (imageDataUrl) {
        attachmentNote = '[IMAGE attached]';
      }
      addMessage('user', attachmentNote ? `${preview}\n${attachmentNote}` : preview);
      if (attachment) {
        addAttachmentPreview(attachment);
      } else if (imageDataUrl) {
        addAttachmentPreview({ type: 'image', name: 'image', mime: 'image/*', dataUrl: imageDataUrl });
      }
      chatHistory.push({ role: 'user', content: preview });
      setSendingState(true);
      const typingIndicator = showTypingIndicator();

      try {
        const data = await apiRequest('/api/chatbot', {
          method: 'POST',
          body: JSON.stringify({
            message: preview,
            history: chatHistory.slice(-8),
            imageDataUrl: imageDataUrl || '',
            attachment: attachment || null
          })
        });
        if (!data?.reply) {
          throw new Error('Failed to get chatbot response');
        }

        if (typingIndicator && typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }
        addMessage('assistant', data.reply);
        chatHistory.push({ role: 'assistant', content: data.reply });
        lastAssistantReply = data.reply;
        speakReply(data.reply);
      } catch (error) {
        if (typingIndicator && typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }
        addMessage('assistant', error?.message || 'Sorry, I could not respond right now. Please try again in a moment.');
      } finally {
        clearSelectedImage();
        setSendingState(false);
      }
    }

    if (toggleBtn && panel) {
      toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
          updateChatbotAuthUI(true);
        }
      });
    }

    if (closeBtn && panel) {
      closeBtn.addEventListener('click', () => panel.classList.remove('active'));
    }

    if (form && input) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const { isLoggedIn } = getAuthState();
        if (!isLoggedIn) {
          updateChatbotAuthUI(false);
          return;
        }
        const userText = input.value;
        input.value = '';
        sendMessage(userText, selectedImage, selectedAttachment);
      });
    }

    if (imageInput && imageNameEl) {
      imageInput.addEventListener('change', function() {
        const file = imageInput.files && imageInput.files[0];
        if (!file) {
          clearSelectedImage();
          return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
          selectedImage = typeof event.target?.result === 'string' ? event.target.result : '';
          selectedAttachment = null;
          imageNameEl.textContent = selectedImage ? `Attached image: ${file.name}` : '';
          if (docInput) docInput.value = '';
          if (videoInput) videoInput.value = '';
        };
        reader.readAsDataURL(file);
      });
    }

    if (docInput && imageNameEl) {
      docInput.addEventListener('change', function() {
        const file = docInput.files && docInput.files[0];
        if (!file) {
          clearSelectedImage();
          return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
          const dataUrl = typeof event.target?.result === 'string' ? event.target.result : '';
          selectedImage = '';
          selectedAttachment = dataUrl ? { type: 'doc', name: file.name, mime: file.type, dataUrl } : null;
          imageNameEl.textContent = selectedAttachment ? `Attached document: ${file.name}` : '';
          if (imageInput) imageInput.value = '';
          if (videoInput) videoInput.value = '';
        };
        reader.readAsDataURL(file);
      });
    }

    if (videoInput && imageNameEl) {
      videoInput.addEventListener('change', function() {
        const file = videoInput.files && videoInput.files[0];
        if (!file) {
          clearSelectedImage();
          return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
          const dataUrl = typeof event.target?.result === 'string' ? event.target.result : '';
          selectedImage = '';
          selectedAttachment = dataUrl ? { type: 'video', name: file.name, mime: file.type, dataUrl } : null;
          imageNameEl.textContent = selectedAttachment ? `Attached video: ${file.name}` : '';
          if (imageInput) imageInput.value = '';
          if (docInput) docInput.value = '';
        };
        reader.readAsDataURL(file);
      });
    }

    if (micBtn) {
      if (!canUseSpeechRecognition) {
        micBtn.disabled = true;
        micBtn.title = 'Voice input not supported in this browser';
      } else {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
          const { isLoggedIn } = getAuthState();
          if (!isLoggedIn) {
            updateChatbotAuthUI(false);
            return;
          }
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (!transcript) return;
          if (input) input.value = transcript;
          sendMessage(transcript, selectedImage, selectedAttachment);
          if (input) input.value = '';
        };

        recognition.onend = function() {
          if (micBtn) micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };

        recognition.onerror = function() {
          if (micBtn) micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };

        micBtn.addEventListener('click', function() {
          micBtn.innerHTML = '<i class="fas fa-circle"></i>';
          recognition.start();
        });
      }
    }

    if (dictateBtn) {
      dictateBtn.addEventListener('click', function() {
        dictateLoopEnabled = !dictateLoopEnabled;
        dictateBtn.textContent = dictateLoopEnabled ? '🔁 Dictate On' : '🔁 Dictate Off';
        dictateBtn.classList.toggle('on', dictateLoopEnabled);
        dictateBtn.classList.toggle('off', !dictateLoopEnabled);
        if (!dictateLoopEnabled) {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          return;
        }
        if (lastAssistantReply) {
          speakReply(lastAssistantReply);
        }
      });
    }

    updateChatbotAuthUI(false);
    setInterval(() => updateChatbotAuthUI(false), 800);
  }

  initChatbot();

})();