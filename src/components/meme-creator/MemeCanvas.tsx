'use client';

import React from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { MemeTemplate, TextInput, DragState, QRCodeStyle } from './types';
import { getEncodedQrUrl } from './utils';

interface MemeCanvasProps {
  selectedTemplate: MemeTemplate | null;
  textInputs: TextInput[];
  dragState: DragState | null;
  // eslint-disable-next-line no-unused-vars
  handleDragStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  memeRef: React.RefObject<HTMLDivElement>;
  sponsorUrl: string;
  addSponsorQR: boolean;
  qrCodeStyle: string;
  sponsorLogo: string;
  qrCodeStyles: QRCodeStyle[];
  urlError: string | null;
}

/**
 * Component for displaying the meme canvas with draggable text
 */
const MemeCanvas: React.FC<MemeCanvasProps> = ({
  selectedTemplate,
  textInputs,
  dragState,
  handleDragStart,
  containerRef,
  memeRef,
  sponsorUrl,
  addSponsorQR,
  qrCodeStyle,
  sponsorLogo,
  qrCodeStyles,
  urlError,
}) => {
  /**
   * Gets the selected QR code style
   * @returns Selected QR code style object
   */
  const getSelectedQRStyle = (): QRCodeStyle => {
    return qrCodeStyles.find((style) => style.id === qrCodeStyle) || qrCodeStyles[0];
  };

  return (
    <div className="mt-2 flex justify-center">
      <div
        ref={containerRef}
        className="relative inline-block"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '70vh',
          aspectRatio: `${selectedTemplate?.width} / ${selectedTemplate?.height}`,
        }}
      >
        <div ref={memeRef} className="relative w-full h-full">
          <Image
            src={selectedTemplate?.path}
            alt={selectedTemplate?.name}
            className="object-contain"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />

          {textInputs.map((input) => {
            const textArea = selectedTemplate?.textAreas.find((area) => area.id === input.id);
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
                role="button"
                tabIndex={0}
                aria-label={`Drag ${input.id} text`}
                style={{
                  left: `${((x - textArea.width / 2) / selectedTemplate?.width) * 100}%`,
                  top: `${((y - textArea.height / 2) / selectedTemplate?.height) * 100}%`,
                  width: `${(textArea.width / selectedTemplate?.width) * 100}%`,
                  height: 'auto',
                  minHeight: `${(textArea.height / selectedTemplate?.height) * 100}%`,
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
                    dragState?.isDragging && dragState.textId === input.id
                      ? '2px dashed #39f'
                      : 'none',
                  borderRadius: '4px',
                  padding: '4px',
                  backgroundColor:
                    dragState?.isDragging && dragState.textId === input.id
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
                    fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
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
                value={getEncodedQrUrl(sponsorUrl)}
                size={100}
                level="H"
                style={{ width: '100%', height: '100%' }}
                imageSettings={{
                  src: sponsorLogo,
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
                bgColor={getSelectedQRStyle().bgColor}
                fgColor={getSelectedQRStyle().fgColor}
                className="rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemeCanvas;
