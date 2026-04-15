import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

function StarTracker() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [target, setTarget] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const spawnTimeRef = useRef(0);
  const gameAreaRef = useRef(null);
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

    const size = 50;
    const x = Math.floor(Math.random() * (window.innerWidth * 0.8 - size));
    const y = Math.floor(Math.random() * (window.innerHeight * 0.6 - size));

    setTarget({ x, y, size });
    spawnTimeRef.current = performance.now();
  };

  const handleTargetClick = (e) => {
    if (!isPlaying) return;

    const clickTime = performance.now();
    const latency = clickTime - spawnTimeRef.current;

    setSessionData((prev) => [...prev, { latency }]);
    setScore((prev) => prev + 100);
    setTarget(null);

    // Minor delay before next spawn
    setTimeout(spawnTarget, Math.random() * 800 + 400);
  };

  const endGame = async () => {
    setIsPlaying(false);
    setGameOver(true);

    const avgLatency = sessionData.reduce((acc, val) => acc + val.latency, 0) / sessionData.length;
    const accuracy = 100; // Perfect accuracy if they clicked all

    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "StarTracker",
        level: "Lab-1",
        accuracy,
        totalQuestions: MISSION_LENGTH,
        correctAnswers: MISSION_LENGTH,
        avgResponseTime: avgLatency,
        metrics: {
          latencyMs: avgLatency,
          saccadicMovementScore: avgLatency < 600 ? 10 : 5 // simplify saccadic mapping for mock
        }
      });
    } catch (err) {
      console.error("Failed to save session", err);
    }
  };

  return (
    <div className="game-container" ref={gameAreaRef}>
      <h1 style={{ marginBottom: "1rem" }}>✨ Star Tracker Diagnostics</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem", maxWidth: "600px" }}>Click the appearing stars as fast as you can. We are tracking your visual response speed.</p>
      
      {!isPlaying && !gameOver && (
        <button onClick={startGame} className="neon-btn">Commence Calibration 🚀</button>
      )}

      {gameOver && (
        <div className="glass-panel pulse-glow">
          <h2 style={{ marginBottom: "1rem" }}>Mission Complete!</h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>Score: {score}</p>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn">Return to Mission Control</button>
        </div>
      )}

      {isPlaying && target && (
        <div
          onClick={handleTargetClick}
          style={{
            position: "absolute",
            left: target.x,
            top: target.y + 150, // offset header
            width: target.size,
            height: target.size,
            backgroundColor: "#ffdd00",
            borderRadius: "50%",
            boxShadow: "0 0 20px #ffdd00",
            cursor: "crosshair",
            transition: "transform 0.1s"
          }}
        />
      )}
    </div>
  );
}



export default StarTracker;
