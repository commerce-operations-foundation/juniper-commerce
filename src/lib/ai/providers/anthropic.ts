import type { LLMProvider, LLMResponse, Message, ToolDefinition, ToolCall } from '../llm-provider';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MAX_ITERATIONS = 8;

export class AnthropicProvider implements LLMProvider {
  name = 'Anthropic';
  model = 'claude-sonnet-4-20250514';
  supportsToolCalling = true;

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY!;
  }

  async chat(
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt: string,
    executeToolCall: (toolName: string, input: Record<string, unknown>) => Promise<unknown>,
  ): Promise<LLMResponse> {
    const toolCalls: ToolCall[] = [];

    const anthropicTools = tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    }));

    let anthropicMessages: any[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    let result = await this.callApi(anthropicMessages, anthropicTools, systemPrompt);
    let iterations = 0;

    while (result.stop_reason === 'tool_use' && iterations < MAX_ITERATIONS) {
      iterations++;
      const assistantContent = result.content;
      const toolUseBlocks = assistantContent.filter((b: any) => b.type === 'tool_use');

      const toolResults: any[] = [];
      for (const block of toolUseBlocks) {
        const toolResult = await executeToolCall(block.name, block.input);
        toolCalls.push({
          tool: block.name,
          input: block.input,
          result: toolResult,
          timestamp: new Date().toISOString(),
        });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(toolResult),
        });
      }

      anthropicMessages = [
        ...anthropicMessages,
        { role: 'assistant', content: assistantContent },
        { role: 'user', content: toolResults },
      ];

      result = await this.callApi(anthropicMessages, anthropicTools, systemPrompt);
    }

    const reply = result.content?.find((b: any) => b.type === 'text')?.text ?? 'No response';
    return { reply, toolCalls };
  }

  private async callApi(messages: any[], tools: any[], system: string): Promise<any> {
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        system,
        tools,
        messages,
      }),
    });
    return response.json();
  }
}
