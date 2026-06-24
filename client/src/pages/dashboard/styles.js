export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&family=Space+Grotesk:wght@500;600&display=swap');

/* ================= ROOT ================= */
.dashboard-root {
  min-height: 100vh;
  background: #0a0614;
  font-family: 'DM Sans', sans-serif;
  color: #e2e8f0;
  position: relative;
  overflow-x: hidden;
}

/* ================= BACKGROUND ================= */
.dc-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(124,58,237,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,.05) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: 0;
}

.dc-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  opacity: .12;
  pointer-events: none;
  z-index: 0;
}

.dc-orb-1 {
  width: 500px;
  height: 500px;
  background: #7c3aed;
  top: -100px;
  right: -100px;
}

.dc-orb-2 {
  width: 400px;
  height: 400px;
  background: #0ea5e9;
  bottom: -100px;
  left: -100px;
}

/* ================= ANIMATIONS ================= */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-up {
  animation: fadeUp 0.6s ease forwards;
}

.fade-up-1 { animation-delay: 0.1s; opacity: 0; }
.fade-up-2 { animation-delay: 0.2s; opacity: 0; }
.fade-up-3 { animation-delay: 0.3s; opacity: 0; }
.fade-up-4 { animation-delay: 0.4s; opacity: 0; }

/* ================= LOADER ================= */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(124,58,237,0.1);
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: auto;
}

/* ================= BUTTONS ================= */
.chart-tab {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.chart-tab:hover {
  background: rgba(124,58,237,0.15);
  color: #fff;
}

.chart-tab.active {
  background: rgba(124,58,237,0.25);
  border-color: rgba(124,58,237,0.5);
  color: #fff;
}

/* ================= CARDS ================= */
.dc-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 28px;
  backdrop-filter: blur(12px);
}

/* ================= STAT CARD ================= */
.dc-stat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.dc-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(124,58,237,0.2);
}

.dc-stat-label {
  color: rgba(255,255,255,0.4);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.dc-stat-value {
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
}

.dc-stat-sub {
  color: rgba(255,255,255,0.3);
  font-size: 12px;
}

/* ================= INSIGHT ================= */
.dc-pill {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid;
  font-size: 13px;
  line-height: 1.5;
}

.dc-pill.insight {
  background: rgba(124,58,237,0.08);
  border-color: rgba(124,58,237,0.2);
}

.dc-pill.rec {
  background: rgba(16,185,129,0.08);
  border-color: rgba(16,185,129,0.2);
}

/* ================= STARS ================= */
.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  opacity: var(--o);
  animation: twinkle var(--d) infinite ease-in-out var(--delay);
}

@keyframes twinkle {
  0%, 100% {
    opacity: var(--o);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* ================= SHIMMER ================= */
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.shimmer-bg {
  animation: shimmer 1.5s infinite linear;
  background: linear-gradient(
    to right,
    rgba(255,255,255,0.02) 4%,
    rgba(255,255,255,0.05) 25%,
    rgba(255,255,255,0.02) 36%
  );
  background-size: 800px 100%;
  border-radius: 12px;
}
`;