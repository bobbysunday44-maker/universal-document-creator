import { useState, useEffect } from 'react';
import type { Skill } from '@/types';
import { getSkills } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, FileText, Briefcase, GraduationCap, Scale, BookOpen,
  Mail, ClipboardList, FolderKanban, PenTool, Receipt, TrendingUp,
  Users, ScrollText, Presentation, Building2, Globe, Megaphone,
} from 'lucide-react';

interface SkillSelectorProps {
  selectedSkill: Skill | null;
  onSelectSkill: (skill: Skill | null) => void;
}

const skillIcons: Record<string, React.ReactNode> = {
  'Academic Essay': <GraduationCap className="w-4 h-4" />,
  'Business Proposal': <Briefcase className="w-4 h-4" />,
  'Resume Writing': <FileText className="w-4 h-4" />,
  'Legal Contract': <Scale className="w-4 h-4" />,
  'Technical Documentation': <BookOpen className="w-4 h-4" />,
  'Creative Story': <PenTool className="w-4 h-4" />,
  'Marketing Copy': <Megaphone className="w-4 h-4" />,
  'Email Template': <Mail className="w-4 h-4" />,
  'Meeting Minutes': <ClipboardList className="w-4 h-4" />,
  'Project Proposal': <FolderKanban className="w-4 h-4" />,
  'Invoice Generator': <Receipt className="w-4 h-4" />,
  'Financial Report': <TrendingUp className="w-4 h-4" />,
  'Case Study': <BookOpen className="w-4 h-4" />,
  'Job Description': <Users className="w-4 h-4" />,
  'Employee Handbook': <BookOpen className="w-4 h-4" />,
  'White Paper': <ScrollText className="w-4 h-4" />,
  'Pitch Deck Script': <Presentation className="w-4 h-4" />,
  'Company Profile': <Building2 className="w-4 h-4" />,
  'Press Release': <Globe className="w-4 h-4" />,
  'Social Media Kit': <Sparkles className="w-4 h-4" />,
};

export function SkillSelector({ selectedSkill, onSelectSkill }: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      setLoading(true);
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      setError('Failed to load skills');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSkillChange = (skillName: string) => {
    if (skillName === 'none') {
      onSelectSkill(null);
    } else {
      const skill = skills.find(s => s.name === skillName);
      onSelectSkill(skill || null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>{error}</p>
            <Button onClick={loadSkills} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Document Type
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedSkill?.name || 'none'}
          onValueChange={handleSkillChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a document type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                General Document (No Skill)
              </span>
            </SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill.name} value={skill.name}>
                <span className="flex items-center gap-2">
                  {skillIcons[skill.name] || <FileText className="w-4 h-4" />}
                  {skill.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedSkill && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              {skillIcons[selectedSkill.name] || <FileText className="w-5 h-5" />}
              <h4 className="font-semibold">{selectedSkill.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedSkill.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(selectedSkill.inputs).map((inputKey) => (
                <Badge key={inputKey} variant="secondary" className="text-xs">
                  {inputKey}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
