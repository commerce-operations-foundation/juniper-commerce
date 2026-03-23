import { NextRequest, NextResponse } from 'next/server';
import { detectProvider, getProviderInfo } from '@/lib/ai/llm-provider';
import { ONX_TOOLS, TOOL_TO_ENDPOINT, SYSTEM_PROMPT } from '@/lib/ai/tool-definitions';

async function executeToolCall(toolName: string, input: Record<string, unknown>, baseUrl: string): Promise<unknown> {
  const endpoint = TOOL_TO_ENDPOINT[toolName];
  if (!endpoint) return { error: `Unknown tool: ${toolName}` };

  const url = new URL(endpoint.path, baseUrl);

  try {
    if (endpoint.method === 'GET') {
      for (const [k, v] of Object.entries(input)) {
        if (v !== undefined && v !== null) {
          if (Array.isArray(v)) {
            url.searchParams.set(k, v.join(','));
          } else {
            url.searchParams.set(k, String(v));
          }
        }
      }
      const res = await fetch(url.toString());
      return res.json();
    } else {
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return res.json();
    }
  } catch (err) {
    return { error: `Tool execution failed: ${String(err)}` };
  }
}

export async function GET() {
  const info = getProviderInfo();
  return NextResponse.json({ provider: info });
}

export async function POST(req: NextRequest) {
  let provider;
  try {
    provider = detectProvider();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  const { messages } = await req.json();
  const port = process.env.PORT || '3000';
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const result = await provider.chat(
      messages,
      ONX_TOOLS,
      SYSTEM_PROMPT,
      (toolName, input) => executeToolCall(toolName, input, baseUrl),
    );

    return NextResponse.json({
      reply: result.reply,
      toolCalls: result.toolCalls,
      provider: { name: provider.name, model: provider.model },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
