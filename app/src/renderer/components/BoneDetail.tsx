import React from 'react';
import { Bone } from '../types/bone';
import { Part } from '../types/part';
import { partTypeLabels } from '../types/part';

interface BoneDetailProps {
  bone: Bone;
  parts: Part[];
  onUpdateRotation: (boneId: string, rotation: number) => void;
  onUpdateLength: (boneId: string, length: number) => void;
  onDelete: (boneId: string) => void;
}

const BoneDetail: React.FC<BoneDetailProps> = ({
  bone,
  parts,
  onUpdateRotation,
  onUpdateLength,
  onDelete
}) => {
  const linkedParts = parts.filter(p => p.boneId === bone.id);
  const parentBone = bone.parentId || '无';

  return (
    <div className="bone-detail property-section">
      <div className="section-header bone-detail-header">
        <span className="section-icon">🎯</span>
        <div>
          <h4>骨骼详情</h4>
          <span className="section-subtitle">{bone.name}</span>
        </div>
        <span className="section-badge">已选中</span>
      </div>

      <div className="detail-card detail-card-primary">
        <div className="detail-row">
          <span className="detail-label">名称</span>
          <span className="detail-value strong">{bone.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">父骨骼</span>
          <span className="detail-value">{bone.parentId ? parentBone : '无（根骨骼）'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">关联部件</span>
          <span className="detail-value highlight">{linkedParts.length} 个</span>
        </div>
      </div>

      <div className="detail-card">
        <div className="card-header">
          <span className="card-icon">📍</span>
          <span className="card-title">位置信息</span>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">X</span>
            <span className="detail-value">{Math.round(bone.x)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Y</span>
            <span className="detail-value">{Math.round(bone.y)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">旋转</span>
            <span className="detail-value">{Math.round(bone.rotation)}°</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">长度</span>
            <span className="detail-value">{bone.length}</span>
          </div>
        </div>
      </div>

      <div className="detail-card detail-card-interactive">
        <div className="card-header">
          <span className="card-icon">⚙️</span>
          <span className="card-title">快速调整</span>
        </div>
        <div className="control-row">
          <span className="control-label">旋转角度</span>
          <div className="control-buttons">
            <button type="button" className="control-btn" onClick={() => onUpdateRotation(bone.id, bone.rotation - 15)}>−15°</button>
            <span className="control-value">{bone.rotation}°</span>
            <button type="button" className="control-btn" onClick={() => onUpdateRotation(bone.id, bone.rotation + 15)}>+15°</button>
          </div>
        </div>
        <div className="control-row">
          <span className="control-label">骨骼长度</span>
          <div className="control-buttons">
            <button type="button" className="control-btn" onClick={() => onUpdateLength(bone.id, Math.max(10, bone.length - 10))}>−10</button>
            <span className="control-value">{bone.length}</span>
            <button type="button" className="control-btn" onClick={() => onUpdateLength(bone.id, bone.length + 10)}>+10</button>
          </div>
        </div>
      </div>

      <div className="detail-card">
        <div className="card-header">
          <span className="card-icon">🔗</span>
          <span className="card-title">关联部件</span>
          <span className="card-count">{linkedParts.length}</span>
        </div>
        {linkedParts.length === 0 ? (
          <div className="empty-state small">
            <span className="empty-icon">📭</span>
            <p>暂无关联部件</p>
            <span className="empty-hint">可在「部件」步骤中建立关联</span>
          </div>
        ) : (
          <div className="linked-parts-list">
            {linkedParts.map(part => (
              <div key={part.id} className="linked-part-item">
                <span className="linked-part-name">{part.name}</span>
                <span className="linked-part-type">{partTypeLabels[part.type]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="detail-card detail-card-actions">
        <button type="button" className="action-btn danger" onClick={() => onDelete(bone.id)}>
          <span className="btn-icon">🗑</span>
          <span>删除骨骼</span>
        </button>
      </div>
    </div>
  );
};

export default BoneDetail;
