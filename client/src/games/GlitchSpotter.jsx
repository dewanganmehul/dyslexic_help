import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

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
  const startTimeRef = useRef(0);
  const totalLatencyRef = useRef(0);

  const MAX_ROUNDS = 5;
  const navigate = useNavigate();

  const generateGrid = () => {
    if (round >= MAX_ROUNDS) {
      endGame();
      return;
    }

    const currentPair = pairs[Math.floor(Math.random() * pairs.length)];
    const numItems = 16;
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
    generateGrid();
  };

  const handleEntityClick = (index) => {
    if (!isPlaying) return;

    const latency = performance.now() - startTimeRef.current;
    totalLatencyRef.current += latency;

    if (index === glitchIndex) {
      setScore(prev => prev + 100);
      setRound(prev => {
        const next = prev + 1;
        if(next >= MAX_ROUNDS) {
          endGame();
        } else {
          setTimeout(generateGrid, 300);
        }
        return next;
      });
    } else {
      setReversals(prev => prev + 1);
      // Give feedback but don't proceed
      alert("Oops! That's not the glitch. Try again.");
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
        level: "Lab-3",
        accuracy: (MAX_ROUNDS / (MAX_ROUNDS + reversals)) * 100,
        totalQuestions: MAX_ROUNDS,
        correctAnswers: MAX_ROUNDS,
        avgResponseTime: avgLatency,
        metrics: {
          letterReversals: reversals
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="game-container">
      <h1 style={{ marginBottom: "1rem" }}>👾 Glitch Spotter</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Find and click ONLY the '{targetLetter}'</p>
      
      {!isPlaying && !gameOver && (
        <button onClick={startGame} className="neon-btn">Scan Matrix 🚀</button>
      )}

      {gameOver && (
        <div className="glass-panel pulse-glow">
          <h2 style={{ marginBottom: "1rem" }}>Matrix Cleared!</h2>
          <p>Score: {score}</p>
          <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>Mistakes (Reversals): {reversalsCount}</p>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn">Return to Mission Control</button>
        </div>
      )}

      {isPlaying && !gameOver && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(4, 1fr)", 
          gap: "15px", 
          maxWidth: "400px", 
          margin: "40px auto" 
        }}>
          {grid.map((char, index) => (
            <div 
              key={index}
              onClick={() => handleEntityClick(index)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                padding: "30px 0",
                fontSize: "40px",
                fontFamily: "monospace",
                fontWeight: "bold",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            >
              {char}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



export default GlitchSpotter;
