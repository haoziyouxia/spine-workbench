import React from 'react';
import { StepId } from '../hooks/useStep';
import { Part } from '../types/part';
import { Bone } from '../types/bone';
import PartsPanel from './PartsPanel';
import PartDetail from './PartDetail';
import BoneDetail from './BoneDetail';
import ExportPreview from './ExportPreview';
import MultiSelectActions from './MultiSelectActions';
import BonesPanel from './BonesPanel';

import { PartType } from '../types/part';

interface PropertyPanelProps {
  currentStep: StepId;
  projectName: string;
  imageSrc: string | null;
  parts: Part[];
  selectedPart: Part | null;
  selectedPartId: string | null;
  selectedPartIds: string[];
  onSelectPart: (partId: string, multiSelect: boolean) => void;
  onSelectParts: (partIds?: string[]) => void;
  onAddPart: (name: string, type: PartType) => void;
  onRenamePart: (partId: string, newName: string) => void;
  onToggleVisibility: (partId: string) => void;
  onBatchToggleVisibility: (partIds: string[]) => void;
  onUpdateZIndex: (partId: string, zIndex: number) => void;
  onUpdateBbox: (partId: string, x: number, y: number, width: number, height: number) => void;
  onSetPartBoneId: (partId: string, boneId: string | null) => void;
  onBatchSetBoneId: (partIds: string[], boneId: string | null) => void;
  onDuplicatePart: (partId: string) => void;
  onBatchDuplicateParts: (partIds: string[]) => void;
  onMoveUpPart: (partId: string) => void;
  onMoveDownPart: (partId: string) => void;
  onBringToFrontPart: (partId: string) => void;
  onSendToBackPart: (partId: string) => void;
  onDeletePart: (partId: string) => void;
  onBatchDeleteParts: (partIds: string[]) => void;
  bones: Bone[];
  selectedBone: Bone | null;
  selectedBoneId: string | null;
  onSelectBone: (boneId: string) => void;
  onUpdateBoneRotation: (boneId: string, rotation: number) => void;
  onUpdateBoneLength: (boneId: string, length: number) => void;
  onDeleteBone: (boneId: string) => void;
  onRenameBone?: (boneId: string, newName: string) => void;
  onLocate?: (relatedPartIds?: string[], relatedBoneIds?: string[]) => void;
  onLocateBone?: (boneId: string) => void;
  onNavigateToStep?: (step: StepId) => void;
  onBatchTogglePartVisibility?: (partIds: string[]) => void;
  onAutoGenerateBones?: () => void;
  onAddBone?: () => void;
  onConnectSelectedBone?: () => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  currentStep,
  projectName,
  imageSrc,
  parts,
  selectedPart,
  selectedPartId,
  selectedPartIds,
  onSelectPart,
  onSelectParts,
  onAddPart,
  onRenamePart,
  onToggleVisibility,
  onBatchToggleVisibility,
  onUpdateZIndex,
  onUpdateBbox,
  onSetPartBoneId,
  onBatchSetBoneId,
  onDuplicatePart,
  onBatchDuplicateParts,
  onMoveUpPart,
  onMoveDownPart,
  onBringToFrontPart,
  onSendToBackPart,
  onDeletePart,
  onBatchDeleteParts,
  bones,
  selectedBone,
  selectedBoneId,
  onSelectBone,
  onUpdateBoneRotation,
  onUpdateBoneLength,
  onDeleteBone,
  onRenameBone,
  onLocate,
  onLocateBone,
  onNavigateToStep,
  onBatchTogglePartVisibility,
  onAutoGenerateBones,
  onAddBone,
  onConnectSelectedBone
}) => {
  const isMultiSelect = selectedPartIds.length > 1;

  const renderPanelContent = () => {
    switch (currentStep) {
      case 'import':
        return (
          <>
            <div className="property-section">
              <h4>导入设置</h4>
              <div className="property-item">
                <span className="property-label">支持格式:</span>
                <span className="property-value">PNG</span>
              </div>
              <div className="property-item">
                <span className="property-label">建议尺寸:</span>
                <span className="property-value">1024 × 1024</span>
              </div>
              <div className="property-item">
                <span className="property-label">背景:</span>
                <span className="property-value">透明或纯色</span>
              </div>
            </div>
            <div className="property-section">
              <h4>操作提示</h4>
              <p className="hint-text">点击左侧「导入图片」按钮，选择角色 PNG 文件。</p>
            </div>
          </>
        );
      case 'parts':
      case 'correct':
        return (
          <>
            <PartsPanel
              parts={parts}
              selectedPartId={selectedPartId}
              selectedPartIds={selectedPartIds}
              onSelectPart={onSelectPart}
              onAddPart={onAddPart}
              bones={bones}
            />
            {isMultiSelect ? (
              <MultiSelectActions
                selectedPartIds={selectedPartIds}
                bones={bones}
                onBatchToggleVisibility={onBatchToggleVisibility}
                onBatchDuplicateParts={onBatchDuplicateParts}
                onBatchDeleteParts={onBatchDeleteParts}
                onBatchSetBoneId={onBatchSetBoneId}
              />
            ) : selectedPart ? (
              <PartDetail
                part={selectedPart}
                bones={bones}
                onRename={onRenamePart}
                onToggleVisibility={onToggleVisibility}
                onUpdateZIndex={onUpdateZIndex}
                onUpdateBbox={onUpdateBbox}
                onSetBoneId={onSetPartBoneId}
                onDuplicate={onDuplicatePart}
                onMoveUp={onMoveUpPart}
                onMoveDown={onMoveDownPart}
                onBringToFront={onBringToFrontPart}
                onSendToBack={onSendToBackPart}
                onDelete={onDeletePart}
              />
            ) : (
              <div className="property-section">
                <h4>操作提示</h4>
                <p className="hint-text">点击左侧部件列表中的部件查看详情。按住 Ctrl/Cmd 键可多选。</p>
              </div>
            )}
          </>
        );
      case 'bones':
        return (
          <>
            <div className="property-section property-section-featured bones-intro-section">
              <div className="section-header">
                <span className="section-icon">🦴</span>
                <div>
                  <h4>骨骼编辑</h4>
                  <span className="section-subtitle">绑定骨骼与部件的运动关系</span>
                </div>
                <span className="section-badge">当前步骤</span>
              </div>
              <div className="tool-buttons bones-tool-buttons">
                <button type="button" className="tool-btn primary" onClick={onAutoGenerateBones}>自动生成</button>
                <button type="button" className="tool-btn" onClick={onAddBone}>添加节点</button>
                <button type="button" className="tool-btn" onClick={onConnectSelectedBone}>连接节点</button>
              </div>
            </div>

            <BonesPanel
              bones={bones}
              parts={parts}
              selectedBoneId={selectedBoneId}
              onSelectBone={onSelectBone}
              onLocateBone={onLocateBone}
              onRenameBone={onRenameBone}
              onDeleteBone={onDeleteBone}
            />

            {selectedBone ? (
              <BoneDetail
                bone={selectedBone}
                parts={parts}
                onUpdateRotation={onUpdateBoneRotation}
                onUpdateLength={onUpdateBoneLength}
                onDelete={onDeleteBone}
              />
            ) : (
              <div className="property-section bones-empty-section">
                <div className="empty-state bones-empty-state">
                  <span className="empty-icon">🦴</span>
                  <h4>选择骨骼</h4>
                  <p>从上方列表选择一个骨骼</p>
                  <span className="empty-hint">选中后可查看详情并调整旋转、长度等属性</span>
                  <div className="empty-actions">
                    <button type="button" className="empty-action-btn" onClick={onAutoGenerateBones}>
                      <span>✨</span>
                      <span>自动生成骨骼</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case 'export':
        return (
          <ExportPreview
            projectName={projectName}
            parts={parts}
            bones={bones}
            imageSrc={imageSrc}
            onLocate={onLocate}
            onBatchAssignBone={onBatchSetBoneId}
            onNavigateToStep={onNavigateToStep}
            onBatchTogglePartVisibility={onBatchTogglePartVisibility}
            onSelectParts={onSelectParts}
            onSelectBone={onSelectBone}
          />
        );
      default:
        return null;
    }
  };

  const renderKeyboardShortcuts = () => (
    <div className="keyboard-shortcuts">
      <h4>快捷键</h4>
      <div className="shortcut-list">
        <div className="shortcut-item">
          <span className="shortcut-keys">Delete / Backspace</span>
          <span className="shortcut-desc">删除选中部件</span>
        </div>
        <div className="shortcut-item">
          <span className="shortcut-keys">Ctrl/Cmd + D</span>
          <span className="shortcut-desc">复制选中部件</span>
        </div>
        <div className="shortcut-item">
          <span className="shortcut-keys">Esc</span>
          <span className="shortcut-desc">退出创建模式 / 取消选择</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="property-panel">
      <h3>属性面板</h3>
      {renderPanelContent()}
      {!isMultiSelect && (currentStep === 'parts' || currentStep === 'correct') && renderKeyboardShortcuts()}
    </div>
  );
};

export default PropertyPanel;
