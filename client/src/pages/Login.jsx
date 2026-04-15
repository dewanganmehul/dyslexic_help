import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config/config";

/* ─── styles ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dc-login-root {
    min-height: 100vh;
    background: #0a0614;
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem; position: relative; overflow: hidden;
  }

  .dc-orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .28; pointer-events: none; }
  .dc-orb-1 { width: 500px; height: 500px; background: #7c3aed; top: -150px; right: -100px; animation: drift1 9s ease-in-out infinite alternate; }
  .dc-orb-2 { width: 320px; height: 320px; background: #0ea5e9; bottom: -80px; left: -60px;  animation: drift2 11s ease-in-out infinite alternate; }
  .dc-orb-3 { width: 160px; height: 160px; background: #ec4899; top: 55%; left: 60%;          animation: drift1 7s ease-in-out infinite alternate; }

  @keyframes drift1 { from{transform:translate(0,0) scale(1)} to{transform:translate(30px,40px) scale(1.1)} }
  @keyframes drift2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-20px,-30px) scale(1.08)} }

  .dc-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(124,58,237,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,.05) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .dc-floaty { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .dc-floaty-letter {
    position: absolute;
    font-family: 'Syne', sans-serif; font-weight: 800;
    color: rgba(124,58,237,.07); user-select: none;
    animation: floatUp linear infinite;
  }
  @keyframes floatUp {
    from { transform: translateY(110vh) rotate(var(--r)); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    to   { transform: translateY(-20vh) rotate(var(--r)); opacity: 0; }
  }

  .dc-pulse-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(124,58,237,.13);
    animation: ringExpand linear infinite;
    pointer-events: none;
    top: 50%; left: 50%; transform: translate(-50%,-50%);
  }
  @keyframes ringExpand {
    from { width: 100px; height: 100px; opacity: .5; }
    to   { width: 700px; height: 700px; opacity: 0; }
  }

  /* ── split card ── */
  .dc-split {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: 1fr 1fr;
    max-width: 900px; width: 100%;
    border-radius: 28px; overflow: hidden;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(10,6,20,.6);
    backdrop-filter: blur(20px);
    animation: cardIn .7s ease both;
  }
  @keyframes cardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  @media (max-width: 640px) {
    .dc-split { grid-template-columns: 1fr; }
    .dc-side   { display: none; }
  }

  /* ── left decorative panel ── */
  .dc-side {
    background: linear-gradient(160deg, rgba(124,58,237,.22), rgba(14,165,233,.08));
    padding: 48px 40px;
    display: flex; flex-direction: column; justify-content: space-between;
    border-right: 1px solid rgba(255,255,255,.07);
  }
  .dc-side-logo {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.6rem;
    background: linear-gradient(90deg, #a78bfa, #38bdf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 6px;
  }
  .dc-side-tagline { font-size: .8rem; color: #475569; letter-spacing: .05em; margin-bottom: 48px; }

  .dc-side-features { display: flex; flex-direction: column; gap: 22px; }
  .dc-feat {display: flex; gap: 14px; align-items: flex-start; }
  .dc-feat-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
  .dc-feat-text { font-size: .85rem; color: #94a3b8; line-height: 1.5; }
  .dc-feat-text strong { color: #e2e8f0; font-weight: 500; display: block; margin-bottom: 2px; }
  .dc-side-footer { font-size: .68rem; color: #334155; letter-spacing: .14em; text-transform: uppercase; }

  /* ── right form panel ── */
  .dc-form-col {
    padding: 48px 40px;
    display: flex; flex-direction: column; justify-content: center;
  }
  .dc-eyebrow {
    font-size: .68rem; font-weight: 500;
    letter-spacing: .18em; text-transform: uppercase;
    color: #a78bfa; margin-bottom: 10px;
  }
  .dc-form-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.8rem; color: #fff; margin-bottom: 6px;
  }
  .dc-form-sub { font-size: .85rem; color: #475569; margin-bottom: 32px; }

  /* ── error ── */
  .dc-error {
    display: flex; align-items: center; gap: 10px;
    background: rgba(226,75,74,.08);
    border: 1px solid rgba(226,75,74,.28);
    border-radius: 10px; padding: 10px 14px;
    margin-bottom: 18px;
    font-size: .82rem; color: #fca5a5;
    animation: errShake .3s ease;
  }
  @keyframes errShake {
    0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)}
  }
  .dc-err-dot { width: 6px; height: 6px; border-radius: 50%; background: #ef4444; flex-shrink: 0; }

  /* ── fields ── */
  .dc-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .dc-label {
    font-size: .72rem; font-weight: 500;
    letter-spacing: .09em; text-transform: uppercase; color: #64748b;
  }
  .dc-field-wrap { position: relative; }
  .dc-field-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 14px; opacity: .45; pointer-events: none;
  }
  .dc-input {
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
  .dc-input:focus { border-color: rgba(124,58,237,.6); background: rgba(124,58,237,.06); }
  .dc-input::placeholder { color: #334155; }

  .dc-forgot {
    font-size: .75rem; color: #4f46e5;
    text-align: right; cursor: pointer;
    margin-top: -8px; margin-bottom: 22px;
    transition: color .2s; width: fit-content; align-self: flex-end;
  }
  .dc-forgot:hover { color: #a78bfa; }

  /* ── submit ── */
  .dc-submit {
    width: 100%; padding: 14px; border-radius: 14px;
    border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: .95rem; font-weight: 500;
    position: relative; overflow: hidden;
    transition: transform .18s, box-shadow .18s;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
    box-shadow: 0 0 28px rgba(124,58,237,.35);
  }
  .dc-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 48px rgba(124,58,237,.55); }
  .dc-submit:disabled { opacity: .6; cursor: not-allowed; }
  .dc-submit-shimmer {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    opacity: 0; transition: opacity .18s;
  }
  .dc-submit:hover:not(:disabled) .dc-submit-shimmer { opacity: 1; }
  .dc-submit-inner {
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }

  .dc-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff; border-radius: 50%;
    animation: spin .6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .dc-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 20px 0; color: #1e293b; font-size: .75rem;
  }
  .dc-div-line { flex: 1; height: 1px; background: rgba(255,255,255,.06); }

  .dc-register { text-align: center; font-size: .82rem; color: #475569; }
  .dc-register-link {
    color: #a78bfa; cursor: pointer; background: none;
    border: none; font-family: inherit; font-size: inherit;
    transition: color .2s; padding: 0;
  }
  .dc-register-link:hover { color: #c4b5fd; }
`;

/* ─── component ─────────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate  = useNavigate();
  const floatyRef = useRef(null);

  /* floating letters */
  useEffect(() => {
    if (!floatyRef.current) return;
    const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const frag  = document.createDocumentFragment();
    for (let i = 0; i < 16; i++) {
      const el   = document.createElement("div");
      el.className = "dc-floaty-letter";
      const size = Math.random() * 55 + 35;
      el.style.cssText = `font-size:${size}px;left:${Math.random()*100}%;--r:${(Math.random()-.5)*40}deg;animation-duration:${Math.random()*14+10}s;animation-delay:${Math.random()*-20}s`;
      el.textContent = ALPHA[Math.floor(Math.random() * ALPHA.length)];
      frag.appendChild(el);
    }
    floatyRef.current.appendChild(frag);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token",  res.data.token);
      localStorage.setItem("user",   JSON.stringify(res.data.user));
      localStorage.setItem("userId", res.data.user._id);
      navigate("/map");
    } catch {
      setError("Authorization pattern rejected. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="dc-login-root">
        {/* background */}
        <div className="dc-grid" />
        <div className="dc-orb dc-orb-1" />
        <div className="dc-orb dc-orb-2" />
        <div className="dc-orb dc-orb-3" />
        <div className="dc-pulse-ring" style={{ animationDuration: "5s", animationDelay: "0s" }} />
        <div className="dc-pulse-ring" style={{ animationDuration: "5s", animationDelay: "2.5s" }} />
        <div className="dc-floaty" ref={floatyRef} />

        {/* split card */}
        <div className="dc-split">

          {/* ── left panel ── */}
          <div className="dc-side">
            <div>
              <div className="dc-side-logo">DyslexiCore</div>
              <div className="dc-side-tagline">Mission Control v2.0</div>
              <div className="dc-side-features">
                {[
                  { dot: "#a78bfa", title: "Space missions",  body: "Gamified literacy tasks built for curious minds" },
                  { dot: "#38bdf8", title: "AI diagnostics",  body: "Pattern detection running silently in every session" },
                  { dot: "#f472b6", title: "Parent reports",  body: "Clear insights delivered after every mission" },
                ].map(({ dot, title, body }) => (
                  <div className="dc-feat" key={title}>
                    <div className="dc-feat-dot" style={{ background: dot }} />
                    <div className="dc-feat-text">
                      <strong>{title}</strong>{body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dc-side-footer">Safe · Science-backed · Ages 5–12</div>
          </div>

          {/* ── right form ── */}
          <div className="dc-form-col">
            <p className="dc-eyebrow">Pilot authentication</p>
            <h1 className="dc-form-title">Welcome back</h1>
            <p className="dc-form-sub">Enter your credentials to resume your mission.</p>

            {error && (
              <div className="dc-error">
                <div className="dc-err-dot" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
              <div className="dc-field">
                <label className="dc-label">Comms email</label>
                <div className="dc-field-wrap">
                  <span className="dc-field-icon">✉</span>
                  <input
                    className="dc-input"
                    type="email"
                    placeholder="pilot@dyslexicore.io"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="dc-field">
                <label className="dc-label">Access code</label>
                <div className="dc-field-wrap">
                  <span className="dc-field-icon">🔒</span>
                  <input
                    className="dc-input"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <span className="dc-forgot">Forgot access code?</span>

              <button type="submit" className="dc-submit" disabled={loading}>
                <div className="dc-submit-shimmer" />
                <div className="dc-submit-inner">
                  {loading ? (
                    <><div className="dc-spinner" /> Authenticating...</>
                  ) : (
                    <>Enter cockpit &nbsp;🚀</>
                  )}
                </div>
              </button>
            </form>

            <div className="dc-divider">
              <div className="dc-div-line" />
              or
              <div className="dc-div-line" />
            </div>

            <p className="dc-register">
              New to the mission?{" "}
              <button className="dc-register-link" onClick={() => navigate("/signup")}>
                Register here →
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}