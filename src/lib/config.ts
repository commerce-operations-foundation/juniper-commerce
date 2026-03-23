import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG_PATH = join(process.cwd(), 'config.json');

export interface AppConfig {
  appMode: 'demo' | 'full';
  dataMode: 'memory' | 'postgres' | 'sqlite';
  databaseUrl?: string;
  aiProvider?: 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'auto';
  anthropicApiKey?: string;
  openaiApiKey?: string;
  googleAiApiKey?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
  mcpServerUrl?: string;
  sessionTtlMinutes?: number;
  maxMessagesPerSession?: number;
}

function getDefaults(): AppConfig {
  return {
    appMode: (process.env.APP_MODE as AppConfig['appMode']) ?? 'demo',
    dataMode: (process.env.DATA_MODE as AppConfig['dataMode']) ?? 'memory',
    databaseUrl: process.env.DATABASE_URL,
    aiProvider: 'auto',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
    ollamaUrl: process.env.OLLAMA_URL,
    ollamaModel: process.env.OLLAMA_MODEL,
    mcpServerUrl: process.env.ONX_MCP_SERVER_URL,
    sessionTtlMinutes: parseInt(process.env.SESSION_TTL_MINUTES ?? '30', 10),
    maxMessagesPerSession: parseInt(process.env.MAX_MESSAGES_PER_SESSION ?? '20', 10),
  };
}

let cachedConfig: AppConfig | undefined;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const defaults = getDefaults();
  let config: AppConfig;

  if (existsSync(CONFIG_PATH)) {
    try {
      const fileConfig = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
      config = { ...defaults, ...fileConfig };
    } catch {
      config = defaults;
    }
  } else {
    config = defaults;
  }

  cachedConfig = config;
  return config;
}

const SECRET_KEYS: (keyof AppConfig)[] = [
  'anthropicApiKey', 'openaiApiKey', 'googleAiApiKey', 'databaseUrl',
];

export function saveConfig(updates: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const merged = { ...current, ...updates };
  cachedConfig = merged;

  const forDisk = { ...merged };
  for (const key of SECRET_KEYS) {
    delete (forDisk as Record<string, unknown>)[key];
  }

  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(forDisk, null, 2));
  } catch {
    // File write may fail in read-only environments
  }

  return merged;
}

export function stripSecrets(config: AppConfig): Record<string, unknown> {
  const safe = { ...config } as Record<string, unknown>;
  for (const key of SECRET_KEYS) {
    const val = safe[key];
    if (typeof val === 'string' && val.length > 8) {
      safe[key] = val.slice(0, 4) + '****' + val.slice(-4);
    } else if (typeof val === 'string') {
      safe[key] = '****';
    }
  }
  return safe;
}

export function isInstallMode(): boolean {
  return getConfig().appMode === 'full';
}
