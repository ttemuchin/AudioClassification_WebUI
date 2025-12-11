import React, { useRef, useState } from 'react';
import { audioFormApi, UploadProgressEvent } from '../http/AudioFormApi';
import './AudioForm.css'

type AudioFormProps = {
  onUploadSuccess?: (file: File, audioData: ArrayBuffer) => void;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (progress: number) => void;
}

const AudioForm: React.FC<AudioFormProps> = ({ 
  onUploadSuccess, 
  onUploadError,
  onUploadProgress
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/flac'
  ];

  const validateFile = (file: File): string | null => {
    // Проверка типа файла
    if (!supportedFormats.includes(file.type)) {
      return `Неподдерживаемый формат: ${file.type}. Поддерживаемые: WAV, MP3, OGG, WEBM, AAC, FLAC`;
    }

    // Проверка размера
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return `Файл слишком большой: ${(file.size / 1024 / 1024).toFixed(2)}MB. Максимум: 20MB`;
    }

    // Проверка на пустой файл
    if (file.size === 0) {
      return 'Файл пустой';
    }

    return null;
  };

  const processAudioFile = async (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Не удалось прочитать файл как ArrayBuffer'));
        }
      };
      
      reader.onerror = () => { reject(new Error('Ошибка чтения файла')); };
      reader.readAsArrayBuffer(file);
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleProgress = (progressEvent: UploadProgressEvent) => {
    const progress = Math.round(progressEvent.progress);
    setUploadProgress(progress);
    onUploadProgress?.(progress);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Валидация
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Обработка аудио
      const audioData = await processAudioFile(file);
    
      // ЗАГЛУШКА
      console.log('Файл обработан:', file.name);
      console.log('Размер файла:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('AudioData размер:', audioData.byteLength, 'bytes');
    
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(progress);
        onUploadProgress?.(progress);
      }
      
      setUploadedFile(file);
            
      // ЗАГЛУШКА

      
    //   const response = await audioFormApi.uploadAudio(file, audioData, {
    //     onProgress: handleProgress
    //   });
      
    //   if (response.success) {
    //     console.log('Файл загружен:', response.message);
    //     setUploadedFile(file);
        
    //     if (response.fileId) {
    //       localStorage.setItem('lastUploadedFileId', response.fileId);
    //     }

    //     onUploadSuccess?.(file, audioData);

    //     } else {
    //     throw new Error(response.message || 'Ошибка загрузки на сервере');
    //     }

    //   // Колбэк при успехе
    //   onUploadSuccess?.(file, audioData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.[0]) {
    //   handleFile(files[0]); игнор промиса
        handleFile(files[0]).catch((error: unknown) => {
        console.error('Upload failed:', error);
        setError('Upload failed');
        });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        void handleFile(files[0]);
    }
  };

  const handleChangeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="audio-uploader">
      <div
        className={`upload-input ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={uploadedFile ? undefined : handleClick}
      >
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка: {uploadProgress}%</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress.toString()}%` }}
              ></div>
            </div>
          </div>
        ) : uploadedFile ? (
          <div className="file-info">
            <div className="file-name">{uploadedFile.name}</div>
            <div className="file-success">✓ Файл успешно загружен</div>
            <button 
              type="button" 
              className="change-file-btn"
              onClick={handleChangeFile}
            >
              Выбрать другой файл
            </button>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">🎵</div>
            <p>
              <strong>Перетащите аудио файл сюда</strong>
              <br />
              или нажмите для выбора
            </p>
            <small>Поддерживаемые форматы: WAV, MP3, OGG, WEBM, AAC, FLAC (до 20MB)</small>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(',')}
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default AudioForm;