/*
 * AI Tutor Controller
 * Provides scaffolded, phonics-based hints rather than direct answers
 */

exports.getHint = (req, res) => {
  try {
    const { errorType, context } = req.body;
    let hint = "Let's try that again!";

    switch (errorType) {
      case 'b_d_reversal':
        hint = "Remember, the 'b' has a bat before the ball! Draw a straight line down, then the circle.";
        break;
      case 'p_q_reversal':
        hint = "For 'p', it's a pull down and a push around!";
        break;
      case 'phoneme_blending':
        const word = context || "word";
        hint = `Let's stretch the sounds... ${word.split('').join('-')}.`;
        break;
      case 'vowel_confusion':
        hint = "Listen carefully to the middle sound. Short 'a' says /ae/ like apple, and short 'e' says /eh/ like elephant.";
        break;
      case 'syllable_slice':
        hint = "Clap it out! How many claps do you hear?";
        break;
      case 'ran_delay':
        hint = "Take a breath. What's the very first sound of that picture?";
        break;
      default:
        hint = "You're getting closer! Focus on the first sound.";
    }

    res.status(200).json({ success: true, hint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Tutor offline" });
  }
};
