import type { LLMProvider, LLMResponse, Message, ToolDefinition, ToolCall } from '../llm-provider';

const MAX_ITERATIONS = 8;

export class OllamaProvider implements LLMProvider {
  name = 'Ollama';
  model = process.env.OLLAMA_MODEL ?? 'llama3.1';
  supportsToolCalling = true;

  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434';
  }

  async chat(
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt: string,
    executeToolCall: (toolName: string, input: Record<string, unknown>) => Promise<unknown>,
  ): Promise<LLMResponse> {
    const toolCalls: ToolCall[] = [];

    const ollamaTools = tools.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    let ollamaMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    let result = await this.callApi(ollamaMessages, ollamaTools);
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const msg = result.message;
      if (!msg?.tool_calls?.length) break;

      ollamaMessages.push(msg);

      for (const tc of msg.tool_calls) {
        const input = tc.function.arguments ?? {};
        const toolResult = await executeToolCall(tc.function.name, input);
        toolCalls.push({
          tool: tc.function.name,
          input,
          result: toolResult,
          timestamp: new Date().toISOString(),
        });
        ollamaMessages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
        });
      }

      result = await this.callApi(ollamaMessages, ollamaTools);
    }

    const reply = result.message?.content ?? 'No response';
    return { reply, toolCalls };
  }

  private async callApi(messages: any[], tools: any[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        tools,
        stream: false,
      }),
    });
    return response.json();
  }
}
