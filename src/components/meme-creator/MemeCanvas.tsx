'use client';

import React, { useState, useEffect } from 'react';
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
  qrCodePosition: { x: number; y: number };
  saveMeme: () => Promise<void>;
  aptosAddress: string;
  addTipQR: boolean;
  addressError: string | null;
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
  qrCodePosition,
  saveMeme,
  aptosAddress,
  addTipQR,
  addressError,
}) => {
  // Track mobile status
  const [isMobile, setIsMobile] = useState(false);

  // Detect window size changes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check on mount
    checkMobile();

    // Set up event listener
    window.addEventListener('resize', checkMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Gets the selected QR code style
   * @returns Selected QR code style object
   */
  const getSelectedQRStyle = (): QRCodeStyle => {
    return qrCodeStyles.find((style) => style.id === qrCodeStyle) || qrCodeStyles[0];
  };

  /**
   * Gets the appropriate QR code value based on type
   * @returns URL for QR code
   */
  const getQrValue = () => {
    if (addSponsorQR) {
      return sponsorUrl ? getEncodedQrUrl(sponsorUrl) : '';
    } else if (addTipQR) {
      return aptosAddress || '';
    }
    return '';
  };

  /**
   * Formats Aptos address for display
   * @param address - Full Aptos address
   * @returns Shortened address with ellipsis
   */
  const formatAptosAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Calculate QR size based on device
  const qrCodeWidth = isMobile ? '17%' : '18%';
  const qrCodeMinWidth = isMobile ? '60px' : '80px';

  return (
    <div className="mt-2 flex justify-center flex-col items-center">
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
            src={selectedTemplate?.path || '/default-placeholder.jpg'}
            alt={selectedTemplate?.name || 'Meme Template'}
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
                  left: `${((x - textArea.width / 2) / (selectedTemplate?.width || 1)) * 100}%`,
                  top: `${((y - textArea.height / 2) / (selectedTemplate?.height || 1)) * 100}%`,
                  width: `${(textArea.width / (selectedTemplate?.width || 1)) * 100}%`,
                  height: 'auto',
                  minHeight: `${(textArea.height / (selectedTemplate?.height || 1)) * 100}%`,
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
          {((addSponsorQR && sponsorUrl && !urlError) ||
            (addTipQR && aptosAddress && !addressError)) && (
            <div
              className="absolute p-1 shadow-md cursor-move flex flex-col items-center"
              onMouseDown={(e) => handleDragStart(e, 'qrcode')}
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
                handleDragStart(mouseEvent, 'qrcode');
              }}
              role="button"
              tabIndex={0}
              aria-label="Drag QR code"
              style={{
                width: qrCodeWidth,
                height: 'auto',
                minWidth: qrCodeMinWidth,
                left: `${(qrCodePosition.x / (selectedTemplate?.width || 1)) * 100}%`,
                top: `${(qrCodePosition.y / (selectedTemplate?.height || 1)) * 100}%`,
                transform: 'translate(-50%, -50%)',
                touchAction: 'none',
                transition: 'none',
                border:
                  dragState?.isDragging && dragState.textId === 'qrcode'
                    ? '2px dashed #39f'
                    : 'none',
                backgroundColor:
                  dragState?.isDragging && dragState.textId === 'qrcode'
                    ? 'rgba(51, 153, 255, 0.1)'
                    : 'transparent',
                zIndex: 10, // Ensure QR is above other elements
              }}
            >
              <div
                className="rounded-md w-full shadow-md"
                style={{
                  backgroundColor: getSelectedQRStyle().bgColor,
                  padding: isMobile ? '0' : '10px',
                  aspectRatio: '1 / 1',
                  border: isMobile ? '1px solid white' : '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                <QRCodeSVG
                  value={getQrValue()}
                  size={100}
                  level="M"
                  style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                  imageSettings={
                    addSponsorQR
                      ? {
                          src: sponsorLogo,
                          x: undefined,
                          y: undefined,
                          height: isMobile ? 18 : 40,
                          width: isMobile ? 18 : 40,
                          excavate: true,
                        }
                      : undefined
                  }
                  bgColor={getSelectedQRStyle().bgColor}
                  fgColor={getSelectedQRStyle().fgColor}
                  className="rounded-md"
                />
              </div>

              {/* Display Aptos address text for Tip QR below the QR code */}
              {addTipQR && aptosAddress && (
                <div
                  className="text-center bg-black text-white py-0.5 px-1 rounded-md w-full font-medium shadow-md"
                  style={{
                    fontSize: isMobile ? '0.45rem' : 'clamp(0.6rem, 2vw, 0.8rem)',
                    letterSpacing: isMobile ? '0' : '0.02em',
                    border: '1px solid rgba(255,255,255,0.2)',
                    marginTop: isMobile ? '1px' : '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Tip {formatAptosAddress(aptosAddress)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Download button at the bottom of the meme */}
      <button
        onClick={saveMeme}
        className="mt-4 py-2 px-6 bg-black text-white rounded-md hover:bg-gray-800 flex items-center justify-center shadow-md transition-colors"
        aria-label="Download meme"
      >
        <span className="mr-2">💾</span>
        <span>Download</span>
      </button>
    </div>
  );
};

export default MemeCanvas;
