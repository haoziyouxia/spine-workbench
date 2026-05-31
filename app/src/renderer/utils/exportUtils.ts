import { ipcRenderer } from 'electron';
import { Part } from '../types/part';
import { Bone } from '../types/bone';

export interface ExportManifest {
  version: string;
  projectName: string;
  createdAt: string;
  partsCount: number;
  bonesCount: number;
  description: string;
}

export interface ExportHierarchy {
  version: string;
  parts: ExportPart[];
}

export interface ExportPart {
  id: string;
  name: string;
  type: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zIndex: number;
  visible: boolean;
  boneId: string | null;
}

export interface ExportNotes {
  version: string;
  notes: string;
  generatedBy: string;
  generatedAt: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
}

export const EXPORT_VERSION = '1.0.0';

export const createManifest = (projectName: string, parts: Part[], bones: Bone[]): ExportManifest => {
  return {
    version: EXPORT_VERSION,
    projectName: projectName || '未命名项目',
    createdAt: new Date().toISOString(),
    partsCount: parts.length,
    bonesCount: bones.length,
    description: 'Spine Workbench 导出项目'
  };
};

export const createBonesJson = (bones: Bone[]): Bone[] => {
  return bones.map(bone => ({
    ...bone
  }));
};

export const createHierarchy = (parts: Part[]): ExportHierarchy => {
  const sortedParts = [...parts].sort((a, b) => a.zIndex - b.zIndex);

  return {
    version: EXPORT_VERSION,
    parts: sortedParts.map(part => ({
      id: part.id,
      name: part.name,
      type: part.type,
      bbox: {
        x: part.x,
        y: part.y,
        width: part.width,
        height: part.height
      },
      zIndex: part.zIndex,
      visible: part.visible,
      boneId: part.boneId || null
    }))
  };
};

export const createNotes = (notes: string = ''): ExportNotes => {
  return {
    version: EXPORT_VERSION,
    notes: notes || '本项目由 Spine Workbench 生成。',
    generatedBy: 'Spine Workbench',
    generatedAt: new Date().toISOString()
  };
};

export const exportProject = async (
  projectName: string,
  parts: Part[],
  bones: Bone[],
  notes: string = ''
): Promise<ExportResult> => {
  const manifest = createManifest(projectName, parts, bones);
  const bonesJson = createBonesJson(bones);
  const hierarchy = createHierarchy(parts);
  const notesJson = createNotes(notes);

  const files: Record<string, string> = {
    'manifest.json': JSON.stringify(manifest, null, 2),
    'bones.json': JSON.stringify(bonesJson, null, 2),
    'hierarchy.json': JSON.stringify(hierarchy, null, 2),
    'notes.json': JSON.stringify(notesJson, null, 2)
  };

  const result = await ipcRenderer.invoke('export-project', projectName, files);

  if (result.success) {
    alert(result.message);
  } else if (result.message !== '用户取消选择') {
    alert(result.message);
  }

  return result;
};

export const getExportStructure = (projectName: string, parts: Part[], bones: Bone[]): string[] => {
  return [
    `${projectName}/`,
    `  manifest.json          # 项目清单`,
    `  bones.json             # 骨骼数据 (${bones.length} 个骨骼)`,
    `  hierarchy.json         # 部件层级结构 (${parts.length} 个部件)`,
    `  notes.json             # 项目说明`,
    `  parts/                 # 部件图片目录`,
    `    _PLACEHOLDER.md      # 占位说明`,
    `  preview/               # 预览图目录`,
    `    _PLACEHOLDER.md      # 占位说明`
  ];
};