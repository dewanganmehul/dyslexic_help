export function analyzeError(input, correct) {
  input = input.toLowerCase();
  correct = correct.toLowerCase();

  // Case 1: Length mismatch
  if (input.length < correct.length) {
    return "Missing letters";
  }

  if (input.length > correct.length) {
    return "Extra letters";
  }

  let vowelMistake = false;
  let letterSwap = false;
  let generalMistake = false;

  const vowels = ["a", "e", "i", "o", "u"];

  for (let i = 0; i < correct.length; i++) {
    if (input[i] !== correct[i]) {
      if (vowels.includes(correct[i]) && vowels.includes(input[i])) {
        vowelMistake = true;
      }
      else if (
        (input[i] === "b" && correct[i] === "d") ||
        (input[i] === "d" && correct[i] === "b") ||
        (input[i] === "p" && correct[i] === "q") ||
        (input[i] === "q" && correct[i] === "p")
      ) {
        letterSwap = true;
      }
      else {
        generalMistake = true;
      }
    }
  }

  if (letterSwap) return "Letter confusion (b/d or p/q)";
  if (vowelMistake) return "Vowel confusion";
  if (generalMistake) return "Phoneme mistake";

  return "Unknown error";
}