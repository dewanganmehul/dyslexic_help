import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

const rounds = [
  { target: "HAT", options: ["BAT", "MUG", "CAT", "DOG"], correct: ["BAT", "CAT"] },
  { target: "PIG", options: ["WIG", "LOG", "FIG", "BUG"], correct: ["WIG", "FIG"] }
];

function RhymeTrampoline() {
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const [characterHeight, setCharacterHeight] = useState(0); // simulation height
  const [velocity, setVelocity] = useState(0);
  
  const [remainingCorrect, setRemainingCorrect] = useState(2);
  const navigate = useNavigate();

  const currentRound = rounds[level];

  // Simple game loop for gravity
  useEffect(() => {
    if (gameOver || !currentRound) return;
    
    const loop = setInterval(() => {
      setCharacterHeight(h => {
        let newH = h + velocity;
        if (newH <= 0) {
          // Hit the trampoline or ground
          setVelocity(0);
          return 0;
        }
        return newH;
      });
      
      setVelocity(v => {
        if (characterHeight > 0) return v - 1; // gravity
        return 0;
      });
      
    }, 50);
    return () => clearInterval(loop);
  }, [velocity, characterHeight, gameOver, currentRound]);

  const handleWordClick = (word) => {
    if (currentRound.correct.includes(word)) {
      // Big bounce
      setVelocity(15);
      setRemainingCorrect(r => {
        if (r - 1 <= 0) {
          // Next round
          setTimeout(() => advanceLevel(), 1000);
        }
        return r - 1;
      });
    } else {
      // Bad jump, lose momentum
      setVelocity(-5);
    }
  };

  const advanceLevel = () => {
    if (level + 1 >= rounds.length) {
      endGame();
    } else {
      setLevel(level + 1);
      setRemainingCorrect(rounds[level+1].correct.length);
      setVelocity(10); // Start with a bounce
    }
  };

  const endGame = async () => {
    setGameOver(true);
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "RhymeTrampoline",
        level: "Quest-4",
        accuracy: 100,
        totalQuestions: rounds.length,
        correctAnswers: rounds.length,
        avgResponseTime: 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="game-container" style={{ position: "relative" }}>
      <h1 style={{ marginBottom: "1rem" }}>🦘 Rhyme Trampoline</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Keep bouncing! Pick words that rhyme with the target.</p>

      {gameOver ? (
        <div className="glass-panel pulse-glow">
          <h2 style={{ marginBottom: "1rem" }}>Great Jumping!</h2>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn">Return to Mission Control</button>
        </div>
      ) : currentRound && (
        <>
          <div style={{ fontSize: "30px", fontWeight: "bold", border: "2px solid #ffdd00", padding: "10px", display: "inline-block", borderRadius: "10px", marginTop: "20px" }}>
            Target: {currentRound.target}
          </div>

          <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", gap: "20px" }}>
            {currentRound.options.map((opt, i) => (
              <button key={i} onClick={() => handleWordClick(opt)} className="neon-btn" style={{ padding: "12px 30px", fontSize: "1.2rem", background: "linear-gradient(135deg,rgba(0,243,255,0.1),rgba(0,243,255,0.3))", color: "#fff", border: "1px solid var(--accent-cyan)" }}>
                {opt}
              </button>
            ))}
          </div>

          <div style={{ position: "absolute", bottom: "100px", left: "50%", transform: "translateX(-50%)" }}>
            {/* The Character */}
            <div style={{ 
              fontSize: "60px", 
              transform: `translateY(-${characterHeight}px)`,
              transition: "transform 0.05s linear"
            }}>
              🧑‍🚀
            </div>
            {/* The Trampoline */}
            <div style={{ width: "150px", height: "20px", backgroundColor: "#ff4d4d", borderRadius: "10px", margin: "0 auto" }} />
          </div>
        </>
      )}
    </div>
  );
}



export default RhymeTrampoline;
