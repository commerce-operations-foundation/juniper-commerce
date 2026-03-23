import type { LLMProvider, LLMResponse, Message, ToolDefinition, ToolCall } from '../llm-provider';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_ITERATIONS = 8;

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  model = 'gpt-4o';
  supportsToolCalling = true;

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY!;
  }

  async chat(
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt: string,
    executeToolCall: (toolName: string, input: Record<string, unknown>) => Promise<unknown>,
  ): Promise<LLMResponse> {
    const toolCalls: ToolCall[] = [];

    const openaiTools = tools.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    let openaiMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    let result = await this.callApi(openaiMessages, openaiTools);
    let iterations = 0;

    while (result.choices?.[0]?.finish_reason === 'tool_calls' && iterations < MAX_ITERATIONS) {
      iterations++;
      const assistantMessage = result.choices[0].message;
      openaiMessages.push(assistantMessage);

      for (const tc of assistantMessage.tool_calls ?? []) {
        const input = JSON.parse(tc.function.arguments);
        const toolResult = await executeToolCall(tc.function.name, input);
        toolCalls.push({
          tool: tc.function.name,
          input,
          result: toolResult,
          timestamp: new Date().toISOString(),
        });
        openaiMessages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult),
        });
      }

      result = await this.callApi(openaiMessages, openaiTools);
    }

    const reply = result.choices?.[0]?.message?.content ?? 'No response';
    return { reply, toolCalls };
  }

  private async callApi(messages: any[], tools: any[]): Promise<any> {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        tools,
        max_tokens: 2048,
      }),
    });
    return response.json();
  }
}
