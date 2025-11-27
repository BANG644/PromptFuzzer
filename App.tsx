import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, LayoutDashboard, PlayCircle, FileText, Bug, User, Github
} from 'lucide-react';
import ConfigPanel from './components/ConfigPanel';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import ManualTestView from './components/ManualTestView';
import {
  AttackType, TestConfig, TestResult, TestStats, RiskLevel,
  AttackTemplate, ChatMessage, DefenseStrategy, Language, APIProvider
} from './types';
import { translations } from './translations';
import { INITIAL_TEMPLATES, MOCK_TARGET_SYSTEM_PROMPT } from './constants';
import { mutateAttack, queryMockTarget, evaluateResult } from './services/geminiService';
import { createDefaultAPIConfig } from './apiConfig';

function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'manual' | 'dashboard' | 'report'>('config');
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Config State
  const [config, setConfig] = useState<TestConfig>(() => {
    const defaultApiConfig = createDefaultAPIConfig(APIProvider.GEMINI);
    // Try to load API key from environment
    const envApiKey = process.env.API_KEY || '';
    if (envApiKey) {
      defaultApiConfig.apiKey = envApiKey;
    }

    return {
      targetName: 'Demo Bank Bot',
      useMutation: false,
      selectedTypes: [AttackType.INJECTION, AttackType.LEAKAGE, AttackType.JAILBREAK, AttackType.OBFUSCATION],
      targetSystemPrompt: MOCK_TARGET_SYSTEM_PROMPT,
      customPrompts: '',
      defenseStrategy: DefenseStrategy.NONE,
      apiConfig: defaultApiConfig
    };
  });

  // Templates State (Persisted)
  const [templates, setTemplates] = useState<AttackTemplate[]>(() => {
    const saved = localStorage.getItem('promptfuzzer_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem('promptfuzzer_templates', JSON.stringify(templates));
  }, [templates]);

  const resetTemplates = () => {
    setTemplates(INITIAL_TEMPLATES);
  };

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Apply theme to body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const stats: TestStats = {
    total: results.length,
    completed: results.length,
    successCount: results.filter(r => r.success).length,
    criticalCount: results.filter(r => r.riskLevel === RiskLevel.CRITICAL).length,
    highCount: results.filter(r => r.riskLevel === RiskLevel.HIGH).length,
  };

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleManualReport = (result: TestResult) => {
    setResults(prev => [result, ...prev]);
    addLog(`Manual Report Saved: ${result.riskLevel}`);
    setActiveTab('report');
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setLogs([]);
    setActiveTab('dashboard');
    addLog("Initializing PromptFuzzer Engine...");

    // 1. Load Selected Templates
    let queue: AttackTemplate[] = templates.filter(t => config.selectedTypes.includes(t.type));

    addLog(`Loaded ${queue.length} base templates.`);

    // 2. Mutation Step
    if (config.useMutation) {
      addLog("Starting AI Mutation Engine...");
      const mutatedQueue: AttackTemplate[] = [];

      for (const t of queue) {
        if (t.type !== AttackType.MULTI_TURN) {
          addLog(`Mutating template: ${t.name}...`);
          const variants = await mutateAttack(t, lang, config.apiConfig);
          variants.forEach((v, i) => {
            mutatedQueue.push({
              ...t,
              id: `${t.id}-mut-${i}`,
              name: `${t.name} (Variant ${i + 1})`,
              prompts: [v]
            });
          });
          await new Promise(r => setTimeout(r, 1000));
        }
        mutatedQueue.push(t);
      }
      queue = mutatedQueue;
      addLog(`Mutation complete. Total vectors: ${queue.length}`);
    }

    setTotalSteps(queue.length);
    setCurrentProgress(0);

    // 3. Execution Loop
    for (let i = 0; i < queue.length; i++) {
      const template = queue[i];
      addLog(`Executing [${template.type}]: ${template.name}`);

      let finalPrompt = "";
      let finalResponse = "";

      let apiHistory: { role: string, parts: { text: string }[] }[] = [];
      let chatLog: ChatMessage[] = [];

      try {
        if (template.type === AttackType.MULTI_TURN) {
          for (const turnPrompt of template.prompts) {
            finalPrompt = turnPrompt;
            const response = await queryMockTarget(turnPrompt, apiHistory, config.targetSystemPrompt || "", config.defenseStrategy, config.apiConfig);

            apiHistory.push({ role: 'user', parts: [{ text: turnPrompt }] });
            apiHistory.push({ role: 'model', parts: [{ text: response }] });

            chatLog.push({ role: 'user', text: turnPrompt });
            chatLog.push({ role: 'ai', text: response });

            finalResponse = response;
            await new Promise(r => setTimeout(r, 1500));
          }
        } else {
          finalPrompt = template.prompts[0];
          finalResponse = await queryMockTarget(finalPrompt, [], config.targetSystemPrompt || "", config.defenseStrategy, config.apiConfig);
          chatLog.push({ role: 'user', text: finalPrompt });
          chatLog.push({ role: 'ai', text: finalResponse });
        }

        addLog(`Response received. Evaluating...`);

        const evalResult = await evaluateResult(finalPrompt, finalResponse, template.type, lang, config.apiConfig);

        const resultRecord: TestResult = {
          id: `res-${Date.now()}-${i}`,
          templateId: template.id,
          attackType: template.type,
          promptUsed: finalPrompt,
          response: finalResponse,
          history: chatLog,
          success: evalResult.success,
          riskLevel: evalResult.riskLevel as RiskLevel,
          evidence: evalResult.evidence,
          remediation: evalResult.remediation,
          timestamp: Date.now()
        };

        setResults(prev => [...prev, resultRecord]);

        if (evalResult.success) {
          addLog(`⚠️ VULNERABILITY DETECTED: ${evalResult.riskLevel}`);
        } else {
          addLog(`✅ Attack Blocked`);
        }

      } catch (e) {
        addLog(`❌ Execution Failed: ${template.id}`);
      }

      setCurrentProgress(i + 1);
      await new Promise(r => setTimeout(r, 2500));
    }

    addLog("Scan Complete.");
    setIsRunning(false);
  };

  const navItemClass = (id: string) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === id
    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-600/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-medium'
    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <Bug className="w-8 h-8 text-indigo-600 dark:text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight">{t.appTitle}</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('config')} className={navItemClass('config')}>
            <PlayCircle className="w-5 h-5" /> {t.navConfig}
          </button>
          <button onClick={() => setActiveTab('manual')} className={navItemClass('manual')}>
            <User className="w-5 h-5" /> {t.navManual}
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
            <LayoutDashboard className="w-5 h-5" /> {t.navLive}
          </button>
          <button onClick={() => setActiveTab('report')} className={navItemClass('report')}>
            <FileText className="w-5 h-5" /> {t.navReport}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <a
            href="https://github.com/BANG644/PromptFuzzer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>View on GitHub</span>
          </a>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4" />
            <span>v2.0.0 | Secure</span>
          </div>
          <div className="text-xs text-slate-400 leading-relaxed">
            © 2025 PromptFuzzer
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 relative">

        {/* Header Area */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
              {activeTab === 'config' && t.configTitle}
              {activeTab === 'manual' && t.manualTitle}
              {activeTab === 'dashboard' && t.navLive}
              {activeTab === 'report' && t.navReport}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.appSubtitle}</p>
          </div>
          {isRunning && (
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{t.scanning}</span>
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(currentProgress / (totalSteps || 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">{currentProgress}/{totalSteps}</span>
            </div>
          )}
        </div>

        {/* Dynamic Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'config' && (
            <ConfigPanel
              config={config}
              setConfig={setConfig}
              templates={templates}
              setTemplates={setTemplates}
              onResetTemplates={resetTemplates}
              onStart={runTests}
              isRunning={isRunning}
              theme={theme}
              toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              lang={lang}
              setLang={setLang}
            />
          )}

          {activeTab === 'manual' && (
            <ManualTestView
              systemPrompt={config.targetSystemPrompt || ""}
              defenseStrategy={config.defenseStrategy}
              onSaveReport={handleManualReport}
              apiConfig={config.apiConfig}
              lang={lang}
            />
          )}

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Dashboard results={results} stats={stats} lang={lang} />
              </div>

              {/* Live Logs Panel */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] shadow-sm transition-colors">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-t-xl">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Live Logs
                  </h3>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-2 font-mono text-xs">
                  {logs.length === 0 && <span className="text-slate-400">Ready...</span>}
                  {logs.map((log, i) => (
                    <div key={i} className={`
                      ${log.includes('VULNERABILITY') ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}
                      ${log.includes('Executing') ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}
                    `}>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <ReportView results={results} lang={lang} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;