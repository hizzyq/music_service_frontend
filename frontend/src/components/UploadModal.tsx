import React, { useState, useRef } from 'react';
import { adminApi } from '../api/admin';
import { usePlayerStore } from '../store/usePlayerStore';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X, Music, Trash2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadFileItem {
  id: string;
  file: File;
  status: 'idle' | 'presigning' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<UploadFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTracks = usePlayerStore((state) => state.fetchTracks);

  if (!isOpen) return null;

  const handleFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newItems: UploadFileItem[] = Array.from(selectedFiles).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      status: 'idle',
      progress: 0,
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleRemoveItem = (id: string) => {
    if (isUploading) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const startBatchUpload = async () => {
    if (items.length === 0 || isUploading) return;

    setIsUploading(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === 'success') continue;

      // 1. Presigning
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'presigning', progress: 10 } : it))
      );

      try {
        const { upload_url, file_key, content_type } = await adminApi.presignUpload(item.file.name);

        // 2. Direct upload to MinIO
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'uploading', progress: 20 } : it))
        );

        await adminApi.uploadToMinIO(
          upload_url,
          item.file,
          (pct) => {
            setItems((prev) =>
              prev.map((it) => (it.id === item.id ? { ...it, progress: Math.max(20, Math.round(pct * 0.8)) } : it))
            );
          },
          content_type
        );

        // 3. Process metadata & waveform in Rails
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', progress: 90 } : it))
        );

        await adminApi.processUpload(file_key);

        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'success', progress: 100 } : it))
        );
      } catch (err: any) {
        console.error('Ошибка при загрузке файла', item.file.name, err);
        const msg = err.response?.data?.error || 'Ошибка загрузки';
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'error', errorMessage: msg } : it))
        );
      }
    }

    setIsUploading(false);
    await fetchTracks();
  };

  const handleClose = () => {
    if (isUploading) return;
    setItems([]);
    onClose();
  };

  const allSuccess = items.length > 0 && items.every((it) => it.status === 'success');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          disabled={isUploading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-zinc-100 mb-1 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-emerald-400" />
          Массовая загрузка треков (Direct to S3)
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Поддерживаются MP3, FLAC, M4A, AAC, WAV. Метаданные, обложки и форма волны извлекаются автоматически.
        </p>

        {/* Скрытый input с флагом multiple */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.flac,.m4a,.aac,.wav,.ogg"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />

        {/* Зона Drag & Drop / выбора файлов */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 mb-4"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Music className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-center">
            <span className="text-xs font-semibold text-emerald-400">
              Выберите один или несколько файлов (MP3, FLAC, M4A)
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">или перетащите их в это окно</p>
          </div>
        </div>

        {/* Список выбранных файлов */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[120px] max-h-[260px]">
          {items.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">Файлы пока не выбраны</div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Music className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-zinc-100 truncate">{it.file.name}</span>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      ({(it.file.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {it.status === 'idle' && (
                      <button
                        onClick={() => handleRemoveItem(it.id)}
                        disabled={isUploading}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {it.status === 'presigning' && (
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                        Подпись S3...
                      </span>
                    )}
                    {it.status === 'uploading' && (
                      <span className="text-[11px] text-emerald-400 font-mono">
                        {it.progress}%
                      </span>
                    )}
                    {it.status === 'processing' && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Теги и волна...
                      </span>
                    )}
                    {it.status === 'success' && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Готово
                      </span>
                    )}
                    {it.status === 'error' && (
                      <span className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Ошибка
                      </span>
                    )}
                  </div>
                </div>

                {/* Прогресс-бар для активных файлов */}
                {(it.status === 'uploading' || it.status === 'processing') && (
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-150"
                      style={{ width: `${it.progress}%` }}
                    />
                  </div>
                )}

                {it.status === 'error' && it.errorMessage && (
                  <div className="text-[10px] text-red-400">{it.errorMessage}</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Подвал с кнопками */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {items.length > 0 && `Выбрано: ${items.length} ${items.length === 1 ? 'трек' : 'треков'}`}
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {allSuccess ? 'Закрыть' : 'Отмена'}
            </button>

            {items.length > 0 && !allSuccess && (
              <button
                onClick={startBatchUpload}
                disabled={isUploading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isUploading ? 'Загрузка...' : `Загрузить все (${items.filter((it) => it.status !== 'success').length})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};