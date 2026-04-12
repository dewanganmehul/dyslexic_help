import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";

// Mapping icons/animals to Web Audio synthesis directly for portability
const sounds = [
  { id: 1, icon: "🐶", freq: 300, name: "Dog" },
  { id: 2, icon: "🐱", freq: 600, name: "Cat" },
  { id: 3, icon: "🐸", freq: 200, name: "Frog" },
  { id: 4, icon: "🐦", freq: 1000, name: "Bird" }
];

function EchoWoods() {
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isListening, setIsListening] = useState(true); // User is listening to sequence
  const [gameOver, setGameOver] = useState(false);
  const audioCtxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Needs user interaction to start AudioContext usually, but we'll init here and resume on click
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const playTone = (freq) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const startNextRound = () => {
    console.log("Starting next round. Sequence len:", sequence.length);
    const nextSound = sounds[Math.floor(Math.random() * sounds.length)];
    const newSeq = [...sequence, nextSound];
    setSequence(newSeq);
    setPlayerStep(0);
    setIsListening(true);
    
    playSequence(newSeq);
  };

  const playSequence = (seq) => {
    let delay = 1000;
    seq.forEach((item, index) => {
      setTimeout(() => {
        playTone(item.freq);
        if (index === seq.length - 1) {
          setTimeout(() => setIsListening(false), 500);
        }
      }, delay);
      delay += 800;
    });
  };

  const handleEntityClick = (entity) => {
    if (isListening || gameOver) return;

    playTone(entity.freq);

    if (entity.id === sequence[playerStep].id) {
      if (playerStep + 1 === sequence.length) {
        // Complete the round, go to next
        setIsListening(true);
        setTimeout(startNextRound, 1000);
      } else {
        setPlayerStep(playerStep + 1);
      }
    } else {
      // Wrong move, game over
      handleGameOver();
    }
  };

  const handleGameOver = async () => {
    setGameOver(true);
    const capacity = sequence.length - 1;

    try {
      const userId = localStorage.getItem("userId") || "demoUser";
      await axios.post(`${BASE_URL}/api/sessions/submit`, {
        userId,
        gameType: "EchoWoods",
        level: "Lab-2",
        accuracy: capacity > 3 ? 100 : capacity > 1 ? 50 : 0, 
        totalQuestions: sequence.length,
        correctAnswers: capacity,
        avgResponseTime: 0,
        metrics: {
          phonologicalLoopCapacity: capacity
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ backgroundColor: "#1e3a29", minHeight: "100vh", color: "white", padding: "20px", textAlign: "center" }}>
      <h1>🌲 Echo Woods</h1>
      <p>Listen to the sounds of the woods. Repeat the pattern exactly!</p>
      
      {sequence.length === 0 && !gameOver && (
        <button onClick={startNextRound} style={btnStyle}>Enter the Woods 🎧</button>
      )}

      {gameOver && (
        <div>
          <h2>Night has fallen in the woods.</h2>
          <p>Memory Capacity: {sequence.length - 1}</p>
          <button onClick={() => navigate("/dashboard")} style={btnStyle}>Return to Mission Control</button>
        </div>
      )}

      {sequence.length > 0 && !gameOver && (
        <>
          <h3>Level: {sequence.length}</h3>
          <p style={{ color: isListening ? "#ffdd00" : "#4cc9f0" }}>
            {isListening ? "Listen closely..." : "Your turn!"}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "40px" }}>
            {sounds.map(s => (
              <div 
                key={s.id} 
                onClick={() => handleEntityClick(s)}
                style={{ 
                  fontSize: "60px", 
                  cursor: isListening ? "not-allowed" : "pointer",
                  padding: "20px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "15px",
                  transition: "transform 0.1s"
                }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {s.icon}
              </div>
            ))}
          </div>
        </>
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

export default EchoWoods;
