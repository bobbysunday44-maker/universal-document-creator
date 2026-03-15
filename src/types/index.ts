// Types for Universal Document Creator

export interface SkillInput {
  type: string;
  description: string;
}

export interface Skill {
  name: string;
  description: string;
  inputs: Record<string, SkillInput>;
  outputs: string;
  template: string;
}

export interface SkillParameter {
  key: string;
  value: string | string[] | number;
}

export interface DocumentRequest {
  skill_name?: string;
  prompt: string;
  parameters: Record<string, any>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  title?: string;
  brand_profile_id?: number;
  output_format?: 'markdown' | 'html' | 'pdf';
}

export interface DocumentResponse {
  content: string;
  html_content?: string;
  skill_used?: string;
  model_used: string;
  export_formats: string[];
  generated_at: string;
  document_id?: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  vision: boolean;
  censored: boolean;
  tag: string;
  installed: boolean;
}

export interface ChainStep {
  skill_name: string;
  parameters: Record<string, any>;
}

export type ExportFormat = 'text' | 'markdown' | 'html' | 'pdf';
