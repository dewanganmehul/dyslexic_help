import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./styles/GlitchSpotter.css";

const pairs = [
  { base: 'b', glitch: 'd' },
  { base: 'p', glitch: 'q' },
  { base: 'u', glitch: 'n' },
  { base: 'm', glitch: 'w' }
];

function GlitchSpotter() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [grid, setGrid] = useState([]);
  const [glitchIndex, setGlitchIndex] = useState(-1);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [reversals, setReversals] = useState(0);
  const [errorCell, setErrorCell] = useState(null);
  const [currentGlitchChar, setCurrentGlitchChar] = useState('');

  const startTimeRef = useRef(0);
  const totalLatencyRef = useRef(0);
  const MAX_ROUNDS = 6;
  const navigate = useNavigate();

  const generateGrid = (currentRound) => {
    if (currentRound >= MAX_ROUNDS) {
      endGame();
      return;
    }

    const currentPair = pairs[Math.floor(Math.random() * pairs.length)];
    setCurrentGlitchChar(currentPair.glitch);
    
    // Difficulty increases grid size: 16 items for rounds 0-2, 25 items for rounds 3+
    const numItems = currentRound < 3 ? 16 : 25;
    const gIndex = Math.floor(Math.random() * numItems);
    
    let newGrid = [];
    for(let i=0; i<numItems; i++) {
      newGrid.push(i === gIndex ? currentPair.glitch : currentPair.base);
    }

    setGrid(newGrid);
    setGlitchIndex(gIndex);
    startTimeRef.current = performance.now();
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setRound(0);
    setReversals(0);
    totalLatencyRef.current = 0;
    generateGrid(0);
  };

  const handleEntityClick = (index) => {
    if (!isPlaying || errorCell !== null) return;

    if (index === glitchIndex) {
      const latency = performance.now() - startTimeRef.current;
      totalLatencyRef.current += latency;
      setScore(prev => prev + 100);
      
      const nextRound = round + 1;
      setRound(nextRound);
      
      if (nextRound >= MAX_ROUNDS) {
        endGame();
      } else {
        generateGrid(nextRound);
      }
    } else {
      setReversals(prev => prev + 1);
      setErrorCell(index);
      setTimeout(() => setErrorCell(null), 400);
    }
  };

  const endGame = async () => {
    setIsPlaying(false);
    setGameOver(true);
    const avgLatency = totalLatencyRef.current / MAX_ROUNDS;

    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "GlitchSpotter",
        level: "Data-Integrity-Lab",
        accuracy: (MAX_ROUNDS / (MAX_ROUNDS + reversals)) * 100,
        totalQuestions: MAX_ROUNDS,
        correctAnswers: MAX_ROUNDS,
        avgResponseTime: avgLatency,
        metrics: { letterReversals: reversals }
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="gs-root">
      <div className="gs-grid-bg" />

      {!isPlaying && !gameOver ? (
        <div className="gs-hud">
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>👾</div>
          <h1 style={{ fontFamily: 'Syne' }}>GLITCH SPOTTER</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>
            Detect visual anomalies in the data matrix. Identify the mirrored "glitch" character.
          </p>
          <button onClick={startGame} className="neon-btn">INITIALIZE SCAN</button>
        </div>
      ) : gameOver ? (
        <div className="gs-hud">
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🛰️</div>
          <h2 style={{ fontFamily: 'Syne' }}>SCAN COMPLETE</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '20px 0' }}>
            <div style={{ background: 'rgba(0, 255, 149, 0.05)', padding: '15px', borderRadius: '15px' }}>
              <p style={{ fontSize: '0.7rem', color: '#00ff95', margin: 0 }}>SCORE</p>
              <h2 style={{ margin: 0 }}>{score}</h2>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '15px', borderRadius: '15px' }}>
              <p style={{ fontSize: '0.7rem', color: '#ef4444', margin: 0 }}>REVERSALS</p>
              <h2 style={{ margin: 0 }}>{reversals}</h2>
            </div>
          </div>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn" style={{ width: '100%' }}>
            SYNC DATA & RETURN
          </button>
        </div>
      ) : (
        <div className="gs-hud">
          <div className="gs-stat-pill">MATRIX ROUND {round + 1}/{MAX_ROUNDS}</div>
          <p style={{ margin: '15px 0 5px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            TARGET ANOMALY
          </p>
          <h2 style={{ margin: 0, color: '#00ff95', fontFamily: 'monospace', fontSize: '2rem' }}>
            "{currentGlitchChar}"
          </h2>

          <div className="gs-matrix" style={{ 
            gridTemplateColumns: `repeat(${grid.length === 16 ? 4 : 5}, 1fr)` 
          }}>
            {grid.map((char, index) => (
              <div 
                key={index}
                className={`gs-cell ${errorCell === index ? 'error-flash' : ''}`}
                onClick={() => handleEntityClick(index)}
              >
                {char}
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px' }}>
            SCANNING FOR MIRROR REVERSALS...
          </div>
        </div>
      )}
    </div>
  );
}

export default GlitchSpotter;