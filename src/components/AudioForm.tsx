import React, { useRef, useState } from 'react';
import { audioFormApi, UploadProgressEvent, ClassificationResponse, Prediction } from '../http/AudioFormApi';
import './AudioForm.css';

type AudioFormProps = {
  onModeChange?: (mode: 'file') => void;
  onUploadSuccess?: (file: File, audioData: ArrayBuffer, predictions?: Prediction[]) => void;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (progress: number) => void;
  isStreamActive?: boolean;
}

const AudioForm: React.FC<AudioFormProps> = ({ 
  onUploadSuccess, 
  onUploadError,
  onUploadProgress,
  onModeChange,
  isStreamActive = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

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
    if (!supportedFormats.includes(file.type)) {
      return `Неподдерживаемый формат: ${file.type}. Поддерживаемые: WAV, MP3, OGG, WEBM, AAC, FLAC`;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return `Файл слишком большой: ${(file.size / 1024 / 1024).toFixed(2)}MB. Максимум: 20MB`;
    }

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

  const handleProgress = (progressEvent: UploadProgressEvent) => {
    const progress = Math.round(progressEvent.progress);
    setUploadProgress(progress);
    onUploadProgress?.(progress);
  };

  const handleFile = async (file: File) => {
    if (isStreamActive) {
      setError('Сначала остановите запись с микрофона');
      return;
    }

    setError(null);
    setIsLoading(true);

    onModeChange?.('file');

    try {
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Обработка аудио
      const audioData = await processAudioFile(file);
      
      // API для классификации
      const response: ClassificationResponse = await audioFormApi.uploadAudioForClassification(
        file,
        { onProgress: handleProgress }
      );
      
      // console.log('Server response in AudioForm:', response);
      
      if (response.success && response.predictions !== undefined) {
        // console.log('Файл обработан:', file.name);
        
        onUploadSuccess?.(file, audioData, response.predictions);
      } else {
        throw new Error(response.message || 'Ошибка при обработке аудио');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.log(error);
      // 10 mb limit????
      // Error: Server error: 400 - Unknown error
      // at AudioFormApi.handleError (AudioFormApi.ts:163:16)
      // at AudioFormApi.uploadAudioForClassification (AudioFormApi.ts:121:18)
      // at async handleFile (AudioForm.tsx:98:48)
      console.log(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.[0]) {
      void handleFile(files[0]);
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

  const handleClick = () => {
    if (isStreamActive) {
      setError('Сначала остановите запись с микрофона');
      return;
    }

    onModeChange?.('file');
    fileInputRef.current?.click();
  };

  return (
    <div className="audio-form-container">
      <div className="audio-uploader">
        <div
          // className={`upload-input ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
          className={`upload-input ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''} ${isStreamActive ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
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
          ) : (
      
            <div className="upload-content">
              <div className="upload-icon">📁</div>
              <p>
                <strong>Перетащите аудио файл сюда</strong>
                <br />
                или нажмите для выбора
              </p>
              <small>Поддерживаемые форматы: WAV, MP3, OGG, WEBM, AAC, FLAC (до 20MB)</small>
              
              {isStreamActive && ( // а что хорошая штука
                <div className="stream-warning">
                  ⚠️ Сначала остановите запись с микрофона
                </div>
              )}
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

      </div>

    </div>
  );
};

export default AudioForm;