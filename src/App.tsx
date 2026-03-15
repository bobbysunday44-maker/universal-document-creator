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
  generateDocument, getSkills, getModels, saveApiKeys, getApiKeyStatus,
  uploadBrandScreenshot, getBrandProfiles, deleteBrandProfile,
  getDocuments, getDocument, deleteDocument,
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

  // Settings state
  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  // Brand profiles
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(undefined);
  const [uploadingBrand, setUploadingBrand] = useState(false);
  const brandFileRef = useRef<HTMLInputElement>(null);

  // Document history
  const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
      const [skillsData, modelsData] = await Promise.all([
        getSkills(),
        getModels(),
      ]);
      setSkills(skillsData);
      setModels(modelsData.models);
      setSelectedModel(modelsData.default);
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  }

  async function loadUserData() {
    try {
      const [keyStatus, profiles, docs] = await Promise.all([
        getApiKeyStatus().catch(() => ({ gemini_configured: false })),
        getBrandProfiles().catch(() => []),
        getDocuments().catch(() => []),
      ]);
      setGeminiConfigured(keyStatus.gemini_configured);
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

    try {
      setIsGenerating(true);
      toast.info('Generating document...');

      const request = {
        skill_name: selectedSkill?.name,
        prompt,
        parameters,
        model: selectedModel,
        temperature,
        max_tokens: maxTokens,
        brand_profile_id: selectedBrandId,
      };

      const result = await generateDocument(request);
      setGeneratedContent(result.content);
      setSkillUsed(result.skill_used);
      toast.success(`Document generated with ${result.model_used}`);

      // Refresh document history
      if (isAuthenticated) {
        getDocuments().then(setSavedDocs).catch(() => {});
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate document';
      toast.error(message);
      console.error(err);
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
            {/* Model indicator */}
            {currentModel && (
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Sidebar - Configuration */}
            <div className="lg:col-span-4 space-y-6">
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

            {/* Right Side - Editor */}
            <div className="lg:col-span-8 space-y-6">
              {/* Document History Panel */}
              {showHistory && isAuthenticated && (
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
                    {savedDocs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No saved documents yet. Generated documents are auto-saved.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {savedDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group">
                            <button
                              className="flex-1 text-left"
                              onClick={() => handleLoadDocument(doc)}
                            >
                              <p className="text-sm font-medium truncate">{doc.title}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {doc.model_used && <span className="mr-2">{doc.model_used}</span>}
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </button>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
                <div className="flex items-center justify-between">
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
                  <div className="flex gap-2">
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
