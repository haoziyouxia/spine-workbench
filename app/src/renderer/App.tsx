import React, { useRef, useCallback, useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import StepPanel from './components/StepPanel';
import PropertyPanel from './components/PropertyPanel';
import StatusBar from './components/StatusBar';
import { useImage } from './hooks/useImage';
import { useStep } from './hooks/useStep';
import { useParts } from './hooks/useParts';
import { useBones } from './hooks/useBones';
import { useDraft } from './hooks/useDraft';
import { Draft } from './types/draft';
import { ipcRenderer } from 'electron';

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { image, importImage, loadImageFromDataUrl } = useImage();
  const { currentStep, steps, goToStep, getCurrentStepInfo, setCurrentStep } = useStep();
  const {
    parts,
    selectedPart,
    selectedPartId,
    selectedPartIds,
    selectPart,
    renamePart,
    toggleVisibility,
    batchToggleVisibility,
    updateZIndex,
    deletePart,
    batchDeleteParts,
    loadParts,
    addPart,
    createPart,
    updateBbox,
    duplicatePart,
    batchDuplicateParts,
    moveUp,
    moveDown,
    bringToFront,
    sendToBack,
    setPartBoneId,
    batchSetPartBoneId,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryStatus
  } = useParts();
  const {
    bones,
    selectedBone,
    selectedBoneId,
    selectBone,
    updateBonePosition,
    updateBoneRotation,
    updateBoneLength,
    deleteBone,
    renameBone,
    loadBones,
    resetBones,
    addBone,
    connectBones
  } = useBones();

  const [projectName, setProjectName] = useState<string>('');
  const [isCreatePartMode, setIsCreatePartMode] = useState(false);
  const [focusPartIds, setFocusPartIds] = useState<string[]>([]);
  const [focusBoneIds, setFocusBoneIds] = useState<string[]>([]);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [lastDraftPath, setLastDraftPath] = useState<string | null>(null);
  const [lastDraftName, setLastDraftName] = useState<string | null>(null);
  const [draftExists, setDraftExists] = useState<boolean | null>(null);
  const [isCheckingDraft, setIsCheckingDraft] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [bonesActionMessage, setBonesActionMessage] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    if (!bonesActionMessage) return;
    const timer = window.setTimeout(() => setBonesActionMessage(''), 1800);
    return () => window.clearTimeout(timer);
  }, [bonesActionMessage]);

  const handleSelectParts = useCallback((partIds?: string[]) => {
    if (partIds && partIds.length > 0) {
      selectPart(partIds[0], false, partIds);
      goToStep('parts');
    }
  }, [selectPart, goToStep]);

  const handleLocate = useCallback((relatedPartIds?: string[], relatedBoneIds?: string[]) => {
    if (relatedPartIds && relatedPartIds.length > 0) {
      setFocusPartIds(relatedPartIds);
      setFocusBoneIds([]);
      selectPart(relatedPartIds[0], false, relatedPartIds);
      goToStep('parts');
    } else if (relatedBoneIds && relatedBoneIds.length > 0) {
      setFocusBoneIds(relatedBoneIds);
      setFocusPartIds([]);
      selectBone(relatedBoneIds[0]);
      goToStep('bones');
    }
  }, [selectPart, selectBone, goToStep]);

  const handleLocateBone = useCallback((boneId: string) => {
    setFocusBoneIds([boneId]);
    setFocusPartIds([]);
    selectBone(boneId);
  }, [selectBone]);

  const handleAddBone = useCallback(() => {
    const source = selectedBone || bones[0];
    const baseX = source ? source.x + 40 : 260;
    const baseY = source ? source.y + 40 : 260;
    addBone(baseX, baseY);
    setCurrentStep('bones');
    setBonesActionMessage('已添加新骨骼节点');
  }, [addBone, selectedBone, bones, setCurrentStep]);

  const handleConnectSelectedBone = useCallback(() => {
    if (!selectedBoneId) {
      setBonesActionMessage('请先选择要连接的子骨骼');
      return;
    }

    const current = bones.find(b => b.id === selectedBoneId);
    if (!current) {
      setBonesActionMessage('未找到当前骨骼');
      return;
    }

    const parentCandidate = bones.find(b => b.id !== selectedBoneId && !current.parentId) ||
      bones.find(b => b.id !== selectedBoneId);

    if (!parentCandidate) {
      setBonesActionMessage('缺少可用父骨骼，无法连接');
      return;
    }

    const connected = connectBones(parentCandidate.id, selectedBoneId);
    setBonesActionMessage(connected ? `已连接到父骨骼：${parentCandidate.name}` : '连接失败：请避免自连接或循环连接');
  }, [bones, selectedBoneId, connectBones]);


  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importImage(file);
      setProjectName(file.name.replace(/\.[^/.]+$/, ''));
    }
  }, [importImage]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleLoadDraft = useCallback((draft: Draft) => {
    setProjectName(draft.projectName);

    if (draft.imageInfo?.dataUrl) {
      loadImageFromDataUrl(
        draft.imageInfo.dataUrl,
        draft.imageInfo.name,
        draft.imageInfo.width,
        draft.imageInfo.height,
        draft.imageInfo.size,
        new Date(draft.imageInfo.importedAt)
      );
    }

    loadParts(draft.parts);
    loadBones(draft.bones);
    setCurrentStep(draft.currentStep);
  }, [loadImageFromDataUrl, loadParts, loadBones, setCurrentStep]);

  const [isDirty, setIsDirty] = useState(false);

  const handleMarkDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const handleClearDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  useEffect(() => {
    const savedPath = localStorage.getItem('lastDraftPath');
    const savedName = localStorage.getItem('lastDraftName');

    if (savedPath && savedName) {
      setLastDraftPath(savedPath);
      setLastDraftName(savedName);
      checkDraftExists(savedPath);
    }
  }, []);

  const checkDraftExists = async (filePath: string) => {
    setIsCheckingDraft(true);
    try {
      const result = await ipcRenderer.invoke('check-draft-exists', filePath);
      if (result.success) {
        setDraftExists(result.exists);
        if (result.exists) {
          setShowRestorePrompt(true);
        }
      } else {
        setDraftExists(false);
      }
    } catch (error) {
      console.error('Check draft exists error:', error);
      setDraftExists(false);
    } finally {
      setIsCheckingDraft(false);
    }
  };

  const handleClearDraftRecord = useCallback(() => {
    localStorage.removeItem('lastDraftPath');
    localStorage.removeItem('lastDraftName');
    setLastDraftPath(null);
    setLastDraftName(null);
    setDraftExists(false);
    setShowRestorePrompt(false);
  }, []);

  const handleRestoreDraft = useCallback(async () => {
    if (!lastDraftPath) return;

    try {
      const result = await ipcRenderer.invoke('load-draft-from-path', lastDraftPath);

      if (!result.success) {
        alert(result.message);
        setDraftExists(false);
        return;
      }

      const draft: Draft = JSON.parse(result.data);
      handleLoadDraft(draft);
      setShowRestorePrompt(false);
      handleClearDirty();
    } catch (error) {
      alert('加载草稿失败');
      setDraftExists(false);
      console.error('Restore draft error:', error);
    }
  }, [lastDraftPath, handleLoadDraft, handleClearDirty]);

  const handleDismissRestore = useCallback(() => {
    setShowRestorePrompt(false);
  }, []);

  useEffect(() => {
    handleMarkDirty();
  }, [parts, bones, handleMarkDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '您有未保存的修改，确定要离开吗？';
        return '您有未保存的修改，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const { saveDraft, loadDraft } = useDraft({
    image,
    parts,
    bones,
    currentStep,
    projectName: projectName || image.name || '未命名项目',
    onLoadDraft: handleLoadDraft,
    onSaveSuccess: handleClearDirty
  });

  useEffect(() => {
    (window as any).__getDirtyState = () => isDirty;
    (window as any).__triggerSave = async () => {
      if (saveDraft) {
        return await saveDraft();
      }
      return false;
    };

    return () => {
      delete (window as any).__getDirtyState;
      delete (window as any).__triggerSave;
    };
  }, [isDirty, saveDraft]);

  const handleSaveDraft = useCallback(() => {
    saveDraft();
  }, [saveDraft]);

  const handleLoadDraftClick = useCallback(() => {
    loadDraft();
  }, [loadDraft]);

  const handleCreatePart = useCallback((x: number, y: number, width: number, height: number) => {
    createPart(x, y, width, height);
    setIsCreatePartMode(false);
  }, [createPart]);

  const currentStepInfo = getCurrentStepInfo();

  const isPartsStep = currentStep === 'parts' || currentStep === 'correct';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInputFocused) return;

      if (e.key === 'Escape') {
        if (isCreatePartMode) {
          setIsCreatePartMode(false);
        } else {
          selectPart(null, false);
        }
        return;
      }

      if (!isPartsStep) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedPartIds.length > 1) {
          batchDeleteParts(selectedPartIds);
        } else if (selectedPartId) {
          deletePart(selectedPartId);
        }
        e.preventDefault();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedPartIds.length > 1) {
          batchDuplicateParts(selectedPartIds);
        } else if (selectedPartId) {
          duplicatePart(selectedPartId);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreatePartMode, isPartsStep, selectedPartId, selectedPartIds, selectPart, deletePart, duplicatePart, batchDeleteParts, batchDuplicateParts]);

  return (
    <div className="app">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png"
        onChange={handleFileChange}
        className="file-input"
      />

      <header className="header">
        <h1>骨骼动画辅助工作台</h1>
        <div className="project-status">
          <span className="project-name">{projectName || image.name || '未命名项目'}</span>
          <span className="step-indicator">
            当前步骤: {currentStepInfo.name}
          </span>
        </div>
        <div className="header-actions">
          {isPartsStep && (
            <button
              className={`action-btn ${isCreatePartMode ? 'primary' : 'secondary'}`}
              onClick={() => setIsCreatePartMode(!isCreatePartMode)}
            >
              {isCreatePartMode ? '退出创建' : '+ 绘制部件'}
            </button>
          )}
          <button className="action-btn secondary" onClick={handleSaveDraft}>
            保存草稿
          </button>
          <button className="action-btn secondary" onClick={handleLoadDraftClick}>
            加载草稿
          </button>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar-left">
          <StepPanel
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
          />

          {currentStep === 'import' && (
            <>
              <h3>操作</h3>
              <button className="import-btn" onClick={handleImportClick}>
                导入图片
              </button>
            </>
          )}

          {isPartsStep && (
            <div className="tool-section">
              <h3>部件工具</h3>
              <button
                className={`tool-btn ${isCreatePartMode ? 'active' : ''}`}
                onClick={() => setIsCreatePartMode(!isCreatePartMode)}
              >
                {isCreatePartMode ? '✓ 绘制模式' : '绘制部件'}
              </button>
            </div>
          )}

          {currentStep === 'bones' && bonesActionMessage && (
            <div className="tool-section bones-action-message">{bonesActionMessage}</div>
          )}

          {image.src && (
            <div className="tool-section canvas-aid-section">
              <div className="section-header">
                <h3>画布辅助</h3>
                <div className="current-status">
                  <span className="status-dot grid-dot" title="网格状态" style={{ backgroundColor: showGrid ? '#4ecdc4' : '#444444' }}></span>
                  <span className="status-dot snap-dot" title="吸附状态" style={{ backgroundColor: snapToGrid ? '#ffd93d' : '#444444' }}></span>
                </div>
              </div>
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${showGrid ? 'active' : ''}`}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <span className="toggle-icon">▦</span>
                  <span className="toggle-label-text">网格</span>
                </button>
                <button
                  className={`toggle-btn ${snapToGrid ? 'active' : ''}`}
                  onClick={() => setSnapToGrid(!snapToGrid)}
                >
                  <span className="toggle-icon">⤢</span>
                  <span className="toggle-label-text">吸附</span>
                </button>
              </div>
              <div className="grid-size-control">
                <span className="control-label">网格大小:</span>
                <div className="size-buttons">
                  {[10, 20, 40, 50].map(size => (
                    <button
                      key={size}
                      className={`size-btn ${gridSize === size ? 'active' : ''}`}
                      onClick={() => setGridSize(size)}
                      title={`${size}px`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <span className="current-size">当前: {gridSize}px</span>
              </div>
              <div className="aid-hint">
                {snapToGrid && (
                  <span className="hint-icon">✓</span>
                )}
                <span className="hint-text">
                  {snapToGrid ? `吸附已启用，移动对象将对齐到 ${gridSize}px 网格` : '启用吸附可让对象对齐到网格'}
                </span>
              </div>
            </div>
          )}

          {image.src && (
            <div className="status-section">
              <h4>图片信息</h4>
              <div className="status-info">
                <div className="status-item">
                  <span className="status-label">文件名:</span>
                  <span className="status-value">{image.name}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">尺寸:</span>
                  <span className="status-value">{image.width} × {image.height}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">大小:</span>
                  <span className="status-value">{formatSize(image.size)}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        <StatusBar
            selectedPartIds={selectedPartIds}
            parts={parts}
            selectedBoneId={selectedBoneId}
            bones={bones}
            isCreatePartMode={isCreatePartMode}
            currentStep={currentStep}
            stepInfo={getCurrentStepInfo()}
            onUndo={undo}
            onRedo={redo}
            historyStatus={getHistoryStatus()}
            isDirty={isDirty}
          />

        <section className="center-panel">
          <Canvas
            imageSrc={image.src}
            imageName={image.name}
            bones={bones}
            parts={parts}
            selectedBoneId={selectedBoneId}
            selectedPartId={selectedPartId}
            selectedPartIds={selectedPartIds}
            onSelectBone={selectBone}
            onSelectPart={selectPart}
            onDragBone={updateBonePosition}
            onCreatePart={handleCreatePart}
            onUpdatePartBbox={updateBbox}
            showBones={currentStep === 'bones'}
            showParts={isPartsStep}
            isCreatePartMode={isCreatePartMode}
            focusPartIds={focusPartIds}
            focusBoneIds={focusBoneIds}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
          />
          {!image.src && (
            <div className="canvas-overlay">
              <p>请先导入图片开始编辑</p>
            </div>
          )}
          {isCreatePartMode && image.src && (
            <div className="canvas-hint">
              <p>在画布上拖拽创建部件</p>
            </div>
          )}
        </section>

        <aside className="sidebar-right">
          <PropertyPanel
            currentStep={currentStep}
            projectName={projectName || image.name || '未命名项目'}
            imageSrc={image.src}
            parts={parts}
            selectedPart={selectedPart}
            selectedPartId={selectedPartId}
            selectedPartIds={selectedPartIds}
            onSelectPart={selectPart}
            onSelectParts={handleSelectParts}
            onAddPart={addPart}
            onRenamePart={renamePart}
            onToggleVisibility={toggleVisibility}
            onBatchToggleVisibility={batchToggleVisibility}
            onUpdateZIndex={updateZIndex}
            onUpdateBbox={updateBbox}
            onSetPartBoneId={setPartBoneId}
            onBatchSetBoneId={batchSetPartBoneId}
            onDuplicatePart={duplicatePart}
            onBatchDuplicateParts={batchDuplicateParts}
            onMoveUpPart={moveUp}
            onMoveDownPart={moveDown}
            onBringToFrontPart={bringToFront}
            onSendToBackPart={sendToBack}
            onDeletePart={deletePart}
            onBatchDeleteParts={batchDeleteParts}
            bones={bones}
            selectedBone={selectedBone}
            selectedBoneId={selectedBoneId}
            onSelectBone={selectBone}
            onUpdateBoneRotation={updateBoneRotation}
            onUpdateBoneLength={updateBoneLength}
            onDeleteBone={deleteBone}
            onRenameBone={renameBone}
            onLocate={handleLocate}
            onLocateBone={handleLocateBone}
            onNavigateToStep={setCurrentStep}
            onBatchTogglePartVisibility={batchToggleVisibility}
            onAutoGenerateBones={resetBones}
            onAddBone={handleAddBone}
            onConnectSelectedBone={handleConnectSelectedBone}
          />
        </aside>
      </main>

      {showRestorePrompt && (
        <div className="restore-prompt-overlay">
          <div className="restore-prompt">
            {isCheckingDraft ? (
              <div className="restore-prompt-header">
                <h3>检测草稿中...</h3>
              </div>
            ) : draftExists === false ? (
              <>
                <div className="restore-prompt-header">
                  <h3 className="error-title">草稿文件不存在</h3>
                </div>
                <div className="restore-prompt-content">
                  <p>您上次保存的草稿文件已被移动或删除：</p>
                  <p className="draft-path missing">{lastDraftPath}</p>
                  <p className="error-hint">请清除记录或重新保存草稿</p>
                </div>
                <div className="restore-prompt-actions">
                  <button className="restore-btn danger" onClick={handleClearDraftRecord}>
                    清除记录
                  </button>
                  <button className="restore-btn secondary" onClick={handleDismissRestore}>
                    忽略
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="restore-prompt-header">
                  <h3>继续上次工作？</h3>
                </div>
                <div className="restore-prompt-content">
                  <p>检测到您最近保存的草稿：</p>
                  <p className="draft-name">{lastDraftName}</p>
                  <p className="draft-path">{lastDraftPath}</p>
                </div>
                <div className="restore-prompt-actions">
                  <button className="restore-btn primary" onClick={handleRestoreDraft}>
                    继续编辑
                  </button>
                  <button className="restore-btn secondary" onClick={handleDismissRestore}>
                    忽略
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
