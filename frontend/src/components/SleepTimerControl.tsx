import React, { useState, useRef, useEffect } from 'react';
import { usePlayerStore, type SleepTimerOption } from '../store/usePlayerStore';
import { Moon, Clock, Check, X } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

interface SleepTimerControlProps {
  isMobile?: boolean;
}

export const SleepTimerControl: React.FC<SleepTimerControlProps> = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    sleepTimerOption,
    sleepTimerRemaining,
    isSleepTimerActive,
    setSleepTimer,
    cancelSleepTimer,
  } = usePlayerStore();

  // Закрытие выпадающего окна при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectOption = (option: SleepTimerOption) => {
    setSleepTimer(option);
    setIsOpen(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancelSleepTimer();
    setIsOpen(false);
  };

  const timerOptions: { id: SleepTimerOption; label: string; desc: string }[] = [
    { id: '15', label: '15 минут', desc: 'Быстрый отдых' },
    { id: '30', label: '30 минут', desc: 'Стандартный режим' },
    { id: '45', label: '45 минут', desc: 'Перед сном' },
    { id: '60', label: '60 минут', desc: '1 час воспроизведения' },
    { id: 'end_of_track', label: 'Конец текущего трека', desc: 'Доиграть композицию и выключить' },
  ];

  const getButtonLabel = () => {
    if (!isSleepTimerActive) return null;
    if (sleepTimerOption === 'end_of_track') return 'Трек';
    if (sleepTimerRemaining !== null) {
      return formatTime(sleepTimerRemaining);
    }
    return 'Вкл';
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Кнопка вызова таймера сна */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 cursor-pointer ${
          isSleepTimerActive
            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
        } ${isMobile ? 'p-1.5' : ''}`}
        title={
          isSleepTimerActive
            ? `Таймер сна активен (${getButtonLabel()}). Кликните для настройки.`
            : 'Включить таймер сна с плавным затуханием (Fade-out)'
        }
      >
        <Moon className={`w-4 h-4 ${isSleepTimerActive ? 'fill-emerald-400/30 text-emerald-400 animate-pulse' : ''}`} />
        {!isMobile && isSleepTimerActive && (
          <span className="font-semibold tracking-tight">{getButtonLabel()}</span>
        )}
      </button>

      {/* Всплывающее меню таймера сна */}
      {isOpen && (
        <div
          className={`absolute bottom-full mb-3 z-50 w-64 md:w-72 bg-zinc-900/98 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-3 font-sans animate-in fade-in zoom-in-95 duration-150 ${
            isMobile ? 'right-0 -mr-8' : 'right-0'
          }`}
        >
          {/* Терминальная шапка */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <div className="flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-100 font-mono">Таймер сна</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">$ sleep --fade</span>
          </div>

          <p className="text-[11px] text-zinc-400 mb-2.5 leading-snug">
            Автоматическая остановка воспроизведения с плавным снижением громкости перед выключением.
          </p>

          {/* Статус активного таймера */}
          {isSleepTimerActive && (
            <div className="mb-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                <div>
                  <div className="text-[10px] text-emerald-400/80 uppercase font-mono">Осталось времени</div>
                  <div className="text-xs font-bold font-mono text-emerald-300">
                    {sleepTimerOption === 'end_of_track' ? 'До конца трека' : getButtonLabel()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                title="Отменить таймер"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Список пресетов */}
          <div className="space-y-1">
            {timerOptions.map((opt) => {
              const isSelected = sleepTimerOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30'
                      : 'hover:bg-zinc-800/70 text-zinc-300 hover:text-zinc-100'
                  }`}
                >
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500">{opt.desc}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Кнопка выключения */}
          {isSleepTimerActive && (
            <div className="mt-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleCancel}
                className="w-full py-1.5 px-3 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-zinc-400 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Отключить таймер</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
