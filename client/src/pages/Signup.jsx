import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Clean way to handle multiple inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/signup", formData);
      // Optional: You could auto-login the user here by getting a token back
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Mission aborted: Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "12px",
    width: "300px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    marginBottom: "15px",
    display: "block"
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px", color: "white" }}>
      <h1>👨‍🚀 Create Pilot Profile</h1>
      <p style={{ color: "#cbd5e0" }}>Join the DyslexiCore fleet.</p>

      <form 
        onSubmit={handleSignup} 
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {error && <p style={{ color: "#ff4d4d" }}>{error}</p>}

        <input
          name="name"
          placeholder="Full Name"
          required
          style={inputStyle}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          required
          style={inputStyle}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Create Password"
          required
          style={inputStyle}
          onChange={handleChange}
        />

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: "12px 40px",
            borderRadius: "8px",
            backgroundColor: loading ? "#444" : "#4cc9f0",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            border: "none",
            marginTop: "10px"
          }}
        >
          {loading ? "Registering..." : "Launch Career 🚀"}
        </button>
      </form>
      
      <p style={{ marginTop: "20px", fontSize: "0.9rem" }}>
        Already have an account? <span 
          onClick={() => navigate("/login")} 
          style={{ color: "#4cc9f0", cursor: "pointer", textDecoration: "underline" }}
        >
          Login here
        </span>
      </p>
    </div>
  );
}

export default Signup;