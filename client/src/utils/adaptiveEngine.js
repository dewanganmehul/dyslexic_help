export function getNextLevel(currentLevel, accuracy, avgTime) {
  // Upgrade difficulty
  if (accuracy > 80 && avgTime < 2000) {
    if (currentLevel === "easy") return "medium";
    if (currentLevel === "medium") return "hard";
  }

  // Downgrade difficulty
  if (accuracy < 50 || avgTime > 4000) {
    if (currentLevel === "hard") return "medium";
    if (currentLevel === "medium") return "easy";
  }

  return currentLevel;
}

export function getWordsByLevel(level) {
  const wordSets = {
    easy: ["cat", "bat", "rat", "map"],
    medium: ["ship", "frog", "clap", "brush"],
    hard: ["planet", "string", "school", "strong"]
  };

  return wordSets[level];
}