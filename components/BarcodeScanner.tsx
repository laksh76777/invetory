import React, { useEffect, useRef, useState } from 'react';
import Modal from './ui/Modal';
import { useTranslation } from '../hooks/useTranslation';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

// Type assertion for the experimental BarcodeDetector API
declare global {
    interface Window {
        BarcodeDetector: any;
    }
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isScanning = useRef(true);

  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setError(t('pos.scanner.not_supported'));
      return;
    }

    const BarcodeDetector = window.BarcodeDetector;
    const barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'qr_code', 'code_128', 'upc_a'] });
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          detectBarcode();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError(t('pos.scanner.camera_error'));
      }
    };

    const detectBarcode = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0 && isScanning.current) {
            isScanning.current = false; // Prevent multiple scans
            onScan(barcodes[0].rawValue);
            return; // Stop scanning once found
          }
        } catch (err) {
          console.error("Barcode detection error:", err);
          // Don't set error state here to allow retries
        }
      }
      if (isScanning.current) {
          animationFrameId = requestAnimationFrame(detectBarcode);
      }
    };

    startScan();

    return () => {
      isScanning.current = false;
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, t]);

  return (
    <Modal isOpen={true} onClose={onClose} title={t('pos.scanner.title')}>
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-sm h-32 border-4 border-dashed border-white/50 rounded-lg"></div>
        </div>
      </div>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {!error && <p className="text-gray-500 dark:text-gray-400 text-center mt-4">{t('pos.scanner.instruction')}</p>}
    </Modal>
  );
};

export default BarcodeScanner;