import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config/config";

/* ─── styles ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dc-su-root {
    min-height: 100vh;
    background: #0a0614;
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem; position: relative; overflow: hidden;
  }

  .dc-su-orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .28; pointer-events: none; }
  .dc-su-orb-1 { width: 480px; height: 480px; background: #4f46e5; top: -120px; left: -80px;  animation: suDrift1 9s ease-in-out infinite alternate; }
  .dc-su-orb-2 { width: 300px; height: 300px; background: #ec4899; bottom: -60px; right: -60px; animation: suDrift2 11s ease-in-out infinite alternate; }
  .dc-su-orb-3 { width: 180px; height: 180px; background: #0ea5e9; top: 30%; right: 20%;       animation: suDrift1 8s ease-in-out infinite alternate; }

  @keyframes suDrift1 { from{transform:translate(0,0) scale(1)} to{transform:translate(28px,36px) scale(1.1)} }
  @keyframes suDrift2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-22px,-28px) scale(1.08)} }

  .dc-su-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(79,70,229,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79,70,229,.05) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .dc-su-floaty { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .dc-su-fl {
    position: absolute;
    font-family: 'Syne', sans-serif; font-weight: 800;
    color: rgba(79,70,229,.07); user-select: none;
    animation: suFloat linear infinite;
  }
  @keyframes suFloat {
    from { transform: translateY(110vh) rotate(var(--r)); opacity: 0; }
    10%  { opacity: 1; } 90% { opacity: 1; }
    to   { transform: translateY(-20vh) rotate(var(--r)); opacity: 0; }
  }

  .dc-su-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(79,70,229,.12);
    animation: suRingExpand linear infinite;
    pointer-events: none;
    top: 50%; left: 50%; transform: translate(-50%,-50%);
  }
  @keyframes suRingExpand {
    from { width: 100px; height: 100px; opacity: .5; }
    to   { width: 700px; height: 700px; opacity: 0; }
  }

  /* ── split card ── */
  .dc-su-split {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: 1fr 1fr;
    max-width: 920px; width: 100%;
    border-radius: 28px; overflow: hidden;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(10,6,20,.6);
    backdrop-filter: blur(20px);
    animation: suCardIn .7s ease both;
  }
  @keyframes suCardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  @media (max-width: 660px) {
    .dc-su-split { grid-template-columns: 1fr; }
    .dc-su-side  { display: none; }
  }

  /* ── right decorative panel ── */
  .dc-su-side {
    background: linear-gradient(160deg, rgba(79,70,229,.2), rgba(236,72,153,.1));
    padding: 48px 40px;
    display: flex; flex-direction: column; justify-content: space-between;
    border-left: 1px solid rgba(255,255,255,.07);
    order: 2;
  }
  .dc-su-side-logo {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.6rem;
    background: linear-gradient(90deg, #818cf8, #f472b6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 6px;
  }
  .dc-su-side-tagline { font-size: .8rem; color: #475569; letter-spacing: .05em; margin-bottom: 44px; }

  .dc-su-steps { display: flex; flex-direction: column; gap: 0; }
  .dc-su-step {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 16px 0;
  }
  .dc-su-step-num {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(129,140,248,.15);
    border: 1px solid rgba(129,140,248,.3);
    display: flex; align-items: center; justify-content: center;
    font-size: .75rem; font-weight: 700; color: #818cf8;
    flex-shrink: 0; margin-top: 2px;
  }
  .dc-su-step-label { font-size: .85rem; color: #94a3b8; line-height: 1.5; }
  .dc-su-step-label strong { color: #e2e8f0; font-weight: 500; display: block; margin-bottom: 2px; }
  .dc-su-step-line {
    width: 1px; height: 20px;
    background: rgba(129,140,248,.15);
    margin-left: 13px;
  }

  .dc-su-side-footer { font-size: .68rem; color: #334155; letter-spacing: .14em; text-transform: uppercase; }

  /* ── left form panel ── */
  .dc-su-form-col {
    padding: 48px 40px; order: 1;
    display: flex; flex-direction: column; justify-content: center;
  }
  .dc-su-eyebrow {
    font-size: .68rem; font-weight: 500;
    letter-spacing: .18em; text-transform: uppercase;
    color: #818cf8; margin-bottom: 10px;
  }
  .dc-su-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.8rem; color: #fff; margin-bottom: 6px;
  }
  .dc-su-sub { font-size: .85rem; color: #475569; margin-bottom: 32px; }

  /* ── error ── */
  .dc-su-error {
    display: flex; align-items: center; gap: 10px;
    background: rgba(226,75,74,.08);
    border: 1px solid rgba(226,75,74,.28);
    border-radius: 10px; padding: 10px 14px;
    margin-bottom: 18px;
    font-size: .82rem; color: #fca5a5;
    animation: suErrShake .3s ease;
  }
  @keyframes suErrShake {
    0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)}
  }
  .dc-su-err-dot { width: 6px; height: 6px; border-radius: 50%; background: #ef4444; flex-shrink: 0; }

  /* ── success ── */
  .dc-su-success {
    display: flex; align-items: center; gap: 10px;
    background: rgba(16,185,129,.08);
    border: 1px solid rgba(16,185,129,.28);
    border-radius: 10px; padding: 10px 14px;
    margin-bottom: 18px;
    font-size: .82rem; color: #6ee7b7;
  }
  .dc-su-ok-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; flex-shrink: 0; }

  /* ── fields ── */
  .dc-su-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .dc-su-label {
    font-size: .72rem; font-weight: 500;
    letter-spacing: .09em; text-transform: uppercase; color: #64748b;
  }
  .dc-su-field-wrap { position: relative; }
  .dc-su-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 14px; opacity: .45; pointer-events: none;
  }
  .dc-su-input {
    width: 100%;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 12px 14px 12px 40px;
    color: #e2e8f0;
    font-family: 'DM Sans', sans-serif; font-size: .9rem;
    outline: none;
    transition: border-color .2s, background .2s;
  }
  .dc-su-input:focus { border-color: rgba(79,70,229,.6); background: rgba(79,70,229,.06); }
  .dc-su-input::placeholder { color: #334155; }

  /* password strength */
  .dc-su-strength { margin-top: 8px; display: flex; flex-direction: column; gap: 5px; }
  .dc-su-strength-bars { display: flex; gap: 4px; }
  .dc-su-bar {
    flex: 1; height: 3px; border-radius: 100px;
    background: rgba(255,255,255,.08);
    transition: background .3s;
  }
  .dc-su-strength-label { font-size: .7rem; color: #475569; }

  /* ── submit ── */
  .dc-su-submit {
    width: 100%; padding: 14px; border-radius: 14px;
    border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: .95rem; font-weight: 500;
    position: relative; overflow: hidden;
    transition: transform .18s, box-shadow .18s;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff; margin-top: 8px;
    box-shadow: 0 0 28px rgba(79,70,229,.35);
  }
  .dc-su-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 48px rgba(79,70,229,.55); }
  .dc-su-submit:disabled { opacity: .6; cursor: not-allowed; }
  .dc-su-shimmer {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    opacity: 0; transition: opacity .18s;
  }
  .dc-su-submit:hover:not(:disabled) .dc-su-shimmer { opacity: 1; }
  .dc-su-submit-inner {
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }

  .dc-su-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff; border-radius: 50%;
    animation: suSpin .6s linear infinite;
  }
  @keyframes suSpin { to { transform: rotate(360deg); } }

  .dc-su-terms {
    font-size: .72rem; color: #334155;
    text-align: center; margin-top: 14px; line-height: 1.5;
  }

  .dc-su-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 20px 0; color: #1e293b; font-size: .75rem;
  }
  .dc-su-div-line { flex: 1; height: 1px; background: rgba(255,255,255,.06); }

  .dc-su-login { text-align: center; font-size: .82rem; color: #475569; }
  .dc-su-login-link {
    color: #818cf8; cursor: pointer; background: none;
    border: none; font-family: inherit; font-size: inherit;
    transition: color .2s; padding: 0;
  }
  .dc-su-login-link:hover { color: #c7d2fe; }
`;

/* ── password strength helper ── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  const map = [
    { label: "",          color: "" },
    { label: "Weak",      color: "#ef4444" },
    { label: "Fair",      color: "#f59e0b" },
    { label: "Good",      color: "#3b82f6" },
    { label: "Strong",    color: "#10b981" },
  ];
  return { score, ...map[score] };
}

/* ─── component ─────────────────────────────────────────────── */
export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const navigate  = useNavigate();
  const floatyRef = useRef(null);

  /* floating letters */
  useEffect(() => {
    if (!floatyRef.current) return;
    const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const frag  = document.createDocumentFragment();
    for (let i = 0; i < 16; i++) {
      const el = document.createElement("div");
      el.className = "dc-su-fl";
      const size = Math.random() * 55 + 35;
      el.style.cssText = `font-size:${size}px;left:${Math.random()*100}%;--r:${(Math.random()-.5)*40}deg;animation-duration:${Math.random()*14+10}s;animation-delay:${Math.random()*-20}s`;
      el.textContent = ALPHA[Math.floor(Math.random() * ALPHA.length)];
      frag.appendChild(el);
    }
    floatyRef.current.appendChild(frag);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await axios.post(`${BASE_URL}/api/auth/signup`, formData);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Mission aborted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(formData.password);

  return (
    <>
      <style>{CSS}</style>

      <div className="dc-su-root">
        {/* background */}
        <div className="dc-su-grid" />
        <div className="dc-su-orb dc-su-orb-1" />
        <div className="dc-su-orb dc-su-orb-2" />
        <div className="dc-su-orb dc-su-orb-3" />
        <div className="dc-su-ring" style={{ animationDuration: "5s", animationDelay: "0s" }} />
        <div className="dc-su-ring" style={{ animationDuration: "5s", animationDelay: "2.5s" }} />
        <div className="dc-su-floaty" ref={floatyRef} />

        {/* split card */}
        <div className="dc-su-split">

          {/* ── left: form ── */}
          <div className="dc-su-form-col">
            <p className="dc-su-eyebrow">New recruit</p>
            <h1 className="dc-su-title">Join the fleet</h1>
            <p className="dc-su-sub">Create your pilot profile and start the first mission.</p>

            {error && (
              <div className="dc-su-error">
                <div className="dc-su-err-dot" />
                {error}
              </div>
            )}
            {success && (
              <div className="dc-su-success">
                <div className="dc-su-ok-dot" />
                Profile created — redirecting to login...
              </div>
            )}

            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column" }}>
              <div className="dc-su-field">
                <label className="dc-su-label">Full name</label>
                <div className="dc-su-field-wrap">
                  <span className="dc-su-icon">👤</span>
                  <input
                    className="dc-su-input"
                    name="name"
                    placeholder="Commander Jane Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="dc-su-field">
                <label className="dc-su-label">Comms email</label>
                <div className="dc-su-field-wrap">
                  <span className="dc-su-icon">✉</span>
                  <input
                    className="dc-su-input"
                    name="email"
                    type="email"
                    placeholder="pilot@dyslexicore.io"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="dc-su-field">
                <label className="dc-su-label">Access code</label>
                <div className="dc-su-field-wrap">
                  <span className="dc-su-icon">🔒</span>
                  <input
                    className="dc-su-input"
                    name="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {formData.password.length > 0 && (
                  <div className="dc-su-strength">
                    <div className="dc-su-strength-bars">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="dc-su-bar"
                          style={{ background: n <= strength.score ? strength.color : undefined }}
                        />
                      ))}
                    </div>
                    <span className="dc-su-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <button type="submit" className="dc-su-submit" disabled={loading || success}>
                <div className="dc-su-shimmer" />
                <div className="dc-su-submit-inner">
                  {loading ? (
                    <><div className="dc-su-spinner" /> Registering...</>
                  ) : success ? (
                    <>Profile created ✓</>
                  ) : (
                    <>Launch career &nbsp;🚀</>
                  )}
                </div>
              </button>
            </form>

            <p className="dc-su-terms">
              By registering you agree to the DyslexiCore mission guidelines.
            </p>

            <div className="dc-su-divider">
              <div className="dc-su-div-line" />
              or
              <div className="dc-su-div-line" />
            </div>

            <p className="dc-su-login">
              Already briefed?{" "}
              <button className="dc-su-login-link" onClick={() => navigate("/login")}>
                Login here →
              </button>
            </p>
          </div>

          {/* ── right: decorative steps panel ── */}
          <div className="dc-su-side">
            <div>
              <div className="dc-su-side-logo">DyslexiCore</div>
              <div className="dc-su-side-tagline">Your mission starts here</div>
              <div className="dc-su-steps">
                {[
                  { n: "01", title: "Build your profile",   body: "Set up in under two minutes" },
                  { n: "02", title: "Enter the ship",        body: "Access your mission dashboard" },
                  { n: "03", title: "Launch first mission",  body: "Start a space literacy adventure" },
                  { n: "04", title: "Receive your report",   body: "Get science-backed insights" },
                ].map(({ n, title, body }, i, arr) => (
                  <div key={n}>
                    <div className="dc-su-step">
                      <div className="dc-su-step-num">{n}</div>
                      <div className="dc-su-step-label">
                        <strong>{title}</strong>{body}
                      </div>
                    </div>
                    {i < arr.length - 1 && <div className="dc-su-step-line" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="dc-su-side-footer">Free to start · No credit card</div>
          </div>
        </div>
      </div>
    </>
  );
}