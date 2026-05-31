import React from 'react';
import { Part } from '../types/part';
import { Bone } from '../types/bone';
import { Step, steps } from '../hooks/useStep';
import { StepId } from '../hooks/useStep';

interface HistoryStatus {
  totalSteps: number;
  currentStep: number;
  atStart: boolean;
  atEnd: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

interface StatusBarProps {
  selectedPartIds: string[];
  parts: Part[];
  selectedBoneId: string | null;
  bones: Bone[];
  isCreatePartMode: boolean;
  currentStep: StepId;
  stepInfo: Step;
  onUndo?: () => void;
  onRedo?: () => void;
  historyStatus: HistoryStatus;
  isDirty: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({
  selectedPartIds,
  parts,
  selectedBoneId,
  bones,
  isCreatePartMode,
  currentStep,
  stepInfo,
  onUndo,
  onRedo,
  historyStatus,
  isDirty
}) => {
  const selectedParts = parts.filter(p => selectedPartIds.includes(p.id));
  const selectedBone = bones.find(b => b.id === selectedBoneId);
  const stepIndex = steps.findIndex(s => s.id === currentStep) + 1;

  const { totalSteps, currentStep: historyStep, atStart, atEnd, canUndo, canRedo } = historyStatus;

  const getModeText = () => {
    if (isCreatePartMode) return '创建部件模式';
    return '编辑模式';
  };

  const getSelectionText = () => {
    const partCount = selectedPartIds.length;
    const hasBoneSelection = selectedBoneId !== null;

    if (partCount === 0 && !hasBoneSelection) {
      return '未选择任何对象';
    }

    const partsText = partCount > 0 ? (
      partCount === 1
        ? `${selectedParts[0].name || '部件'}`
        : `${partCount} 个部件`
    ) : '';

    const boneText = hasBoneSelection
      ? `${selectedBone?.name || '骨骼'}`
      : '';

    const partsAndBone = [partsText, boneText].filter(Boolean);
    return partsAndBone.join(', ');
  };

  const getUndoTitle = () => {
    if (!canUndo) {
      return atStart ? '已到达历史开始' : '无可撤销操作';
    }
    return '撤销 (Ctrl+Z)';
  };

  const getRedoTitle = () => {
    if (!canRedo) {
      return atEnd ? '已到达历史末尾' : '无可重做操作';
    }
    return '重做 (Ctrl+Y)';
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-step">步骤 {stepIndex}: {stepInfo.name}</span>
        {isDirty && (
          <span className="status-dirty" title="有未保存的修改">
            ● 未保存
          </span>
        )}
      </div>

      <div className="status-center">
        <span className="selection-summary">
          {getSelectionText()}
        </span>
      </div>

      <div className="status-right">
        <div className="history-controls">
          <button
            className={`history-btn ${!canUndo ? 'disabled' : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title={getUndoTitle()}
          >
            ↩
          </button>
          {totalSteps > 0 && (
            <span className="history-counter">
              {historyStep}/{totalSteps}
            </span>
          )}
          <button
            className={`history-btn ${!canRedo ? 'disabled' : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title={getRedoTitle()}
          >
            ↪
          </button>
        </div>
        <span className={`status-mode ${isCreatePartMode ? 'active' : ''}`}>
          {getModeText()}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;