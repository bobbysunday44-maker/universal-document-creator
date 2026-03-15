import { useState, useEffect } from 'react';
import type { Skill } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ParameterFormProps {
  skill: Skill | null;
  parameters: Record<string, any>;
  onParametersChange: (params: Record<string, any>) => void;
}

export function ParameterForm({ skill, parameters, onParametersChange }: ParameterFormProps) {
  const [localParams, setLocalParams] = useState<Record<string, any>>({});
  const [arrayInputs, setArrayInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (skill) {
      // Initialize with empty values for required inputs
      const initialParams: Record<string, any> = {};
      Object.keys(skill.inputs).forEach((key) => {
        const inputType = skill.inputs[key].type;
        if (inputType.includes('array')) {
          initialParams[key] = parameters[key] || [];
        } else {
          initialParams[key] = parameters[key] || '';
        }
      });
      setLocalParams(initialParams);
      onParametersChange(initialParams);
    }
  }, [skill]);

  const handleParamChange = (key: string, value: any) => {
    const newParams = { ...localParams, [key]: value };
    setLocalParams(newParams);
    onParametersChange(newParams);
  };

  const handleArrayAdd = (key: string) => {
    const value = arrayInputs[key]?.trim();
    if (value) {
      const currentArray = localParams[key] || [];
      handleParamChange(key, [...currentArray, value]);
      setArrayInputs({ ...arrayInputs, [key]: '' });
    }
  };

  const handleArrayRemove = (key: string, index: number) => {
    const currentArray = localParams[key] || [];
    handleParamChange(key, currentArray.filter((_: any, i: number) => i !== index));
  };

  const renderInput = (key: string, inputDef: { type: string; description: string }) => {
    const inputType = inputDef.type;
    const isArray = inputType.includes('array');
    const isNumber = inputType.includes('number');

    if (isArray) {
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={`Add ${key}...`}
              value={arrayInputs[key] || ''}
              onChange={(e) => setArrayInputs({ ...arrayInputs, [key]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayAdd(key);
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleArrayAdd(key)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(localParams[key] || []).map((item: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleArrayRemove(key, index)}
                  className="hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (key.toLowerCase().includes('description') || 
        key.toLowerCase().includes('content') ||
        key.toLowerCase().includes('details')) {
      return (
        <Textarea
          placeholder={inputDef.description}
          value={localParams[key] || ''}
          onChange={(e) => handleParamChange(key, e.target.value)}
          rows={4}
        />
      );
    }

    return (
      <Input
        type={isNumber ? 'number' : 'text'}
        placeholder={inputDef.description}
        value={localParams[key] || ''}
        onChange={(e) => handleParamChange(key, isNumber ? Number(e.target.value) : e.target.value)}
      />
    );
  };

  if (!skill) {
    return (
      <Card className="opacity-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a document type to see available parameters
          </p>
        </CardContent>
      </Card>
    );
  }

  const inputs = Object.entries(skill.inputs);

  if (inputs.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This skill doesn't require any parameters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inputs.map(([key, inputDef]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                {inputDef.type.includes('optional') && (
                  <span className="text-xs text-muted-foreground">(optional)</span>
                )}
              </Label>
              {renderInput(key, inputDef)}
              <p className="text-xs text-muted-foreground">{inputDef.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
