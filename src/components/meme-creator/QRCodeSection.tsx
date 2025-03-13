'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { QRCodeStyle } from './types';
import { validateUrl, getEncodedQrUrl } from './utils';

interface QRCodeSectionProps {
  addSponsorQR: boolean;
  setAddSponsorQR: React.Dispatch<React.SetStateAction<boolean>>;
  sponsorUrl: string;
  setSponsorUrl: React.Dispatch<React.SetStateAction<string>>;
  sponsorLogo: string;
  setSponsorLogo: React.Dispatch<React.SetStateAction<string>>;
  qrCodeStyle: string;
  setQrCodeStyle: React.Dispatch<React.SetStateAction<string>>;
  urlError: string | null;
  setUrlError: React.Dispatch<React.SetStateAction<string | null>>;
  qrCodeStyles: QRCodeStyle[];
}

/**
 * QR Code configuration section component for the Meme Creator
 */
const QRCodeSection: React.FC<QRCodeSectionProps> = ({
  addSponsorQR,
  setAddSponsorQR,
  sponsorUrl,
  setSponsorUrl,
  sponsorLogo,
  setSponsorLogo,
  qrCodeStyle,
  setQrCodeStyle,
  urlError,
  setUrlError,
  qrCodeStyles,
}) => {
  // Track dropdown selection separately from the actual logo
  const [logoSelection, setLogoSelection] = useState<string>(
    sponsorLogo?.startsWith('data:') ? 'custom' : sponsorLogo
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
   * Gets the selected QR code style
   * @returns Selected QR code style object
   */
  const getSelectedQRStyle = (): QRCodeStyle => {
    return qrCodeStyles.find((style) => style.id === qrCodeStyle) || qrCodeStyles[0];
  };

  /**
   * Handles the sponsor logo selection change
   * @param e - Change event
   */
  const handleSponsorLogoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLogoSelection(value);

    // If it's not the custom option, directly update the logo
    if (value !== 'custom') {
      setSponsorLogo(value);
    }
    // Otherwise, we'll keep the existing custom logo until a new one is uploaded
  };

  /**
   * Converts a file to a data URL
   * @param file - The file to convert
   * @returns A promise that resolves with the data URL
   */
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handles file upload for custom logo
   * @param e - Change event
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    try {
      setIsLoading(true);
      // Convert file to data URL for reliable storage and rendering
      const dataUrl = await fileToDataUrl(file);
      setSponsorLogo(dataUrl);
      // Ensure logo selection remains as 'custom'
      setLogoSelection('custom');
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process the image. Please try another one.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Triggers file input click
   */
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
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
            <Select id="sponsorLogo" value={logoSelection} onChange={handleSponsorLogoChange}>
              <option value="/sponsors/aptos.png">Aptos</option>
              <option value="custom">Upload my logo</option>
              {/* Add more logo options here as needed */}
            </Select>
            {logoSelection === 'custom' && (
              <div className="mt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={triggerFileUpload}
                  variant="outline"
                  className="w-full"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Choose Logo File'}
                </Button>
                {sponsorLogo?.startsWith('data:') && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    Custom logo uploaded successfully
                  </div>
                )}
              </div>
            )}
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
                  value={getEncodedQrUrl(sponsorUrl)}
                  size={120}
                  level="H"
                  style={{ width: '100%', height: '100%' }}
                  imageSettings={{
                    src: sponsorLogo,
                    x: undefined,
                    y: undefined,
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                  bgColor={getSelectedQRStyle().bgColor}
                  fgColor={getSelectedQRStyle().fgColor}
                  className="rounded-md"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRCodeSection;
