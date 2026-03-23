/**
 * year-pages.js – Shared utilities for year pages (link handlers, certificate injection, etc.)
 */

(function() {
  'use strict';
  
  // ---------- Ensure all external resource links open in new tab ----------
  function handleExternalLinks() {
    const allLinks = document.querySelectorAll('a[href^="http"], a[href^="https"]');
    allLinks.forEach(link => {
      if (!link.hasAttribute('target')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    
    const certLinks = document.querySelectorAll('.certificates a, .resource-link');
    certLinks.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
  }
  
  // ---------- Initialize resource links ----------
  function initResourceLinks() {
    const youtubeLinks = document.querySelectorAll('.resource-link.youtube');
    youtubeLinks.forEach(link => {
      if (!link.href || link.href.includes('#')) {
        link.href = 'https://youtube.com';
      }
    });
    
    const notesLinks = document.querySelectorAll('.resource-link.notes');
    notesLinks.forEach(link => {
      if (!link.href || link.href.includes('#')) {
        link.href = '#';
      }
    });
  }
  
  // ---------- Add active state to current year nav ----------
  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      
      if (href === currentPage) {
        link.classList.add('active');
      }
      
      if (currentPage === '' && href === 'index.html') {
        link.classList.add('active');
      }
    });
  }
  
  // ---------- Run on DOM ready ----------
  document.addEventListener('DOMContentLoaded', function() {
    handleExternalLinks();
    initResourceLinks();
    setActiveNav();
  });
  
})();