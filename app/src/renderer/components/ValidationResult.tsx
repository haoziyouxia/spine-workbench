import React, { useState } from 'react';
import { ValidationResult as ValidationResultType, ValidationItem, ValidationLevel } from '../utils/validationUtils';
import { Bone } from '../types/bone';

interface ValidationResultProps {
  result: ValidationResultType;
  bones: Bone[];
  onLocate?: (relatedPartIds?: string[], relatedBoneIds?: string[]) => void;
  onBatchAssignBone?: (partIds: string[], boneId: string) => void;
}

type FilterType = 'all' | ValidationLevel;

const getIcon = (level: ValidationItem['level']) => {
  switch (level) {
    case 'error':
      return '✗';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return '•';
  }
};

const getLevelStyles = (level: ValidationItem['level']) => {
  switch (level) {
    case 'error':
      return {
        borderColor: '#ff6b6b',
        bgColor: 'rgba(255, 107, 107, 0.1)',
        textColor: '#ff6b6b',
        iconBg: '#ff6b6b',
        headerBg: '#ffebee'
      };
    case 'warning':
      return {
        borderColor: '#ffa502',
        bgColor: 'rgba(255, 165, 2, 0.1)',
        textColor: '#ffa502',
        iconBg: '#ffa502',
        headerBg: '#fff8e1'
      };
    case 'info':
      return {
        borderColor: '#4ecdc4',
        bgColor: 'rgba(78, 205, 196, 0.1)',
        textColor: '#4ecdc4',
        iconBg: '#4ecdc4',
        headerBg: '#e0f2f1'
      };
    default:
      return {
        borderColor: '#888888',
        bgColor: 'rgba(136, 136, 136, 0.1)',
        textColor: '#888888',
        iconBg: '#888888',
        headerBg: '#f5f5f5'
      };
  }
};

const getLevelTitle = (level: ValidationLevel) => {
  switch (level) {
    case 'error':
      return '错误';
    case 'warning':
      return '警告';
    case 'info':
      return '提示';
    default:
      return '其他';
  }
};

const ValidationResult: React.FC<ValidationResultProps> = ({ result, bones, onLocate, onBatchAssignBone }) => {
  const { items, hasErrors, hasWarnings, hasInfos } = result;
  const [selectedBoneId, setSelectedBoneId] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedGroups, setExpandedGroups] = useState<ValidationLevel[]>(['error', 'warning', 'info']);

  const groupedItems = {
    error: items.filter(i => i.level === 'error'),
    warning: items.filter(i => i.level === 'warning'),
    info: items.filter(i => i.level === 'info')
  };

  const calculateProgress = (level: ValidationLevel) => {
    const groupItems = groupedItems[level];
    const total = groupItems.length;
    const percent = total > 0 ? Math.round((0 / total) * 100) : 100;
    return { resolved: 0, total, percent };
  };

  const filteredItems = filter === 'all'
    ? items
    : items.filter(i => i.level === filter);

  const filteredGroupedItems = {
    error: filter === 'all' || filter === 'error' ? groupedItems.error : [],
    warning: filter === 'all' || filter === 'warning' ? groupedItems.warning : [],
    info: filter === 'all' || filter === 'info' ? groupedItems.info : []
  };

  const hasGroupItems = (level: ValidationLevel) => filteredGroupedItems[level].length > 0;

  const isGroupExpanded = (level: ValidationLevel) => expandedGroups.includes(level);

  const toggleGroup = (level: ValidationLevel) => {
    setExpandedGroups(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleBatchAssign = (item: ValidationItem) => {
    if (selectedBoneId && item.relatedPartIds && onBatchAssignBone) {
      onBatchAssignBone(item.relatedPartIds, selectedBoneId);
      setSelectedBoneId('');
    }
  };

  const needsBoneAssignment = (item: ValidationItem) => {
    return item.id === 'unlinked-parts' && item.relatedPartIds && item.relatedPartIds.length > 0;
  };

  const renderGroup = (level: ValidationLevel) => {
    const groupItems = filteredGroupedItems[level];
    if (groupItems.length === 0) return null;

    const styles = getLevelStyles(level);
    const expanded = isGroupExpanded(level);
    const progress = calculateProgress(level);

    return (
      <div key={level} className="validation-group">
        <div
          className="validation-group-header"
          style={{ backgroundColor: styles.headerBg }}
          onClick={() => toggleGroup(level)}
        >
          <span className="validation-group-icon" style={{ backgroundColor: styles.iconBg }}>
            {getIcon(level)}
          </span>
          <span className="validation-group-title" style={{ color: styles.textColor }}>
            {getLevelTitle(level)}
          </span>
          <span className="validation-group-count">
            {progress.resolved}/{progress.total}
          </span>
          <div className="validation-group-progress-bar">
            <div
              className="validation-progress-fill"
              style={{
                width: `${progress.percent}%`,
                backgroundColor: styles.textColor
              }}
            ></div>
          </div>
          <span className="validation-group-percent">
            {progress.percent}%
          </span>
          <span className="validation-group-toggle">
            {expanded ? '▼' : '▶'}
          </span>
        </div>
        {expanded && (
          <div className="validation-group-list">
            {groupItems.map(item => {
              const canBatchAssign = needsBoneAssignment(item);

              return (
                <div
                  key={item.id}
                  className="validation-item"
                  style={{
                    borderLeftColor: styles.borderColor,
                    backgroundColor: styles.bgColor
                  }}
                >
                  <div className="validation-icon" style={{ backgroundColor: styles.iconBg }}>
                    {getIcon(item.level)}
                  </div>
                  <div className="validation-content">
                    <span className="validation-title-item" style={{ color: styles.textColor }}>
                      {item.title}
                    </span>
                    <span className="validation-message">{item.message}</span>
                    <div className="validation-actions">
                      {canBatchAssign && bones.length > 0 && (
                        <div className="validation-batch-assign">
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
                            className="validation-fix-btn primary"
                            onClick={() => handleBatchAssign(item)}
                            disabled={!selectedBoneId}
                          >
                            批量分配
                          </button>
                        </div>
                      )}
                      {item.fixable && !canBatchAssign && (
                        <>
                          <span className="validation-fixable">可修复</span>
                          {onLocate && (item.relatedPartIds || item.relatedBoneIds) && (
                            <button
                              className="validation-fix-btn"
                              onClick={() => {
                                onLocate(item.relatedPartIds, item.relatedBoneIds);
                              }}
                            >
                              定位对象
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: items.length },
    { value: 'error', label: '错误', count: groupedItems.error.length },
    { value: 'warning', label: '警告', count: groupedItems.warning.length },
    { value: 'info', label: '提示', count: groupedItems.info.length }
  ];

  return (
    <div className="validation-section">
      <h3 className="validation-title">
        导出校验
        {hasErrors && <span className="validation-badge error">{groupedItems.error.length} 错误</span>}
        {hasWarnings && <span className="validation-badge warning">{groupedItems.warning.length} 警告</span>}
        {hasInfos && <span className="validation-badge info">{groupedItems.info.length} 提示</span>}
      </h3>

      {items.length === 0 ? (
        <div className="validation-empty">
          <div className="validation-empty-icon">✓</div>
          <div className="validation-empty-content">
            <h4 className="validation-empty-title">所有校验通过</h4>
            <p className="validation-empty-message">项目已准备就绪，可以安全导出</p>
            <div className="validation-empty-tips">
              <span className="tip-item">• 部件与骨骼关联完整</span>
              <span className="tip-item">• 无导出错误</span>
              <span className="tip-item">• 可直接用于 Spine 导入</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="validation-filter-bar">
            {filterOptions.map(option => (
              <button
                key={option.value}
                className={`filter-btn ${filter === option.value ? 'active' : ''}`}
                onClick={() => setFilter(option.value)}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          <div className="validation-list grouped">
            {hasGroupItems('error') && renderGroup('error')}
            {hasGroupItems('warning') && renderGroup('warning')}
            {hasGroupItems('info') && renderGroup('info')}
          </div>
        </>
      )}
    </div>
  );
};

export default ValidationResult;