export const translations = {
  en: {
    appTitle: "PromptFuzzer",
    appSubtitle: "Automated LLM Red-Teaming Platform",
    navConfig: "Configuration",
    navManual: "Manual Audit",
    navLive: "Live Dashboard",
    navReport: "Audit Report",
    
    // Config Panel
    configTitle: "Configuration",
    targetSetup: "Target System Setup",
    systemPromptLabel: "System Prompt (Target Persona)",
    defenseLabel: "Defense Strategy",
    customVectors: "Custom Vectors",
    attackTypes: "Attack Vectors & Templates",
    enableMutation: "Enable AI Mutation (Generate Variations)",
    startAudit: "Start Automated Audit",
    scanning: "Scanning...",
    resetTemplates: "Reset to Defaults",
    
    // Defense Strategies
    defenseNone: "No Defense (Standard)",
    defenseSystem: "System Prompt Hardening",
    defenseXml: "XML Tagging Defense",
    defenseSandwich: "Sandwich Defense",

    // Attack Types (Headers)
    typeInjection: "Prompt Injection",
    typeLeakage: "Information Leakage",
    typeJailbreak: "Jailbreak / Bypass",
    typeMultiTurn: "Multi-turn (Crescendo)",
    typeObfuscation: "Obfuscation",
    typeManual: "Manual Audit",

    // Template Editing
    addTemplate: "Add New Template",
    newTemplatePlaceholder: "Enter attack prompt...",
    delete: "Delete",
    
    // Dashboard
    totalTests: "Total Tests",
    blocked: "Blocked",
    vulnerable: "Vulnerable",
    critical: "Critical",
    riskDist: "Risk Distribution",
    attackAnalysis: "Attack Analysis",
    noData: "No data available",

    // Manual Mode
    manualTitle: "Manual Red-Teaming",
    manualDesc: "Chat directly with the target to find vulnerabilities.",
    currentStatus: "Current Status",
    clearChat: "Clear Chat",
    genReport: "Generate Report",
    inputPlaceholder: "Enter attack command...",
    
    // Report
    logsTitle: "Vulnerability Logs",
    exportReport: "Export Report",
    inputSnippet: "Input Snippet",
    outputSnippet: "Output Snippet",
    viewFullChat: "View Full Chat",
    hideFullChat: "Hide Chat",
    remediation: "Remediation Advice",
    
    // Status
    statusSafe: "SAFE",
    statusLow: "LOW",
    statusMedium: "MEDIUM",
    statusHigh: "HIGH",
    statusCritical: "CRITICAL"
  },
  zh: {
    appTitle: "PromptFuzzer",
    appSubtitle: "LLM 自动化红队测试平台",
    navConfig: "测试配置",
    navManual: "手动审计",
    navLive: "实时监控",
    navReport: "漏洞报告",
    
    // Config Panel
    configTitle: "测试配置",
    targetSetup: "目标系统设置",
    systemPromptLabel: "系统提示词 (Target Persona)",
    defenseLabel: "防御增强策略",
    customVectors: "自定义攻击向量",
    attackTypes: "攻击向量与模板管理",
    enableMutation: "启用 AI 变异增强 (自动生成变体)",
    startAudit: "开始自动化审计",
    scanning: "正在扫描...",
    resetTemplates: "重置为默认模板",
    
    // Defense Strategies
    defenseNone: "无防御 (标准模式)",
    defenseSystem: "系统提示词加固",
    defenseXml: "XML 标签隔离防御",
    defenseSandwich: "三明治防御 (Sandwich Defense)",

    // Attack Types
    typeInjection: "提示词注入 (Injection)",
    typeLeakage: "信息泄露 (Leakage)",
    typeJailbreak: "越狱攻击 (Jailbreak)",
    typeMultiTurn: "多轮对话 (Multi-turn)",
    typeObfuscation: "混淆绕过 (Obfuscation)",
    typeManual: "手动红队审计",

    // Template Editing
    addTemplate: "添加新模板",
    newTemplatePlaceholder: "输入攻击提示词...",
    delete: "删除",
    
    // Dashboard
    totalTests: "总测试数",
    blocked: "成功防御",
    vulnerable: "发现漏洞",
    critical: "严重漏洞",
    riskDist: "风险分布",
    attackAnalysis: "攻击类型分析",
    noData: "暂无数据",

    // Manual Mode
    manualTitle: "手动红队测试",
    manualDesc: "直接与目标对话，实时检测漏洞。",
    currentStatus: "当前状态",
    clearChat: "清空对话",
    genReport: "生成报告",
    inputPlaceholder: "输入攻击指令...",
    
    // Report
    logsTitle: "漏洞日志",
    exportReport: "导出报告",
    inputSnippet: "输入摘要",
    outputSnippet: "响应摘要",
    viewFullChat: "查看完整对话",
    hideFullChat: "隐藏完整对话",
    remediation: "修复建议",

    // Status
    statusSafe: "安全",
    statusLow: "低风险",
    statusMedium: "中等风险",
    statusHigh: "高风险",
    statusCritical: "严重风险"
  }
};