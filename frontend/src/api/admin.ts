import axios from 'axios';
import { api } from './client';

export interface PresignResponse {
  upload_url: string;
  file_key: string;
  content_type?: string;
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
    cover_url?: string;
    waveform?: number[];
  };
}

export const adminApi = {
  // 1. Получение Presigned PUT URL от Rails
  presignUpload: async (filename: string): Promise<PresignResponse> => {
    const res = await api.post<PresignResponse>('/admin/tracks/presign_upload', {
      filename,
    });
    return res.data;
  },

  // 2. Прямая загрузка байтов в бакет MinIO (поддержка MP3, FLAC, M4A и т.д.)
  uploadToMinIO: async (
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
    contentType?: string
  ): Promise<void> => {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': contentType || file.type || 'audio/mpeg',
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
    });
    return res.data;
  },

  // 4. Удаление трека из библиотеки и бакета MinIO
  deleteTrack: async (trackId: number): Promise<void> => {
    await api.delete(`/admin/tracks/${trackId}`);
  },
};