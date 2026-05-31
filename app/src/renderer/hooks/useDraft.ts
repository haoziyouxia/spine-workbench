import { useCallback } from 'react';
import { ipcRenderer } from 'electron';
import { Draft, ImageInfo, DRAFT_VERSION } from '../types/draft';
import { Part } from '../types/part';
import { Bone } from '../types/bone';
import { StepId } from './useStep';
import { ImageState } from './useImage';

export interface UseDraftProps {
  image: ImageState;
  parts: Part[];
  bones: Bone[];
  currentStep: StepId;
  projectName: string;
  onLoadDraft: (draft: Draft) => void;
  onSaveSuccess?: () => void;
}

export const useDraft = ({
  image,
  parts,
  bones,
  currentStep,
  projectName,
  onLoadDraft,
  onSaveSuccess
}: UseDraftProps) => {
  const createDraft = useCallback((): Draft => {
    const imageInfo: ImageInfo | null = image.src ? {
      name: image.name,
      width: image.width,
      height: image.height,
      size: image.size,
      importedAt: image.importedAt?.toISOString() || new Date().toISOString(),
      dataUrl: image.src
    } : null;

    return {
      version: DRAFT_VERSION,
      projectName: projectName || '未命名项目',
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      imageInfo,
      parts: [...parts],
      bones: [...bones],
      currentStep
    };
  }, [image, parts, bones, currentStep, projectName]);

  const saveDraft = useCallback(async () => {
    const draft = createDraft();
    const content = JSON.stringify(draft, null, 2);

    const defaultName = draft.projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');

    const result = await ipcRenderer.invoke('save-draft', content, defaultName);

    if (result.success) {
      if (result.path) {
        localStorage.setItem('lastDraftPath', result.path);
        localStorage.setItem('lastDraftName', draft.projectName);
      }
      alert(result.message);
      onSaveSuccess?.();
      return true;
    } else {
      if (result.message !== '用户取消保存') {
        alert(result.message);
      }
      return false;
    }
  }, [createDraft, onSaveSuccess]);

  const loadDraft = useCallback(async () => {
    const result = await ipcRenderer.invoke('load-draft');

    if (!result.success) {
      if (result.message !== '用户取消选择') {
        alert(result.message);
      }
      return false;
    }

    try {
      const draft: Draft = JSON.parse(result.data);

      if (draft.version !== DRAFT_VERSION) {
        alert(`草稿版本不兼容，当前版本: ${DRAFT_VERSION}，文件版本: ${draft.version}`);
        return false;
      }

      onLoadDraft(draft);
      alert(result.message);
      return true;
    } catch (error) {
      alert('加载草稿失败，文件格式不正确');
      console.error('Load draft error:', error);
      return false;
    }
  }, [onLoadDraft]);

  return {
    createDraft,
    saveDraft,
    loadDraft
  };
};