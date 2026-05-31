import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Part } from '../types/part';
import { Bone } from '../types/bone';
import { StepId } from '../hooks/useStep';
import { exportProject, getExportStructure } from '../utils/exportUtils';
import { validateExport, ValidationResult, ValidationItem } from '../utils/validationUtils';
import ValidationResultComponent from './ValidationResult';

interface ExportPreviewProps {
  projectName: string;
  parts: Part[];
  bones: Bone[];
  imageSrc: string | null;
  onLocate?: (relatedPartIds?: string[], relatedBoneIds?: string[]) => void;
  onBatchAssignBone?: (partIds: string[], boneId: string) => void;
  onNavigateToStep?: (step: StepId) => void;
  onTogglePartVisibility?: (partId: string) => void;
  onBatchTogglePartVisibility?: (partIds: string[]) => void;
  onSelectParts?: (partIds?: string[]) => void;
  onSelectBone?: (boneId: string) => void;
}

interface ReadinessInfo {
  errorCount: number;
  warningCount: number;
  partCount: number;
  boneCount: number;
  isReady: boolean;
  criticalIssues: ValidationItem[];
  recommendedIssues: ValidationItem[];
  optionalIssues: ValidationItem[];
  criticalProgress: number;
  recommendedProgress: number;
  optionalProgress: number;
}

const GROUP_STATE_KEY = 'export-readiness-group-state';

const getStoredGroupState = (): { critical: boolean; recommended: boolean; optional: boolean } => {
  try {
    const stored = localStorage.getItem(GROUP_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.warn('Failed to parse stored group state');
  }
  return {
    critical: false,
    recommended: true,
    optional: true
  };
};

const ExportPreview: React.FC<ExportPreviewProps> = ({ projectName, parts, bones, imageSrc, onLocate, onBatchAssignBone, onNavigateToStep, onBatchTogglePartVisibility, onSelectParts, onSelectBone }) => {
  const [notes, setNotes] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBoneId, setSelectedBoneId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storedState = getStoredGroupState();
  const [collapsedGroups, setCollapsedGroups] = useState<{
    critical: boolean;
    recommended: boolean;
    optional: boolean;
  }>(storedState);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const criticalGroupRef = useRef<HTMLDivElement>(null);
  const recommendedGroupRef = useRef<HTMLDivElement>(null);

  const scrollToGroup = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const stickyBarHeight = 60;
      const elementPosition = ref.current.getBoundingClientRect().top;
      const scrollPosition = window.scrollY + elementPosition - stickyBarHeight - 20;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  const validationResult: ValidationResult = useMemo(() => {
    return validateExport(imageSrc, parts, bones);
  }, [imageSrc, parts, bones]);

  const structure = useMemo(() => {
    return getExportStructure(projectName || '未命名项目', parts, bones);
  }, [projectName, parts, bones]);

  const getIssuePriority = (item: ValidationItem): 1 | 2 | 3 => {
    switch (item.level) {
      case 'error':
        return 1;
      case 'warning':
        if (item.id === 'unlinked-parts' || item.id === 'invalid-bone-links') {
          return 2;
        }
        return 3;
      case 'info':
      default:
        return 3;
    }
  };

  const readinessInfo = useMemo(() => {
    const isEmpty = parts.length === 0 && bones.length === 0;
    const unlinkedParts = parts.filter(p => !p.boneId);
    const unlinkedPartCount = unlinkedParts.length;
    const errorCount = validationResult.items.filter(i => i.level === 'error').length;
    const warningCount = validationResult.items.filter(i => i.level === 'warning').length;
    const isReady = !validationResult.hasErrors && unlinkedPartCount === 0 && !isEmpty;

    const errorItems = validationResult.items.filter(i => i.level === 'error');
    const fixableWarnings = validationResult.items.filter(i => i.level === 'warning' && i.fixable);

    const criticalIssues = validationResult.items.filter(
      i => i.level === 'error' || i.id === 'unlinked-parts' || i.id === 'invalid-bone-links'
    ).sort((a, b) => {
      if (a.level === 'error' && b.level !== 'error') return -1;
      if (a.level !== 'error' && b.level === 'error') return 1;
      return 0;
    });

    const recommendedIssues = validationResult.items.filter(
      i => i.level === 'warning' && !['unlinked-parts', 'invalid-bone-links'].includes(i.id)
    );

    const optionalIssues = validationResult.items.filter(i => i.level === 'info');

    const resolvedCritical = criticalIssues.filter(i => {
      if (i.id === 'unlinked-parts') return parts.every(p => p.boneId);
      if (i.id === 'invalid-bone-links') return parts.every(p => !p.boneId || bones.some(b => b.id === p.boneId));
      return false;
    }).length;

    const resolvedRecommended = recommendedIssues.filter(i => {
      return false;
    }).length;

    const resolvedOptional = optionalIssues.filter(i => {
      return false;
    }).length;

    const criticalProgress = criticalIssues.length > 0 ? Math.round((resolvedCritical / criticalIssues.length) * 100) : 100;
    const recommendedProgress = recommendedIssues.length > 0 ? Math.round((resolvedRecommended / recommendedIssues.length) * 100) : 100;
    const optionalProgress = optionalIssues.length > 0 ? Math.round((resolvedOptional / optionalIssues.length) * 100) : 100;

    return {
      isEmpty,
      partCount: parts.length,
      boneCount: bones.length,
      unlinkedPartCount,
      unlinkedParts,
      errorCount,
      warningCount,
      isReady,
      errorItems,
      fixableWarnings,
      criticalIssues,
      recommendedIssues,
      optionalIssues,
      criticalProgress: { resolved: resolvedCritical, total: criticalIssues.length, percent: criticalProgress },
      recommendedProgress: { resolved: resolvedRecommended, total: recommendedIssues.length, percent: recommendedProgress },
      optionalProgress: { resolved: resolvedOptional, total: optionalIssues.length, percent: optionalProgress }
    };
  }, [parts, bones, validationResult]);

  const handleLocateUnlinkedParts = () => {
    const unlinkedPartIds = readinessInfo.unlinkedParts.map(p => p.id);
    if (onLocate) {
      onLocate(unlinkedPartIds);
    }
  };

  const handleFixUnlinkedParts = () => {
    if (!selectedBoneId || readinessInfo.unlinkedPartCount === 0) return;
    const unlinkedPartIds = readinessInfo.unlinkedParts.map(p => p.id);
    if (onBatchAssignBone) {
      onBatchAssignBone(unlinkedPartIds, selectedBoneId);
      setSelectedBoneId(null);
    }
  };

  const handleLocateError = (item: ValidationItem) => {
    if (onLocate && item.relatedPartIds && item.relatedPartIds.length > 0) {
      onLocate(item.relatedPartIds, item.relatedBoneIds);
    }
  };

  const handleNavigateToParts = () => {
    if (onNavigateToStep) {
      onNavigateToStep('parts');
    }
  };

  const handleNavigateToBones = () => {
    if (onNavigateToStep) {
      onNavigateToStep('bones');
    }
  };

  const toggleCollapseGroup = (group: 'critical' | 'recommended' | 'optional') => {
    setCollapsedGroups(prev => {
      if (group === 'critical' && validationResult.hasErrors) {
        return prev;
      }
      return {
        ...prev,
        [group]: !prev[group]
      };
    });
  };

  const handleShowHiddenParts = () => {
    const hiddenPartIds = parts.filter(p => !p.visible).map(p => p.id);
    if (onBatchTogglePartVisibility && hiddenPartIds.length > 0) {
      onBatchTogglePartVisibility(hiddenPartIds);
    }
  };

  const handleFixInvalidBoneLinks = () => {
    const invalidParts = parts.filter(p => p.boneId && !bones.some(b => b.id === p.boneId));
    const invalidPartIds = invalidParts.map(p => p.id);
    if (onLocate && invalidPartIds.length > 0) {
      onLocate(invalidPartIds);
    }
    if (onNavigateToStep) {
      onNavigateToStep('parts');
    }
  };

  const getGroupForIssue = (item: ValidationItem): 'critical' | 'recommended' | 'optional' => {
    if (item.level === 'error' || ['unlinked-parts', 'invalid-bone-links'].includes(item.id)) {
      return 'critical';
    }
    if (item.level === 'warning') {
      return 'recommended';
    }
    return 'optional';
  };

  const handleProcessIssue = (item: ValidationItem) => {
    const group = getGroupForIssue(item);
    setCollapsedGroups(prev => ({
      ...prev,
      [group]: false
    }));

    switch (item.id) {
      case 'no-bones':
        if (onNavigateToStep) {
          onNavigateToStep('bones');
        }
        break;
      case 'no-parts':
        if (onNavigateToStep) {
          onNavigateToStep('parts');
        }
        break;
      case 'multiple-root-bones':
        if (item.relatedBoneIds && item.relatedBoneIds.length > 0) {
          if (onSelectBone) {
            onSelectBone(item.relatedBoneIds[0]);
          }
        }
        if (onNavigateToStep) {
          onNavigateToStep('bones');
        }
        break;
      case 'long-bone-names':
        if (item.relatedBoneIds && item.relatedBoneIds.length > 0) {
          if (onSelectBone) {
            onSelectBone(item.relatedBoneIds[0]);
          }
        }
        if (onNavigateToStep) {
          onNavigateToStep('bones');
        }
        break;
      case 'invisible-parts':
        handleShowHiddenParts();
        if (item.relatedPartIds && item.relatedPartIds.length > 0) {
          if (onSelectParts) {
            onSelectParts(item.relatedPartIds);
          }
          if (onNavigateToStep) {
            onNavigateToStep('parts');
          }
        }
        break;
      case 'invalid-bone-links':
        handleFixInvalidBoneLinks();
        break;
      case 'unlinked-bones':
        if (item.relatedBoneIds && item.relatedBoneIds.length > 0) {
          if (onSelectBone) {
            onSelectBone(item.relatedBoneIds[0]);
          }
        }
        if (onNavigateToStep) {
          onNavigateToStep('parts');
        }
        break;
      case 'unlinked-parts':
        if (item.relatedPartIds && item.relatedPartIds.length > 0) {
          if (onSelectParts) {
            onSelectParts(item.relatedPartIds);
          }
          if (onNavigateToStep) {
            onNavigateToStep('parts');
          }
        }
        break;
      default:
        if (item.relatedPartIds && item.relatedPartIds.length > 0) {
          if (onSelectParts) {
            onSelectParts(item.relatedPartIds);
          }
          handleLocateError(item);
        } else if (item.relatedBoneIds && item.relatedBoneIds.length > 0) {
          if (onSelectBone) {
            onSelectBone(item.relatedBoneIds[0]);
          }
          if (onLocate) {
            onLocate([], item.relatedBoneIds);
          }
        }
    }
  };

  const getIssueActionLabel = (item: ValidationItem): string => {
    switch (item.id) {
      case 'no-bones':
        return '添加骨骼';
      case 'no-parts':
        return '添加部件';
      case 'multiple-root-bones':
        return '调整骨骼层级';
      case 'long-bone-names':
        return '重命名骨骼';
      case 'invisible-parts':
        return '一键显示';
      case 'invalid-bone-links':
        return '修复关联';
      case 'unlinked-bones':
        return '关联部件';
      case 'unlinked-parts':
        return '关联骨骼';
      default:
        if (item.relatedPartIds && item.relatedPartIds.length > 0) {
          return '定位';
        } else if (item.relatedBoneIds && item.relatedBoneIds.length > 0) {
          return '定位骨骼';
        }
        return '查看';
    }
  };

  const getIssueActionType = (item: ValidationItem): 'navigate' | 'action' | 'locate' => {
    switch (item.id) {
      case 'no-bones':
      case 'no-parts':
      case 'multiple-root-bones':
      case 'long-bone-names':
        return 'navigate';
      case 'invisible-parts':
      case 'invalid-bone-links':
      case 'unlinked-bones':
        return 'action';
      default:
        return 'locate';
    }
  };

  const getIssueFixHint = (item: ValidationItem): string => {
    switch (item.id) {
      case 'no-bones':
        return '骨骼是驱动部件变形的基础，请在「骨点调整」步骤添加至少一个骨骼根节点。';
      case 'no-parts':
        return '部件是角色的组成单元，请在「拆件建议」或「人工修正」步骤创建部件。';
      case 'multiple-root-bones':
        return '多个根骨骼可能导致动画层级混乱，建议将次要骨骼设置为其他骨骼的子节点。';
      case 'long-bone-names':
        return '骨骼名称过长会影响在 Spine 中的可读性，建议控制在 20 字符以内。';
      case 'invisible-parts':
        return '隐藏的部件不会被导出，确认这些部件是否确实不需要包含在最终结果中。';
      case 'invalid-bone-links':
        return '部件关联了不存在的骨骼，请检查「骨骼」字段并选择有效的骨骼。';
      case 'unlinked-parts':
        return '未关联骨骼的部件无法被骨骼驱动变形，建议为每个部件选择合适的骨骼。';
      case 'unlinked-bones':
        return '未关联部件的骨骼虽然可以导出，但不会产生任何变形效果。';
      case 'mock-parts':
        return 'Mock 数据仅用于测试，请替换为真实的部件配置。';
      case 'mock-bones':
        return 'Mock 数据仅用于测试，请调整为真实的骨骼配置。';
      default:
        return '';
    }
  };

  const getIssueStepHint = (item: ValidationItem): string => {
    switch (item.id) {
      case 'no-bones':
      case 'multiple-root-bones':
      case 'long-bone-names':
        return '前往「骨点调整」';
      case 'no-parts':
      case 'invisible-parts':
      case 'invalid-bone-links':
      case 'unlinked-parts':
        return '前往「人工修正」';
      case 'unlinked-bones':
        return '前往「人工修正」';
      default:
        return '';
    }
  };

  const handleExpandAllCritical = () => {
    setCollapsedGroups(prev => ({
      ...prev,
      critical: false,
      recommended: false
    }));
  };

  const getNextStepGuidance = () => {
    if (readinessInfo.isEmpty) {
      return {
        title: '开始创建项目',
        description: '请先添加部件和骨骼',
        action: '添加部件',
        actionType: 'empty' as const
      };
    }
    if (readinessInfo.errorCount > 0) {
      return {
        title: '存在阻塞问题',
        description: `需要修复 ${readinessInfo.errorCount} 个问题才能导出`,
        action: '查看问题',
        actionType: 'critical' as const
      };
    }
    if (readinessInfo.warningCount > 0) {
      return {
        title: '可导出，建议优化',
        description: `有 ${readinessInfo.warningCount} 项建议优化`,
        action: '查看建议',
        actionType: 'warning' as const
      };
    }
    return {
      title: '导出就绪',
      description: '所有检查已通过',
      action: '立即导出',
      actionType: 'ready' as const
    };
  };

  const nextStepGuidance = getNextStepGuidance();

  const handleNextStepAction = () => {
    if (readinessInfo.isEmpty) {
      if (onNavigateToStep) {
        onNavigateToStep('parts');
      }
    } else if (readinessInfo.errorCount > 0) {
      handleExpandAllCritical();
      setTimeout(() => {
        scrollToGroup(criticalGroupRef);
      }, 100);
    } else if (readinessInfo.warningCount > 0) {
      handleExpandAllCritical();
      setTimeout(() => {
        const targetRef = readinessInfo.criticalIssues.length > 0 ? criticalGroupRef : recommendedGroupRef;
        scrollToGroup(targetRef);
      }, 100);
    } else {
      handleExport();
    }
  };

  const handleExport = async () => {
    if (validationResult.hasErrors) {
      alert('存在导出错误，请先修复错误后再导出');
      return;
    }

    setIsExporting(true);
    try {
      await exportProject(projectName || '未命名项目', parts, bones, notes);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-preview">
      <h2 className="export-title">导出预览</h2>

      <div className="sticky-readiness-bar">
        <div className="sticky-readiness-status">
          <div className={`sticky-badge ${readinessInfo.isReady ? 'ready' : 'not-ready'}`}>
            {readinessInfo.isReady ? '✓ 可导出' : '⚠ 需要完善'}
          </div>
        </div>
        <div className="sticky-stats">
          {readinessInfo.errorCount > 0 && (
            <span className="sticky-stat error">
              <span className="sticky-stat-icon">✕</span>
              <span className="sticky-stat-value">{readinessInfo.errorCount}</span>
            </span>
          )}
          {readinessInfo.warningCount > 0 && (
            <span className="sticky-stat warning">
              <span className="sticky-stat-icon">⚠</span>
              <span className="sticky-stat-value">{readinessInfo.warningCount}</span>
            </span>
          )}
          <span className="sticky-stat info">
            <span className="sticky-stat-icon">▣</span>
            <span className="sticky-stat-value">{readinessInfo.partCount}</span>
          </span>
          <span className="sticky-stat info">
            <span className="sticky-stat-icon">◉</span>
            <span className="sticky-stat-value">{readinessInfo.boneCount}</span>
          </span>
        </div>
      </div>

      {isLoading ? (
          <div className="readiness-loading">
            <div className="loading-spinner"></div>
            <span className="loading-text">正在检查导出准备度...</span>
          </div>
        ) : (
          <div className="readiness-content">
            <div className={`readiness-summary ${readinessInfo.isEmpty ? 'focus-empty' : readinessInfo.errorCount > 0 ? 'focus-critical' : readinessInfo.warningCount > 0 ? 'focus-warning' : 'focus-ready'}`}>
              <div className={`readiness-header ${readinessInfo.isEmpty ? 'context-empty' : readinessInfo.errorCount > 0 ? 'context-critical' : readinessInfo.warningCount > 0 ? 'context-warning' : 'context-ready'}`}>
                <h3>导出准备度</h3>
                <div className={`readiness-status ${readinessInfo.isEmpty ? 'empty' : readinessInfo.isReady ? (readinessInfo.warningCount === 0 ? 'ready' : 'ready-with-warnings') : 'not-ready'}`}>
                  <div className={`status-icon ${readinessInfo.isEmpty ? 'empty' : readinessInfo.isReady ? (readinessInfo.warningCount === 0 ? 'ready' : 'warning') : 'error'}`}>
                    {readinessInfo.isEmpty ? '📋' : readinessInfo.isReady ? (readinessInfo.warningCount === 0 ? '✓' : '⚡') : '✕'}
                  </div>
                  <div className="status-content">
                    <div className="status-title">
                      {readinessInfo.isEmpty ? '项目为空' : readinessInfo.isReady ? (readinessInfo.warningCount === 0 ? '导出就绪' : '可导出') : '导出被阻止'}
                    </div>
                    <div className="status-desc">
                      {readinessInfo.isEmpty ? '还未添加任何部件和骨骼' : readinessInfo.isReady ? (readinessInfo.warningCount === 0 ? '所有检查已通过' : `有 ${readinessInfo.warningCount} 项建议优化`) : `存在 ${readinessInfo.errorCount} 个阻塞问题`}
                    </div>
                  </div>
                </div>

                <div className={`next-step-guidance ${nextStepGuidance.actionType}`}>
                  <div className="next-step-header">
                    <span className="next-step-icon">{nextStepGuidance.actionType === 'empty' ? '📋' : nextStepGuidance.actionType === 'critical' ? '🔴' : nextStepGuidance.actionType === 'warning' ? '🟡' : '🟢'}</span>
                    <div className="next-step-info">
                      <div className="next-step-title">{nextStepGuidance.title}</div>
                      <div className="next-step-desc">{nextStepGuidance.description}</div>
                    </div>
                  </div>
                  <button
                    className={`next-step-btn ${nextStepGuidance.actionType}`}
                    onClick={handleNextStepAction}
                    disabled={isExporting}
                    aria-label={nextStepGuidance.action}
                    aria-describedby="next-step-desc"
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && !isExporting && handleNextStepAction()}
                  >
                    {nextStepGuidance.action}
                  </button>
                </div>
                <div
                  className={`readiness-stats-row ${readinessInfo.isEmpty ? 'context-empty' : readinessInfo.errorCount > 0 ? 'context-critical' : readinessInfo.warningCount > 0 ? 'context-warning' : 'context-ready'}`}
                  role="status"
                  aria-live="polite"
                >
                  <div className="stats-context-tag" role="heading" aria-level={4}>
                    <span className="context-badge" aria-hidden="true">
                      {readinessInfo.isEmpty ? '📋' : readinessInfo.errorCount > 0 ? '⚡' : readinessInfo.warningCount > 0 ? '📌' : '✓'}
                    </span>
                    <span className="context-text">
                      {readinessInfo.isEmpty ? '空项目' : readinessInfo.errorCount > 0 ? '有问题' : readinessInfo.warningCount > 0 ? '待优化' : '已就绪'}
                    </span>
                  </div>
                  <div
                    className={`stat-item primary ${readinessInfo.isEmpty ? 'hidden' : readinessInfo.errorCount === 0 ? 'dimmed' : ''}`}
                    role="region"
                    aria-label={`${readinessInfo.errorCount} 个阻塞问题`}
                  >
                    <div className={`stat-icon errors-icon ${readinessInfo.isEmpty ? 'muted' : readinessInfo.errorCount === 0 ? 'muted' : ''}`} aria-hidden="true">✕</div>
                    <div className="stat-info">
                      <span className={`stat-value ${readinessInfo.errorCount > 0 ? 'error' : 'muted'}`}>
                        {readinessInfo.errorCount}
                      </span>
                      <span className="stat-label">阻塞</span>
                    </div>
                  </div>
                  <div
                    className={`stat-item secondary ${readinessInfo.isEmpty ? 'hidden' : readinessInfo.errorCount > 0 ? 'hidden' : readinessInfo.warningCount === 0 ? 'dimmed' : ''}`}
                    role="region"
                    aria-label={`${readinessInfo.warningCount} 个建议优化`}
                  >
                    <div className={`stat-icon warnings-icon ${readinessInfo.isEmpty ? 'muted' : readinessInfo.errorCount > 0 ? 'muted' : readinessInfo.warningCount === 0 ? 'muted' : ''}`} aria-hidden="true">⚠</div>
                    <div className="stat-info">
                      <span className={`stat-value ${readinessInfo.warningCount > 0 && !readinessInfo.isEmpty && readinessInfo.errorCount === 0 ? 'warning' : 'muted'}`}>
                        {readinessInfo.warningCount}
                      </span>
                      <span className="stat-label">建议</span>
                    </div>
                  </div>
                  <div
                    className={`stat-item tertiary ${readinessInfo.isEmpty ? 'hidden' : readinessInfo.errorCount > 0 ? 'hidden' : readinessInfo.warningCount > 0 ? 'dimmed' : ''}`}
                    role="region"
                    aria-label={`${readinessInfo.partCount} 个部件`}
                  >
                    <div className="stat-icon parts-icon" aria-hidden="true">▣</div>
                    <div className="stat-info">
                      <span className="stat-value subtle">{readinessInfo.partCount}</span>
                      <span className="stat-label subtle">部件</span>
                    </div>
                  </div>
                  <div
                    className={`stat-item tertiary ${readinessInfo.isEmpty ? 'hidden' : readinessInfo.errorCount > 0 ? 'hidden' : readinessInfo.warningCount > 0 ? 'dimmed' : ''}`}
                    role="region"
                    aria-label={`${readinessInfo.boneCount} 个骨骼`}
                  >
                    <div className="stat-icon bones-icon" aria-hidden="true">◉</div>
                    <div className="stat-info">
                      <span className="stat-value subtle">{readinessInfo.boneCount}</span>
                      <span className="stat-label subtle">骨骼</span>
                    </div>
                  </div>
                  <div
                    className="stats-hidden-hint"
                    title={`${readinessInfo.partCount} 部件, ${readinessInfo.boneCount} 骨骼`}
                    role="button"
                    tabIndex={0}
                    aria-label={`查看详细信息：${readinessInfo.partCount} 部件, ${readinessInfo.boneCount} 骨骼`}
                  >
                    <span className="hint-icon" aria-hidden="true">ⓘ</span>
                    <span className="hint-text">+{readinessInfo.partCount + readinessInfo.boneCount} 项</span>
                  </div>
                </div>
                {readinessInfo.errorCount > 0 && (
                  <button
                    className="expand-all-btn critical"
                    onClick={handleExpandAllCritical}
                    title="展开查看所有阻塞问题"
                    aria-label="展开查看所有阻塞问题"
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleExpandAllCritical()}
                  >
                    展开阻塞问题
                  </button>
                )}
                {readinessInfo.warningCount > 0 && readinessInfo.errorCount === 0 && (
                  <button
                    className="expand-all-btn"
                    onClick={handleExpandAllCritical}
                    title="展开查看所有建议优化项"
                    aria-label="展开查看所有建议优化项"
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleExpandAllCritical()}
                  >
                    展开建议优化项
                  </button>
                )}
              </div>

              <div className="readiness-tips">
          {readinessInfo.isReady ? (
            <p className="ready-tip">✓ 项目已准备就绪，可以导出</p>
          ) : (
            <div className="action-tips">
              {readinessInfo.criticalIssues.length > 0 && (
                <div
                  ref={criticalGroupRef}
                  className={`action-group priority-critical ${collapsedGroups.critical ? 'collapsed' : ''}`}>
                  <button
                    className="action-group-header collapsible-header"
                    onClick={() => toggleCollapseGroup('critical')}
                  >
                    <span className="priority-indicator critical">🔴</span>
                    <h4 className="action-title">需要修复（阻塞导出）</h4>
                    <span className="priority-count">({readinessInfo.criticalProgress.resolved}/{readinessInfo.criticalProgress.total})</span>
                    <span className="priority-desc">不修复将无法导出</span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${readinessInfo.criticalProgress.percent}%` }}
                      ></div>
                    </div>
                    <span className="collapse-toggle">{collapsedGroups.critical ? '▶' : '▼'}</span>
                  </button>
                  {!collapsedGroups.critical && (
                    <ul className="action-list">
                      {readinessInfo.criticalIssues.map((item, index) => {
                        const actionLabel = getIssueActionLabel(item);
                        const actionType = getIssueActionType(item);
                        const fixHint = getIssueFixHint(item);
                        const stepHint = getIssueStepHint(item);
                        const isFirst = index === 0;
                        return (
                          <li key={index} className={`action-item-with-hint ${isFirst ? 'primary-item' : ''}`}>
                            {isFirst && (
                              <div className="primary-item-badge critical">
                                ⚡ 首要阻塞项
                              </div>
                            )}
                            <div className="action-item-header">
                              <span className="action-text">{item.title}</span>
                              <button
                                className={`action-btn critical-btn ${actionType === 'navigate' ? 'navigate' : actionType === 'action' ? 'action-primary' : ''}`}
                                onClick={() => handleProcessIssue(item)}
                                title={item.message}
                              >
                                {actionLabel}
                              </button>
                            </div>
                            {fixHint && (
                              <div className="action-hint">
                                <span className="hint-icon">💡</span>
                                <span className="hint-text">{fixHint}</span>
                                {stepHint && (
                                  <button
                                    className="hint-step-btn"
                                    onClick={() => handleProcessIssue(item)}
                                  >
                                    {stepHint}
                                  </button>
                                )}
                              </div>
                            )}
                            {isFirst && (
                              <div className="primary-item-tip">
                                建议先处理此项以解除导出阻塞
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {readinessInfo.recommendedIssues.length > 0 && (
                <div
                  ref={recommendedGroupRef}
                  className={`action-group priority-recommended ${collapsedGroups.recommended ? 'collapsed' : ''}`}>
                  <button
                    className="action-group-header collapsible-header"
                    onClick={() => toggleCollapseGroup('recommended')}
                  >
                    <span className="priority-indicator recommended">🟡</span>
                    <h4 className="action-title">建议尽快修复</h4>
                    <span className="priority-count">({readinessInfo.recommendedProgress.resolved}/{readinessInfo.recommendedProgress.total})</span>
                    <span className="priority-desc">影响导出质量</span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar recommended"
                        style={{ width: `${readinessInfo.recommendedProgress.percent}%` }}
                      ></div>
                    </div>
                    <span className="collapse-toggle">{collapsedGroups.recommended ? '▶' : '▼'}</span>
                  </button>
                  {!collapsedGroups.recommended && (
                    <ul className="action-list">
                      {readinessInfo.recommendedIssues.slice(0, 3).map((item, index) => {
                        const actionLabel = getIssueActionLabel(item);
                        const actionType = getIssueActionType(item);
                        const fixHint = getIssueFixHint(item);
                        const stepHint = getIssueStepHint(item);
                        const isFirst = index === 0;
                        const isPrimary = isFirst && readinessInfo.criticalIssues.length === 0;
                        return (
                          <li key={index} className={`action-item-with-hint ${isPrimary ? 'primary-item' : ''}`}>
                            {isPrimary && (
                              <div className="primary-item-badge recommended">
                                📌 优先建议
                              </div>
                            )}
                            <div className="action-item-header">
                              <span className="action-text">{item.title}</span>
                              <button
                                className={`action-btn ${actionType === 'navigate' ? 'navigate' : actionType === 'action' ? 'action-primary' : ''}`}
                                onClick={() => handleProcessIssue(item)}
                                title={item.message}
                              >
                                {actionLabel}
                              </button>
                            </div>
                            {fixHint && (
                              <div className="action-hint">
                                <span className="hint-icon">💡</span>
                                <span className="hint-text">{fixHint}</span>
                                {stepHint && (
                                  <button
                                    className="hint-step-btn"
                                    onClick={() => handleProcessIssue(item)}
                                  >
                                    {stepHint}
                                  </button>
                                )}
                              </div>
                            )}
                            {isPrimary && (
                              <div className="primary-item-tip recommended">
                                建议优先查看此项
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {readinessInfo.optionalIssues.length > 0 && (
                <div className={`action-group priority-optional ${collapsedGroups.optional ? 'collapsed' : ''}`}>
                  <button
                    className="action-group-header collapsible-header"
                    onClick={() => toggleCollapseGroup('optional')}
                  >
                    <span className="priority-indicator optional">⚪</span>
                    <h4 className="action-title">可稍后优化</h4>
                    <span className="priority-count">({readinessInfo.optionalProgress.resolved}/{readinessInfo.optionalProgress.total})</span>
                    <span className="priority-desc">不影响导出</span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar optional"
                        style={{ width: `${readinessInfo.optionalProgress.percent}%` }}
                      ></div>
                    </div>
                    <span className="collapse-toggle">{collapsedGroups.optional ? '▶' : '▼'}</span>
                  </button>
                  {!collapsedGroups.optional && (
                    <ul className="action-list">
                      {readinessInfo.optionalIssues.slice(0, 3).map((item, index) => {
                        const actionLabel = getIssueActionLabel(item);
                        const actionType = getIssueActionType(item);
                        const fixHint = getIssueFixHint(item);
                        return (
                          <li key={index} className="action-item">
                            <span className="action-text optional-text">{item.title}</span>
                            <button
                              className={`action-btn ${actionType === 'navigate' ? 'navigate' : ''}`}
                              onClick={() => handleProcessIssue(item)}
                              title={item.message}
                            >
                              {actionLabel}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {readinessInfo.unlinkedPartCount > 0 && !readinessInfo.criticalIssues.some(i => i.id === 'unlinked-parts') && (
                <div className="action-group">
                  <h4 className="action-title">未关联骨骼的部件 ({readinessInfo.unlinkedPartCount})</h4>
                  <div className="action-controls">
                    <button className="action-btn primary" onClick={handleLocateUnlinkedParts}>
                      定位这些部件
                    </button>
                    <div className="bone-selector">
                      <select
                        value={selectedBoneId || ''}
                        onChange={(e) => setSelectedBoneId(e.target.value || null)}
                        className="bone-select"
                      >
                        <option value="">选择骨骼</option>
                        {bones.map(bone => (
                          <option key={bone.id} value={bone.id}>{bone.name}</option>
                        ))}
                      </select>
                      <button
                        className="action-btn"
                        onClick={handleFixUnlinkedParts}
                        disabled={!selectedBoneId}
                      >
                        一键关联
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="navigate-hints">
                <span className="hint-text">需要调整？</span>
                <button className="nav-btn" onClick={handleNavigateToParts}>
                  前往部件编辑
                </button>
                <button className="nav-btn" onClick={handleNavigateToBones}>
                  前往骨骼调整
                </button>
              </div>
            </div>
          )}
        </div>
          </div>
          </div>
        )}

      <div className="export-section export-summary">
        <div className="section-header">
          <span className="section-icon">📋</span>
          <h3>项目信息</h3>
          <span className="section-hint">先确认本次导出的基本范围</span>
        </div>
        <div className="summary-grid">
          <div className="summary-item primary">
            <span className="summary-label">项目名称</span>
            <span className="summary-value">{projectName || '未命名项目'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">导出格式</span>
            <span className="summary-value">本地目录</span>
          </div>
          <div className="summary-item meta">
            <span className="summary-label">部件数</span>
            <span className="summary-value subtle">{parts.length}</span>
          </div>
          <div className="summary-item meta">
            <span className="summary-label">骨骼数</span>
            <span className="summary-value subtle">{bones.length}</span>
          </div>
        </div>
      </div>

      <div className="export-section export-validation">
        <div className="section-header">
          <span className="section-icon">✅</span>
          <h3>校验详情</h3>
          <span className="section-hint">下一步先看这里，确认是否还需要处理问题</span>
        </div>
        <div className="section-bridge">
          读完顶部摘要后，优先查看这里的完整校验结果，再决定是否继续导出。
        </div>
        <ValidationResultComponent
          result={validationResult}
          bones={bones}
          onLocate={onLocate}
          onBatchAssignBone={onBatchAssignBone}
        />
      </div>

      <div className="export-section export-structure section-muted">
        <div className="section-header">
          <span className="section-icon">📁</span>
          <h3>目录结构</h3>
          <span className="section-hint">确认导出组织方式时再展开阅读</span>
        </div>
        <div className="section-bridge compact">
          这部分主要用于补充确认导出结果的文件组织，不应抢在校验判断前面。
        </div>
        <pre className="structure-tree">
          {structure.join('\n')}
        </pre>
      </div>

      <div className="export-section export-notes section-muted">
        <div className="section-header">
          <span className="section-icon">📝</span>
          <h3>导出前补充信息</h3>
          <span className="section-hint">最后确认，可留空</span>
        </div>
        <div className="section-bridge compact">
          这里放的是导出前最后的补充备注与注意点；如果无需补充，可直接进入导出。
        </div>
        <textarea
          className="notes-input"
          placeholder="添加项目备注，方便后续查阅..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <div className="notes-footer">
          <span className="notes-hint">备注不会影响当前导出校验结果</span>
          <span className="notes-count">{notes.length}/500</span>
        </div>
      </div>

      <div className="export-section export-hints section-muted">
        <div className="section-header">
          <span className="section-icon">💡</span>
          <h3>导出前确认</h3>
          <span className="section-hint">只保留真正影响交付理解的信息</span>
        </div>
        <div className="hints-content compact">
          <div className="hint-item inline">
            <span className="hint-category">文件结构</span>
            <p>导出包含完整的骨骼数据、部件配置和层级结构。</p>
          </div>
          <div className="hint-item inline">
            <span className="hint-category">占位目录</span>
            <p><code>parts/</code> 和 <code>preview/</code> 目录当前仍为占位，后续需补充真实内容。</p>
          </div>
          <div className="hint-item inline">
            <span className="hint-category">推荐工具</span>
            <p>建议使用 Spine Editor 4.1+ 打开导出结果。</p>
          </div>
        </div>
      </div>

      <div className="export-action-bar">
        <div className="action-bar-content">
          <div className="action-bar-copy">
            <span className="action-bar-title">
              {validationResult.hasErrors ? '处理完阻塞问题后再导出' : '确认无误后即可导出项目'}
            </span>
            <span className="action-bar-desc">
              {validationResult.hasErrors
                ? '顶部摘要和校验详情已经指出当前阻塞项，请先完成修复。'
                : '若备注和导出前确认都已看过，这里就是最后一步。'}
            </span>
          </div>
          <div className="export-info">
            <span className="export-format">📁 导出格式：本地目录</span>
            <span className="export-count">{parts.length} 部件 · {bones.length} 骨骼</span>
          </div>
          <button
            className={`export-btn ${validationResult.hasErrors ? 'disabled' : ''}`}
            onClick={handleExport}
            disabled={isExporting || validationResult.hasErrors}
            aria-label={isExporting ? '导出中' : '导出项目'}
          >
            {isExporting ? (
              <span className="btn-content">
                <span className="btn-spinner"></span>
                <span>导出中...</span>
              </span>
            ) : (
              <span className="btn-content">
                <span className="btn-icon">📤</span>
                <span>{validationResult.hasErrors ? '当前不可导出' : '导出项目'}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;