// FILE: src/pages/TemplatesPage.tsx
import React, { useState, useEffect } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { useSettings } from '../hooks/useSettings';
import { TemplateList } from '../components/templates/TemplateList';
import { TemplateEditor } from '../components/templates/TemplateEditor';
import { EmailTemplate, TemplateVersion } from '../types';

export const TemplatesPage: React.FC = () => {
  const {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setDefaultTemplate,
    getTemplateVersions,
    saveNewVersion,
  } = useTemplates();

  const { settings } = useSettings();

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [currentVersions, setCurrentVersions] = useState<TemplateVersion[]>([]);

  // Default to first template or default template on mount
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      const def = templates.find((t) => t.is_default) || templates[0];
      setSelectedTemplate(def);
    }
  }, [templates, selectedTemplate]);

  // Load versions whenever selectedTemplate changes
  useEffect(() => {
    if (selectedTemplate?.id) {
      const versions = getTemplateVersions(selectedTemplate.id);
      setCurrentVersions(versions);
    } else {
      setCurrentVersions([]);
    }
  }, [selectedTemplate?.id, getTemplateVersions]);

  const handleCreateNew = async () => {
    const created = await createTemplate({
      name: `New Template ${templates.length + 1}`,
      type: 'Custom',
      subject: 'Inquiry regarding {Job_Role} at {Company_Name}',
      body: `Hi {HR_Name},\n\nI hope you're having a great week.\n\nI came across the {Job_Role} opportunity at {Company_Name} and was very excited by your team's mission. With my background in engineering and design, I believe I can make an immediate positive impact.\n\nYou can review my work and resume here: {Resume_Link}\n\nWould you have 10 minutes for a brief introductory conversation this week?\n\nBest regards,\n{Your_Name}`,
      is_default: false,
    });
    setSelectedTemplate(created);
  };

  const handleDuplicate = async (tpl: EmailTemplate) => {
    const dup = await duplicateTemplate(tpl.id);
    if (dup) setSelectedTemplate(dup);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    if (selectedTemplate?.id === id) {
      const remaining = templates.filter((t) => t.id !== id);
      setSelectedTemplate(remaining[0] || null);
    }
  };

  const handleSave = async (data: Partial<EmailTemplate>) => {
    if (selectedTemplate) {
      const updated = await updateTemplate(selectedTemplate.id, data);
      if (updated) {
        setSelectedTemplate(updated);
      }
    }
  };

  const handleSaveNewVersion = async (templateId: string, subject: string, body: string) => {
    const newVer = await saveNewVersion(templateId, subject, body);
    setCurrentVersions((prev) => [newVer, ...prev]);
  };

  const handleRestoreVersion = (version: TemplateVersion) => {
    if (selectedTemplate) {
      handleSave({
        subject: version.subject,
        body: version.body,
      });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row gap-5">
      {/* 30% Left Template List */}
      <div className="w-full md:w-80 shrink-0 h-auto md:h-full">
        <TemplateList
          templates={templates}
          selectedTemplateId={selectedTemplate?.id || null}
          onSelect={(t) => setSelectedTemplate(t)}
          onCreateNew={handleCreateNew}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onSetDefault={(id) => setDefaultTemplate(id)}
        />
      </div>

      {/* 70% Right Template Editor */}
      <div className="flex-1 h-full min-w-0">
        <TemplateEditor
          template={selectedTemplate}
          versions={currentVersions}
          settings={settings}
          onSave={handleSave}
          onSaveNewVersion={handleSaveNewVersion}
          onRestoreVersion={handleRestoreVersion}
          anthropicApiKey={settings.anthropic_api_key}
        />
      </div>
    </div>
  );
};
