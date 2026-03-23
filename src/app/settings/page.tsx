'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Settings, Database, Bot, Server, Shield, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Config {
  appMode: string;
  dataMode: string;
  databaseUrl?: string;
  aiProvider?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  googleAiApiKey?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
  mcpServerUrl?: string;
  sessionTtlMinutes?: number;
  maxMessagesPerSession?: number;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [installMode, setInstallMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setConfig(data.config);
        setInstallMode(data.installMode);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof Config, value: string | number) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!installMode) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Settings Unavailable</h1>
        <p className="text-gray-500 mb-6">
          The settings screen is only available in install mode. Set <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">APP_MODE=full</code> to enable it.
        </p>
        <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Configure Juniper Commerce for your environment</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Data Store */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Data Store</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Storage Engine</label>
              <select
                value={config?.dataMode ?? 'memory'}
                onChange={e => update('dataMode', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="memory">In-Memory (demo, no persistence)</option>
                <option value="postgres">PostgreSQL (recommended for production)</option>
                <option value="sqlite">SQLite (lightweight, file-based)</option>
              </select>
            </div>

            {(config?.dataMode === 'postgres' || config?.dataMode === 'sqlite') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {config.dataMode === 'postgres' ? 'PostgreSQL Connection URL' : 'SQLite Database Path'}
                </label>
                <input
                  type="text"
                  value={config?.databaseUrl ?? ''}
                  onChange={e => update('databaseUrl', e.target.value)}
                  placeholder={config.dataMode === 'postgres' ? 'postgres://user:pass@host:5432/dbname' : 'file:./db/juniper.db'}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            )}
          </div>
        </section>

        {/* AI Provider */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Provider</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
              <select
                value={config?.aiProvider ?? 'auto'}
                onChange={e => update('aiProvider', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="auto">Auto-detect from API keys</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="gemini">Google (Gemini)</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Anthropic API Key</label>
                <input
                  type="password"
                  value={config?.anthropicApiKey ?? ''}
                  onChange={e => update('anthropicApiKey', e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">OpenAI API Key</label>
                <input
                  type="password"
                  value={config?.openaiApiKey ?? ''}
                  onChange={e => update('openaiApiKey', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Google AI API Key</label>
                <input
                  type="password"
                  value={config?.googleAiApiKey ?? ''}
                  onChange={e => update('googleAiApiKey', e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ollama URL</label>
                <input
                  type="text"
                  value={config?.ollamaUrl ?? ''}
                  onChange={e => update('ollamaUrl', e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MCP Server */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">MCP Server</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">onX MCP Server URL</label>
            <input
              type="text"
              value={config?.mcpServerUrl ?? ''}
              onChange={e => update('mcpServerUrl', e.target.value)}
              placeholder="http://mcp-server:8080"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </section>

        {/* Session */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Session & Limits</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Session TTL (minutes)</label>
              <input
                type="number"
                value={config?.sessionTtlMinutes ?? 30}
                onChange={e => update('sessionTtlMinutes', parseInt(e.target.value))}
                min={5}
                max={1440}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Messages per Session</label>
              <input
                type="number"
                value={config?.maxMessagesPerSession ?? 20}
                onChange={e => update('maxMessagesPerSession', parseInt(e.target.value))}
                min={5}
                max={200}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
