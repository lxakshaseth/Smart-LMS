/* Tiny shared topic store — AITutor writes, YouTube reads */

const KEY = "lms_ai_topics";

export function pushTopic(query: string) {
  const existing: string[] = getTopics();
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return;
  const updated = [trimmed, ...existing.filter(t => t !== trimmed)].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("lms_topics_updated", { detail: updated }));
}

export function getTopics(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

export function clearTopics() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("lms_topics_updated", { detail: [] }));
}
