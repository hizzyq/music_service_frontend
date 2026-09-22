import axios from 'axios';
import { api } from './client';

export interface PresignResponse {
  upload_url: string;
  file_key: string;
}

export interface ProcessResponse {
  message: string;
  track: {
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: number;
    file_key: string;
    stream_url: string;
  };
}

export const adminApi = {
  // 1. Получение Presigned PUT URL от Rails
  presignUpload: async (filename: string): Promise<PresignResponse> => {
    const res = await api.post<PresignResponse>('/admin/tracks/presign_upload', {
      filename,
    }); //
    return res.data;
  },

  // 2. Прямая загрузка байтов в бакет MinIO
  uploadToMinIO: async (
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<void> => {
    await axios.put(uploadUrl, file, { //[cite: 1]
      headers: {
        'Content-Type': 'audio/mpeg',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  // 3. Отправка ключа в Rails для парсинга ID3 и сохранения в БД
  processUpload: async (fileKey: string): Promise<ProcessResponse> => {
    const res = await api.post<ProcessResponse>('/admin/tracks/process_upload', {
      file_key: fileKey,
    }); //[cite: 1]
    return res.data;
  },
};