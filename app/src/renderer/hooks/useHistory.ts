import { useState, useCallback } from 'react';
import { Part } from '../types/part';

export interface HistoryState {
  parts: Part[];
  selectedPartId: string | null;
  selectedPartIds: string[];
}

interface HistoryAction {
  type: string;
  description: string;
}

const MAX_HISTORY = 50;

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentAction, setCurrentAction] = useState<HistoryAction | null>(null);

  const saveState = useCallback((state: HistoryState, action: HistoryAction) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ ...state, parts: JSON.parse(JSON.stringify(state.parts)) });

      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(-MAX_HISTORY);
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
    setCurrentAction(action);
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return null;

    const newIndex = historyIndex - 1;
    const previousState = history[newIndex];
    setHistoryIndex(newIndex);
    setCurrentAction({ type: 'undo', description: '撤销' });

    return previousState;
  }, [canUndo, historyIndex, history]);

  const redo = useCallback(() => {
    if (!canRedo) return null;

    const newIndex = historyIndex + 1;
    const nextState = history[newIndex];
    setHistoryIndex(newIndex);
    setCurrentAction({ type: 'redo', description: '重做' });

    return nextState;
  }, [canRedo, historyIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    setCurrentAction(null);
  }, []);

  const getHistoryInfo = useCallback(() => {
    return {
      canUndo,
      canRedo,
      currentAction,
      historyLength: history.length,
      currentIndex: historyIndex
    };
  }, [canUndo, canRedo, currentAction, history.length, historyIndex]);

  return {
    saveState,
    undo,
    redo,
    clearHistory,
    getHistoryInfo,
    canUndo,
    canRedo
  };
};