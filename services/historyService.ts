import { HistoryItem } from '../types';

const KEY = 'pajakku_history_v1';

export const getHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
};

export const saveHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    timestamp: Date.now(),
  };
  // Keep only last 50 items to prevent storage bloat
  const updatedHistory = [newItem, ...history].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(updatedHistory));
  return newItem;
};

export const deleteHistoryItem = (id: string) => {
  const history = getHistory().filter(item => item.id !== id);
  localStorage.setItem(KEY, JSON.stringify(history));
  return history;
};

export const clearHistory = () => {
  localStorage.removeItem(KEY);
};