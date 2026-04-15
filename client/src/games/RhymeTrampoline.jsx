import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./styles/RhymeTrampoline.css";

const rounds = [
  { target: "HAT", options: ["BAT", "MUG", "CAT", "DOG"], correct: ["BAT", "CAT"] },
  { target: "PIG", options: ["WIG", "LOG", "FIG", "BUG"], correct: ["WIG", "FIG"] },
  { target: "STAR", options: ["CAR", "MOON", "FAR", "SUN"], correct: ["CAR", "FAR"] }
];

function RhymeTrampoline() {
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [characterHeight, setCharacterHeight] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [remainingCorrect, setRemainingCorrect] = useState(2);
  const [score, setScore] = useState(0);
  
  const navigate = useNavigate();
  const currentRound = rounds[level];

  // Game Loop
  useEffect(() => {
    if (gameOver || !currentRound) return;
    
    const loop = setInterval(() => {
      setCharacterHeight(h => {
        let newH = h + velocity;
        if (newH <= 0) {
          setVelocity(0);
          return 0;
        }
        return newH;
      });
      
      setVelocity(v => {
        if (characterHeight > 0 || v > 0) return v - 0.8; // Gravity constant
        return 0;
      });
      
    }, 30);
    return () => clearInterval(loop);
  }, [velocity, characterHeight, gameOver, currentRound]);

  const handleWordClick = (word) => {
    if (currentRound.correct.includes(word)) {
      // Sonic Boost
      setVelocity(20);
      setScore(s => s + 150);
      setRemainingCorrect(r => {
        const next = r - 1;
        if (next <= 0) {
          setTimeout(() => advanceLevel(), 1000);
        }
        return next;
      });
    } else {
      // Sonic Misfire
      setVelocity(-8);
      setScore(s => Math.max(0, s - 50));
    }
  };

  const advanceLevel = () => {
    if (level + 1 >= rounds.length) {
      endGame();
    } else {
      setLevel(prev => prev + 1);
      setRemainingCorrect(rounds[level + 1].correct.length);
      setVelocity(15); // Start new level with a boost
    }
  };

  const endGame = async () => {
    setGameOver(true);
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "RhymeTrampoline",
        level: "Propulsion-Lab-4",
        accuracy: 100,
        totalQuestions: rounds.length,
        correctAnswers: rounds.length,
        avgResponseTime: 0,
        metrics: { totalScore: score }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rt-root">
      <div className="rt-speed-lines" />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Syne', margin: 0 }}>RHYME PROPULSION</h1>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>
          ACOUSTIC LIFT MISSION v1.2
        </p>
      </div>

      {gameOver ? (
        <div className="rt-hud" style={{ marginTop: '50px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌌</div>
          <h2 style={{ fontFamily: 'Syne' }}>ORBIT REACHED</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
            Acoustic frequency matching complete. Thrusters optimal.
          </p>
          <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
             <p style={{ margin: 0, fontSize: '0.8rem', color: '#7c3aed' }}>FINAL POWER SCORE</p>
             <h1 style={{ margin: 0 }}>{score}</h1>
          </div>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn" style={{ width: '100%' }}>
            RETURN TO COMMAND
          </button>
        </div>
      ) : (
        <>
          <div className="rt-hud">
            <span className="rt-target-display">Frequency Match Required</span>
            <div className="rt-target-word">{currentRound?.target}</div>
            
            <div className="rt-options-grid">
              {currentRound?.options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleWordClick(opt)} 
                  className="rt-word-btn"
                >
                  {opt}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
              REMAINING THRUSTERS: {remainingCorrect}
            </div>
          </div>

          <div className="rt-character-area">
            <div className="rt-thruster-pad" />
            <div 
              className="rt-astronaut" 
              style={{ 
                transform: `translateY(-${characterHeight}px)`,
                // Add a little wobble based on velocity
                rotate: `${velocity * 1.5}deg` 
              }}
            >
              🧑‍🚀
            </div>
          </div>
        </>
      )}

      {/* Score HUD */}
      {!gameOver && (
        <div style={{ position: 'fixed', bottom: '20px', right: '30px', textAlign: 'right', zIndex: 3 }}>
           <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>ALTITUDE SCORE</p>
           <h2 style={{ margin: 0, color: '#7c3aed', fontFamily: 'Syne' }}>{score}</h2>
        </div>
      )}
    </div>
  );
}

export default RhymeTrampoline;