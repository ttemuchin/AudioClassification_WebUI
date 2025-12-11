import "./App.css"
import { useState } from 'react';
import AudioForm from "./components/AudioForm";
import AudioStream from "./components/AudioStream";
import Results from './components/Results'
import { Prediction } from "./http/AudioFormApi"

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [filePredictions, setFilePredictions] = useState<Prediction[]>([]);
  const [streamPredictions, setStreamPredictions] = useState<Prediction[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'file' | 'stream' | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);

  const handleUploadSuccess = (file: File, audioData: ArrayBuffer, predictions?: Prediction[]) => {
    const url = URL.createObjectURL(file); 
    setUploadedFile(file);
    setAudioUrl(url);
    setError(null);
    setMode('file');
    
    if (predictions && predictions.length > 0) {
      setFilePredictions(predictions);
      setStatus('Анализ завершен');
    } else {
      setStatus('Аудио загружено, но результаты не получены');
    }
  };

  const handleFileModeChange = () => {
    if (isStreamActive) {
      stopStream();
    }

    setMode('file');
    setUploadedFile(null);
    setAudioUrl(null);
    setFilePredictions([]);
    setStreamPredictions([]);
    setStatus('Выберите аудио файл для анализа');
    setError(null);
  };

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
    setStatus(`Ошибка: ${errorMsg}`);
  };

  const handleStreamStart = () => {
    setUploadedFile(null);
    setAudioUrl(null);
    setFilePredictions([]);
    setStreamPredictions([]);
    setStatus('Тишина');
    setError(null);

    setTimeout(() => {
      setMode('stream');
      setIsStreamActive(true);
      setStatus('Анализ потока');
    }, 2000);
  };

  const handleStreamError = (errorMsg: string) => {
    setError(errorMsg);
    setStatus(`Ошибка: ${errorMsg}`);
  };

  const handleStreamStop = () => {
    setIsStreamActive(false);
    setMode(null);
    setStatus('Запись остановлена');
  };

  const stopStream = () => {
    // Здесь нужна логика для остановки медиастрима
    // через ref или глобальную переменную
    // пока так
    setIsStreamActive(false);
  };
  
  return (
    <div className="app">
      <div className="app-left">
        <AudioForm
          onModeChange={handleFileModeChange}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}

          isStreamActive={isStreamActive}
        />
        <AudioStream
          onStreamStart={handleStreamStart}
          onStreamError={handleStreamError}

                    // onModeChange={handleFileModeChange}

          onStreamStop={handleStreamStop}
          isActive={isStreamActive}
        />
      </div>
      
      <div className="app-right">
        <Results
          uploadedFile={uploadedFile}
          audioUrl={audioUrl}
          status={status}
          error={error}
          filePredictions={filePredictions}
          streamPredictions={streamPredictions}
          mode={mode} 
          predictions={[]}        
        />
      </div>
    </div>
  );
}

export default App;
