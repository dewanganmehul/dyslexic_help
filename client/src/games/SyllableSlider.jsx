import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

const words = [
  { word: "BASKETBALL", splits: [3, 6] },   // BAS - KET - BALL
  { word: "COMPUTER", splits: [3, 5] },     // COM - PU - TER
  { word: "MAGNETIC", splits: [3, 5] }      // MAG - NE - TIC
];

function SyllableSlider() {
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [slices, setSlices] = useState([]); // Array of split indices
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  const currentData = words[level];

  const handleLetterClick = (index) => {
    // If they click on letter index, we draw a line AFTER that letter
    const slicePos = index + 1;
    // Don't slice at the very end
    if (slicePos === currentData.word.length) return;
    
    if (slices.includes(slicePos)) {
      setSlices(slices.filter(s => s !== slicePos));
    } else {
      setSlices([...slices, slicePos].sort((a,b)=>a-b));
    }
  };

  const checkSlices = async () => {
    const isCorrect = JSON.stringify(slices) === JSON.stringify(currentData.splits);
    
    if (isCorrect) {
      setFeedback("✅ Perfect Syllabication!");
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
      setFeedback("❌ Not quite. Where do the sound breaks happen?");
      
      try {
        const res = await axios.post(`${BASE_URL}/api/tutor/hint`, { 
          errorType: "syllable_slice", 
          context: currentData.word 
        });
        if (res.data.success) {
          setFeedback(`🤖 Tutor: ${res.data.hint}`);
        }
      } catch (e) {
        // Fallback
      }
    }
  };

  const endGame = async () => {
    setGameOver(true);
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "SyllableSlider",
        level: "Quest-3",
        accuracy: 100,
        totalQuestions: words.length,
        correctAnswers: words.length,
        avgResponseTime: 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="game-container">
      <h1 style={{ marginBottom: "1rem" }}>🗡️ Syllable Chunking</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Click between letters to slice the word into syllables!</p>

      {gameOver ? (
        <div className="glass-panel pulse-glow">
          <h2 style={{ marginBottom: "1rem" }}>Words Mastered!</h2>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn">Return to Mission Control</button>
        </div>
      ) : currentData && (
        <div style={{ marginTop: "50px" }}>
          
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "50px", fontFamily: "monospace" }}>
            {currentData.word.split("").map((char, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center" }}>
                <span style={{ padding: "0 5px", cursor: "pointer", transition: "color 0.2s" }}
                      onClick={() => handleLetterClick(index)}
                      onMouseEnter={e => e.currentTarget.style.color = "#ffdd00"}
                      onMouseLeave={e => e.currentTarget.style.color = "white"}
                >
                  {char}
                </span>
                
                {/* Custom Split marker */}
                {slices.includes(index + 1) && (
                  <div style={{ width: "4px", height: "60px", backgroundColor: "#ff4d4d", margin: "0 2px" }} />
                )}
              </div>
            ))}
          </div>

          <button onClick={checkSlices} className="neon-btn" style={{ marginTop: "2rem" }}>Check Slices ✅</button>

          <div style={{ marginTop: "30px", fontSize: "20px", height: "40px", color: feedback.includes("❌") ? "var(--error)" : "var(--success)" }}>
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}

export default SyllableSlider;
