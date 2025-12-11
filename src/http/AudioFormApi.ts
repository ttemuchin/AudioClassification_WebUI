import axios, { AxiosResponse, AxiosProgressEvent } from 'axios';

export type UploadProgressEvent = {
  progress: number;
  loaded: number;
  total: number;
}

export type Prediction = {
  class: string;
  confidence: number;
}

// Новый интерфейс, соответствующий ответу сервера
export type ServerClassificationResponse = {
  file_id: string;
  file_name: string;
  file_size: number;
  message: string;
  predictions: Prediction[];
  service?: string;
  status?: string;
  timestamp?: string;
}

// Старый интерфейс для обратной совместимости
export type ClassificationResponse = {
  success: boolean;
  message: string;
  predictions?: Prediction[];
  fileId?: string;
  fileUrl?: string;
  metadata?: {
    // duration: number;
    // sampleRate: number;
    // channels: number;
    fileSize: number;
  };
}

export type UploadResponse = {
  success: boolean;
  message: string;
  fileId?: string;
  fileUrl?: string;
  metadata?: {
    duration: number;
    sampleRate: number;
    channels: number;
    fileSize: number;
  };
  analysis?: {
    bpm?: number;
    key?: string;
    tempo?: number;
  };
}

export type UploadOptions = {
  onProgress?: (event: UploadProgressEvent) => void;
  timeout?: number;
  chunkSize?: number;
}

class AudioFormApi {
  private baseURL: string;

  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /* Загрузка аудио файла на сервер */
  
  async uploadAudioForClassification(
    file: File,
    options: UploadOptions = {}
  ): Promise<ClassificationResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', file);

      await this.healthCheck()

      const response: AxiosResponse<ServerClassificationResponse> = await axios.post(
        `${this.baseURL}/api/v1/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: options.timeout ?? 30000,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (options.onProgress && progressEvent.total) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              options.onProgress({
                progress,
                loaded: progressEvent.loaded,
                total: progressEvent.total
              });
            }
          },
        }
      );
      // console.log(response.data)
      
      const transformedResponse: ClassificationResponse = {
        success: true,
        message: response.data.message,
        predictions: response.data.predictions,
        fileId: response.data.file_id,
        metadata: {
          fileSize: response.data.file_size
        }
      };

      console.log('Transformed Server response in AudioForm:', transformedResponse);
      
      return transformedResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/health`);
      // console.log(response.data)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAudioInfo(fileId: string): Promise<UploadResponse> {
    try {
      const response: AxiosResponse<UploadResponse> = await axios.get(
        `${this.baseURL}/api/audio/${fileId}/info`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAudio(fileId: string): Promise<UploadResponse> {
    try {
      const response: AxiosResponse<UploadResponse> = await axios.delete(
        `${this.baseURL}/api/audio/${fileId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const message = error.response.data?.message;
        return new Error(`Server error: ${error.response.status.toString()} - ${String(message || 'Unknown error')}`);
      } else if (error.request) {
        return new Error('Network error: No response received from server');
      }
    }
    
    return error instanceof Error ? error : new Error('Unknown upload error');
  }
}

export const audioFormApi = new AudioFormApi('http://localhost:8080');
export default AudioFormApi;