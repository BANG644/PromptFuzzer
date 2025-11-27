export type Language = 'en' | 'zh';

export enum APIProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  AZURE = 'AZURE',
  ALIBABA = 'ALIBABA',
  DEEPSEEK = 'DEEPSEEK',
  CUSTOM = 'CUSTOM'
}

export interface APIConfig {
  provider: APIProvider;
  apiKey: string;
  baseURL?: string;
  model: string;
  customHeaders?: Record<string, string>;
}

export enum AttackType {
  INJECTION = 'INJECTION',
  LEAKAGE = 'LEAKAGE',
  JAILBREAK = 'JAILBREAK',
  MULTI_TURN = 'MULTI_TURN',
  OBFUSCATION = 'OBFUSCATION',
  MANUAL = 'MANUAL'
}

export enum RiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  SAFE = 'SAFE',
}

export enum DefenseStrategy {
  NONE = 'NONE',
  SYSTEM_PROMPT = 'SYSTEM_PROMPT',
  XML_TAGGING = 'XML_TAGGING',
  SANDWICH = 'SANDWICH'
}

export interface AttackTemplate {
  id: string;
  type: AttackType;
  name: string;
  prompts: string[];
  description: string;
}

export interface ChatMessage {
  role: string;
  text: string;
  risk?: RiskLevel;
}

export interface TestResult {
  id: string;
  templateId: string;
  attackType: AttackType;
  promptUsed: string;
  response: string;
  history?: ChatMessage[];
  success: boolean;
  riskLevel: RiskLevel;
  evidence: string;
  remediation: string;
  timestamp: number;
}

export interface TestConfig {
  targetName: string;
  useMutation: boolean;
  selectedTypes: AttackType[];
  targetSystemPrompt?: string;
  customPrompts: string;
  defenseStrategy: DefenseStrategy;
  apiConfig: APIConfig;
}

export interface TestStats {
  total: number;
  completed: number;
  successCount: number;
  criticalCount: number;
  highCount: number;
}