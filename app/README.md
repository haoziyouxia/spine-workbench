# Spine Workbench

A Spine auxiliary production tool for game development workflow.

## Quick Start

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build & Run

```bash
npm run build
npm start
```

## Usage Walkthrough

This section describes a complete workflow from importing an image to exporting a project.

### 1. Import Image

1. Click the **选择图片** button in the "导入" step
2. Select a PNG image file
3. The image will appear in the canvas with zoom controls

### 2. Create Parts

1. Click the **创建部件** button in the toolbar to enter creation mode
2. Click and drag on the canvas to draw a bounding box
3. The new part will appear in the parts list on the right panel
4. Double-click the part name to rename it
5. Adjust position and size by dragging on the canvas

### 3. Adjust Parts

- **Select**: Click on a part to select it
- **Move**: Drag a selected part to move it
- **Resize**: Drag the corner handles to resize
- **Delete**: Select a part and click the delete button or use the list context menu
- **Visibility**: Toggle visibility using the eye icon in the list
- **Z-index**: Adjust layer order using the up/down buttons

### 4. Create Bones

1. Navigate to the **骨点调整** step
2. Click on the canvas to create bone points (or use the toolbar buttons)
3. Drag bone points to adjust their position
4. Use the property panel to adjust rotation and length
5. Double-click bone names to rename them

### 5. Link Parts to Bones

1. Select a part from the parts list
2. In the part detail panel, select a bone from the dropdown
3. The part will now be linked to that bone
4. View linked parts in the bone detail panel

### 6. Save Draft

1. Click **保存草稿** from the menu
2. Choose a location to save the `.spine-draft` file
3. The draft includes the image, parts, bones, and current state

### 7. Export Project

1. Navigate to the **导出** step
2. Review the validation results:
   - ❌ **Errors**: Must be fixed before export
   - ⚠️ **Warnings**: Recommended to address
   - ℹ️ **Info**: Additional information
3. Click **导出项目** and select an export directory
4. The project will be exported with JSON files

## Project Structure

```
app/
├── src/
│   ├── main/                    # Electron main process
│   │   └── main.ts              # Main process entry with IPC handlers
│   └── renderer/                # React renderer process
│       ├── App.tsx              # Main app component
│       ├── index.tsx            # Renderer entry
│       ├── index.css            # Global styles
│       ├── index.html           # HTML template
│       ├── components/          # React components
│       │   ├── Canvas.tsx       # Canvas for image and bone editing
│       │   ├── StepPanel.tsx    # Workflow step navigation
│       │   ├── PropertyPanel.tsx # Dynamic property panel
│       │   ├── PartsPanel.tsx   # Parts list panel
│       │   ├── PartDetail.tsx   # Part detail editor
│       │   ├── BonePoint.tsx    # Draggable bone point
│       │   ├── BoneConnections.tsx # Bone connections renderer
│       │   ├── BoneDetail.tsx   # Bone detail editor
│       │   ├── ExportPreview.tsx # Export preview component
│       │   └── ValidationResult.tsx # Validation results
│       ├── hooks/               # Custom React hooks
│       │   ├── useImage.ts      # Image state management
│       │   ├── useStep.ts       # Workflow step management
│       │   ├── useParts.ts      # Parts state management
│       │   ├── useBones.ts      # Bones state management
│       │   └── useDraft.ts      # Draft save/load management
│       ├── types/               # TypeScript types
│       │   ├── part.ts          # Part type definition
│       │   ├── bone.ts          # Bone type definition
│       │   └── draft.ts         # Draft type definition
│       ├── data/                # Mock data
│       │   ├── mockParts.ts     # Mock parts data
│       │   └── mockBones.ts     # Mock bones data
│       └── utils/               # Utility functions
│           ├── exportUtils.ts   # Export utilities
│           └── validationUtils.ts # Validation utilities
├── dist/                        # Build output
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript config for renderer
├── tsconfig.main.json           # TypeScript config for main
├── webpack.renderer.config.js   # Webpack config
└── .gitignore                  # Git ignore rules
```

## Workflow Steps

1. **导入** - Import character PNG images
2. **拆件建议** - Auto-segmentation suggestions (placeholder)
3. **人工修正** - Manual parts adjustment
4. **骨点调整** - Bone structure editing
5. **导出** - Export Spine-ready package

## Implemented Features

### ✅ Fully Implemented

1. **Image Import & Preview**
   - PNG image import
   - Canvas zoom and pan
   - Image information display

2. **Parts Management**
   - Parts list display (mock data)
   - Part selection (single and multi-select)
   - Part renaming
   - Visibility toggle
   - Z-index adjustment
   - Part deletion (single and batch)
   - Part duplication
   - Batch operations
   - Undo/redo for part operations

3. **Bone Editing**
   - Bone points display on canvas
   - Bone selection
   - Draggable bone points
   - Bone rotation adjustment
   - Bone length adjustment
   - Bone connections visualization
   - Bone deletion with confirmation
   - Bone renaming
   - Quick actions in bone list

4. **Draft Save/Load**
   - Native file dialog for save/load
   - JSON-based draft format (.spine-draft)
   - Saves: image (base64), parts, bones, current step
   - Version compatibility check
   - Dirty state detection
   - Close warning for unsaved changes

5. **Export**
   - Real local directory export
   - JSON files generation
   - Export preview with validation
   - Error/warning/info validation levels
   - Export button disabled on errors
   - Validation filtering and collapsing

6. **Validation**
   - Missing image check (blocking)
   - Missing parts check (blocking)
   - Missing bones check (blocking)
   - Mock data detection (warning)
   - Hidden parts detection (warning)
   - Unlinked parts detection (warning)
   - Multiple root bones detection (info)
   - Placeholder directory notices (info)
   - Batch repair for unlinked parts

7. **User Experience**
   - Status bar with selection info
   - Undo/redo buttons with history counter
   - Canvas focus and highlight on selection
   - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### ⚠️ Placeholder / Not Implemented

1. **Auto Segmentation** - Parts panel shows mock data only
2. **Parts Image Export** - parts/ directory contains placeholder only
3. **Preview Image Export** - preview/ directory contains placeholder only
4. **Auto Bone Generation** - Manual editing only
5. **Bone Connection Logic** - Visual only, no actual connection system
6. **Real Spine Format** - Export is JSON skeleton, not Spine project

## Export Directory Structure

```
exported_project/
├── manifest.json          # Project metadata
├── bones.json             # Bone definitions
├── hierarchy.json         # Parts hierarchy
├── notes.json             # Project notes
├── parts/                 # Parts images (placeholder)
│   └── _PLACEHOLDER.md    # Placeholder explanation
└── preview/               # Preview images (placeholder)
    └── _PLACEHOLDER.md    # Placeholder explanation
```

### Example manifest.json

```json
{
  "version": "1.0.0",
  "projectName": "my_character",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "partsCount": 11,
  "bonesCount": 11,
  "description": "Spine Workbench 导出项目"
}
```

### Example bones.json

```json
[
  {
    "id": "bone-head",
    "name": "head",
    "x": 200,
    "y": 100,
    "parentId": null,
    "length": 50,
    "rotation": 0
  }
]
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+Click | Multi-select parts |

## Known Limitations

1. **Image Storage**: Images stored as base64 in draft files, large images may cause oversized files
2. **Auto Segmentation**: No actual image segmentation algorithm implemented
3. **Parts Export**: Parts are not actually cropped from the source image
4. **Bone Connections**: Visual only, no functional bone hierarchy system
5. **Export Format**: JSON skeleton only, not a complete Spine project
6. **Multi-project**: Single project at a time

## Technical Stack

- Electron 28.x
- React 18.x
- TypeScript
- Webpack 5.x
- CSS3

## License

MIT
