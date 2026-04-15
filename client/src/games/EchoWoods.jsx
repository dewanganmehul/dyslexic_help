import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./styles/EchoWoods.css";

const creatures = [
  { id: 1, icon: "🐶", freq: 300, color: "#ff8b3d" },
  { id: 2, icon: "🐱", freq: 600, color: "#3dbdff" },
  { id: 3, icon: "🐸", freq: 200, color: "#3dff8b" },
  { id: 4, icon: "🐦", freq: 1000, color: "#ff3d8b" }
];

function EchoWoods() {
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isListening, setIsListening] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const audioCtxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const startNextRound = () => {
    const nextSound = creatures[Math.floor(Math.random() * creatures.length)];
    const newSeq = [...sequence, nextSound];
    setSequence(newSeq);
    setPlayerStep(0);
    setIsListening(true);
    
    playSequence(newSeq);
  };

  const playSequence = (seq) => {
    // Difficulty Scaling: Speed up the playback as the sequence gets longer
    let baseDelay = 1000;
    let tempo = Math.max(400, 800 - (seq.length * 40)); 

    seq.forEach((item, index) => {
      setTimeout(() => {
        playTone(item.freq);
        setActiveId(item.id);
        
        // Remove highlight after brief moment
        setTimeout(() => setActiveId(null), tempo / 2);

        if (index === seq.length - 1) {
          setTimeout(() => setIsListening(false), tempo);
        }
      }, baseDelay + (index * tempo));
    });
  };

  const handleEntityClick = (entity) => {
    if (isListening || gameOver) return;

    playTone(entity.freq);
    setActiveId(entity.id);
    setTimeout(() => setActiveId(null), 200);

    if (entity.id === sequence[playerStep].id) {
      if (playerStep + 1 === sequence.length) {
        setIsListening(true);
        setTimeout(startNextRound, 1000);
      } else {
        setPlayerStep(playerStep + 1);
      }
    } else {
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
        level: `Memory-Node-${sequence.length}`,
        accuracy: capacity > 4 ? 100 : capacity > 2 ? 60 : 20, 
        totalQuestions: sequence.length,
        correctAnswers: capacity,
        metrics: { phonologicalLoopCapacity: capacity }
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="ew-root">
      {/* Background Decor */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="ew-spore" style={{
          width: Math.random() * 10 + 5 + 'px',
          height: Math.random() * 10 + 5 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          '--d': Math.random() * 5 + 3 + 's',
          animationDelay: Math.random() * 5 + 's'
        }} />
      ))}

      {!isPlaying && sequence.length === 0 && !gameOver ? (
        <div className="ew-hud">
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌲</div>
          <h1 style={{ fontFamily: 'Syne' }}>ECHO NEBULA</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>
            A neural frequency test. Observe the sequence and repeat the echo.
          </p>
          <button onClick={startNextRound} className="neon-btn">INITIALIZE LINK</button>
        </div>
      ) : gameOver ? (
        <div className="ew-hud">
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌌</div>
          <h2 style={{ fontFamily: 'Syne' }}>ECHO LOST</h2>
          <div style={{ margin: '30px 0' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>MAX CAPACITY</p>
            <h1 className="ew-level-tag">{sequence.length - 1}</h1>
          </div>
          <button onClick={() => navigate("/dashboard")} className="ghost-btn" style={{ width: '100%' }}>
            RETURN TO BASE
          </button>
        </div>
      ) : (
        <div className="ew-hud">
          <div className={`ew-status-pill ${isListening ? 'status-listen' : 'status-play'}`}>
             {isListening ? "📡 Receiving Signal" : "🧠 Echoing Pattern"}
          </div>

          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>NEURAL STRETCH</p>
          <h1 className="ew-level-tag">{sequence.length}</h1>

          <div className="ew-grid">
            {creatures.map(c => (
              <div 
                key={c.id} 
                className={`ew-creature ${activeId === c.id ? 'active' : ''} ${isListening ? 'disabled' : ''}`}
                onClick={() => handleEntityClick(c)}
              >
                {c.icon}
                <div style={{ 
                  position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                  width: '30%', height: '4px', borderRadius: '2px', background: c.color,
                  opacity: activeId === c.id ? 1 : 0.2
                }} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
            {isListening ? "Focus on the frequencies..." : `Repeat step ${playerStep + 1} of ${sequence.length}`}
          </div>
        </div>
      )}
    </div>
  );
}

export default EchoWoods;