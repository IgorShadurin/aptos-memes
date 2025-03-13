'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiDownload, HiThumbUp } from 'react-icons/hi';

interface TextArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align: 'left' | 'center' | 'right';
  defaultText: string;
}

interface Template {
  id: string;
  name: string;
  path: string;
  width: number;
  height: number;
  textAreas: TextArea[];
}

interface MemeText {
  id: string;
  text: string;
}

interface MemeOfDay {
  id: string;
  title: string;
  templateId: string;
  imagePath: string;
  likes: number;
  creator: string;
  date: string;
  joke: string;
  texts: MemeText[];
}

/**
 * MemeOfTheDay component displays a featured meme with download functionality
 * Includes rendering of text on the meme and proper image download
 */
export default function MemeOfTheDay() {
  const [meme, setMeme] = useState<MemeOfDay | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const memeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now we'll use mock data and the template data
    const loadMemeOfTheDay = async () => {
      try {
        setIsLoading(true);

        // Load templates to get text areas
        const templatesResponse = await fetch('/meme-templates/templates.json');
        const templatesData = await templatesResponse.json();

        // Mock data for the meme of the day with drone jokes
        const droneJokes = [
          "Why don't drones ever get invited to parties? They always hover around and buzz everyone off!",
          'I bought a drone for my kid, but I had to return it. It kept getting grounded!',
          'My drone and I broke up. It said our relationship was too up in the air!',
          'What do you call a drone that delivers desserts? A Pie in the Sky!',
          'Drone photography is looking up these days.',
        ];

        // Pick a random joke from the array
        const randomJoke = droneJokes[Math.floor(Math.random() * droneJokes.length)];

        // Use template6 (Leonardo DiCaprio) for the meme of the day
        const templateId = 'template6';
        const selectedTemplate = templatesData.find((t: Template) => t.id === templateId);

        if (selectedTemplate) {
          setTemplate(selectedTemplate);

          const mockMeme: MemeOfDay = {
            id: 'drone-1',
            title: 'Drone Humor Takes Flight',
            templateId,
            imagePath: selectedTemplate.path,
            likes: 321,
            creator: 'DroneEnthusiast',
            date: new Date().toLocaleDateString(),
            joke: randomJoke,
            texts: [
              {
                id: 'caption',
                text: 'When you finally get your drone footage after battling wind warnings for 20 minutes',
              },
            ],
          };

          setMeme(mockMeme);
          setLikeCount(mockMeme.likes);
        }
      } catch (error) {
        console.error('Failed to load meme of the day:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemeOfTheDay();
  }, []);

  /**
   * Handles the like button click
   */
  const handleLike = () => {
    if (!liked) {
      setLikeCount((prev) => prev + 1);
      setLiked(true);
    } else {
      setLikeCount((prev) => prev - 1);
      setLiked(false);
    }
  };

  /**
   * Handles downloading the meme image with text
   */
  const handleDownload = async () => {
    if (!meme || !memeRef.current) return;

    try {
      // Generate image with text using html-to-image
      const dataUrl = await toPng(memeRef.current, { cacheBust: true });

      // Create and trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `drone-meme-of-the-day-${meme.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download meme:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="overflow-hidden shadow-lg animate-pulse bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-0">
            <div className="h-10 w-full bg-purple-200/80 dark:bg-purple-700/80 animate-pulse"></div>
            <div className="h-64 md:h-96 w-full bg-gray-200/80 dark:bg-gray-700/80"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200/80 dark:bg-gray-700/80 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200/80 dark:bg-gray-700/80 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200/80 dark:bg-gray-700/80 rounded w-full mt-4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meme || !template) {
    return (
      <div className="text-center py-8">
        <p className="text-xl text-gray-500">No meme of the day available</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto transform hover:-translate-y-1 transition-transform duration-300">
      <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-200/50">
        <CardContent className="p-0">
          {/* Drone joke banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/background-pattern.svg')] opacity-10"></div>
            <p className="font-bold text-lg italic relative z-10">&quot;{meme.joke}&quot;</p>
          </div>

          <div ref={memeRef} className="relative h-64 md:h-96 w-full">
            <Image
              src={meme.imagePath}
              alt={meme.title}
              className="object-contain"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Render text on the meme */}
            {meme.texts.map((textItem) => {
              const textArea = template.textAreas.find((area) => area.id === textItem.id);
              if (!textArea) return null;

              return (
                <div
                  key={textItem.id}
                  className="absolute text-center"
                  style={{
                    left: `${((textArea.x - textArea.width / 2) / template.width) * 100}%`,
                    top: `${((textArea.y - textArea.height / 2) / template.height) * 100}%`,
                    width: `${(textArea.width / template.width) * 100}%`,
                    height: `${(textArea.height / template.height) * 100}%`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      textArea.align === 'left'
                        ? 'flex-start'
                        : textArea.align === 'right'
                          ? 'flex-end'
                          : 'center',
                    textAlign: textArea.align,
                  }}
                >
                  <p
                    className="w-full uppercase"
                    style={{
                      fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                      fontSize: 'clamp(16px, 4vw, 32px)',
                      lineHeight: '1.2',
                      color: 'white',
                      textShadow:
                        '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000',
                      pointerEvents: 'none',
                    }}
                  >
                    {textItem.text}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="p-6 bg-gradient-to-b from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-900/30">
            <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
              {meme.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Created by {meme.creator} • {meme.date}
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant="outline"
                className={`flex items-center gap-2 ${liked ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300' : 'border-purple-300'}`}
                onClick={handleLike}
              >
                <HiThumbUp className={liked ? 'text-blue-600' : ''} />
                <span>{likeCount}</span>
              </Button>

              <Button
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                onClick={handleDownload}
              >
                <HiDownload />
                <span>Download Meme</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
