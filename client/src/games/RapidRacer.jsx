import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

const namingItems = [
  { text: "red", emoji: "🔴" },
  { text: "blue", emoji: "🔵" },
  { text: "cat", emoji: "🐱" },
  { text: "dog", emoji: "🐶" },
  { text: "car", emoji: "🚗" },
  { text: "star", emoji: "⭐" }
];

function RapidRacer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const startTimeRef = useRef(0);
  const recognitionRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setCurrentIndex(0);
    setFeedback("");
    startTimeRef.current = performance.now();
    startListening();
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true; // Keep listening 
    recognition.interimResults = true; // We want fast results

    recognition.onresult = (event) => {
      // Find the latest result
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim().toLowerCase();

      // We need to use state setter callback because of stale closures in event listeners
      setCurrentIndex(prevIndex => {
        if (prevIndex >= namingItems.length) return prevIndex;
        
        const target = namingItems[prevIndex].text;
        if (transcript.includes(target)) {
          setFeedback(`✅ Detected: ${target}`);
          setTimeout(() => setFeedback(""), 800);
          
          const nextIndex = prevIndex + 1;
          if (nextIndex >= namingItems.length) {
            recognition.stop();
            endGame();
          }
          return nextIndex;
        }
        return prevIndex;
      });
    };

    recognition.onerror = (e) => console.log("Speech err:", e);
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const endGame = async () => {
    setIsPlaying(false);
    setGameOver(true);

    const totalTimeMs = performance.now() - startTimeRef.current;
    const ranTimeSeconds = (totalTimeMs / 1000).toFixed(2);

    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "RapidRacer",
        level: "Lab-4",
        accuracy: 100, // They have to get it to progress
        totalQuestions: namingItems.length,
        correctAnswers: namingItems.length,
        avgResponseTime: totalTimeMs / namingItems.length,
        metrics: {
          ranTimeSeconds: parseFloat(ranTimeSeconds)
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="game-container">
      <h1 style={{ marginBottom: "1rem" }}>🏎️ Rapid Racer</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Say the names of the images as fast as you can! (Requires Microphone & Chrome)</p>

      {!isPlaying && !gameOver && (
        <button onClick={startGame} className="neon-btn">Start Engine 🏁</button>
      )}

      {gameOver && (
        <div className="glass-panel pulse-glow">
          <h2 style={{ marginBottom: "1rem" }}>Finish Line Crossed!</h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>RAN Time: {(ranTime / 1000).toFixed(2)} seconds</p>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn">Return to Mission Control</button>
        </div>
      )}

      {isPlaying && !gameOver && currentIndex < namingItems.length && (
        <div style={{ marginTop: "40px" }}>
          <div style={{ fontSize: "120px", animation: "fadeUp 0.3s" }}>
            {namingItems[currentIndex].emoji}
          </div>
          
          <div style={{ marginTop: "50px", fontSize: "20px", color: "rgba(255,255,255,0.7)" }}>
            Listening for you to say it...
          </div>
          
          {feedback && <div style={{ marginTop: "20px", fontSize: "24px", color: "#ffd43b", fontWeight: "bold" }}>{feedback}</div>}
        </div>
      )}
    </div>
  );
}

export default RapidRacer;
