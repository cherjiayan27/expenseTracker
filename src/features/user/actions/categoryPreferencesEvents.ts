"use client";

/**
 * Lightweight event emitter for category preference updates.
 * Replaces direct window-level custom events.
 */
const EVENT_NAME = "categoryPreferencesUpdated";
const emitter = new EventTarget();

export function emitCategoryPreferencesUpdated() {
  emitter.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeCategoryPreferencesUpdated(handler: () => void) {
  emitter.addEventListener(EVENT_NAME, handler);
  return () => emitter.removeEventListener(EVENT_NAME, handler);
}

