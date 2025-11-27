import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { TestResult, RiskLevel, Language } from '../types';
import { translations } from '../translations';
import { Download, Terminal, AlertOctagon, ShieldCheck, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  results: TestResult[];
  lang: Language;
}

const ReportView: React.FC<Props> = ({ results, lang }) => {
  const t = translations[lang];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getRiskColor = (risk: RiskLevel) => {
    switch(risk) {
      case RiskLevel.CRITICAL: return 'text-rose-500 border-rose-500 bg-rose-500/10';
      case RiskLevel.HIGH: return 'text-orange-500 border-orange-500 bg-orange-500/10';
      case RiskLevel.MEDIUM: return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      case RiskLevel.LOW: return 'text-blue-500 border-blue-500 bg-blue-500/10';
      default: return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const downloadReport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    let md = `# PromptFuzzer Report\nDate: ${timestamp}\n\n`;
    
    md += `## Summary\n`;
    md += `- Total: ${results.length}\n`;
    md += `- Vulnerabilities: ${results.filter(r => r.success).length}\n\n`;
    
    md += `## Findings\n\n`;
    
    results.filter(r => r.success).forEach(r => {
      md += `### [${r.riskLevel}] ${r.attackType}\n`;
      md += `**Prompt:**\n\`\`\`\n${r.promptUsed}\n\`\`\`\n`;
      md += `**Response:**\n> ${r.evidence}\n\n`;
      md += `**Remediation:**\n${r.remediation}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuzzer-report-${timestamp}.md`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.logsTitle}</h2>
        <button 
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <Download className="w-4 h-4" /> {t.exportReport}
        </button>
      </div>

      <div className="space-y-4">
        {results.length === 0 && (
          <div className="text-center p-12 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            {t.noData}
          </div>
        )}
        
        {results.map((result) => (
          <div key={result.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden group shadow-sm transition-colors">
            <div className="p-4 flex items-start gap-4">
              <div className={`p-2 rounded-lg border ${getRiskColor(result.riskLevel)}`}>
                {result.success ? <AlertOctagon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              
              <div className="flex-1">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{result.attackType}</h4>
                    <span className="text-xs text-slate-400 font-mono">{result.id}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getRiskColor(result.riskLevel)} border-none`}>
                    {result.riskLevel}
                  </span>
                </div>

                {/* Evidence Snippet */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Terminal className="w-3 h-3" /> {t.inputSnippet}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap line-clamp-2">
                      {result.promptUsed}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Terminal className="w-3 h-3" /> {t.outputSnippet}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap line-clamp-2">
                      {result.evidence || result.response}
                    </p>
                  </div>
                </div>

                {/* Toggle Chat History */}
                {result.history && result.history.length > 0 && (
                  <button 
                    onClick={() => toggleExpand(result.id)}
                    className="flex items-center gap-2 text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors mb-3"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {expandedId === result.id ? t.hideFullChat : t.viewFullChat}
                    {expandedId === result.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}

                {/* Expanded Chat View */}
                {expandedId === result.id && result.history && (
                  <div className="mb-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-4 space-y-3">
                    {result.history.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] rounded p-3 text-sm ${
                           msg.role === 'user' 
                             ? 'bg-indigo-100 text-indigo-900 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-100 dark:border-indigo-900/50' 
                             : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                         }`}>
                           <div className="text-[10px] opacity-50 mb-1 uppercase flex justify-between">
                             <span>{msg.role}</span>
                             {msg.risk && msg.risk !== RiskLevel.SAFE && <span className="ml-2 text-rose-500 font-bold">{msg.risk}</span>}
                           </div>
                           <div className="whitespace-pre-wrap font-mono">{msg.text}</div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Remediation Box */}
                {result.success && (
                  <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded">
                     <p className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold mb-1">{t.remediation}:</p>
                     <p className="text-sm text-indigo-800 dark:text-indigo-100">{result.remediation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportView;