import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Spine Workbench',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('close', (event) => {
    event.preventDefault();
    handleWindowClose();
  });
}

let isCheckingDirty = false;

async function handleWindowClose() {
  if (!mainWindow) return;

  if (isCheckingDirty) return;
  isCheckingDirty = true;

  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      window.__getDirtyState?.() || false
    `).catch(() => false);

    if (result) {
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: '未保存的修改',
        message: '您有未保存的修改，确定要关闭吗？',
        buttons: ['保存并关闭', '不保存关闭', '取消'],
        defaultId: 0,
        cancelId: 2
      });

      switch (response) {
        case 0:
          const saveResult = await mainWindow.webContents.executeJavaScript(`
            window.__triggerSave?.() || Promise.resolve({ success: false })
          `).catch(() => ({ success: false }));

          if (saveResult && saveResult.success) {
            mainWindow.destroy();
          } else {
            await dialog.showMessageBox(mainWindow, {
              type: 'error',
              title: '保存失败',
              message: '保存草稿失败，请重试或手动保存后再关闭',
              buttons: ['确定']
            });
          }
          break;
        case 1:
          mainWindow.destroy();
          break;
        case 2:
          break;
      }
    } else {
      mainWindow.destroy();
    }
  } finally {
    isCheckingDirty = false;
  }
}

ipcMain.handle('save-draft', async (_event, content: string, defaultName: string) => {
  try {
    const result = await dialog.showSaveDialog({
      title: '保存草稿',
      defaultPath: `${defaultName}.spine-draft`,
      filters: [
        { name: 'Spine Workbench 草稿', extensions: ['spine-draft'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return { success: false, message: '用户取消保存' };
    }

    const filePath = result.filePath!;
    await fs.promises.writeFile(filePath, content, 'utf-8');

    return { success: true, message: `草稿已保存到: ${filePath}`, path: filePath };
  } catch (error) {
    return { success: false, message: `保存失败: ${(error as Error).message}` };
  }
});

ipcMain.handle('load-draft', async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: '加载草稿',
      filters: [
        { name: 'Spine Workbench 草稿', extensions: ['spine-draft'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: '用户取消选择', data: null };
    }

    const filePath = result.filePaths[0];
    const content = await fs.promises.readFile(filePath, 'utf-8');

    return { success: true, message: `草稿已加载: ${filePath}`, data: content };
  } catch (error) {
    return { success: false, message: `加载失败: ${(error as Error).message}`, data: null };
  }
});

ipcMain.handle('load-draft-from-path', async (_event, filePath: string) => {
  try {
    if (!await fs.promises.access(filePath).then(() => true).catch(() => false)) {
      return { success: false, message: '文件不存在', data: null };
    }

    const content = await fs.promises.readFile(filePath, 'utf-8');

    return { success: true, message: `草稿已加载: ${filePath}`, data: content };
  } catch (error) {
    return { success: false, message: `加载失败: ${(error as Error).message}`, data: null };
  }
});

ipcMain.handle('check-draft-exists', async (_event, filePath: string) => {
  try {
    const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
    return { success: true, exists };
  } catch (error) {
    return { success: false, exists: false, message: `检查失败: ${(error as Error).message}` };
  }
});

ipcMain.handle('select-export-directory', async (_event, defaultName: string) => {
  try {
    const result = await dialog.showOpenDialog({
      title: '选择导出目录',
      defaultPath: defaultName,
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: '用户取消选择', path: null };
    }

    return { success: true, message: `选择导出目录: ${result.filePaths[0]}`, path: result.filePaths[0] };
  } catch (error) {
    return { success: false, message: `选择失败: ${(error as Error).message}`, path: null };
  }
});

ipcMain.handle('export-project', async (_event, projectName: string, files: Record<string, string>) => {
  try {
    const result = await dialog.showOpenDialog({
      title: '选择导出目录',
      defaultPath: projectName,
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: '用户取消选择' };
    }

    const basePath = result.filePaths[0];
    const exportDir = path.join(basePath, projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_'));

    await fs.promises.mkdir(exportDir, { recursive: true });

    await fs.promises.mkdir(path.join(exportDir, 'parts'), { recursive: true });
    await fs.promises.mkdir(path.join(exportDir, 'preview'), { recursive: true });

    for (const [filename, content] of Object.entries(files)) {
      const filePath = path.join(exportDir, filename);
      await fs.promises.writeFile(filePath, content, 'utf-8');
    }

    const placeholderContent = `# 占位说明

此目录用于存放部件图片，当前尚未实现自动拆件功能。

如需添加部件图片，请手动将 PNG 格式的部件图片放入此目录，并在 hierarchy.json 中配置对应关系。
`;
    await fs.promises.writeFile(path.join(exportDir, 'parts', '_PLACEHOLDER.md'), placeholderContent, 'utf-8');
    await fs.promises.writeFile(path.join(exportDir, 'preview', '_PLACEHOLDER.md'), placeholderContent, 'utf-8');

    return { success: true, message: `项目已导出到: ${exportDir}` };
  } catch (error) {
    return { success: false, message: `导出失败: ${(error as Error).message}` };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});