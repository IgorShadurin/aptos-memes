/**
 * Types for the Meme Creator components
 */

/**
 * Interface for text area in a meme template
 */
export interface TextArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align: 'left' | 'center' | 'right';
  defaultText: string;
}

/**
 * Interface for meme template structure
 */
export interface MemeTemplate {
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
  examples: string[];
  maxCharacters: number;
}

/**
 * Interface for text input in a meme
 */
export interface TextInput {
  id: string;
  text: string;
  position?: { x: number; y: number };
}

/**
 * Interface for drag state during text positioning
 */
export interface DragState {
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
export interface QRCodeStyle {
  id: string;
  name: string;
  bgColor: string;
  fgColor: string;
}
