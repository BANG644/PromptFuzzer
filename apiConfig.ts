import { APIProvider, APIConfig } from './types';

export interface APIPreset {
    provider: APIProvider;
    name: string;
    description: string;
    baseURL: string;
    defaultModel: string;
    models: string[];
    requiresAuth: boolean;
    docURL: string;
}

export const API_PRESETS: APIPreset[] = [
    {
        provider: APIProvider.GEMINI,
        name: 'Google Gemini',
        description: 'Google\'s Gemini AI models',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-2.0-flash-exp',
        models: [
            'gemini-2.0-flash-exp',
            'gemini-2.0-flash-thinking-exp-01-21',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.0-pro'
        ],
        requiresAuth: true,
        docURL: 'https://ai.google.dev/docs'
    },
    {
        provider: APIProvider.OPENAI,
        name: 'OpenAI',
        description: 'OpenAI GPT models',
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o',
        models: [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4o-realtime-preview',
            'gpt-4-turbo',
            'gpt-3.5-turbo'
        ],
        requiresAuth: true,
        docURL: 'https://platform.openai.com/docs'
    },
    {
        provider: APIProvider.ANTHROPIC,
        name: 'Anthropic Claude',
        description: 'Anthropic\'s Claude models',
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-3-5-sonnet-20241022',
        models: [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307'
        ],
        requiresAuth: true,
        docURL: 'https://docs.anthropic.com'
    },
    {
        provider: APIProvider.AZURE,
        name: 'Azure OpenAI',
        description: 'Microsoft Azure OpenAI Service',
        baseURL: 'https://{resource-name}.openai.azure.com',
        defaultModel: 'gpt-4o',
        models: ['gpt-4o', 'gpt-4', 'gpt-4-32k', 'gpt-35-turbo'],
        requiresAuth: true,
        docURL: 'https://learn.microsoft.com/azure/ai-services/openai/'
    },
    {
        provider: APIProvider.ALIBABA,
        name: 'Alibaba Cloud (通义千问)',
        description: 'Alibaba Qwen models',
        baseURL: 'https://dashscope.aliyuncs.com/api/v1',
        defaultModel: 'qwen-max',
        models: [
            'qwen-max',
            'qwen-plus',
            'qwen-turbo',
            'qwen-long',
            'qwen2.5-72b-instruct',
            'qwen2.5-32b-instruct',
            'qwen2.5-14b-instruct',
            'qwen2.5-7b-instruct'
        ],
        requiresAuth: true,
        docURL: 'https://help.aliyun.com/zh/dashscope/'
    },
    {
        provider: APIProvider.DEEPSEEK,
        name: 'DeepSeek',
        description: 'DeepSeek AI models',
        baseURL: 'https://api.deepseek.com/v1',
        defaultModel: 'deepseek-chat',
        models: [
            'deepseek-chat',
            'deepseek-coder',
            'deepseek-reasoner'
        ],
        requiresAuth: true,
        docURL: 'https://platform.deepseek.com/api-docs/'
    },
    {
        provider: APIProvider.CUSTOM,
        name: 'Custom API',
        description: 'Custom OpenAI-compatible API endpoint',
        baseURL: '',
        defaultModel: '',
        models: [],
        requiresAuth: false,
        docURL: ''
    }
];

export const getPresetByProvider = (provider: APIProvider): APIPreset | undefined => {
    return API_PRESETS.find(p => p.provider === provider);
};

export const createDefaultAPIConfig = (provider: APIProvider = APIProvider.GEMINI): APIConfig => {
    const preset = getPresetByProvider(provider);
    return {
        provider,
        apiKey: '',
        baseURL: preset?.baseURL || '',
        model: preset?.defaultModel || ''
    };
};
