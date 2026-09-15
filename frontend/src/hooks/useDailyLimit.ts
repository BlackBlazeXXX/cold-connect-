// FILE: src/hooks/useDailyLimit.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { STORAGE_KEYS } from '../constants/constants';

export function useDailyLimit() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [sentToday, setSentToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || 'demo_user';
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyLimit = settings.daily_limit || 100;

  const loadSentToday = useCallback(async () => {
    setLoading(true);
    if (isSupabaseConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('daily_send_limits')
          .select('sent_count')
          .eq('user_id', user.id)
          .eq('date', todayStr)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error reading daily send limits:', error);
        }
        setSentToday(data?.sent_count || 0);
      } catch (err) {
        console.error('Failed to load daily send limits:', err);
      } finally {
        setLoading(false);
      }
    } else {
      const key = `${STORAGE_KEYS.dailyLimitsFallback}_${userId}_${todayStr}`;
      const cached = localStorage.getItem(key);
      setSentToday(cached ? parseInt(cached, 10) : 18); // default realistic active count for demo
      setLoading(false);
    }
  }, [user?.id, userId, todayStr]);

  useEffect(() => {
    loadSentToday();
  }, [loadSentToday]);

  const incrementSentCount = async (count: number = 1) => {
    const newCount = sentToday + count;
    setSentToday(newCount);

    if (isSupabaseConfigured && user) {
      await supabase.from('daily_send_limits').upsert({
        user_id: user.id,
        date: todayStr,
        sent_count: newCount,
      });
    } else {
      const key = `${STORAGE_KEYS.dailyLimitsFallback}_${userId}_${todayStr}`;
      localStorage.setItem(key, newCount.toString());
    }
  };

  const remaining = Math.max(0, dailyLimit - sentToday);
  const percentUsed = Math.min(100, Math.round((sentToday / dailyLimit) * 100));
  const isNearLimit = sentToday >= dailyLimit * 0.8;
  const isAtLimit = sentToday >= dailyLimit;

  return {
    sentToday,
    dailyLimit,
    remaining,
    remainingToday: remaining,
    percentUsed,
    isNearLimit,
    isAtLimit,
    isLimitReached: isAtLimit,
    loading,
    incrementSentCount,
    incrementCount: incrementSentCount,
    refreshLimit: loadSentToday,
  };
}
