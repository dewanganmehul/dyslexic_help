import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

function TypingQuest() {
  const [targetWord, setTargetWord] = useState("apple");
  const [typedWord, setTypedWord] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const startTimeRef = useRef(0);
  const navigate = useNavigate();

  const playSynthesizedVoice = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9; 
    window.speechSynthesis.speak(speech);
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setTypedWord("");
    startTimeRef.current = performance.now();
  };

  const handleKeyDown = (e) => {
    if (!isPlaying || gameOver) return;

    // Ignore special keys
    if (e.key.length > 1) return;

    const char = e.key.toLowerCase();
    const expectedChar = targetWord[typedWord.length];

    if (char === expectedChar) {
      playSynthesizedVoice(char);
      setTypedWord(prev => prev + char);
      
      if (typedWord.length + 1 === targetWord.length) {
        // Word complete
        playSynthesizedVoice(targetWord); // Reinforce full word
        setScore(score + 10);
        endGame();
      }
    } else {
      // Wrong key hit, penalty or log could occur here
      playSynthesizedVoice("Oops");
    }
  };

  // Provide focus so we can just type anywhere on screen
  useEffect(() => {
    const handleCapture = (e) => handleKeyDown(e);
    window.addEventListener("keydown", handleCapture);
    return () => window.removeEventListener("keydown", handleCapture);
  }, [isPlaying, typedWord, gameOver]);

  const endGame = async () => {
    setGameOver(true);
    setIsPlaying(false);
    const endTime = performance.now();
    
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "TypingQuest",
        level: "Quest-2",
        accuracy: 100, // naive tracking for now
        totalQuestions: targetWord.length,
        correctAnswers: targetWord.length,
        avgResponseTime: (endTime - startTimeRef.current) / targetWord.length
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="game-container">
      <h1 style={{ marginBottom: "1rem" }}>⌨️ Typing Quest</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Type the letters on your keyboard. Hear the sounds as you touch them!</p>

      {!isPlaying && !gameOver && (
        <button onClick={startGame} className="neon-btn">Begin Typing 🚀</button>
      )}

      {gameOver && (
        <div className="glass-panel pulse-glow">
          <h2 style={{ marginBottom: "1rem" }}>Quest Complete!</h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>Score: {score}</p>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn">Return to Mission Control</button>
        </div>
      )}

      {isPlaying && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "50px", letterSpacing: "15px" }}>
            {targetWord.split("").map((char, index) => {
              const isTyped = index < typedWord.length;
              return (
                <span key={index} style={{ color: isTyped ? "var(--success)" : "rgba(255,255,255,0.2)" }}>
                  {char}
                </span>
              );
            })}
          </h2>
        </div>
      )}
    </div>
  );
}

export default TypingQuest;
