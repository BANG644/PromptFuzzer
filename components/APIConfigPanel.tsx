import React, { useState } from 'react';
import { APIConfig, APIProvider, Language } from '../types';
import { API_PRESETS, getPresetByProvider, createDefaultAPIConfig } from '../apiConfig';
import { testConnection } from '../services/geminiService';
import { translations } from '../translations';
import {
    Settings, Key, Link, CheckCircle, XCircle, Loader,
    ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff
} from 'lucide-react';

interface Props {
    config: APIConfig;
    onChange: (config: APIConfig) => void;
    lang: Language;
}

const APIConfigPanel: React.FC<Props> = ({ config, onChange, lang }) => {
    const t = translations[lang];
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean, message: string } | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);

    const currentPreset = getPresetByProvider(config.provider);

    const handleProviderChange = (provider: APIProvider) => {
        const newConfig = createDefaultAPIConfig(provider);
        newConfig.apiKey = config.apiKey; // Keep existing API key if any
        onChange(newConfig);
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        if (!config.apiKey.trim()) {
            setTestResult({
                success: false,
                message: lang === 'zh' ? '请先输入API密钥' : 'Please enter an API key first'
            });
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            const result = await testConnection(config);
            setTestResult(result);
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.message
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-xl overflow-hidden transition-all duration-300">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 dark:bg-indigo-600 rounded-lg">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                            {lang === 'zh' ? 'API 配置' : 'API Configuration'}
                        </h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                            {currentPreset?.name || (lang === 'zh' ? '选择API提供商' : 'Select API Provider')}
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-indigo-700 dark:text-indigo-300" /> : <ChevronDown className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />}
                </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-6 pt-2 space-y-6 bg-white dark:bg-slate-900/50 border-t border-indigo-200 dark:border-indigo-800/50">

                    {/* Provider Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Link className="w-4 h-4" />
                            {lang === 'zh' ? 'API 提供商' : 'API Provider'}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {API_PRESETS.map(preset => (
                                <button
                                    key={preset.provider}
                                    onClick={() => handleProviderChange(preset.provider)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${config.provider === preset.provider
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-md'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                        {preset.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                        {preset.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            {lang === 'zh' ? 'API 密钥' : 'API Key'}
                            {currentPreset?.requiresAuth && (
                                <span className="text-xs text-rose-500 dark:text-rose-400">*</span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? "text" : "password"}
                                value={config.apiKey}
                                onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
                                placeholder={lang === 'zh' ? '输入您的API密钥' : 'Enter your API key'}
                                className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono text-sm transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            >
                                {showApiKey ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                            </button>
                        </div>
                        {currentPreset?.docURL && (
                            <a
                                href={currentPreset.docURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                {lang === 'zh' ? '获取API密钥' : 'Get API Key'}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>

                    {/* Model Selection */}
                    {currentPreset && currentPreset.models.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {lang === 'zh' ? '模型' : 'Model'}
                            </label>
                            <select
                                value={config.model}
                                onChange={(e) => onChange({ ...config, model: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                {currentPreset.models.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Custom Base URL (for Custom provider) */}
                    {config.provider === APIProvider.CUSTOM && (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {lang === 'zh' ? '基础URL' : 'Base URL'}
                            </label>
                            <input
                                type="text"
                                value={config.baseURL || ''}
                                onChange={(e) => onChange({ ...config, baseURL: e.target.value })}
                                placeholder="https://api.example.com/v1"
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-sm transition-colors"
                            />
                        </div>
                    )}

                    {config.provider === APIProvider.CUSTOM && (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {lang === 'zh' ? '模型名称' : 'Model Name'}
                            </label>
                            <input
                                type="text"
                                value={config.model}
                                onChange={(e) => onChange({ ...config, model: e.target.value })}
                                placeholder="gpt-4"
                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-sm transition-colors"
                            />
                        </div>
                    )}

                    {/* Test Connection Button */}
                    <div className="pt-2">
                        <button
                            onClick={handleTestConnection}
                            disabled={isTesting || !config.apiKey.trim()}
                            className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        >
                            {isTesting ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    {lang === 'zh' ? '测试中...' : 'Testing...'}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    {lang === 'zh' ? '测试连接' : 'Test Connection'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Test Result */}
                    {testResult && (
                        <div className={`p-4 rounded-lg border-2 flex items-start gap-3 ${testResult.success
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700'
                            }`}>
                            {testResult.success ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <div className={`font-semibold text-sm ${testResult.success
                                        ? 'text-emerald-800 dark:text-emerald-200'
                                        : 'text-rose-800 dark:text-rose-200'
                                    }`}>
                                    {testResult.success
                                        ? (lang === 'zh' ? '连接成功!' : 'Connection Successful!')
                                        : (lang === 'zh' ? '连接失败' : 'Connection Failed')}
                                </div>
                                <div className={`text-xs mt-1 ${testResult.success
                                        ? 'text-emerald-700 dark:text-emerald-300'
                                        : 'text-rose-700 dark:text-rose-300'
                                    }`}>
                                    {testResult.message}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default APIConfigPanel;
