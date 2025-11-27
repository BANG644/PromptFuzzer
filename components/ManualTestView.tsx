import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle, ShieldCheck, Save, Trash2 } from 'lucide-react';
import { ChatMessage, RiskLevel, TestResult, AttackType, DefenseStrategy, Language, APIConfig } from '../types';
import { translations } from '../translations';
import { queryMockTarget, evaluateResult } from '../services/geminiService';

interface Props {
  systemPrompt: string;
  defenseStrategy: DefenseStrategy;
  onSaveReport: (result: TestResult) => void;
  apiConfig: APIConfig;
  lang: Language;
}

const ManualTestView: React.FC<Props> = ({ systemPrompt, defenseStrategy, onSaveReport, apiConfig, lang }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>(RiskLevel.SAFE);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setLoading(true);

    const newHistory = [...messages, { role: 'user', text: userText }];
    setMessages(newHistory);

    try {
      const apiHistory = newHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Use selected defense strategy and API config
      const response = await queryMockTarget(userText, apiHistory.slice(0, -1), systemPrompt, defenseStrategy, apiConfig);

      const evalResult = await evaluateResult(userText, response, AttackType.MANUAL, lang, apiConfig);

      setCurrentRisk(evalResult.riskLevel as RiskLevel);

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: response,
          risk: evalResult.riskLevel as RiskLevel
        }
      ]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Failed to get response." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (messages.length === 0) return;

    const riskPriority = [RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW, RiskLevel.SAFE];
    let overallRisk = RiskLevel.SAFE;

    for (const r of riskPriority) {
      if (messages.some(m => m.risk === r)) {
        overallRisk = r;
        break;
      }
    }

    const isSuccess = overallRisk !== RiskLevel.SAFE && overallRisk !== RiskLevel.LOW;

    const report: TestResult = {
      id: `manual-${Date.now()}`,
      templateId: 'manual-session',
      attackType: AttackType.MANUAL,
      promptUsed: "Manual Session",
      response: "Manual Session Log",
      history: messages,
      success: isSuccess,
      riskLevel: overallRisk,
      evidence: isSuccess ? "Vulnerabilities detected." : "No significant vulnerabilities.",
      remediation: "Review conversation history.",
      timestamp: Date.now()
    };

    onSaveReport(report);
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentRisk(RiskLevel.SAFE);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" /> {t.manualTitle}
          </h3>
          <p className="text-xs text-slate-500">{t.manualDesc}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1
             ${currentRisk === RiskLevel.SAFE ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}
           `}>
            {currentRisk === RiskLevel.SAFE ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {t.currentStatus}: {currentRisk}
          </div>
          <button onClick={clearChat} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title={t.clearChat}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-950/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Bot className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm">{t.inputPlaceholder}</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 text-sm shadow-sm ${msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}>
              <div className="text-[10px] opacity-70 mb-1 uppercase flex justify-between">
                <span>{msg.role}</span>
                {msg.risk && msg.risk !== RiskLevel.SAFE && (
                  <span className="text-rose-500 font-bold ml-2">⚠️ {msg.risk}</span>
                )}
              </div>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm border border-slate-200 dark:border-slate-700 flex gap-2">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t.inputPlaceholder}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
        <button
          onClick={handleFinish}
          disabled={messages.length === 0 || loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-bold"
        >
          <Save className="w-4 h-4" /> {t.genReport}
        </button>
      </div>
    </div>
  );
};

export default ManualTestView;