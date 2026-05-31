import React, { useState } from 'react';
import { Bone } from '../types/bone';
import { Part } from '../types/part';

interface BonesPanelProps {
  bones: Bone[];
  parts: Part[];
  selectedBoneId: string | null;
  onSelectBone: (boneId: string) => void;
  onLocateBone?: (boneId: string) => void;
  onRenameBone?: (boneId: string, newName: string) => void;
  onDeleteBone?: (boneId: string) => void;
}

const BonesPanel: React.FC<BonesPanelProps> = ({
  bones,
  parts,
  selectedBoneId,
  onSelectBone,
  onLocateBone,
  onRenameBone,
  onDeleteBone
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const getPartCountForBone = (boneId: string): number => {
    return parts.filter(p => p.boneId === boneId).length;
  };

  const getParentBoneName = (parentId: string | null): string => {
    if (!parentId) return '';
    const parent = bones.find(b => b.id === parentId);
    return parent?.name || '';
  };

  const handleBoneClick = (boneId: string) => {
    if (editingId !== boneId) {
      onSelectBone(boneId);
      onLocateBone?.(boneId);
    }
  };

  const handleDoubleClick = (bone: Bone) => {
    setEditingId(bone.id);
    setEditName(bone.name);
  };

  const focusBoneItem = (index: number) => {
    requestAnimationFrame(() => {
      const item = document.querySelector<HTMLElement>(`[data-bone-index="${index}"]`);
      item?.focus();
    });
  };

  const handleBlur = () => {
    if (editingId && editName.trim()) {
      onRenameBone?.(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, boneId: string) => {
    if (e.key === 'Enter') {
      if (editName.trim()) {
        onRenameBone?.(boneId, editName.trim());
      }
      setEditingId(null);
      setEditName('');
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditName('');
    }
  };

  const confirmDeleteBone = (boneId: string) => {
    const partCount = getPartCountForBone(boneId);
    const confirmMessage = partCount > 0
      ? `该骨骼关联了 ${partCount} 个部件，确定要删除吗？`
      : '确定要删除这个骨骼吗？';

    if (confirm(confirmMessage)) {
      onDeleteBone?.(boneId);
    }
  };

  const handleDelete = (e: React.MouseEvent, boneId: string) => {
    e.stopPropagation();
    confirmDeleteBone(boneId);
  };

  const handleLocate = (e: React.MouseEvent, boneId: string) => {
    e.stopPropagation();
    onLocateBone?.(boneId);
  };

  const handleBoneItemKeyDown = (e: React.KeyboardEvent, bone: Bone, index: number) => {
    if (editingId === bone.id) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBoneClick(bone.id);
      return;
    }

    if (e.key === 'F2') {
      e.preventDefault();
      handleDoubleClick(bone);
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      confirmDeleteBone(bone.id);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const direction = e.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (index + direction + bones.length) % bones.length;
      const nextBone = bones[nextIndex];
      onSelectBone(nextBone.id);
      onLocateBone?.(nextBone.id);
      focusBoneItem(nextIndex);
    }
  };

  return (
    <div className="bones-panel property-section">
      <div className="section-header bones-header">
        <span className="section-icon">📋</span>
        <div>
          <h4>骨骼列表</h4>
          <span className="section-subtitle">{bones.length} 个骨骼</span>
        </div>
      </div>

      <div
        className="bones-list"
        role="listbox"
        aria-label="骨骼列表，使用上下方向键切换，回车选择，F2 重命名，Delete 删除"
      >
        {bones.length === 0 ? (
          <div className="empty-state bones-empty-state">
            <span className="empty-icon">🦴</span>
            <p>当前还没有骨骼</p>
            <span className="empty-hint">使用上方「自动生成」按钮创建骨骼，或手动添加节点</span>
          </div>
        ) : bones.map((bone, index) => {
          const partCount = getPartCountForBone(bone.id);
          const parentName = getParentBoneName(bone.parentId);
          const isEditing = editingId === bone.id;
          const isRoot = !bone.parentId;
          const isSelected = selectedBoneId === bone.id;
          const itemAriaLabel = [
            bone.name,
            isRoot ? '根骨骼' : `父骨骼 ${parentName || '未知父骨骼'}`,
            partCount > 0 ? `关联 ${partCount} 个部件` : '未关联部件',
            `旋转 ${Math.round(bone.rotation)} 度`
          ].join('，');

          return (
            <div
              key={bone.id}
              className={`bone-list-item ${isSelected ? 'selected' : ''} ${isRoot ? 'root-bone' : ''}`}
              role="option"
              aria-selected={isSelected}
              aria-label={itemAriaLabel}
              tabIndex={isSelected || (!selectedBoneId && index === 0) ? 0 : -1}
              data-bone-index={index}
              onClick={() => handleBoneClick(bone.id)}
              onDoubleClick={() => handleDoubleClick(bone)}
              onKeyDown={(e) => handleBoneItemKeyDown(e, bone, index)}
            >
              <div className="bone-list-indicator">
                {isSelected ? (
                  <span className="indicator-active">✓</span>
                ) : isRoot ? (
                  <span className="indicator-root">◎</span>
                ) : (
                  <span className="indicator-child">◉</span>
                )}
              </div>

              <div className="bone-list-main">
                <div className="bone-list-name-row">
                  {isEditing ? (
                    <input
                      type="text"
                      className="bone-edit-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={(e) => handleKeyDown(e, bone.id)}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="bone-list-name">{bone.name}</span>
                      {isRoot && <span className="bone-list-tag">根骨骼</span>}
                      {isSelected && <span className="bone-list-tag active">已选中</span>}
                    </>
                  )}
                </div>
                <div className="bone-list-meta">
                  {bone.parentId && (
                    <span className="bone-list-parent">↳ {parentName || '未知父骨骼'}</span>
                  )}
                  {partCount > 0 ? (
                    <span className="bone-list-parts">📦 {partCount} 个部件</span>
                  ) : (
                    <span className="bone-list-unused">未关联</span>
                  )}
                </div>
              </div>

              <div className="bone-list-extra">
                <span className="bone-rotation">{Math.round(bone.rotation)}°</span>
              </div>

              <div className="bone-list-actions">
                <button
                  type="button"
                  className="bone-action-btn"
                  onClick={(e) => handleLocate(e, bone.id)}
                  title="定位到画布"
                  aria-label={`定位骨骼：${bone.name}`}
                >
                  👁
                </button>
                <button
                  type="button"
                  className="bone-action-btn delete"
                  onClick={(e) => handleDelete(e, bone.id)}
                  title="删除骨骼"
                  aria-label={`删除骨骼：${bone.name}`}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BonesPanel;
