import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { analyzeError } from "../utils/errorAnalysis";
import { getNextLevel, getWordsByLevel } from "../utils/adaptiveEngine";
import { BASE_URL } from "../config/config";
import "./styles/PhonemePopper.css";

function PhonemePopper() {
  const [level, setLevel] = useState("easy");
  const [words, setWords] = useState(getWordsByLevel("easy"));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [errors, setErrors] = useState([]);
  const [errorTypes, setErrorTypes] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [listening, setListening] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const currentWord = words[currentIndex];

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInput(spokenText);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.current = recognition;
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const responseTime = Date.now() - startTime;
    const newTotalTime = totalTime + responseTime;
    let newScore = score;
    let updatedErrors = [...errors];
    let updatedErrorTypes = [...errorTypes];

    if (input.toLowerCase().trim() === currentWord.toLowerCase()) {
      newScore++;
      setScore(newScore);
      setFeedback("CORRECT SENSOR MATCH ✅");
    } else {
      const errorType = analyzeError(input, currentWord);
      updatedErrors.push(`${input} → ${currentWord}`);
      updatedErrorTypes.push(errorType);
      setErrors(updatedErrors);
      setErrorTypes(updatedErrorTypes);
      setFeedback(`DEVIATION DETECTED: ${errorType.toUpperCase()} ❌`);
    }

    setTotalTime(newTotalTime);
    setTimeout(() => setFeedback(""), 1200);

    const nextIndex = currentIndex + 1;
    if (nextIndex < words.length) {
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setInput("");
        setStartTime(Date.now());
      }, 800);
    } else {
      finishGame(newScore, newTotalTime, updatedErrors, updatedErrorTypes);
    }
  };

  const finishGame = async (finalScore, finalTotalTime, finalErrors, finalErrorTypes) => {
    const accuracy = (finalScore / words.length) * 100;
    const avgTime = finalTotalTime / words.length;
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    const nextLevel = getNextLevel(level, accuracy, avgTime);

    try {
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId: user._id,
        gameType: "phoneme_popper",
        level,
        accuracy,
        totalQuestions: words.length,
        correctAnswers: finalScore,
        avgResponseTime: avgTime,
        errors: finalErrors,
        errorTypes: finalErrorTypes,
        metrics: { ranTimeSeconds: finalTotalTime / 1000 }
      });

      setFinalStats({
        score: finalScore,
        total: words.length,
        accuracy: accuracy.toFixed(1),
        level,
        nextLevel
      });
      setShowResult(true);
    } catch (err) {
      console.error(err);
      alert("Telemetry transmission failed.");
    }
  };

  const handleNext = () => {
    const nextLvl = finalStats.nextLevel;
    setLevel(nextLvl);
    setWords(getWordsByLevel(nextLvl));
    setCurrentIndex(0);
    setScore(0);
    setTotalTime(0);
    setErrors([]);
    setErrorTypes([]);
    setStartTime(Date.now());
    setInput("");
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className="pp-game-root">
        <div className="pp-bg-grid" />
        <div className="pp-hud pp-result-card">
          <span className="pp-progress">Mission Debrief</span>
          <h1 style={{ fontFamily: 'Syne', marginBottom: '20px' }}>SUCCESS 🚀</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>SCORE</p>
              <h2 style={{ margin: 0 }}>{finalStats.score}/{finalStats.total}</h2>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>ACCURACY</p>
              <h2 style={{ margin: 0 }}>{finalStats.accuracy}%</h2>
            </div>
          </div>
          
          <p style={{ marginBottom: '20px', color: '#a78bfa' }}>
            Current Rank: {finalStats.level.toUpperCase()} <br/>
            {finalStats.nextLevel !== finalStats.level && `Promotion to: ${finalStats.nextLevel.toUpperCase()}`}
          </p>

          <button className="pp-pop-btn" style={{ width: '100%' }} onClick={handleNext}>
            Next Mission ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-game-root">
      <div className="pp-bg-grid" />
      
      {/* Top Status HUD */}
      <div style={{ position: 'absolute', top: '40px', width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>SECTOR</p>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{level.toUpperCase()}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>DATA POINTS</p>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{currentIndex + 1} / {words.length}</p>
        </div>
      </div>

      <div className="pp-word-container">
        <div className="pp-bubble">{currentWord}</div>
      </div>

      <div className="pp-hud">
        <span className="pp-progress">Input Required</span>
        <input
          className="pp-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Transmit phonemes..."
          autoFocus
        />

        <div className="pp-btn-group">
          <button className="pp-pop-btn" onClick={handleSubmit}>
            POPSCAN 💥
          </button>

          <button className={`pp-mic-btn ${listening ? 'listening' : ''}`} onClick={startListening}>
            {listening ? "RECOGNIZING..." : "🎤 VOICE"}
          </button>
        </div>

        <div className={`pp-feedback ${feedback.includes('✅') ? 'pp-correct' : 'pp-wrong'}`}>
          {feedback}
        </div>
      </div>

      {/* Bottom Score */}
      <div style={{ marginTop: '30px', opacity: 0.5, fontSize: '0.9rem' }}>
        Current Score: <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{score}</span>
      </div>
    </div>
  );
}

export default PhonemePopper;