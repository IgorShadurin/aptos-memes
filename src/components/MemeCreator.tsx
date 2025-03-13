'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface TextArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align: 'left' | 'center' | 'right';
  defaultText: string;
}

interface MemeTemplate {
  id: string;
  name: string;
  path: string;
  width: number;
  height: number;
  phrases: {
    description: string;
    characters: {
      name: string;
      description: string;
    }[];
  };
  textAreas: TextArea[];
}

interface TextInput {
  id: string;
  text: string;
  position?: { x: number; y: number };
}

interface DragState {
  isDragging: boolean;
  textId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * MemeCreator component for creating and saving memes with variable text positions
 */
export default function MemeCreator() {
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [textInputs, setTextInputs] = useState<TextInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    textId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  // Use a ref to immediately track the active drag state without waiting for React state updates
  const activeDragRef = useRef<DragState | null>(null);
  const memeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/meme-templates/templates.json');
        const data = await response.json();
        setTemplates(data);

        // Get template ID from URL parameters
        const templateId = searchParams.get('template');

        if (templateId && data.length > 0) {
          // Find the template that matches the ID from URL
          const selectedTemplate = data.find(
            (template: MemeTemplate) => template.id === templateId
          );

          if (selectedTemplate) {
            // Set the selected template and initialize text inputs
            setSelectedTemplate(selectedTemplate);
            initializeTextInputs(selectedTemplate);
            return;
          }
        }

        // Default to first template if no template ID is provided or if the template ID is invalid
        if (data.length > 0) {
          setSelectedTemplate(data[0]);
          initializeTextInputs(data[0]);
        }
      } catch (error) {
        console.error('Failed to load meme templates:', error);
      }
    };

    loadTemplates();
  }, [searchParams]);

  /**
   * Initializes text inputs based on the selected template
   * @param template - The selected template
   */
  const initializeTextInputs = (template: MemeTemplate) => {
    if (!template) return;

    const newTextInputs = template.textAreas.map((area) => ({
      id: area.id,
      text: area.defaultText || '',
      position: { x: area.x, y: area.y },
    }));

    setTextInputs(newTextInputs);
  };

  /**
   * Handles template selection change
   * @param e - Change event
   */
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id === templateId) || null;
    setSelectedTemplate(template);

    if (template) {
      initializeTextInputs(template);
    }
  };

  /**
   * Updates text input for a specific text area
   * @param id - Text area ID
   * @param text - New text value
   */
  const updateTextInput = (id: string, text: string) => {
    setTextInputs((prevInputs) =>
      prevInputs.map((input) => (input.id === id ? { ...input, text } : input))
    );
  };

  /**
   * Handles the start of dragging a text element
   * @param e - Mouse event
   * @param textId - ID of the text being dragged
   */
  const handleDragStart = (e: React.MouseEvent, textId: string) => {
    e.preventDefault(); // Prevent text selection during drag
    if (!containerRef.current || !selectedTemplate) return;

    // Find the text input being dragged
    const textInput = textInputs.find((input) => input.id === textId);
    if (!textInput || !textInput.position) return;

    // Get corresponding text area
    const textArea = selectedTemplate.textAreas.find((area) => area.id === textId);
    if (!textArea) return;

    // Get container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();

    // Get scaling factor for responsive sizing
    const scaleX = containerRect.width / selectedTemplate.width;
    const scaleY = containerRect.height / selectedTemplate.height;

    // Calculate the click position relative to the container
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;

    // Calculate the text position in pixels, accounting for scaling
    const textX = textInput.position.x * scaleX;
    const textY = textInput.position.y * scaleY;

    // Create the new drag state
    const newDragState = {
      isDragging: true,
      textId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: textX - clickX,
      offsetY: textY - clickY,
    };

    // Store the drag state in the ref for immediate access
    activeDragRef.current = newDragState;

    // Update the React state for UI updates
    setDragState(newDragState);

    // Add event listeners for drag and end
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };

  /**
   * Handles dragging movement of a text element for touch devices
   * @param e - Touch event
   */
  const handleTouchMove = (e: TouchEvent) => {
    if (!activeDragRef.current || !e.touches[0]) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  /**
   * Handles dragging movement of a text element
   * @param e - Mouse event
   */
  const handleDragMove = (e: MouseEvent) => {
    if (!activeDragRef.current) return;
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  /**
   * Common handler for both mouse and touch movement
   * @param clientX - Client X coordinate
   * @param clientY - Client Y coordinate
   */
  const handleMove = (clientX: number, clientY: number) => {
    // Use the ref for immediate access to current drag state
    const currentDrag = activeDragRef.current;
    if (!containerRef.current || !selectedTemplate || !currentDrag || !currentDrag.textId) return;

    // Get container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();

    // Get scaling factor for responsive sizing
    const scaleX = selectedTemplate.width / containerRect.width;
    const scaleY = selectedTemplate.height / containerRect.height;

    // Calculate position relative to container
    const relativeX = clientX - containerRect.left + currentDrag.offsetX;
    const relativeY = clientY - containerRect.top + currentDrag.offsetY;

    // Convert to template coordinates, accounting for the scaling
    const templateX = relativeX * scaleX;
    const templateY = relativeY * scaleY;

    // Clamp values to prevent text from moving off-screen
    const clampedX = Math.max(50, Math.min(templateX, selectedTemplate.width - 50));
    const clampedY = Math.max(50, Math.min(templateY, selectedTemplate.height - 50));

    // Update the text positions
    setTextInputs((prev) =>
      prev.map((input) => {
        if (input.id === currentDrag.textId) {
          return {
            ...input,
            position: {
              x: clampedX,
              y: clampedY,
            },
          };
        }
        return input;
      })
    );
  };

  /**
   * Handles the end of dragging a text element
   */
  const handleDragEnd = () => {
    if (!activeDragRef.current) return;

    // Reset the active drag ref
    activeDragRef.current = null;

    setDragState({
      isDragging: false,
      textId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    });

    // Remove event listeners
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleDragEnd);
  };

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  /**
   * Generate AI text for the meme based on template information
   */
  const generateAiText = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      // Extract information about the selected template to send to the server
      const templateInfo = {
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        phrases: selectedTemplate.phrases,
      };

      // Send a POST request with template information
      const response = await fetch('/api/generate-meme-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateInfo),
      });

      const data = await response.json();

      // Distribute AI generated text across text areas
      const newTextInputs = [...textInputs];

      if (newTextInputs.length === 1) {
        // If there's only one text area, combine both texts
        newTextInputs[0].text = `${data.topText} ${data.bottomText}`;
      } else if (newTextInputs.length === 2) {
        // If there are exactly two text areas
        newTextInputs[0].text = data.topText;
        newTextInputs[1].text = data.bottomText;
      } else if (newTextInputs.length > 2) {
        // If there are more than two text areas
        newTextInputs[0].text = data.topText;
        newTextInputs[1].text = data.bottomText;

        // Distribute additional texts if available
        if (data.additionalTexts && data.additionalTexts.length > 0) {
          for (let i = 2; i < newTextInputs.length && i - 2 < data.additionalTexts.length; i++) {
            newTextInputs[i].text = data.additionalTexts[i - 2];
          }
        }
      }

      setTextInputs(newTextInputs);
    } catch (error) {
      console.error('Failed to generate AI text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resets text positions to their default values
   */
  const resetPositions = () => {
    if (!selectedTemplate) return;

    setTextInputs((prev) =>
      prev.map((input) => {
        const textArea = selectedTemplate.textAreas.find((area) => area.id === input.id);
        if (!textArea) return input;

        return {
          ...input,
          position: { x: textArea.x, y: textArea.y },
        };
      })
    );
  };

  /**
   * Saves the meme as a PNG image
   */
  const saveMeme = async () => {
    if (!memeRef.current || !selectedTemplate) return;

    try {
      const dataUrl = await toPng(memeRef.current, { cacheBust: true });

      // Sanitize the template name for use as a filename
      // Replace spaces with hyphens and remove special characters
      const sanitizedName = selectedTemplate.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .trim();

      // Create a unique filename using the template name
      const filename = `meme-${sanitizedName}-${Date.now()}.png`;

      // Create and trigger download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      // Show success message
      setSaveSuccess(`Meme saved as "${filename}"`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to save meme:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-3xl mx-auto bg-transparent shadow-lg">
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

            {selectedTemplate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {textInputs.map((input) => {
                  const textArea = selectedTemplate.textAreas.find((area) => area.id === input.id);
                  return (
                    <div key={input.id}>
                      <label
                        htmlFor={`text-${input.id}`}
                        className="block text-sm font-medium mb-1"
                      >
                        {input.id.charAt(0).toUpperCase() + input.id.slice(1)} Text
                      </label>
                      <Input
                        id={`text-${input.id}`}
                        value={input.text}
                        onChange={(e) => updateTextInput(input.id, e.target.value)}
                        placeholder={`Enter ${input.id} text`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {selectedTemplate && (
              <>
                <div className="mt-6 mb-4 flex flex-wrap justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={generateAiText}
                      disabled={isLoading || !selectedTemplate}
                    >
                      {isLoading ? 'Generating...' : '🪄 Generate with AI'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={resetPositions}
                      disabled={!selectedTemplate}
                    >
                      🔄 Reset Positions
                    </Button>
                  </div>
                  <Button onClick={saveMeme} disabled={!selectedTemplate}>
                    💾 Download
                  </Button>
                </div>

                <div className="mt-2 flex justify-center">
                  <div
                    ref={containerRef}
                    className="relative inline-block"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`,
                    }}
                  >
                    <div ref={memeRef} className="relative w-full h-full">
                      <Image
                        src={selectedTemplate.path}
                        alt={selectedTemplate.name}
                        className="object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                      />

                      {textInputs.map((input) => {
                        const textArea = selectedTemplate.textAreas.find(
                          (area) => area.id === input.id
                        );
                        if (!textArea) return null;

                        // Use the custom position if available, otherwise use the default
                        const x = input.position?.x ?? textArea.x;
                        const y = input.position?.y ?? textArea.y;

                        return (
                          <div
                            key={input.id}
                            className="absolute text-center cursor-move"
                            onMouseDown={(e) => handleDragStart(e, input.id)}
                            onTouchStart={(e) => {
                              if (!e.touches[0]) return;
                              e.preventDefault(); // Prevent default touch behavior

                              const touch = e.touches[0];
                              // Create a synthetic mouse event to reuse the same handler
                              const mouseEvent = {
                                clientX: touch.clientX,
                                clientY: touch.clientY,
                                preventDefault: () => {},
                              } as React.MouseEvent;

                              // Immediately handle drag start
                              handleDragStart(mouseEvent, input.id);
                            }}
                            style={{
                              left: `${((x - textArea.width / 2) / selectedTemplate.width) * 100}%`,
                              top: `${((y - textArea.height / 2) / selectedTemplate.height) * 100}%`,
                              width: `${(textArea.width / selectedTemplate.width) * 100}%`,
                              height: 'auto',
                              minHeight: `${(textArea.height / selectedTemplate.height) * 100}%`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent:
                                textArea.align === 'left'
                                  ? 'flex-start'
                                  : textArea.align === 'right'
                                    ? 'flex-end'
                                    : 'center',
                              textAlign: textArea.align,
                              transition: 'none',
                              touchAction: 'none',
                              border:
                                dragState.isDragging && dragState.textId === input.id
                                  ? '2px dashed #39f'
                                  : 'none',
                              borderRadius: '4px',
                              padding: '4px',
                              backgroundColor:
                                dragState.isDragging && dragState.textId === input.id
                                  ? 'rgba(51, 153, 255, 0.1)'
                                  : 'transparent',
                              maxWidth: '90%',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                          >
                            <p
                              className="w-full uppercase"
                              style={{
                                fontFamily:
                                  'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                                fontSize: 'clamp(12px, 3.5vw, 32px)',
                                lineHeight: '1.2',
                                color: 'white',
                                textShadow:
                                  '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000',
                                pointerEvents: 'none',
                                wordBreak: 'break-word',
                                padding: '2px 4px',
                              }}
                            >
                              {input.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success notification */}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{saveSuccess}</span>
          </div>
        </div>
      )}
    </div>
  );
}
