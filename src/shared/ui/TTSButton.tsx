import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { cn } from '@/shared/utils/cn';

interface Props {
  /** Italian text to speak. Pass plain text (HTML tags will be stripped). */
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

export function TTSButton({ text, className, size = 'sm' }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const stop = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (isPlayingRef.current) {
      stop();
      return;
    }

    window.speechSynthesis.cancel();
    const clean = stripHtml(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'it-IT';
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => { isPlayingRef.current = false; setIsPlaying(false); };
    utterance.onerror = () => { isPlayingRef.current = false; setIsPlaying(false); };

    isPlayingRef.current = true;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [text, stop]);

  // Stop and reset when text changes (question changed)
  useEffect(() => {
    stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  if (!('speechSynthesis' in window)) return null;

  const dim = size === 'md' ? 'w-8 h-8' : 'w-7 h-7';
  const iconSize = size === 'md' ? 17 : 15;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center rounded-full transition-all shrink-0 select-none',
        dim,
        isPlaying
          ? 'bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-300 ring-2 ring-primary-300 dark:ring-primary-700'
          : 'bg-surface-100 dark:bg-surface-200 text-surface-400 hover:bg-primary-50 dark:hover:bg-primary-900/40 hover:text-primary-500 dark:hover:text-primary-300',
        className,
      )}
      title={isPlaying ? 'إيقاف الاستماع' : 'استماع بالإيطالية'}
      aria-label={isPlaying ? 'إيقاف الاستماع' : 'استماع بالإيطالية'}
      type="button"
    >
      <Icon name={isPlaying ? 'stop_circle' : 'volume_up'} size={iconSize} filled={isPlaying} />
    </button>
  );
}
