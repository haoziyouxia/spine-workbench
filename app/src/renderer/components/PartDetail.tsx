import React, { useState } from 'react';
import { Part } from '../types/part';
import { partTypeLabels } from '../types/part';
import { Bone } from '../types/bone';

interface PartDetailProps {
  part: Part;
  bones: Bone[];
  onRename: (partId: string, newName: string) => void;
  onToggleVisibility: (partId: string) => void;
  onUpdateZIndex: (partId: string, zIndex: number) => void;
  onUpdateBbox: (partId: string, x: number, y: number, width: number, height: number) => void;
  onSetBoneId: (partId: string, boneId: string | null) => void;
  onDuplicate: (partId: string) => void;
  onMoveUp: (partId: string) => void;
  onMoveDown: (partId: string) => void;
  onBringToFront: (partId: string) => void;
  onSendToBack: (partId: string) => void;
  onDelete: (partId: string) => void;
}

const PartDetail: React.FC<PartDetailProps> = ({
  part,
  bones,
  onRename,
  onToggleVisibility,
  onUpdateZIndex,
  onUpdateBbox,
  onSetBoneId,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onBringToFront,
  onSendToBack,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(part.name);
  const [bboxValues, setBboxValues] = useState({
    x: part.x,
    y: part.y,
    width: part.width,
    height: part.height
  });

  const handleSaveName = () => {
    if (editName.trim()) {
      onRename(part.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(part.name);
    setIsEditing(false);
  };

  const handleBboxChange = (field: keyof typeof bboxValues, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setBboxValues(prev => ({ ...prev, [field]: numValue }));
  };

  const handleBboxApply = () => {
    onUpdateBbox(part.id, bboxValues.x, bboxValues.y, bboxValues.width, bboxValues.height);
  };

  const handleBboxReset = () => {
    setBboxValues({
      x: part.x,
      y: part.y,
      width: part.width,
      height: part.height
    });
  };

  return (
    <div className="part-detail">
      <h3>部件详情</h3>

      <div className="detail-section">
        <h4>基本信息</h4>

        <div className="detail-item">
          <span className="detail-label">名称</span>
          <div className="detail-value">
            {isEditing ? (
              <div className="edit-input-group">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="edit-input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button className="edit-btn" onClick={handleSaveName}>✓</button>
                <button className="edit-btn cancel" onClick={handleCancelEdit}>✕</button>
              </div>
            ) : (
              <>
                <span>{part.name}</span>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>✎</button>
              </>
            )}
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-label">类型</span>
          <span className="detail-value">{partTypeLabels[part.type]}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">层级</span>
          <div className="detail-value zindex-control">
            <button className="zindex-btn" onClick={() => onUpdateZIndex(part.id, part.zIndex - 1)}>−</button>
            <span className="zindex-value">{part.zIndex}</span>
            <button className="zindex-btn" onClick={() => onUpdateZIndex(part.id, part.zIndex + 1)}>+</button>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-label">可见</span>
          <button
            className={`toggle-btn ${part.visible ? 'active' : ''}`}
            onClick={() => onToggleVisibility(part.id)}
          >
            {part.visible ? '是' : '否'}
          </button>
        </div>
      </div>

      <div className="detail-section">
        <h4>骨骼关联</h4>
        <div className="detail-item">
          <span className="detail-label">关联骨骼</span>
          <select
            className="bone-select"
            value={part.boneId || ''}
            onChange={(e) => onSetBoneId(part.id, e.target.value || null)}
          >
            <option value="">无</option>
            {bones.map(bone => (
              <option key={bone.id} value={bone.id}>
                {bone.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="detail-section">
        <h4>边界框 (BBox)</h4>
        <div className="bbox-grid">
          <div className="bbox-item">
            <label>X</label>
            <input
              type="number"
              value={bboxValues.x}
              onChange={(e) => handleBboxChange('x', e.target.value)}
              className="bbox-input"
            />
          </div>
          <div className="bbox-item">
            <label>Y</label>
            <input
              type="number"
              value={bboxValues.y}
              onChange={(e) => handleBboxChange('y', e.target.value)}
              className="bbox-input"
            />
          </div>
          <div className="bbox-item">
            <label>宽度</label>
            <input
              type="number"
              value={bboxValues.width}
              onChange={(e) => handleBboxChange('width', e.target.value)}
              className="bbox-input"
              min="1"
            />
          </div>
          <div className="bbox-item">
            <label>高度</label>
            <input
              type="number"
              value={bboxValues.height}
              onChange={(e) => handleBboxChange('height', e.target.value)}
              className="bbox-input"
              min="1"
            />
          </div>
        </div>
        <div className="bbox-actions">
          <button className="bbox-btn apply" onClick={handleBboxApply}>应用</button>
          <button className="bbox-btn reset" onClick={handleBboxReset}>重置</button>
        </div>
      </div>

      <div className="detail-section">
        <h4>层级调整</h4>
        <div className="zindex-actions">
          <button className="zindex-action-btn" onClick={() => onBringToFront(part.id)}>
            置顶
          </button>
          <button className="zindex-action-btn" onClick={() => onMoveUp(part.id)}>
            上移
          </button>
          <button className="zindex-action-btn" onClick={() => onMoveDown(part.id)}>
            下移
          </button>
          <button className="zindex-action-btn" onClick={() => onSendToBack(part.id)}>
            置底
          </button>
        </div>
      </div>

      <div className="detail-section actions">
        <button className="action-btn" onClick={() => onDuplicate(part.id)}>
          复制
        </button>
        <button className="action-btn" onClick={() => alert('合并功能占位')}>
          合并
        </button>
        <button className="action-btn danger" onClick={() => onDelete(part.id)}>
          删除
        </button>
      </div>
    </div>
  );
};

export default PartDetail;