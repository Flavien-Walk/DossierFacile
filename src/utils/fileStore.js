'use strict';

/**
 * In-memory file store with TTL.
 * Files are stored in RAM only — never written to disk.
 * Each entry auto-deletes after TTL_MS milliseconds.
 */

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const store = new Map();

function set(token, data) {
  // Clear any existing timer for this token
  const existing = store.get(token);
  if (existing?.timer) clearTimeout(existing.timer);

  const timer = setTimeout(() => {
    store.delete(token);
  }, TTL_MS);

  store.set(token, { data, timer, createdAt: Date.now() });
}

function get(token) {
  const entry = store.get(token);
  if (!entry) return null;
  return entry.data;
}

function del(token) {
  const entry = store.get(token);
  if (entry?.timer) clearTimeout(entry.timer);
  store.delete(token);
}

module.exports = { set, get, del };
