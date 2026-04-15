import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./styles/StarTracker.css";

function StarTracker() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [target, setTarget] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const spawnTimeRef = useRef(0);
  const navigate = useNavigate();
  const MISSION_LENGTH = 10;

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setSessionData([]);
    setGameOver(false);
    spawnTarget();
  };

  const spawnTarget = () => {
    if (sessionData.length >= MISSION_LENGTH) {
      endGame();
      return;
    }

    // Calculating bounds to keep targets within the "Radar" area
    const size = 60;
    const x = Math.floor(Math.random() * (window.innerWidth - size * 2)) + size;
    const y = Math.floor(Math.random() * (window.innerHeight - size * 4)) + size * 2;

    setTarget({ x, y, size });
    spawnTimeRef.current = performance.now();
  };

  const handleTargetClick = (e) => {
    e.stopPropagation();
    if (!isPlaying) return;

    const latency = performance.now() - spawnTimeRef.current;
    setSessionData((prev) => [...prev, { latency }]);
    setScore((prev) => prev + 100);
    setTarget(null);

    // Random interval for unpredictable saccadic jumps
    setTimeout(spawnTarget, Math.random() * 600 + 300);
  };

  const endGame = async () => {
    setIsPlaying(false);
    setGameOver(true);

    const avgLatency = sessionData.reduce((acc, val) => acc + val.latency, 0) / sessionData.length;

    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "StarTracker",
        level: "Saccadic-Lab-1",
        accuracy: 100,
        totalQuestions: MISSION_LENGTH,
        correctAnswers: MISSION_LENGTH,
        avgResponseTime: avgLatency,
        metrics: { saccadicMovementScore: avgLatency < 500 ? 10 : 7 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="st-root" onClick={() => isPlaying && console.log("Miss!")}>
      <div className="st-radar-grid" />

      <header className="st-hud">
        <h1 style={{ fontFamily: 'Syne', fontSize: '1.5rem', margin: 0 }}>STAR TRACKER</h1>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>
          VISUAL SACCADIC CALIBRATION
        </p>
      </header>

      {!isPlaying && !gameOver && (
        <div style={{ zIndex: 20, textAlign: 'center', marginTop: '100px' }}>
          <p style={{ maxWidth: '400px', marginBottom: '30px', color: 'rgba(255,255,255,0.6)' }}>
            Establish a neural link with the optical sensor. Neutralize the star signals as they appear on the radar.
          </p>
          <button onClick={startGame} className="neon-btn">INITIATE TRACKING</button>
        </div>
      )}

      {gameOver && (
        <div className="glass-panel" style={{ zIndex: 20, padding: '40px', textAlign: 'center', marginTop: '50px' }}>
          <h2 style={{ fontFamily: 'Syne' }}>CALIBRATION COMPLETE</h2>
          <div style={{ margin: '30px 0' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>NEURAL RESPONSE SCORE</p>
            <h1 style={{ fontSize: '4rem', color: '#7c3aed', margin: 0 }}>{score}</h1>
          </div>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn" style={{ width: '100%' }}>
            SYNC TO MISSION CONTROL
          </button>
        </div>
      )}

      {isPlaying && target && (
        <div
          className="st-target"
          onClick={handleTargetClick}
          style={{
            left: target.x,
            top: target.y,
            width: target.size,
            height: target.size,
          }}
        >
          <div className="st-star-core" />
          <div className="st-ring" style={{ animationDelay: '0s' }} />
          <div className="st-ring" style={{ animationDelay: '0.5s' }} />
        </div>
      )}

      {isPlaying && (
        <div className="st-stats-bar">
          <div>TRACKED: {sessionData.length} / {MISSION_LENGTH}</div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div>SYSTEM: ACTIVE</div>
        </div>
      )}
    </div>
  );
}

export default StarTracker;