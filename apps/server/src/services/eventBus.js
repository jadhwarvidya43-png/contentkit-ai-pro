const { EventEmitter } = require('events');

const EVENT_NAMES = {
  PROJECT_CREATED: 'project:created',
  PROJECT_DELETED: 'project:deleted',
  BRANDKIT_UPDATED: 'brandkit:updated',
  AI_JOB_COMPLETED: 'ai:job:completed',
  AI_JOB_FAILED: 'ai:job:failed',
  CONTENT_PUBLISHED: 'content:published',
  WORKFLOW_EXECUTED: 'workflow:executed',
  USER_INVITED: 'user:invited',
  WORKSPACE_CREATED: 'workspace:created'
};

class ContentKitEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this._handlerErrors = [];
  }

  emit(eventName, payload) {
    const listeners = this.listeners(eventName);
    if (listeners.length === 0) {
      return false;
    }

    for (const handler of listeners) {
      try {
        const result = handler(payload);
        if (result && typeof result.catch === 'function') {
          result.catch((err) => {
            console.error(
              `[EventBus] Async handler error for "${eventName}":`,
              err.message
            );
            this._handlerErrors.push({ eventName, error: err, timestamp: new Date() });
          });
        }
      } catch (err) {
        console.error(
          `[EventBus] Sync handler error for "${eventName}":`,
          err.message
        );
        this._handlerErrors.push({ eventName, error: err, timestamp: new Date() });
      }
    }
    return true;
  }

  on(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a function');
    }
    super.on(eventName, handler);
    return this;
  }

  once(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a function');
    }
    super.once(eventName, handler);
    return this;
  }

  getErrors() {
    return [...this._handlerErrors];
  }

  clearErrors() {
    this._handlerErrors = [];
  }
}

const eventBus = new ContentKitEventBus();

module.exports = { eventBus, EVENT_NAMES };
