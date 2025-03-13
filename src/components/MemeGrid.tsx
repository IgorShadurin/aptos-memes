'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiDownload } from 'react-icons/hi';
import { Alert } from '@/components/ui/alert';

interface MemeText {
  id: string;
  text: string;
}

interface FilledMeme {
  id: string;
  name: string;
  templateId: string;
  path: string;
  texts: MemeText[];
}

interface Template {
  id: string;
  name: string;
  path: string;
  width: number;
  height: number;
  textAreas: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    align: 'left' | 'center' | 'right';
    defaultText: string;
  }[];
}

/**
 * Grid of popular memes to display on the home page
 * Features hover animations, colorful design, and displays pre-filled memes with text
 */
export default function MemeGrid() {
  const [memes, setMemes] = useState<FilledMeme[]>([]);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const memeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Helper function to wrap text based on rough character count
  const smartTextWrap = (text: string, charsPerLine: number, isLegacyMeme: boolean): string[] => {
    // Special cases with common words that should be kept together
    const specialPhrases = [
      'MULTIPLE',
      'FRAMEWORK',
      'FRAMEWORKS',
      'JAVASCRIPT',
      'TYPESCRIPT',
      'PROGRAMMING',
      'DEVELOPER',
      'DEVELOPMENT',
    ];

    // Legacy memes often had shorter lines
    const adjustedCharsPerLine = isLegacyMeme ? charsPerLine * 0.85 : charsPerLine;

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check if it's a special phrase that shouldn't be broken up
      const isSpecialPhrase = specialPhrases.some((phrase) => word.includes(phrase));

      // If adding this word would exceed the line length and it's not a special phrase
      if (
        currentLine.length + word.length > adjustedCharsPerLine &&
        currentLine.length > 0 &&
        !isSpecialPhrase
      ) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine.length === 0 ? '' : ' ') + word;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.trim());
    }

    return lines;
  };

  // Load memes and templates from the JSON files
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load templates
        const templatesResponse = await fetch('/meme-templates/templates.json');
        const templatesData = await templatesResponse.json();

        // Convert templates to a map for easy lookup
        const templatesMap: Record<string, Template> = {};
        templatesData.forEach((template: Template) => {
          templatesMap[template.id] = template;
        });

        setTemplates(templatesMap);

        // Load filled memes
        const memesResponse = await fetch('/meme-templates/filled-memes.json');
        const memesData = await memesResponse.json();

        setMemes(memesData);
      } catch (error) {
        console.error('Failed to load memes or templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Handles downloading a meme with the text rendered on it
   * Creates a temporary container with correct aspect ratio to ensure the full image is captured
   * @param memeId - ID of the meme to download
   * @param name - Name of the meme for the filename
   */
  const handleDownload = async (memeId: string, name: string) => {
    const meme = memes.find((m) => m.id === memeId);
    if (!meme) return;

    const template = templates[meme.templateId];
    if (!template) return;

    try {
      // Use a higher resolution canvas for better quality output
      // Apply pixel density multiplier for better quality
      const pixelDensity = 2; // Higher value = better quality but larger file size

      // Create a canvas element with the exact dimensions of the template, multiplied by pixel density
      const canvas = document.createElement('canvas');
      canvas.width = template.width * pixelDensity;
      canvas.height = template.height * pixelDensity;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }

      // Scale the context to match the pixel density for higher quality rendering
      ctx.scale(pixelDensity, pixelDensity);

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Create a new image to load the template
      // Use the global window.Image constructor to avoid conflict with the Next.js Image component
      const img = new window.Image();
      img.crossOrigin = 'anonymous'; // Handle CORS if needed

      // Wait for the image to load before proceeding
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => {
          console.error('Failed to load image:', meme.path);
          reject(new Error(`Failed to load image: ${meme.path}`));
        };

        // Use the absolute URL to ensure the image loads correctly
        // Remove the leading slash if it exists to avoid double slashes
        const path = meme.path.startsWith('/') ? meme.path.substring(1) : meme.path;
        const baseUrl = window.location.origin;
        img.src = `${baseUrl}/${path}`;
      });

      // Draw the image on the canvas with correct proportions
      // First clear the canvas
      ctx.clearRect(0, 0, template.width, template.height);

      // Draw the image maintaining aspect ratio
      // Calculate aspect ratio to ensure proper fit
      const imgAspectRatio = img.width / img.height;
      const templateAspectRatio = template.width / template.height;

      let drawWidth = template.width;
      let drawHeight = template.height;

      // Ensure the image fills the canvas completely while maintaining aspect ratio
      if (imgAspectRatio > templateAspectRatio) {
        // Image is wider than template proportionally
        drawHeight = template.width / imgAspectRatio;
        // Center vertically
        const yOffset = (template.height - drawHeight) / 2;
        ctx.drawImage(img, 0, yOffset, template.width, drawHeight);
      } else {
        // Image is taller than template proportionally
        drawWidth = template.height * imgAspectRatio;
        // Center horizontally
        const xOffset = (template.width - drawWidth) / 2;
        ctx.drawImage(img, xOffset, 0, drawWidth, template.height);
      }

      // Special case handling for "Legacy Code Victory" meme - adjust if needed
      const isLegacyCodeMeme = meme.name === 'Legacy Code Victory';

      // Draw each text element
      for (const textItem of meme.texts) {
        const textArea = template.textAreas.find((area) => area.id === textItem.id);
        if (!textArea) continue;

        // Text needs to be uppercased
        const text = textItem.text.toUpperCase();

        // Calculate the maximum width available for the text
        // Use a slightly higher value for the Legacy Code meme to prevent unwanted wrapping
        const maxTextWidth = isLegacyCodeMeme
          ? textArea.width * 0.95 // Give more space for this specific meme
          : textArea.width * 0.9; // Standard margin for other memes

        // Adjust base font size based on template type and dimensions
        const baseFontSize = isLegacyCodeMeme
          ? Math.min(template.width * 0.075, 44) // Slightly larger for legacy code meme
          : Math.min(template.width * 0.065, 40); // Standard size for other memes

        // Ensure text fits within boundaries by adjusting font size if needed
        let fontSize = baseFontSize;
        let lines = [text];

        // Determine if text should be wrapped based on length and meme type
        const wrapThreshold = isLegacyCodeMeme ? 25 : 20;

        // Check if text is too long - if so, try to wrap it first
        if (text.length > wrapThreshold) {
          // Try to split into lines at logical breaks
          const charsPerLine = textArea.width / (isLegacyCodeMeme ? 10 : 13); // Adjust per meme
          lines = smartTextWrap(text, charsPerLine, isLegacyCodeMeme);
        }

        // Configure text style with improved quality settings
        ctx.font = `bold ${fontSize}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`;

        // Measure text to ensure it fits within boundaries
        let textWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);

        // If text is still too wide, reduce font size to fit
        if (textWidth > maxTextWidth) {
          // Calculate scaling factor to fit text
          const scaleFactor = maxTextWidth / textWidth;
          fontSize = Math.max(20, Math.floor(fontSize * scaleFactor)); // Increased min font size
          ctx.font = `bold ${fontSize}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`;

          // Re-measure with new font size
          textWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
        }

        ctx.textAlign = textArea.align;
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round'; // Smoother corners for text
        ctx.miterLimit = 2; // Helps with sharp corners

        // Calculate line height based on font size
        const lineHeight = fontSize * (isLegacyCodeMeme ? 1.2 : 1.1); // More space for Legacy Code meme

        // Calculate total text height
        const totalTextHeight = lineHeight * lines.length;

        // Position calculation - ensure text is centered vertically in its area
        let startY = textArea.y - totalTextHeight / 2 + lineHeight / 2;
        if (lines.length === 1) {
          startY = textArea.y; // Center single line
        }

        // Adjust positioning for Legacy Code Victory meme specifically if needed
        if (isLegacyCodeMeme) {
          startY = textArea.y - totalTextHeight / 2 + lineHeight / 2 - 10; // Shift text up by 10px
        }

        // Create multiple strokes for a better outline
        // Slightly thicker for better visibility
        const strokeWidth = Math.max(4, Math.round(fontSize * 0.12));
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = 'black';

        // Draw each line of text
        lines.forEach((line, lineIndex) => {
          const lineY = startY + lineIndex * lineHeight;

          // Position calculation for X coordinate
          const x =
            textArea.align === 'left'
              ? textArea.x - textArea.width / 2 + 8 // Increased padding for left-aligned text
              : textArea.align === 'right'
                ? textArea.x + textArea.width / 2 - 8 // Increased padding for right-aligned text
                : textArea.x;

          // Apply multiple strokes for a thicker outline
          const shadowOffset = Math.max(1.5, Math.floor(strokeWidth / 3));

          // Draw outlines first - use more positions for a better, thicker outline
          [
            [x - shadowOffset, lineY - shadowOffset], // top-left
            [x + shadowOffset, lineY - shadowOffset], // top-right
            [x - shadowOffset, lineY + shadowOffset], // bottom-left
            [x + shadowOffset, lineY + shadowOffset], // bottom-right
            [x, lineY - shadowOffset], // top
            [x, lineY + shadowOffset], // bottom
            [x - shadowOffset, lineY], // left
            [x + shadowOffset, lineY], // right
            [x, lineY], // center
          ].forEach(([offsetX, offsetY]) => {
            ctx.strokeText(line, offsetX, offsetY);
          });

          // Then fill with white for the text itself
          ctx.fillStyle = 'white';
          ctx.fillText(line, x, lineY);
        });
      }

      // Convert to data URL and trigger download with high quality
      const dataUrl = canvas.toDataURL('image/png', 1.0); // Maximum quality
      const sanitizedName = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .trim();
      const filename = `meme-${sanitizedName}-${Date.now().toString().slice(-4)}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download meme:', error);
    }
  };

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

  /**
   * Callback ref for setting meme element references
   * @param id - ID of the meme
   * @param el - DOM element reference
   */
  const setMemeRef = (id: string, el: HTMLDivElement | null) => {
    memeRefs.current[id] = el;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {isLoading
          ? // Loading skeleton
            Array(6)
              .fill(0)
              .map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-0">
                    <div className="h-64 w-full bg-gray-200/50 dark:bg-gray-800/50 animate-pulse"></div>
                    <div className="p-3">
                      <div className="h-5 w-3/4 bg-gray-200/50 dark:bg-gray-800/50 animate-pulse mb-2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
          : memes.map((meme, index) => {
              const template = templates[meme.templateId];
              if (!template) return null;

              return (
                <Card
                  key={meme.id}
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
                    <div
                      className="relative h-64 md:h-72 w-full overflow-hidden"
                      ref={(el) => setMemeRef(meme.id, el)}
                    >
                      <Image
                        src={meme.path}
                        alt={meme.name}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
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
                                fontFamily:
                                  'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                                fontSize: 'clamp(10px, 2.5vw, 18px)',
                                lineHeight: '1.2',
                                color: 'white',
                                textShadow:
                                  '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000',
                                pointerEvents: 'none',
                              }}
                            >
                              {textItem.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="relative p-5 text-white">
                      <h3 className="font-bold text-xl truncate mb-2">{meme.name}</h3>
                      <div className="flex flex-wrap mt-3 gap-2 justify-center">
                        <Link href={`/meme-creator?template=${meme.templateId}`}>
                          <Button
                            size="sm"
                            className="bg-white text-gray-800 hover:bg-yellow-300 hover:text-purple-800 font-medium transition-colors shadow-md text-sm md:text-base"
                            title="Create your own version of this meme"
                          >
                            ✨ Create Similar
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-800 hover:bg-green-600 hover:text-white border border-green-500 bg-white/90 font-medium transition-colors shadow-md text-sm md:text-base"
                          onClick={() => {
                            setShowAlert(true);
                          }}
                          title="Mint this meme as an NFT"
                        >
                          🖼️ Mint
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/30 border border-white/80 text-sm md:text-base"
                          onClick={() => handleDownload(meme.id, meme.name)}
                          title="Download this meme"
                        >
                          <HiDownload />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
      <div className="flex justify-center mt-16">
        <Link href="/meme-creator">
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-10 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105 text-xl"
          >
            🚀 Create Meme
          </Button>
        </Link>
      </div>

      {/* Use the new Alert component */}
      <Alert
        title="Coming Soon"
        message="Minting will be available in the next version"
        show={showAlert}
        onClose={() => setShowAlert(false)}
        autoCloseDuration={3000}
      />
    </div>
  );
}
