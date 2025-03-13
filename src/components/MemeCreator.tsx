'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
 * Interface for QR code style with background and foreground colors
 */
interface QRCodeStyle {
  id: string;
  name: string;
  bgColor: string;
  fgColor: string;
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
  // Sponsor QR code state
  const [addSponsorQR, setAddSponsorQR] = useState(false);
  const [sponsorUrl, setSponsorUrl] = useState('https://aptosfoundation.org/');
  const [sponsorLogo, setSponsorLogo] = useState('/sponsors/aptos.png');
  const [_customSponsorImage, setCustomSponsorImage] = useState<File | null>(null);
  const [customSponsorImageURL, setCustomSponsorImageURL] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [qrCodeStyle, setQrCodeStyle] = useState<string>('vibrant-orange');

  // QR code style options
  const qrCodeStyles: QRCodeStyle[] = [
    { id: 'classic', name: 'Classic (Black)', bgColor: '#FFFFFF', fgColor: '#000000' },
    { id: 'vibrant-orange', name: 'Vibrant Orange', bgColor: '#FFFFFF', fgColor: '#FF5733' },
    { id: 'neon-green', name: 'Neon Green', bgColor: '#000000', fgColor: '#39FF14' },
    { id: 'cool-blue', name: 'Cool Blue', bgColor: '#FFFFFF', fgColor: '#0066FF' },
    { id: 'pink-pop', name: 'Pink Pop', bgColor: '#FFFFFF', fgColor: '#FF69B4' },
    { id: 'meme-gold', name: 'Meme Gold', bgColor: '#000000', fgColor: '#FFD700' },
  ];

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
   * Handles the actual movement calculations for dragging text
   * @param clientX - X position of cursor or touch
   * @param clientY - Y position of cursor or touch
   */
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState.isDragging || !dragState.textId || !selectedTemplate) return;

      // Get the canvas bounding rect
      const canvasRect = containerRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      // Calculate new position
      const scale = canvasRect.width / selectedTemplate.width;
      const newX = (clientX - canvasRect.left) / scale;
      const newY = (clientY - canvasRect.top) / scale;

      // Calculate the offset from the initial position
      const offsetX = newX - dragState.startX;
      const offsetY = newY - dragState.startY;

      // Update the text input position
      setTextInputs((prev) =>
        prev.map((input) => {
          if (input.id === dragState.textId) {
            // Calculate the updated position
            const currentPos = input.position || { x: 0, y: 0 };
            return {
              ...input,
              position: {
                x: currentPos.x + offsetX,
                y: currentPos.y + offsetY,
              },
            };
          }
          return input;
        })
      );

      // Update the drag start position to the current position for the next move
      setDragState({
        ...dragState,
        startX: newX,
        startY: newY,
      });
    },
    [dragState, selectedTemplate]
  );

  /**
   * Handles touch move events for dragging text
   * @param e - Touch event
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (dragState.isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    },
    [dragState.isDragging, handleMove]
  );

  /**
   * Handles mouse move events for dragging text
   * @param e - Mouse event
   */
  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (dragState.isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    },
    [dragState.isDragging, handleMove]
  );

  /**
   * Handles the end of drag operations (mouse up or touch end)
   */
  const handleDragEnd = useCallback(() => {
    setDragState({
      ...dragState,
      isDragging: false,
      textId: null,
    });
  }, [dragState]);

  // Add drag event listeners to the document
  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd, handleTouchMove]);

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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      setSaveSuccess(`Meme saved as "${filename}"`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to save meme:', error);
      alert(`Failed to save meme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Encodes a string to base64 for URL use
   * @param str - String to encode
   * @returns Base64 encoded string
   */
  const encodeToBase64 = (str: string): string => {
    try {
      return window.btoa(encodeURIComponent(str));
    } catch (error) {
      console.error('Error encoding string to base64:', error);
      return '';
    }
  };

  /**
   * Validates the sponsor URL
   * @param url - URL to validate
   * @returns Boolean indicating if the URL is valid
   */
  const validateUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;

    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Handles changes to the sponsor URL input
   * @param e - Change event
   */
  const handleSponsorUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setSponsorUrl(url);

    if (url && !validateUrl(url)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError(null);
    }
  };

  /**
   * Gets the encoded URL for the QR code
   * @returns Encoded URL for the QR code
   */
  const getEncodedQrUrl = (): string => {
    if (!sponsorUrl) return '';

    const encodedUrl = encodeToBase64(sponsorUrl);
    return `${window.location.origin}/sponsored-meme?url=${encodedUrl}`;
  };

  /**
   * Gets the selected QR code style
   * @returns Selected QR code style object
   */
  const getSelectedQRStyle = (): QRCodeStyle => {
    return qrCodeStyles.find((style) => style.id === qrCodeStyle) || qrCodeStyles[0];
  };

  /**
   * Handles custom sponsor image upload
   * @param e - Change event from file input
   */
  const handleCustomSponsorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUrlError('Please upload an image file');
        return;
      }

      // Create object URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setCustomSponsorImage(file);
      setCustomSponsorImageURL(imageUrl);
      setSponsorLogo('custom'); // Set a special value to indicate custom image
    }
  };

  /**
   * Resets custom sponsor image
   */
  const resetCustomSponsorImage = () => {
    if (customSponsorImageURL) {
      URL.revokeObjectURL(customSponsorImageURL);
    }
    // Clear the custom image file reference
    if (_customSponsorImage) {
      console.log('Clearing custom sponsor image:', _customSponsorImage.name);
    }
    setCustomSponsorImage(null);
    setCustomSponsorImageURL(null);
    setSponsorLogo('/sponsors/aptos.png');
  };

  /**
   * Gets the sponsor logo source depending on whether it's a predefined or custom logo
   * @returns URL of the sponsor logo to display
   */
  const getSponsorLogoSrc = (): string => {
    // Ensure we're returning a valid URL to avoid image loading issues
    if (sponsorLogo === 'custom' && customSponsorImageURL) {
      return customSponsorImageURL;
    }
    return sponsorLogo === 'custom' ? '/sponsors/aptos.png' : sponsorLogo;
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
                  const _textArea = selectedTemplate.textAreas.find((area) => area.id === input.id);
                  const labelText = _textArea
                    ? `${_textArea.id.charAt(0).toUpperCase() + _textArea.id.slice(1)} Text`
                    : `${input.id.charAt(0).toUpperCase() + input.id.slice(1)} Text`;

                  return (
                    <div key={input.id}>
                      <label
                        htmlFor={`text-${input.id}`}
                        className="block text-sm font-medium mb-1"
                      >
                        {labelText}
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

            {/* Sponsor QR Code Section */}
            {selectedTemplate && (
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="addSponsorQR"
                    checked={addSponsorQR}
                    onChange={(e) => setAddSponsorQR(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="addSponsorQR" className="text-sm font-medium">
                    Add Sponsor QR
                  </label>
                </div>

                {addSponsorQR && (
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 space-y-3">
                    <div>
                      <label htmlFor="sponsorLogo" className="block text-sm font-medium mb-1">
                        Sponsor Logo
                      </label>
                      <div className="flex flex-col space-y-2">
                        <Select
                          id="sponsorLogo"
                          value={sponsorLogo}
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              resetCustomSponsorImage();
                            }
                            setSponsorLogo(e.target.value);
                          }}
                          className="w-full"
                        >
                          <option value="/sponsors/aptos.png">Aptos</option>
                          {customSponsorImageURL && <option value="custom">Custom</option>}
                          <option value="custom">Upload Custom...</option>
                          {/* Add more logo options here as needed */}
                        </Select>

                        {sponsorLogo === 'custom' && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <Input
                                type="file"
                                id="customSponsorImage"
                                onChange={handleCustomSponsorImageUpload}
                                accept="image/*"
                                className="max-w-xs"
                              />
                              {customSponsorImageURL && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={resetCustomSponsorImage}
                                  className="ml-2"
                                >
                                  Reset
                                </Button>
                              )}
                            </div>
                            {customSponsorImageURL && (
                              <div className="relative w-16 h-16 border rounded overflow-hidden mt-2">
                                <Image
                                  src={customSponsorImageURL}
                                  alt="Custom sponsor"
                                  className="object-contain"
                                  fill
                                  crossOrigin="anonymous"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="sponsorUrl" className="block text-sm font-medium mb-1">
                        Sponsor URL
                      </label>
                      <Input
                        id="sponsorUrl"
                        value={sponsorUrl}
                        onChange={handleSponsorUrlChange}
                        placeholder="https://example.com"
                        className={urlError ? 'border-red-500' : ''}
                      />
                      {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
                    </div>

                    <div>
                      <label htmlFor="qrCodeStyle" className="block text-sm font-medium mb-1">
                        QR Code Style
                      </label>
                      <Select
                        id="qrCodeStyle"
                        value={qrCodeStyle}
                        onChange={(e) => setQrCodeStyle(e.target.value)}
                      >
                        {qrCodeStyles.map((style) => (
                          <option key={style.id} value={style.id}>
                            {style.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {sponsorUrl && !urlError && (
                      <div className="flex justify-center mt-2">
                        <div
                          className="p-2 rounded-md"
                          style={{ backgroundColor: getSelectedQRStyle().bgColor }}
                        >
                          <QRCodeSVG
                            value={getEncodedQrUrl()}
                            size={120}
                            level="H"
                            style={{ width: '100%', height: '100%' }}
                            imageSettings={{
                              src: getSponsorLogoSrc(),
                              x: undefined,
                              y: undefined,
                              height: 48,
                              width: 48,
                              excavate: true,
                            }}
                            bgColor={getSelectedQRStyle().bgColor}
                            fgColor={getSelectedQRStyle().fgColor}
                            className="rounded-md QRCode"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                        crossOrigin="anonymous"
                      />

                      {textInputs.map((input) => {
                        const _textArea = selectedTemplate.textAreas.find(
                          (area) => area.id === input.id
                        );
                        if (!_textArea) return null;

                        // Use the custom position if available, otherwise use the default
                        const x = input.position?.x ?? _textArea.x;
                        const y = input.position?.y ?? _textArea.y;

                        return (
                          <div
                            key={input.id}
                            className="absolute text-center cursor-move"
                            role="button"
                            tabIndex={0}
                            aria-label={`Drag ${input.id} text`}
                            onMouseDown={(e) => handleDragStart(e, input.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                // Simulate a mouse event for keyboard accessibility
                                const mouseEvent = {
                                  clientX: 0,
                                  clientY: 0,
                                  preventDefault: () => {},
                                } as React.MouseEvent;
                                handleDragStart(mouseEvent, input.id);
                              }
                            }}
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
                              left: `${((x - _textArea.width / 2) / selectedTemplate.width) * 100}%`,
                              top: `${((y - _textArea.height / 2) / selectedTemplate.height) * 100}%`,
                              width: `${(_textArea.width / selectedTemplate.width) * 100}%`,
                              height: 'auto',
                              minHeight: `${(_textArea.height / selectedTemplate.height) * 100}%`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent:
                                _textArea.align === 'left'
                                  ? 'flex-start'
                                  : _textArea.align === 'right'
                                    ? 'flex-end'
                                    : 'center',
                              textAlign: _textArea.align,
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

                      {/* QR Code on the meme */}
                      {addSponsorQR && sponsorUrl && !urlError && (
                        <div
                          className="absolute bottom-4 right-8 p-1 rounded-md shadow-md"
                          style={{
                            width: '15%',
                            height: 'auto',
                            aspectRatio: '1 / 1',
                            backgroundColor: getSelectedQRStyle().bgColor,
                          }}
                        >
                          <QRCodeSVG
                            value={getEncodedQrUrl()}
                            size={100}
                            level="H"
                            style={{ width: '100%', height: '100%' }}
                            imageSettings={{
                              src: getSponsorLogoSrc(),
                              x: undefined,
                              y: undefined,
                              height: 40,
                              width: 40,
                              excavate: true,
                            }}
                            bgColor={getSelectedQRStyle().bgColor}
                            fgColor={getSelectedQRStyle().fgColor}
                            className="rounded-md QRCode"
                          />
                        </div>
                      )}
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
