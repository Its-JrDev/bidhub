'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Clock } from 'lucide-react';
import { useI18nStore } from '@/shared/stores/i18n-store';

const emptySubscribe = () => () => {};

interface CountdownTimerProps {
  endsAt: string | Date;
  className?: string;
  onEnded?: () => void;
}

export function CountdownTimer({ endsAt, className = '', onEnded }: CountdownTimerProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  const { t } = useI18nStore();

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(endsAt).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        if (onEnded) onEnded();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endsAt, onEnded]);

  // Server-side / Hydration Safe fallback
  if (!mounted) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 ${className}`}>
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span>Calculando tiempo...</span>
      </div>
    );
  }

  if (timeLeft.isEnded) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>{t.countdown.ended}</span>
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 15;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-full transition-colors ${
        isUrgent
          ? 'bg-amber-100 text-amber-900 animate-pulse border border-amber-300'
          : 'bg-stone-100 text-stone-800 border border-stone-200'
      } ${className}`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-600' : 'text-stone-500'}`} />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}${t.countdown.days} `}
        {String(timeLeft.hours).padStart(2, '0')}{t.countdown.hours} :{' '}
        {String(timeLeft.minutes).padStart(2, '0')}{t.countdown.minutes} :{' '}
        {String(timeLeft.seconds).padStart(2, '0')}{t.countdown.seconds}
      </span>
    </div>
  );
}

export default CountdownTimer;
