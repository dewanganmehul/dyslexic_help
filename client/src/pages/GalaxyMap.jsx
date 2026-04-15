import { useNavigate } from "react-router-dom";
import { planets } from "../data/planets";
import { useState, useEffect, useRef } from "react";

/* ─── styles ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .dc-map-root {
    min-height: 100vh;
    background: #0a0614;
    font-family: 'DM Sans', sans-serif;
    color: #e2e8f0;
    padding: 60px 20px;
    position: relative;
    overflow-x: hidden;
  }

  /* Shared Background Elements */
  .dc-grid {
    position: fixed; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(124,58,237,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,.05) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: 0;
  }

  .dc-orb { position: fixed; border-radius: 50%; filter: blur(90px); opacity: .15; pointer-events: none; z-index: 0; }
  .dc-orb-1 { width: 600px; height: 600px; background: #7c3aed; top: -200px; left: -100px; }
  .dc-orb-2 { width: 400px; height: 400px; background: #0ea5e9; bottom: -100px; right: -50px; }

  /* Header Styling */
  .dc-header {
    position: relative; z-index: 1;
    text-align: center; margin-bottom: 60px;
    animation: fadeInDown 0.8s ease;
  }
  .dc-eyebrow {
    font-size: .75rem; font-weight: 500; letter-spacing: .2em;
    text-transform: uppercase; color: #a78bfa; margin-bottom: 12px;
  }
  .dc-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2rem, 5vw, 3.5rem);
    background: linear-gradient(90deg, #fff, #94a3b8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  /* Grid Layout */
  .dc-galaxy-grid {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px; max-width: 1200px; margin: 0 auto;
  }

  /* Planet Card */
  .dc-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 40px 30px;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
  }

  .dc-card.unlocked:hover {
    transform: translateY(-12px);
    background: rgba(124, 58, 237, 0.08);
    border-color: rgba(124, 58, 237, 0.4);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 58, 237, 0.1);
  }

  .dc-card.locked { opacity: 0.6; cursor: not-allowed; }

  /* Icon & Animations */
  .dc-planet-icon {
    font-size: 4rem; margin-bottom: 24px; display: inline-block;
    filter: drop-shadow(0 0 15px rgba(124, 58, 237, 0.3));
  }
  .unlocked .dc-planet-icon { animation: float 4s ease-in-out infinite; }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }

  /* Text Elements */
  .dc-planet-name {
    font-family: 'Syne', sans-serif; font-size: 1.6rem;
    margin-bottom: 8px; color: #fff;
  }
  .dc-planet-score {
    font-size: 0.85rem; color: #64748b; margin-bottom: 24px;
    letter-spacing: 0.05em; text-transform: uppercase;
  }

  /* Buttons */
  .dc-btn {
    width: 100%; padding: 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    cursor: pointer; transition: all 0.2s; border: none;
  }
  .btn-unlocked {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
  }
  .btn-unlocked:hover {
    transform: scale(1.02); box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
  }
  .btn-locked {
    background: rgba(255, 255, 255, 0.05);
    color: #475569; cursor: not-allowed;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Utility Animations */
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dc-scanner-line {
    position: absolute; top: 0; left: 0; width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, #7c3aed, transparent);
    animation: scan 3s linear infinite; opacity: 0.5;
  }
  @keyframes scan {
    0% { top: 0%; }
    100% { top: 100%; }
  }
`;

function GalaxyMap() {
  const navigate = useNavigate();
  const lastScore = parseInt(localStorage.getItem("lastScore"), 10) || 0;

  return (
    <>
      <style>{CSS}</style>
      
      <div className="dc-map-root">
        {/* Background Atmosphere */}
        <div className="dc-grid" />
        <div className="dc-orb dc-orb-1" />
        <div className="dc-orb dc-orb-2" />

        <header className="dc-header">
          <p className="dc-eyebrow">Available Sectors</p>
          <h1 className="dc-title">Galaxy Navigator</h1>
        </header>

        <div className="dc-galaxy-grid">
          {planets.map((planet) => {
            const isUnlocked = lastScore >= planet.unlockScore;

            return (
              <div 
                key={planet.id} 
                className={`dc-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                {!isUnlocked && <div className="dc-scanner-line" />}
                
                <div className="dc-planet-icon">
                  {isUnlocked ? (planet.icon || "🪐") : "🔒"}
                </div>

                <h2 className="dc-planet-name">{planet.name}</h2>
                
                <p className="dc-planet-score">
                  {isUnlocked 
                    ? `Sector Level ${planet.level}` 
                    : `Requires ${planet.unlockScore} XP`}
                </p>

                <button
                  disabled={!isUnlocked}
                  className={`dc-btn ${isUnlocked ? 'btn-unlocked' : 'btn-locked'}`}
                  onClick={() => navigate(`/game/${planet.level}`)}
                >
                  {isUnlocked ? "Initiate Landing 🚀" : "Access Restricted"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default GalaxyMap;