'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  path: string;
}

/**
 * Grid of popular meme templates to display on the home page
 */
export default function MemeGrid() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from the JSON file
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/meme-templates/templates.json');
        const data = await response.json();
        // Select a diverse subset of templates to display on the grid
        // Including templates with different numbers of text areas
        const selectedTemplateIds = ['template1', 'template5', 'template7', 'template10'];
        const popularTemplates = data
          .filter((template: any) => selectedTemplateIds.includes(template.id))
          .map((template: any) => ({
            id: template.id,
            name: template.name,
            path: template.path,
          }));
        setTemplates(popularTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Popular Meme Templates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? // Loading skeleton
            Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                    <div className="p-3">
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 animate-pulse mb-2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
          : templates.map((template) => (
              <Card key={template.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={template.path}
                      alt={template.name}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-medium truncate">{template.name}</p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                      <Link href="/meme-creator">
                        <Button size="sm" className="w-full">
                          Create Meme
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      <div className="flex justify-center mt-8">
        <Link href="/meme-creator">
          <Button size="lg">Create Your Own Meme</Button>
        </Link>
      </div>
    </div>
  );
}
