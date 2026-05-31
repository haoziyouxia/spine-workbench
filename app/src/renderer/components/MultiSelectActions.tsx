import React, { useState } from 'react';
import { Bone } from '../types/bone';

interface MultiSelectActionsProps {
  selectedPartIds: string[];
  bones: Bone[];
  onBatchToggleVisibility: (partIds: string[]) => void;
  onBatchDuplicateParts: (partIds: string[]) => void;
  onBatchDeleteParts: (partIds: string[]) => void;
  onBatchSetBoneId: (partIds: string[], boneId: string | null) => void;
}

const MultiSelectActions: React.FC<MultiSelectActionsProps> = ({
  selectedPartIds,
  bones,
  onBatchToggleVisibility,
  onBatchDuplicateParts,
  onBatchDeleteParts,
  onBatchSetBoneId
}) => {
  const [selectedBoneId, setSelectedBoneId] = useState<string>('');

  const handleBoneAssign = () => {
    const boneId = selectedBoneId || null;
    onBatchSetBoneId(selectedPartIds, boneId);
    setSelectedBoneId('');
  };

  return (
    <div className="multi-select-actions">
      <h3>多选操作</h3>
      <div className="multi-select-info">
        已选择 <strong>{selectedPartIds.length}</strong> 个部件
      </div>

      <div className="multi-select-bone-assignment">
        <h4>批量骨骼分配</h4>
        <div className="bone-assign-row">
          <select
            className="bone-select"
            value={selectedBoneId}
            onChange={(e) => setSelectedBoneId(e.target.value)}
          >
            <option value="">选择骨骼...</option>
            {bones.map(bone => (
              <option key={bone.id} value={bone.id}>
                {bone.name}
              </option>
            ))}
          </select>
          <button
            className="multi-select-btn"
            onClick={handleBoneAssign}
            disabled={!selectedBoneId}
          >
            分配骨骼
          </button>
        </div>
      </div>

      <div className="multi-select-buttons">
        <button
          className="multi-select-btn"
          onClick={() => onBatchToggleVisibility(selectedPartIds)}
        >
          切换可见性
        </button>
        <button
          className="multi-select-btn"
          onClick={() => onBatchDuplicateParts(selectedPartIds)}
        >
          复制选中
        </button>
        <button
          className="multi-select-btn danger"
          onClick={() => {
            if (confirm(`确定要删除选中的 ${selectedPartIds.length} 个部件吗？`)) {
              onBatchDeleteParts(selectedPartIds);
            }
          }}
        >
          删除选中
        </button>
      </div>
    </div>
  );
};

export default MultiSelectActions;