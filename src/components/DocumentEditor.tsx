import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wand2,
  RefreshCw,
  FileText,
  FileCode,
  FileDown,
  Check,
  Copy,
  Edit3
} from 'lucide-react';
import type { ExportFormat } from '@/types';
import { exportDocument, exportAsPdf, downloadFile, refineDocument } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface DocumentEditorProps {
  content: string;
  skillUsed?: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onContentChange: (content: string) => void;
  selectedModel?: string;
  brandProfileId?: number;
}

export function DocumentEditor({
  content,
  skillUsed,
  isGenerating,
  onGenerate,
  onContentChange,
  selectedModel,
  brandProfileId,
}: DocumentEditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [copied, setCopied] = useState(false);
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementDialogOpen, setRefinementDialogOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingHtml, setExportingHtml] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (format === 'docx') {
      try {
        setExportingDocx(true);
        toast.info('Generating DOCX...');
        const { exportAsDocx } = await import('@/lib/api');
        await exportAsDocx(content, 'document');
        toast.success('DOCX downloaded');
      } catch (err) {
        toast.error('Failed to export DOCX');
        console.error(err);
      } finally {
        setExportingDocx(false);
      }
      return;
    }

    if (format === 'html') {
      try {
        setExportingHtml(true);
        toast.info('Generating HTML...');
        const formData = new FormData();
        formData.append('content', content);
        formData.append('filename', 'document');
        const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:8001' : ''}/api/export/html`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Failed');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('HTML downloaded');
      } catch (err) {
        toast.error('Failed to export HTML');
        console.error(err);
      } finally {
        setExportingHtml(false);
      }
      return;
    }

    if (format === 'pdf') {
      try {
        setExportingPdf(true);
        toast.info('Generating PDF...');
        await exportAsPdf(content, 'document', brandProfileId);
        toast.success('PDF downloaded');
      } catch (err) {
        toast.error('Failed to export PDF');
        console.error(err);
      } finally {
        setExportingPdf(false);
      }
      return;
    }

    try {
      toast.info(`Exporting as ${format}...`);
      const result = await exportDocument(format, content);
      downloadFile(result.content, result.filename, result.mime_type);
      toast.success(`Exported as ${result.filename}`);
    } catch (err) {
      toast.error(`Failed to export as ${format}`);
      console.error(err);
    }
  };

  const handleRefine = async () => {
    if (!refinementFeedback.trim()) {
      toast.error('Please provide feedback for refinement');
      return;
    }

    try {
      setIsRefining(true);
      toast.info('Refining document...');
      const result = await refineDocument(content, refinementFeedback, skillUsed, selectedModel);
      onContentChange(result.content);
      setRefinementDialogOpen(false);
      setRefinementFeedback('');
      toast.success('Document refined successfully');
    } catch (err) {
      toast.error('Failed to refine document');
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const renderPreview = () => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mt-4 mb-2">{line.slice(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mt-3 mb-1">{line.slice(4)}</h3>;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-4">{line.slice(2)}</li>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold my-1">{line.slice(2, -2)}</p>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="my-1">{line}</p>;
      }
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Document Editor
            {skillUsed && (
              <span className="text-sm font-normal text-muted-foreground">
                ({skillUsed})
              </span>
            )}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!content || isGenerating}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">
                {copied ? 'Copied' : 'Copy'}
              </span>
            </Button>

            <Dialog open={refinementDialogOpen} onOpenChange={setRefinementDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!content || isGenerating}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">Refine</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Refine Document</DialogTitle>
                  <DialogDescription>
                    Provide feedback on what you'd like to improve
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Your Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="e.g., Make it more formal, add more details about..., shorten the introduction..."
                      value={refinementFeedback}
                      onChange={(e) => setRefinementFeedback(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleRefine}
                    disabled={isRefining || !refinementFeedback.trim()}
                    className="w-full"
                  >
                    {isRefining ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Refining...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Apply Refinement
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b px-4 py-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 m-0 p-4">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Your generated document will appear here..."
              className="w-full h-full min-h-[400px] resize-none font-mono text-sm"
              disabled={isGenerating}
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0 p-4 overflow-auto">
            <div className="prose prose-sm max-w-none">
              {content ? renderPreview() : (
                <p className="text-muted-foreground italic">
                  Generate a document to see the preview
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {content && (
        <div className="border-t p-4 bg-muted/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {content.length} characters
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Export as:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('text')}
              >
                <FileText className="w-4 h-4 mr-1" />
                Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('markdown')}
              >
                <FileCode className="w-4 h-4 mr-1" />
                MD
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('html')}
                disabled={exportingHtml}
              >
                {exportingHtml ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <FileCode className="w-4 h-4 mr-1" />
                )}
                HTML
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('docx')}
                disabled={exportingDocx}
              >
                {exportingDocx ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 mr-1" />
                )}
                DOCX
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={exportingPdf}
              >
                {exportingPdf ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 mr-1" />
                )}
                PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
