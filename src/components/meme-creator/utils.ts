import { MemeTemplate, TextInput } from './types';

/**
 * Initializes text inputs based on the selected template
 * @param template - The selected template
 * @returns Array of initialized text inputs
 */
export const initializeTextInputs = (template: MemeTemplate | null): TextInput[] => {
  if (!template) return [];

  return template.textAreas.map((area) => ({
    id: area.id,
    text: area.defaultText || '',
    position: { x: area.x, y: area.y },
  }));
};

/**
 * Validates the sponsor URL
 * @param url - URL to validate
 * @returns Boolean indicating if the URL is valid
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Encodes a string to Base64
 * @param str - String to encode
 * @returns Base64 encoded string
 */
export const encodeToBase64 = (str: string): string => {
  return btoa(str);
};

/**
 * Gets the encoded URL for the QR code
 * @param sponsorUrl - Sponsor URL to encode
 * @returns Encoded URL for the QR code
 */
export const getEncodedQrUrl = (sponsorUrl: string): string => {
  if (!sponsorUrl) return '';

  const encodedUrl = encodeToBase64(sponsorUrl);
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/sponsored-meme?url=${encodedUrl}`;
};

/**
 * Resets text positions to their default values
 * @param selectedTemplate - The selected template
 * @param textInputs - Current text inputs
 * @returns Updated text inputs with reset positions
 */
export const resetTextPositions = (
  selectedTemplate: MemeTemplate | null,
  textInputs: TextInput[]
): TextInput[] => {
  if (!selectedTemplate) return textInputs;

  return textInputs.map((input) => {
    const textArea = selectedTemplate.textAreas.find((area) => area.id === input.id);
    if (!textArea) return input;

    return {
      ...input,
      position: { x: textArea.x, y: textArea.y },
    };
  });
};
