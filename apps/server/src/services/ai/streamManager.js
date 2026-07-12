'use strict';

/**
 * Creates an SSE (Server-Sent Events) stream writer bound to an Express response.
 *
 * @param {import('express').Response} res – Express response object
 * @returns {{ send: function, sendError: function, close: function }}
 */
function createSSEStream(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable nginx buffering
  });
  res.flushHeaders();

  let closed = false;

  return {
    /**
     * Sends a named SSE event with a JSON-serialized data payload.
     */
    send(data, event = 'message') {
      if (closed) return;
      if (event !== 'message') res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    },

    /**
     * Sends an error event and closes the stream.
     */
    sendError(error) {
      if (closed) return;
      const message = error instanceof Error ? error.message : String(error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
      this.close();
    },

    /**
     * Sends the [DONE] sentinel and ends the response.
     */
    close() {
      if (closed) return;
      closed = true;
      res.write('data: [DONE]\n\n');
      res.end();
    },
  };
}

/**
 * Reads an async iterator from a provider's generateStream and pipes
 * each chunk into the SSE stream. Sends usage metadata on completion.
 *
 * @param {AsyncIterable} providerStream – async iterable yielding { content, done, usage? }
 * @param {{ send: function, sendError: function, close: function }} sseStream
 * @returns {Promise<{ fullContent: string, usage: object|null }>}
 */
async function pipeProviderStream(providerStream, sseStream) {
  let fullContent = '';
  let finalUsage = null;

  try {
    for await (const chunk of providerStream) {
      if (chunk.content) {
        fullContent += chunk.content;
        sseStream.send({ content: chunk.content });
      }
      if (chunk.done && chunk.usage) {
        finalUsage = chunk.usage;
        sseStream.send({ usage: chunk.usage }, 'metadata');
      }
    }
    sseStream.close();
  } catch (err) {
    sseStream.sendError(err);
    throw err;
  }

  return { fullContent, usage: finalUsage };
}

module.exports = { createSSEStream, pipeProviderStream };
