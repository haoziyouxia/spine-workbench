import React, { useState, useCallback } from 'react';
import { Bone } from '../types/bone';

interface BonePointProps {
  bone: Bone;
  isSelected: boolean;
  scale: number;
  onSelect: (boneId: string) => void;
  onDrag: (boneId: string, x: number, y: number) => void;
  snapToGrid?: boolean;
  gridSize?: number;
}

const BonePoint: React.FC<BonePointProps> = ({
  bone,
  isSelected,
  scale,
  onSelect,
  onDrag,
  snapToGrid = false,
  gridSize = 20
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const snapValue = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - bone.x * scale,
      y: e.clientY - bone.y * scale
    });
    onSelect(bone.id);
  }, [bone, scale, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = snapValue((e.clientX - dragOffset.x) / scale);
    const newY = snapValue((e.clientY - dragOffset.y) / scale);
    onDrag(bone.id, newX, newY);
  }, [isDragging, dragOffset, scale, bone.id, onDrag, snapValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const baseRadius = 8;
  const radius = baseRadius * scale;

  return (
    <g
      className={`bone-point ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      transform={`translate(${bone.x}, ${bone.y})`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
    >
      <circle
        r={radius * 1.5}
        fill="rgba(83, 52, 131, 0.3)"
        className="bone-halo"
      />
      <circle
        r={radius}
        fill={isSelected ? '#533483' : '#ffffff'}
        stroke={isSelected ? '#ffffff' : '#533483'}
        strokeWidth={2 * scale}
        className="bone-circle"
      />
      <circle
        r={radius * 0.4}
        fill={isSelected ? '#ffffff' : '#533483'}
        className="bone-center"
      />
      {bone.parentId && (
        <text
          x={radius + 5}
          y={0}
          fill="#888888"
          fontSize={10 * scale}
          textAnchor="start"
          alignmentBaseline="middle"
          className="bone-label"
        >
          {bone.name}
        </text>
      )}
    </g>
  );
};

export default BonePoint;