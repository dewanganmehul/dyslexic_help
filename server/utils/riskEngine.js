/* 
 * Calculates Risk Level based on session data
 */
exports.calculateRiskLevel = (accuracy, avgResponseTime, metrics) => {
  let riskScore = 0;

  // 1. Accuracy Check
  if (accuracy < 60) {
    riskScore += 3;
  } else if (accuracy < 85) {
    riskScore += 1;
  }

  // 2. Response Time Check
  if (avgResponseTime > 3000) {
    riskScore += 2;
  } else if (avgResponseTime > 2000) {
    riskScore += 1;
  }

  // 3. Granular Metrics Check (if available)
  if (metrics) {
    if (metrics.letterReversals > 5) riskScore += 3; // strong indicator
    else if (metrics.letterReversals > 2) riskScore += 1;

    if (metrics.phonologicalLoopCapacity && metrics.phonologicalLoopCapacity < 3) riskScore += 2;
    
    if (metrics.phonemicSubstitutions && metrics.phonemicSubstitutions.length > 3) riskScore += 2;
  }

  // Calculate final category
  if (riskScore >= 5) return "High";
  if (riskScore >= 2) return "Moderate";
  return "Low";
};
