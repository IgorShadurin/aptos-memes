'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Grid of popular meme templates to display on the home page
 */
export default function MemeGrid() {
  const templates = [
    {
      id: 'drake',
      name: 'Drake Hotline Bling',
      path: '/meme-templates/drake.jpg',
    },
    {
      id: 'distracted-boyfriend',
      name: 'Distracted Boyfriend',
      path: '/meme-templates/distracted-boyfriend.jpg',
    },
    {
      id: 'two-buttons',
      name: 'Two Buttons',
      path: '/meme-templates/two-buttons.jpg',
    },
    {
      id: 'change-my-mind',
      name: 'Change My Mind',
      path: '/meme-templates/change-my-mind.jpg',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Popular Meme Templates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden group">
            <CardContent className="p-0">
              <div className="relative h-48 w-full bg-secondary/20">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <p className="text-sm">{template.name}</p>
                </div>
                {/* 
                  This would normally display the actual image:
                  <Image 
                    src={template.path}
                    alt={template.name}
                    className="object-cover"
                    fill
                  />
                */}
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
