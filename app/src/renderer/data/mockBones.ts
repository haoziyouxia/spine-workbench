import { Bone } from '../types/bone';

export const mockBones: Bone[] = [
  {
    id: 'bone-root',
    name: 'root',
    x: 260,
    y: 300,
    parentId: null,
    length: 80,
    rotation: 0
  },
  {
    id: 'bone-body',
    name: 'body',
    x: 260,
    y: 220,
    parentId: 'bone-root',
    length: 100,
    rotation: 0
  },
  {
    id: 'bone-head',
    name: 'head',
    x: 260,
    y: 120,
    parentId: 'bone-body',
    length: 40,
    rotation: 0
  },
  {
    id: 'bone-arm-left',
    name: 'arm_left',
    x: 200,
    y: 180,
    parentId: 'bone-body',
    length: 60,
    rotation: -30
  },
  {
    id: 'bone-arm-right',
    name: 'arm_right',
    x: 320,
    y: 180,
    parentId: 'bone-body',
    length: 60,
    rotation: 30
  },
  {
    id: 'bone-leg-left',
    name: 'leg_left',
    x: 230,
    y: 380,
    parentId: 'bone-root',
    length: 70,
    rotation: -15
  },
  {
    id: 'bone-leg-right',
    name: 'leg_right',
    x: 290,
    y: 380,
    parentId: 'bone-root',
    length: 70,
    rotation: 15
  },
  {
    id: 'bone-hand-left',
    name: 'hand_left',
    x: 150,
    y: 220,
    parentId: 'bone-arm-left',
    length: 20,
    rotation: -45
  },
  {
    id: 'bone-hand-right',
    name: 'hand_right',
    x: 370,
    y: 220,
    parentId: 'bone-arm-right',
    length: 20,
    rotation: 45
  },
  {
    id: 'bone-foot-left',
    name: 'foot_left',
    x: 200,
    y: 450,
    parentId: 'bone-leg-left',
    length: 15,
    rotation: -20
  },
  {
    id: 'bone-foot-right',
    name: 'foot_right',
    x: 320,
    y: 450,
    parentId: 'bone-leg-right',
    length: 15,
    rotation: 20
  }
];