import { useState, useEffect } from 'react';

const MasterRua = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = "Vision: To change the education system by applying the UEEP Model";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const feedbackVideos = [
    { 
      title: "MIT College Student Feedback", 
      url: "https://www.youtube.com/embed/BZFBb3DBhLY",
      thumbnail: "🎓"
    },
    { 
      title: "Student Experience Review", 
      url: "https://www.youtube.com/embed/51-wVCd7dfI",
      thumbnail: "⭐"
    },
    { 
      title: "Learning Journey Testimonial", 
      url: "https://www.youtube.com/embed/W43530w_3Mk",
      thumbnail: "🚀"
    },
    { 
      title: "Course Impact Feedback", 
      url: "https://www.youtube.com/embed/9gb9qf5ouWA",
      thumbnail: "💡"
    }
  ];

  const projects = [
    { name: "YouTube Growth Predictor", tech: "React + Django + ML", icon: "📊" },
    { name: "Employee Management System", tech: "React + Django + PostgreSQL", icon: "👥" },
    { name: "UEEP Learning Platform", tech: "React + Vite + AI", icon: "🧠" },
    { name: "Success Analyzer", tech: "Python + Data Science", icon: "🎯" }
  ];

  return (
    <div className="master-rua-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="title-badge">
              <span className="pulse-dot" />
              Master Rua Live
            </div>
            <h1 className="hero-title">
              Sachin Kumar
              <span className="gradient-text"> (Master Rua)</span>
            </h1>
            <div className="typewriter">
              {typedText}
              <span className="cursor">|</span>
            </div>
            <p className="hero-description">
              AI/ML Trainer | Memory Science Expert | Full Stack Developer
              <br />
              <span className="highlight">Currently teaching USA professionals at Xziant</span>
            </p>
            
            <div className="hero-stats">
              <div className="stat-box">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Students Mentored</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">USA</div>
                <div className="stat-label">Global Clients</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">UEEP</div>
                <div className="stat-label">Learning Framework</div>
              </div>
            </div>

            <div className="hero-actions">
              <a href="#feedback" className="btn btn-primary">Watch Feedback</a>
              <a href="#projects" className="btn btn-secondary">View Projects</a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="character-container">
              <div className="character-placeholder">
                <span>🧙‍♂️</span>
                <p>3D Professor Avatar</p>
                <small>(Three.js Character Coming Soon)</small>
              </div>
              <div className="floating-elements">
                <span className="float-1">🧠</span>
                <span className="float-2">⚡</span>
                <span className="float-3">🎯</span>
                <span className="float-4">💎</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="section-container">
          <h2 className="section-title">🎯 The Mission</h2>
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🧠</div>
              <h3>Mind First</h3>
              <p>Before learning AI/ML, learn HOW to learn. Understand your brain, reprogram your mind, then conquer any skill.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">📚</div>
              <h3>UEEP Framework</h3>
              <p>Understand → Encode → Expand → Practice. A scientifically proven method for permanent learning.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">🚀</div>
              <h3>Real Innovation</h3>
              <p>Bridge human intelligence with machine intelligence. Create, don't just consume.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Feedback Section */}
      <section id="feedback" className="feedback-section">
        <div className="section-container">
          <h2 className="section-title">🎬 Student Feedback</h2>
          <p className="section-subtitle">Real experiences from real learners</p>
          
          <div className="feedback-grid">
            {feedbackVideos.map((video, index) => (
              <div key={index} className="feedback-card">
                <div className="video-wrapper">
                  <iframe
                    src={video.url}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="feedback-info">
                  <span className="feedback-icon">{video.thumbnail}</span>
                  <h4>{video.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects-section">
        <div className="section-container">
          <h2 className="section-title">💻 Live Projects</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                <div className="project-icon">{project.icon}</div>
                <h3>{project.name}</h3>
                <p>{project.tech}</p>
                <div className="project-status">
                  <span className="status-dot active" />
                  Live on Render
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UEEP Framework Highlight */}
      <section className="ueep-highlight">
        <div className="section-container">
          <div className="ueep-content">
            <h2>The UEEP Learning Framework</h2>
            <div className="ueep-steps">
              <div className="ueep-step">
                <div className="step-number">U</div>
                <h4>Understand</h4>
                <p>Build mental clarity</p>
              </div>
              <div className="ueep-arrow">→</div>
              <div className="ueep-step">
                <div className="step-number">E</div>
                <h4>Encode</h4>
                <p>Memory techniques</p>
              </div>
              <div className="ueep-arrow">→</div>
              <div className="ueep-step">
                <div className="step-number">E</div>
                <h4>Expand</h4>
                <p>Curiosity & inquiry</p>
              </div>
              <div className="ueep-arrow">→</div>
              <div className="ueep-step">
                <div className="step-number">P</div>
                <h4>Practice</h4>
                <p>Real application</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MasterRua;