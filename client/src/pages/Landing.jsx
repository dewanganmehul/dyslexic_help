import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── data ─────────────────────────────────────────────────── */
const STEPS = [
  {
    id: 1,
    icon: "👤",
    tag: "Step 01",
    title: "Create a profile",
    body: "A parent or educator sets up the child's profile in under two minutes — name, age, and grade level. This calibrates mission difficulty and tracks progress over time.",
    color: "#7c3aed",
    accent: "#a78bfa",
  },
  {
    id: 2,
    icon: "🚀",
    tag: "Step 02",
    title: "Launch a mission",
    body: "The child enters a space-themed game world. Each mission is a carefully designed literacy task — phoneme detection, letter reversal challenges, rhyme matching — disguised as space adventures.",
    color: "#0ea5e9",
    accent: "#38bdf8",
  },
  {
    id: 3,
    icon: "🧠",
    tag: "Step 03",
    title: "AI reads the signals",
    body: "Behind the scenes, our engine tracks response time, error patterns, and correction behaviour across every interaction. It builds an evolving picture of the child's reading profile.",
    color: "#ec4899",
    accent: "#f472b6",
  },
  {
    id: 4,
    icon: "📊",
    tag: "Step 04",
    title: "Parents get a report",
    body: "After a session, parents receive a clear, jargon-free report on their child's strengths and areas of concern — with actionable next steps and, where needed, a recommendation to consult a specialist.",
    color: "#10b981",
    accent: "#34d399",
  },
];

/* ─── shared styles (injected once) ────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dc-root {
    min-height: 100vh;
    background: #0a0614;
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
    position: relative;
    color: #fff;
  }

  /* ── canvas bg ── */
  .dc-canvas {
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0; overflow: hidden;
  }
  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.3;
  }
  .orb-1 { width: 480px; height: 480px; background: #7c3aed; top: -120px; left: -100px; animation: drift1 9s ease-in-out infinite alternate; }
  .orb-2 { width: 340px; height: 340px; background: #0ea5e9; bottom: 0; right: -60px;  animation: drift2 11s ease-in-out infinite alternate; }
  .orb-3 { width: 200px; height: 200px; background: #ec4899; top: 40%; left: 60%;       animation: drift1 7s ease-in-out infinite alternate; }
  @keyframes drift1 { from{transform:translate(0,0) scale(1)} to{transform:translate(30px,40px) scale(1.1)} }
  @keyframes drift2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-20px,-30px) scale(1.08)} }

  .grid-lines {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(124,58,237,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,.06) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .dc-floaty { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .floaty-letter {
    position: absolute;
    font-family: 'Syne', sans-serif; font-weight: 800;
    color: rgba(124,58,237,.07);
    user-select: none;
    animation: floatUp linear infinite;
  }
  @keyframes floatUp {
    from { transform: translateY(110vh) rotate(var(--r)); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    to   { transform: translateY(-20vh) rotate(var(--r)); opacity: 0; }
  }

  /* ── sections ── */
  .dc-section { position: relative; z-index: 1; }

  /* ── hero ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 2rem; text-align: center;
  }

  .dc-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(124,58,237,.15);
    border: 1px solid rgba(124,58,237,.4);
    color: #c4b5fd;
    font-size: 11px; font-weight: 500;
    letter-spacing: .12em; text-transform: uppercase;
    padding: 6px 14px; border-radius: 100px;
    margin-bottom: 2rem;
    animation: fadeDown .8s ease both;
  }
  .badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #a78bfa;
    animation: pulseDot 2s ease infinite;
  }
  @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(3.5rem, 10vw, 6rem);
    font-weight: 800; line-height: 1;
    margin-bottom: 1.25rem;
    animation: fadeDown .9s .1s ease both;
  }
  .title-line1 { display: block; color: #fff; }
  .title-line2 {
    display: block;
    background: linear-gradient(90deg, #a78bfa, #38bdf8, #f472b6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    max-width: 500px; color: #94a3b8;
    font-size: 1.1rem; line-height: 1.75;
    margin-bottom: 3rem;
    animation: fadeDown 1s .2s ease both;
  }

  .hero-actions {
    display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
    animation: fadeDown 1.1s .3s ease both;
  }

  .btn-primary {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff; border: none;
    padding: 14px 32px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem; font-weight: 500; cursor: pointer;
    transition: transform .18s, box-shadow .18s;
    box-shadow: 0 0 30px rgba(124,58,237,.4);
  }
  .btn-primary::before {
    content:''; position: absolute; inset: 0;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    opacity: 0; transition: opacity .18s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(124,58,237,.6); }
  .btn-primary:hover::before { opacity: 1; }
  .btn-primary span { position: relative; z-index: 1; }

  .btn-ghost {
    background: transparent; color: #cbd5e1;
    border: 1px solid rgba(255,255,255,.15);
    padding: 14px 32px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem; font-weight: 400; cursor: pointer;
    transition: background .18s, border-color .18s, transform .18s, color .18s;
    backdrop-filter: blur(8px);
  }
  .btn-ghost:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.3); color: #fff; transform: translateY(-2px); }

  .hero-pills {
    display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
    margin-top: 3.5rem;
    animation: fadeDown 1.2s .45s ease both;
  }
  .feat-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 100px; padding: 8px 16px;
    font-size: .82rem; color: #94a3b8;
    backdrop-filter: blur(6px);
  }
  .feat-icon {
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; flex-shrink: 0;
  }
  .icon-purple { background: rgba(167,139,250,.2); color: #a78bfa; }
  .icon-blue   { background: rgba(56,189,248,.2);  color: #38bdf8; }
  .icon-pink   { background: rgba(244,114,182,.2); color: #f472b6; }
  .icon-green  { background: rgba(52,211,153,.2);  color: #34d399; }

  .hero-scroll {
    margin-top: 4rem;
    animation: fadeDown 1.3s .6s ease both;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    cursor: pointer;
  }
  .scroll-label { font-size: .75rem; color: #475569; letter-spacing: .15em; text-transform: uppercase; }
  .scroll-arrow {
    width: 22px; height: 22px; border-right: 2px solid #4f46e5; border-bottom: 2px solid #4f46e5;
    transform: rotate(45deg); animation: bounce 1.6s ease infinite;
  }
  @keyframes bounce { 0%,100%{transform:rotate(45deg) translateY(0)} 50%{transform:rotate(45deg) translateY(5px)} }

  /* ── how it works ── */
  .hiw {
    padding: 100px 2rem 120px;
    max-width: 1100px; margin: 0 auto;
  }
  .hiw-eyebrow {
    font-size: .75rem; font-weight: 500;
    letter-spacing: .2em; text-transform: uppercase;
    color: #a78bfa; margin-bottom: 1rem;
  }
  .hiw-headline {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800; line-height: 1.1;
    color: #fff; margin-bottom: 1rem;
  }
  .hiw-sub {
    font-size: 1rem; color: #64748b;
    max-width: 480px; line-height: 1.7;
    margin-bottom: 4rem;
  }

  .hiw-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px; align-items: start;
  }
  @media (max-width: 700px) {
    .hiw-layout { grid-template-columns: 1fr; }
    .hiw-visual  { display: none; }
  }

  /* step list */
  .step-list { display: flex; flex-direction: column; gap: 6px; }

  .step-item {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 18px 20px; border-radius: 14px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background .22s, border-color .22s;
    position: relative;
  }
  .step-item.active {
    background: rgba(255,255,255,.04);
    border-color: rgba(255,255,255,.1);
  }

  .step-num {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
    transition: background .22s;
  }

  .step-tag {
    font-size: .68rem; font-weight: 500;
    letter-spacing: .12em; text-transform: uppercase;
    margin-bottom: 4px;
    transition: color .22s;
  }
  .step-title {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 1rem; color: #e2e8f0;
    margin-bottom: 6px;
  }
  .step-body {
    font-size: .875rem; color: #64748b;
    line-height: 1.65;
    max-height: 0; overflow: hidden;
    transition: max-height .35s ease, opacity .3s ease;
    opacity: 0;
  }
  .step-item.active .step-body { max-height: 120px; opacity: 1; }

  .step-connector {
    width: 2px; height: 24px;
    background: rgba(255,255,255,.06);
    margin-left: 37px;
  }

  /* visual panel */
  .hiw-visual {
    position: sticky; top: 80px;
    display: flex; align-items: center; justify-content: center;
  }

  .visual-card {
    width: 100%; max-width: 380px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.03);
    padding: 32px;
    transition: border-color .4s;
    backdrop-filter: blur(12px);
  }

  .visual-icon-wrap {
    width: 72px; height: 72px; border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; margin-bottom: 20px;
    transition: background .4s;
  }
  .visual-tag {
    font-size: .7rem; font-weight: 500;
    letter-spacing: .15em; text-transform: uppercase;
    margin-bottom: 10px;
    transition: color .4s;
  }
  .visual-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.5rem; color: #fff;
    margin-bottom: 12px;
    line-height: 1.2;
  }
  .visual-body {
    font-size: .9rem; color: #64748b; line-height: 1.7;
  }

  .progress-bar-track {
    margin-top: 28px;
    height: 4px; border-radius: 100px;
    background: rgba(255,255,255,.07); overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; border-radius: 100px;
    transition: width .5s ease, background .4s;
  }

  /* footer */
  .dc-footer {
    position: relative; z-index: 1;
    text-align: center; padding-bottom: 40px;
    font-size: .75rem; color: #334155;
    letter-spacing: .2em; text-transform: uppercase;
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ring {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(124,58,237,.12);
    animation: expand linear infinite;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    pointer-events: none;
  }
  @keyframes expand {
    from { width: 200px; height: 200px; opacity: .5; }
    to   { width: 800px; height: 800px; opacity: 0; }
  }
`;

/* ─── component ─────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const hiwRef = useRef(null);
  const lettersRef = useRef(null);
  const timerRef = useRef(null);

  /* auto-advance stepper */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleStepClick = (i) => {
    clearInterval(timerRef.current);
    setActive(i);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, 3500);
  };

  /* floating letters */
  useEffect(() => {
    if (!lettersRef.current) return;
    const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 18; i++) {
      const el = document.createElement("div");
      el.className = "floaty-letter";
      const size = Math.random() * 60 + 40;
      el.style.cssText = `font-size:${size}px;left:${Math.random() * 100}%;--r:${(Math.random() - 0.5) * 40}deg;animation-duration:${Math.random() * 14 + 10}s;animation-delay:${Math.random() * -20}s`;
      el.textContent = ALPHA[Math.floor(Math.random() * ALPHA.length)];
      frag.appendChild(el);
    }
    lettersRef.current.appendChild(frag);
  }, []);

  const step = STEPS[active];
  const progress = ((active + 1) / STEPS.length) * 100;

  return (
    <>
      <style>{CSS}</style>

      <div className="dc-root">
        {/* bg canvas */}
        <div className="dc-canvas">
          <div className="grid-lines" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="ring" style={{ animationDuration: "6s", animationDelay: "0s" }} />
          <div className="ring" style={{ animationDuration: "6s", animationDelay: "2s" }} />
          <div className="ring" style={{ animationDuration: "6s", animationDelay: "4s" }} />
          <div className="dc-floaty" ref={lettersRef} />
        </div>

        {/* ── HERO ── */}
        <section className="dc-section hero">
          <div className="dc-badge">
            <div className="badge-dot" />
            Mission Control v2.0 — Now Live
          </div>

          <h1 className="hero-title">
            <span className="title-line1">Read Beyond</span>
            <span className="title-line2">DyslexiCore</span>
          </h1>

          <p className="hero-sub">
            A gamified literacy engine that deploys interactive space missions
            to detect, understand, and strengthen every child's reading universe.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/signup")}>
              <span>Launch Core &rarr;</span>
            </button>
            <button className="btn-ghost" onClick={() => navigate("/login")}>
              Mission Login
            </button>
          </div>

          <div className="hero-pills">
            {[
              { cls: "icon-purple", shape: "■", label: "Space-themed literacy games" },
              { cls: "icon-blue",   shape: "▲", label: "AI-powered diagnostics" },
              { cls: "icon-pink",   shape: "●", label: "Safe for ages 5–12" },
              { cls: "icon-green",  shape: "◆", label: "Parent dashboard included" },
            ].map(({ cls, shape, label }) => (
              <div className="feat-pill" key={label}>
                <div className={`feat-icon ${cls}`}>{shape}</div>
                {label}
              </div>
            ))}
          </div>

          <div
            className="hero-scroll"
            onClick={() => hiwRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            <span className="scroll-label">How it works</span>
            <div className="scroll-arrow" />
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="dc-section hiw" ref={hiwRef}>
          <p className="hiw-eyebrow">The mission flow</p>
          <h2 className="hiw-headline">
            From first login<br />to real insight
          </h2>
          <p className="hiw-sub">
            Four simple steps that turn play into a science-backed picture
            of your child's reading strengths and challenges.
          </p>

          <div className="hiw-layout">
            {/* step list */}
            <div className="step-list">
              {STEPS.map((s, i) => (
                <div key={s.id}>
                  <div
                    className={`step-item${active === i ? " active" : ""}`}
                    onClick={() => handleStepClick(i)}
                    style={active === i ? { borderColor: `${s.color}33` } : {}}
                  >
                    <div
                      className="step-num"
                      style={{
                        background: active === i ? `${s.color}22` : "rgba(255,255,255,.04)",
                        fontSize: "1.1rem",
                      }}
                    >
                      {s.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        className="step-tag"
                        style={{ color: active === i ? s.accent : "#475569" }}
                      >
                        {s.tag}
                      </p>
                      <p className="step-title">{s.title}</p>
                      <p className="step-body">{s.body}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && <div className="step-connector" />}
                </div>
              ))}
            </div>

            {/* sticky visual */}
            <div className="hiw-visual">
              <div
                className="visual-card"
                style={{ borderColor: `${step.color}33` }}
              >
                <div
                  className="visual-icon-wrap"
                  style={{ background: `${step.color}22` }}
                >
                  {step.icon}
                </div>
                <p className="visual-tag" style={{ color: step.accent }}>
                  {step.tag}
                </p>
                <p className="visual-title">{step.title}</p>
                <p className="visual-body">{step.body}</p>

                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${step.color}, ${step.accent})`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="dc-footer">
          Dyslexia Detection · Gamified · Science-Backed
        </footer>
      </div>
    </>
  );
}