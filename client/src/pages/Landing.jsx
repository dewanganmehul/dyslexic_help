import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  // Shared button style to keep things DRY
  const btnStyle = {
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.3s",
  };

  return (
    <div style={{
      height: "100vh",
      background: "radial-gradient(circle at top, #1a1f4d, #000)", // Slightly lighter blue for depth
      color: "white",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "3.5rem", marginBottom: "10px", letterSpacing: "-1px" }}>
        🚀 DyslexiCore
      </h1>

      <p style={{ 
        maxWidth: "500px", 
        fontSize: "1.2rem", 
        lineHeight: "1.6", 
        color: "#cbd5e0" // Softer white for easier reading
      }}>
        A gamified literacy engine that detects reading difficulties
        in minutes using interactive space missions.
      </p>

      <div style={{ 
        marginTop: "40px", 
        display: "flex", 
        gap: "15px" // Replaced marginLeft with gap
      }}>
        <button 
          onClick={() => navigate("/signup")}
          style={{ ...btnStyle, backgroundColor: "#4cc9f0", color: "#000" }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#45b8db"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#4cc9f0"}
        >
          Get Started
        </button>

        <button 
          onClick={() => navigate("/login")}
          style={{ ...btnStyle, backgroundColor: "transparent", color: "white", border: "2px solid white" }}
        >
          Login
        </button>
      </div>
      
      {/* Optional: Simple credit or version tag */}
      <footer style={{ position: "absolute", bottom: "20px", fontSize: "0.8rem", opacity: 0.5 }}>
        Mission Control v1.0.4
      </footer>
    </div>
  );
}

export default Landing;