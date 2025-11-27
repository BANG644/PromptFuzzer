import React, { useState } from 'react';
import { AttackType, TestConfig, DefenseStrategy, Language, AttackTemplate } from '../types';
import { translations } from '../translations';
import APIConfigPanel from './APIConfigPanel';
import {
  ShieldAlert, Zap, Settings, Target, Edit, FilePlus,
  Sun, Moon, Globe, ChevronDown, ChevronUp, Plus, Trash2, RefreshCcw
} from 'lucide-react';

interface Props {
  config: TestConfig;
  setConfig: React.Dispatch<React.SetStateAction<TestConfig>>;
  templates: AttackTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<AttackTemplate[]>>;
  onResetTemplates: () => void;
  onStart: () => void;
  isRunning: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const ConfigPanel: React.FC<Props> = ({
  config, setConfig, templates, setTemplates, onResetTemplates,
  onStart, isRunning, theme, toggleTheme, lang, setLang
}) => {

  const t = translations[lang];
  const [expandedType, setExpandedType] = useState<AttackType | null>(null);
  const [newPromptInput, setNewPromptInput] = useState('');

  const toggleTypeSelection = (type: AttackType) => {
    setConfig(prev => {
      const exists = prev.selectedTypes.includes(type);
      return {
        ...prev,
        selectedTypes: exists
          ? prev.selectedTypes.filter(t => t !== type)
          : [...prev.selectedTypes, type]
      };
    });
  };

  const handleExpand = (type: AttackType) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTemplate = (type: AttackType) => {
    if (!newPromptInput.trim()) return;
    const newTemplate: AttackTemplate = {
      id: `custom-${Date.now()}`,
      type: type,
      name: `Custom ${type} ${Date.now().toString().slice(-4)}`,
      description: 'User defined custom vector',
      prompts: [newPromptInput]
    };
    setTemplates(prev => [...prev, newTemplate]);
    setNewPromptInput('');
  };

  const getTypeLabel = (type: AttackType) => {
    switch (type) {
      case AttackType.INJECTION: return t.typeInjection;
      case AttackType.LEAKAGE: return t.typeLeakage;
      case AttackType.JAILBREAK: return t.typeJailbreak;
      case AttackType.MULTI_TURN: return t.typeMultiTurn;
      case AttackType.OBFUSCATION: return t.typeObfuscation;
      case AttackType.MANUAL: return t.typeManual;
      default: return type;
    }
  };

  const defenseOptions = [
    { value: DefenseStrategy.NONE, label: t.defenseNone },
    { value: DefenseStrategy.SYSTEM_PROMPT, label: t.defenseSystem },
    { value: DefenseStrategy.XML_TAGGING, label: t.defenseXml },
    { value: DefenseStrategy.SANDWICH, label: t.defenseSandwich },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl transition-colors duration-300">

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.configTitle}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
            <Globe className="w-4 h-4" /> {lang === 'en' ? 'EN' : '中文'}
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors text-slate-600 dark:text-slate-300">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-8">

        {/* API Configuration */}
        <APIConfigPanel
          config={config.apiConfig}
          onChange={(apiConfig) => setConfig({ ...config, apiConfig })}
          lang={lang}
        />

        {/* Privacy Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong className="font-semibold">{lang === 'zh' ? '隐私声明' : 'Privacy Notice'}:</strong>{' '}
            {lang === 'zh'
              ? '您的API密钥仅存储在本地浏览器中,不会被发送到任何第三方服务器。所有API调用均直接发送到您选择的AI提供商。'
              : 'Your API keys are stored locally in your browser only and are never sent to any third-party servers. All API calls are made directly to your chosen AI provider.'}
          </p>
        </div>

        {/* Target & Defense */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target System */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Target className="w-4 h-4" /> {t.targetSetup}
            </label>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <label className="text-xs text-slate-500 font-mono uppercase flex items-center gap-2 mb-2">
                <Edit className="w-3 h-3" /> {t.systemPromptLabel}
              </label>
              <textarea
                value={config.targetSystemPrompt}
                onChange={(e) => setConfig({ ...config, targetSystemPrompt: e.target.value })}
                className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-3 text-sm text-slate-700 dark:text-slate-300 font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Defense Strategy */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> {t.defenseLabel}
            </label>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 h-full">
              <div className="space-y-2">
                {defenseOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer">
                    <input
                      type="radio"
                      name="defense"
                      value={opt.value}
                      checked={config.defenseStrategy === opt.value}
                      onChange={() => setConfig({ ...config, defenseStrategy: opt.value })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attack Vector Management */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.attackTypes}</label>
            <button onClick={onResetTemplates} className="text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors">
              <RefreshCcw className="w-3 h-3" /> {t.resetTemplates}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {Object.values(AttackType).filter(t => t !== AttackType.MANUAL).map((type) => {
              const typeTemplates = templates.filter(temp => temp.type === type);
              const isSelected = config.selectedTypes.includes(type);
              const isExpanded = expandedType === type;

              return (
                <div key={type} className={`border rounded-lg transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                  }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleTypeSelection(type)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }} // Handled by div click
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                      />
                      <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                        {getTypeLabel(type)}
                      </span>
                      <span className="text-xs text-slate-400">({typeTemplates.length} prompts)</span>
                    </div>
                    <button onClick={() => handleExpand(type)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-lg space-y-3">
                      {/* List existing templates */}
                      {typeTemplates.map(tmpl => (
                        <div key={tmpl.id} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded group">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{tmpl.name}</p>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-500 mt-1 line-clamp-2">{tmpl.prompts[0]}</p>
                          </div>
                          <button onClick={() => handleDeleteTemplate(tmpl.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add new template */}
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newPromptInput}
                          onChange={(e) => setNewPromptInput(e.target.value)}
                          placeholder={t.newTemplatePlaceholder}
                          className="flex-1 text-sm px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleAddTemplate(type)}
                          disabled={!newPromptInput.trim()}
                          className="px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {t.addTemplate}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Options */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            id="mutation"
            checked={config.useMutation}
            onChange={(e) => setConfig({ ...config, useMutation: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="mutation" className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer select-none">
            <Zap className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            {t.enableMutation}
          </label>
        </div>

        <button
          onClick={onStart}
          disabled={isRunning || config.selectedTypes.length === 0}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${isRunning
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
            }`}
        >
          {isRunning ? t.scanning : t.startAudit}
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;