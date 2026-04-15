import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

const words = [
  { target: "cat", parts: ["c", "a", "t"] },
  { target: "bat", parts: ["b", "a", "t"] },
  { target: "man", parts: ["m", "a", "n"] },
  { target: "map", parts: ["m", "a", "p"] }
];

function CVCExplorer() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [slots, setSlots] = useState([null, null, null]);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [gameOver, setGameOver] = useState(false);
  
  const [metrics, setMetrics] = useState({ accuracy: 0, errors: 0 });
  const navigate = useNavigate();

  // Synthetic Audio helper for Multisensory
  const playPhoneme = (letter) => {
    const speech = new SpeechSynthesisUtterance(letter);
    speech.rate = 0.8;
    speech.pitch = 1.2;
    window.speechSynthesis.speak(speech);
  };

  const getHintFromTutor = async (errorType, context) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/tutor/hint`, { errorType, context });
      if (res.data.success) {
        setFeedback("🤖 Tutor says: " + res.data.hint);
      }
    } catch (e) {
      setFeedback("❌ Not quite right, keep trying!");
    }
  };

  useEffect(() => {
    loadLevel(0);
  }, []);

  const loadLevel = (levelIdx) => {
    if (levelIdx >= words.length) {
      endGame();
      return;
    }
    const targetWord = words[levelIdx];
    // Shuffle parts for tiles
    const shuffled = [...targetWord.parts].sort(() => 0.5 - Math.random());
    setAvailableTiles(shuffled);
    setSlots([null, null, null]);
    setCurrentLevel(levelIdx);
    setFeedback("");
  };

  const handleTileClick = (tile, idx) => {
    playPhoneme(tile);
    // Move to first empty slot
    const emptyIdx = slots.indexOf(null);
    if (emptyIdx !== -1) {
      const newSlots = [...slots];
      newSlots[emptyIdx] = tile;
      setSlots(newSlots);
      
      const newAvailable = [...availableTiles];
      newAvailable.splice(idx, 1);
      setAvailableTiles(newAvailable);

      if (newSlots.indexOf(null) === -1) {
        // Evaluate
        checkWord(newSlots.join(""));
      }
    }
  };

  const handleSlotClick = (tile, idx) => {
    if (!tile) return;
    playPhoneme(tile);
    // Return to available
    const newSlots = [...slots];
    newSlots[idx] = null;
    setSlots(newSlots);
    setAvailableTiles(prev => [...prev, tile]);
  };

  const checkWord = (formedWord) => {
    const target = words[currentLevel].target;
    if (formedWord === target) {
      setFeedback("✅ Fantastic blending!");
      playPhoneme(target);
      setTimeout(() => loadLevel(currentLevel + 1), 1500);
      setMetrics(p => ({ ...p, accuracy: p.accuracy + 1 }));
    } else {
      setMetrics(p => ({ ...p, errors: p.errors + 1 }));
      getHintFromTutor("phoneme_blending", target);
    }
  };

  const endGame = async () => {
    setGameOver(true);
    const accuracyPct = (metrics.accuracy / (metrics.accuracy + metrics.errors)) * 100;
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "CVCExplorer",
        level: "Quest-1",
        accuracy: accuracyPct,
        totalQuestions: words.length,
        correctAnswers: metrics.accuracy,
        avgResponseTime: 0,
        metrics: {
          phonemicSubstitutions: []
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="game-container">
      <h1 style={{ marginBottom: "1rem" }}>🧱 CVC Word Builder</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Drag the letters to spell the word you hear.</p>

      {gameOver ? (
        <div className="glass-panel pulse-glow">
          <h2 style={{ marginBottom: "1rem" }}>Quest Complete!</h2>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn">Return to Mission Control</button>
        </div>
      ) : (
        <div style={{ marginTop: "30px" }}>
          <h2>Target Word: <span style={{ color: "#4cc9f0" }}>{words[currentLevel]?.target.toUpperCase()}</span></h2>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "40px 0" }}>
            {slots.map((s, i) => (
              <div 
                key={i} 
                onClick={() => handleSlotClick(s, i)}
                style={{ 
                  width: "80px", height: "80px", border: "2px dashed #666", 
                  borderRadius: "10px", display: "flex", alignItems: "center", 
                  justifyContent: "center", fontSize: "40px", fontWeight: "bold",
                  backgroundColor: s ? "#4cc9f0" : "transparent",
                  color: s ? "#000" : "transparent",
                  cursor: s ? "pointer" : "default"
                }}>
                {s ? s.toUpperCase() : ""}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
            {availableTiles.map((t, i) => (
              <div 
                key={i} 
                onClick={() => handleTileClick(t, i)}
                style={{
                  width: "70px", height: "70px", backgroundColor: "#ffdd00", 
                  borderRadius: "10px", display: "flex", alignItems: "center", 
                  justifyContent: "center", fontSize: "30px", fontWeight: "bold",
                  color: "#000", cursor: "pointer", boxShadow: "0 4px #b29a00"
                }}>
                {t.toUpperCase()}
              </div>
            ))}
          </div>

          <div style={{ height: "60px", marginTop: "30px", fontSize: "20px", color: feedback.includes("❌") ? "#ff4d4d" : "#1D9E75" }}>
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}



export default CVCExplorer;
