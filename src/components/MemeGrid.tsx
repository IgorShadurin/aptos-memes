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
 * Features hover animations and colorful design
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
        const selectedTemplateIds = [
          'template1',
          'template5',
          'template7',
          'template10',
          'template3',
          'template6',
          'template8',
          'template9',
        ];
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

  // Array of gradient classes for cards
  const gradients = [
    'from-pink-600 to-purple-600',
    'from-orange-600 to-red-600',
    'from-green-600 to-teal-600',
    'from-blue-600 to-indigo-600',
    'from-yellow-600 to-orange-600',
    'from-purple-600 to-indigo-600',
    'from-red-600 to-pink-600',
    'from-teal-600 to-blue-600',
  ];

  // Array of pattern classes for cards
  const patterns = [
    'bg-[url("/patterns/pattern1.svg")]',
    'bg-[url("/patterns/pattern2.svg")]',
    'bg-[url("/patterns/pattern3.svg")]',
    'bg-[url("/patterns/pattern4.svg")]',
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? // Loading skeleton
            Array(8)
              .fill(0)
              .map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-0">
                    <div className="h-48 w-full bg-gray-200/50 dark:bg-gray-800/50 animate-pulse"></div>
                    <div className="p-3">
                      <div className="h-4 w-3/4 bg-gray-200/50 dark:bg-gray-800/50 animate-pulse mb-2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
          : templates.map((template, index) => (
              <Card
                key={template.id}
                className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border-0 bg-white/90 backdrop-blur-sm"
              >
                <CardContent className="p-0 relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr ${gradients[index % gradients.length]} opacity-90`}
                  >
                    <div
                      className={`absolute inset-0 ${patterns[index % patterns.length]} opacity-10`}
                    ></div>
                  </div>
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={template.path}
                      alt={template.name}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <div className="relative p-4 text-white">
                    <h3 className="font-bold text-lg truncate">{template.name}</h3>
                    <div className="flex flex-wrap mt-3 justify-center">
                      <Link href={`/meme-creator?template=${template.id}`}>
                        <Button
                          size="sm"
                          className="bg-white text-gray-800 hover:bg-yellow-300 hover:text-purple-800 font-medium transition-colors shadow-md w-full"
                        >
                          Create Meme
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      <div className="flex justify-center mt-12">
        <Link href="/meme-creator">
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105"
          >
            Create Your Own Meme
          </Button>
        </Link>
      </div>
    </div>
  );
}
