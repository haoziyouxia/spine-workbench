export interface Part {
  id: string;
  name: string;
  type: PartType;
  zIndex: number;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  boneId: string | null;
}

export type PartType =
  | 'head'
  | 'body'
  | 'arm_left'
  | 'arm_right'
  | 'leg_left'
  | 'leg_right'
  | 'hair'
  | 'eye_left'
  | 'eye_right'
  | 'mouth'
  | 'accessory'
  | 'unknown';

export const partTypeLabels: Record<PartType, string> = {
  head: '头部',
  body: '身体',
  arm_left: '左臂',
  arm_right: '右臂',
  leg_left: '左腿',
  leg_right: '右腿',
  hair: '头发',
  eye_left: '左眼',
  eye_right: '右眼',
  mouth: '嘴巴',
  accessory: '配饰',
  unknown: '未知'
};