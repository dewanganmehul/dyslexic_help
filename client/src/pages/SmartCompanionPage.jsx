import React, { useState } from 'react';
import './SmartCompanionPage.css';

const SmartCompanionPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Smart Companion. How can I help you understand your child\'s progress better today?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [reportAnalysis, setReportAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Chat handling
  const handleSendChat = async () => {
    if (!inputVal.trim()) return;

    const userMessage = { role: 'user', content: inputVal };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputVal('');
    setIsTyping(true);

    try {
      // In production, adjust BASE_URL and use environment variables
      const res = await fetch('http://localhost:5000/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Oops, I am having trouble connecting right now.' }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error connecting to the server.' }]);
    }
    setIsTyping(false);
  };

  // Report Handling
  const handleAnalyzeReport = async () => {
    setIsAnalyzing(true);
    setReportAnalysis('');
    
    // Sample report as given in prompt
    const sampleReport = {
      child_age: 7,
      games: [
        { name: "Reaction Speed", score: 42, avg_time_ms: 950, benchmark: 600 },
        { name: "Letter Recognition", accuracy: 62, benchmark: 85 },
        { name: "Memory Sequence", score: 5, benchmark: 8 }
      ],
      overall_flags: ["slow_processing", "low_accuracy"],
      history: { trend: "declining" }
    };

    try {
      const res = await fetch('http://localhost:5000/api/companion/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleReport)
      });
      const data = await res.json();
      if (data.success) {
        setReportAnalysis(data.analysis);
      } else {
        setReportAnalysis('Failed to analyze the report.');
      }
    } catch (error) {
      setReportAnalysis('Error connecting to the server.');
    }
    setIsAnalyzing(false);
  };

  // Simple Markdown structure formatter for rendering
  const renderMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('###')) return <h3 key={idx} className="analysis-heading">{line.replace('###', '').trim()}</h3>;
      if (line.startsWith('-')) return <li key={idx} className="analysis-list-item">{line.replace('-', '').trim()}</li>;
      if (line.trim() === '') return <br key={idx} />;
      return <p key={idx} className="analysis-text">{line}</p>;
    });
  };

  return (
    <div className="smart-companion-page">
      <header className="companion-header glass-panel">
        <h1>🤖 Smart Companion</h1>
        <p>Your supportive guide to understanding your child's progress.</p>
        <div className="companion-tabs">
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat with Companion
          </button>
          <button 
            className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            Analyze Report
          </button>
        </div>
      </header>

      <main className="companion-main">
        {activeTab === 'chat' && (
          <div className="chat-container glass-panel">
            <div className="chat-history">
              {messages.map((m, i) => (
                <div key={i} className={`chat-message ${m.role}`}>
                  <div className="chat-bubble">
                    {renderMarkdown(m.content)}
                  </div>
                </div>
              ))}
              {isTyping && <div className="chat-message assistant"><div className="chat-bubble typing">Typing...</div></div>}
            </div>
            <div className="chat-input-area">
              <input 
                type="text" 
                placeholder="Ask me anything about your child's progress..." 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button 
                onClick={handleSendChat}
                disabled={isTyping}
                className="btn-primary"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="report-container glass-panel">
            <h2>Current Performance Report Insight</h2>
            <p className="report-desc">
              Generate an empathetic and non-clinical insight based on your child's latest DyslexiCore data.
            </p>
            {!reportAnalysis && (
              <button 
                className="btn-primary" 
                onClick={handleAnalyzeReport}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Sample Report'}
              </button>
            )}

            {reportAnalysis && (
              <div className="analysis-box fade-in">
                {renderMarkdown(reportAnalysis)}
                <button 
                  className="btn-secondary mt-4" 
                  onClick={() => setReportAnalysis('')}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SmartCompanionPage;
