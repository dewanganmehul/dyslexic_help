import { useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

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
    
    // Play sound immediately as it hits blender
    playSynthesizedPhoneme(tile);
    
    setBlenderContents(prev => [...prev, tile]);
    setAvailableTiles(prev => {
      const idx = prev.findIndex(t => t === tile);
      if (idx !== -1) {
        const newArr = [...prev];
        newArr.splice(idx, 1);
        return newArr;
      }
      return prev;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleBlend = () => {
    const blendedWord = blenderContents.join("");
    // Play full word
    playSynthesizedPhoneme(blendedWord, 1.0);
    
    const target = words[level].target;
    if (blendedWord === target) {
      setFeedback("✅ Perfect Blend!");
      setTimeout(() => {
        if (level + 1 >= words.length) {
          endGame();
        } else {
          setLevel(level + 1);
          setBlenderContents([]);
          setFeedback("");
        }
      }, 1500);
    } else {
      setFeedback("❌ Hmm, that doesn't sound right. Dump and try again!");
      setTimeout(() => {
        setAvailableTiles(prev => [...prev, ...blenderContents]);
        setBlenderContents([]);
        setFeedback("");
      }, 2000);
    }
  };

  const endGame = async () => {
    setGameOver(true);
    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "SoundBlender",
        level: "Quest-5",
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
    <div style={{ backgroundColor: "#3a0e28", minHeight: "100vh", color: "white", padding: "20px", textAlign: "center" }}>
      <h1>🌪️ The Sound Blender</h1>
      <p>Drag the letters matching the target word into the blender, then hit BLEND!</p>

      {gameOver ? (
        <div>
          <h2>Master Blender!</h2>
          <button onClick={() => navigate("/dashboard")} style={btnStyle}>Return to Mission Control</button>
        </div>
      ) : words[level] && (
        <div style={{ marginTop: "30px" }}>
          <h2>Target Word: <span style={{ color: "#ffdd00" }}>{words[level].target.toUpperCase()}</span></h2>

          {/* Letter Bank */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "30px 0" }}>
            {availableTiles.map((tile, i) => (
              <div 
                key={i}
                draggable
                onDragStart={(e) => handleDragStart(e, tile)}
                style={{
                  width: "50px", height: "50px", backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "30px", fontWeight: "bold", borderRadius: "8px", cursor: "grab"
                }}
              >
                {tile.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Blender */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              width: "250px", height: "300px", border: "4px solid #fff", borderRadius: "10px 10px 50px 50px",
              margin: "0 auto", position: "relative", backgroundColor: "rgba(255,255,255,0.05)",
              display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "20px", gap: "5px"
            }}
          >
            {/* Contents */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "5px" }}>
              {blenderContents.map((tile, idx) => (
                <div key={idx} style={{ fontSize: "40px", fontWeight: "bold", color: "#4cc9f0" }}>
                  {tile.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "15px" }}>
            <button onClick={handleBlend} style={{...btnStyle, backgroundColor: "#1D9E75"}}>BLEND 🔥</button>
            <button 
              onClick={() => {
                setAvailableTiles(prev => [...prev, ...blenderContents]);
                setBlenderContents([]);
              }} 
              style={{...btnStyle, backgroundColor: "#E24B4A"}}
            >
              DUMP 🗑️
            </button>
          </div>

          <div style={{ marginTop: "20px", fontSize: "20px", color: feedback.includes("❌") ? "#ff4d4d" : "#1D9E75" }}>
            {feedback}
          </div>
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
  cursor: "pointer"
};

export default SoundBlender;
