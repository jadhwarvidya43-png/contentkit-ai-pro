'use strict';

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const API_VERSION = '2023-06-01';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': API_VERSION,
  };
}

function buildBody(messages, options = {}) {
  const systemMsg = messages.find((m) => m.role === 'system');
  const nonSystem = messages.filter((m) => m.role !== 'system');

  return {
    model: options.model || DEFAULT_MODEL,
    max_tokens: options.maxTokens || 4096,
    temperature: options.temperature ?? 0.7,
    ...(systemMsg ? { system: systemMsg.content } : {}),
    messages: nonSystem.map((m) => ({ role: m.role, content: m.content })),
    ...(options.stream ? { stream: true } : {}),
  };
}

const claudeProvider = {
  name: 'claude',

  isAvailable() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async generate(messages, options = {}) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(buildBody(messages, { ...options, stream: false })),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const textBlock = (data.content || []).find((b) => b.type === 'text');
    if (!textBlock) throw new Error('Anthropic returned no text content');

    return {
      content: textBlock.text,
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  },

  async *generateStream(messages, options = {}) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(buildBody(messages, { ...options, stream: true })),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic stream error ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let usage = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield { content: parsed.delta.text, done: false };
            }
            if (parsed.type === 'message_delta' && parsed.usage) {
              usage = {
                inputTokens: parsed.usage.input_tokens || 0,
                outputTokens: parsed.usage.output_tokens || 0,
                totalTokens: (parsed.usage.input_tokens || 0) + (parsed.usage.output_tokens || 0),
              };
            }
            if (parsed.type === 'message_stop') {
              yield { content: '', done: true, usage };
              return;
            }
          } catch (_) { /* skip malformed chunks */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

module.exports = claudeProvider;
