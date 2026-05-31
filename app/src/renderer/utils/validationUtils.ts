import { Part } from '../types/part';
import { Bone } from '../types/bone';

export type ValidationLevel = 'info' | 'warning' | 'error';

export interface ValidationItem {
  id: string;
  level: ValidationLevel;
  title: string;
  message: string;
  fixable?: boolean;
  relatedPartIds?: string[];
  relatedBoneIds?: string[];
}

export interface ValidationResult {
  items: ValidationItem[];
  hasErrors: boolean;
  hasWarnings: boolean;
  hasInfos: boolean;
}

export const validateExport = (
  imageSrc: string | null,
  parts: Part[],
  bones: Bone[]
): ValidationResult => {
  const items: ValidationItem[] = [];

  if (!imageSrc) {
    items.push({
      id: 'no-image',
      level: 'error',
      title: '缺少图片',
      message: '尚未导入角色图片，请先导入 PNG 格式图片。'
    });
  }

  if (parts.length === 0) {
    items.push({
      id: 'no-parts',
      level: 'error',
      title: '缺少部件数据',
      message: '当前没有任何部件数据，无法导出。'
    });
  }

  if (bones.length === 0) {
    items.push({
      id: 'no-bones',
      level: 'error',
      title: '缺少骨骼数据',
      message: '当前没有任何骨骼数据，无法导出。'
    });
  }

  const mockParts = parts.filter(p => p.name.startsWith('mock_') || p.name.startsWith('part_'));
  if (mockParts.length > 0) {
    const partNames = mockParts.map(p => p.name).join(', ');
    items.push({
      id: 'mock-parts',
      level: 'warning',
      title: '存在 Mock 部件数据',
      message: `检测到 ${mockParts.length} 个 Mock 部件 (${partNames})，建议替换为真实部件数据。`,
      fixable: false,
      relatedPartIds: mockParts.map(p => p.id)
    });
  }

  const mockBones = bones.filter(b => b.name.startsWith('mock_') || b.name.startsWith('bone_'));
  if (mockBones.length > 0) {
    const boneNames = mockBones.map(b => b.name).join(', ');
    items.push({
      id: 'mock-bones',
      level: 'warning',
      title: '存在 Mock 骨骼数据',
      message: `检测到 ${mockBones.length} 个 Mock 骨骼 (${boneNames})，建议调整为真实骨骼配置。`,
      fixable: false,
      relatedBoneIds: mockBones.map(b => b.id)
    });
  }

  const invisibleParts = parts.filter(p => !p.visible);
  if (invisibleParts.length > 0) {
    const partNames = invisibleParts.map(p => p.name).join(', ');
    items.push({
      id: 'invisible-parts',
      level: 'warning',
      title: '存在隐藏部件',
      message: `有 ${invisibleParts.length} 个部件处于隐藏状态 (${partNames})，导出时将不包含这些部件。`,
      fixable: true,
      relatedPartIds: invisibleParts.map(p => p.id)
    });
  }

  const bonesWithoutParent = bones.filter(b => !b.parentId);
  if (bonesWithoutParent.length > 1) {
    const boneNames = bonesWithoutParent.map(b => b.name).join(', ');
    items.push({
      id: 'multiple-root-bones',
      level: 'info',
      title: '多个根骨骼',
      message: `检测到 ${bonesWithoutParent.length} 个根骨骼 (${boneNames})，建议建立正确的骨骼层级关系。`,
      fixable: true,
      relatedBoneIds: bonesWithoutParent.map(b => b.id)
    });
  }

  const longBoneNames = bones.filter(b => b.name.length > 20);
  if (longBoneNames.length > 0) {
    const boneNames = longBoneNames.map(b => b.name).join(', ');
    items.push({
      id: 'long-bone-names',
      level: 'info',
      title: '骨骼名称过长',
      message: `有 ${longBoneNames.length} 个骨骼名称超过 20 字符 (${boneNames})，建议缩短名称便于管理。`,
      fixable: true,
      relatedBoneIds: longBoneNames.map(b => b.id)
    });
  }

  items.push({
    id: 'placeholder-parts',
    level: 'info',
    title: '部件图片占位',
    message: 'parts 目录当前为占位，导出后需要手动添加部件图片。',
    fixable: false
  });

  items.push({
    id: 'placeholder-preview',
    level: 'info',
    title: '预览图占位',
    message: 'preview 目录当前为占位，导出后需要手动添加预览图片。',
    fixable: false
  });

  const boneIds = new Set(bones.map(b => b.id));

  const partsWithInvalidBoneId = parts.filter(p => p.boneId && !boneIds.has(p.boneId));
  if (partsWithInvalidBoneId.length > 0) {
    const partNames = partsWithInvalidBoneId.map(p => p.name).join(', ');
    items.push({
      id: 'invalid-bone-links',
      level: 'error',
      title: '无效的骨骼关联',
      message: `有 ${partsWithInvalidBoneId.length} 个部件引用了不存在的骨骼: ${partNames}。请检查这些部件的骨骼关联设置。`,
      fixable: true,
      relatedPartIds: partsWithInvalidBoneId.map(p => p.id)
    });
  }

  const partsWithoutBoneLink = parts.filter(p => !p.boneId);
  if (partsWithoutBoneLink.length > 0 && bones.length > 0) {
    const partNames = partsWithoutBoneLink.map(p => p.name).join(', ');
    items.push({
      id: 'unlinked-parts',
      level: 'warning',
      title: '未关联骨骼的部件',
      message: `有 ${partsWithoutBoneLink.length} 个部件未关联任何骨骼: ${partNames}。建议为每个部件关联对应的骨骼以确保正确的蒙皮效果。`,
      fixable: true,
      relatedPartIds: partsWithoutBoneLink.map(p => p.id)
    });
  }

  const bonesWithNoParts = bones.filter(b => !parts.some(p => p.boneId === b.id));
  if (bonesWithNoParts.length > 0 && parts.length > 0) {
    const boneNames = bonesWithNoParts.map(b => b.name).join(', ');
    items.push({
      id: 'unlinked-bones',
      level: 'info',
      title: '未关联部件的骨骼',
      message: `有 ${bonesWithNoParts.length} 个骨骼未关联任何部件: ${boneNames}。如果需要驱动部件变形，请为其关联相应部件。`,
      fixable: true,
      relatedBoneIds: bonesWithNoParts.map(b => b.id)
    });
  }

  const duplicateLinks = parts.reduce((acc, p) => {
    if (p.boneId) {
      acc[p.boneId] = (acc[p.boneId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const bonesWithMultipleParts = Object.entries(duplicateLinks).filter(([, count]) => count > 1);
  if (bonesWithMultipleParts.length > 0) {
    const boneNames = bonesWithMultipleParts
      .map(([boneId]) => bones.find(b => b.id === boneId)?.name || boneId)
      .join(', ');
    items.push({
      id: 'duplicate-bone-links',
      level: 'info',
      title: '骨骼关联多个部件',
      message: `以下骨骼关联了多个部件: ${boneNames}。这可能是预期行为，但建议检查是否需要调整。`,
      fixable: false,
      relatedBoneIds: bonesWithMultipleParts.map(([boneId]) => boneId)
    });
  }

  return {
    items,
    hasErrors: items.some(i => i.level === 'error'),
    hasWarnings: items.some(i => i.level === 'warning'),
    hasInfos: items.some(i => i.level === 'info')
  };
};