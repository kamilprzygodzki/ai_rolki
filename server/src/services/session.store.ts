import { SessionState } from '../types';

const sessions = new Map<string, SessionState>();
const listeners = new Map<string, Set<(session: SessionState) => void>>();

export function getSession(id: string): SessionState | undefined {
  return sessions.get(id);
}

export function setSession(id: string, state: SessionState): void {
  sessions.set(id, state);
  notifyListeners(id, state);
}

export function updateSession(id: string, updates: Partial<SessionState>): SessionState | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  const updated = { ...session, ...updates };
  sessions.set(id, updated);
  notifyListeners(id, updated);
  return updated;
}

export function deleteSession(id: string): void {
  sessions.delete(id);
  listeners.delete(id);
}

export function subscribe(id: string, listener: (session: SessionState) => void): () => void {
  if (!listeners.has(id)) {
    listeners.set(id, new Set());
  }
  listeners.get(id)!.add(listener);
  return () => {
    listeners.get(id)?.delete(listener);
  };
}

function notifyListeners(id: string, session: SessionState): void {
  listeners.get(id)?.forEach((listener) => listener(session));
}

export function getAllSessions(): Map<string, SessionState> {
  return sessions;
}
