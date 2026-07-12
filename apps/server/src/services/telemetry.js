const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const Sentry = require('@sentry/node');
const config = require('../config');

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  serviceName: config.app.name || 'contentkit-ai-pro',
  traceExporter: new (require('@opentelemetry/sdk-trace-base').ConsoleSpanExporter)(), // Stub exporter
  instrumentations: [getNodeAutoInstrumentations()]
});

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: config.app.env,
  tracesSampleRate: 1.0,
});

module.exports = {
  startTelemetry: () => {
    try {
      sdk.start();
      console.log('[Telemetry] OpenTelemetry initialized');
    } catch (error) {
      console.error('[Telemetry] Failed to initialize OpenTelemetry', error);
    }
  },
  shutdownTelemetry: () => {
    sdk.shutdown()
      .then(() => console.log('[Telemetry] OpenTelemetry shut down successfully'))
      .catch((error) => console.log('[Telemetry] Error shutting down OpenTelemetry', error))
      .finally(() => process.exit(0));
  },
  Sentry
};
