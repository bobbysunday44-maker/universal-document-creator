import { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PremiumHeader } from '@/components/PremiumHeader';
import { HeroSection } from '@/sections/HeroSection';
import { FeaturesSection } from '@/sections/FeaturesSection';
import { TemplatesSection } from '@/sections/TemplatesSection';
import { TestimonialsSection } from '@/sections/TestimonialsSection';
import { PricingSection } from '@/sections/PricingSection';
import { CTASection } from '@/sections/CTASection';
import { Footer } from '@/components/Footer';
import { SkillSelector } from '@/components/SkillSelector';
import { ParameterForm } from '@/components/ParameterForm';
import { DocumentEditor } from '@/components/DocumentEditor';
import { SkillUploader } from '@/components/SkillUploader';
import type { Skill, AIModel } from '@/types';
import {
  generateDocument, generateDocumentStream, getSkills, getModels, saveApiKeys, getApiKeyStatus,
  uploadBrandScreenshot, getBrandProfiles, deleteBrandProfile,
  getDocuments, getDocument, deleteDocument, downloadDocumentPdf,
  getImageModels, generateImage,
  type BrandProfile, type SavedDocument
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Sparkles,
  Settings,
  Trash2,
  Wand2,
  Cpu,
  Thermometer,
  Hash,
  BookOpen,
  ArrowLeft,
  Crown,
  Key,
  Palette,
  History,
  Eye,
  EyeOff,
  X,
  Check,
  ShieldOff,
  Image as ImageIcon,
  Loader2,
  Download,
  ChevronDown,
  Search,
  FileDown,
} from 'lucide-react';

// Main App Component
function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [currentSection, setCurrentSection] = useState('home');

  // App State
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [skillUsed, setSkillUsed] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Settings state
  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState('');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [anthropicConfigured, setAnthropicConfigured] = useState(false);
  const [savingAnthropicKey, setSavingAnthropicKey] = useState(false);

  // Brand profiles
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(undefined);
  const [uploadingBrand, setUploadingBrand] = useState(false);
  const brandFileRef = useRef<HTMLInputElement>(null);

  // Document history
  const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Image generation
  const [appMode, setAppMode] = useState<'document' | 'image'>('document');
  const [imageModels, setImageModels] = useState<any[]>([]);
  const [selectedImageModel, setSelectedImageModel] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [generatedImage, setGeneratedImage] = useState<{ image_base64: string; mime_type: string; filename: string } | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Load skills and models
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load user-specific data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  async function loadInitialData() {
    try {
      const [skillsData, modelsData, imageModelsData] = await Promise.all([
        getSkills(),
        getModels(),
        getImageModels().catch(() => ({ models: [], default: '' })),
      ]);
      setSkills(skillsData);
      setModels(modelsData.models);
      setSelectedModel(modelsData.default);
      setImageModels(imageModelsData.models);
      if (imageModelsData.default) setSelectedImageModel(imageModelsData.default);
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  }

  async function loadUserData() {
    try {
      const [keyStatus, profiles, docs] = await Promise.all([
        getApiKeyStatus().catch(() => ({ gemini_configured: false, anthropic_configured: false })),
        getBrandProfiles().catch(() => []),
        getDocuments().catch(() => []),
      ]);
      setGeminiConfigured(keyStatus.gemini_configured);
      setAnthropicConfigured(keyStatus.anthropic_configured || false);
      setBrandProfiles(profiles);
      setSavedDocs(docs);
    } catch (err) {
      console.error('Failed to load user data', err);
    }
  }

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    setCurrentView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTemplate = (skillName: string | null, promptHint: string) => {
    // Pre-select the skill if it exists
    if (skillName) {
      const skill = skills.find(s => s.name === skillName);
      if (skill) {
        setSelectedSkill(skill);
      }
    }
    // Pre-fill the prompt hint
    if (promptHint) {
      setPrompt(promptHint);
    }
    // Navigate to the app view
    setCurrentView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const request = {
      skill_name: selectedSkill?.name,
      prompt,
      parameters,
      model: selectedModel,
      temperature,
      max_tokens: maxTokens,
      brand_profile_id: selectedBrandId,
    };

    try {
      setIsGenerating(true);
      setGeneratedContent(''); // Clear previous content
      toast.info('Generating document...');

      // Try streaming first
      try {
        await generateDocumentStream(
          request,
          (text) => {
            // Append each token as it arrives
            setGeneratedContent(prev => prev + text);
          },
          (result) => {
            // Done — set final content and metadata
            setGeneratedContent(result.full_text);
            setSkillUsed(result.skill_used || undefined);
            toast.success(`Document generated with ${result.model_used}`);
            // Refresh document history
            if (isAuthenticated) {
              getDocuments().then(setSavedDocs).catch(() => {});
            }
          },
          (error) => {
            toast.error(`Generation error: ${error}`);
          }
        );
      } catch {
        // Fallback to non-streaming if SSE fails
        const result = await generateDocument(request);
        setGeneratedContent(result.content);
        setSkillUsed(result.skill_used);
        toast.success(`Document generated with ${result.model_used}`);
        if (isAuthenticated) {
          getDocuments().then(setSavedDocs).catch(() => {});
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate document';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKey.trim()) return;
    try {
      setSavingKey(true);
      await saveApiKeys({ gemini_api_key: geminiKey });
      setGeminiConfigured(true);
      setGeminiKey('');
      toast.success('Gemini API key saved');
    } catch (err) {
      toast.error('Failed to save API key');
    } finally {
      setSavingKey(false);
    }
  };

  const handleSaveAnthropicKey = async () => {
    if (!anthropicKey.trim()) return;
    try {
      setSavingAnthropicKey(true);
      await saveApiKeys({ anthropic_api_key: anthropicKey });
      setAnthropicConfigured(true);
      setAnthropicKey('');
      toast.success('Anthropic API key saved');
    } catch (err) {
      toast.error('Failed to save API key');
    } finally {
      setSavingAnthropicKey(false);
    }
  };

  const handleBrandUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBrand(true);
      toast.info('Analyzing brand style...');
      const result = await uploadBrandScreenshot(file, file.name.split('.')[0], selectedModel);
      setBrandProfiles(prev => [result.profile, ...prev]);
      setSelectedBrandId(result.profile.id);
      toast.success('Brand style extracted!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze screenshot';
      toast.error(message);
    } finally {
      setUploadingBrand(false);
      if (brandFileRef.current) brandFileRef.current.value = '';
    }
  };

  const handleDeleteBrand = async (id: number) => {
    try {
      await deleteBrandProfile(id);
      setBrandProfiles(prev => prev.filter(p => p.id !== id));
      if (selectedBrandId === id) setSelectedBrandId(undefined);
      toast.success('Brand profile deleted');
    } catch (err) {
      toast.error('Failed to delete brand profile');
    }
  };

  const handleLoadDocument = async (doc: SavedDocument) => {
    try {
      const full = await getDocument(doc.id);
      setGeneratedContent(full.content || '');
      setSkillUsed(full.skill_used || undefined);
      setShowHistory(false);
      toast.success(`Loaded: ${doc.title}`);
    } catch (err) {
      toast.error('Failed to load document');
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await deleteDocument(id);
      setSavedDocs(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleSkillUploadSuccess = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      console.error('Failed to reload skills', err);
    }
  };

  const clearAll = () => {
    setSelectedSkill(null);
    setParameters({});
    setPrompt('');
    setGeneratedContent('');
    setSkillUsed(undefined);
    toast.info('All fields cleared');
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter an image prompt');
      return;
    }
    try {
      setIsGeneratingImage(true);
      setGeneratedImage(null);
      toast.info('Generating image...');
      const result = await generateImage(imagePrompt, selectedImageModel, imageAspectRatio);
      setGeneratedImage({
        image_base64: result.image_base64,
        mime_type: result.mime_type,
        filename: result.filename,
      });
      toast.success('Image generated successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image generation failed';
      toast.error(message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:${generatedImage.mime_type};base64,${generatedImage.image_base64}`;
    link.download = generatedImage.filename || 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentModel = models.find(m => m.id === selectedModel);

  // Landing Page View
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-right" richColors />
        <PremiumHeader
          onNavigate={handleNavigate}
          currentSection={currentSection}
        />

        <main>
          <HeroSection onGetStarted={handleGetStarted} />
          <FeaturesSection />
          <TemplatesSection onSelectTemplate={handleSelectTemplate} />
          <TestimonialsSection />
          <PricingSection />
          <CTASection onGetStarted={handleGetStarted} />
        </main>

        <Footer />
      </div>
    );
  }

  // App View
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />

      {/* App Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView('landing')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Universal Doc</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-lg border bg-muted/50 p-0.5">
              <button
                onClick={() => setAppMode('document')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  appMode === 'document'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Document
              </button>
              <button
                onClick={() => setAppMode('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  appMode === 'image'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image
              </button>
            </div>

            {/* Model indicator */}
            {currentModel && appMode === 'document' && (
              <Badge
                variant={currentModel.censored ? "secondary" : "destructive"}
                className="hidden sm:flex items-center gap-1 text-xs"
              >
                {!currentModel.censored && <ShieldOff className="w-3 h-3" />}
                {currentModel.tag}
              </Badge>
            )}

            {isAuthenticated && user && (
              <Badge variant="outline" className="hidden md:flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {user.name}
              </Badge>
            )}
            {!isAuthenticated && (
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Guest Mode
              </Badge>
            )}

            {/* Document History Button */}
            {isAuthenticated && (
              <Button variant="outline" size="icon" onClick={() => setShowHistory(!showHistory)}>
                <History className="w-4 h-4" />
              </Button>
            )}

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Settings & Configuration
                  </SheetTitle>
                  <SheetDescription>
                    Configure AI models, API keys, and brand style
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* AI Model Selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      AI Model
                    </Label>
                    <div className="space-y-2">
                      {models.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setSelectedModel(model.id)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedModel === model.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          } ${!model.installed ? 'opacity-50' : ''}`}
                          disabled={!model.installed}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{model.name}</span>
                              {model.vision && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  <Eye className="w-2.5 h-2.5 mr-0.5" />
                                  Vision
                                </Badge>
                              )}
                            </div>
                            <Badge
                              variant={model.censored ? "secondary" : "destructive"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {model.tag}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                          {!model.installed && (
                            <p className="text-xs text-destructive mt-1">Not installed</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Gemini API Key */}
                  {isAuthenticated && (
                    <>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Gemini API Key
                          {geminiConfigured && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300">
                              <Check className="w-2.5 h-2.5 mr-0.5" />
                              Configured
                            </Badge>
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={showGeminiKey ? "text" : "password"}
                              placeholder={geminiConfigured ? "Key saved — enter new to update" : "Paste your Gemini API key"}
                              value={geminiKey}
                              onChange={(e) => setGeminiKey(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowGeminiKey(!showGeminiKey)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <Button size="sm" onClick={handleSaveGeminiKey} disabled={!geminiKey.trim() || savingKey}>
                            {savingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Free from Google AI Studio. Required for Gemini 3 Flash.
                        </p>
                      </div>

                      <Separator />

                      {/* Anthropic API Key */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Anthropic API Key
                          {anthropicConfigured && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300">
                              <Check className="w-2.5 h-2.5 mr-0.5" />
                              Configured
                            </Badge>
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={showAnthropicKey ? "text" : "password"}
                              placeholder={anthropicConfigured ? "Key saved — enter new to update" : "Paste your Anthropic API key"}
                              value={anthropicKey}
                              onChange={(e) => setAnthropicKey(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <Button size="sm" onClick={handleSaveAnthropicKey} disabled={!anthropicKey.trim() || savingAnthropicKey}>
                            {savingAnthropicKey ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Required for Claude Sonnet 4 and Haiku 4.5 models.
                        </p>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Brand Style */}
                  {isAuthenticated && (
                    <>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Brand Style
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Upload a website screenshot — AI extracts your brand colors, fonts, and style
                        </p>
                        <input
                          ref={brandFileRef}
                          type="file"
                          accept="image/*"
                          onChange={handleBrandUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => brandFileRef.current?.click()}
                          disabled={uploadingBrand}
                        >
                          {uploadingBrand ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing style...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Upload Website Screenshot
                            </>
                          )}
                        </Button>

                        {/* Saved brand profiles */}
                        {brandProfiles.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs">Your Brand Profiles</Label>
                            <Select
                              value={selectedBrandId ? String(selectedBrandId) : "none"}
                              onValueChange={(v) => setSelectedBrandId(v === "none" ? undefined : Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="No brand style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No brand style</SelectItem>
                                {brandProfiles.map((bp) => (
                                  <SelectItem key={bp.id} value={String(bp.id)}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: bp.primary_color }}
                                      />
                                      {bp.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Brand color preview */}
                            {selectedBrandId && (() => {
                              const bp = brandProfiles.find(p => p.id === selectedBrandId);
                              if (!bp) return null;
                              return (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                  <div className="flex gap-1">
                                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: bp.primary_color }} title="Primary" />
                                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: bp.secondary_color }} title="Secondary" />
                                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: bp.accent_color }} title="Accent" />
                                  </div>
                                  <span className="text-xs text-muted-foreground flex-1">{bp.font_family}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleDeleteBrand(bp.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Temperature */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4" />
                        Temperature
                      </Label>
                      <Badge variant="secondary">{temperature}</Badge>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>

                  <Separator />

                  {/* Max Tokens */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Max Tokens
                      </Label>
                      <Badge variant="secondary">{maxTokens}</Badge>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="8000"
                      step="500"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <Separator />

                  <SkillUploader onUploadSuccess={handleSkillUploadSuccess} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Mobile Mode Toggle */}
          <div className="sm:hidden flex items-center rounded-lg border bg-muted/50 p-0.5 mb-4">
            <button
              onClick={() => setAppMode('document')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                appMode === 'document'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              Document
            </button>
            <button
              onClick={() => setAppMode('image')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                appMode === 'image'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Image
            </button>
          </div>

          {appMode === 'document' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Sidebar - Configuration */}
            <div className="lg:col-span-4 space-y-6 lg:block">
              {/* Mobile toggle button - only visible on mobile */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {selectedSkill ? selectedSkill.name : 'Configure Document'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showMobileSidebar ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {/* Sidebar content - always visible on desktop, toggleable on mobile */}
              <div className={`space-y-6 ${showMobileSidebar ? 'block' : 'hidden lg:block'}`}>
              {/* Model Quick Selector */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Cpu className="w-4 h-4" />
                    AI Model
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.filter(m => m.installed).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            {!model.censored && <ShieldOff className="w-3 h-3 text-destructive" />}
                            {model.vision && <Eye className="w-3 h-3 text-blue-500" />}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentModel && !currentModel.censored && (
                    <p className="text-[11px] text-destructive/80 flex items-center gap-1">
                      <ShieldOff className="w-3 h-3" />
                      Unrestricted — no content filters
                    </p>
                  )}
                </CardContent>
              </Card>

              <SkillSelector
                selectedSkill={selectedSkill}
                onSelectSkill={setSelectedSkill}
              />

              <ParameterForm
                skill={selectedSkill}
                parameters={parameters}
                onParametersChange={setParameters}
              />

              {/* Brand Style Quick Select */}
              {isAuthenticated && brandProfiles.length > 0 && (
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Palette className="w-4 h-4" />
                      Brand Style
                    </Label>
                    <Select
                      value={selectedBrandId ? String(selectedBrandId) : "none"}
                      onValueChange={(v) => setSelectedBrandId(v === "none" ? undefined : Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No brand style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Default style</SelectItem>
                        {brandProfiles.map((bp) => (
                          <SelectItem key={bp.id} value={String(bp.id)}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: bp.primary_color }} />
                              {bp.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-2">Available Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 5).map((skill) => (
                      <Badge key={skill.name} variant="outline" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                    {skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>

            {/* Right Side - Editor */}
            <div className="lg:col-span-8 space-y-6">
              {/* Document History Panel */}
              {showHistory && isAuthenticated && (() => {
                // Filter documents by search term
                const filtered = savedDocs.filter(doc =>
                  !historySearch.trim() ||
                  doc.title.toLowerCase().includes(historySearch.toLowerCase()) ||
                  (doc.skill_used && doc.skill_used.toLowerCase().includes(historySearch.toLowerCase())) ||
                  (doc.model_used && doc.model_used.toLowerCase().includes(historySearch.toLowerCase()))
                );

                // Group documents by date
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const yesterday = new Date(today.getTime() - 86400000);

                const groups: { label: string; docs: SavedDocument[] }[] = [];
                const todayDocs: SavedDocument[] = [];
                const yesterdayDocs: SavedDocument[] = [];
                const olderDocs: SavedDocument[] = [];

                filtered.forEach(doc => {
                  const docDate = new Date(doc.created_at);
                  const docDay = new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate());
                  if (docDay.getTime() >= today.getTime()) {
                    todayDocs.push(doc);
                  } else if (docDay.getTime() >= yesterday.getTime()) {
                    yesterdayDocs.push(doc);
                  } else {
                    olderDocs.push(doc);
                  }
                });

                if (todayDocs.length > 0) groups.push({ label: 'Today', docs: todayDocs });
                if (yesterdayDocs.length > 0) groups.push({ label: 'Yesterday', docs: yesterdayDocs });
                if (olderDocs.length > 0) groups.push({ label: 'Older', docs: olderDocs });

                return (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <History className="w-4 h-4" />
                          Document History ({savedDocs.length})
                        </h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowHistory(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Search filter */}
                      <div className="relative mb-3">
                        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search documents..."
                          value={historySearch}
                          onChange={(e) => setHistorySearch(e.target.value)}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>

                      {savedDocs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No saved documents yet. Generated documents are auto-saved.</p>
                      ) : filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents matching "{historySearch}"</p>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {groups.map((group) => (
                            <div key={group.label}>
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                                {group.label}
                              </p>
                              <div className="space-y-1">
                                {group.docs.map((doc) => (
                                  <div key={doc.id} className="flex items-start justify-between p-2.5 rounded-lg hover:bg-muted/50 group border border-transparent hover:border-border transition-colors">
                                    <button
                                      className="flex-1 text-left min-w-0"
                                      onClick={() => handleLoadDocument(doc)}
                                    >
                                      <p className="text-sm font-medium truncate">{doc.title}</p>
                                      {doc.content && (
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                          {doc.content.slice(0, 100).replace(/[#*\n]/g, ' ').trim()}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1">
                                        {doc.model_used && (
                                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                                            {doc.model_used}
                                          </Badge>
                                        )}
                                        {doc.skill_used && (
                                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                            {doc.skill_used}
                                          </Badge>
                                        )}
                                        <span className="text-[10px] text-muted-foreground">
                                          {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </button>
                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        title="Download PDF"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          downloadDocumentPdf(doc.id, doc.title).then(() => {
                                            toast.success('PDF downloaded');
                                          }).catch(() => {
                                            toast.error('Failed to download PDF');
                                          });
                                        }}
                                      >
                                        <FileDown className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive/70 hover:text-destructive"
                                        title="Delete"
                                        onClick={() => handleDeleteDocument(doc.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              <div className="space-y-3">
                <Label htmlFor="prompt" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Your Request
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {selectedSkill
                        ? `Using ${selectedSkill.name} skill`
                        : 'Using general document generation'}
                    </p>
                    {selectedBrandId && (
                      <Badge variant="outline" className="text-[10px]">
                        <Palette className="w-2.5 h-2.5 mr-0.5" />
                        Branded
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      size="sm"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <DocumentEditor
                content={generatedContent}
                skillUsed={skillUsed}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                onContentChange={setGeneratedContent}
                selectedModel={selectedModel}
                brandProfileId={selectedBrandId}
              />
            </div>
          </div>
          ) : (
          /* ==================== IMAGE GENERATION MODE ==================== */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Image Model & Settings */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Image Generation</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Image Model Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Model</Label>
                    <Select value={selectedImageModel} onValueChange={setSelectedImageModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select image model" />
                      </SelectTrigger>
                      <SelectContent>
                        {imageModels.map((m: any) => (
                          <SelectItem key={m.id || m.name || m} value={m.id || m.name || m}>
                            {m.name || m.id || m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Aspect Ratio Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Aspect Ratio</Label>
                    <Select value={imageAspectRatio} onValueChange={setImageAspectRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="3:4">3:4 (Portrait Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompt & Generate */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Label htmlFor="image-prompt" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Image Prompt
                </Label>
                <Textarea
                  id="image-prompt"
                  placeholder="Describe the image you want to generate..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {selectedImageModel ? `Using ${selectedImageModel}` : 'Select a model above'}
                    {' \u00B7 '}{imageAspectRatio}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setImagePrompt(''); setGeneratedImage(null); }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                    <Button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !imagePrompt.trim() || !selectedImageModel}
                      size="sm"
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isGeneratingImage && !generatedImage && (
              <Card>
                <CardContent className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-10 h-10 animate-spin mb-3" />
                  <p className="text-sm">Generating your image...</p>
                </CardContent>
              </Card>
            )}

            {/* Generated Image Preview */}
            {generatedImage && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Generated Image
                    </h3>
                    <Button size="sm" variant="outline" onClick={handleDownloadImage}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="rounded-lg overflow-hidden border bg-muted/30">
                    <img
                      src={`data:${generatedImage.mime_type};base64,${generatedImage.image_base64}`}
                      alt="Generated image"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {generatedImage.filename}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {skills.length} Skills Available
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                {models.filter(m => m.installed).length} Models
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Universal Document Creator v2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wrap with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
