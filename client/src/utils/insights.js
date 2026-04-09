export function generateInsights(errorTypes, accuracy, avgTime) {
  const insights = [];
  const recommendations = [];

  const count = {};

  // Count frequency of each error
  errorTypes.forEach((err) => {
    count[err] = (count[err] || 0) + 1;
  });

  // Find most frequent error
  let maxError = null;
  let maxCount = 0;

  for (let key in count) {
    if (count[key] > maxCount) {
      maxCount = count[key];
      maxError = key;
    }
  }

  // Accuracy based insight
  if (accuracy < 50) {
    insights.push("Low decoding accuracy");
    recommendations.push("Start with basic CVC word practice");
  } else if (accuracy < 80) {
    insights.push("Moderate reading performance");
    recommendations.push("Practice phoneme blending daily");
  } else {
    insights.push("Good reading accuracy");
    recommendations.push("Introduce more complex words");
  }

  // Speed insight
  if (avgTime > 3000) {
    insights.push("Slow response time");
    recommendations.push("Practice rapid naming exercises");
  }

  // Error-based insights
  if (maxError) {
    insights.push(`Primary difficulty: ${maxError}`);

    if (maxError === "Vowel confusion") {
      recommendations.push("Focus on short vowel sounds (a, e, i, o, u)");
    }

    if (maxError === "Letter confusion (b/d or p/q)") {
      recommendations.push("Use visual tracing exercises for letter orientation");
    }

    if (maxError === "Missing letters") {
      recommendations.push("Practice letter-by-letter reading");
    }

    if (maxError === "Extra letters") {
      recommendations.push("Improve visual tracking with guided reading");
    }

    if (maxError === "Phoneme mistake") {
      recommendations.push("Work on phoneme segmentation");
    }
  }

  return { insights, recommendations };
}