import React from 'react';
import { Bone } from '../types/bone';

interface BoneConnectionsProps {
  bones: Bone[];
}

const BoneConnections: React.FC<BoneConnectionsProps> = ({ bones }) => {
  const connections = bones
    .filter(bone => bone.parentId !== null)
    .map(bone => {
      const parent = bones.find(b => b.id === bone.parentId);
      if (!parent) return null;
      return {
        fromX: parent.x,
        fromY: parent.y,
        toX: bone.x,
        toY: bone.y
      };
    })
    .filter(Boolean);

  return (
    <g className="bone-connections">
      {connections.map((conn, index) => (
        <line
          key={index}
          x1={conn!.fromX}
          y1={conn!.fromY}
          x2={conn!.toX}
          y2={conn!.toY}
          stroke="#533483"
          strokeWidth={2}
          strokeLinecap="round"
          className="bone-line"
        />
      ))}
    </g>
  );
};

export default BoneConnections;