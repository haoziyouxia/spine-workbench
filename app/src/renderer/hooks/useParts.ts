import { useState, useCallback } from 'react';
import { Part } from '../types/part';
import { mockParts } from '../data/mockParts';

interface HistoryState {
  parts: Part[];
  selectedPartId: string | null;
  selectedPartIds: string[];
}

const MAX_HISTORY = 50;

export const useParts = () => {
  const [parts, setParts] = useState<Part[]>(mockParts);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selectedPart = parts.find(p => p.id === selectedPartId) || null;
  const selectedParts = parts.filter(p => selectedPartIds.includes(p.id));

  const saveState = useCallback((actionDescription: string) => {
    const state: HistoryState = {
      parts: JSON.parse(JSON.stringify(parts)),
      selectedPartId,
      selectedPartIds: [...selectedPartIds]
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);

      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(-MAX_HISTORY);
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [parts, selectedPartId, selectedPartIds, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return;

    const newIndex = historyIndex - 1;
    const previousState = history[newIndex];

    setParts(previousState.parts);
    setSelectedPartId(previousState.selectedPartId);
    setSelectedPartIds(previousState.selectedPartIds);
    setHistoryIndex(newIndex);
  }, [canUndo, historyIndex, history]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    const newIndex = historyIndex + 1;
    const nextState = history[newIndex];

    setParts(nextState.parts);
    setSelectedPartId(nextState.selectedPartId);
    setSelectedPartIds(nextState.selectedPartIds);
    setHistoryIndex(newIndex);
  }, [canRedo, historyIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const getHistoryStatus = useCallback(() => {
    const totalSteps = history.length;
    const currentStep = historyIndex + 1;
    const atStart = historyIndex <= 0;
    const atEnd = historyIndex >= history.length - 1;

    return {
      totalSteps,
      currentStep,
      atStart,
      atEnd,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1
    };
  }, [history.length, historyIndex]);

  const loadParts = useCallback((newParts: Part[]) => {
    saveState('加载部件');
    setParts(newParts);
    setSelectedPartId(null);
    setSelectedPartIds([]);
  }, [saveState]);

  const selectPart = useCallback((partId: string | null, multiSelect: boolean = false, newSelection?: string[]) => {
    if (!partId) {
      setSelectedPartId(null);
      setSelectedPartIds([]);
      return;
    }

    if (newSelection && newSelection.length > 0) {
      setSelectedPartId(partId);
      setSelectedPartIds(newSelection);
      return;
    }

    if (multiSelect) {
      setSelectedPartId(partId);
      setSelectedPartIds(prev => {
        if (prev.includes(partId)) {
          return prev.filter(id => id !== partId);
        }
        return [...prev, partId];
      });
    } else {
      setSelectedPartId(partId);
      setSelectedPartIds([partId]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPartId(null);
    setSelectedPartIds([]);
  }, []);

  const renamePart = useCallback((partId: string, newName: string) => {
    saveState(`重命名部件: ${newName}`);
    setParts(prev => prev.map(p =>
      p.id === partId ? { ...p, name: newName } : p
    ));
  }, [saveState]);

  const toggleVisibility = useCallback((partId: string) => {
    saveState('切换可见性');
    setParts(prev => prev.map(p =>
      p.id === partId ? { ...p, visible: !p.visible } : p
    ));
  }, [saveState]);

  const batchToggleVisibility = useCallback((partIds: string[]) => {
    saveState('批量切换可见性');
    setParts(prev => prev.map(p =>
      partIds.includes(p.id) ? { ...p, visible: !p.visible } : p
    ));
  }, [saveState]);

  const setAllVisibility = useCallback((visible: boolean) => {
    saveState(`设置所有部件${visible ? '可见' : '隐藏'}`);
    setParts(prev => prev.map(p => ({ ...p, visible })));
  }, [saveState]);

  const updateZIndex = useCallback((partId: string, zIndex: number) => {
    saveState('调整层级');
    setParts(prev => prev.map(p =>
      p.id === partId ? { ...p, zIndex } : p
    ));
  }, [saveState]);

  const deletePart = useCallback((partId: string) => {
    saveState('删除部件');
    setParts(prev => prev.filter(p => p.id !== partId));
    if (selectedPartId === partId) {
      setSelectedPartId(null);
    }
    setSelectedPartIds(prev => prev.filter(id => id !== partId));
  }, [selectedPartId, saveState]);

  const batchDeleteParts = useCallback((partIds: string[]) => {
    saveState('批量删除部件');
    setParts(prev => prev.filter(p => !partIds.includes(p.id)));
    if (partIds.includes(selectedPartId || '')) {
      setSelectedPartId(null);
    }
    setSelectedPartIds([]);
  }, [selectedPartId, saveState]);

  const mergeParts = useCallback((partIds: string[]) => {
    const selectedParts = parts.filter(p => partIds.includes(p.id));
    if (selectedParts.length < 2) return;

    saveState('合并部件');

    const firstPart = selectedParts[0];
    const mergedPart: Part = {
      ...firstPart,
      id: `merged-${Date.now()}`,
      name: selectedParts.map(p => p.name).join('_'),
      x: Math.min(...selectedParts.map(p => p.x)),
      y: Math.min(...selectedParts.map(p => p.y)),
      width: Math.max(...selectedParts.map(p => p.x + p.width)) - Math.min(...selectedParts.map(p => p.x)),
      height: Math.max(...selectedParts.map(p => p.y + p.height)) - Math.min(...selectedParts.map(p => p.y)),
      zIndex: Math.max(...selectedParts.map(p => p.zIndex)),
      boneId: null
    };

    setParts(prev => [
      ...prev.filter(p => !partIds.includes(p.id)),
      mergedPart
    ]);
    setSelectedPartId(mergedPart.id);
    setSelectedPartIds([mergedPart.id]);
  }, [parts, saveState]);

  const reorderParts = useCallback((partId: string, newIndex: number) => {
    saveState('重新排序');
    setParts(prev => {
      const currentIndex = prev.findIndex(p => p.id === partId);
      if (currentIndex === newIndex) return prev;

      const newParts = [...prev];
      const [removed] = newParts.splice(currentIndex, 1);
      newParts.splice(newIndex, 0, removed);

      return newParts.map((p, idx) => ({ ...p, zIndex: idx + 1 }));
    });
  }, [saveState]);

  const addPart = useCallback((name: string, type: Part['type']) => {
    saveState('添加部件');
    const newPart: Part = {
      id: `part-${Date.now()}`,
      name,
      type,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: parts.length + 1,
      visible: true,
      boneId: null
    };
    setParts(prev => [...prev, newPart]);
    setSelectedPartId(newPart.id);
    setSelectedPartIds([newPart.id]);
    return newPart;
  }, [parts.length, saveState]);

  const createPart = useCallback((x: number, y: number, width: number, height: number) => {
    saveState('创建部件');
    const newPart: Part = {
      id: `part-${Date.now()}`,
      name: `part_${parts.length + 1}`,
      type: 'body',
      x,
      y,
      width,
      height,
      zIndex: parts.length + 1,
      visible: true,
      boneId: null
    };
    setParts(prev => [...prev, newPart]);
    setSelectedPartId(newPart.id);
    setSelectedPartIds([newPart.id]);
    return newPart;
  }, [parts.length, saveState]);

  const setPartBoneId = useCallback((partId: string, boneId: string | null) => {
    saveState('关联骨骼');
    setParts(prev => prev.map(p =>
      p.id === partId ? { ...p, boneId } : p
    ));
  }, [saveState]);

  const batchSetPartBoneId = useCallback((partIds: string[], boneId: string | null) => {
    saveState('批量关联骨骼');
    setParts(prev => prev.map(p =>
      partIds.includes(p.id) ? { ...p, boneId } : p
    ));
  }, [saveState]);

  const updateBbox = useCallback((partId: string, x: number, y: number, width: number, height: number) => {
    saveState('调整边界框');
    setParts(prev => prev.map(p =>
      p.id === partId ? { ...p, x, y, width, height } : p
    ));
  }, [saveState]);

  const generateCopyName = (baseName: string, existingNames: string[]): string => {
    const copyPattern = /_copy(\d+)?$/;
    const match = baseName.match(copyPattern);

    let base: string;
    let currentNum: number;

    if (match) {
      base = baseName.substring(0, match.index);
      currentNum = match[1] ? parseInt(match[1], 10) : 1;
    } else {
      base = baseName;
      currentNum = 0;
    }

    let newNum = currentNum + 1;
    let newName = `${base}_copy${newNum}`;

    while (existingNames.includes(newName)) {
      newNum++;
      newName = `${base}_copy${newNum}`;
    }

    return newName;
  };

  const duplicatePart = useCallback((partId: string) => {
    const partToDuplicate = parts.find(p => p.id === partId);
    if (!partToDuplicate) return;

    saveState('复制部件');

    const existingNames = parts.map(p => p.name);
    const newName = generateCopyName(partToDuplicate.name, existingNames);

    const newPart: Part = {
      ...partToDuplicate,
      id: `part-${Date.now()}`,
      name: newName,
      x: partToDuplicate.x + 20,
      y: partToDuplicate.y + 20,
      zIndex: parts.length + 1,
      boneId: null
    };

    setParts(prev => [...prev, newPart]);
    setSelectedPartId(newPart.id);
    setSelectedPartIds([newPart.id]);
    return newPart;
  }, [parts, saveState]);

  const batchDuplicateParts = useCallback((partIds: string[]) => {
    const partsToDuplicate = parts.filter(p => partIds.includes(p.id));
    if (partsToDuplicate.length === 0) return;

    saveState('批量复制部件');

    const existingNames = parts.map(p => p.name);
    let allNames = [...existingNames];

    const newParts: Part[] = partsToDuplicate.map((part, index) => {
      const newName = generateCopyName(part.name, allNames);
      allNames.push(newName);

      return {
        ...part,
        id: `part-${Date.now()}-${index}`,
        name: newName,
        x: part.x + 20 * (index + 1),
        y: part.y + 20 * (index + 1),
        zIndex: parts.length + index + 1,
        boneId: null
      };
    });

    setParts(prev => [...prev, ...newParts]);
    const newIds = newParts.map(p => p.id);
    setSelectedPartId(newIds[0]);
    setSelectedPartIds(newIds);
    return newParts;
  }, [parts, saveState]);

  const bringToFront = useCallback((partId: string) => {
    saveState('置顶');
    const maxZIndex = Math.max(...parts.map(p => p.zIndex));
    updateZIndex(partId, maxZIndex + 1);
  }, [parts, saveState]);

  const sendToBack = useCallback((partId: string) => {
    saveState('置底');
    const minZIndex = Math.min(...parts.map(p => p.zIndex));
    updateZIndex(partId, minZIndex - 1);
  }, [parts, saveState]);

  const moveUp = useCallback((partId: string) => {
    saveState('上移一层');
    setParts(prev => {
      const part = prev.find(p => p.id === partId);
      if (!part) return prev;

      const currentZ = part.zIndex;
      const partsWithHigherZ = prev.filter(p => p.zIndex > currentZ);

      if (partsWithHigherZ.length === 0) return prev;

      const nextHigherZ = Math.min(...partsWithHigherZ.map(p => p.zIndex));
      const partToSwap = prev.find(p => p.zIndex === nextHigherZ);

      return prev.map(p => {
        if (p.id === partId) return { ...p, zIndex: nextHigherZ };
        if (partToSwap && p.id === partToSwap.id) return { ...p, zIndex: currentZ };
        return p;
      });
    });
  }, [saveState]);

  const moveDown = useCallback((partId: string) => {
    saveState('下移一层');
    setParts(prev => {
      const part = prev.find(p => p.id === partId);
      if (!part) return prev;

      const currentZ = part.zIndex;
      const partsWithLowerZ = prev.filter(p => p.zIndex < currentZ);

      if (partsWithLowerZ.length === 0) return prev;

      const nextLowerZ = Math.max(...partsWithLowerZ.map(p => p.zIndex));
      const partToSwap = prev.find(p => p.zIndex === nextLowerZ);

      return prev.map(p => {
        if (p.id === partId) return { ...p, zIndex: nextLowerZ };
        if (partToSwap && p.id === partToSwap.id) return { ...p, zIndex: currentZ };
        return p;
      });
    });
  }, [saveState]);

  return {
    parts,
    selectedPart,
    selectedPartId,
    selectedParts,
    selectedPartIds,
    selectPart,
    clearSelection,
    renamePart,
    toggleVisibility,
    batchToggleVisibility,
    setAllVisibility,
    updateZIndex,
    deletePart,
    batchDeleteParts,
    mergeParts,
    reorderParts,
    loadParts,
    addPart,
    createPart,
    updateBbox,
    duplicatePart,
    batchDuplicateParts,
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
    setPartBoneId,
    batchSetPartBoneId,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistoryStatus
  };
};