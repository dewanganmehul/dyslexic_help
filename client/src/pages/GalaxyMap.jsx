import { useNavigate } from "react-router-dom";
import { planets } from "../data/planets";

function GalaxyMap() {
  const navigate = useNavigate();
  const lastScore = parseInt(localStorage.getItem("lastScore"), 10) || 0;

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#0b0d17", // Space dark
    minHeight: "100vh",
    color: "white"
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ width: "100%", textAlign: "center" }}>🌌 Galaxy Map</h1>

      {planets.map((planet) => {
        const isUnlocked = lastScore >= planet.unlockScore;

        return (
          <div
            key={planet.id}
            style={{
              width: "250px",
              padding: "20px",
              border: `2px solid ${isUnlocked ? "#4cc9f0" : "#444"}`,
              borderRadius: "15px",
              textAlign: "center",
              opacity: isUnlocked ? 1 : 0.6,
              background: "rgba(255, 255, 255, 0.05)",
              transition: "transform 0.2s"
            }}
          >
            <h2>{isUnlocked ? "🪐" : "🔒"} {planet.name}</h2>
            <p>Required Score: {planet.unlockScore}</p>

            <button
              disabled={!isUnlocked}
              onClick={() => navigate(`/game/${planet.level}`)}
              style={{
                cursor: isUnlocked ? "pointer" : "not-allowed",
                padding: "10px 20px",
                borderRadius: "5px",
                backgroundColor: isUnlocked ? "#4cc9f0" : "#222",
                color: "black",
                fontWeight: "bold",
                border: "none"
              }}
            >
              {isUnlocked ? "Start Mission 🚀" : `Reach ${planet.unlockScore}`}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default GalaxyMap;