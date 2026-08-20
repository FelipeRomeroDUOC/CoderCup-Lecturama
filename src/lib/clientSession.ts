/**
 * Retrieves or creates a persistent anonymous user UUID in client localStorage.
 * Aligns client persistence with the server session model.
 */
export function getClientUserId(): string {
  if (typeof window === "undefined") return "default_user";

  const STORAGE_KEY = "codercup_user_id";
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 10) {
      return existing;
    }

    const newId = crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  } catch {
    return "default_user";
  }
}
