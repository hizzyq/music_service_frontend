// src/api/upload.ts
import axios from 'axios';
import { api } from './client';

export async function uploadTrackDirectly(file: File, onProgress?: (pct: number) => void) {
    // 1. Запрос подписанной ссылки на загрузку в Rails
    const presignRes = await api.post<{ upload_url: string; file_key: string }>(
        '/admin/tracks/presign_upload', //[cite: 1]
        { filename: file.name }
    );
    const { upload_url, file_key } = presignRes.data;

    // 2. Прямой PUT-запрос в MinIO (прогресс-бар)
    await axios.put(upload_url, file, { //[cite: 1]
        headers: { 'Content-Type': 'audio/mpeg' },
        onUploadProgress: (evt) => {
            if (evt.total && onProgress) {
                onProgress(Math.round((evt.loaded * 100) / evt.total));
            }
        },
    });

    // 3. Отправка ключа в Rails для извлечения ID3-тегов и сохранения в БД
    const processRes = await api.post('/admin/tracks/process_upload', { file_key }); //[cite: 1]
    return processRes.data;
}