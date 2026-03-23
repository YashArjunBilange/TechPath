/**
 * certificates.js – Inject exactly 3 free + 3 paid certificates per subject card
 * Free: Scalar, Great Learning, Simplilearn
 * Paid: NPTEL, Coursera, Udemy
 */

window.showCertificates = function(subjectName) {
  // Mapping certificate placeholder IDs
  const idMap = {
    // First Year
    'C Programming': 'cert-CProgramming',
    'Data Science': 'cert-DataScience',
    'OOP using C++': 'cert-OOPCpp',
    'Software Engineering': 'cert-SoftwareEngineering',
    
    // Second Year
    'Machine Learning': 'cert-MachineLearning',
    'Data Structures & Algorithms': 'cert-DSA',
    'Java Programming': 'cert-Java',
    'DBMS': 'cert-DBMS',
    'Advanced DSA': 'cert-AdvancedDSA',
    'Full Stack Development-1': 'cert-FullStack1',
    
    // Third Year
    'Artificial Intelligence': 'cert-AI',
    'Computer Networks': 'cert-CN',
    'Embedded AI': 'cert-EmbeddedAI',
    'DAA': 'cert-DAA',
    'Computer Vision': 'cert-CV',
    'Deep Learning': 'cert-DL',
    'Full Stack Development-2': 'cert-FS2'
  };
  
  const containerId = idMap[subjectName];
  if (!containerId) {
    console.warn(`No container ID found for subject: ${subjectName}`);
    return;
  }
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container element not found: ${containerId}`);
    return;
  }
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Create subject-specific slug for URLs
  const subjectSlug = subjectName.toLowerCase()
    .replace(/\s+&\s+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  const scalarSlugMap = {
    'C Programming': 'C',
    'OOP using C++': 'cpp',
    'Data Structures & Algorithms': 'data-structures',
    'Java Programming':'java',
    'Advanced DSA': 'advanced-data-structures',
    'Full Stack Development-1': 'software-engineering/java-full-stack-developer',
  }
  const greatLearningSlugMap = {
   'C Programming': 'c-programming',
   'Data Science': 'data-science-foundations',
   'OOP using C++': 'c-tutorial',
   'Software Engineering':'future-of-software-engineering-led-by-emerging-technologies',
   'Machine Learning': 'machine-learning-with-python',
   'Data Structures & Algorithms': 'data-structures',
   'DBMS': 'database-management-system',
   'Advanced DSA': 'data-structures-and-algorithms-in-java',
   'Full Stack Development-1': 'end-to-end-full-stack-web-development',
   'Artificial Intelligence': 'artificial-intelligence-projects',
   'Computer Networks': 'basics-of-computer-networking',
   'Computer Vision': 'computer-vision-essentials',
   'Deep Learning': 'deep-learning',
   'Full Stack Development-2': 'become-full-stack-developer'
  };

  const simplilearnSlugMap = {
    'C Programming': 'free-c-course-skillup',
    'Data Science': 'data-science-course',
    'OOP using C++': 'free-course-to-learn-cpp-basics-skillup',
    'Software Engineering': 'learn-software-development-free-skillup',
    'Machine Learning': 'learn-machine-learning-basics-skillup',
    'Data Structures & Algorithms': 'free-data-structures-algorithms-course-skillup',
    'Java Programming': 'free-java-beginners-course-skillup',
    'DBMS': 'learn-basics-of-databases-free-course-skillup',
    'Advanced DSA': 'free-data-structures-algorithms-course-skillup',
    'Full Stack Development-1': 'free-full-stack-developer-course-skillup',
    'Artificial Intelligence': 'learn-artificial-intelligence-basics-skillup',
    'Computer Networks': 'free-computer-networking-course-skillup',
    'Deep Learning': 'free-deep-learning-course-skillup',
    'Full Stack Development-2': 'free-full-stack-developer-course-skillup'
  };
  // Exactly 3 Free Certificates
  const freeCerts = [
    {
      platform: 'Scalar',
      url: `https://www.scaler.com/topics/${scalarSlugMap[subjectName] || subjectSlug}`,
      title: `${subjectName} Course by Scalar`
    },
    {
      platform: 'Great Learning',
      url: `https://www.mygreatlearning.com/academy/learn-for-free/courses/${
      greatLearningSlugMap[subjectName] || subjectSlug}`,
      title: `${subjectName} Free Course`
    },
    {
      platform: 'Simplilearn',
      url: `https://www.simplilearn.com/${
      simplilearnSlugMap[subjectName] || subjectSlug}`,
      title: `${subjectName} SkillUp`
    }
  ];
  
  // Exactly 3 Paid Certificates
  const paidCerts = [
    {
      platform: 'NPTEL',
      url: `https://nptel.ac.in/courses/${getNPTELCode(subjectName)}`,
      title: `${subjectName} - NPTEL Elite Certification`
    },
    {
      platform: 'Coursera',
      url: `https://www.coursera.org/search?query=${encodeURIComponent(subjectName)}`,
      title: `${subjectName} Specialization`
    },
    {
      platform: 'Udemy',
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(subjectName)}`,
      title: `${subjectName} Masterclass`
    }
  ];
  
  // Helper function to get NPTEL course codes
  function getNPTELCode(subject) {
    const codes = {
      'C Programming': '106105171',
      'Data Science': '110107092',
      'OOP using C++': '106105165',
      'Software Engineering': '106105191',
      'Machine Learning': '106105152',
      'Data Structures & Algorithms': '106102064',
      'Java Programming': '106105191',
      'DBMS': '106105175',
      'Advanced DSA': '106106168',
      'Full Stack Development-1': '106106189',
      'Artificial Intelligence': '106105077',
      'Computer Networks': '106105183',
      'Embedded AI': '108108113',
      'DAA': '106106131',
      'Computer Vision': '106105216',
      'Deep Learning': '106105215',
      'Full Stack Development-2': '106106190'
    };
    return codes[subject] || '106105000';
  }
  
  // Add Free Certificates section
  const freeHeading = document.createElement('p');
  freeHeading.className = 'cert-heading free-heading';
  freeHeading.innerHTML = '<strong><i class="fas fa-graduation-cap"></i> Free Certificates:</strong>';
  container.appendChild(freeHeading);
  
  freeCerts.forEach(cert => {
    const certDiv = document.createElement('div');
    certDiv.className = 'cert-item free-cert';
    certDiv.innerHTML = `<i class="fas fa-certificate" style="color: #10b981;"></i> <a href="${cert.url}" target="_blank" rel="noopener">${cert.platform}: ${cert.title}</a>`;
    container.appendChild(certDiv);
  });
  
  // Add Paid Certificates section
  const paidHeading = document.createElement('p');
  paidHeading.className = 'cert-heading paid-heading';
  paidHeading.innerHTML = '<strong><i class="fas fa-award"></i> Paid Certificates:</strong>';
  container.appendChild(paidHeading);
  
  paidCerts.forEach(cert => {
    const certDiv = document.createElement('div');
    certDiv.className = 'cert-item paid-cert';
    certDiv.innerHTML = `<i class="fas fa-medal" style="color: #f59e0b;"></i> <a href="${cert.url}" target="_blank" rel="noopener">${cert.platform}: ${cert.title}</a>`;
    container.appendChild(certDiv);
  });
};