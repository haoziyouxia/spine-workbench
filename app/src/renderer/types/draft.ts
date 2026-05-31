import { Part } from './part';
import { Bone } from './bone';
import { StepId } from '../hooks/useStep';

export interface Draft {
  version: string;
  projectName: string;
  createdAt: string;
  lastModifiedAt: string;
  imageInfo: ImageInfo | null;
  parts: Part[];
  bones: Bone[];
  currentStep: StepId;
}

export interface ImageInfo {
  name: string;
  width: number;
  height: number;
  size: number;
  importedAt: string;
  dataUrl?: string;
}

export const DRAFT_VERSION = '1.0.0';