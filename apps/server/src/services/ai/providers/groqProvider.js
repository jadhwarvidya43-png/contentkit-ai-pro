'use strict';

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-70b-versatile';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  };
}

function buildBody(messages, options = {}) {
  return {
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens || 4096,
    response_format: { type: 'json_object' },
    ...(options.stream ? { stream: true } : {}),
  };
}

const groqProvider = {
  name: 'groq',

  isAvailable() {
    return Boolean(process.env.GROQ_API_KEY);
  },

  async generate(messages, options = {}) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(buildBody(messages, { ...options, stream: false })),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const choice = data.choices && data.choices[0];
    if (!choice) throw new Error('Groq returned no choices');

    return {
      content: choice.message.content,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
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
      throw new Error(`Groq stream error ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') return;

          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) yield { content: delta, done: false };
            if (parsed.x_groq?.usage) {
              yield {
                content: '',
                done: true,
                usage: {
                  inputTokens: parsed.x_groq.usage.prompt_tokens || 0,
                  outputTokens: parsed.x_groq.usage.completion_tokens || 0,
                  totalTokens: parsed.x_groq.usage.total_tokens || 0,
                },
              };
            }
          } catch (_) { /* skip malformed chunks */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

module.exports = groqProvider;
