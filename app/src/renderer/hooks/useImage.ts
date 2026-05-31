import { useState, useCallback } from 'react';

export interface ImageState {
  src: string | null;
  name: string;
  width: number;
  height: number;
  size: number;
  importedAt: Date | null;
}

const initialState: ImageState = {
  src: null,
  name: '',
  width: 0,
  height: 0,
  size: 0,
  importedAt: null
};

export const useImage = () => {
  const [image, setImage] = useState<ImageState>(initialState);

  const importImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (!file.type.includes('png')) {
      alert('当前仅支持 PNG 格式');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage({
          src: e.target?.result as string,
          name: file.name,
          width: img.width,
          height: img.height,
          size: file.size,
          importedAt: new Date()
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => {
    setImage(initialState);
  }, []);

  const loadImageFromDataUrl = useCallback((
    dataUrl: string,
    name: string,
    width: number,
    height: number,
    size: number,
    importedAt: Date
  ) => {
    setImage({
      src: dataUrl,
      name,
      width,
      height,
      size,
      importedAt
    });
  }, []);

  return {
    image,
    importImage,
    clearImage,
    loadImageFromDataUrl
  };
};