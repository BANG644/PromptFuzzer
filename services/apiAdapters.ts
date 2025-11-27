import { APIConfig, APIProvider, AttackType, Language, RiskLevel } from '../types';

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic retry wrapper for API calls
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            const isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429');
            if (isRateLimit && i < retries - 1) {
                const waitTime = baseDelay * Math.pow(2, i);
                console.warn(`Rate limit hit. Retrying in ${waitTime}ms...`);
                await delay(waitTime);
                continue;
            }
            throw error;
        }
    }
    throw new Error("Operation failed after max retries");
}

// OpenAI-compatible API call
async function callOpenAICompatible(
    config: APIConfig,
    messages: Array<{ role: string, content: string }>,
    systemPrompt?: string,
    jsonMode: boolean = false,
    temperature: number = 0.7
): Promise<string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...config.customHeaders
    };

    const body: any = {
        model: config.model,
        messages: systemPrompt
            ? [{ role: 'system', content: systemPrompt }, ...messages]
            : messages,
        temperature
    };

    if (jsonMode) {
        body.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '[No Response]';
}

// Anthropic API call
async function callAnthropic(
    config: APIConfig,
    messages: Array<{ role: string, content: string }>,
    systemPrompt?: string,
    temperature: number = 0.7
): Promise<string> {
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        ...config.customHeaders
    };

    const body = {
        model: config.model,
        max_tokens: 4096,
        temperature,
        system: systemPrompt || undefined,
        messages: messages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.content
        }))
    };

    const response = await fetch(`${config.baseURL}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '[No Response]';
}

// Gemini API call (using existing @google/genai SDK)
async function callGemini(
    config: APIConfig,
    messages: Array<{ role: string, content: string }>,
    systemPrompt?: string,
    jsonMode: boolean = false,
    temperature: number = 0.7
): Promise<string> {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: config.apiKey });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chatConfig: any = {
        model: config.model,
        config: {
            systemInstruction: systemPrompt,
            temperature
        },
        history
    };

    if (jsonMode) {
        chatConfig.config.responseMimeType = "application/json";
    }

    const chat = ai.chats.create(chatConfig);
    const result = await chat.sendMessage({ message: lastMessage });
    return result.text || '[No Response]';
}

// Alibaba Cloud (DashScope) API call
async function callAlibaba(
    config: APIConfig,
    messages: Array<{ role: string, content: string }>,
    systemPrompt?: string,
    temperature: number = 0.7
): Promise<string> {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...config.customHeaders
    };

    const body = {
        model: config.model,
        input: {
            messages: systemPrompt
                ? [{ role: 'system', content: systemPrompt }, ...messages.map(m => ({
                    role: m.role === 'ai' ? 'assistant' : m.role,
                    content: m.content
                }))]
                : messages.map(m => ({
                    role: m.role === 'ai' ? 'assistant' : m.role,
                    content: m.content
                }))
        },
        parameters: {
            temperature
        }
    };

    const response = await fetch(`${config.baseURL}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Alibaba API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.output?.text || '[No Response]';
}

// Unified API call function
async function callAI(
    config: APIConfig,
    messages: Array<{ role: string, content: string }>,
    systemPrompt?: string,
    jsonMode: boolean = false,
    temperature: number = 0.7
): Promise<string> {
    switch (config.provider) {
        case APIProvider.GEMINI:
            return callGemini(config, messages, systemPrompt, jsonMode, temperature);

        case APIProvider.ANTHROPIC:
            return callAnthropic(config, messages, systemPrompt, temperature);

        case APIProvider.OPENAI:
        case APIProvider.DEEPSEEK:
        case APIProvider.AZURE:
        case APIProvider.CUSTOM:
            return callOpenAICompatible(config, messages, systemPrompt, jsonMode, temperature);

        case APIProvider.ALIBABA:
            return callAlibaba(config, messages, systemPrompt, temperature);

        default:
            throw new Error(`Unsupported API provider: ${config.provider}`);
    }
}

// Test API connection
export async function testConnection(config: APIConfig): Promise<{ success: boolean, message: string }> {
    try {
        const response = await retryOperation(async () => {
            return await callAI(
                config,
                [{ role: 'user', content: 'Hello! Please respond with "Connection successful"' }],
                'You are a helpful assistant.',
                false,
                0.3
            );
        }, 1, 1000);

        return {
            success: true,
            message: `Connected successfully! Response: ${response.slice(0, 50)}...`
        };
    } catch (error: any) {
        return {
            success: false,
            message: `Connection failed: ${error.message}`
        };
    }
}

export { callAI, retryOperation };
