/**
 * main.js – Global interactions, mobile menu, modal, canvas bg, smooth scroll, active nav
 * AI Engineering Roadmap EdTech SaaS
 */

(function() {
  'use strict';
  async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  alert("Registered!");
}
  
  async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  localStorage.setItem("token", data.token);

  alert("Login successful");
}

  async function saveResumeToDB(data) {
  const token = localStorage.getItem("token");

  await fetch("http://localhost:5000/save-resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

})();