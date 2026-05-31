export interface Bone {
  id: string;
  name: string;
  x: number;
  y: number;
  parentId: string | null;
  length: number;
  rotation: number;
}

export interface BoneConnection {
  fromId: string;
  toId: string;
}