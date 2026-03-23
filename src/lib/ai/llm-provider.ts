export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolCall {
  tool: string;
  input: Record<string, unknown>;
  result: unknown;
  timestamp: string;
}

export interface LLMResponse {
  reply: string;
  toolCalls: ToolCall[];
}

export interface LLMProvider {
  name: string;
  model: string;
  supportsToolCalling: boolean;

  chat(
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt: string,
    executeToolCall: (toolName: string, input: Record<string, unknown>) => Promise<unknown>,
  ): Promise<LLMResponse>;
}

export function detectProvider(): LLMProvider {
  if (process.env.ANTHROPIC_API_KEY) {
    const { AnthropicProvider } = require('./providers/anthropic');
    return new AnthropicProvider();
  }
  if (process.env.OPENAI_API_KEY) {
    const { OpenAIProvider } = require('./providers/openai');
    return new OpenAIProvider();
  }
  if (process.env.GOOGLE_AI_API_KEY) {
    const { GeminiProvider } = require('./providers/gemini');
    return new GeminiProvider();
  }
  if (process.env.OLLAMA_URL) {
    const { OllamaProvider } = require('./providers/ollama');
    return new OllamaProvider();
  }
  throw new Error(
    'No AI provider configured. Set one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_AI_API_KEY, or OLLAMA_URL'
  );
}

export function getProviderInfo(): { name: string; model: string } | null {
  try {
    const provider = detectProvider();
    return { name: provider.name, model: provider.model };
  } catch {
    return null;
  }
}
