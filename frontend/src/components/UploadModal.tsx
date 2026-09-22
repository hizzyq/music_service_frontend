import React, { useState, useRef } from 'react';
import { adminApi } from '../api/admin';
import { usePlayerStore } from '../store/usePlayerStore';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X, Music } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadStatus = 'idle' | 'presigning' | 'uploading' | 'processing' | 'success' | 'error';

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTracks = usePlayerStore((state) => state.fetchTracks);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setErrorMessage(null);

      // Шаг 1: Получаем Presigned URL
      setStatus('presigning');
      const { upload_url, file_key } = await adminApi.presignUpload(file.name); //

      // Шаг 2: Загружаем файл напрямую в MinIO
      setStatus('uploading');
      await adminApi.uploadToMinIO(upload_url, file, (pct) => setProgress(pct)); //

      // Шаг 3: Сообщаем Rails о необходимости извлечь ID3-теги
      setStatus('processing');
      await adminApi.processUpload(file_key); //

      setStatus('success');
      // Обновляем список треков в фоновом режиме
      await fetchTracks();

      // Закрываем окно через секунду после успеха
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(
        err.response?.data?.error || 'Произошла ошибка при загрузке аудиофайла.'
      );
    }
  };

  const handleClose = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
        
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-zinc-100 mb-1 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-emerald-400" />
          Загрузка трека (Direct to S3)
        </h3>
        <p className="text-xs text-zinc-400 mb-6">
          Файл загружается напрямую в MinIO, а Rails автоматически распознает ID3-теги.
        </p>

        {/* Ошибка */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Зона выбора файла */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/mpeg"
          onChange={handleFileChange}
          className="hidden"
        />

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Music className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-emerald-400">Выберите MP3-файл</span>
              <p className="text-xs text-zinc-500 mt-1">Поддерживаются аудиофайлы с ID3v1 / ID3v2 тегами</p>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Music className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-100 truncate">{file.name}</div>
                <div className="text-xs text-zinc-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
            </div>
            {status === 'idle' && (
              <button
                onClick={() => setFile(null)}
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                Изменить
              </button>
            )}
          </div>
        )}

        {/* Прогресс и этапы загрузки */}
        {status !== 'idle' && status !== 'error' && (
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-2">
                {status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                )}
                {status === 'presigning' && 'Генерация подписи S3...'}
                {status === 'uploading' && `Загрузка в MinIO: ${progress}%`}
                {status === 'processing' && 'Rails извлекает ID3-теги и создает записи...'}
                {status === 'success' && 'Трек успешно добавлен в каталог!'}
              </span>
              <span className="font-mono">{progress}%</span>
            </div>

            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-200"
                style={{ width: `${status === 'processing' || status === 'success' ? 100 : progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Кнопка действия */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={status === 'uploading' || status === 'processing'}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading' || status === 'processing' || status === 'success'}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {(status === 'uploading' || status === 'processing') && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>Загрузить</span>
          </button>
        </div>

      </div>
    </div>
  );
};