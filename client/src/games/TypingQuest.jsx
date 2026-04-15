import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./styles/TypingQuest.css";

const QUEST_WORDS = ["SPACE", "ORBIT", "GALAXY", "ROCKET", "PROTON"];

function TypingQuest() {
  const [wordIndex, setWordIndex] = useState(0);
  const [typedWord, setTypedWord] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isError, setIsError] = useState(false);
  
  const targetWord = QUEST_WORDS[wordIndex];
  const startTimeRef = useRef(0);
  const navigate = useNavigate();

  const playSynthesizedVoice = (text, rate = 1) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = rate;
    window.speechSynthesis.speak(speech);
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setWordIndex(0);
    setTypedWord("");
    startTimeRef.current = performance.now();
  };

  const handleKeyDown = (e) => {
    if (!isPlaying || gameOver) return;
    if (e.key.length > 1) return; // Ignore Shift, Cmd, etc.

    const char = e.key.toUpperCase();
    const expectedChar = targetWord[typedWord.length];

    if (char === expectedChar) {
      playSynthesizedVoice(char, 1.2);
      const newTyped = typedWord + char;
      setTypedWord(newTyped);
      
      if (newTyped === targetWord) {
        setScore(prev => prev + 100);
        handleWordComplete();
      }
    } else {
      setIsError(true);
      playSynthesizedVoice("Error", 1.5);
      setTimeout(() => setIsError(false), 400);
    }
  };

  const handleWordComplete = () => {
    playSynthesizedVoice(targetWord);
    if (wordIndex + 1 < QUEST_WORDS.length) {
      setTimeout(() => {
        setWordIndex(prev => prev + 1);
        setTypedWord("");
      }, 1000);
    } else {
      endGame();
    }
  };

  useEffect(() => {
    const listener = (e) => handleKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [isPlaying, typedWord, gameOver, wordIndex]);

  const endGame = async () => {
    setGameOver(true);
    setIsPlaying(false);
    const totalTime = performance.now() - startTimeRef.current;
    
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "TypingQuest",
        level: "Neural-Link-2",
        accuracy: 100,
        totalQuestions: QUEST_WORDS.join("").length,
        avgResponseTime: totalTime / QUEST_WORDS.length
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="tq-root">
      <div className="tq-bg-grid" />

      <header style={{ textAlign: 'center', zIndex: 2, marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '2.5rem', margin: 0 }}>NEURAL LINK</h1>
        <p style={{ color: 'rgba(0, 243, 255, 0.4)', letterSpacing: '2px', fontSize: '0.8rem' }}>
          ORTHOGRAPHIC DATA UPLOAD
        </p>
      </header>

      {gameOver ? (
        <div className="tq-hud scene-transition">
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📡</div>
          <h2 style={{ fontFamily: 'Syne' }}>UPLOAD COMPLETE</h2>
          <div style={{ background: 'rgba(0, 243, 255, 0.05)', padding: '20px', borderRadius: '20px', margin: '30px 0' }}>
             <p style={{ margin: 0, fontSize: '0.8rem', color: '#00f3ff' }}>FINAL COGNITIVE SCORE</p>
             <h1 style={{ margin: 0 }}>{score}</h1>
          </div>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn" style={{ width: '100%' }}>
            RETURN TO COMMAND
          </button>
        </div>
      ) : isPlaying ? (
        <div className={`tq-hud ${isError ? 'tq-error-glow' : ''}`}>
          <div className="tq-status-bar">Word {wordIndex + 1} of {QUEST_WORDS.length}</div>
          
          <div className="tq-word-display">
            {targetWord.split("").map((char, index) => (
              <span 
                key={index} 
                className={`tq-char ${index < typedWord.length ? 'tq-char-typed' : 'tq-char-pending'}`}
              >
                {char}
              </span>
            ))}
          </div>

          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
            {isError ? "SIGNAL INTERRUPTED - RETRY KEY" : "ESTABLISHING NEURAL SEQUENCE..."}
          </div>
        </div>
      ) : (
        <div className="tq-hud">
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>⌨️</div>
          <h2 style={{ fontFamily: 'Syne' }}>READY FOR UPLOAD?</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>
            Sync your physical input device with the mission core. Hear the phonemes as you type.
          </p>
          <button onClick={startGame} className="neon-btn">INITIALIZE LINK</button>
        </div>
      )}
    </div>
  );
}

export default TypingQuest;