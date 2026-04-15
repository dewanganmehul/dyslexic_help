import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { analyzeError } from "../utils/errorAnalysis";
import { getNextLevel, getWordsByLevel } from "../utils/adaptiveEngine";
import "./PhonemePopper.css";
import { BASE_URL } from "../config/config";

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

  // 🆕 RESULT SCREEN STATE
  const [showResult, setShowResult] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const currentWord = words[currentIndex];

  // 🎤 VOICE INPUT
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
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

    recognitionRef.current = recognition;
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    let newScore = score;

    const responseTime = Date.now() - startTime;
    const newTotalTime = totalTime + responseTime;

    let updatedErrors = [...errors];
    let updatedErrorTypes = [...errorTypes];

    if (input.toLowerCase() === currentWord) {
      newScore++;
      setScore(newScore);
      setFeedback("✅ Correct!");
    } else {
      const errorType = analyzeError(input, currentWord);

      updatedErrors.push(`${input} → ${currentWord}`);
      updatedErrorTypes.push(errorType);

      setErrors(updatedErrors);
      setErrorTypes(updatedErrorTypes);

      setFeedback(`❌ ${errorType}`);
    }

    setTotalTime(newTotalTime);
    setTimeout(() => setFeedback(""), 800);

    const nextIndex = currentIndex + 1;

    if (nextIndex < words.length) {
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setInput("");
        setStartTime(Date.now());
      }, 800);
    } else {
      // 🎯 FINAL CALCULATION
      const accuracy = (newScore / words.length) * 100;
      const avgTime = newTotalTime / words.length;

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Please login first");
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
          correctAnswers: newScore,
          avgResponseTime: avgTime,
          errors: updatedErrors,
          errorTypes: updatedErrorTypes,
          metrics: { ranTimeSeconds: newTotalTime / 1000 }
        });

        // 🧠 STORE RESULT FOR UI
        setFinalStats({
          score: newScore,
          total: words.length,
          accuracy: accuracy.toFixed(1),
          level,
          nextLevel
        });

        setShowResult(true);

      } catch (err) {
        console.error(err);
        alert("Error saving session");
      }
    }
  };

  // 🔄 RESET GAME AFTER RESULT
  const handleNext = () => {
    const nextLevel = finalStats.nextLevel;

    setLevel(nextLevel);
    setWords(getWordsByLevel(nextLevel));

    setCurrentIndex(0);
    setScore(0);
    setTotalTime(0);
    setErrors([]);
    setErrorTypes([]);
    setStartTime(Date.now());
    setInput("");

    setShowResult(false);
  };

  // 🏁 RESULT SCREEN
  if (showResult) {
    return (
      <div className="game-container">
        <div className="glass-panel pulse-glow">
          <h1 style={{ marginBottom: "1rem" }}>🎉 Mission Complete!</h1>
          <h2 style={{ marginBottom: "0.5rem" }}>Score: {finalStats.score}/{finalStats.total}</h2>
          <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Accuracy: {finalStats.accuracy}%</h3>
          <h3 style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Level Played: {finalStats.level.toUpperCase()}</h3>

          {finalStats.nextLevel !== finalStats.level && (
            <h2 style={{ color: "var(--accent-cyan)", marginBottom: "1rem" }}>🚀 Level Up: {finalStats.nextLevel.toUpperCase()}</h2>
          )}

          <button className="neon-btn" onClick={handleNext}>
            Continue 🚀
          </button>
        </div>
      </div>
    );
  }

  // 🎮 GAME SCREEN
  return (
    <div className="game-container">
      <h1 className="title" style={{ marginBottom: "0.5rem" }}>🚀 Phoneme Popper</h1>
      <h2 style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Level: {level.toUpperCase()}</h2>

      <div style={{ fontSize: "3rem", margin: "2rem 0", color: "var(--accent-cyan)" }}>{currentWord}</div>

      <input
        className="premium-input"
        style={{ maxWidth: "300px", marginBottom: "1rem" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type OR Speak..."
      />

      <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginBottom: "2rem" }}>
        <button className="neon-btn" onClick={handleSubmit}>
          Pop Bubble 💥
        </button>

        <button className="ghost-btn" onClick={startListening}>
          🎤 {listening ? "Listening..." : "Speak"}
        </button>
      </div>

      <h3 style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "1rem" }}>Score: {score}</h3>

      {feedback && <div style={{ marginTop: "1rem", color: feedback.includes("❌") ? "var(--error)" : "var(--success)" }}>{feedback}</div>}
    </div>
  );
}

export default PhonemePopper;