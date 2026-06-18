import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  // Scroll to section function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Quiz State
  const [quizSelected, setQuizSelected] = useState(null); // null, 'correct', 'incorrect'
  const [quizAnswer, setQuizAnswer] = useState(null); // the clicked option

  // Routine Tracker State
  const [routines, setRoutines] = useState([
    { id: 1, name: 'Morning Walk', time: '7:00 AM · 30 mins', done: true },
    { id: 2, name: 'Blood Pressure Medicine', time: '8:30 AM · With breakfast', done: true },
    { id: 3, name: 'Lunch Check-in', time: '1:00 PM', done: true },
    { id: 4, name: 'Evening Yoga', time: '5:30 PM · 20 mins', done: false }
  ]);

  const toggleRoutine = (id) => {
    setRoutines(prev =>
      prev.map(r => r.id === id ? { ...r, done: !r.done } : r)
    );
  };

  const doneCount = routines.filter(r => r.done).length;

  const handleQuizClick = (option) => {
    setQuizAnswer(option);
    if (option === 'New Delhi') {
      setQuizSelected('correct');
    } else {
      setQuizSelected('incorrect');
    }
  };

  const handleSupportClick = () => {
    alert("Support is available 24/7! Feel free to email us at monishparmar04@gmail.com");
  };

  const faqs = [
    {
      q: "Is GrandCare free to use?",
      a: "Yes! GrandCare's core features — daily routines, news quiz, community help requests, and SOS — are completely free for elders. We believe safety and connection should never have a price tag."
    },
    {
      q: "How does the SOS feature work?",
      a: "When you press the SOS button, GrandCare instantly sends a push notification, SMS, and email alert to all your registered family members with your real-time GPS location. It works even with slow internet connections."
    },
    {
      q: "Are community helpers verified?",
      a: "Absolutely. Every community helper undergoes a thorough background verification process. We verify their identity and check references in their local neighbourhood before letting them respond to tasks, ensuring our grandparents are always in safe hands."
    },
    {
      q: "Can my family members see my daily updates?",
      a: "Yes, family members can access a real-time web dashboard from anywhere in the world to see your checked routines, quiz score updates, and helper check-ins, bringing complete peace of mind."
    },
    {
      q: "Which languages are supported?",
      a: "GrandCare is built with accessibility in mind. The app fully supports both English and Hindi, with large fonts, high contrast colors, and simplified layouts designed specifically for seniors."
    }
  ];

  return (
    <div className="landing-page-container">
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon">🌿</div>
            GrandCare
          </div>
          <div className="nav-links">
            <a onClick={() => scrollToSection('features')}>Features</a>
            <a onClick={() => scrollToSection('how')}>How it Works</a>
            <a onClick={() => scrollToSection('community')}>Community</a>
            <a onClick={() => scrollToSection('faq')}>FAQ</a>
          </div>
          <div className="nav-ctas">
            <button className="btn-outline" onClick={() => navigate('/register?role=helper')}>❤️ I want to Help</button>
            <button className="btn-solid" onClick={() => navigate('/register?role=elder')}>👴 I am a Grandparent</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="content-wrapper hero-grid">
          <div className="hero-left">
            <div className="hero-badge">🌱 Trusted by 12,000+ Seniors Across India</div>
            <h1 className="hero-title">Technology that feels like a <span>grandchild.</span></h1>
            <p className="hero-sub">GrandCare helps elders manage daily routines, stay safe with SOS alerts, stay sharp with news quizzes, and connect with a caring community — all in one warm, simple platform.</p>
            <div className="hero-ctas">
              <button className="btn-hero-primary" onClick={() => navigate('/register?role=elder')}>👴 I am a Grandparent</button>
              <button className="btn-hero-secondary" onClick={() => navigate('/register?role=helper')}>❤️ I want to Help</button>
            </div>
            <div className="hero-stats">
              <div className="hstat">
                <div className="hstat-num">150M+</div>
                <div className="hstat-label">Elderly Indians Underserved</div>
              </div>
              <div className="hstat-divider"></div>
              <div className="hstat">
                <div className="hstat-num">45%</div>
                <div className="hstat-label">Report Chronic Loneliness</div>
              </div>
              <div className="hstat-divider"></div>
              <div className="hstat">
                <div className="hstat-num">5</div>
                <div className="hstat-label">Core Features Built for Them</div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-illustration">
              <div className="hero-img-wrap">
                <div className="hero-img-emojis">
                  <span>👴</span>
                  <span>👵</span>
                  <span>👦</span>
                </div>
              </div>
              <div className="stat-card left">
                <div className="stat-icon-checkbox">✓</div>
                <div className="stat-text"><strong>{doneCount}/4 Done</strong>Today's routines</div>
              </div>
              <div className="stat-card right">
                <div className="stat-icon-helpers">👥</div>
                <div className="stat-text"><strong>3 Helpers</strong>Nearby &amp; available</div>
              </div>
              <div className="stat-card bottom">
                <div className="stat-icon-trophy">🏆</div>
                <div className="stat-text"><strong>{doneCount === 4 ? '290 pts' : '240 pts'}</strong>This week's quiz</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="content-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '24px', flexWrap: 'wrap' }}>
          <div className="trust-item"><span className="trust-icon">🔒</span> Secure &amp; Private</div>
          <div className="trust-divider"></div>
          <div className="trust-item"><span className="trust-icon">📱</span> Works on Any Device</div>
          <div className="trust-divider"></div>
          <div className="trust-item"><span className="trust-icon">🌍</span> Available Across India</div>
          <div className="trust-divider"></div>
          <div className="trust-item"><span className="trust-icon">💬</span> Hindi &amp; English Support</div>
          <div className="trust-divider"></div>
          <div className="trust-item"><span className="trust-icon">🆘</span> 24/7 SOS Coverage</div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="content-wrapper">
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Everything an elder needs,<br />all in one place</h2>
          <p className="section-sub">Simple, thoughtfully designed tools — no tech expertise required. Just warmth, safety, and connection.</p>
          <div className="features-grid">
            <div className="feature-card green">
              <div className="feature-icon-wrap">✅</div>
              <div className="feature-name">Daily Routines</div>
              <div className="feature-desc">Track walks, medicines, meals and other daily activities with gentle reminders and check-ins. Family members can view progress in real time, giving everyone peace of mind.</div>
              <span className="feature-tag">Health &amp; Wellness</span>
            </div>
            <div className="feature-card blue">
              <div className="feature-icon-wrap">🛡️</div>
              <div className="feature-name">SOS Emergency</div>
              <div className="feature-desc">One tap sends an instant alert with live location to your entire family network. Fast, reliable, and life-saving — because every second matters in an emergency.</div>
              <span className="feature-tag">Safety First</span>
            </div>
            <div className="feature-card gold">
              <div className="feature-icon-wrap">📰</div>
              <div className="feature-name">News Quiz</div>
              <div className="feature-desc">Stay sharp with daily quizzes on current events, history, and general knowledge tailored for seniors. Earn reward points and keep your mind active and engaged every day.</div>
              <span className="feature-tag">Mental Fitness</span>
            </div>
            <div className="feature-card rose">
              <div className="feature-icon-wrap">❤️</div>
              <div className="feature-name">Community Help</div>
              <div className="feature-desc">Connect with verified nearby helpers for errands, grocery runs, friendly visits, or just a chat. A genuine network of kindness — always within reach when you need it most.</div>
              <span className="feature-tag">Social Connection</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOR ELDERS vs HELPERS */}
      <section className="two-col-section">
        <div className="content-wrapper">
          <div className="section-label">Who Is GrandCare For?</div>
          <h2 className="section-title">Two roles, one mission</h2>
          <p className="section-sub">Whether you're an elder seeking care or someone who wants to give back — GrandCare has a place for you.</p>
          <div className="two-col-grid">
            <div className="two-col-card elder">
              <span className="two-col-card-icon">👴</span>
              <div className="two-col-card-title">I am a Grandparent</div>
              <div className="two-col-card-desc">Access everything you need to live independently with confidence — routines, safety, and a community that cares about you.</div>
              <ul className="two-col-perks">
                <li><span className="perk-dot">✓</span> Set daily medicine, walk and meal reminders</li>
                <li><span className="perk-dot">✓</span> One-tap SOS with live location sharing</li>
                <li><span className="perk-dot">✓</span> Daily news quizzes to keep the mind sharp</li>
                <li><span className="perk-dot">✓</span> Request help from trusted nearby community members</li>
                <li><span className="perk-dot">✓</span> Share updates with your family automatically</li>
              </ul>
              <button className="btn-two-col" onClick={() => navigate('/register?role=elder')}>Get Started as Elder →</button>
            </div>
            <div className="two-col-card helper">
              <span className="two-col-card-icon">🤝</span>
              <div className="two-col-card-title">I want to Help</div>
              <div className="two-col-card-desc">Become a verified community helper and make a real difference in the lives of seniors nearby. Earn reward points and build meaningful connections.</div>
              <ul className="two-col-perks">
                <li><span className="perk-dot">✓</span> Get matched with seniors in your neighbourhood</li>
                <li><span className="perk-dot">✓</span> Help with errands, visits or friendly calls</li>
                <li><span className="perk-dot">✓</span> Earn points and community recognition</li>
                <li><span className="perk-dot">✓</span> Flexible — help as much or as little as you like</li>
                <li><span className="perk-dot">✓</span> Background verified for elder safety</li>
              </ul>
              <button className="btn-two-col" onClick={() => navigate('/register?role=helper')}>Join as a Helper →</button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <div className="content-wrapper">
          <div className="section-label">Getting Started</div>
          <h2 className="section-title">How GrandCare works</h2>
          <p className="section-sub">Up and running in minutes. Designed so even a first-time smartphone user can get started with ease.</p>
          <div className="steps-wrap">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-title">Register</div>
              <div className="step-desc">Sign up as an elder or community helper. A guided, simple onboarding designed for all ages — no tech experience needed.</div>
              <div className="step-detail">
                <div className="step-bullet">Choose your role</div>
                <div className="step-bullet">Add family contacts</div>
                <div className="step-bullet">Set language preference</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-title">Set Up Routines</div>
              <div className="step-desc">Add your daily medicines, walk times, and meal schedules. Earn wellness points for completing each task.</div>
              <div className="step-detail">
                <div className="step-bullet">Medicine reminders</div>
                <div className="step-bullet">Walk &amp; meal tracking</div>
                <div className="step-bullet">Earn wellness points</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-title">Stay Connected</div>
              <div className="step-desc">Connect with nearby helpers, take daily quizzes, and activate SOS when needed. Your family sees everything in real time.</div>
              <div className="step-detail">
                <div className="step-bullet">Family dashboard</div>
                <div className="step-bullet">Community network</div>
                <div className="step-bullet">Instant SOS alerts</div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* NEWS QUIZ SHOWCASE */}
      <section className="quiz-section">
        <div className="content-wrapper quiz-inner">
          <div>
            <div className="section-label">Mental Fitness</div>
            <h2 className="section-title">Keep your mind sharp — daily</h2>
            <p className="section-sub">Every morning, GrandCare serves a fresh quiz on current events, history, and general knowledge — designed specifically for seniors. Answer right and earn wellness points redeemable for community rewards.</p>
            <br /><br />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(200,146,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧠</div>
                <div><div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Cognitive Health</div><div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Regular quizzes help maintain memory and focus</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(90,138,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏅</div>
                <div><div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Points &amp; Rewards</div><div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Earn points and climb the community leaderboard</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(58,110,168,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📅</div>
                <div><div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Fresh Every Day</div><div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>New questions every morning to keep it interesting</div></div>
              </div>
            </div>
          </div>
          <div className="quiz-mockup">
            <div className="quiz-header">
              <div className="quiz-header-title">📰 Today's Quiz</div>
              <div className="quiz-badge">+50 pts</div>
            </div>
            <div className="quiz-q">Which city hosted the 2023 G20 Summit in India?</div>
            <div className="quiz-options">
              <div
                className={`quiz-opt ${quizAnswer === 'New Delhi' ? 'correct' : ''}`}
                onClick={() => handleQuizClick('New Delhi')}
              >
                {quizAnswer === 'New Delhi' ? '✓ ' : ''}New Delhi
              </div>
              <div
                className={`quiz-opt ${quizAnswer === 'Mumbai' ? 'incorrect' : ''}`}
                onClick={() => handleQuizClick('Mumbai')}
              >
                {quizAnswer === 'Mumbai' ? '✗ ' : ''}Mumbai
              </div>
              <div
                className={`quiz-opt ${quizAnswer === 'Bengaluru' ? 'incorrect' : ''}`}
                onClick={() => handleQuizClick('Bengaluru')}
              >
                {quizAnswer === 'Bengaluru' ? '✗ ' : ''}Bengaluru
              </div>
              <div
                className={`quiz-opt ${quizAnswer === 'Varanasi' ? 'incorrect' : ''}`}
                onClick={() => handleQuizClick('Varanasi')}
              >
                {quizAnswer === 'Varanasi' ? '✗ ' : ''}Varanasi
              </div>
            </div>

            {quizSelected === 'correct' && (
              <div className="quiz-points">
                <div className="quiz-points-icon">🏆</div>
                <div className="quiz-points-text">Correct! You earned 50 wellness points</div>
              </div>
            )}
            {quizSelected === 'incorrect' && (
              <div className="quiz-points" style={{ background: 'rgba(196,86,106,0.08)', border: '1px solid rgba(196,86,106,0.2)' }}>
                <div className="quiz-points-icon">❌</div>
                <div className="quiz-points-text" style={{ color: 'var(--rose)' }}>That was incorrect. (Hint: It is the capital city!)</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ROUTINE TRACKER SHOWCASE */}
      <section className="routine-section">
        <div className="content-wrapper routine-inner">
          <div className="routine-mockup">
            <div className="routine-day-header">
              Today's Routines
              <span className="routine-progress-ring">
                {doneCount} of {routines.length} done {doneCount === routines.length ? '✓' : ''}
              </span>
            </div>
            <div className="routine-items">
              {routines.map((r) => (
                <div
                  key={r.id}
                  className={`routine-item ${r.done ? 'done' : 'pending'}`}
                  onClick={() => !r.done && toggleRoutine(r.id)}
                >
                  <div className="routine-check">{r.done ? '✓' : '⏳'}</div>
                  <div className="routine-info">
                    <div className="routine-name">{r.name}</div>
                    <div className="routine-time">{r.time}</div>
                  </div>
                  <div className="routine-status">{r.done ? 'Done' : 'Upcoming (Click to complete)'}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-label">Daily Routines</div>
            <h2 className="section-title">Structure that brings comfort &amp; health</h2>
            <p className="section-sub">Consistent routines are proven to improve wellbeing in seniors. GrandCare makes it effortless to stick to healthy habits — and your family always knows you're doing well.</p>
            <br /><br />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(90,138,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💊</div>
                <div><div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Medicine Reminders</div><div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Never miss a dose with gentle, timely reminders</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(58,110,168,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👪</div>
                <div><div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Family Visibility</div><div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Family can see daily progress from anywhere</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(200,146,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⭐</div>
                <div><div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Wellness Points</div><div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Earn points for completing healthy daily habits</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="community-section" id="community">
        <div className="content-wrapper community-inner">
          <div>
            <div className="section-label">Community Help</div>
            <h2 className="section-title">A village of helpers, right next door</h2>
            <p className="section-sub">GrandCare's verified community network connects seniors with kind, background-checked volunteers nearby — for errands, grocery runs, friendly visits, or just a good conversation.</p>
            <br />
            <p style={{ fontSize: '0.92rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>Because growing old shouldn't mean growing lonely. Every elder deserves someone who checks in, helps out, and genuinely cares.</p>
            <br /><br />
            <button
              style={{ padding: '14px 28px', borderRadius: '50px', background: 'var(--blue)', color: 'white', fontFamily: "'DM Sans',sans-serif", fontSize: '0.95rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(58,110,168,0.3)' }}
              onClick={() => navigate('/register?role=elder')}
            >
              Find Helpers Near Me →
            </button>
          </div>
          <div className="helpers-grid">
            <div className="helper-card">
              <div className="helper-avatar">🧑</div>
              <div className="helper-name">Arjun M.</div>
              <div className="helper-dist">0.4 km away</div>
              <div className="helper-tags">
                <span className="helper-tag">Errands</span>
                <span className="helper-tag">Visits</span>
              </div>
              <div className="helper-online"><span className="online-dot"></span> Available now</div>
            </div>
            <div className="helper-card">
              <div className="helper-avatar">👩</div>
              <div className="helper-name">Sneha R.</div>
              <div className="helper-dist">0.7 km away</div>
              <div className="helper-tags">
                <span className="helper-tag">Grocery</span>
                <span className="helper-tag">Pharmacy</span>
              </div>
              <div className="helper-online"><span className="online-dot"></span> Available now</div>
            </div>
            <div className="helper-card">
              <div className="helper-avatar">🧓</div>
              <div className="helper-name">Vikram S.</div>
              <div className="helper-dist">1.1 km away</div>
              <div className="helper-tags">
                <span className="helper-tag">Friendly Chat</span>
              </div>
              <div className="helper-online" style={{ color: 'var(--gold)' }}>● Available in 2h</div>
            </div>
            <div className="helper-card">
              <div className="helper-avatar">👩‍🦱</div>
              <div className="helper-name">Meera K.</div>
              <div className="helper-dist">1.3 km away</div>
              <div className="helper-tags">
                <span className="helper-tag">Errands</span>
                <span className="helper-tag">Visits</span>
              </div>
              <div className="helper-online"><span className="online-dot"></span> Available now</div>
            </div>
          </div>
        </div>
      </section>

      {/* SOS BANNER */}
      <div className="content-wrapper" style={{ marginBottom: '110px' }}>
        <div className="sos-section">
          <div>
            <div className="sos-label">Emergency Safety Feature</div>
            <div className="sos-title">🆘 SOS Alert — One Tap.<br />Your Family Knows.</div>
            <div className="sos-desc">In any emergency, GrandCare sends an instant alert with live GPS location to your entire family network — simultaneously. No steps, no confusion. Just one tap and help is on the way.</div>
            <div className="sos-features">
              <div className="sos-feat"><span className="sos-feat-icon">📍</span> Live GPS Location</div>
              <div className="sos-feat"><span className="sos-feat-icon">📲</span> Alerts All Family Members</div>
              <div className="sos-feat"><span className="sos-feat-icon">⚡</span> Instant Notification</div>
              <div className="sos-feat"><span className="sos-feat-icon">🌐</span> Works Offline Too</div>
            </div>
          </div>
          <button className="btn-sos" onClick={() => navigate('/register?role=elder')}>Learn About SOS →</button>
        </div>
      </div>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="content-wrapper faq-inner">
          <div>
            <div className="section-label">Common Questions</div>
            <h2 className="section-title">Everything you need to know</h2>
            <p className="section-sub">Got more questions? We're always here to help. Reach out to our support team anytime.</p>
            <br /><br />
            <div style={{ padding: '28px', background: 'var(--warm-white)', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '10px' }}>💬</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Still have questions?</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '16px' }}>Our support team speaks Hindi and English and is available 7 days a week.</div>
              <button
                style={{ padding: '12px 24px', borderRadius: '50px', background: 'var(--sage)', color: 'white', fontFamily: "'DM Sans',sans-serif", fontSize: '0.88rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                onClick={handleSupportClick}
              >
                Contact Support
              </button>
            </div>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  {faq.q} <span className="faq-arrow">▾</span>
                </div>
                <div className="faq-a">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="content-wrapper">
          <h2 className="section-title">Ready to bring warmth and safety to your family?</h2>
          <p className="section-sub">Join thousands of families across India using GrandCare to support their loved ones.</p>
          <div className="cta-buttons">
            <button className="btn-cta-big primary" onClick={() => navigate('/register?role=elder')}>👴 I am a Grandparent</button>
            <button className="btn-cta-big secondary" onClick={() => navigate('/register?role=helper')}>❤️ I want to Help</button>
          </div>
          <p className="cta-note" style={{ marginTop: '20px' }}>Simple setup, Hindi &amp; English support, 100% secure.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="content-wrapper">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                🌿 GrandCare
              </div>
              <div className="footer-tagline">Technology that feels like a grandchild. Made with love for seniors across India.</div>
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              <div className="footer-links">
                <a onClick={() => scrollToSection('features')}>Features</a>
                <a onClick={() => scrollToSection('how')}>How it Works</a>
                <a onClick={() => scrollToSection('community')}>Community</a>
                <a onClick={() => scrollToSection('faq')}>FAQ</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Get Involved</div>
              <div className="footer-links">
                <a onClick={() => navigate('/register?role=elder')}>Grandparent Sign-Up</a>
                <a onClick={() => navigate('/register?role=helper')}>Volunteer Helper</a>
                <a onClick={() => navigate('/login')}>Sign In</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Contact &amp; Support</div>
              <div className="footer-links">
                <a href="mailto:monishparmar04@gmail.com">monishparmar04@gmail.com</a>
                <a onClick={handleSupportClick}>Help Center</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 GrandCare. All rights reserved. Made with <span className="footer-heart">❤️</span> for elders.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
