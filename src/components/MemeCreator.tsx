'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface MemeTemplate {
  id: string;
  name: string;
  path: string;
  width: number;
  height: number;
}

/**
 * MemeCreator component for creating and saving memes
 */
export default function MemeCreator() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const memeRef = useRef<HTMLDivElement>(null);

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/meme-templates/templates.json');
        const data = await response.json();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0]);
        }
      } catch (error) {
        console.error('Failed to load meme templates:', error);
      }
    };

    loadTemplates();
  }, []);

  /**
   * Handles template selection change
   * @param e - Change event
   */
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id === templateId) || null;
    setSelectedTemplate(template);
  };

  /**
   * Generates AI text for the meme
   */
  const generateAiText = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-meme-text');
      const data = await response.json();
      setTopText(data.topText);
      setBottomText(data.bottomText);
    } catch (error) {
      console.error('Failed to generate AI text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Saves the meme as a PNG image
   */
  const saveMeme = async () => {
    if (!memeRef.current) return;

    try {
      const dataUrl = await toPng(memeRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `meme-${selectedTemplate?.id || 'custom'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to save meme:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Meme Creator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="template" className="block text-sm font-medium mb-1">
                Select Template
              </label>
              <Select
                id="template"
                value={selectedTemplate?.id || ''}
                onChange={handleTemplateChange}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="topText" className="block text-sm font-medium mb-1">
                  Top Text
                </label>
                <Input
                  id="topText"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Enter top text"
                />
              </div>
              <div>
                <label htmlFor="bottomText" className="block text-sm font-medium mb-1">
                  Bottom Text
                </label>
                <Input
                  id="bottomText"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Enter bottom text"
                />
              </div>
            </div>

            {selectedTemplate && (
              <div className="mt-6 flex justify-center">
                <div
                  ref={memeRef}
                  className="relative inline-block"
                  style={{
                    width: selectedTemplate.width,
                    height: selectedTemplate.height,
                    maxWidth: '100%',
                    maxHeight: '70vh',
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedTemplate.path}
                      alt={selectedTemplate.name}
                      className="object-contain"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  </div>
                  <div
                    className="absolute top-0 left-0 right-0 p-4 text-center"
                    style={{
                      textShadow:
                        '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                    }}
                  >
                    <p className="text-white font-bold text-2xl md:text-4xl uppercase">{topText}</p>
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4 text-center"
                    style={{
                      textShadow:
                        '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                    }}
                  >
                    <p className="text-white font-bold text-2xl md:text-4xl uppercase">
                      {bottomText}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={generateAiText} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
          <Button onClick={saveMeme} disabled={!selectedTemplate}>
            Save Meme
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
