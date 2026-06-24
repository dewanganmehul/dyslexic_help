const Groq = require('groq-sdk');

let groq = null;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } else {
    console.warn("WARNING: GROQ_API_KEY environment variable is missing. AI companion features will fail.");
  }
} catch (err) {
  console.error("Failed to initialize Groq SDK:", err);
}

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

    if (!groq) {
      return res.status(500).json({ success: false, message: 'AI companion is not configured (missing GROQ_API_KEY).' });
    }

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

    if (!groq) {
      return res.status(500).json({ success: false, message: 'AI companion is not configured (missing GROQ_API_KEY).' });
    }

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

const SYSTEM_PROMPT_DASHBOARD = `You are a data analysis AI for DyslexiCore's Mission Control dashboard.
You will receive an array of historical telemetry data for a pilot (child).
Analyze the performance velocity, accuracy trends, and response times.

CRITICAL INSTRUCTIONS:
- You MUST output ONLY valid JSON. No markdown formatting, no code blocks (e.g. \`\`\`json), just the raw JSON object.
- The JSON object must have exactly two keys: "insights" and "recommendations".
- Each key MUST contain exactly an array of 3 string items.
- Focus on patterns across the sessions.
- Keep the language thematic (space/gamified context like "Pilot is...", "Flight speed...", "Target acquisition...", but keep it supportive and safe for parents).
- Avoid medical diagnosis in your text.

Expected JSON schema:
{
  "insights": [ "insight 1 string", "insight 2 string", "insight 3 string" ],
  "recommendations": [ "rec 1 string", "rec 2 string", "rec 3 string" ]
}`;

exports.generateDashboardInsights = async (req, res) => {
  try {
    const { telemetryData } = req.body;

    if (!groq) {
      return res.status(500).json({ success: false, message: 'AI companion is not configured (missing GROQ_API_KEY).' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_DASHBOARD },
        { role: 'user', content: JSON.stringify(telemetryData) }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({
      success: true,
      insights: parsedData.insights.slice(0, 3),
      recommendations: parsedData.recommendations.slice(0, 3)
    });
  } catch (error) {
    console.error('Error in generateDashboardInsights:', error);
    res.status(500).json({ success: false, message: 'Failed to generate dashboard AI insights.' });
  }
};

const SYSTEM_PROMPT_HOMEWORK = `You are an expert reading intervention specialist for DyslexiCore.
A parent has requested offline, real-world "homework" exercises based on a child's recent error heatmap (frequency of specific errors over the past sessions).
Given the data of their most common errors, generate EXACTLY 3 highly creative, fun, analog/printable activities that the parent can do with the child at home to target these specific weaknesses.

CRITICAL INSTRUCTIONS:
- You MUST output ONLY valid JSON.
- The JSON object must have a single key "homework" mapping to an array of 3 string items.
- E.g., if they struggle with b/d reversals, suggest a shaving cream drawing activity. If they struggle with phonemic blending, suggest a jumping/clapping game.
- Keep descriptions clear, concise, and easy for a parent to read on a printed PDF.

Expected JSON schema:
{
  "homework": [ "Activity 1 description", "Activity 2 description", "Activity 3 description" ]
}`;

exports.generateHomework = async (req, res) => {
  try {
    const { errorMap } = req.body; // e.g. { "b_d_reversal": 5, "vowel_confusion": 2 }

    if (!groq) {
      return res.status(500).json({ success: false, message: 'AI companion is not configured (missing GROQ_API_KEY).' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_HOMEWORK },
        { role: 'user', content: JSON.stringify(errorMap) }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({
      success: true,
      tasks: parsedData.homework.slice(0, 3)
    });
  } catch (error) {
    console.error('Error in generateHomework:', error);
    res.status(500).json({ success: false, message: 'Failed to generate custom homework.' });
  }
};
