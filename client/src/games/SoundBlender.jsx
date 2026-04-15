import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./styles/SoundBlender.css";

const words = [
  { target: "cat", phonemes: ["c", "a", "t"] },
  { target: "dog", phonemes: ["d", "o", "g"] }
];

function SoundBlender() {
  const [level, setLevel] = useState(0);
  const [blenderContents, setBlenderContents] = useState([]);
  const [availableTiles, setAvailableTiles] = useState(["c", "a", "t", "d", "o", "g"]);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isBlending, setIsBlending] = useState(false);
  
  const navigate = useNavigate();

  const playSynthesizedPhoneme = (text, rate = 0.8) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = rate;
    window.speechSynthesis.speak(speech);
  };

  const handleDragStart = (e, tile) => {
    e.dataTransfer.setData("text/plain", tile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const tile = e.dataTransfer.getData("text/plain");
    playSynthesizedPhoneme(tile);
    setBlenderContents(prev => [...prev, tile]);
    setAvailableTiles(prev => {
      const idx = prev.indexOf(tile);
      if (idx !== -1) {
        const newArr = [...prev];
        newArr.splice(idx, 1);
        return newArr;
      }
      return prev;
    });
  };

  const handleBlend = () => {
    if (blenderContents.length === 0) return;
    
    setIsBlending(true);
    const blendedWord = blenderContents.join("");
    playSynthesizedPhoneme(blendedWord, 0.6); // Slow merge sound

    setTimeout(() => {
      setIsBlending(false);
      const target = words[level].target;
      if (blendedWord === target) {
        setFeedback("STABILIZED ✅");
        setTimeout(() => {
          if (level + 1 >= words.length) {
            endGame();
          } else {
            setLevel(level + 1);
            setBlenderContents([]);
            setFeedback("");
          }
        }, 1200);
      } else {
        setFeedback("CRITICAL FAILURE ❌");
        setTimeout(() => {
          setAvailableTiles(prev => [...prev, ...blenderContents]);
          setBlenderContents([]);
          setFeedback("");
        }, 1500);
      }
    }, 2000);
  };

  const endGame = async () => {
    setGameOver(true);
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "SoundBlender",
        level: "Linguistic-Fusion-5",
        accuracy: 100,
        totalQuestions: words.length,
        correctAnswers: words.length,
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="sb-root">
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "Syne", fontSize: "2.5rem", margin: 0 }}>PARTICLE BLENDER</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "2px", fontSize: "0.8rem" }}>
          PHONETIC ATOM FUSION SYSTEM
        </p>
      </header>

      {gameOver ? (
        <div className="sb-hud">
          <h2>FUSION COMPLETE</h2>
          <button onClick={() => navigate("/dashboard")} className="sb-btn-blend" style={{ width: "100%" }}>
            RETURN TO COMMAND
          </button>
        </div>
      ) : (
        <div className="sb-hud">
          <p style={{ fontSize: "0.7rem", color: "#7c3aed", fontWeight: "bold", letterSpacing: "1px" }}>
            TARGET MOLECULE: {words[level].target.toUpperCase()}
          </p>

          <div className="sb-tile-bank">
            {availableTiles.map((tile, i) => (
              <div 
                key={i} 
                draggable 
                onDragStart={(e) => handleDragStart(e, tile)} 
                className="sb-tile"
              >
                {tile.toUpperCase()}
              </div>
            ))}
          </div>

          <div 
            className={`sb-vortex-container ${isBlending ? 'sb-vortex-active' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
              {blenderContents.map((tile, idx) => (
                <div key={idx} className="sb-particle">
                  {tile.toUpperCase()}
                </div>
              ))}
            </div>
            {blenderContents.length === 0 && !isBlending && (
              <div style={{ color: "rgba(255,255,255,0.1)", fontSize: "0.8rem" }}>
                DROP PHONEMES HERE
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
            <button onClick={handleBlend} className="sb-btn-blend">
              {isBlending ? "FUSING..." : "INITIATE BLEND"}
            </button>
            <button 
              onClick={() => {
                setAvailableTiles(prev => [...prev, ...blenderContents]);
                setBlenderContents([]);
              }}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "14px", padding: "0 20px", cursor: "pointer" }}
            >
              DUMP
            </button>
          </div>

          <div style={{ marginTop: "25px", height: "20px", fontWeight: "bold", color: feedback.includes("❌") ? "#ef4444" : "#10b981" }}>
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}

export default SoundBlender;