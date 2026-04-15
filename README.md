# 🚀 DyslexiCore: Early Literacy & Diagnostic Ecosystem

**DyslexiCore** is a full-stack literacy engine designed to identify and bridge reading gaps in neurodivergent children. By transforming clinical dyslexia screening into a "Space Mission," we remove the anxiety of assessment and provide parents with immediate, data-driven insights.

---

## 🌟 The Vision
Traditional dyslexia screening is expensive and slow. **DyslexiCore** shifts the paradigm from "Wait to Fail" to **"Play to Succeed."** Our platform captures micro-interactions—like naming speed and visual tracking—to build a comprehensive risk profile in minutes, not months.

---

## 🕹️ Core Features

### **1. Gamified Diagnostics**
* **⭐ Star Tracker:** A high-speed mission designed to measure **visual saccades** and tracking focus.
* **🫧 Phoneme Popper:** An interactive bubble-popping game that assesses **phonological decoding** and naming speed.

### **2. Intervention Quests**
* **🔡 CVC Word Explorer:** Focused modules (starting with **Short 'A'**) to master Consonant-Vowel-Consonant patterns.
* **⌨️ Typing Quest:** A multi-sensory tool that connects tactile typing with phonetic sounds.

### **3. Mission Control (Dashboard)**
* Real-time analytics hub powered by a persistent database.
* Calculates **Risk Levels (Low, Moderate, High)** based on game performance.

### **4. Smart Companion**
* An **AI-powered tutor** providing phonics-based hints and constant positive reinforcement.

---

## 🛠️ Tech Stack

| Component      | Technology |
| :---           | :--- |
| **Frontend** | **Next.js 14**, React, TypeScript, Tailwind CSS |
| **Backend** | **FastAPI** (Python) |
| **Database** | **SQLite** with SQLAlchemy ORM |
| **Auth** | **JWT** (JSON Web Tokens) & SHA-256 Hashing |
| **AI** | LLM Integration for Smart Tutoring |

---

## 💻 Installation & Setup

### **1. Backend Setup**
Open your terminal and run:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Use `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
### **2. Frontend Setup**
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
Navigate to **http://localhost:3000** to start the mission!

## Future Roadmap
🎤 Vocal Assessment: Integrate Speech-to-Text to track oral reading fluency.

🧩 Advanced Phonics: Expand quests to include Diphthongs and Long Vowel patterns.

🏫 Teacher Portal: Classroom-wide screening tools for educators.

---
## 🛠️ Challenges Overcome
Data Persistence: Syncing real-time game states (Star hits/misses) with a persistent SQLite database via FastAPI.
Accessible UI: Designing high-contrast, low-anxiety interfaces specifically for children with visual processing difficulties.


---

© 2025 DyslexiCore | Built for the Hackathon


