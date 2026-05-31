import { useState, useCallback, useRef } from 'react';
import { Bone } from '../types/bone';
import { mockBones } from '../data/mockBones';

const cloneMockBones = (): Bone[] => mockBones.map(bone => ({ ...bone }));

interface BoneOperation {
  type: 'create' | 'delete' | 'update' | 'connect' | 'select' | 'reset';
  timestamp: number;
  boneId?: string;
  previousState?: Bone | Bone[] | string | null;
  newState?: Bone | Bone[] | Partial<Bone> | string | null;
  details?: string;
}

interface ErrorRecovery {
  lastValidState: Bone[] | null;
  lastValidSelection: string | null;
  errorLog: Array<{ timestamp: number; message: string; details?: string }>;
}

export const useBones = () => {
  const [bones, setBones] = useState<Bone[]>(cloneMockBones());
  const [selectedBoneId, setSelectedBoneId] = useState<string | null>(null);

  const operationHistoryRef = useRef<BoneOperation[]>([]);
  const errorRecoveryRef = useRef<ErrorRecovery>({
    lastValidState: null,
    lastValidSelection: null,
    errorLog: []
  });

  const logError = (message: string, details?: string) => {
    errorRecoveryRef.current.errorLog.push({
      timestamp: Date.now(),
      message,
      details
    });
    console.error(`[Bone Error ${new Date().toISOString()}] ${message}`, details || '');
  };

  const saveValidState = (currentBones: Bone[], currentSelection: string | null) => {
    errorRecoveryRef.current.lastValidState = currentBones.map(b => ({ ...b }));
    errorRecoveryRef.current.lastValidSelection = currentSelection;
  };

  const recordOperation = (
    type: BoneOperation['type'],
    boneId?: string,
    previousState?: Bone | Bone[] | string | null,
    newState?: Bone | Bone[] | Partial<Bone> | string | null,
    details?: string
  ) => {
    operationHistoryRef.current.push({
      type,
      timestamp: Date.now(),
      boneId,
      previousState,
      newState,
      details
    });
    if (operationHistoryRef.current.length > 100) {
      operationHistoryRef.current.shift();
    }
  };

  const selectedBone = bones.find(b => b.id === selectedBoneId) || null;

  const loadBones = useCallback((newBones: Bone[]) => {
    try {
      if (!Array.isArray(newBones)) {
        throw new Error('Invalid bones data: expected array');
      }
      saveValidState(bones, selectedBoneId);
      recordOperation('reset', undefined, bones, newBones, 'loadBones');
      setBones(newBones);
      setSelectedBoneId(null);
    } catch (error) {
      logError('Failed to load bones', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones, selectedBoneId]);

  const resetBones = useCallback(() => {
    try {
      const baseline = cloneMockBones();
      saveValidState(bones, selectedBoneId);
      recordOperation('reset', undefined, bones, baseline, 'resetBones');
      setBones(baseline);
      setSelectedBoneId(baseline[0]?.id ?? null);
    } catch (error) {
      logError('Failed to reset bones', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones, selectedBoneId]);

  const selectBone = useCallback((boneId: string | null) => {
    try {
      const previousSelection = selectedBoneId;
      if (boneId !== null) {
        const boneExists = bones.some(b => b.id === boneId);
        if (!boneExists) {
          logError('Selection failed: bone not found', boneId);
          if (errorRecoveryRef.current.lastValidSelection) {
            setSelectedBoneId(errorRecoveryRef.current.lastValidSelection);
            recordOperation('select', errorRecoveryRef.current.lastValidSelection || undefined, previousSelection, errorRecoveryRef.current.lastValidSelection || undefined, 'fallback to last valid');
          }
          return;
        }
      }
      saveValidState(bones, boneId);
      recordOperation('select', boneId || undefined, previousSelection, boneId || undefined);
      setSelectedBoneId(boneId);
    } catch (error) {
      logError('Failed to select bone', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones, selectedBoneId]);

  const updateBonePosition = useCallback((boneId: string, x: number, y: number) => {
    try {
      const bone = bones.find(b => b.id === boneId);
      if (!bone) {
        logError('Update position failed: bone not found', boneId);
        throw new Error(`Bone ${boneId} not found`);
      }
      const previousState = { ...bone };
      recordOperation('update', boneId, previousState, { x, y }, 'updateBonePosition');
      setBones(prev => prev.map(b =>
        b.id === boneId ? { ...b, x, y } : b
      ));
    } catch (error) {
      logError('Failed to update bone position', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones]);

  const updateBoneRotation = useCallback((boneId: string, rotation: number) => {
    try {
      const bone = bones.find(b => b.id === boneId);
      if (!bone) {
        logError('Update rotation failed: bone not found', boneId);
        throw new Error(`Bone ${boneId} not found`);
      }
      const previousState = { ...bone };
      recordOperation('update', boneId, previousState, { rotation }, 'updateBoneRotation');
      setBones(prev => prev.map(b =>
        b.id === boneId ? { ...b, rotation } : b
      ));
    } catch (error) {
      logError('Failed to update bone rotation', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones]);

  const updateBoneLength = useCallback((boneId: string, length: number) => {
    try {
      const bone = bones.find(b => b.id === boneId);
      if (!bone) {
        logError('Update length failed: bone not found', boneId);
        throw new Error(`Bone ${boneId} not found`);
      }
      const previousState = { ...bone };
      recordOperation('update', boneId, previousState, { length }, 'updateBoneLength');
      setBones(prev => prev.map(b =>
        b.id === boneId ? { ...b, length } : b
      ));
    } catch (error) {
      logError('Failed to update bone length', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones]);

  const addBone = useCallback((x: number, y: number): string => {
    try {
      const newBone: Bone = {
        id: `bone-${Date.now()}`,
        name: `bone_${bones.length + 1}`,
        x,
        y,
        parentId: null,
        length: 50,
        rotation: 0
      };
      recordOperation('create', newBone.id, null, newBone, 'addBone');
      setBones(prev => [...prev, newBone]);
      setSelectedBoneId(newBone.id);
      saveValidState([...bones, newBone], newBone.id);
      return newBone.id;
    } catch (error) {
      logError('Failed to add bone', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones.length]);

  const deleteBone = useCallback((boneId: string) => {
    try {
      const bone = bones.find(b => b.id === boneId);
      if (!bone) {
        logError('Delete failed: bone not found', boneId);
        throw new Error(`Bone ${boneId} not found`);
      }
      recordOperation('delete', boneId, bone, null, 'deleteBone');
      const previousSelection = selectedBoneId;
      setBones(prev => prev.filter(b => b.id !== boneId));
      if (selectedBoneId === boneId) {
        const remainingBones = bones.filter(b => b.id !== boneId);
        const fallbackId = remainingBones[remainingBones.length - 1]?.id ?? null;
        setSelectedBoneId(fallbackId);
        saveValidState(remainingBones, fallbackId);
        recordOperation('select', fallbackId, previousSelection, fallbackId, 'fallback after delete');
      }
    } catch (error) {
      logError('Failed to delete bone', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones, selectedBoneId]);

  const renameBone = useCallback((boneId: string, newName: string) => {
    try {
      const bone = bones.find(b => b.id === boneId);
      if (!bone) {
        logError('Rename failed: bone not found', boneId);
        throw new Error(`Bone ${boneId} not found`);
      }
      const previousState = { ...bone };
      recordOperation('update', boneId, previousState, { name: newName }, 'renameBone');
      setBones(prev => prev.map(b =>
        b.id === boneId ? { ...b, name: newName } : b
      ));
    } catch (error) {
      logError('Failed to rename bone', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [bones]);

  const connectBones = useCallback((parentId: string, childId: string): boolean => {
    try {
      if (parentId === childId) {
        logError('Connect failed: cannot connect bone to itself', `${parentId} -> ${childId}`);
        return false;
      }

      const parent = bones.find(b => b.id === parentId);
      const child = bones.find(b => b.id === childId);
      if (!parent || !child) {
        logError('Connect failed: bone not found', `parent=${parentId}, child=${childId}`);
        return false;
      }

      if (child.parentId === parentId) {
        logError('Connect failed: already connected', `${parentId} -> ${childId}`);
        return false;
      }

      let cursor: Bone | undefined = parent;
      while (cursor?.parentId) {
        if (cursor.parentId === childId) {
          logError('Connect failed: would create circular reference', `${parentId} -> ${childId}`);
          return false;
        }
        cursor = bones.find(b => b.id === cursor?.parentId);
      }

      const previousState = { ...child };
      recordOperation('connect', childId, previousState, { parentId }, 'connectBones');
      setBones(prev => prev.map(b =>
        b.id === childId ? { ...b, parentId } : b
      ));
      saveValidState(bones, selectedBoneId);
      return true;
    } catch (error) {
      logError('Failed to connect bones', error instanceof Error ? error.message : String(error));
      return false;
    }
  }, [bones, selectedBoneId]);

  const getConnections = useCallback(() => {
    return bones
      .filter(bone => bone.parentId !== null)
      .map(bone => ({
        fromId: bone.parentId!,
        toId: bone.id
      }));
  }, [bones]);

  const getParentBone = useCallback((boneId: string) => {
    const bone = bones.find(b => b.id === boneId);
    if (!bone || !bone.parentId) return null;
    return bones.find(b => b.id === bone.parentId) || null;
  }, [bones]);

  const getChildBones = useCallback((parentId: string) => {
    return bones.filter(bone => bone.parentId === parentId);
  }, [bones]);

  const getErrorLog = useCallback(() => {
    return errorRecoveryRef.current.errorLog;
  }, []);

  const getOperationHistory = useCallback(() => {
    return operationHistoryRef.current;
  }, []);

  const recoverToLastValid = useCallback(() => {
    const recovery = errorRecoveryRef.current;
    if (recovery.lastValidState && recovery.lastValidSelection) {
      setBones(recovery.lastValidState);
      setSelectedBoneId(recovery.lastValidSelection);
      recordOperation('reset', undefined, bones, recovery.lastValidState, 'recoverToLastValid');
      return true;
    }
    return false;
  }, [bones]);

  return {
    bones,
    selectedBone,
    selectedBoneId,
    selectBone,
    updateBonePosition,
    updateBoneRotation,
    updateBoneLength,
    addBone,
    deleteBone,
    renameBone,
    connectBones,
    getConnections,
    getParentBone,
    getChildBones,
    loadBones,
    resetBones,
    getErrorLog,
    getOperationHistory,
    recoverToLastValid
  };
};
