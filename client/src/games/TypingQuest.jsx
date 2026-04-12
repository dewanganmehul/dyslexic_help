import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

function TypingQuest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [sequence, setSequence] = useState("dyslexia".split(""));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const navigate = useNavigate();

  // Web Audio for multisensory feedback
  const playSynthesizedPhoneme = (letter) => {
    const speech = new SpeechSynthesisUtterance(letter);
    speech.rate = 1.0;
    speech.pitch = 1.5;
    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e) => {
      // Ignore meta keys
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) return;

      const key = e.key.toLowerCase();
      playSynthesizedPhoneme(key);

      if (key === sequence[currentIndex]) {
        setScore(prev => prev + 10);
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= sequence.length) {
            endGame();
          }
          return next;
        });
      } else {
        // Error, lose points or just ignore/feedback
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentIndex, sequence]);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    setScore(0);
  };

  const endGame = async () => {
    setIsPlaying(false);
    setGameOver(true);

    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "TypingQuest",
        level: "Quest-2",
        accuracy: 100, // naive for prototype
        totalQuestions: sequence.length,
        correctAnswers: sequence.length,
        avgResponseTime: 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ backgroundColor: "#2e0f40", minHeight: "100vh", color: "white", padding: "20px", textAlign: "center" }}>
      <h1>⌨️ Typing Quest</h1>
      <p>Type the letters on your keyboard. Hear the sounds as you touch them!</p>

      {!isPlaying && !gameOver && (
        <button onClick={startGame} style={btnStyle}>Begin Typing 🚀</button>
      )}

      {gameOver && (
        <div>
          <h2>Quest Complete!</h2>
          <p>Score: {score}</p>
          <button onClick={() => navigate("/dashboard")} style={btnStyle}>Return to Mission Control</button>
        </div>
      )}

      {isPlaying && (
        <div style={{ marginTop: "50px", fontSize: "60px", letterSpacing: "15px", fontFamily: "monospace" }}>
          {sequence.map((char, i) => (
            <span key={i} style={{ 
              color: i < currentIndex ? "#1D9E75" : i === currentIndex ? "#ffdd00" : "rgba(255,255,255,0.2)",
              borderBottom: i === currentIndex ? "4px solid #ffdd00" : "none"
            }}>
              {char}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: "12px 24px",
  backgroundColor: "#4cc9f0",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "20px"
};

export default TypingQuest;
