import React from 'react';
import StreamLog, { StreamPrediction } from './StreamLog';
import './Results.css';

export type Prediction = {
  class: string;
  confidence: number;
}

type ResultsProps = {
  uploadedFile: File | null;
  audioUrl: string | null;
  status: string | null;
  error: string | null;
  predictions: Prediction[];
  filePredictions: Prediction[];
  streamPredictions: Prediction[];
  mode: 'file' | 'stream' | null;
}

const Results: React.FC<ResultsProps> = ({
  uploadedFile,
  audioUrl,
  status,
  error,
  filePredictions,
  streamPredictions,
  mode
}) => {
  const mockStreamData: StreamPrediction[] = [
    { id: 1, timestamp: new Date(Date.now() - 4000).toISOString(), prediction: 'Речь', confidence: 0.85 },
    { id: 2, timestamp: new Date(Date.now() - 3000).toISOString(), prediction: 'Музыка', confidence: 0.72 },
    { id: 3, timestamp: new Date(Date.now() - 2000).toISOString(), prediction: 'Тишина', confidence: 0.95 },
    { id: 4, timestamp: new Date(Date.now() - 1000).toISOString(), prediction: 'Речь', confidence: 0.88 },
  ];


  const currentPredictions = mode === 'file' ? filePredictions : 
                           mode === 'stream' ? streamPredictions : [];

  if (!uploadedFile && !status && !error && currentPredictions.length === 0 && !mode) {
    return (
      <div className="results-container">
        <div className="results-placeholder">
          <div>
            <svg width="78" height="70" viewBox="0 0 78 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M59 22V5C59 2.79086 57.2091 1 55 1H5C2.79086 1 1 2.79086 1 5V65C1 67.2091 2.79086 69 5 69H30" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="20" x2="50" y2="20" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="34" x2="38" y2="34" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="48" x2="30" y2="48" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
            <path d="M41.378 50.2523L39.4887 56.8193C39.0399 58.3794 40.5387 59.7961 42.0711 59.2601L45.3466 58.1144L49.3053 56.7297M41.378 50.2523L49.3053 56.7297M41.378 50.2523L52.3518 39.2537L62.6397 28.9425M49.3053 56.7297L70.0191 35.7358M62.6397 28.9425L65.4567 26.1192C67.3372 24.2344 70.3647 24.1534 72.3432 25.935C74.4623 27.843 74.5596 31.134 72.5568 33.1638L70.0191 35.7358M62.6397 28.9425L70.0191 35.7358" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize: '2rem' }}>Классификатор не активен</div>
            <p>Выберите способ анализа аудио</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      {mode && (
        <div className="mode-header">
          <h2>
            {mode === 'file' ? 'Анализ файла' : 'Анализ в реальном времени'}
          </h2>
        </div>
      )}

      {uploadedFile && (
        <div className="file-details">
          <div className="file-detail-item">
            <strong>Файл:</strong> {uploadedFile.name}
          </div>
          <div className="file-detail-item">
            <strong>Размер:</strong> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
          </div>
          <div className="file-detail-item">
            <strong>Тип:</strong> {uploadedFile.type || 'Неизвестно'}
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="audio-preview">
          <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Прослушать:</h3>
          <audio controls src={audioUrl}>
            Ваш браузер не поддерживает аудио элементы.
          </audio>
        </div>
      )}

      {mode === 'file' && currentPredictions.length > 0 && (
        <div className="predictions-results">
          <h3 className="predictions-title">Результаты распознавания:</h3>
          <div className="predictions-list">
            {/* мб мудренее сделать */}
            {currentPredictions.slice(0, 3).map((prediction, index) => {
              const confidencePercent = Math.round(prediction.confidence * 100);
              return (
                <div key={index} className="prediction-item">
                  <span className="class-name">{prediction.class}</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${confidencePercent.toString()}%` }}
                    ></div>
                  </div>
                  <span className="confidence">{confidencePercent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {mode === 'stream' && (
        <StreamLog predictions={mockStreamData} />
      )}

      {status && (
        <div className={`status ${error ? 'error' : currentPredictions.length > 0 ? 'success' : 'info'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default Results;