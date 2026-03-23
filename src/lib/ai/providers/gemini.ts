import type { LLMProvider, LLMResponse, Message, ToolDefinition, ToolCall } from '../llm-provider';

const MAX_ITERATIONS = 8;

export class GeminiProvider implements LLMProvider {
  name = 'Google';
  model = 'gemini-2.0-flash';
  supportsToolCalling = true;

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY!;
  }

  async chat(
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt: string,
    executeToolCall: (toolName: string, input: Record<string, unknown>) => Promise<unknown>,
  ): Promise<LLMResponse> {
    const toolCalls: ToolCall[] = [];

    const functionDeclarations = tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: this.convertSchema(t.parameters),
    }));

    let contents: any[] = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let result = await this.callApi(contents, functionDeclarations, systemPrompt);
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const candidate = result.candidates?.[0];
      if (!candidate) break;

      const parts = candidate.content?.parts ?? [];
      const fnCalls = parts.filter((p: any) => p.functionCall);
      if (fnCalls.length === 0) break;

      contents.push({ role: 'model', parts });

      const responseParts: any[] = [];
      for (const part of fnCalls) {
        const { name, args } = part.functionCall;
        const toolResult = await executeToolCall(name, args ?? {});
        toolCalls.push({
          tool: name,
          input: args ?? {},
          result: toolResult,
          timestamp: new Date().toISOString(),
        });
        responseParts.push({
          functionResponse: { name, response: toolResult },
        });
      }

      contents.push({ role: 'user', parts: responseParts });
      result = await this.callApi(contents, functionDeclarations, systemPrompt);
    }

    const textParts = result.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) ?? [];
    const reply = textParts.map((p: any) => p.text).join('') || 'No response';
    return { reply, toolCalls };
  }

  private convertSchema(schema: Record<string, unknown>): Record<string, unknown> {
    const converted = { ...schema };
    if (converted.properties) {
      const props = converted.properties as Record<string, any>;
      for (const key of Object.keys(props)) {
        if (props[key].type === 'array' && props[key].items) {
          props[key] = { ...props[key], items: this.convertSchema(props[key].items) };
        } else if (props[key].type === 'object' && props[key].properties) {
          props[key] = this.convertSchema(props[key]);
        }
      }
    }
    return converted;
  }

  private async callApi(contents: any[], functionDeclarations: any[], systemPrompt: string): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools: [{ functionDeclarations }],
        generationConfig: { maxOutputTokens: 2048 },
      }),
    });
    return response.json();
  }
}
