/**
 * LocalStorage persistence for mock/runtime data.
 * Ensures all user changes survive page refresh and are visible across sessions.
 */

const STORAGE_PREFIX = 'xpect_portal_';

export function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save to localStorage:', key, e);
  }
}
