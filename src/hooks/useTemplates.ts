// FILE: src/hooks/useTemplates.ts
import { useState, useEffect, useCallback } from 'react';
import { EmailTemplate, TemplateVersion } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { STORAGE_KEYS, APP_CONFIG } from '../constants/constants';

const SEED_TEMPLATES: Omit<EmailTemplate, 'user_id'>[] = [
  {
    id: 'tmpl_1',
    name: 'Standard Cold Outreach',
    subject: 'Application for {Job_Role} — {Your_Name}',
    body: `Hi {HR_Name},

I hope you're having a great week.

I've been closely following {Company_Name}'s work, and I'm very excited about the {Job_Role} opening. With a strong track record of shipping fast, accessible web applications and high-impact features, I would love the opportunity to contribute to your team.

You can review my background and featured projects here:
{Resume_Link}

Would you be open to a brief 10-minute chat this week to discuss how my skill set aligns with {Company_Name}'s goals?

Best regards,
{Your_Name}`,
    is_default: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tmpl_2',
    name: 'Follow-Up #1: Value Add & Portfolio',
    subject: 'Following up: {Job_Role} at {Company_Name}',
    body: `Hi {HR_Name},

I wanted to quickly follow up on my note from earlier this week regarding the {Job_Role} role at {Company_Name}.

Since reaching out, I took a look at some of the challenges your team solves, and I put together a quick case study demonstrating relevant design & architecture patterns:
{Resume_Link}

I know your schedule is busy, but I'd love to connect for 10 minutes if you have availability.

Best,
{Your_Name}`,
    is_default: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tmpl_3',
    name: 'Follow-Up #2: Polite Final Touch',
    subject: 'Re: {Job_Role} — Final check-in',
    body: `Hi {HR_Name},

Just a final polite check-in regarding the {Job_Role} position at {Company_Name}.

If the role has already been filled or you're focusing on other priorities right now, no worries at all! I'll leave my details here for the future:
{Resume_Link}

Wishing you and the {Company_Name} team continued success!

Warm regards,
{Your_Name}`,
    is_default: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id || 'demo_user';

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isSupabaseConfigured && user) {
      try {
        const { data, error: sbError } = await supabase
          .from('email_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (sbError) throw sbError;
        const list = (data as EmailTemplate[]) || [];
        setTemplates(list);
        setActiveTemplate((curr) => {
          if (curr) {
            return list.find((t) => t.id === curr.id) || list[0] || null;
          }
          return list.find((t) => t.is_default) || list[0] || null;
        });
      } catch (err: any) {
        console.error('Error fetching templates from Supabase:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Local fallback
      try {
        const storageKey = `${STORAGE_KEYS.templatesFallback}_${userId}`;
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed: EmailTemplate[] = JSON.parse(raw);
          setTemplates(parsed);
          setActiveTemplate((curr) => {
            if (curr) {
              return parsed.find((t) => t.id === curr.id) || parsed[0] || null;
            }
            return parsed.find((t) => t.is_default) || parsed[0] || null;
          });
        } else {
          const initial = SEED_TEMPLATES.map((t) => ({ ...t, user_id: userId }));
          localStorage.setItem(storageKey, JSON.stringify(initial));
          setTemplates(initial);
          setActiveTemplate(initial[0]);
        }
      } catch (err: any) {
        console.error('Error in template storage:', err);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    }
  }, [user?.id, userId]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const saveLocalTemplates = (list: EmailTemplate[]) => {
    const storageKey = `${STORAGE_KEYS.templatesFallback}_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(list));
    setTemplates(list);
  };

  const saveVersion = async (templateId: string, subject: string, body: string, note = 'Manual edit') => {
    const newVersion: TemplateVersion = {
      id: `ver_${Date.now()}`,
      template_id: templateId,
      user_id: userId,
      subject,
      body,
      version_note: note,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && user) {
      await supabase.from('template_versions').insert(newVersion);
    } else {
      const vKey = `${STORAGE_KEYS.templateVersionsFallback}_${templateId}`;
      const raw = localStorage.getItem(vKey);
      let list: TemplateVersion[] = raw ? JSON.parse(raw) : [];
      list.unshift(newVersion);
      // Keep max versions
      if (list.length > APP_CONFIG.maxTemplateVersions) {
        list = list.slice(0, APP_CONFIG.maxTemplateVersions);
      }
      localStorage.setItem(vKey, JSON.stringify(list));
    }
  };

  const addTemplate = async (
    data: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<EmailTemplate> => {
    if (templates.length >= APP_CONFIG.maxTemplates) {
      throw new Error(`Maximum limit of ${APP_CONFIG.maxTemplates} templates reached.`);
    }

    const newTmpl: EmailTemplate = {
      ...data,
      id: `tmpl_${Date.now()}`,
      user_id: userId,
      is_default: templates.length === 0 ? true : Boolean(data.is_default),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let updatedList = [...templates];
    if (newTmpl.is_default) {
      updatedList = updatedList.map((t) => ({ ...t, is_default: false }));
    }
    updatedList.push(newTmpl);

    if (isSupabaseConfigured && user) {
      if (newTmpl.is_default) {
        await supabase
          .from('email_templates')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      const { data: inserted, error: sbErr } = await supabase
        .from('email_templates')
        .insert(newTmpl)
        .select()
        .single();

      if (sbErr) throw sbErr;
      await saveVersion(newTmpl.id, newTmpl.subject, newTmpl.body, 'Initial creation');
      setTemplates(updatedList);
      setActiveTemplate(inserted as EmailTemplate);
      return inserted as EmailTemplate;
    } else {
      saveLocalTemplates(updatedList);
      await saveVersion(newTmpl.id, newTmpl.subject, newTmpl.body, 'Initial creation');
      setActiveTemplate(newTmpl);
      return newTmpl;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>, note?: string) => {
    const existing = templates.find((t) => t.id === id);
    if (!existing) return;

    const shouldSaveVersion =
      (updates.subject && updates.subject !== existing.subject) ||
      (updates.body && updates.body !== existing.body);

    if (shouldSaveVersion) {
      await saveVersion(id, existing.subject, existing.body, note || 'Saved previous version');
    }

    const updatedTmpl: EmailTemplate = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    let list = templates.map((t) => (t.id === id ? updatedTmpl : t));
    if (updates.is_default) {
      list = list.map((t) => (t.id === id ? { ...t, is_default: true } : { ...t, is_default: false }));
    }

    if (isSupabaseConfigured && user) {
      if (updates.is_default) {
        await supabase.from('email_templates').update({ is_default: false }).eq('user_id', user.id);
      }
      const { error: sbErr } = await supabase
        .from('email_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (sbErr) throw sbErr;
      setTemplates(list);
    } else {
      saveLocalTemplates(list);
    }

    if (activeTemplate?.id === id) {
      setActiveTemplate(updatedTmpl);
    }
    return updatedTmpl;
  };

  const deleteTemplate = async (id: string) => {
    if (templates.length <= 1) {
      throw new Error('You must have at least one email template.');
    }

    const remaining = templates.filter((t) => t.id !== id);
    const wasDefault = templates.find((t) => t.id === id)?.is_default;

    if (wasDefault && remaining.length > 0) {
      remaining[0].is_default = true;
    }

    if (isSupabaseConfigured && user) {
      const { error: sbErr } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (sbErr) throw sbErr;
      if (wasDefault && remaining.length > 0) {
        await supabase
          .from('email_templates')
          .update({ is_default: true })
          .eq('id', remaining[0].id);
      }
      setTemplates(remaining);
    } else {
      saveLocalTemplates(remaining);
    }

    if (activeTemplate?.id === id) {
      setActiveTemplate(remaining[0] || null);
    }
  };

  const setDefaultTemplate = async (id: string) => {
    await updateTemplate(id, { is_default: true });
  };

  const duplicateTemplate = async (id: string): Promise<EmailTemplate> => {
    const original = templates.find((t) => t.id === id);
    if (!original) throw new Error('Template not found');

    return addTemplate({
      name: `${original.name} (Copy)`,
      subject: original.subject,
      body: original.body,
      is_default: false,
    });
  };

  const loadVersions = async (templateId: string): Promise<TemplateVersion[]> => {
    if (isSupabaseConfigured && user) {
      const { data } = await supabase
        .from('template_versions')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false })
        .limit(APP_CONFIG.maxTemplateVersions);

      return (data as TemplateVersion[]) || [];
    } else {
      const vKey = `${STORAGE_KEYS.templateVersionsFallback}_${templateId}`;
      const raw = localStorage.getItem(vKey);
      return raw ? JSON.parse(raw) : [];
    }
  };

  const restoreVersion = async (templateId: string, version: TemplateVersion) => {
    await updateTemplate(
      templateId,
      {
        subject: version.subject,
        body: version.body,
      },
      `Restored from ${new Date(version.created_at).toLocaleDateString()}`
    );
  };

  const defaultTemplate = templates.find((t) => t.is_default) || templates[0] || null;

  const getTemplateVersions = useCallback((templateId: string): TemplateVersion[] => {
    const vKey = `${STORAGE_KEYS.templateVersionsFallback}_${templateId}`;
    const raw = localStorage.getItem(vKey);
    return raw ? JSON.parse(raw) : [];
  }, []);

  const saveNewVersion = async (
    templateId: string,
    subject: string,
    body: string,
    versionNote: string = 'Saved version'
  ): Promise<TemplateVersion> => {
    const newVersion: TemplateVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      template_id: templateId,
      user_id: userId,
      subject,
      body,
      version_note: versionNote,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && user) {
      await supabase.from('template_versions').insert(newVersion);
    } else {
      const vKey = `${STORAGE_KEYS.templateVersionsFallback}_${templateId}`;
      const existing = getTemplateVersions(templateId);
      const updated = [newVersion, ...existing].slice(0, APP_CONFIG.maxTemplateVersions);
      localStorage.setItem(vKey, JSON.stringify(updated));
    }

    return newVersion;
  };

  const resetTemplates = async () => {
    if (isSupabaseConfigured && user) {
      await supabase.from('email_templates').delete().eq('user_id', user.id);
      setTemplates([]);
    } else {
      localStorage.removeItem(`${STORAGE_KEYS.templatesFallback}_${userId}`);
      setTemplates([]);
    }
  };

  return {
    templates,
    activeTemplate,
    defaultTemplate,
    setActiveTemplate,
    loading,
    error,
    addTemplate,
    createTemplate: addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    duplicateTemplate,
    loadVersions,
    getTemplateVersions,
    saveNewVersion,
    restoreVersion,
    resetTemplates,
    refreshTemplates: loadTemplates,
  };
}
