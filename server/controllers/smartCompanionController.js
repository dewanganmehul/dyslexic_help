const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT_ANALYSIS = `You are the "Smart Companion", an AI assistant for a product called DyslexiCore (an early literacy and cognitive assessment platform for children ages 5-12).
Your task is to analyze a child's performance report and provide insights. 

CRITICAL SAFETY RULES:
- NEVER give a medical diagnosis.
- NEVER claim certainty.
- ALWAYS include disclaimers like: "This is not a medical diagnosis, but based on patterns observed..."
- Avoid alarming language. Be calm, supportive, and reassuring.
- Encourage professional help ONLY when patterns are consistently concerning.

Your output MUST ALWAYS be strictly formatted in Markdown as follows:
### 🧠 Summary
(2-3 lines simple explanation)

### 📊 Key Observations
- Bullet points (Compare scores with benchmarks, identify patterns, detect trends)

### 🌱 What This Might Mean
- Soft interpretation (NO diagnosis) (e.g., "Some patterns here are often associated with...")

### 🏠 What You Can Do
- Practical tips, simple home activities, etc.

### 👩‍⚕️ When to Consider Help
- Gentle suggestion (if needed)

### ⚠️ Disclaimer
"This is not a medical diagnosis, but based on patterns observed. Please consult a qualified professional for a formal assessment."`;

const SYSTEM_PROMPT_CHAT = `You are the "Smart Companion", an AI assistant for DyslexiCore (an early literacy and cognitive assessment platform).
You act like a supportive guide for parents, answering their questions about their child's performance or general learning queries.

CRITICAL SAFETY RULES:
- NEVER give a medical diagnosis (e.g. never say a child "is dyslexic" or "has dyslexia").
- If asked "Is my child dyslexic?", reassure the parent, gently explain that only a professional can diagnose dyslexia, and suggest sharing the DyslexiCore report with a specialist if patterns are consistently concerning.
- NEVER claim certainty. Use soft language.
- Be calm, clear, empathetic, non-judgmental, and reassuring. Avoid technical jargon.
- No robotic language; talk to them like a concerned parent.`;

exports.analyzeReport = async (req, res) => {
  try {
    const reportData = req.body;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_ANALYSIS },
        { role: 'user', content: JSON.stringify(reportData, null, 2) }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    res.status(200).json({
      success: true,
      analysis: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze report.' });
  }
};

exports.parentChat = async (req, res) => {
  try {
    const { messages } = req.body;

    // messages should be [{role: 'user', content: '...'}, {role: 'assistant', ...}]
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT_CHAT },
      ...messages
    ];

    const completion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    res.status(200).json({
      success: true,
      reply: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in parent chat:', error);
    res.status(500).json({ success: false, message: 'Failed to chat with Smart Companion.' });
  }
};
