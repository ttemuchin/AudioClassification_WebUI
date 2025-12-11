import React from 'react';
import './StreamLog.css';

export type StreamPrediction = {
  id: number;
  timestamp: string;
  prediction: string;
  confidence: number;
}

type StreamLogProps = {
  predictions: StreamPrediction[];
}

const StreamLog: React.FC<StreamLogProps> = ({ predictions }) => {
  // Форматирование времени
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    //   fractionalSecondDigits: 3
    });
  };

  if (predictions.length === 0) {
    return (
      <div className="stream-log">
        <h3 className="stream-log-title">Лог распознавания</h3>
        <div className="stream-log-empty">
          <div className="empty-icon">📊</div>
          <p>Ожидание данных с микрофона...</p>
          <small>Начните запись для отображения результатов</small>
        </div>
      </div>
    );
  }

  return (
    <div className="stream-log">
      <h3 className="stream-log-title">События</h3>
      <div className="stream-log-table-container">
        <table className="stream-log-table">
          <thead>
            <tr>
              <th className="col-number">№</th>
              <th className="col-time">Время</th>
              <th className="col-prediction">Класс</th>
              <th className="col-confidence">Уверенность</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((pred, index) => {
              const confidencePercent = Math.round(pred.confidence * 100);
              return (
                <tr key={pred.id} className="stream-log-row">
                  <td className="col-number">{predictions.length - index}</td>
                  <td className="col-time">{formatTime(pred.timestamp)}</td>
                  <td className="col-prediction">
                    <span className="prediction-badge">{pred.prediction}</span>
                  </td>
                  <td className="col-confidence">
                    <div className="confidence-display">
                      <div className="confidence-bar-small">
                        <div 
                          className="confidence-fill-small"
                          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                          style={{ width: `${confidencePercent}%` }}
                        ></div>
                      </div>
                      <span className="confidence-percent">{confidencePercent}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="stream-log-stats">
        Всего записей: <strong>{predictions.length}</strong>
      </div>
    </div>
  );
};

export default StreamLog;