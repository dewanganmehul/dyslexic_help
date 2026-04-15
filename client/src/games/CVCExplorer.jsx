import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./styles/CVCExplorer.css";

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

  const playPhoneme = (letter) => {
    const speech = new SpeechSynthesisUtterance(letter);
    speech.rate = 0.7; // Slower for clarity
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
  };

  const getHintFromTutor = async (errorType, context) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/tutor/hint`, { errorType, context });
      if (res.data.success) {
        setFeedback("🤖 SYSTEM HINT: " + res.data.hint);
      }
    } catch (e) {
      setFeedback("❌ ALIGNMENT FAILED. TRY AGAIN.");
    }
  };

  useEffect(() => { loadLevel(0); }, []);

  const loadLevel = (levelIdx) => {
    if (levelIdx >= words.length) {
      endGame();
      return;
    }
    const targetWord = words[levelIdx];
    const shuffled = [...targetWord.parts].sort(() => 0.5 - Math.random());
    setAvailableTiles(shuffled);
    setSlots([null, null, null]);
    setCurrentLevel(levelIdx);
    setFeedback("AWAITING PHONEME ASSEMBLY...");
  };

  const handleTileClick = (tile, idx) => {
    playPhoneme(tile);
    const emptyIdx = slots.indexOf(null);
    if (emptyIdx !== -1) {
      const newSlots = [...slots];
      newSlots[emptyIdx] = tile;
      setSlots(newSlots);
      
      const newAvailable = [...availableTiles];
      newAvailable.splice(idx, 1);
      setAvailableTiles(newAvailable);

      if (newSlots.indexOf(null) === -1) {
        checkWord(newSlots.join(""));
      }
    }
  };

  const handleSlotClick = (tile, idx) => {
    if (!tile) return;
    const newSlots = [...slots];
    newSlots[idx] = null;
    setSlots(newSlots);
    setAvailableTiles(prev => [...prev, tile]);
  };

  const checkWord = (formedWord) => {
    const target = words[currentLevel].target;
    if (formedWord === target) {
      setFeedback("✅ PHONEME BLENDING OPTIMAL");
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
    const accuracyPct = (metrics.accuracy / (metrics.accuracy + metrics.errors)) * 100 || 100;
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "CVCExplorer",
        level: "Assembly-Lab-1",
        accuracy: accuracyPct,
        totalQuestions: words.length,
        correctAnswers: metrics.accuracy,
        avgResponseTime: 0,
        metrics: { phonemicSubstitutions: [] }
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="cvc-root">
      <div className="cvc-bg-hex" />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '2.5rem', marginBottom: '8px' }}>CVC EXPLORER</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '2px' }}>
          QUANTUM LINGUISTIC ASSEMBLY
        </p>
      </div>

      {gameOver ? (
        <div className="cvc-hud">
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🛰️</div>
          <h2 style={{ fontFamily: 'Syne', marginBottom: '10px' }}>MISSION SUCCESSFUL</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
            Phoneme patterns successfully integrated into core memory.
          </p>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn" style={{ width: '100%' }}>
            RETURN TO COMMAND CENTER
          </button>
        </div>
      ) : (
        <div className="cvc-hud">
          <span style={{ fontSize: '0.7rem', color: '#7c3aed', letterSpacing: '3px', fontWeight: 700 }}>
            TARGET SEQUENCE: {words[currentLevel]?.target.toUpperCase()}
          </span>

          <div className="cvc-slots-container">
            {slots.map((s, i) => (
              <div 
                key={i} 
                className={`cvc-slot ${s ? 'filled' : ''}`}
                onClick={() => handleSlotClick(s, i)}
              >
                {s ? s.toUpperCase() : ""}
              </div>
            ))}
          </div>

          <div className="cvc-tiles-container">
            {availableTiles.map((t, i) => (
              <div 
                key={i} 
                className="cvc-tile"
                onClick={() => handleTileClick(t, i)}
              >
                {t.toUpperCase()}
              </div>
            ))}
          </div>

          <div className={`cvc-tutor-box ${feedback.includes('❌') ? 'error' : ''}`}>
            <p style={{ margin: 0, color: feedback.includes('❌') ? '#ef4444' : '#10b981', fontWeight: 600 }}>
              {feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CVCExplorer;