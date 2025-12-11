import React, { useState, useRef } from 'react';
import './AudioStream.css';

type AudioStreamProps = {
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onStreamError?: (error: string) => void;
  isActive?: boolean;
}

const AudioStream: React.FC<AudioStreamProps> = ({ 
  onStreamStart, 
  onStreamStop,
  onStreamError,
  isActive = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      setIsLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000 // !!!
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Обработка данных 
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // ,===> oтправка данных на сервер
          console.log('Audio chunk:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsLoading(false);
      onStreamStart?.();
      
      console.log('Recording started');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось получить доступ к микрофону';
      setIsLoading(false);
      onStreamError?.(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => { track.stop(); });
    }
    
    setIsRecording(false);
    onStreamStop?.();
    console.log('Recording stopped');
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  };

  return (
    <div className="audio-stream">
      <div
        // className={`stream-input ${isRecording ? 'recording' : ''} ${isLoading ? 'loading' : ''}`}
        className={`stream-input ${isRecording ? 'recording' : ''} ${isLoading ? 'loading' : ''} ${isActive && !isRecording ? 'inactive' : ''}`}
        onClick={handleClick}
      >
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Подключаемся к микрофону...</p>
          </div>
        ) : (
          <div className="stream-content">
            <div className="stream-icon">
              🔈
            </div>
            <p>
              <strong>
                {isRecording ? 'Идет запись...' : 'Запись с микрофона'}
              </strong>
              <br />
              {isRecording ? 'Нажмите чтобы остановить' : 'Нажмите чтобы начать запись'}
            </p>
            {isRecording && (
              <div className="recording-indicator">
                <div className="pulse-dot"></div>
                <span>Запись</span>
              </div>
            )}
            {isActive && !isRecording && (
              <div className="stream-status">
                Готов к записи
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default AudioStream;