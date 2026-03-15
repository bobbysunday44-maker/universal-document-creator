import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileUp, X, Check, Sparkles } from 'lucide-react';
import { uploadSkill } from '@/lib/api';
import { toast } from 'sonner';

interface SkillUploaderProps {
  onUploadSuccess: () => void;
}

export function SkillUploader({ onUploadSuccess }: SkillUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.name.endsWith('.md')) {
      toast.error('Only .md files are allowed');
      return;
    }
    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error('File size must be less than 1MB');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const result = await uploadSkill(selectedFile);
      toast.success(`Successfully uploaded ${result.skills_added} skill(s)`);
      setSelectedFile(null);
      onUploadSuccess();
    } catch (err) {
      toast.error('Failed to upload skill');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Upload Custom Skill
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${selectedFile ? 'bg-muted/50' : ''}
          `}
        >
          {!selectedFile ? (
            <>
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Drag and drop your skill file
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                or click to browse (Markdown files only)
              </p>
              <input
                type="file"
                accept=".md"
                onChange={handleFileSelect}
                className="hidden"
                id="skill-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('skill-upload')?.click()}
              >
                <FileUp className="w-4 h-4 mr-2" />
                Select File
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">{selectedFile.name}</span>
                <button
                  onClick={clearFile}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Skill
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Skill file format:</p>
          <code className="block bg-muted p-2 rounded text-left overflow-x-auto">
            {`### Skill: Skill Name
- **Name**: Skill Name
- **Description**: What this skill does
- **Inputs**:
  - param1 (string): Description
  - param2 (array): Description
- **Outputs**: Expected output format
- **Template**: |
    Your prompt template with {param1} placeholders`}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
