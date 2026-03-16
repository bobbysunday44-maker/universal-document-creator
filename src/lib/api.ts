// API client for Universal Document Creator backend

import type { DocumentRequest, DocumentResponse, Skill, AIModel, ChainStep } from '@/types';

// In desktop/production mode, API is same origin. In dev mode, use localhost:8001.
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8001' : '';

// ==================== TOKEN MANAGEMENT ====================

function getToken(): string | null {
  return localStorage.getItem('udc_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function authHeadersOnly(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==================== AUTH API ====================

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  is_admin?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  pending_approval?: boolean;
  message?: string;
}

export async function apiRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return response.json();
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Invalid email or password' }));
    throw new Error(err.detail || 'Invalid email or password');
  }
  return response.json();
}

export async function apiGetMe(): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Not authenticated');
  return response.json();
}

// ==================== PASSWORD RESET API ====================

export async function forgotPassword(email: string): Promise<{ message: string; reset_token?: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return response.json();
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Reset failed' }));
    throw new Error(err.detail || 'Reset failed');
  }
  return response.json();
}

// ==================== SETTINGS API ====================

export async function saveApiKeys(keys: { gemini_api_key?: string; anthropic_api_key?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/settings/api-keys`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(keys),
  });
  if (!response.ok) throw new Error('Failed to save API keys');
}

export async function getApiKeyStatus(): Promise<{ gemini_configured: boolean; anthropic_configured: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/settings/api-keys`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to check API keys');
  return response.json();
}

// ==================== BRAND PROFILE API ====================

export interface BrandProfile {
  id: number;
  user_id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  logo_url: string | null;
  screenshot_path: string | null;
  style_json: string | null;
  created_at: string;
}

export async function uploadBrandScreenshot(
  file: File,
  name: string = 'My Brand',
  model: string = 'gemini-3-flash-preview'
): Promise<{ profile: BrandProfile; extracted_style: any; message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('model', model);

  const response = await fetch(`${API_BASE_URL}/api/brand/upload-screenshot`, {
    method: 'POST',
    headers: authHeadersOnly(),
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to upload screenshot' }));
    throw new Error(err.detail || 'Failed to upload screenshot');
  }
  return response.json();
}

export async function getBrandProfiles(): Promise<BrandProfile[]> {
  const response = await fetch(`${API_BASE_URL}/api/brand/profiles`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch brand profiles');
  const data = await response.json();
  return data.profiles;
}

export async function deleteBrandProfile(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/brand/profiles/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete brand profile');
}

// ==================== DOCUMENTS API ====================

export interface SavedDocument {
  id: number;
  title: string;
  content?: string;
  html_content?: string;
  skill_used: string | null;
  prompt: string | null;
  model_used: string | null;
  brand_style: string | null;
  created_at: string;
  updated_at: string;
}

export async function getDocuments(): Promise<SavedDocument[]> {
  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch documents');
  const data = await response.json();
  return data.documents;
}

export async function getDocument(id: number): Promise<SavedDocument> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch document');
  return response.json();
}

export async function updateDocument(id: number, update: { title?: string; content?: string }): Promise<SavedDocument> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(update),
  });
  if (!response.ok) throw new Error('Failed to update document');
  return response.json();
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete document');
}

export async function downloadDocumentPdf(id: number, title: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}/pdf`, {
    headers: authHeadersOnly(),
  });
  if (!response.ok) throw new Error('Failed to download PDF');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==================== SKILLS API ====================

export async function getSkills(): Promise<Skill[]> {
  const response = await fetch(`${API_BASE_URL}/api/skills`);
  if (!response.ok) throw new Error('Failed to fetch skills');
  const data = await response.json();
  return data.skills;
}

export async function getSkill(skillName: string): Promise<Skill> {
  const response = await fetch(`${API_BASE_URL}/api/skills/${skillName}`);
  if (!response.ok) throw new Error('Failed to fetch skill');
  return response.json();
}

export async function generateDocument(request: DocumentRequest): Promise<DocumentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to generate document' }));
    throw new Error(err.detail || 'Failed to generate document');
  }
  return response.json();
}

export async function refineDocument(
  previousContent: string,
  feedback: string,
  skillName?: string,
  model?: string
): Promise<DocumentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/refine`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      previous_content: previousContent,
      feedback,
      skill_name: skillName,
      model: model || 'gemini-3-flash-preview',
    }),
  });
  if (!response.ok) throw new Error('Failed to refine document');
  return response.json();
}

export async function chainSkills(
  chain: ChainStep[],
  initialPrompt: string,
  model?: string
): Promise<{ chain_results: any[]; final_output: string; steps: number }> {
  const response = await fetch(`${API_BASE_URL}/api/chain`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ chain, initial_prompt: initialPrompt, model: model || 'gemini-3-flash-preview' }),
  });
  if (!response.ok) throw new Error('Failed to chain skills');
  return response.json();
}

export async function uploadSkill(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/skills/upload`, {
    method: 'POST',
    headers: authHeadersOnly(),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload skill');
  return response.json();
}

// ==================== EXPORT API ====================

export async function exportAsPdf(content: string, filename?: string, brandProfileId?: number): Promise<void> {
  const formData = new FormData();
  formData.append('content', content);
  if (filename) formData.append('filename', filename);
  if (brandProfileId) formData.append('brand_profile_id', String(brandProfileId));

  const response = await fetch(`${API_BASE_URL}/api/export/pdf`, {
    method: 'POST',
    headers: authHeadersOnly(),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to export PDF');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename || 'document'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportAsDocx(content: string, filename?: string): Promise<void> {
  const formData = new FormData();
  formData.append('content', content);
  if (filename) formData.append('filename', filename);

  const response = await fetch(`${API_BASE_URL}/api/export/docx`, {
    method: 'POST',
    headers: authHeadersOnly(),
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to export DOCX');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename || 'document'}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportDocument(
  format: string,
  content: string,
  filename?: string
): Promise<{ content: string; filename: string; mime_type: string; format: string }> {
  const formData = new FormData();
  formData.append('content', content);
  if (filename) formData.append('filename', filename);

  const response = await fetch(`${API_BASE_URL}/api/export/${format}`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to export document');
  return response.json();
}

export async function getModels(): Promise<{ models: AIModel[]; default: string }> {
  const response = await fetch(`${API_BASE_URL}/api/models`);
  if (!response.ok) throw new Error('Failed to fetch models');
  return response.json();
}

// ==================== IMAGE GENERATION API ====================

export async function getImageModels(): Promise<{ models: any[]; default: string }> {
  const response = await fetch(`${API_BASE_URL}/api/image-models`);
  if (!response.ok) throw new Error('Failed to fetch image models');
  return response.json();
}

export async function generateImage(prompt: string, model: string, aspectRatio: string = '1:1'): Promise<{ image_base64: string; mime_type: string; saved_to: string; filename: string }> {
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('model', model);
  formData.append('aspect_ratio', aspectRatio);
  const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Image generation failed' }));
    throw new Error(err.detail || 'Image generation failed');
  }
  return response.json();
}

// ==================== STRIPE / BILLING API ====================

export async function createCheckoutSession(planName: string): Promise<{ checkout_url: string; session_id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ plan: planName }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to create checkout session' }));
    throw new Error(err.detail || 'Failed to create checkout session');
  }
  return response.json();
}

export async function createCustomerPortal(): Promise<{ portal_url: string }> {
  const response = await fetch(`${API_BASE_URL}/api/stripe/customer-portal`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to open billing portal' }));
    throw new Error(err.detail || 'Failed to open billing portal');
  }
  return response.json();
}

// ==================== DASHBOARD API ====================

export async function getDashboard(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to load dashboard');
  return response.json();
}

// ==================== HEALTH API ====================

export async function getHealthStatus(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) throw new Error('Failed to get health status');
  return response.json();
}

// ==================== STREAMING GENERATION API ====================

export async function generateDocumentStream(
  request: DocumentRequest,
  onToken: (text: string) => void,
  onDone: (result: { full_text: string; model_used: string; skill_used: string | null }) => void,
  onError: (error: string) => void
): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/generate/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Streaming failed' }));
    throw new Error(err.detail || 'Streaming failed');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        // Store event type for next data line
        (reader as any).__lastEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        const eventType = (reader as any).__lastEvent || 'token';
        const data = JSON.parse(line.slice(6));

        if (eventType === 'token') {
          onToken(data.text);
        } else if (eventType === 'done') {
          onDone(data);
        } else if (eventType === 'error') {
          onError(data.error);
        }
      }
    }
  }
}

// ==================== ADMIN API ====================

export async function getAdminStats(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to load admin stats');
  return response.json();
}

export async function getAdminUsers(params?: { search?: string; plan?: string; limit?: number; offset?: number }): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.plan) searchParams.set('plan', params.plan);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  const response = await fetch(`${API_BASE_URL}/api/admin/users?${searchParams}`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to load users');
  return response.json();
}

export async function updateUserAdmin(userId: number, data: { plan?: string; is_admin?: boolean; generation_count?: number }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update user');
  return response.json();
}

export async function deleteUserAdmin(userId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'DELETE', headers: authHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
}

export async function getAuditLogs(params?: { limit?: number; offset?: number; action?: string }): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.action) searchParams.set('action', params.action);
  const response = await fetch(`${API_BASE_URL}/api/admin/audit-logs?${searchParams}`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to load audit logs');
  return response.json();
}

export async function getPendingUsers(): Promise<{ pending_users: any[]; count: number }> {
  const response = await fetch(`${API_BASE_URL}/api/admin/pending-users`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to load pending users');
  return response.json();
}

export async function approveUser(userId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/admin/approve-user/${userId}`, {
    method: 'POST', headers: authHeaders()
  });
  if (!response.ok) throw new Error('Failed to approve user');
  return response.json();
}

export async function rejectUser(userId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/admin/reject-user/${userId}`, {
    method: 'POST', headers: authHeaders()
  });
  if (!response.ok) throw new Error('Failed to reject user');
  return response.json();
}

export async function updateBranding(data: Record<string, string>): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/admin/branding`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update branding');
  return response.json();
}

export async function getBranding(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/branding`);
  if (!response.ok) throw new Error('Failed to load branding');
  return response.json();
}

// Download helper
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
