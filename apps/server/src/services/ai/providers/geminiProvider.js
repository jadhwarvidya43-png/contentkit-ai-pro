'use strict';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash';

function buildUrl(model, stream) {
  const action = stream ? 'streamGenerateContent?alt=sse&' : 'generateContent?';
  return `${BASE_URL}/${model}:${action}key=${process.env.GEMINI_API_KEY}`;
}

function buildBody(messages, options = {}) {
  const systemMsg = messages.find((m) => m.role === 'system');
  const others = messages.filter((m) => m.role !== 'system');
  const contents = others.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return {
    ...(systemMsg ? { system_instruction: { parts: [{ text: systemMsg.content }] } } : {}),
    contents,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens || 4096,
    },
  };
}

const geminiProvider = {
  name: 'gemini',

  isAvailable() {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  async generate(messages, options = {}) {
    const model = options.model || DEFAULT_MODEL;
    const res = await fetch(buildUrl(model, false), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(messages, options)),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned no content');

    return {
      content: text,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  },

  async *generateStream(messages, options = {}) {
    const model = options.model || DEFAULT_MODEL;
    const res = await fetch(buildUrl(model, true), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(messages, options)),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini stream error ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lastUsage = null;

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
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield { content: text, done: false };
            if (parsed.usageMetadata) {
              lastUsage = {
                inputTokens: parsed.usageMetadata.promptTokenCount || 0,
                outputTokens: parsed.usageMetadata.candidatesTokenCount || 0,
                totalTokens: parsed.usageMetadata.totalTokenCount || 0,
              };
            }
          } catch (_) { /* skip malformed */ }
        }
      }
      if (lastUsage) yield { content: '', done: true, usage: lastUsage };
    } finally {
      reader.releaseLock();
    }
  },
};

module.exports = geminiProvider;
