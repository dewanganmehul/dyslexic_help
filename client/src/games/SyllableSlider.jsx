import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./styles/SyllableSlider.css";

const words = [
  { word: "BASKETBALL", splits: [3, 6] },
  { word: "COMPUTER", splits: [3, 5] },
  { word: "MAGNETIC", splits: [3, 5] }
];

function SyllableSlider() {
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [slices, setSlices] = useState([]);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  const currentData = words[level];

  const handleSlice = (index) => {
    const slicePos = index + 1;
    if (slicePos === currentData.word.length) return;

    if (slices.includes(slicePos)) {
      setSlices(slices.filter(s => s !== slicePos));
    } else {
      setSlices([...slices, slicePos].sort((a, b) => a - b));
    }
  };

  const checkSlices = async () => {
    const isCorrect = JSON.stringify(slices) === JSON.stringify(currentData.splits);
    
    if (isCorrect) {
      setFeedback("ACOUSTIC CHUNKING STABILIZED ✅");
      setTimeout(() => {
        if (level + 1 >= words.length) {
          endGame();
        } else {
          setLevel(level + 1);
          setSlices([]);
          setFeedback("");
        }
      }, 1500);
    } else {
      setFeedback("FREQUENCY DISSONANCE DETECTED ❌");
      try {
        const res = await axios.post(`${BASE_URL}/api/tutor/hint`, { 
          errorType: "syllable_slice", 
          context: currentData.word 
        });
        if (res.data.success) setFeedback(`🤖 SYSTEM HINT: ${res.data.hint}`);
      } catch (e) { /* silent fallback */ }
    }
  };

  const endGame = async () => {
    setGameOver(true);
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "SyllableSlider",
        level: "Linguistic-Slicer-3",
        accuracy: 100,
        totalQuestions: words.length,
        correctAnswers: words.length,
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="ss-root">
      <header style={{ textAlign: 'center', zIndex: 2 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '2.5rem', margin: 0 }}>SONIC SLICER</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', fontSize: '0.8rem' }}>
          DECONSTRUCT THE LINGUISTIC FREQUENCY
        </p>
      </header>

      {gameOver ? (
        <div className="ss-hud" style={{ marginTop: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚔️</div>
          <h2 style={{ fontFamily: 'Syne' }}>MISSION SUCCESS</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>
            All word structures successfully analyzed and partitioned.
          </p>
          <button onClick={() => navigate("/dashboard")} className="ss-btn-check" style={{ width: '100%' }}>
            SYNC DATA & RETURN
          </button>
        </div>
      ) : (
        <div className="ss-hud" style={{ marginTop: '40px' }}>
          <span style={{ fontSize: '0.7rem', color: '#7c3aed', letterSpacing: '3px', fontWeight: 700 }}>
            TARGET CORE: {currentData.word}
          </span>

          <div className="ss-word-display">
            {currentData.word.split("").map((char, index) => (
              <div key={index} className="ss-char-container">
                <span className="ss-letter" onClick={() => handleSlice(index)}>
                  {char}
                </span>
                
                {/* Laser Marker */}
                {slices.includes(index + 1) && <div className="ss-laser" />}
              </div>
            ))}
          </div>

          <button onClick={checkSlices} className="ss-btn-check">
            CHECK ALIGNMENT
          </button>

          <div className="ss-feedback-area">
            <p style={{ 
              color: feedback.includes('❌') ? '#ef4444' : '#10b981', 
              margin: 0, 
              fontSize: '0.9rem' 
            }}>
              {feedback}
            </p>
          </div>
        </div>
      )}

      {/* Helper footer */}
      {!gameOver && (
        <p style={{ position: 'fixed', bottom: '30px', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
          TAP THE LETTERS TO PLACE OR REMOVE A SONIC SLICE
        </p>
      )}
    </div>
  );
}

export default SyllableSlider;