import React, { useState } from 'react';
import { Part } from '../types/part';
import { partTypeLabels, PartType } from '../types/part';
import { Bone } from '../types/bone';
import AddPartForm from './AddPartForm';

interface PartsPanelProps {
  parts: Part[];
  selectedPartId: string | null;
  selectedPartIds: string[];
  onSelectPart: (partId: string, multiSelect: boolean) => void;
  onAddPart: (name: string, type: PartType) => void;
  bones: Bone[];
}

const PartsPanel: React.FC<PartsPanelProps> = ({ parts, selectedPartId, selectedPartIds, onSelectPart, onAddPart, bones }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const sortedParts = [...parts].sort((a, b) => a.zIndex - b.zIndex);

  const handleAddPart = (name: string, type: PartType) => {
    onAddPart(name, type);
    setShowAddForm(false);
  };

  const handlePartClick = (e: React.MouseEvent, partId: string) => {
    const multiSelect = e.ctrlKey || e.metaKey;
    onSelectPart(partId, multiSelect);
  };

  const isMultiSelect = selectedPartIds.length > 1;

  const getBoneName = (boneId: string | null): string => {
    if (!boneId) return '';
    const bone = bones.find(b => b.id === boneId);
    return bone?.name || '';
  };

  const getTypeColor = (type: Part['type']): string => {
    switch (type) {
      case 'body': return '#4ecdc4';
      case 'arm_left':
      case 'arm_right': return '#ffe66d';
      case 'leg_left':
      case 'leg_right': return '#95e1d3';
      case 'head': return '#f38181';
      case 'hair': return '#aa96da';
      case 'accessory': return '#fcbad3';
      case 'eye_left':
      case 'eye_right': return '#74b9ff';
      case 'mouth': return '#fd79a8';
      default: return '#a0a0a0';
    }
  };

  return (
    <div className="parts-panel">
      <div className="parts-header">
        <h3>部件列表</h3>
        <button
          className="add-part-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '取消' : '+ 新增'}
        </button>
      </div>

      {showAddForm && (
        <AddPartForm
          onAdd={handleAddPart}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="parts-count">
        共 {parts.length} 个部件
        {isMultiSelect && ` (已选 ${selectedPartIds.length} 个)`}
      </div>

      <div className="parts-list">
        {sortedParts.map((part) => {
          const boneName = getBoneName(part.boneId);
          return (
            <div
              key={part.id}
              className={`part-item ${selectedPartIds.includes(part.id) ? 'selected' : ''} ${!part.visible ? 'hidden' : ''} ${selectedPartId === part.id ? 'primary' : ''}`}
              onClick={(e) => handlePartClick(e, part.id)}
            >
              <div className="part-icon">
                {selectedPartIds.includes(part.id) ? '✓' : (part.visible ? '◎' : '○')}
              </div>
              <div className="part-info">
                <div className="part-name">{part.name}</div>
                <div className="part-meta">
                  <span
                    className="part-type-tag"
                    style={{ backgroundColor: `${getTypeColor(part.type)}33`, color: getTypeColor(part.type) }}
                  >
                    {partTypeLabels[part.type]}
                  </span>
                  {boneName && (
                    <span className="part-bone-tag">
                      🦴 {boneName}
                    </span>
                  )}
                  {!part.visible && (
                    <span className="part-hidden-tag">隐藏</span>
                  )}
                  {part.boneId === null && (
                    <span className="part-unlinked-tag">未关联骨骼</span>
                  )}
                </div>
              </div>
              <div className="part-zindex">Z:{part.zIndex}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartsPanel;