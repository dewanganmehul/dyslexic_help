import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { analyzeError } from "../utils/errorAnalysis";

const words = ["cat", "bat", "rat", "map"];

function PhonemePopper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [errors, setErrors] = useState([]);
  const [errorTypes, setErrorTypes] = useState([]);

  const navigate = useNavigate();

  const currentWord = words[currentIndex];

  const handleSubmit = async () => {
    let newScore = score;

    const responseTime = Date.now() - startTime;
    setTotalTime((prev) => prev + responseTime);

    if (input.toLowerCase() === currentWord) {
      newScore++;
      setScore(newScore);
    } else {
      const errorType = analyzeError(input, currentWord);

      setErrors((prev) => [...prev, `${input} → ${currentWord}`]);
      setErrorTypes((prev) => [...prev, errorType]);
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex < words.length) {
      setCurrentIndex(nextIndex);
      setInput("");
      setStartTime(Date.now());
    } else {
      try {
        await axios.post("http://localhost:5000/api/sessions/submit", {
          userId: "demoUser",
          gameType: "phoneme_popper",
          accuracy: (newScore / words.length) * 100,
          totalQuestions: words.length,
          correctAnswers: newScore,
          avgResponseTime: totalTime / words.length,
          errors: errors,
          errorTypes: errorTypes
        });

        alert("Mission Complete 🚀");
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        alert("Error saving session");
      }
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🫧 Phoneme Popper</h1>

      <h2>{currentWord}</h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type what you read"
      />

      <br /><br />

      <button onClick={handleSubmit}>Submit</button>

      <h3>Score: {score}</h3>
    </div>
  );
}

export default PhonemePopper;