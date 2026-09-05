// FILE: src/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { STORAGE_KEYS, APP_CONFIG } from '../constants/constants';

const DEFAULT_SETTINGS: UserSettings = {
  user_id: 'demo_user',
  full_name: 'Sanju Designer',
  email: 'sanju.designer001@gmail.com',
  resume_drive_link: 'https://drive.google.com/file/d/1demo-resume-view-link/view?usp=sharing',
  google_drive_resume_link: 'https://drive.google.com/file/d/1demo-resume-view-link/view?usp=sharing',
  resend_api_key: 're_demo_coldconnect_key',
  anthropic_api_key: 'sk-ant-demo_key',
  sender_name: 'Sanju Designer',
  sender_email: 'sanju.designer001@gmail.com',
  reply_to_email: 'sanju.designer001@gmail.com',
  preferred_send_time: '09:00',
  daily_limit: APP_CONFIG.dailySendLimit,
  daily_email_limit: APP_CONFIG.dailySendLimit,
  follow_up_days: APP_CONFIG.followUpDays,
  default_follow_up_days: 3,
  default_follow_up_2_days: 7,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userId = user?.id || 'demo_user';

  const loadSettings = useCallback(async () => {
    setLoading(true);
    if (isSupabaseConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching Supabase settings:', error);
        }

        if (data) {
          setSettings({ ...DEFAULT_SETTINGS, ...(data as UserSettings) });
        } else {
          // Initialize row
          const initData: UserSettings = {
            ...DEFAULT_SETTINGS,
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Job Seeker',
            sender_name: user.user_metadata?.full_name || 'Job Seeker',
            sender_email: user.email,
            reply_to_email: user.email,
          };
          await supabase.from('user_settings').insert(initData);
          setSettings(initData);
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage fallback
      const key = `${STORAGE_KEYS.settingsFallback}_${userId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch {
          setSettings(DEFAULT_SETTINGS);
        }
      } else {
        const initData: UserSettings = {
          ...DEFAULT_SETTINGS,
          user_id: userId,
          email: user?.email || DEFAULT_SETTINGS.email,
          full_name: user?.user_metadata?.full_name || DEFAULT_SETTINGS.full_name,
          sender_name: user?.user_metadata?.full_name || DEFAULT_SETTINGS.sender_name,
        };
        localStorage.setItem(key, JSON.stringify(initData));
        setSettings(initData);
      }
      setLoading(false);
    }
  }, [user?.id, userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    setIsSaving(true);
    const updated: UserSettings = {
      ...settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured && user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({ ...updated, user_id: user.id });

        if (error) throw error;
      } else {
        const key = `${STORAGE_KEYS.settingsFallback}_${userId}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
      setSettings(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const isSetupComplete = Boolean(
    settings.sender_email &&
    settings.resume_drive_link &&
    settings.resend_api_key
  );

  return {
    settings,
    loading,
    isSaving,
    isSetupComplete,
    updateSettings,
    refreshSettings: loadSettings,
  };
}
