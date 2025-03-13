'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { MemeTemplate, TextInput } from './types';

interface TextInputFieldsProps {
  textInputs: TextInput[];
  selectedTemplate: MemeTemplate | null;
  // eslint-disable-next-line no-unused-vars
  updateTextInput: (id: string, text: string) => void;
}

/**
 * Text input fields component for the Meme Creator
 */
const TextInputFields: React.FC<TextInputFieldsProps> = ({
  textInputs,
  selectedTemplate,
  updateTextInput,
}) => {
  if (!selectedTemplate) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {textInputs.map((input) => (
        <div key={input.id}>
          <label htmlFor={`text-${input.id}`} className="block text-sm font-medium mb-1">
            {input.id.charAt(0).toUpperCase() + input.id.slice(1)} Text
          </label>
          <Input
            id={`text-${input.id}`}
            value={input.text}
            onChange={(e) => updateTextInput(input.id, e.target.value)}
            placeholder={`Enter ${input.id} text`}
          />
        </div>
      ))}
    </div>
  );
};

export default TextInputFields;
