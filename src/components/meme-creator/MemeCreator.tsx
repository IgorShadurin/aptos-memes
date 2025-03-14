'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemeTemplate, TextInput, DragState, QRCodeStyle } from './types';
import { initializeTextInputs, resetTextPositions } from './utils';
import TextInputFields from './TextInputFields';
import QRCodeSection from './QRCodeSection';
import MemeCanvas from './MemeCanvas';
import { NewsModal } from './NewsModal';

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
  const [newsModalOpen, setNewsModalOpen] = useState(false);

  // Advanced options toggler state - hidden by default
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Sponsor QR code state
  const [addSponsorQR, setAddSponsorQR] = useState(false);
  const [sponsorUrl, setSponsorUrl] = useState('https://aptosfoundation.org/');
  const [sponsorLogo, setSponsorLogo] = useState('/sponsors/aptos.png');
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

  /**
   * Common handler for both mouse and touch movement
   * @param clientX - Client X coordinate
   * @param clientY - Client Y coordinate
   */
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
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
    },
    [selectedTemplate]
  );

  /**
   * Handles dragging movement of a text element for touch devices
   * @param e - Touch event
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!activeDragRef.current || !e.touches[0]) return;
      e.preventDefault(); // Prevent scrolling while dragging
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  /**
   * Handles dragging movement of a text element
   * @param e - Mouse event
   */
  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!activeDragRef.current) return;
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  /**
   * Handles the end of dragging a text element
   */
  const handleDragEnd = useCallback(() => {
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
  }, [handleDragMove, handleTouchMove]);

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
            setTextInputs(initializeTextInputs(selectedTemplate));
            return;
          }
        }

        // Default to first template if no template ID is provided or if the template ID is invalid
        if (data.length > 0) {
          setSelectedTemplate(data[0]);
          setTextInputs(initializeTextInputs(data[0]));
        }
      } catch (error) {
        console.error('Failed to load meme templates:', error);
      }
    };

    loadTemplates();
  }, [searchParams]);

  /**
   * Handles template selection change
   * @param e - Change event
   */
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id === templateId) || null;
    setSelectedTemplate(template);

    if (template) {
      setTextInputs(initializeTextInputs(template));
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
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, textId: string) => {
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
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const clickX = clientX - containerRect.left;
    const clickY = clientY - containerRect.top;

    // Calculate the text position in pixels, accounting for scaling
    const textX = textInput.position.x * scaleX;
    const textY = textInput.position.y * scaleY;

    // Create a new drag state object
    const newDragState = {
      isDragging: true,
      textId,
      startX: clientX,
      startY: clientY,
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

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragEnd, handleDragMove, handleTouchMove]);

  /**
   * Generate AI text for the meme based on template information
   * @param newsText - Optional news text to use for generation
   */
  const generateAiText = async (newsText?: string) => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      console.log('selectedTemplate', selectedTemplate);
      // Extract information about the selected template to send to the server
      const templateInfo = {
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        phrases: selectedTemplate.phrases,
        examples: selectedTemplate.examples,
        maxCharacters: selectedTemplate.maxCharacters,
        newsText,
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
   * Generate meme from news text
   * @param newsText - News text to use for generation
   */
  const generateFromNews = async (newsText: string) => {
    await generateAiText(newsText);
  };

  /**
   * Resets text positions to their default values
   */
  const handleResetPositions = () => {
    if (!selectedTemplate) return;
    setTextInputs(resetTextPositions(selectedTemplate, textInputs));
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

  /**
   * Toggles the visibility of advanced options
   */
  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  return (
    <div className="flex justify-center items-center py-6 md:py-12 px-4 md:px-6">
      <Card className="w-full max-w-3xl bg-transparent shadow-lg">
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

            {/* Main action buttons in a row */}
            {selectedTemplate && (
              <div className="flex justify-between items-center w-full gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setNewsModalOpen(true)}
                  disabled={isLoading || !selectedTemplate}
                  className="flex-1 rounded-md border-gray-200 flex items-center justify-center"
                >
                  <span className="flex items-center">
                    {isLoading ? '⏳' : '📰'}
                    <span className="hidden sm:inline ml-1">
                      {isLoading ? 'Generating...' : 'Meme from News'}
                    </span>
                  </span>
                </Button>
                <Button
                  onClick={saveMeme}
                  disabled={!selectedTemplate}
                  className="flex-1 rounded-md bg-black text-white hover:bg-gray-800 flex items-center justify-center"
                >
                  <span className="flex items-center">
                    💾
                    <span className="hidden sm:inline ml-1">Download</span>
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleAdvancedOptions}
                  className="flex-1 rounded-md border-gray-200 flex items-center justify-center"
                >
                  <span className="flex items-center">
                    {showAdvancedOptions ? '🔼' : '🔽'}
                    <span className="hidden sm:inline ml-1">
                      {showAdvancedOptions ? 'Hide Options' : 'Show Options'}
                    </span>
                  </span>
                </Button>
              </div>
            )}

            {/* Text Input Fields - Only shown when advanced options are visible */}
            {selectedTemplate && showAdvancedOptions && (
              <TextInputFields
                textInputs={textInputs}
                selectedTemplate={selectedTemplate}
                updateTextInput={updateTextInput}
              />
            )}

            {/* Sponsor QR Code Section - Only shown when advanced options are visible */}
            {selectedTemplate && showAdvancedOptions && (
              <QRCodeSection
                addSponsorQR={addSponsorQR}
                setAddSponsorQR={setAddSponsorQR}
                sponsorUrl={sponsorUrl}
                setSponsorUrl={setSponsorUrl}
                sponsorLogo={sponsorLogo}
                setSponsorLogo={setSponsorLogo}
                qrCodeStyle={qrCodeStyle}
                setQrCodeStyle={setQrCodeStyle}
                urlError={urlError}
                setUrlError={setUrlError}
                qrCodeStyles={qrCodeStyles}
              />
            )}

            {selectedTemplate && (
              <>
                {/* Reset positions button - Only visible when advanced options are enabled */}
                {showAdvancedOptions && (
                  <div className="mt-4 mb-4">
                    <Button
                      variant="secondary"
                      onClick={handleResetPositions}
                      disabled={!selectedTemplate}
                      className="flex items-center justify-center"
                    >
                      <span className="flex items-center">
                        🔄
                        <span className="hidden sm:inline ml-1">Reset Positions</span>
                      </span>
                    </Button>
                  </div>
                )}

                <MemeCanvas
                  selectedTemplate={selectedTemplate}
                  textInputs={textInputs}
                  dragState={dragState}
                  handleDragStart={handleDragStart}
                  containerRef={containerRef as React.RefObject<HTMLDivElement>}
                  memeRef={memeRef as React.RefObject<HTMLDivElement>}
                  addSponsorQR={addSponsorQR}
                  sponsorUrl={sponsorUrl}
                  sponsorLogo={sponsorLogo}
                  qrCodeStyle={qrCodeStyle}
                  qrCodeStyles={qrCodeStyles}
                  urlError={urlError}
                />
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

      {/* Add the NewsModal component */}
      <NewsModal
        open={newsModalOpen}
        onOpenChange={setNewsModalOpen}
        onGenerate={generateFromNews}
        isLoading={isLoading}
      />
    </div>
  );
}
