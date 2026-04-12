import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config/config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents page reload
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("userId", res.data.user._id);

      // Use navigate for a smooth SPA transition
      navigate("/map"); 
    } catch (err) {
      console.log(err)
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "12px",
    width: "300px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem"
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
      <h1>🔐 Pilot Login</h1>
      
      <form onSubmit={handleLogin} style={{ display: "inline-block" }}>
        {error && <p style={{ color: "#ff4d4d", fontWeight: "bold" }}>{error}</p>}
        
        <div style={{ marginBottom: "15px" }}>
          <input
            type="email"
            placeholder="Email Address"
            required
            style={inputStyle}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="password"
            placeholder="Password"
            required
            style={inputStyle}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: "12px 40px",
            borderRadius: "8px",
            backgroundColor: loading ? "#444" : "#4cc9f0",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            border: "none"
          }}
        >
          {loading ? "Authenticating..." : "Enter Cockpit 🚀"}
        </button>
      </form>
    </div>
  );
}

export default Login;