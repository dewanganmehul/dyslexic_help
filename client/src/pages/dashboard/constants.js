export const RISK_CONFIG = {
  Low: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    label: "Optimal Level",
    icon: "✦",
    desc: "Pilot is performing at peak efficiency.",
  },
  Moderate: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    label: "Observation Required",
    icon: "◈",
    desc: "Minor pattern variations detected.",
  },
  High: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    label: "Critical Attention",
    icon: "▲",
    desc: "Significant literacy friction detected.",
  },
};

export const ERROR_LABELS = {
  b_d_reversal: "b/d Reversals",
  p_q_reversal: "p/q Reversals",
  vowel_confusion: "Vowel Confusion",
  phoneme_blending: "Phoneme Blending",
  syllable_slice: "Syllable Slicing",
  ran_delay: "RAM Delay",
};