import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bone } from '../types/bone';
import { Part } from '../types/part';
import BonePoint from './BonePoint';
import BoneConnections from './BoneConnections';

interface CanvasProps {
  imageSrc: string | null;
  imageName: string;
  bones: Bone[];
  parts: Part[];
  selectedBoneId: string | null;
  selectedPartId: string | null;
  selectedPartIds: string[];
  onSelectBone: (boneId: string) => void;
  onSelectPart: (partId: string | null, multiSelect: boolean, newSelection?: string[]) => void;
  onDragBone: (boneId: string, x: number, y: number) => void;
  onCreatePart: (x: number, y: number, width: number, height: number) => void;
  onUpdatePartBbox: (partId: string, x: number, y: number, width: number, height: number) => void;
  showBones: boolean;
  showParts: boolean;
  isCreatePartMode: boolean;
  focusPartIds?: string[];
  focusBoneIds?: string[];
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

type ResizeHandle = 'none' | 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

const Canvas: React.FC<CanvasProps> = ({
  imageSrc,
  imageName,
  bones,
  parts,
  selectedBoneId,
  selectedPartId,
  selectedPartIds,
  onSelectBone,
  onSelectPart,
  onDragBone,
  onCreatePart,
  onUpdatePartBbox,
  showBones,
  showParts,
  isCreatePartMode,
  focusPartIds = [],
  focusBoneIds = [],
  showGrid = false,
  snapToGrid = false,
  gridSize = 20
}) => {
  const snapValue = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDraggingBone, setIsDraggingBone] = useState(false);
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawEnd, setDrawEnd] = useState({ x: 0, y: 0 });
  const [isDraggingPart, setIsDraggingPart] = useState(false);
  const [isResizingPart, setIsResizingPart] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>('none');
  const [dragPartStart, setDragPartStart] = useState({ x: 0, y: 0 });
  const [dragPartOffset, setDragPartOffset] = useState({ x: 0, y: 0 });
  const [isSelectingBox, setIsSelectingBox] = useState(false);
  const [boxSelectStart, setBoxSelectStart] = useState({ x: 0, y: 0 });
  const [boxSelectEnd, setBoxSelectEnd] = useState({ x: 0, y: 0 });
  const [highlightedPartIds, setHighlightedPartIds] = useState<string[]>([]);
  const [highlightedBoneIds, setHighlightedBoneIds] = useState<string[]>([]);
  const [snapIndicator, setSnapIndicator] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const selectedPart = parts.find(p => p.id === selectedPartId);

  useEffect(() => {
    if ((focusPartIds.length > 0 || focusBoneIds.length > 0) && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const canvasCenterX = canvasRect.width / 2;
      const canvasCenterY = canvasRect.height / 2;

      let targetCenterX = 0;
      let targetCenterY = 0;
      let targetWidth = 0;
      let targetHeight = 0;

      if (focusPartIds.length > 0) {
        const focusParts = parts.filter(p => focusPartIds.includes(p.id));
        if (focusParts.length > 0) {
          const minX = Math.min(...focusParts.map(p => p.x));
          const minY = Math.min(...focusParts.map(p => p.y));
          const maxX = Math.max(...focusParts.map(p => p.x + p.width));
          const maxY = Math.max(...focusParts.map(p => p.y + p.height));
          targetCenterX = (minX + maxX) / 2;
          targetCenterY = (minY + maxY) / 2;
          targetWidth = maxX - minX;
          targetHeight = maxY - minY;
        }
      } else if (focusBoneIds.length > 0) {
        const focusBones = bones.filter(b => focusBoneIds.includes(b.id));
        if (focusBones.length > 0) {
          const minX = Math.min(...focusBones.map(b => b.x));
          const minY = Math.min(...focusBones.map(b => b.y));
          const maxX = Math.max(...focusBones.map(b => b.x));
          const maxY = Math.max(...focusBones.map(b => b.y));
          targetCenterX = (minX + maxX) / 2;
          targetCenterY = (minY + maxY) / 2;
          targetWidth = maxX - minX + 40;
          targetHeight = maxY - minY + 40;
        }
      }

      if (targetWidth > 0 && targetHeight > 0) {
        const fitScale = Math.min(
          canvasRect.width / (targetWidth * 1.5),
          canvasRect.height / (targetHeight * 1.5),
          2
        );
        const newScale = Math.max(fitScale, 0.5);

        const newPositionX = canvasCenterX - targetCenterX * newScale;
        const newPositionY = canvasCenterY - targetCenterY * newScale;

        setScale(newScale);
        setPosition({ x: newPositionX, y: newPositionY });

        setHighlightedPartIds(focusPartIds);
        setHighlightedBoneIds(focusBoneIds);

        setTimeout(() => {
          setHighlightedPartIds([]);
          setHighlightedBoneIds([]);
        }, 2000);
      }
    }
  }, [focusPartIds, focusBoneIds, parts, bones]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(prev + delta, 0.1), 3));
  }, []);

  const getResizeHandle = (part: Part, x: number, y: number): ResizeHandle => {
    const handleSize = 8;

    const isNearLeft = Math.abs(x - part.x) < handleSize;
    const isNearRight = Math.abs(x - (part.x + part.width)) < handleSize;
    const isNearTop = Math.abs(y - part.y) < handleSize;
    const isNearBottom = Math.abs(y - (part.y + part.height)) < handleSize;

    if (isNearLeft && isNearTop) return 'nw';
    if (isNearTop && isNearRight) return 'ne';
    if (isNearLeft && isNearBottom) return 'sw';
    if (isNearRight && isNearBottom) return 'se';
    if (isNearTop) return 'n';
    if (isNearBottom) return 's';
    if (isNearLeft) return 'w';
    if (isNearRight) return 'e';
    return 'none';
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDraggingBone) return;

    const rect = (canvasRef.current?.getBoundingClientRect())!;
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;

    const multiSelect = e.ctrlKey || e.metaKey;

    if (isCreatePartMode) {
      setIsDrawingRect(true);
      setDrawStart({ x, y });
      setDrawEnd({ x, y });
      return;
    }

    if (selectedPart) {
      const handle = getResizeHandle(selectedPart, x, y);

      if (handle !== 'none') {
        setIsResizingPart(true);
        setResizeHandle(handle);
        setDragPartStart({ x, y });
        return;
      }

      const isInsidePart = x >= selectedPart.x && x <= selectedPart.x + selectedPart.width &&
                          y >= selectedPart.y && y <= selectedPart.y + selectedPart.height;

      if (isInsidePart) {
        setIsDraggingPart(true);
        setDragPartStart({ x, y });
        setDragPartOffset({ x: x - selectedPart.x, y: y - selectedPart.y });
        return;
      }
    }

    const visibleParts = parts.filter(p => p.visible);
    const clickedParts = visibleParts.filter(part =>
      x >= part.x && x <= part.x + part.width &&
      y >= part.y && y <= part.y + part.height
    );

    if (clickedParts.length > 0) {
      const sortedByZIndex = [...clickedParts].sort((a, b) => b.zIndex - a.zIndex);
      const topPart = sortedByZIndex[0];
      onSelectPart(topPart.id, multiSelect);
      return;
    }

    if (!multiSelect) {
      onSelectPart(null, false);
    }

    setIsSelectingBox(true);
    setBoxSelectStart({ x, y });
    setBoxSelectEnd({ x, y });
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position, isDraggingBone, isCreatePartMode, scale, selectedPart, parts, onSelectPart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingBone) return;

    if (isDrawingRect) {
      const rect = (canvasRef.current?.getBoundingClientRect())!;
      const x = snapValue((e.clientX - rect.left - position.x) / scale);
      const y = snapValue((e.clientY - rect.top - position.y) / scale);
      setDrawEnd({ x, y });
      return;
    }

    if (isSelectingBox) {
      const rect = (canvasRef.current?.getBoundingClientRect())!;
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      setBoxSelectEnd({ x, y });
      return;
    }

    if (isResizingPart && selectedPart && resizeHandle !== 'none') {
      const rect = (canvasRef.current?.getBoundingClientRect())!;
      const x = snapValue((e.clientX - rect.left - position.x) / scale);
      const y = snapValue((e.clientY - rect.top - position.y) / scale);

      let newX = selectedPart.x;
      let newY = selectedPart.y;
      let newWidth = selectedPart.width;
      let newHeight = selectedPart.height;

      const dx = x - dragPartStart.x;
      const dy = y - dragPartStart.y;

      if (resizeHandle.includes('w')) {
        const delta = Math.max(-selectedPart.width + 20, dx);
        newX = snapValue(selectedPart.x + delta);
        newWidth = Math.max(20, Math.round((selectedPart.width - delta) / gridSize) * gridSize);
      }
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(20, Math.round((selectedPart.width + dx) / gridSize) * gridSize);
      }
      if (resizeHandle.includes('n')) {
        const delta = Math.max(-selectedPart.height + 20, dy);
        newY = snapValue(selectedPart.y + delta);
        newHeight = Math.max(20, Math.round((selectedPart.height - delta) / gridSize) * gridSize);
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(20, Math.round((selectedPart.height + dy) / gridSize) * gridSize);
      }

      onUpdatePartBbox(selectedPart.id, newX, newY, newWidth, newHeight);
      setDragPartStart({ x, y });
      return;
    }

    if (isDraggingPart && selectedPart) {
      const rect = (canvasRef.current?.getBoundingClientRect())!;
      const x = snapValue((e.clientX - rect.left - position.x) / scale);
      const y = snapValue((e.clientY - rect.top - position.y) / scale);

      const newX = x - dragPartOffset.x;
      const newY = y - dragPartOffset.y;

      if (snapToGrid) {
        setSnapIndicator({ x: newX + selectedPart.width / 2, y: newY + selectedPart.height / 2, visible: true });
      }

      onUpdatePartBbox(selectedPart.id, newX, newY, selectedPart.width, selectedPart.height);
      return;
    }

    if (!isDragging) return;
    if (!isSelectingBox) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, isDraggingBone, isDrawingRect, isDraggingPart, isResizingPart, resizeHandle, dragPartStart, dragPartOffset, position, scale, selectedPart, onUpdatePartBbox, isSelectingBox]);

  const handleMouseUp = useCallback(() => {
    if (isDrawingRect) {
      const width = Math.abs(drawEnd.x - drawStart.x);
      const height = Math.abs(drawEnd.y - drawStart.y);

      if (width > 10 && height > 10) {
        const x = Math.min(drawStart.x, drawEnd.x);
        const y = Math.min(drawStart.y, drawEnd.y);
        onCreatePart(x, y, width, height);
      }
      setIsDrawingRect(false);
    }

    if (isSelectingBox) {
      const width = Math.abs(boxSelectEnd.x - boxSelectStart.x);
      const height = Math.abs(boxSelectEnd.y - boxSelectStart.y);

      if (width > 10 && height > 10) {
        const boxX = Math.min(boxSelectStart.x, boxSelectEnd.x);
        const boxY = Math.min(boxSelectStart.y, boxSelectEnd.y);
        const boxWidth = width;
        const boxHeight = height;

        const visibleParts = parts.filter(p => p.visible);
        const selectedByBox = visibleParts.filter(part => {
          const partCenterX = part.x + part.width / 2;
          const partCenterY = part.y + part.height / 2;
          return partCenterX >= boxX && partCenterX <= boxX + boxWidth &&
                 partCenterY >= boxY && partCenterY <= boxY + boxHeight;
        });

        if (selectedByBox.length > 0) {
          onSelectPart(selectedByBox[0].id, true, selectedByBox.map(p => p.id));
        }
      }
      setIsSelectingBox(false);
    }

    setIsDragging(false);
    setIsDraggingPart(false);
    setIsResizingPart(false);
    setResizeHandle('none');
    setSnapIndicator({ x: 0, y: 0, visible: false });
  }, [isDrawingRect, drawStart, drawEnd, onCreatePart, isSelectingBox, boxSelectStart, boxSelectEnd, parts, onSelectPart]);

  const handleBoneDragStart = useCallback(() => {
    setIsDraggingBone(true);
  }, []);

  const handleBoneDragEnd = useCallback(() => {
    setIsDraggingBone(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseLeave = () => {
      setIsDragging(false);
      setIsDraggingBone(false);
      setIsDraggingPart(false);
      setIsResizingPart(false);
      setResizeHandle('none');
      if (isDrawingRect) {
        setIsDrawingRect(false);
      }
      if (isSelectingBox) {
        setIsSelectingBox(false);
      }
    };
    canvas.addEventListener('mouseleave', handleMouseLeave);
    return () => canvas.removeEventListener('mouseleave', handleMouseLeave);
  }, [isDrawingRect, isSelectingBox]);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageSrc]);

  const getCursor = () => {
    if (isCreatePartMode) return 'crosshair';
    if (isDraggingPart) return 'move';
    if (isResizingPart) {
      switch (resizeHandle) {
        case 'nw': return 'nwse-resize';
        case 'ne': return 'nesw-resize';
        case 'sw': return 'nesw-resize';
        case 'se': return 'nwse-resize';
        case 'n': case 's': return 'ns-resize';
        case 'w': case 'e': return 'ew-resize';
        default: return 'default';
      }
    }
    if (isDragging && !isSelectingBox) return 'grabbing';
    return 'grab';
  };

  const drawRectWidth = Math.abs(drawEnd.x - drawStart.x);
  const drawRectHeight = Math.abs(drawEnd.y - drawStart.y);
  const drawRectX = Math.min(drawStart.x, drawEnd.x);
  const drawRectY = Math.min(drawStart.y, drawEnd.y);

  const boxSelectWidth = Math.abs(boxSelectEnd.x - boxSelectStart.x);
  const boxSelectHeight = Math.abs(boxSelectEnd.y - boxSelectStart.y);
  const boxSelectX = Math.min(boxSelectStart.x, boxSelectEnd.x);
  const boxSelectY = Math.min(boxSelectStart.y, boxSelectEnd.y);

  return (
    <div
      ref={canvasRef}
      className={`canvas-container ${isCreatePartMode ? 'create-part-mode' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: getCursor() }}
    >
      {!imageSrc ? (
        <div className="canvas-placeholder">
          <div className="placeholder-content">
            <p>请导入一张图片</p>
            <p className="hint">支持 PNG 格式</p>
          </div>
        </div>
      ) : (
        <div
          className="canvas-content"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={imageSrc}
            alt={imageName}
            className="canvas-image"
            draggable={false}
          />

          {showParts && (
            <svg className="parts-layer" style={{ position: 'absolute', top: 0, left: 0 }}>
              {parts.filter(p => p.visible).sort((a, b) => a.zIndex - b.zIndex).map(part => {
                const isSelected = selectedPartIds.includes(part.id);
                const isPrimary = selectedPartId === part.id;
                const isHighlighted = highlightedPartIds.includes(part.id);

                return (
                  <g key={part.id}>
                    <rect
                      x={part.x}
                      y={part.y}
                      width={part.width}
                      height={part.height}
                      className={`part-bbox ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                      stroke={isSelected ? '#ff6b6b' : isHighlighted ? '#4ecdc4' : '#533483'}
                      strokeWidth={isSelected ? '3' : isHighlighted ? '4' : '2'}
                      fill={isSelected ? 'rgba(255, 107, 107, 0.15)' : isHighlighted ? 'rgba(78, 205, 196, 0.3)' : 'transparent'}
                      strokeDasharray={isSelected ? '0' : isHighlighted ? '0' : '5,5'}
                    />
                    {isHighlighted && (
                      <rect
                        x={part.x - 5}
                        y={part.y - 5}
                        width={part.width + 10}
                        height={part.height + 10}
                        fill="none"
                        stroke="#4ecdc4"
                        strokeWidth="2"
                        className="highlight-pulse"
                      />
                    )}
                    {isPrimary && (
                      <>
                        <rect
                          x={part.x}
                          y={part.y}
                          width={part.width}
                          height={part.height}
                          fill="none"
                          stroke="#ff6b6b"
                          strokeWidth="1"
                          strokeDasharray="8,4"
                        />
                        <circle cx={part.x} cy={part.y} r={6} className="resize-handle" />
                        <circle cx={part.x + part.width} cy={part.y} r={6} className="resize-handle" />
                        <circle cx={part.x} cy={part.y + part.height} r={6} className="resize-handle" />
                        <circle cx={part.x + part.width} cy={part.y + part.height} r={6} className="resize-handle" />
                        <circle cx={part.x + part.width / 2} cy={part.y} r={6} className="resize-handle" />
                        <circle cx={part.x + part.width / 2} cy={part.y + part.height} r={6} className="resize-handle" />
                        <circle cx={part.x} cy={part.y + part.height / 2} r={6} className="resize-handle" />
                        <circle cx={part.x + part.width} cy={part.y + part.height / 2} r={6} className="resize-handle" />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {isDrawingRect && (
            <svg className="draw-layer" style={{ position: 'absolute', top: 0, left: 0 }}>
              <rect
                x={drawRectX}
                y={drawRectY}
                width={drawRectWidth}
                height={drawRectHeight}
                className="draw-rect"
                stroke="#4ecdc4"
                strokeWidth="2"
                fill="rgba(78, 205, 196, 0.2)"
              />
            </svg>
          )}

          {isSelectingBox && (boxSelectWidth > 5 || boxSelectHeight > 5) && (
            <svg className="box-select-layer" style={{ position: 'absolute', top: 0, left: 0 }}>
              <rect
                x={boxSelectX}
                y={boxSelectY}
                width={boxSelectWidth}
                height={boxSelectHeight}
                className="box-select-rect"
                stroke="#ffd93d"
                strokeWidth="2"
                fill="rgba(255, 217, 61, 0.15)"
              />
            </svg>
          )}

          {showBones && (
            <svg className="bones-layer" style={{ position: 'absolute', top: 0, left: 0 }}>
              <BoneConnections bones={bones} />
              {bones.map(bone => {
                const isHighlighted = highlightedBoneIds.includes(bone.id);
                return (
                  <g key={bone.id}>
                    {isHighlighted && (
                      <circle
                        cx={bone.x}
                        cy={bone.y}
                        r={20}
                        fill="rgba(78, 205, 196, 0.2)"
                        className="highlight-pulse"
                      />
                    )}
                    <BonePoint
                      bone={bone}
                      isSelected={selectedBoneId === bone.id}
                      scale={scale}
                      onSelect={(id) => {
                        handleBoneDragStart();
                        onSelectBone(id);
                      }}
                      onDrag={(id, x, y) => {
                        onDragBone(id, x, y);
                      }}
                      snapToGrid={snapToGrid}
                      gridSize={gridSize}
                    />
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      )}

      <div className="canvas-controls">
        <button
          type="button"
          className="control-btn"
          onClick={() => setScale(prev => Math.max(prev - 0.1, 0.1))}
          aria-label="缩小画布"
        >
          -
        </button>
        <span className="scale-display">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="control-btn"
          onClick={() => setScale(prev => Math.min(prev + 0.1, 3))}
          aria-label="放大画布"
        >
          +
        </button>
        <button
          type="button"
          className="control-btn"
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
          aria-label="重置画布视图"
        >
          重置
        </button>
      </div>

      {imageSrc && showGrid && (
        <svg className="grid-layer" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <pattern
              id="grid"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke="rgba(83, 52, 131, 0.3)"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="grid-highlight"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={gridSize/2} cy={gridSize/2} r="3" fill="rgba(78, 205, 196, 0.5)" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
          />
        </svg>
      )}

      {snapIndicator.visible && snapToGrid && imageSrc && (
        <svg className="snap-indicator-layer" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle
            cx={snapIndicator.x}
            cy={snapIndicator.y}
            r="12"
            fill="rgba(78, 205, 196, 0.3)"
            className="snap-pulse"
          />
          <circle
            cx={snapIndicator.x}
            cy={snapIndicator.y}
            r="6"
            fill="#4ecdc4"
          />
        </svg>
      )}
    </div>
  );
};

export default Canvas;
