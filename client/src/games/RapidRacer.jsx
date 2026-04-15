import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "../games/styles/RapidRacer.css"

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
  const [finalTime, setFinalTime] = useState(0);
  
  const startTimeRef = useRef(0);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
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
      alert("Please use Chrome or Edge for Speech functionality.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim().toLowerCase();

      setCurrentIndex(prevIndex => {
        if (prevIndex >= namingItems.length) return prevIndex;
        
        const target = namingItems[prevIndex].text;
        // Check if the detected word matches our target
        if (transcript.includes(target)) {
          setFeedback(`⚡ VELOCITY MATCH: ${target.toUpperCase()}`);
          setTimeout(() => setFeedback(""), 600);
          
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

    recognitionRef.current = recognition;
    recognition.start();
  };

  const endGame = async () => {
    const totalTimeMs = performance.now() - startTimeRef.current;
    setFinalTime(totalTimeMs);
    setIsPlaying(false);
    setGameOver(true);

    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "RapidRacer",
        level: "Velocity-Lab",
        accuracy: 100,
        totalQuestions: namingItems.length,
        correctAnswers: namingItems.length,
        avgResponseTime: totalTimeMs / namingItems.length,
        metrics: { ranTimeSeconds: parseFloat((totalTimeMs / 1000).toFixed(2)) }
      });
    } catch (err) {
      console.error("Telemetry failed:", err);
    }
  };

  return (
    <div className="rr-root">
      <div className="rr-track-lines" />
      
      {/* Title Header */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '2.5rem', marginBottom: '8px' }}>RAPID RACER</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>
          COGNITIVE VELOCITY TEST v4.0
        </p>
      </div>

      {!isPlaying && !gameOver && (
        <div className="rr-hud rr-finish-card">
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🏎️</div>
          <h2 style={{ marginBottom: '15px' }}>Ready to Launch?</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px', lineHeight: '1.6' }}>
            Identify the objects as they appear. <br/>
            Speed is the primary metric for this mission.
          </p>
          <button onClick={startGame} className="neon-btn" style={{ padding: '16px 40px' }}>
            IGNITION 🏁
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="rr-hud">
          {/* Scanline visualizes the mic is "Listening" */}
          <div className="rr-scanline" />
          
          <div className="rr-speed-bar">
            <div 
              className="rr-progress-fill" 
              style={{ width: `${(currentIndex / namingItems.length) * 100}%` }} 
            />
          </div>
          
          <div className="rr-emoji-display">
            {namingItems[currentIndex]?.emoji}
          </div>
          
          <div style={{ fontSize: '0.75rem', color: '#7c3aed', letterSpacing: '2px', fontWeight: 700 }}>
            SYSTEM LISTENING...
          </div>
          
          <div className="rr-feedback">{feedback}</div>
        </div>
      )}

      {gameOver && (
        <div className="rr-hud rr-finish-card">
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🏆</div>
          <h2 style={{ fontFamily: 'Syne', marginBottom: '10px' }}>FINISH LINE CROSSED</h2>
          <div style={{ margin: '30px 0' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>TOTAL ELAPSED TIME</p>
            <h1 style={{ fontSize: '4rem', color: '#7c3aed', margin: 0 }}>
              {(finalTime / 1000).toFixed(2)}s
            </h1>
          </div>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn" style={{ width: '100%' }}>
            TRANSMIT DATA TO MISSION CONTROL
          </button>
        </div>
      )}
    </div>
  );
}

export default RapidRacer;